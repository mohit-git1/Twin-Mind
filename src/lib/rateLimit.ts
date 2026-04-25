interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimiter = new Map<string, RateLimitEntry>();

// Max 5 attempts per 15 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimiter.get(ip);

  if (!entry) {
    rateLimiter.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

// Cleanup interval to prevent memory leaks in long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimiter.entries()) {
    if (now > entry.resetAt) {
      rateLimiter.delete(ip);
    }
  }
}, WINDOW_MS);
