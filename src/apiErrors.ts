import type { Response } from 'express';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'AUTH_FAILED'
  | 'SESSION_ERROR'
  | 'SUPABASE_NOT_CONFIGURED'
  | 'SUPABASE_CONFIG_ERROR'
  | 'SUPABASE_CONNECTION_ERROR'
  | 'SUPABASE_QUERY_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND';

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  hint?: string;
  details?: string;
}

export function sendError(res: Response, status: number, body: ApiErrorBody) {
  return res.status(status).json(body);
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}

export function isSupabaseNetworkError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('fetch failed') ||
    lower.includes('network') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('timeout') ||
    lower.includes('failed to fetch')
  );
}

export function isSupabaseAuthError(message: string, code?: string): boolean {
  if (code === 'PGRST301' || code === '401' || code === '403') return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('invalid api key') ||
    lower.includes('jwt') ||
    lower.includes('unauthorized') ||
    lower.includes('permission denied')
  );
}

export function isSupabaseTableError(message: string, code?: string): boolean {
  if (code === 'PGRST116' || code === '42P01') return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('does not exist') ||
    lower.includes('could not find the table') ||
    lower.includes('relation') && lower.includes('does not exist')
  );
}
