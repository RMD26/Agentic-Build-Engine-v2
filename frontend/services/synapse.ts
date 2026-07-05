import { SynapseConfig } from '../types';

// ---------------------------------------------------------------------------
// Vertex AI Generative Language types (subset used by SynapseAI)
// ---------------------------------------------------------------------------

interface Part {
  text: string;
}

interface Content {
  role: 'user' | 'model';
  parts: Part[];
}

interface GenerateContentRequest {
  contents: Content[];
  systemInstruction?: { parts: Part[] };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GenerateContentResponse {
  candidates?: Array<{
    content: Content;
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

// ---------------------------------------------------------------------------
// SynapseAI – drop-in LLM client
//
// Uses the existing vertex-ai-proxy-interceptor.js which transparently
// rewrites fetch calls to aiplatform.googleapis.com → /api-proxy on the
// local Node backend.  No additional dependencies are required.
// ---------------------------------------------------------------------------

const VERTEX_BASE = 'https://aiplatform.googleapis.com/v1/publishers/google/models';
export const DEFAULT_MODEL = 'gemini-2.0-flash';

export type ConversationTurn = { role: 'user' | 'model'; text: string };

export class SynapseAI {
  private readonly model: string;

  constructor(_config: SynapseConfig, model: string = DEFAULT_MODEL) {
    this.model = model;
  }

  /**
   * Single-turn or multi-turn content generation.
   * @param systemPrompt  Instruction injected as `systemInstruction`.
   * @param userMessage   The current user / task message.
   * @param history       Optional preceding conversation turns.
   */
  async generate(
    systemPrompt: string,
    userMessage: string,
    history: ConversationTurn[] = []
  ): Promise<string> {
    const url = `${VERTEX_BASE}/${this.model}:generateContent`;

    const contents: Content[] = [
      ...history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const body: GenerateContentRequest = {
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
    };

    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`SynapseAI request failed: ${response.status} ${response.statusText}`);
    }

    const data: GenerateContentResponse = await response.json();

    if (data.error) {
      throw new Error(`SynapseAI API error (${data.error.code}): ${data.error.message}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the first valid JSON array from an LLM text response.
 * Handles both bare JSON and markdown-fenced blocks.
 */
export function extractJsonArray<T>(text: string): T[] | null {
  const trimmed = text.trim();

  // 1. Bare JSON array
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed) as T[]; } catch { /* fall through */ }
  }

  // 2. Markdown code fence  ```json … ``` or ``` … ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) as T[]; } catch { /* fall through */ }
  }

  // 3. First [ … ] block anywhere in the text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]) as T[]; } catch { /* fall through */ }
  }

  return null;
}
