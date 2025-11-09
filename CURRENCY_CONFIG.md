# 💰 Configuración de Moneda y Impuestos - Prisma Commerce

## 📋 Resumen de Cambios

Se ha implementado una configuración completa de moneda por defecto para productos y tiendas, con las siguientes características:

### ✅ Configuración Por Defecto

- **Moneda**: Peso Colombiano (COP)
- **Tasa de Impuesto**: 0% (sin impuestos)
- **Símbolo**: $ (peso colombiano)
- **Formato**: es-CO (formato colombiano)

## 🔧 Archivos Modificados

### 1. `lib/config.ts`

- ✅ Agregada configuración por defecto de moneda e impuestos
- ✅ Funciones de utilidad para formateo de moneda
- ✅ Soporte para múltiples monedas (COP, USD, EUR, MXN)

### 2. `lib/services.ts`

- ✅ Interfaces `Store` y `StoreData` actualizadas con campos `currency` y `taxRate`
- ✅ Servicio `createStore` ahora envía configuración de moneda al backend
- ✅ Valores por defecto aplicados automáticamente

### 3. `components/auth/register-form.tsx`

- ✅ Formulario de registro actualizado con campos de configuración financiera
- ✅ Selector de moneda con opciones predefinidas
- ✅ Campo de tasa de impuesto con validación

### 4. `lib/store.ts`

- ✅ Mock data actualizado con precios en pesos colombianos
- ✅ Cálculos de impuestos ajustados (0% por defecto)
- ✅ Montos de ventas y deudas actualizados

### 5. `app/dashboard/settings/page.tsx`

- ✅ Página de configuración usa valores por defecto correctos
- ✅ Importación de configuración actualizada

### 6. `components/ui/currency-display.tsx` (NUEVO)

- ✅ Componente `CurrencyDisplay` para mostrar precios formateados
- ✅ Componente `CurrencyInput` para entrada de montos con símbolo de moneda

## 🚀 Cómo Usar

### Formateo de Moneda

```tsx
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { currency } from "@/lib/config";

// Mostrar precio formateado
<CurrencyDisplay amount={3500} currency="COP" />;
// Resultado: $3.500

// Usar función directa
const formattedPrice = currency.format(3500, "COP");
// Resultado: "$3.500"
```

### Entrada de Montos

```tsx
import { CurrencyInput } from "@/components/ui/currency-display";

<CurrencyInput
  value={price}
  onChange={setPrice}
  currency="COP"
  placeholder="0"
/>;
```

### Configuración de Tienda

```tsx
import { config } from "@/lib/config";

// Usar valores por defecto
const defaultCurrency = config.DEFAULT_CURRENCY; // "COP"
const defaultTaxRate = config.DEFAULT_TAX_RATE; // 0
```

## 📊 Precios Actualizados (Mock Data)

| Producto          | Precio Anterior | Precio Actual (COP) |
| ----------------- | --------------- | ------------------- |
| Coca Cola 600ml   | $15 USD         | $3.500 COP          |
| Sabritas Original | $18 USD         | $2.800 COP          |
| Leche Lala 1L     | $25 USD         | $4.200 COP          |
| Detergente Roma   | $45 USD         | $8.500 COP          |

## 🔄 Backend Integration

El backend ahora recibe los siguientes campos adicionales al crear tiendas:

```json
{
  "name": "Mi Tienda",
  "description": "Descripción de la tienda",
  "address": "Calle 123, Ciudad",
  "phone": "+57 300 123 4567",
  "email": "tienda@email.com",
  "currency": "COP",
  "taxRate": 0
}
```

## 🎯 Próximos Pasos

1. **Backend**: Actualizar el modelo de tienda para incluir campos `currency` y `taxRate`
2. **Base de Datos**: Agregar columnas correspondientes en la tabla de tiendas
3. **API**: Actualizar endpoints para manejar la nueva configuración
4. **Validación**: Implementar validación de monedas soportadas en el backend

## 📝 Notas Importantes

- Los valores por defecto se aplican automáticamente si no se especifican
- El formato de moneda se ajusta según la configuración regional
- Los cálculos de impuestos se manejan como decimales (0.16 = 16%)
- El sistema es compatible con múltiples monedas simultáneamente
