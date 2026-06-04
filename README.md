# AI Code Reviewer

A multi-phase AI-powered code review tool. Analyzes code through three independent lenses — **readability**, **structure**, and **maintainability** — and synthesizes actionable feedback prioritized by impact.

## Why this exists

Most AI code review tools either dump 30+ comments (overwhelming the author) or give vague platitudes ("consider refactoring"). This tool is designed around senior-engineer review discipline: bounded scope, concrete suggestions, priority-ordered feedback.

## Stack

- **Node + TypeScript + tsx** runtime
- **Vercel AI SDK** (`ai`) — provider-agnostic LLM interface
- **Gemini** (`@ai-sdk/google`) as the demo provider; swappable to Claude / OpenAI / others via single-line config change

## Quick start

```bash
npm install

# Set your provider key
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key_here" > .env

npm run start < path/to/code-snippet.ts
```

## Design

(Detailed design notes coming after the prototype lands.)

## License

MIT
