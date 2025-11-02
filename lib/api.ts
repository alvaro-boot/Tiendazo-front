import axios from "axios";
import { config, storage } from "./config";

// Crear instancia de axios
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = storage.get(config.TOKEN_KEY);
    console.log("📤 Enviando request a:", config.url, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No hay token disponible para la request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación y renovación automática
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("🚨 Error en API:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Si es un error 401 y no es un intento de refresh ni login
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh") || 
          originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/register")) {
        // Si el refresh falla después de varios intentos, cerrar sesión y redirigir
        console.log("🔐 Refresh/Login falló, verificando si debemos cerrar sesión...");
        
        // Solo cerrar sesión si estamos intentando refresh explícitamente
        if (originalRequest.url?.includes("/auth/refresh")) {
          console.log("🔐 Refresh falló definitivamente, cerrando sesión...");
          storage.remove(config.TOKEN_KEY);
          storage.remove(config.USER_KEY);
          document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          if (typeof window !== "undefined") {
            window.location.href = "/login?reason=session_expired";
          }
        }
        
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = storage.get(config.TOKEN_KEY);
        if (!token) {
          throw new Error("No token available");
        }

        // Intentar renovar la sesión usando la instancia de api para evitar loops
        console.log("🔄 Intentando renovar sesión...");
        const axiosInstance = axios.create({
          baseURL: config.API_BASE_URL,
          timeout: 10000,
        });
        const refreshResponse = await axiosInstance.post(
          `/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { access_token } = refreshResponse.data;

        // Guardar nuevo token
        storage.set(config.TOKEN_KEY, access_token);
        document.cookie = `access_token=${access_token}; path=/; max-age=604800; secure; samesite=strict`;

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Procesar cola de peticiones fallidas
        processQueue(null, access_token);

        isRefreshing = false;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError: any) {
        // Si falla el refresh, verificar el tipo de error
        console.log("❌ Error renovando sesión:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Solo cerrar sesión si el error es realmente de autenticación
        // (no por problemas de red u otros errores)
        const isAuthError = refreshError.response?.status === 401 || 
                           refreshError.response?.status === 403 ||
                           refreshError.message?.includes("Unauthorized") ||
                           refreshError.message?.includes("token") ||
                           refreshError.message?.includes("expired") ||
                           refreshError.response?.data?.message?.includes("token") ||
                           refreshError.response?.data?.message?.includes("expired");

        if (isAuthError) {
          console.log("🔐 Error de autenticación definitivo, cerrando sesión...");
          storage.remove(config.TOKEN_KEY);
          storage.remove(config.USER_KEY);
          document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          if (typeof window !== "undefined") {
            window.location.href = "/login?reason=session_expired";
          }
        } else {
          console.log("⚠️ Error de red o temporal, no cerrando sesión. El usuario puede reintentar.");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
