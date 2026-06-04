# AI Code Reviewer

A multi-phase AI-powered code review tool. Analyzes code through three independent lenses — **readability**, **structure**, and **maintainability** — and surfaces up to 3 prioritized issues per lens. Designed around senior-engineer review discipline: bounded scope, concrete suggestions, default-to-PASS.

## Quick start

**Prerequisites:** Node 18+ and a free Gemini API key (`https://aistudio.google.com/apikey` — takes 60 seconds, no credit card).

```bash
# 1. Clone + install
git clone git@github.com:amrhassab/ai-code-reviewer.git
cd ai-code-reviewer
npm install

# 2. Set your Gemini API key
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key_here" > .env

# 3. Run a demo (no input needed)
npm run demo:file    # review a single sample file
npm run demo:dir     # review the whole samples/ directory

# 4. Or run against your own code
npm run review -- path/to/file.ts
npm run review -- path/to/directory
```

The `samples/` directory contains two intentionally-flawed files (`userManager.js`, `loginForm.html`) carrying 9 total issues across the 3 review lenses — useful for seeing the tool exercise its full range without supplying your own code.

Expect ~3-5 seconds per file. Each file triggers 3 parallel LLM calls (one per lens).

## Stack

- **Node + TypeScript + tsx** runtime
- **Vercel AI SDK** (`ai`) — provider-agnostic LLM interface
- **Gemini 2.5 Flash** (`@ai-sdk/google`) as the demo provider
- **Provider swap = one line.** To use Claude / OpenAI / etc., install the relevant `@ai-sdk/*` adapter and change the `model:` argument in `src/review.ts`. Call site stays identical thanks to Vercel AI SDK's abstraction.

## Design

**Why 3 separate prompts (not one combined):**
Each prompt asks the model to wear ONE hat (readability / structure / maintainability). Combining them into a single mega-prompt causes attention dilution — the model rushes each section and quality drops. Separation also gives failure isolation: if one phase errors, the other two still ship via `Promise.allSettled`.

**Why parallel execution:**
The 3 reviews are independent (no data dependency). Firing them concurrently via `Promise.all`-style execution cuts wall-clock time ~3x at zero quality cost. Standard pattern for I/O-bound calls.

**Why "default to PASS" + bounded output:**
LLMs over-produce. Naive prompts get 30+ comments of nitpicks that overwhelm the human reviewer. The prompts here cap output at 3 issues per lens (ordered by severity) and bias the model toward outputting `PASS` on clean code rather than fabricating problems.

**Why provider-agnostic:**
The Vercel AI SDK abstraction means this tool isn't locked to Gemini. Swap to Claude for higher quality on subtle review tasks, or OpenAI for tooling integration, by changing one import. Avoids the vendor lock-in pattern.

**Notable simplifications (out of scope for this prototype, real production would add):**
- Prompt caching for large files (>10k tokens) to avoid duplicate input-token costs
- Agentic mode where the LLM picks which files to inspect next via tool calls
- Diff-aware review (only flag issues in changed hunks for PR mode)
- Cross-file context (currently each file is reviewed in isolation)

## Project structure

```
src/
  index.ts              # entry point + main loop
  review.ts             # 3-phase review with Promise.allSettled
  prompts.ts            # the 3 prompt templates
  constants.ts          # CODE_EXTENSIONS for directory walks
  types.ts              # TCodeInput
  utils/
    index.ts            # barrel export
    walkDir.ts          # recursive directory walker
    gatherInputs.ts     # file/dir → TCodeInput[] dispatcher
samples/                # intentionally-flawed sample code for demos
```

## License

MIT
