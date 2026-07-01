import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type SupabaseKeyType = 'service_role' | 'anon' | 'publishable' | 'invalid' | 'missing';

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  mode: 'supabase' | 'memory';
  url: string | null;
  keyType: SupabaseKeyType;
  keySource: string | null;
  issues: string[];
  lastError: string | null;
}

function decodeJwtRole(key: string): 'service_role' | 'anon' | null {
  if (!key.startsWith('eyJ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
    if (payload.role === 'service_role') return 'service_role';
    if (payload.role === 'anon') return 'anon';
    return null;
  } catch {
    return null;
  }
}

function detectKeyType(key: string | undefined): SupabaseKeyType {
  if (!key) return 'missing';
  if (key.startsWith('sb_publishable_')) return 'publishable';
  if (!key.startsWith('eyJ')) return 'invalid';
  return decodeJwtRole(key) ?? 'invalid';
}

function resolveSupabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;

  const candidates: Array<{ source: string; value: string | undefined }> = [
    { source: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
    { source: 'SUPABASE_ANON_KEY', value: process.env.SUPABASE_ANON_KEY },
    { source: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { source: 'SUPABASE_KEY', value: process.env.SUPABASE_KEY },
    { source: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
  ];

  const selected = candidates.find(({ value }) => value && value.trim().length > 0);
  const key = selected?.value?.trim();
  const keySource = selected?.source ?? null;
  const keyType = detectKeyType(key);

  return { url: url?.trim() || null, key, keySource, keyType };
}

function buildStatus(
  partial: Pick<SupabaseStatus, 'configured' | 'connected' | 'mode' | 'url' | 'keyType' | 'keySource' | 'issues' | 'lastError'>
): SupabaseStatus {
  return { ...partial };
}

export function getSupabaseStatus(client: SupabaseClient | null, lastError: string | null = null): SupabaseStatus {
  const { url, key, keySource, keyType } = resolveSupabaseEnv();
  const issues: string[] = [];

  if (!url || url.includes('your-project-id') || url === 'MY_SUPABASE_URL') {
    issues.push('SUPABASE_URL is missing or still set to a placeholder value.');
  }

  if (keyType === 'missing') {
    issues.push('No Supabase API key found. Set SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY.');
  } else if (keyType === 'publishable') {
    issues.push(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_...) cannot be used for server-side API calls. Use SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY instead.'
    );
  } else if (keyType === 'invalid') {
    issues.push('The configured Supabase key is not a valid JWT API key.');
  } else if (keyType === 'anon') {
    issues.push(
      'Using the anon key on the server. For login and protected tables, prefer SUPABASE_SERVICE_ROLE_KEY to avoid RLS issues.'
    );
  }

  const configured = Boolean(
    client &&
    url &&
    key &&
    keyType !== 'missing' &&
    keyType !== 'publishable' &&
    keyType !== 'invalid'
  );

  return buildStatus({
    configured,
    connected: configured && !lastError,
    mode: configured ? 'supabase' : 'memory',
    url,
    keyType,
    keySource,
    issues,
    lastError,
  });
}

export function createSupabaseClient(): { client: SupabaseClient | null; status: SupabaseStatus } {
  const { url, key, keySource, keyType } = resolveSupabaseEnv();
  let lastError: string | null = null;

  if (!url || !key) {
    return {
      client: null,
      status: getSupabaseStatus(null),
    };
  }

  if (keyType === 'publishable' || keyType === 'invalid') {
    lastError = keyType === 'publishable'
      ? 'Publishable keys (sb_publishable_...) are not supported for server-side Supabase queries.'
      : 'Supabase API key format is invalid.';
    console.warn(`Backend: ${lastError} Falling back to in-memory data.`);
    return {
      client: null,
      status: getSupabaseStatus(null, lastError),
    };
  }

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const status = getSupabaseStatus(client);
    console.log(`Backend: Supabase client initialized (${keyType} key from ${keySource}).`);
    if (status.issues.length > 0) {
      console.warn('Backend Supabase warnings:', status.issues.join(' '));
    }
    return { client, status };
  } catch (err) {
    lastError = err instanceof Error ? err.message : 'Failed to create Supabase client.';
    console.error('Backend: Supabase initialization failed:', lastError);
    return {
      client: null,
      status: getSupabaseStatus(null, lastError),
    };
  }
}

export async function verifySupabaseConnection(client: SupabaseClient): Promise<string | null> {
  const { error } = await client.from('app_users').select('id').limit(1);
  if (!error) return null;

  if (error.code === 'PGRST116') {
    // Table exists but is empty — connection works.
    return null;
  }

  return error.message;
}
