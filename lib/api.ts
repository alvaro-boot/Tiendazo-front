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

    // NO CERRAR SESIÓN AUTOMÁTICAMENTE - Solo reintentar con refresh si es posible
    // Los componentes individuales manejarán los errores de autenticación
    if (error.response?.status === 401 && !originalRequest._retry) {
      // NO cerrar sesión automáticamente para login/register
      if (originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/register")) {
        return Promise.reject(error);
      }

      // Para /auth/profile y /auth/refresh, NO hacer nada automático
      // Dejar que el componente maneje el error
      if (originalRequest.url?.includes("/auth/profile") ||
          originalRequest.url?.includes("/auth/refresh")) {
        console.log("⚠️ Error 401 en endpoint de auth, dejando que el componente maneje el error");
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

        // Guardar nuevo token (30 días)
        storage.set(config.TOKEN_KEY, access_token);
        document.cookie = `access_token=${access_token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=strict`;

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Procesar cola de peticiones fallidas
        processQueue(null, access_token);

        isRefreshing = false;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError: any) {
        // NO CERRAR SESIÓN AUTOMÁTICAMENTE - Solo rechazar el error
        // Los componentes individuales manejarán los errores
        console.log("❌ Error renovando sesión (sin cerrar sesión automáticamente):", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // NO hacer nada automático - dejar que el componente maneje el error
        console.log("⚠️ Error de refresh, rechazando request. El componente manejará el error.");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
