import { load, save } from '../storage';

const GROQ_KEY_STORAGE = 'config:groq_api_key';
const GROQ_MODEL_STORAGE = 'config:groq_model';

export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

export function getGroqApiKey(): string {
  const localKey = load<string>(GROQ_KEY_STORAGE, '');
  if (localKey && localKey.trim().length > 5) return localKey.trim();
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  return envKey ? envKey.trim() : '';
}

export function setGroqApiKey(key: string): void {
  save(GROQ_KEY_STORAGE, key.trim());
}

export function hasGroqApiKey(): boolean {
  return getGroqApiKey().length > 5;
}

export function getGroqModel(): string {
  return load<string>(GROQ_MODEL_STORAGE, DEFAULT_GROQ_MODEL);
}

export function setGroqModel(model: string): void {
  save(GROQ_MODEL_STORAGE, model.trim());
}

/**
 * Call Groq API via direct REST with blazing-fast LPU inference (500+ tokens/sec)
 */
export async function callGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('No Groq API Key configured.');
  }

  const model = getGroqModel();
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 1024,
      response_format: prompt.toLowerCase().includes('json') ? { type: 'json_object' } : undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Groq API');
  }
  return content;
}
