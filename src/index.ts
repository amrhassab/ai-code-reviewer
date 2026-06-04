import { gatherInputs } from './utils';
import { reviewOne } from './review';

// process.argv = ['node', 'script.ts', ...userArgs]. Slice off the first two.
const inputs = await gatherInputs(process.argv.slice(2));

if (inputs.length === 0) {
  console.error('No input. Usage:\n  npm run review -- path/to/file.ts\n  npm run review -- path/to/dir');
  process.exit(1);
}

console.log(`Reviewing ${inputs.length} file(s)...\n`);

// Sequential per file (avoids spawning 3*N concurrent calls and hitting rate limits).
// Each file's 3 reviews still run in parallel internally (in reviewOne).
// Classic spinner frames — rotates a bar character.
const SPINNER_FRAMES = ['|', '/', '-', '\\'];

for (const input of inputs) {
  console.log('═'.repeat(72));
  console.log(`📄 ${input.path}  (${input.content.length} chars)`);
  console.log('═'.repeat(72));

  // Animated spinner: \r resets cursor to start of line, we re-print each frame.
  const start = Date.now();
  let frame = 0;
  const ticker = setInterval(() => {
    process.stdout.write(`\rReviewing ${SPINNER_FRAMES[frame++ % SPINNER_FRAMES.length]}`);
  }, 100);

  const review = await reviewOne(input.content);

  clearInterval(ticker);
  // Overwrite the spinner line with the final status; trailing spaces clear any leftover chars.
  process.stdout.write(`\rReviewed in ${((Date.now() - start) / 1000).toFixed(1)}s     \n`);

  console.log('\n── READABILITY ──\n' + review.readability);
  console.log('\n── STRUCTURE ──\n' + review.structure);
  console.log('\n── MAINTAINABILITY ──\n' + review.maintainability);
  console.log('');
}
