# 🛍️ Prisma Commerce Frontend - Integración con API de Producción

Este proyecto es un frontend Next.js completamente integrado con la API Prisma Commerce para la gestión de tiendas, productos, clientes y ventas.

## 🚀 Configuración Inicial

### 1. Información de la API

- **Base URL:** `https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api`
- **Documentación:** `https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/docs`
- **Autenticación:** JWT Bearer Token
- **CORS:** Habilitado para todos los orígenes
- **Timeout:** 10 segundos

### 2. Instalación de Dependencias

```bash
npm install
# o
pnpm install
```

### 3. Ejecutar el Proyecto

```bash
npm run dev
# o
pnpm dev
```

El frontend estará disponible en `http://localhost:4200`.

## 🔐 Autenticación

### Registro de Usuarios

Los usuarios deben registrarse desde cero. No hay credenciales preconfiguradas para producción.

Los usuarios pueden registrarse con los siguientes roles:

- `ADMIN`: Acceso completo al sistema
- `EMPLOYEE`: Acceso limitado a funciones básicas

## 📋 Funcionalidades Implementadas

### ✅ Autenticación

- [x] Login con JWT
- [x] Registro de usuarios
- [x] Protección de rutas
- [x] Manejo de roles (ADMIN/EMPLOYEE)
- [x] Logout automático en caso de token expirado

### ✅ Gestión de Productos

- [x] Listar productos
- [x] Crear productos
- [x] Editar productos
- [x] Eliminar productos
- [x] Control de stock
- [x] Alertas de stock bajo

### ✅ Gestión de Clientes

- [x] Listar clientes
- [x] Crear clientes
- [x] Editar clientes
- [x] Eliminar clientes
- [x] Búsqueda de clientes

### ✅ Gestión de Ventas

- [x] Crear nuevas ventas
- [x] Carrito de compras
- [x] Múltiples métodos de pago
- [x] Ventas a crédito
- [x] Generación de facturas
- [x] Historial de ventas

### ✅ Gestión de Tiendas

- [x] Listar tiendas
- [x] Crear tiendas (solo ADMIN)
- [x] Editar tiendas
- [x] Eliminar tiendas

## 🛠️ Arquitectura del Proyecto

### Estructura de Carpetas

```
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   └── dashboard/         # Panel principal
├── components/            # Componentes React
│   ├── auth/              # Componentes de autenticación
│   ├── clients/           # Gestión de clientes
│   ├── products/          # Gestión de productos
│   ├── sales/             # Gestión de ventas
│   └── ui/                # Componentes UI base
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
│   ├── api.ts             # Configuración de Axios
│   ├── auth-context.tsx   # Contexto de autenticación
│   ├── config.ts          # Configuración general
│   └── services.ts        # Servicios de API
└── styles/                # Estilos globales
```

### Servicios de API

El proyecto utiliza servicios organizados por módulos:

- **authService**: Autenticación y gestión de usuarios
- **storeService**: Gestión de tiendas
- **productService**: Gestión de productos
- **clientService**: Gestión de clientes
- **saleService**: Gestión de ventas

### Hooks Personalizados

- **useAuth**: Manejo de autenticación
- **useProducts**: Gestión de productos
- **useClients**: Gestión de clientes
- **useSales**: Gestión de ventas
- **useStores**: Gestión de tiendas

## 🔧 Configuración de la API

### Base URL

Por defecto, la aplicación se conecta a `http://localhost:3000/api`. Para cambiar esto, modifica la variable `NEXT_PUBLIC_API_BASE_URL` en tu archivo `.env.local`.

### Interceptores de Axios

El proyecto incluye interceptores automáticos para:

- Agregar el token JWT a todas las peticiones
- Manejar errores 401 (token expirado)
- Redirigir automáticamente al login cuando sea necesario

## 🎨 UI/UX

### Componentes Base

El proyecto utiliza shadcn/ui como sistema de componentes base, proporcionando:

- Componentes accesibles
- Temas personalizables
- Diseño responsive
- Iconos de Lucide React

### Temas

- Modo claro/oscuro
- Colores personalizables
- Tipografía consistente

## 🚨 Manejo de Errores

### Errores de API

- **401**: Token expirado - Redirige al login
- **403**: Sin permisos - Muestra mensaje de error
- **404**: Recurso no encontrado
- **500**: Error del servidor

### Estados de Carga

- Spinners durante operaciones asíncronas
- Estados de error con mensajes descriptivos
- Validación de formularios en tiempo real

## 📱 Responsive Design

El frontend está optimizado para:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Seguridad

### Autenticación JWT

- Tokens almacenados en localStorage
- Renovación automática de tokens
- Logout automático en caso de token inválido

### Protección de Rutas

- Rutas protegidas por autenticación
- Protección por roles (ADMIN/EMPLOYEE)
- Redirección automática según permisos

## 🧪 Testing

Para ejecutar las pruebas:

```bash
npm run test
# o
pnpm test
```

## 📦 Build y Deploy

### Build de Producción

```bash
npm run build
# o
pnpm build
```

### Deploy

El proyecto está listo para deploy en:

- Vercel (recomendado para Next.js)
- Netlify
- AWS Amplify
- Cualquier plataforma que soporte Next.js

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de la API en `http://localhost:3000/api/docs`
2. Verifica que la API esté ejecutándose
3. Comprueba las variables de entorno
4. Revisa la consola del navegador para errores

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
npm update
# o
pnpm update
```

---

**¡Disfruta usando Prisma Commerce! 🎉**
