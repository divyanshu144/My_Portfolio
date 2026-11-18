// Talks to POST /api/assistant and turns any reply (JSON, an HTML proxy error page, nothing) into one shape.
export const FALLBACK_ERROR = 'The assistant is unavailable right now. Please try again shortly.'

export async function readResponse(res) {
  let data = null
  try {
    const raw = await res.text()
    data = raw ? JSON.parse(raw) : null
  } catch { /* non-JSON body, such as a proxy's HTML error page */ }
  if (res.ok && data && typeof data === 'object') return { ok: true, data }
  const error = typeof data?.error === 'string' && data.error.trim() ? data.error : FALLBACK_ERROR
  return { ok: false, error }
}

// Never throws: a network failure (server down, offline) also comes back as { ok: false, error }.
export async function postAssistant(body) {
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await readResponse(res)
  } catch {
    return { ok: false, error: FALLBACK_ERROR }
  }
}
