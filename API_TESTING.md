# 🧪 Comandos cURL para Testing de la API Tiendazo

## 🔐 Autenticación

### Registrar usuario

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@tiendazo.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### Login

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Obtener perfil (reemplazar TOKEN)

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/auth/profile \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 🏪 Tiendas

### Crear tienda

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/stores \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Tienda",
    "description": "Descripción de la tienda",
    "address": "Calle 123, Ciudad",
    "phone": "+1234567890",
    "email": "tienda@example.com"
  }'
```

### Listar tiendas

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/stores \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 📦 Productos

### Crear producto

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/products \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Ejemplo",
    "description": "Descripción del producto",
    "purchasePrice": 10.50,
    "sellPrice": 15.00,
    "stock": 100,
    "minStock": 10,
    "barcode": "123456789",
    "categoryId": 1,
    "storeId": 1
  }'
```

### Listar productos

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/products \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### Buscar productos

```bash
curl -X GET "https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/products/search?q=ejemplo" \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 👥 Clientes

### Crear cliente

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/clients \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "address": "Calle 456, Ciudad"
  }'
```

### Listar clientes

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/clients \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 🛒 Ventas

### Crear venta

```bash
curl -X POST https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/sales \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "FAC-001",
    "total": 150.00,
    "isCredit": false,
    "notes": "Venta al contado",
    "storeId": 1,
    "clientId": 1,
    "details": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 15.00,
        "subtotal": 30.00
      }
    ]
  }'
```

### Listar ventas

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/sales \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### Obtener reporte de ventas

```bash
curl -X GET "https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/sales/report?start=2024-01-01&end=2024-12-31" \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 🏥 Health Check

### Verificar estado de la API

```bash
curl -X GET https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/health
```

## 📝 Notas Importantes

1. **Reemplazar TOKEN_AQUI**: Usa el token JWT obtenido del login
2. **IDs**: Los IDs de productos, clientes, etc. deben existir en la base de datos
3. **Roles**: Solo usuarios ADMIN pueden crear/editar tiendas
4. **CORS**: La API está configurada para aceptar peticiones desde cualquier origen
5. **Timeout**: Las peticiones tienen un timeout de 10 segundos

## 🔧 Testing con Postman

1. Importa la colección de Postman si está disponible
2. Configura la variable `baseUrl` con la URL de la API
3. Configura la variable `token` con el JWT obtenido del login
4. Ejecuta las peticiones en orden: register → login → otras operaciones

## 📊 Swagger UI

Visita `https://https-github-com-alvaro-boot-tiendazo-api.onrender.com/api/docs` para:

- Ver la documentación completa de la API
- Probar endpoints interactivamente
- Ver ejemplos de request/response
- Descargar la especificación OpenAPI
