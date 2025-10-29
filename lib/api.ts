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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("🚨 Error en API:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.log("🔐 Error 401 - Token inválido, cerrando sesión");
      storage.remove(config.TOKEN_KEY);
      storage.remove(config.USER_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
