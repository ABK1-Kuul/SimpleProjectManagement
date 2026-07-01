export interface ApiErrorBody {
  error: string;
  code?: string;
  hint?: string;
  details?: string;
}

export function formatApiError(data: Partial<ApiErrorBody> | null | undefined, fallback: string): string {
  if (!data) return fallback;

  const parts = [data.error, data.hint, data.details].filter(
    (part): part is string => Boolean(part && part.trim())
  );

  return parts.length > 0 ? parts.join(' — ') : fallback;
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody;
    return formatApiError(data, fallback);
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}
