# Fiadito — Documentación del proyecto

> Cuaderno de fiados digital para dueños de tiendas de barrio y pequeños
> negocios en Latinoamérica.

**Última actualización:** 2026-10-06
**Estado:** ✅ MVP completo — Bloque F finalizado
**Próximo paso sugerido:** Despliegue a producción (Vercel/Netlify)

---

## 📋 Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
2. [Stack técnico](#2-stack-técnico)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Modelo de datos](#4-modelo-de-datos)
5. [Configuración de Supabase](#5-configuración-de-supabase)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Estado actual de desarrollo](#7-estado-actual-de-desarrollo)
8. [Cómo ejecutar el proyecto](#8-cómo-ejecutar-el-proyecto)
9. [Cómo probar en celular (PWA)](#9-cómo-probar-en-celular-pwa)
10. [Flujos funcionales](#10-flujos-funcionales)
11. [Errores resueltos y soluciones](#11-errores-resueltos-y-soluciones)
12. [Roadmap completado](#12-roadmap-completado)
13. [Próximos pasos opcionales](#13-próximos-pasos-opcionales)
14. [Notas técnicas y decisiones](#14-notas-técnicas-y-decisiones)

---

## 1. Descripción del proyecto

**Fiadito** permite al dueño de una tienda:

- Registrar en segundos **quién le debe**, **cuánto** y **desde cuándo**.
- Registrar **abonos** parciales.
- Enviar **recordatorios de cobro por WhatsApp** con un toque.
- Ver el **total por cobrar** y detectar **deudas vencidas**.
- Llevar el control de **límite de crédito** por cliente.

**Público objetivo:** dueños de tiendas de barrio, no técnicos.
**Principios de diseño:** mobile-first (375px), botones grandes, textos claros
en español, mínima cantidad de pasos, verde para dinero/confianza, rojo solo
para deudas y alertas.

---

## 2. Stack técnico

| Componente | Tecnología | Versión instalada |
|---|---|---|
| Framework | React | 19.3.0 |
| Bundler | Vite | 8.3.3 |
| Estilos | Tailwind CSS | 3.4.19 |
| Backend / Auth / DB | Supabase JS | 2.117.2 |
| Router | React Router | 7.18.4 |
| Iconos | Lucide React | 1.52.0 |
| PostCSS | autoprefixer | 10.6.1 |
| Linter | oxlint | 1.81.0 |

**PWA:** instalable en Android (Chrome) e iOS (Safari).

---

## 3. Estructura del proyecto

```
fiadito/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── icon-192.png            ✅ Icono PWA Android
│   ├── icon-512.png            ✅ Icono PWA Android
│   ├── maskable-512.png        ✅ Icono adaptable Android
│   ├── apple-touch-icon.png    ✅ Icono iPhone/iPad
│   ├── favicon.ico             ✅ Favicon navegador
│   └── manifest.json           ✅ PWA manifest
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx       ✅ Navegación inferior
│   │   ├── ClienteCard.jsx     ✅ Tarjeta de cliente
│   │   ├── FiadoAbonoSheet.jsx ✅ Bottom sheet de fiado/abono
│   │   ├── NumericKeypad.jsx   ✅ Teclado numérico
│   │   └── WhatsAppPreview.jsx ✅ Vista previa de WhatsApp
│   ├── contexts/
│   │   └── AuthContext.jsx     ✅ Auth + negocio global
│   ├── hooks/
│   │   ├── useClientes.js      ✅ Clientes con saldo calculado
│   │   └── useMovimientos.js   ✅ Movimientos por cliente
│   ├── lib/
│   │   ├── supabase.js         ✅ Cliente de Supabase
│   │   ├── format.js           ✅ Formato de montos, fechas
│   │   └── whatsapp.js         ✅ Utilidades WhatsApp
│   ├── pages/
│   │   ├── Login.jsx           ✅
│   │   ├── Registro.jsx        ✅
│   │   ├── Inicio.jsx          ✅ Dashboard
│   │   ├── Clientes.jsx        ✅ Lista con filtros
│   │   ├── NuevoCliente.jsx    ✅ Formulario
│   │   ├── ClienteDetalle.jsx  ✅ Detalle + fiados/abonos
│   │   ├── Ajustes.jsx         ✅ Configuración del negocio
│   │   └── Upgrade.jsx         ✅ Pantalla Plan Pro
│   ├── App.jsx                 ✅ Router principal
│   ├── index.css               ✅ Tailwind + utilidades
│   └── main.jsx                ✅ Entry point
├── .env.local                  ✅ (no se sube a Git)
├── .gitignore
├── index.html                  ✅ Meta tags PWA completos
├── package.json
├── postcss.config.js
├── tailwind.config.js          ✅ Paleta personalizada
├── vite.config.js
└── PROYECTO.md                 ← este archivo
```

---

## 4. Modelo de datos

### Tabla `negocios`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK a `auth.users`, único |
| `nombre` | text | Nombre del negocio |
| `telefono` | text | WhatsApp del negocio |
| `moneda` | text | Default `'USD'` |
| `simbolo` | text | Default `'$'` |
| `prefijo_pais` | text | Default `'593'` |
| `plantilla_mensaje` | text | Plantilla WhatsApp con variables |
| `plan` | text | `'gratis'` o `'pro'` (default gratis) |
| `created_at` | timestamptz | |

### Tabla `clientes`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `negocio_id` | uuid | FK a `negocios` |
| `nombre` | text | Obligatorio |
| `telefono` | text | Opcional |
| `nota` | text | Opcional |
| `limite_credito` | numeric(12,2) | Opcional |
| `created_at` | timestamptz | |

### Tabla `movimientos`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `cliente_id` | uuid | FK a `clientes` |
| `negocio_id` | uuid | FK a `negocios` |
| `tipo` | text | `'fiado'` o `'abono'` |
| `monto` | numeric(12,2) | Positivo, > 0 |
| `descripcion` | text | Opcional |
| `fecha` | date | Default `current_date` |
| `fecha_vencimiento` | date | Solo para fiados, opcional |
| `created_at` | timestamptz | |

### Reglas de negocio

- **Saldo del cliente** = `SUM(fiados) - SUM(abonos)`
- **Deuda vencida:** fiado con `fecha_vencimiento < hoy` y saldo > 0
- **Límite de crédito:** si `saldo > limite_credito` → mostrar alerta roja
- **Total por cobrar:** suma de saldos positivos de todos los clientes
- **Cobrado este mes:** suma de abonos con `fecha >= inicio del mes actual`

### Vista auxiliar

- `saldos_clientes`: devuelve `cliente_id`, `negocio_id`, `nombre`, `saldo`,
  `ultima_fecha`.

### Row Level Security (RLS)

**Todas las tablas tienen RLS habilitado.** Cada usuario solo puede ver/editar
los datos vinculados a su propio `user_id`.

Políticas aplicadas:
- `negocios`: select/insert/update solo si `auth.uid() = user_id`
- `clientes`: select/insert/update/delete solo si pertenecen a un negocio del usuario
- `movimientos`: select/insert/update/delete solo si pertenecen a un negocio del usuario

---

## 5. Configuración de Supabase

### Datos del proyecto

- **Project ref:** `wfrrjbnnjolzprrxiuju`
- **Project URL:** `https://wfrrjbnnjolzprrxiuju.supabase.co`
- **REST endpoint** (NO usar en el cliente):
  `https://wfrrjbnnjolzprrxiuju.supabase.co/rest/v1/`

### Configuración de Auth

| Opción | Estado |
|---|---|
| Enable Email provider | ✅ ON |
| Allow new users to sign up | ✅ ON |
| Confirm email | ⚪ OFF (para desarrollo) |

### SQL ejecutado

El schema completo (tablas + políticas RLS + vista) se ejecutó en
**SQL Editor** del dashboard.

---

## 6. Variables de entorno

Archivo: `.env.local` (raíz del proyecto, **NO se sube a Git**)

```env
VITE_SUPABASE_URL=https://wfrrjbnnjolzprrxiuju.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu-anon-key...
```

### ⚠️ Reglas críticas

1. **`VITE_SUPABASE_URL` NO debe terminar en `/rest/v1/`** ni en `/`.
   Debe ser solo `https://xxx.supabase.co`.
2. **Después de cambiar `.env.local`, hay que reiniciar Vite**
   (`Ctrl+C` + `npm run dev`).

---

## 7. Estado actual de desarrollo

### ✅ Bloque A — Autenticación + base
- Proyecto Vite + React inicializado
- Tailwind CSS v3 con paleta personalizada
- Cliente Supabase + `AuthContext` (signIn, signUp, signOut, refreshNegocio)
- Pantallas Login y Registro
- Guard de rutas privadas
- PWA manifest básico

### ✅ Bloque B — Clientes
- `whatsapp.js` (utilidades)
- `useClientes` (saldo y vencido calculados)
- `BottomNav` con 3 pestañas
- `ClienteCard`
- Página `Clientes` con buscador + filtros (Todos / Con deuda / Vencidos / Al día)
- Página `NuevoCliente`
- Rutas `/clientes` y `/clientes/nuevo`

### ✅ Bloque C — Detalle + fiados/abonos/WhatsApp
- `useMovimientos`
- `NumericKeypad` (teclado grande)
- `FiadoAbonoSheet` (bottom sheet con montos, descripción, fecha, vencimiento, atajos 7/15/30 días)
- `WhatsAppPreview` (editable antes de enviar)
- Página `ClienteDetalle` con:
  - Saldo grande (verde/rojo)
  - 3 botones: + Fiado, + Abono, Cobrar
  - Alerta de límite de crédito
  - Historial con saldo resultante por movimiento
  - Editar y eliminar movimientos
- Ruta `/clientes/:id`

### ✅ Bloque D — Dashboard
- Página `Inicio` con:
  - Tarjeta verde grande: **Total por cobrar**
  - 3 indicadores: clientes con deuda, vencidos, cobrado este mes
  - Top 5 "Te deben más"
  - Sección "⚠️ Vencidos"
  - Botón flotante **+ Fiado rápido** (con picker de cliente)

### ✅ Bloque E — Ajustes + Planes
- Página `Ajustes`:
  - Editar nombre, teléfono, moneda (16 monedas LATAM), símbolo, prefijo país
  - Editar plantilla del mensaje de WhatsApp con variables
  - Ver plan actual
  - Cerrar sesión
- Página `Upgrade`:
  - Lista de 5 beneficios Pro
  - Botón "Hacerme Pro" → alert "Próximamente"
- Límite de **10 clientes** en plan gratis → redirige a `/upgrade`

### ✅ Bloque F — PWA real
- 5 iconos (192, 512, maskable, apple-touch, favicon)
- `manifest.json` completo con lang, categories, purpose
- `index.html` con meta tags PWA + iOS (`apple-mobile-web-app-capable`, `viewport-fit=cover`)
- CSS con soporte para **safe areas** (`env(safe-area-inset-*)`)
- `BottomNav` respeta el home indicator de iPhone
- Probado y funcionando en **Android (Chrome)** e **iPhone (Safari)**

---

## 8. Cómo ejecutar el proyecto

### Requisitos previos

- Node.js 20+
- Cuenta y proyecto de Supabase configurado
- `.env.local` con las claves correctas

### Comandos

```bash
# Instalar dependencias (solo primera vez)
npm install

# Arrancar en modo desarrollo (solo localhost)
npm run dev

# Arrancar en modo desarrollo expuesto a la red local
npm run dev -- --host
# → http://192.168.100.216:5173

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

### ⚠️ Firewall de Windows

Si quieres acceder desde el celular en la misma red, **debes permitir el
puerto 5173 en el firewall**. Ver [Sección 11](#11-errores-resueltos-y-soluciones).

---

## 9. Cómo probar en celular (PWA)

### Requisitos

- PC encendida con `npm run dev -- --host` corriendo
- Celular en la **misma red WiFi** que la PC
- Puerto `5173` permitido en el firewall de Windows

### Android (Chrome)

1. Abrir `http://192.168.100.216:5173` en Chrome.
2. Menú **⋮** → **"Instalar aplicación"**.
3. Se agrega a la pantalla de inicio.
4. Abrir desde el ícono → pantalla completa, barra de estado verde.

### iPhone (Safari)

> ⚠️ **Solo funciona con Safari**, no con Chrome ni Firefox.

1. Abrir `http://192.168.100.216:5173` en Safari.
2. Botón **Compartir** → **"Agregar a pantalla de inicio"**.
3. Se agrega a la pantalla de inicio.
4. Abrir desde el ícono → pantalla completa, respeta notch y home indicator.

### Limitaciones del modo local

- La URL `192.168.100.216:5173` **solo funciona mientras la PC esté encendida
  y `npm run dev` corriendo**.
- Si el router reasigna IP, la URL cambia.
- Para uso real permanente → **desplegar** (ver Sección 13).

---

## 10. Flujos funcionales

### Registro
Login → Crear una → llenar nombre del negocio, WhatsApp, correo, contraseña →
redirige a Dashboard.

### Crear cliente
Clientes → + Nuevo cliente → nombre (obligatorio) + teléfono + nota + límite →
Guardar → vuelve a la lista.

### Registrar fiado
Inicio → + Fiado rápido → elegir cliente → teclado → monto → descripción
opcional → fecha (default hoy) → vencimiento opcional (atajos 7/15/30 días) →
Guardar.

O también: Clientes → abrir cliente → + Fiado.

### Registrar abono
Cliente → + Abono → monto → Guardar. El saldo baja automáticamente.

### Cobrar por WhatsApp
Cliente → Cobrar (habilitado si saldo > 0) → vista previa con plantilla
rellena → editar si quieres → Abrir WhatsApp → se abre `wa.me/{tel}` con el
mensaje precargado.

### Ver dashboard
Inicio → tarjeta verde con total → indicadores → top 5 → vencidos.

### Configurar negocio
Ajustes → editar campos → Guardar cambios.

### Plan Pro
Ajustes → tarjeta de plan → Upgrade → botón "Hacerme Pro" (próximamente).

---

## 11. Errores resueltos y soluciones

### ❌ Error 1: `npx tailwindcss init -p` falla

**Síntoma:**
```
npm error could not determine executable to run
```

**Causa:** Tailwind v4 instalado por defecto, donde `init` ya no existe.

**Solución:**
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

---

### ❌ Error 2: Registro falla con `404 Invalid path specified in request URL`

**Causa:** La URL de Supabase en `.env.local` tenía `/rest/v1/` al final.

**Solución:**
```env
# ❌ Incorrecto
VITE_SUPABASE_URL=https://xxx.supabase.co/rest/v1/

# ✅ Correcto
VITE_SUPABASE_URL=https://xxx.supabase.co
```
Y reiniciar Vite (`Ctrl+C` + `npm run dev`).

---

### ❌ Error 3: Registro falla con `400 Bad Request — Email signups are disabled`

**Causa:** En Supabase, `Allow new users to sign up` estaba apagado.

**Solución:**
1. Ir a **Authentication → Sign In / Providers → Email**.
2. Activar:
   - Enable Email provider → **ON**
   - Allow new users to sign up → **ON**
   - Confirm email → **OFF** (para desarrollo)
3. Guardar. **No requiere reiniciar Vite.**

---

### ❌ Error 4: `index.html` "no aparece" en VS Code

**Causa:** VS Code lo ocultaba por configuración o se abrió la carpeta `src`
en vez de `fiadito`.

**Solución:**
- `Ctrl + P` → escribir `index.html` para abrirlo.
- Verificar que la raíz del explorador es `fiadito`, no `src`.

---

### ❌ Error 5: Celular no puede acceder a `192.168.100.216:5173`

**Síntomas:** Chrome Android o Safari iPhone dice
`ERR_CONNECTION_TIMED_OUT` o `No se puede acceder a este sitio`.

**Causas y soluciones:**

**Causa A — Firewall de Windows bloquea el puerto 5173**

Solución (PowerShell **como administrador**):
```powershell
New-NetFirewallRule -DisplayName "Vite Fiadito 5173 In" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any
New-NetFirewallRule -DisplayName "Vite Fiadito 5173 Out" -Direction Outbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any
```

**Causa B — Vite sin `--host`**
```bash
npm run dev -- --host
```

**Causa C — Redes distintas**
Ambos dispositivos (PC y celular) deben estar en la **misma red WiFi**, sin
datos móviles activos, sin estar en red de invitados.

**Verificación:**
```powershell
netstat -an | findstr 5173
```
Debe mostrar `0.0.0.0:5173` LISTENING (no `127.0.0.1:5173`).

---

### ⚠️ Nota: vulnerabilidades de npm

`npm install` reporta vulnerabilidades (moderate/high). **No afectan el
desarrollo local.** No ejecutar `npm audit fix --force` porque puede romper
dependencias.

---

## 12. Roadmap completado

| # | Bloque | Estado |
|---|---|---|
| A | Autenticación + base | ✅ Completado |
| B | Clientes | ✅ Completado |
| C | Detalle + fiados/abonos/WhatsApp | ✅ Completado |
| D | Dashboard (Inicio) | ✅ Completado |
| E | Ajustes + Planes | ✅ Completado |
| F | PWA + prueba en dispositivos | ✅ Completado |

**MVP funcional completo.** La app es usable en producción local.

---

## 13. Próximos pasos opcionales

### 🚀 Prioridad alta

**1. Desplegar a producción (Vercel o Netlify, gratis)**
- URL fija tipo `https://fiadito.vercel.app`
- Funciona desde cualquier red, cualquier dispositivo, siempre
- HTTPS automático
- Instalación PWA perfecta (Chrome y Safari requieren HTTPS para ofrecer
  instalación "completa" sin warnings)
- **Tiempo estimado:** 15 minutos

**2. Iconos reales**
- Reemplazar placeholders por un logo de Fiadito
- Herramienta: https://realfavicongenerator.net

### 🎁 Prioridad media

**3. Borrar cliente desde la UI**
- Actualmente solo se puede desde Supabase directamente
- Agregar botón con confirmación en `ClienteDetalle`

**4. Editar movimientos con sheet bonito**
- Actualmente usa `prompt()` nativo para editar monto
- Reemplazar por un bottom sheet con teclado numérico y campos completos

**5. Editar cliente**
- Cambiar nombre, teléfono, nota, límite desde la UI

### 💡 Prioridad baja

**6. Modo offline real**
- Con `vite-plugin-pwa` + service worker
- Cachear clientes y movimientos para consultar sin internet
- Sincronización cuando vuelva la conexión

**7. Pagos reales (Stripe / MercadoPago)**
- Botón "Hacerme Pro" funcional
- Webhook para actualizar `plan` en Supabase

**8. Reportes**
- Historial del mes, ganancias, clientes morosos
- Exportar CSV / PDF

**9. Recordatorios automáticos**
- Cron + WhatsApp Business API
- Enviar recordatorios masivos a vencidos

**10. Notificaciones push**
- Avisar al dueño cuando un cliente paga o cuando se vence un fiado

---

## 14. Notas técnicas y decisiones

### ¿Por qué React 19 si el código es para 18?
Vite 8 instala React 19 por defecto. **Toda la API usada es compatible** con
ambas versiones. No hay migración necesaria.

### ¿Por qué Tailwind 3 y no 4?
Tailwind 4 cambió su sistema de configuración (usa `@import "tailwindcss"` y
CSS-first config). El código del proyecto está escrito para v3. Downgrade
deliberado por compatibilidad.

### ¿Por qué no usar shadcn/ui todavía?
Para el MVP se usaron clases de Tailwind directas con componentes propios
(`btn-primary`, `input-lg`, etc.). Se puede integrar shadcn/ui más adelante
sin refactorizar.

### ¿Por qué no hay Service Worker en la PWA?
La PWA es instalable (manifest funcional) y se abre a pantalla completa. El
modo offline se puede agregar después con `vite-plugin-pwa` cuando haga falta.

### ¿Por qué la moneda no convierte valores?
Cuando un negocio cambia de moneda en Ajustes, **solo cambia el símbolo**, no
convierte los valores ya guardados. Es lo más simple y predecible para el
usuario promedio.

### ¿Por qué el límite de 10 clientes solo se verifica en la UI?
La verificación ocurre al hacer clic en **+ Nuevo cliente** (en `Clientes.jsx`)
y en el picker de **+ Fiado rápido** (en `Inicio.jsx`). No bloquea la creación
desde Supabase directamente. Para producción se puede agregar una función RPC
que valide en el backend.

### Seguridad
- La `anon key` de Supabase es **pública por diseño**. La seguridad real viene
  de las políticas RLS.
- `.env.local` está en `.gitignore`.
- El aislamiento entre usuarios está garantizado por RLS, no por el frontend.

### Convenciones de código
- **Español** para nombres de tablas, columnas y textos de UI.
- **camelCase** para variables/funciones JS.
- **snake_case** para campos de BD.
- Componentes en `PascalCase.jsx`.
- Un componente por archivo.

### Safe areas (iPhone)
Se usan las funciones CSS `env(safe-area-inset-*)` para respetar:
- El **notch** superior
- El **home indicator** inferior (barra de gestos)

Esto se aplica en `.app-shell` y en `BottomNav`.

### PWA en Android vs iPhone
- **Android (Chrome):** permite instalar PWAs por HTTP en redes locales,
  muestra opción "Instalar aplicación".
- **iPhone (Safari):** solo funciona con Safari. Chrome y Firefox en iOS no
  permiten instalar PWAs. Requiere "Agregar a pantalla de inicio" manual.

---

## 📞 Contacto / Repositorio

- **Autor:** Felipe Muñoz (`fearmunoz942@gmail.com`)
- **Proyecto:** Fiadito (nombre provisional)
- **Repositorio:** *(pendiente de crear)*

---

*Documento actualizado al finalizar el Bloque F (MVP completo).*
*Próxima revisión sugerida: al desplegar a producción.*