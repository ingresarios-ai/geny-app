# Deploy — Geny by INGRESARIOS

La app son **dos piezas**:

1. **Frontend** estático (Vite → `dist/`).
2. **Una función serverless**: `api/chat.ts` (el Coach "Geny").

Por eso conviene un host que sirva estático **y** funciones serverless. El recomendado es **Vercel** (detecta Vite y despliega `api/` como funciones automáticamente). Netlify funciona igual con un pequeño ajuste (ver abajo).

> ⚠️ En un host **solo estático** (GitHub Pages, S3) el frontend carga bien pero el Coach responde "No pude conectar" porque no hay `/api/chat`. Usa Vercel o Netlify.

---

## Requisitos
- Node 18+ y la app instalada (`npm install`).
- Una cuenta en Vercel (gratis).
- (Opcional pero recomendado) Una **API key de Groq** — gratis en <https://console.groq.com> → *API Keys*. Sin ella el Coach corre en "modo demo" con respuestas simuladas.

---

## Opción A — Vercel por CLI (rápido)

```bash
npm i -g vercel          # una sola vez
cd ingresarios-app
vercel                   # primer deploy (preview). Acepta los defaults detectados (Vite)
vercel --prod            # deploy a producción
```

Para el Coach con IA real, define la variable de entorno y vuelve a desplegar:

```bash
vercel env add GROQ_API_KEY production   # pega tu key cuando lo pida
vercel --prod
```

## Opción B — Vercel desde GitHub (recomendado para iterar)

1. Sube la carpeta `ingresarios-app/` a un repo de GitHub (el `.gitignore` ya excluye `node_modules`, `dist` y `.env`).
2. En <https://vercel.com> → **Add New → Project** → importa el repo.
3. Vercel detecta **Vite** solo. Deja los defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. En **Settings → Environment Variables** agrega:
   - Name: `GROQ_API_KEY` · Value: *(tu key de Groq)* · Environment: Production (y Preview si quieres).
5. **Deploy**. Cada push a la rama principal redepliega solo.

> Si aún no tienes la key: despliega igual. El Coach funciona en "modo demo" y, cuando agregues `GROQ_API_KEY` y redepliegues, pasa a Groq real **sin tocar código**.

---

## Verificar el deploy
- Abre la URL de producción → debe cargar el onboarding "Geny by INGRESARIOS".
- Recorre: Registro (multi-moneda + Ticket/OCR), Presupuesto (Metas/Pagos), Tribu, y el botón **G** (Coach).
- En el Coach, pregunta "¿Dónde recorto?": con key responde Groq; sin key, el fallback con tus números y el aviso "modo demo (sin IA)".

---

## Alternativa — Netlify
Netlify no ejecuta `/api/*` como funciones por convención. Dos opciones:
- Mueve `api/chat.ts` a `netlify/functions/chat.ts` y añade en `netlify.toml` un redirect `/api/chat → /.netlify/functions/chat`, **o**
- Instala el plugin oficial de Vite/Netlify.
Config base de `netlify.toml`: build `npm run build`, publish `dist`, y define `GROQ_API_KEY` en Site settings → Environment.

---

## Notas
- **Groq**: el proxy usa el modelo `llama-3.3-70b-versatile` (ajústalo en `api/chat.ts` si quieres otro).
- **image-slot** (miniaturas de Tribu/OCR): son placeholders; sin el runtime de diseño, arrastrar una imagen se ve en sesión pero **no persiste**. En producción se reemplazan por thumbnails reales del CMS de videos.
- La app **no custodia dinero** y no conecta bancos; los datos son semilla en memoria (sin backend). Para producción real faltan auth, base de datos y sincronización del hogar (ver README).
