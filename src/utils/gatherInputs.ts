import { readFile, stat } from 'node:fs/promises';
import { walkDir } from './walkDir';
import type { TCodeInput } from '../types';

// Turn CLI args into a uniform list of code inputs to review.
// - Arg is a file → read it (one input per file)
// - Arg is a dir  → walk it + read each code file (N inputs)
export async function gatherInputs(args: string[]): Promise<TCodeInput[]> {
  const results: TCodeInput[] = [];
  for (const arg of args) {
    const info = await stat(arg);
    if (info.isFile()) {
      results.push({ path: arg, content: await readFile(arg, 'utf8') });
    } else if (info.isDirectory()) {
      const files = await walkDir(arg);
      for (const f of files) {
        results.push({ path: f, content: await readFile(f, 'utf8') });
      }
    }
  }
  return results;
}
