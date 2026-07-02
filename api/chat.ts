// Proxy del Coach AI — usa DeepSeek (API compatible con OpenAI).
// Lee DEEPSEEK_API_KEY del entorno del hosting — NUNCA en el frontend.
// Si no hay key, responde con un fallback determinista.
import type { IncomingMessage, ServerResponse } from 'node:http'

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'
const MAX_TURNS = 24
const MAX_CHARS = 1500

const SYSTEM_PROMPT = `Eres Geny, el coach financiero familiar de la app "Geny by INGRESARIOS · Ruta del Dinero Familiar". Ayudas a una familia a entender sus propios números.

Reglas:
- Responde SIEMPRE en español, máximo ~110 palabras, tono cercano, concreto y sin jerga.
- Usa los NÚMEROS REALES del hogar que te paso en el contexto: da desglose, causa y una acción cuantificada ("liberan ~$X/mes").
- GUARDRAIL: NUNCA des recomendaciones de inversión personalizadas, ni señales de compra/venta, ni predicciones. Si preguntan qué invertir (cripto, acciones, etc.), redirige al simulador de la Etapa 3 (dinero virtual) y aclara que de invertir de verdad se encargan plataformas reguladas — tú no das asesoría de inversión.
- No inventes datos que no estén en el contexto.
- Texto plano, sin markdown. Emojis con mucha moderación.`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

async function readBody(req: IncomingMessage): Promise<unknown> {
  const pre = (req as IncomingMessage & { body?: unknown }).body
  if (pre !== undefined) return typeof pre === 'string' ? JSON.parse(pre) : pre
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'))
}

function validMessages(v: unknown): v is ChatMessage[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.length <= MAX_TURNS &&
    v.every(
      (m) =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0 && m.content.length <= MAX_CHARS,
    )
  )
}

interface Ctx {
  familyName?: string
  monthRemaining?: number
  budgets?: { label: string; spent: number; limit: number }[]
}

const money = (n: number) => '$' + Math.round(n).toLocaleString('es-MX')

// Fallback determinista (sin API key).
function fallbackReply(lastUser: string, ctx: Ctx): string {
  const t = lastUser.toLowerCase()
  if (/(invert|cripto|bitcoin|acci[oó]n|bolsa|trading|rendimiento|d[oó]nde pongo|d[oó]nde meto)/.test(t)) {
    return 'Buena pregunta, pero yo no te digo qué invertir — eso es asesoría y de eso se encargan plataformas reguladas. Lo que sí podemos hacer ahora: practicar en el simulador de la Etapa 3 con dinero virtual, para que aprendas riesgo y diversificación sin arriesgar un peso. Cuando el simulador te salga natural, damos el paso con dinero real y regulado.'
  }
  const budgets = ctx.budgets ?? []
  const top = budgets.slice().sort((a, b) => b.spent - a.spent)[0]
  const near = budgets.find((b) => b.spent / b.limit >= 0.95)
  if (top) {
    const parts = [
      `Tu categoría más pesada es ${top.label}: llevas ${money(top.spent)} de ${money(top.limit)}.`,
    ]
    if (near && near.label !== top.label) parts.push(`Ojo con ${near.label}, ya casi tope (${money(near.spent)}/${money(near.limit)}).`)
    if (ctx.monthRemaining != null) parts.push(`Te quedan ${money(ctx.monthRemaining)} este mes.`)
    parts.push('Si recortas 15% de la categoría más alta, liberas cerca de ' + money(top.spent * 0.15) + '/mes para tu meta de ahorro. ¿Le ponemos un límite?')
    return parts.join(' ')
  }
  return 'Aún no tengo suficientes registros de este mes para darte el desglose. Registra unos días más y te muestro exactamente a dónde se va el dinero.'
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  let body: { messages?: unknown; context?: unknown }
  try {
    body = (await readBody(req)) as typeof body
  } catch {
    res.statusCode = 400
    res.end('Invalid JSON')
    return
  }
  const { messages, context } = body
  if (!validMessages(messages)) {
    res.statusCode = 400
    res.end('Invalid messages')
    return
  }
  const ctx = (context && typeof context === 'object' ? context : {}) as Ctx
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')

  const apiKey = process.env.DEEPSEEK_API_KEY
  // Sin key → fallback determinista (demo). Con key → DeepSeek real.
  if (!apiKey) {
    res.statusCode = 200
    res.end(JSON.stringify({ reply: fallbackReply(lastUser, ctx), simulated: true }))
    return
  }

  try {
    const contextNote = `\n\nNÚMEROS DEL HOGAR (usa estos datos): ${JSON.stringify(ctx).slice(0, 600)}`
    const deepseekRes = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        max_tokens: 400,
        temperature: 0.5,
        messages: [{ role: 'system', content: SYSTEM_PROMPT + contextNote }, ...messages],
      }),
    })
    if (!deepseekRes.ok) throw new Error(`deepseek ${deepseekRes.status}`)
    const data = (await deepseekRes.json()) as { choices?: { message?: { content?: string } }[] }
    const reply = data.choices?.[0]?.message?.content?.trim() || fallbackReply(lastUser, ctx)
    res.statusCode = 200
    res.end(JSON.stringify({ reply, simulated: false }))
  } catch (err) {
    console.error('coach handler error:', err)
    // Degrada al fallback en vez de romper el chat
    res.statusCode = 200
    res.end(JSON.stringify({ reply: fallbackReply(lastUser, ctx), simulated: true }))
  }
}
