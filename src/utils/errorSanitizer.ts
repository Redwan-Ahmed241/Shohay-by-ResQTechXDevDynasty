/**
 * ═══════════════════════════════════════════════════════════════
 * Shohay Error Sanitizer & Diagnostics Logger
 * 
 * Ensures end users never see raw database errors, stack traces,
 * internal file paths, or backend server errors. All full diagnostic
 * details are logged for development and server-side debugging.
 * ═══════════════════════════════════════════════════════════════
 */

// Patterns indicating internal leakages (traces, files, SQL, database internals)
const LEAKAGE_PATTERNS = [
  /traceback/i,
  /most recent call last/i,
  /file\s+["'].*["'],\s+line\s+\d+/i,
  /\bat\s+.*\([^)]*:\d+:\d+\)/i,
  /\bat\s+async\s+/i,
  /exception:\s+/i,
  /\b[a-zA-Z]+Error:\s+/i,

  // Database & SQL
  /\b(psycopg|asyncpg|sqlalchemy|sqlite|mongo|prisma|pgrst|postgrest)\b/i,
  /\b(sqlstate|pg_)/i,
  /duplicate key value violates unique constraint/i,
  /violates (foreign key|check|not-null) constraint/i,
  /relation ["'].*["'] does not exist/i,
  /column ["'].*["'] does not exist/i,
  /syntax error at or near/i,
  /deadlock detected/i,
  /could not connect to server/i,
  /\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|ALTER TABLE|DROP TABLE)\b/i,
  /supabase_admin/i,

  // Internal Paths
  /(\/app\/|\/home\/|\/usr\/|\/var\/|[a-zA-Z]:\\[^"'\s]+)/i,
  /(node_modules|site-packages)/i,
  /\.(py|ts|tsx|js|jsx)\b/i,

  // Raw HTML server errors
  /<!doctype html>/i,
  /<html.*>/i,
  /<body.*>/i,
  /<h1>.*<\/h1>/i,

  // Internal error jargon
  /internal server error/i,
  /bad gateway/i,
  /gateway timeout/i
];

/** Generic user-facing messages based on HTTP status codes. */
const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Invalid request. Please check your information and try again.',
  401: 'Your session has expired or is unauthorized. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested information or resource could not be found.',
  408: 'The request timed out. Please try again.',
  409: 'A conflicting record already exists. Please review your input and try again.',
  422: 'Some of the submitted information was invalid. Please check your entries.',
  429: 'Too many requests received. Please wait a moment before trying again.',
  500: 'An unexpected server error occurred. Our team has been notified. Please try again later.',
  502: 'The server is temporarily unreachable. Please try again in a few moments.',
  503: 'The service is currently undergoing maintenance. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.'
};

/**
 * Checks if a string contains internal technical details, file paths, or stack traces.
 */
export function containsTechnicalLeak(text: string): boolean {
  if (!text) return false;
  return LEAKAGE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Logs full, unsanitized error details for debugging (console and/or server telemetry).
 */
export function logErrorDetails(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.error(`[Shohay Error Diagnostics] [${timestamp}] [${context}]`, {
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...(metadata || {})
  });
}

/**
 * Sanitizes any raw error message before it is displayed in the user interface.
 * Returns a friendly, safe message without exposing internals.
 */
export function sanitizeErrorMessage(rawMessage: unknown, status?: number, defaultFallback?: string): string {
  const fallback =
    (status && STATUS_FALLBACKS[status]) ||
    defaultFallback ||
    'An unexpected error occurred. Please try again.';

  if (!rawMessage || typeof rawMessage !== 'string') {
    return fallback;
  }

  const trimmed = rawMessage.trim();

  // If the server answered 5xx, never show raw server-generated text to the user
  if (status && status >= 500) {
    return STATUS_FALLBACKS[status] || 'An unexpected server error occurred. Please try again later.';
  }

  // Check for any leaked stack traces, SQL, file paths, or HTML
  if (containsTechnicalLeak(trimmed)) {
    return fallback;
  }

  // If the message is unreasonably long (e.g. dumped JSON or stack trace text), return fallback
  if (trimmed.length > 250) {
    return fallback;
  }

  // Otherwise, it's a safe validation message (e.g., "Phone number must be 11 digits")
  return trimmed;
}

/**
 * Extracts a safe, user-friendly error string from any caught error.
 */
export function getSafeErrorText(err: unknown, defaultMessage?: string): string {
  if (!err) {
    return defaultMessage || 'An unexpected error occurred. Please try again.';
  }

  // Always record full diagnostic details server-side / console
  logErrorDetails('Unhandled Application Error', err);

  // Check for ApiError
  if (typeof err === 'object' && err !== null && 'status' in err && 'message' in err) {
    const apiErr = err as { status?: number; message?: string; rawMessage?: string };
    return sanitizeErrorMessage(apiErr.message, apiErr.status, defaultMessage);
  }

  if (err instanceof Error) {
    return sanitizeErrorMessage(err.message, undefined, defaultMessage);
  }

  if (typeof err === 'string') {
    return sanitizeErrorMessage(err, undefined, defaultMessage);
  }

  return defaultMessage || 'An unexpected error occurred. Please try again.';
}
