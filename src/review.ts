import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { READABILITY_PROMPT, STRUCTURE_PROMPT, MAINTAINABILITY_PROMPT } from './prompts';

// One Gemini call: given a prompt and code, return the model's text response.
// Uses XML tags to delimit code — provider-agnostic best practice (Anthropic recommends, Gemini handles fine).
async function runPrompt(prompt: string, code: string): Promise<string> {
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: `${prompt}\n\n<code>\n${code}\n</code>`,
  });
  return text;
}

// Unwrap a Promise.allSettled result: return the value if fulfilled, or an ERROR string if rejected.
const unwrap = (r: PromiseSettledResult<string>): string =>
  r.status === 'fulfilled' ? r.value : `ERROR: ${r.reason?.message ?? r.reason}`;

// Run all 3 reviews in parallel against the same code. Returns them as a named object.
// Uses Promise.allSettled so a failure in one phase doesn't lose the other two.
export async function reviewOne(code: string) {
  const results = await Promise.allSettled([
    runPrompt(READABILITY_PROMPT, code),
    runPrompt(STRUCTURE_PROMPT, code),
    runPrompt(MAINTAINABILITY_PROMPT, code),
  ]);
  return {
    readability: unwrap(results[0]!),
    structure: unwrap(results[1]!),
    maintainability: unwrap(results[2]!),
  };
}
