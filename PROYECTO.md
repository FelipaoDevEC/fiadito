# Fiadito — Documentación completa

> Cuaderno de fiados digital para tiendas de barrio. Registra quién te debe,
> cuánto y desde cuándo; abona; cobra por WhatsApp con un toque.

**Autor:** Felipe Muñoz
**Última actualización:** 2026-10-06
**Estado:** ✅ MVP completo, en producción
**Producción:** https://fiadito-nine.vercel.app/
**Repositorio:** https://github.com/FelipaoDevEC/fiadito.git
**Supabase project ref:** `wfrrjbnnjolzprrxiuju`

---

## Índice

1. [Qué es Fiadito](#1-qué-es-fiadito)
2. [Filosofía](#2-filosofía)
3. [Arquitectura](#3-arquitectura)
4. [¿Dónde está el backend?](#4-dónde-está-el-backend)
5. [Stack explicado](#5-stack-explicado)
6. [Modelo de datos](#6-modelo-de-datos)
7. [Estructura de carpetas](#7-estructura-de-carpetas)
8. [Flujos internos](#8-flujos-internos)
9. [Metodología de trabajo](#9-metodología-de-trabajo)
10. [Ejecutar en local](#10-ejecutar-en-local)
11. [Desplegar cambios](#11-desplegar-cambios)
12. [PWA (Android + iPhone)](#12-pwa-android--iphone)
13. [Historial de construcción (A–F)](#13-historial-de-construcción-af)
14. [Errores resueltos](#14-errores-resueltos)
15. [Seguridad](#15-seguridad)
16. [Roadmap](#16-roadmap)
17. [Glosario](#17-glosario)

---

## 1. Qué es Fiadito

App web para **dueños de tiendas de barrio** en Latinoamérica. Reemplaza el
cuaderno de papel donde anotan quién les debe.

**Hace:**
- Registrar fiados (quién, cuánto, cuándo, para qué)
- Registrar abonos
- Mostrar total por cobrar
- Detectar vencidos
- Cobrar por WhatsApp con un toque
- Instalarse como app en el celular

**No hace:** facturación, tarjetas, contabilidad. Es un cuaderno simple.

**Usuario:** no técnico, detrás del mostrador, una mano, 5 segundos.

---

## 2. Filosofía

1. **Menos pasos = mejor.** Un fiado se registra en 3 toques.
2. **Botones grandes, textos claros.** Mínimo 44px, español, sin jerga.
3. **Verde = dinero, rojo = deuda.** El color comunica.
4. **Mobile-first.** Diseñado a 375px (iPhone SE).
5. **Cero servidores propios.** Todo BaaS.

---

## 3. Arquitectura

SPA + BaaS. Sin backend propio.

```
┌──────────────────────────────────────────┐
│        CELULAR DEL DUEÑO                 │
│  ┌────────────────────────────────────┐  │
│  │  Fiadito (React + Vite + Tailwind) │  │
│  │  Corriendo como PWA instalable     │  │
│  │                                    │  │
│  │  AuthContext ──▶ supabase.js       │  │
│  └──────────────┬─────────────────────┘  │
└─────────────────┼────────────────────────┘
                  │ HTTPS
                  │ (anon key + sesión JWT)
                  ▼
┌──────────────────────────────────────────┐
│              SUPABASE                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Postgres │ │   RLS    │  │
│  │ usuarios │ │ 3 tablas │ │ permisos │  │
│  └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────────────────────┘
                  ▲
                  │ deploy automático
                  │ (git push → main)
                  │
┌──────────────────────────────────────────┐
│              VERCEL (CDN)                │
│  Sirve HTML/CSS/JS, HTTPS, dominio       │
└──────────────────────────────────────────┘
```

| Pieza | Qué hace | Dónde |
|---|---|---|
| Frontend | Interfaz | Navegador del celular |
| Auth | Login/registro | Servidores Supabase |
| Postgres | Guarda datos | Servidores Supabase |
| RLS | Aísla datos entre usuarios | Postgres |
| Vercel | Sirve el frontend | CDN global |

---

## 4. ¿Dónde está el backend?

**Fiadito NO tiene backend propio. Supabase ES el backend.**

### Backend tradicional vs Fiadito

```
Tradicional:   Frontend + Backend (Node/Python) + Base de datos
Fiadito:       Frontend + Supabase (backend + base de datos)
```

### Qué hace Supabase por ti

| Función | Backend tradicional | Supabase |
|---|---|---|
| Guardar datos | Escribir código | Tablas listas |
| Login/registro | Programar auth | Ya funciona |
| API para el frontend | Crear endpoints | Automática |
| Seguridad entre usuarios | Programar permisos | RLS en SQL |
| Contraseñas hasheadas | Librería + config | Automático |
| Backups | Scripts + cron | Automáticos |

### Dónde vive cada cosa

- **Código React** → tu PC + GitHub
- **Código del backend** → servidores de Supabase (no lo ves)
- **Datos** (negocios, clientes, movimientos) → Postgres en Supabase
- **Frontend compilado** → CDN de Vercel

### Lo único que "programaste de backend"

Fue el **SQL** que pegaste en Supabase al inicio:
- Crear 3 tablas
- Definir políticas RLS
- Crear vista `saldos_clientes`

Eso **es** el backend. En un backend tradicional serían cientos de líneas
en Node/Python. Aquí fueron ~100 líneas de SQL.

### Flujo de una petición

```
Usuario toca "+ Fiado"
        │
        ▼
React llama a supabase.from('movimientos').insert(...)
        │
        ▼
Supabase valida RLS (¿es tu cliente?)
        │
        ▼
Postgres guarda la fila
        │
        ▼
React recarga la lista y recalcula el saldo
```

### Ventajas

✅ No pagas servidor (Supabase gratis: 500MB + 50k usuarios)
✅ No configuras HTTPS, backups, escalado
✅ No programas endpoints (API automática)
✅ Seguridad en la BD, no en el código
✅ Empezar en horas, no semanas

### Desventajas

❌ Dependes de Supabase
❌ Menos control sobre lógica compleja
❌ Costos suben si creces mucho

### ¿Cuándo necesitarías backend propio?

Solo si agregas:
- Pagos reales (Stripe/MercadoPago + webhooks)
- Recordatorios automáticos 24/7 (cron)
- WhatsApp Business API
- Reportes muy complejos

Para eso existe **Supabase Edge Functions** (TypeScript que corre dentro
de Supabase). Sería el siguiente paso si lo necesitas.

---

## 5. Stack explicado

### React 19 — UI
Librería para construir interfaces con **componentes**. Cada pantalla y
botón es un componente. Hooks usados: `useState`, `useEffect`, `useMemo`,
`useCallback`, `useContext`.

### Vite 8 — Bundler
Empaqueta el código para el navegador. Dev: recarga en ms. Prod:
`npm run build` genera `dist/` optimizado.

### Tailwind CSS 3 — Estilos
Clases utilitarias directas en el JSX. Paleta personalizada: `primary`
(verde), `danger` (rojo). Utilidades propias: `btn-primary`, `input-lg`,
`monto`, `app-shell`.

### React Router 7 — Navegación
Rutas SPA sin recargar. Ejemplo: `<Route path="/clientes/:id" />`. El
`:id` es dinámico.

### Supabase — Backend
Postgres + Auth + API + RLS. La app se conecta con
`@supabase/supabase-js`.

### Lucide React — Iconos
~1000 iconos SVG limpios. Usamos `Home`, `Users`, `Settings`, `Plus`,
`Search`, `Trash2`, `Pencil`, `MessageCircle`, `Wallet`, `AlertTriangle`.

### PWA
Web instalable como app nativa. Requiere HTTPS + `manifest.json` +
íconos. Sin Play Store ni App Store.

### Vercel — Hosting
CDN global, HTTPS automático, deploy en cada push a `main`. Gratis.

### Git + GitHub — Versiones
Historial de cambios. Cada commit es una foto recuperable.

---

## 6. Modelo de datos

### Diagrama

```
auth.users (Supabase Auth)
    │ 1:1
    ▼
negocios (nombre, telefono, moneda, simbolo,
          prefijo_pais, plantilla_mensaje, plan)
    │ 1:N
    ▼
clientes (nombre, telefono, nota, limite_credito)
    │ 1:N
    ▼
movimientos (tipo: fiado|abono, monto, descripcion,
             fecha, fecha_vencimiento)
```

### Tablas

**`negocios`**
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK auth.users, único |
| nombre | text | |
| telefono | text | |
| moneda | text | Default `'USD'` |
| simbolo | text | Default `'$'` |
| prefijo_pais | text | Default `'593'` |
| plantilla_mensaje | text | Variables `{cliente}`, `{saldo}`, etc. |
| plan | text | `'gratis'` o `'pro'` |
| created_at | timestamptz | |

**`clientes`**
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| negocio_id | uuid | FK negocios |
| nombre | text | Obligatorio |
| telefono | text | Opcional |
| nota | text | Opcional |
| limite_credito | numeric(12,2) | Opcional |
| created_at | timestamptz | |

**`movimientos`**
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| cliente_id | uuid | FK clientes |
| negocio_id | uuid | FK negocios |
| tipo | text | `'fiado'` o `'abono'` |
| monto | numeric(12,2) | > 0 |
| descripcion | text | Opcional |
| fecha | date | Default hoy |
| fecha_vencimiento | date | Solo fiados |
| created_at | timestamptz | |

### Reglas de negocio

- **Saldo cliente** = `SUM(fiados) − SUM(abonos)`
- **Vencido** = fiado con `fecha_vencimiento < hoy` y saldo > 0
- **Límite excedido** = `saldo > limite_credito`
- **Total por cobrar** = suma de saldos positivos
- **Cobrado mes** = suma de abonos del mes actual

### RLS (Row Level Security)

Postgres filtra automáticamente. Aunque hackeen el frontend, **no pueden
ver datos de otros usuarios**.

Políticas por tabla:

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| negocios | propio user_id | propio user_id | propio user_id | — |
| clientes | propios del negocio | propios del negocio | propios del negocio | propios del negocio |
| movimientos | propios del negocio | propios del negocio | propios del negocio | propios del negocio |

### Índices

```sql
CREATE INDEX ON public.clientes(negocio_id);
CREATE INDEX ON public.movimientos(cliente_id);
CREATE INDEX ON public.movimientos(negocio_id);
```

Sin índices → escaneo completo. Con índices → acceso directo.

---

## 7. Estructura de carpetas

```
fiadito/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png              Ícono PWA Android
│   ├── icon-512.png              Ícono PWA
│   ├── maskable-512.png          Ícono adaptable
│   ├── apple-touch-icon.png      Ícono iOS
│   └── manifest.json             Config PWA
│
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx         Barra inferior (3 pestañas)
│   │   ├── ClienteCard.jsx       Tarjeta en lista
│   │   ├── FiadoAbonoSheet.jsx   Bottom sheet fiado/abono
│   │   ├── NumericKeypad.jsx     Teclado numérico grande
│   │   └── WhatsAppPreview.jsx   Vista previa del mensaje
│   ├── contexts/
│   │   └── AuthContext.jsx       Usuario + negocio global
│   ├── hooks/
│   │   ├── useClientes.js        Clientes + saldo calculado
│   │   └── useMovimientos.js     Movimientos por cliente
│   ├── lib/
│   │   ├── supabase.js           Cliente de Supabase
│   │   ├── format.js             Montos y fechas
│   │   └── whatsapp.js           Normalizar tel + URL
│   ├── pages/
│   │   ├── Login.jsx             /login
│   │   ├── Registro.jsx          /registro
│   │   ├── Inicio.jsx            / (dashboard)
│   │   ├── Clientes.jsx          /clientes
│   │   ├── NuevoCliente.jsx      /clientes/nuevo
│   │   ├── ClienteDetalle.jsx    /clientes/:id
│   │   ├── Ajustes.jsx           /ajustes
│   │   └── Upgrade.jsx           /upgrade
│   ├── App.jsx                   Router principal
│   ├── index.css                 Tailwind + utilidades
│   └── main.jsx                  Entry point
│
├── .env.local                    Claves (NO va a Git)
├── .gitignore
├── index.html                    HTML raíz + meta PWA
├── package.json
├── postcss.config.js
├── tailwind.config.js            Paleta personalizada
├── vercel.json                   SPA routing
└── vite.config.js
```

**Lógica:**
- `components/` → reutilizable
- `pages/` → 1 archivo por pantalla
- `hooks/` → lógica de datos
- `lib/` → funciones puras (testeables aparte)
- `contexts/` → estado global

---

## 8. Flujos internos

### Autenticación

```
Abrir app → App.jsx chequea sesión
  ├─ No hay → redirige /login
  │   → supabase.auth.signInWithPassword()
  │   → Supabase devuelve JWT
  │   → AuthContext guarda user + negocio
  └─ Sí hay → redirige /
```

### Crear cliente

```
/clientes → "+ Nuevo cliente"
  → verifica límite del plan
    ├─ plan gratis + 10 clientes → /upgrade
    └─ OK → /clientes/nuevo
       → supabase.from('clientes').insert(...)
       → RLS valida
       → Postgres guarda
       → navega a /clientes
```

### Registrar fiado

```
"+ Fiado" → FiadoAbonoSheet
  → usuario escribe monto (NumericKeypad)
  → opcional: descripción + vencimiento
  → Guardar
  → supabase.from('movimientos').insert(...)
  → useMovimientos recarga
  → useClientes recalcula saldo
  → se muestra en rojo
```

### Cobrar por WhatsApp

```
"Cobrar" → arma mensaje:
  reemplaza {cliente}, {saldo}, {negocio} en la plantilla
  → WhatsAppPreview (editable)
  → normaliza teléfono (agrega prefijo 593)
  → window.open("https://wa.me/593987654321?text=...")
  → WhatsApp abre con mensaje listo
```

---

## 9. Metodología de trabajo

### Construcción por bloques

Cada bloque es **usable y probable** al terminarlo:

| Bloque | Resultado |
|---|---|
| A — Autenticación | Puedes registrarte e iniciar sesión |
| B — Clientes | Puedes crear y listar clientes |
| C — Fiados/Abonos/WhatsApp | Puedes cobrar |
| D — Dashboard | Puedes ver resumen |
| E — Ajustes + Planes | Puedes configurar |
| F — PWA + Deploy | Funciona en celular y online |

**Regla:** no empezar un bloque hasta que el anterior funcione al 100%.

### Ciclo por bloque

```
1. Definir objetivo
2. Escribir código
3. Probar
   ├─ Falla → corregir → volver a 3
   └─ Funciona → siguiente bloque
```

### Debugging sistemático

1. Identificar el error exacto
2. Localizar (consola, terminal, Network)
3. Hipótesis de causa
4. Verificar hipótesis
5. Corregir **solo eso**
6. Reprobar (regresión)

**Ejemplo real:** registro daba 404. Hipótesis: URL mal. Se verificó
`.env.local` vs dashboard. Se quitó `/rest/v1/` sobrante. Funcionó.

### Nomenclatura

- **Español:** tablas, columnas, textos UI, nombres de funciones
- **Inglés (técnico):** `useState`, `useEffect`, `AuthContext`

### Commits

Cada bloque con un commit descriptivo:
```
Bloque A: autenticación completa
Bloque B: gestión de clientes
...
```

### Documentación viva

`PROYECTO.md` se actualiza al terminar cada bloque. **No es opcional.**

---

## 10. Ejecutar en local

### Requisitos

- Node.js 20+ → [nodejs.org](https://nodejs.org)
- Git → [git-scm.com](https://git-scm.com)
- VS Code → [code.visualstudio.com](https://code.visualstudio.com)

Verificar:
```bash
node -v      # v20.x
npm -v       # 10.x
git --version
```

### Clonar

```bash
cd C:\Users\TU-USUARIO\Documents
git clone https://github.com/tu-usuario/fiadito.git
cd fiadito
npm install
```

### Crear `.env.local`

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Reglas:**
- Sin `/rest/v1/` al final
- Sin `/` al final
- NO va a GitHub (está en `.gitignore`)

### Arrancar

```bash
npm run dev
# → http://localhost:5173
```

Para probar en celular (misma WiFi):
```bash
npm run dev -- --host
# → usa la URL Network que aparece
```

**Firewall Windows:** si el celular no accede, abrir puerto 5173:
```powershell
New-NetFirewallRule -DisplayName "Vite Fiadito 5173 In" `
  -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any
New-NetFirewallRule -DisplayName "Vite Fiadito 5173 Out" `
  -Direction Outbound -Protocol TCP -LocalPort 5173 -Action Allow -Profile Any
```
Requiere PowerShell **como administrador**.

### Scripts

```bash
npm run dev       # desarrollo
npm run build     # build producción (dist/)
npm run preview   # previsualizar build
npm run lint      # linter
```

---

## 11. Desplegar cambios

### Flujo normal (automático)

```bash
# 1. Hacer cambios
# 2. Guardar
git add .
git commit -m "Descripción breve"
git push
```

**Eso es todo.** Vercel detecta el push y despliega en 1-2 min.

### Verificar

1. [vercel.com/dashboard](https://vercel.com/dashboard)
2. Proyecto `fiadito`
3. Deploy en progreso → completado
4. Si falla → clic en deploy → logs

### Rollback

1. Vercel → Deployments
2. Deploy anterior bueno → **"Promote to Production"**
3. Vuelve en 10 segundos

### `vercel.json` (crítico)

Sin esto, recargar en `/clientes` da 404:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Por qué:** React Router maneja rutas en el navegador. Vercel busca
archivos físicos. Con el rewrite, siempre sirve `index.html`.

---

## 12. PWA (Android + iPhone)

### ¿Qué es?

Web **instalable como app nativa**. Sin tiendas.

### Requisitos

- HTTPS (Vercel lo da gratis)
- `manifest.json`
- Íconos 192 y 512 PNG
- Service Worker (opcional, para offline)

### Instalar en Android (Chrome)

1. Abrir URL
2. Menú **⋮** → **"Instalar aplicación"**
3. Se agrega a inicio
4. Abre a pantalla completa

### Instalar en iPhone (Safari)

⚠️ **Solo Safari**, no Chrome ni Firefox.

1. Abrir URL en Safari
2. Botón **Compartir** → **"Agregar a pantalla de inicio"**
3. Se agrega a inicio
4. Abre a pantalla completa

### Safe areas (notch iPhone)

```css
.app-shell {
  padding-bottom: calc(6rem + env(safe-area-inset-bottom));
}
```

`BottomNav` también usa `env(safe-area-inset-bottom)`.

### Diferencias

| | Android | iPhone |
|---|---|---|
| Instalación | Menú ⋮ | Compartir |
| Pantalla completa | Sí | Sí |
| Push | Sí | iOS 16.4+ |
| Service Worker | Sí | Sí |

---

## 13. Historial de construcción (A–F)

### 🅰 Bloque A — Autenticación

**Archivos:** `supabase.js`, `format.js`, `AuthContext.jsx`, `Login.jsx`,
`Registro.jsx`, `App.jsx`

**Setup:** proyecto Supabase + 3 tablas + RLS + vista `saldos_clientes`

**Resultado:** registro, login, logout funcionando.

### 🅱 Bloque B — Clientes

**Archivos:** `whatsapp.js`, `useClientes.js`, `BottomNav.jsx`,
`ClienteCard.jsx`, `Clientes.jsx`, `NuevoCliente.jsx`

**Resultado:** lista con buscador y filtros (Todos / Con deuda / Vencidos /
Al día), crear cliente.

### 🅲 Bloque C — Fiados, abonos, WhatsApp

**Archivos:** `useMovimientos.js`, `NumericKeypad.jsx`,
`FiadoAbonoSheet.jsx`, `WhatsAppPreview.jsx`, `ClienteDetalle.jsx`

**Resultado:** bottom sheet con teclado grande, historial con saldo
resultante, editar/eliminar, alerta de límite, cobro por WhatsApp.

### 🅳 Bloque D — Dashboard

**Archivos:** `Inicio.jsx`

**Resultado:** tarjeta verde de total por cobrar, 3 indicadores, top 5 "Te
deben más", sección vencidos, botón **+ Fiado rápido**.

### 🅴 Bloque E — Ajustes + Planes

**Archivos:** `Ajustes.jsx`, `Upgrade.jsx`

**Resultado:** editar negocio (16 monedas LATAM), plantilla del mensaje,
ver plan, límite de 10 clientes, pantalla Plan Pro.

### 🅵 Bloque F — PWA + Deploy

**Trabajo:** 5 íconos, `manifest.json`, meta tags iOS, safe areas, firewall
Windows, GitHub, Vercel, `vercel.json`, probado en Android + iPhone.

**Resultado:** instalable en celular, URL pública, auto-deploy desde Git.

---

## 14. Errores resueltos

### ❌ `npx tailwindcss init -p` falla

**Causa:** Tailwind v4 (donde `init` no existe).

**Solución:**
```bash
npm uninstall tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### ❌ Registro 404 (Invalid path)

**Causa:** `VITE_SUPABASE_URL` tenía `/rest/v1/` al final.

**Solución:** quitar `/rest/v1/` y la barra final. Reiniciar Vite.

### ❌ Registro 400 (Email signups disabled)

**Causa:** `Allow new users to sign up` apagado.

**Solución:** Supabase → Auth → Providers → Email:
- Enable Email provider → ON
- Allow new users to sign up → ON
- Confirm email → OFF (dev)

### ❌ `index.html` no aparece en VS Code

**Causa:** VS Code lo ocultaba o se abrió `src/` como raíz.

**Solución:** `Ctrl + P` → escribir `index.html`. Verificar carpeta raíz.

### ❌ Celular no accede a IP local

**Causa:** Firewall Windows bloquea puerto 5173.

**Solución:** abrir puerto (ver sección 10). Requiere admin.

**Verificación:**
```powershell
netstat -an | findstr 5173
# Debe decir 0.0.0.0:5173 LISTENING
```

### ❌ 404 al recargar /clientes en Vercel

**Causa:** Vercel busca archivo físico.

**Solución:** `vercel.json` con rewrite a `/index.html`.

### ⚠️ Vulnerabilidades npm

Reportadas en dependencias transitivas. **No afectan** desarrollo. **No
ejecutar** `npm audit fix --force`.

---

## 15. Seguridad

### Dónde vive

**En la base de datos, no en el frontend.** El frontend es público por
naturaleza. RLS en Postgres es la seguridad real.

### La anon key es pública

Está diseñada para serlo. Identifica el proyecto. La seguridad viene de:
1. RLS en tablas
2. JWT del usuario (privado)

**No hay riesgo en tenerla en `.env.local` ni en Vercel.**

### Nunca subir a Git

- `.env.local`
- `service_role` key (esa SÍ es privada, da acceso total)
- Contraseñas
- Tokens de API

**Fiadito solo usa la anon key, segura.**

### Verificación

- [x] RLS en 3 tablas
- [x] Políticas para SELECT/INSERT/UPDATE/DELETE
- [x] `user_id` único en negocios
- [x] `.env.local` en `.gitignore`
- [x] HTTPS automático (Vercel)
- [x] Contraseñas hasheadas (Supabase)

---

## 16. Roadmap

### 🟢 Prioridad alta

1. **Iconos reales** (reemplazar placeholders) — 15 min
2. **Borrar cliente** desde UI — 20 min
3. **Editar cliente** — 30 min
4. **Dominio propio** (`fiadito.app`) — 20 min + $10/año

### 🟡 Prioridad media

5. **Editar movimientos** con sheet bonito (reemplazar `prompt()`) — 1h
6. **Modo offline** con Service Worker — 1-2h
7. **Reportes** (exportar CSV, historial mensual) — 3-4h

### 🔴 Prioridad baja

8. **Pagos reales** (Stripe/MercadoPago) — 1-2 días
9. **Recordatorios automáticos** (cron + WhatsApp API) — 2-3 días
10. **Notificaciones push** — 1 día
11. **Multi-usuario** (empleados) — 3-5 días

---

## 17. Glosario

**API:** Interfaz entre programas.
**Anon key:** Clave pública de Supabase.
**BaaS:** Backend as a Service (backend listo sin programar servidor).
**Build:** Compilar código para producción.
**CDN:** Red global de servidores para servir archivos rápido.
**Cliente (redes):** Dispositivo que pide datos (tu celular).
**Componente:** Pieza reutilizable de UI en React.
**Context:** Estado compartido entre componentes.
**Deploy:** Publicar la app.
**Env var:** Variable de configuración fuera del código.
**Frontend:** Lo que ve el usuario, corre en el navegador.
**Git:** Control de versiones.
**GitHub:** Plataforma en la nube para Git.
**Hook:** Función de React (`useState`, etc.).
**HTTPS:** HTTP cifrado.
**JSX:** Sintaxis HTML dentro de JavaScript.
**JWT:** Token firmado que identifica al usuario.
**Manifest (PWA):** JSON que describe la app.
**Postgres:** Base de datos relacional open source.
**PWA:** Web instalable como app.
**RLS:** Row Level Security. Filtra filas por usuario en Postgres.
**Router:** Maneja la navegación en SPA.
**Service Worker:** Script que corre en segundo plano (offline).
**SPA:** Single Page Application.
**Supabase:** BaaS (Postgres + Auth + API).
**Tailwind:** Framework de CSS utilitario.
**Vercel:** Hosting para frontends.
**Vite:** Bundler rápido.

---

## Conclusión

Fiadito es una app **completa, funcional, desplegada y en producción**.

Sirve como:
- Herramienta real para tiendas de barrio.
- Ejemplo de app full-stack simple (React + Supabase + Vercel).
- Proyecto de aprendizaje.

**Lo que demuestra:**
- MVP en días, no meses.
- Sin infraestructura propia al inicio.
- Simplicidad > sobreingeniería.
- Documentar es parte del trabajo.

> *"Hazlo simple. Hazlo funcionar. Hazlo bonito. En ese orden."*

---

*Documento vivo. Se actualiza al finalizar cada bloque.*