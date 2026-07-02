# Geny by INGRESARIOS · Ruta del Dinero Familiar

Demo funcional del handoff de diseño (`design_handoff_ingresarios_app`), recreado fielmente con los tokens hifi. Incluye el flujo base **1a–1e** más el upgrade v2: **2a** registro ampliado, **5a** OCR, **3a** La Tribu, **4a** Coach AI, **6a** Metas, **7a** Pagos recurrentes y **8a** Cierre de mes.

## Stack
- **Vite + React 18 + TypeScript**, sin backend (demo v1, estado en memoria).
- Fuentes: Newsreader + Instrument Sans (Google Fonts).
- Sin dependencias extra: navegación y estado con Context + `useReducer`.

> El handoff sugería React Native + Expo. Se optó por web (Vite+React) por decisión de producto: mismo patrón que el resto del portafolio INGRESARIOS y verificable en preview. El layout es mobile-first: marco de teléfono en PC, pantalla completa en móvil.

## Pantallas (todas navegables)
- **1a Onboarding** — diagnóstico de etapa; la opción elegida fija la etapa inicial de la Ruta. Invitar pareja abre el share sheet.
- **1b Home "Hoy"** — Ruta con stepper (nodos 2/3 navegan a Aprender/Simulador), presupuestos del mes (verde ok / clay ≥95%), feed de actividad, tab bar + FAB global.
- **1c Registro** — modal con teclado propio; guardar actualiza presupuesto de la categoría, "quedan del mes", racha (+1 el primer registro del día) y el feed de Home en vivo.
- **1d Aprender** (tab Ruta) — lección completada, reto activo con progreso segmentado, lecciones bloqueadas; la de Etapa 3 abre el Simulador.
- **1e Multiplicar** — portafolio de práctica, posiciones, insight de comportamiento, CTA a brokers regulados (disclaimer: no custodia dinero).

### Upgrade v2
- **2a Registro ampliado** (reemplaza 1c) — multi-moneda (18 divisas USA/Canadá/LatAm, convierte a la principal), 12 categorías + "Más", botón 📷 Ticket.
- **5a Escanear ticket (OCR)** — modal con `image-slot`, campos editables + nivel de confianza (OCR simulado).
- **3a La Tribu** (tab Comunidad) — video destacado, filtros, lista de videos con `image-slot`, "En vivo".
- **4a Coach AI** — chat "Geny" con datos reales del hogar, guardrail de inversión, chips de acción. Proxy `/api/chat` (Groq).
- **6a Metas** y **7a Pagos recurrentes** (tab Presupuesto, con control segmentado).
- **8a Cierre de mes** — resumen mensual compartible (se abre desde la notificación en Home).

## Correr
```
npm install
npm run dev      # http://localhost:5193
```

## Coach AI (Groq)
El proxy `api/chat.ts` usa **Groq** leyendo `GROQ_API_KEY` del entorno. Sin la variable, el Coach responde con un **fallback determinista** (marca "modo demo"). Para activar la IA real en el deployment, define `GROQ_API_KEY` en el hosting — sin cambios de código.

## Estructura
- `src/store.tsx` — modelo de estado + monedas/categorías + datos semilla.
- `src/data.ts` — datos semilla de Metas, Pagos y Videos.
- `src/theme.ts` — tokens de color/tipografía.
- `src/screens/` — una pantalla por archivo.
- `src/components/` — PhoneFrame, TabBar, ProgressBar.
- `api/chat.ts` — proxy del Coach (Groq + fallback).
- `public/image-slot.js` — web component de placeholders de imagen (3a/5a).

## Pendiente (fuera del alcance del demo)
Auth real, sincronización del hogar (Firestore/Supabase), motor de desbloqueos por hábitos, feed de precios del simulador, OCR/tasas de cambio reales, persistencia de `image-slot`, y estados de carga/error.
