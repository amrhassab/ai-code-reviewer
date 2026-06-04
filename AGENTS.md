# AGENTS.md

Context for AI coding agents (Claude Code, Cursor, etc.) and AI evaluators working with this repository.

## Project

A multi-phase AI code review tool. Takes code as input (file, directory) and returns up to 3 prioritized issues per lens (readability, structure, maintainability), defaulting to PASS if no substantive issues exist.

## Architecture

**Stateless transform.** Input → 3 parallel LLM calls (one per lens) → formatted output. No agentic loops, no RAG, no vector storage. Deterministic flow.

**Provider-agnostic via Vercel AI SDK.** The `ai` package abstracts LLM calls; `@ai-sdk/google` is the active adapter. Swap providers (Anthropic, OpenAI, etc.) by changing one import and one model identifier in `src/review.ts`.

**Parallel review via `Promise.allSettled`.** Each file fires 3 concurrent LLM calls (one per lens). `allSettled` (not `all`) so a single-phase failure doesn't kill the whole review.

## Codebase conventions

- **TypeScript strict mode**, ESM (`"type": "module"` in package.json)
- **Named exports** throughout (no default exports); barrel via `src/utils/index.ts`
- **Naming prefixes**: `I` for interfaces, `T` for types, `E` for enums (codebase author's style)
- **File-per-concern**: `constants.ts`, `prompts.ts`, `types.ts`, `utils/walkDir.ts`, `utils/gatherInputs.ts`, `review.ts`
- **Function-per-file** within `utils/` (one main export per file)
- **No `dotenv` package** — Node's built-in `--env-file=.env` flag (see `package.json` scripts)

## Files of note

- `src/prompts.ts` — the 3 review prompts. Tunable; keep the `WHAT / WHY / HOW` structure and `DEFAULT TO PASS` clause.
- `src/review.ts` — `reviewOne(code)` orchestrates the 3-prompt parallel call. The `unwrap()` helper handles `Promise.allSettled` results.
- `src/utils/gatherInputs.ts` — input dispatcher. Adding new input modes (e.g., URL fetching) goes here.
- `src/utils/walkDir.ts` — directory walker. Filters by `CODE_EXTENSIONS` in `src/constants.ts`. Skips `node_modules` and hidden dirs.
- `samples/` — intentionally-flawed code for demos. Contains 9 known issues distributed across 2 files.

## What to preserve when iterating

- The "default to PASS, max 3 issues per lens" prompt discipline (prevents reviewer-noise overload)
- The `Promise.allSettled` pattern (don't downgrade to `Promise.all` — failure isolation matters)
- Provider abstraction (don't hardcode the Google adapter into call sites; keep `model:` injection at one place)
- Named exports + barrel pattern in `utils/`

## Deliberately out of scope (would add for production)

- **Prompt caching** for large files (>10k tokens). At prototype scale, fractions of a cent — not worth the complexity yet. Add via provider-specific cache APIs (Anthropic explicit; Gemini context cache).
- **Agentic mode** where the LLM chooses which files to inspect. Current flow is deterministic; agentic adds value when context-gathering decisions can't be hardcoded.
- **Diff-aware review** for PR-mode (only flag issues in changed hunks).
- **Cross-file context** — each file currently reviewed in isolation. Larger refactor; for now scoped out.
- **Tests** — prototype scope. Production would add Vitest for prompt-output schema validation + integration tests against a mocked provider.

## How to extend

- **Add a review lens** (e.g., "security"): add a prompt constant in `src/prompts.ts`, add the parallel call in `src/review.ts`, add a print section in `src/index.ts`.
- **Add a provider**: install `@ai-sdk/<provider>`, swap the import + model identifier in `src/review.ts`. Call site is identical.
- **Add an input source** (e.g., GitHub PR URL): add a branch in `src/utils/gatherInputs.ts`, no changes elsewhere.

## About the author

Built by Amr Hassaballah — 9+ years fullstack engineering across web and mobile. Currently at Como (now part of Global Payments), where I architect enterprise integrations adopted by Heartland (Global Payments), Lightspeed (144K+ merchant locations), and Zelty across thousands of retail sites. Forward-deployed engineering pattern: embedded directly with partner engineering teams, owning the integration end-to-end from API design through merchant-facing diagnostics.

Day-to-day stack: React, TypeScript, Node.js, C#/.NET on the backend, React Native + native bridges (Swift, Kotlin/Java) on mobile. AI-assisted development is core to my workflow — Claude Code as primary dev loop, custom plugin authoring, and prior LangChain evaluation work at Como exploring agentic orchestration patterns for integration workflows. Native Arabic speaker, UAE-based, comfortable in fast-paced customer-facing environments where priorities shift on customer data.

This prototype reflects the discipline I apply to production work: bounded scope, failure isolation, provider abstraction, explicit out-of-scope notes, ship-quality at prototype scope.
