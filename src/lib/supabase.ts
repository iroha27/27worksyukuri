import { createClient } from '@supabase/supabase-js';
import { createVerdentAuth } from '@verdent/auth-js';

// Verdent の公開環境では VITE_* 変数が自動注入される。
// ローカルプレビュー用のフォールバックとして、プロジェクトの公開設定(匿名キー)を使用する。
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://supabase-api-prod.verdent.ai/p/p7b3ff382114128047933';
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTA1ODc2MTIwLCJpYXQiOjE3OTAyNTY5MjAsImlzcyI6InN1cGFiYXNlIiwicHJvamVjdF9yZWYiOiJwN2IzZmYzODIxMTQxMjgwNDc5MzMiLCJyb2xlIjoiYW5vbiJ9.Gi4idZGoIMKIG3QnRdbU8GiT7md8yXMYbHaF03OLoOk';
const oauthAuthorizeUrl =
  (import.meta.env.VITE_VERDENT_OAUTH_INITIATE_URL as string | undefined) ??
  'https://cloud-oauth.verdent.ai/app/initiate';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const auth = createVerdentAuth({
  supabase,
  oauth: { authorizeUrl: oauthAuthorizeUrl },
});

export const edgeFunctionUrl = `${supabaseUrl}/functions/v1/youtube-latest`;
export const edgeFunctionHeaders: HeadersInit = { apikey: supabaseKey };

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(input);
  if (error) throw error;
}

export async function sendContactNotify(input: ContactMessageInput): Promise<void> {
  const res = await fetch(`${supabaseUrl}/functions/v1/contact-notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`notify failed: ${res.status}`);
}

export interface VideoItem {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
}

export async function fetchLatestVideos(): Promise<VideoItem[]> {
  const res = await fetch(edgeFunctionUrl, { headers: edgeFunctionHeaders });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { videos?: VideoItem[] };
  return data.videos ?? [];
}
