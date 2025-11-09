// Configuración de la aplicación
export const config = {
  // URLs de la API
  // Prioridad: Variable de entorno > Valor por defecto (local)
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api",
  API_DOCS_URL:
    process.env.NEXT_PUBLIC_API_DOCS_URL ||
    "https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/docs",

  // Configuración de la aplicación
  APP_NAME: "Prisma Commerce",
  APP_VERSION: "1.0.0",

  // Configuración de autenticación
  TOKEN_KEY: "access_token",
  USER_KEY: "user",

  // Configuración de desarrollo
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // Configuración por defecto de moneda
  DEFAULT_CURRENCY: "COP", // Peso colombiano
  CURRENCY_SYMBOL: "$", // Símbolo del peso colombiano
  CURRENCY_FORMAT: "es-CO", // Formato colombiano
};

// Funciones de utilidad para localStorage
export const storage = {
  get: (key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },

  set: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },

  remove: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  },
};

// Funciones de utilidad para formateo de moneda
export const currency = {
  format: (
    amount: number,
    currency: string = config.DEFAULT_CURRENCY
  ): string => {
    try {
      return new Intl.NumberFormat(config.CURRENCY_FORMAT, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback si hay error con el formato
      return `${config.CURRENCY_SYMBOL}${amount.toLocaleString()}`;
    }
  },

  parse: (formattedAmount: string): number => {
    // Remover símbolos de moneda y espacios
    const cleanAmount = formattedAmount.replace(/[^\d.,]/g, "");
    // Convertir a número (manejar tanto punto como coma decimal)
    return parseFloat(cleanAmount.replace(",", ".")) || 0;
  },

  getSymbol: (currency: string = config.DEFAULT_CURRENCY): string => {
    const symbols: Record<string, string> = {
      COP: "$",
      USD: "$",
      EUR: "€",
      MXN: "$",
    };
    return symbols[currency] || config.CURRENCY_SYMBOL;
  },
};
