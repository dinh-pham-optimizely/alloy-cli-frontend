#!/usr/bin/env node

/**
 * Generate component script — wraps `alloy-cli-frontend generate` for AI agent tool use.
 *
 * Usage:
 *   node generate.js <name> --type <a|m|o> --prefix <prefix> [--style] [--script] [--state] [--page] [--story] [--data]
 *
 * Output: JSON GenerationResult to stdout
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`Usage: node generate.js <ComponentName> --type <a|m|o> --prefix <prefix> [options]

Options:
  --type <type>       Component type: a (atom), m (molecule), o (organism)
  --prefix <prefix>   CSS class prefix (e.g., xx)
  --style             Generate style file (.scss)
  --script            Generate script entry file (.entry.ts)
  --state             Generate state file (.states.json)
  --page              Generate page component
  --story             Use story template for page
  --data              Generate data file
  --help              Show this help message`);
  process.exit(0);
}

try {
  // Forward all arguments to alloy-cli-frontend generate with --json
  const cliArgs = args.join(' ');
  const result = execSync(`npx alloy-cli-frontend generate ${cliArgs} --json`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Output the JSON result
  process.stdout.write(result);
} catch (error) {
  const stderr = error.stderr ? error.stderr.toString() : '';
  const stdout = error.stdout ? error.stdout.toString() : '';

  // Try to extract JSON error from output
  try {
    const parsed = JSON.parse(stderr || stdout);
    console.error(JSON.stringify(parsed));
  } catch {
    console.error(JSON.stringify({ error: stderr || stdout || error.message }));
  }
  process.exit(1);
}
