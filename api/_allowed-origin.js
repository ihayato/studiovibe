// Origin must match exactly. Referer may contain a path, so parse it separately.
export function allowedRequestOrigin(headers, allowed) {
  const origin = typeof headers.get === 'function' ? headers.get('origin') : headers.origin;
  if (origin != null) return typeof origin === 'string' && allowed.includes(origin);
  const referer = typeof headers.get === 'function' ? headers.get('referer') : headers.referer;
  if (typeof referer !== 'string') return false;
  try {
    const url = new URL(referer);
    return !url.username && !url.password && allowed.includes(url.origin);
  } catch { return false; }
}
