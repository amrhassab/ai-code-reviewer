import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { CODE_EXTENSIONS } from '../constants';

// Recursively walk a directory, return paths to code files only.
// Skips hidden folders (.git, .vscode) and node_modules to avoid noise + huge walks.
export async function walkDir(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const path = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkDir(path)));
    } else if (e.isFile() && CODE_EXTENSIONS.has(extname(e.name))) {
      out.push(path);
    }
  }
  return out;
}
