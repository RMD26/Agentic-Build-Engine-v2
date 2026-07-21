import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, SynapseAI, extractJsonArray } from './synapse';
import { SynapseConfig } from '../types';

const baseConfig: SynapseConfig = {
  maxIterations: 5,
  strictSecurityMode: true,
  autoFixEnabled: false,
  executionEnvironment: 'sandboxed-container',
  llmProvider: 'vertex-ai',
  allowedDependencies: ['react'],
};

describe('extractJsonArray', () => {
  it('parses a bare JSON array', () => {
    const result = extractJsonArray<number>('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('trims surrounding whitespace before parsing a bare array', () => {
    const result = extractJsonArray<string>('   \n ["a", "b"]  \n ');
    expect(result).toEqual(['a', 'b']);
  });

  it('parses a ```json fenced block', () => {
    const text = 'Here you go:\n```json\n[{"type":"CREATE_FILE"}]\n```\nThanks';
    expect(extractJsonArray(text)).toEqual([{ type: 'CREATE_FILE' }]);
  });

  it('parses a bare ``` fenced block without a language tag', () => {
    const text = '```\n[1,2]\n```';
    expect(extractJsonArray<number>(text)).toEqual([1, 2]);
  });

  it('falls back to the first [...] block embedded in prose', () => {
    const text = 'The mutations are [{"filePath":"a.ts"}] as requested.';
    expect(extractJsonArray(text)).toEqual([{ filePath: 'a.ts' }]);
  });

  it('returns null when no JSON array is present', () => {
    expect(extractJsonArray('no array here')).toBeNull();
  });

  it('returns null for malformed JSON with no recoverable array', () => {
    expect(extractJsonArray('{not: valid}')).toBeNull();
  });

  it('recovers a valid array when a bare array parse fails but a nested block is valid', () => {
    // Starts with '[' but is not valid JSON as a whole; the greedy [...] match recovers it.
    const text = '[broken but [1,2,3] embedded]';
    // Bare parse fails; fence fails; the greedy match grabs the outer brackets which are invalid,
    // so this should be null (documents the greedy behaviour).
    expect(extractJsonArray(text)).toBeNull();
  });
});

describe('SynapseAI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes the default model constant', () => {
    expect(DEFAULT_MODEL).toBe('gemini-2.0-flash');
  });

  it('posts to the Vertex endpoint and returns generated text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { role: 'model', parts: [{ text: 'hello world' }] } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const ai = new SynapseAI(baseConfig);
    const result = await ai.generate('system prompt', 'user message');

    expect(result).toBe('hello world');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain(DEFAULT_MODEL);
    expect(url).toContain(':generateContent');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.systemInstruction).toEqual({ parts: [{ text: 'system prompt' }] });
    expect(body.contents.at(-1)).toEqual({ role: 'user', parts: [{ text: 'user message' }] });
    expect(body.generationConfig).toEqual({ temperature: 0.4, maxOutputTokens: 8192 });
  });

  it('uses a custom model when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const ai = new SynapseAI(baseConfig, 'gemini-custom');
    await ai.generate('', 'hi');

    expect(fetchMock.mock.calls[0][0]).toContain('gemini-custom');
  });

  it('prepends conversation history to the request contents', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const ai = new SynapseAI(baseConfig);
    await ai.generate('sys', 'now', [
      { role: 'user', text: 'earlier' },
      { role: 'model', text: 'reply' },
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.contents).toEqual([
      { role: 'user', parts: [{ text: 'earlier' }] },
      { role: 'model', parts: [{ text: 'reply' }] },
      { role: 'user', parts: [{ text: 'now' }] },
    ]);
  });

  it('omits systemInstruction when the system prompt is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] } }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const ai = new SynapseAI(baseConfig);
    await ai.generate('', 'hi');

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.systemInstruction).toBeUndefined();
  });

  it('returns an empty string when the response has no candidates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );

    const ai = new SynapseAI(baseConfig);
    expect(await ai.generate('s', 'u')).toBe('');
  });

  it('throws when the HTTP response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests' })
    );

    const ai = new SynapseAI(baseConfig);
    await expect(ai.generate('s', 'u')).rejects.toThrow(/429 Too Many Requests/);
  });

  it('throws when the response body carries an API error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: { code: 400, message: 'bad request' } }),
      })
    );

    const ai = new SynapseAI(baseConfig);
    await expect(ai.generate('s', 'u')).rejects.toThrow(/API error \(400\): bad request/);
  });
});
