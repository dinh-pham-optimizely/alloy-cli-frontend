#!/usr/bin/env node

/**
 * Scan models script — wraps `alloy-cli-frontend scan` for AI agent tool use.
 *
 * Usage:
 *   node scan.js [--type-directory <dir>]
 *
 * Output: JSON ModelRegistry to stdout
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);

try {
  const cliArgs = args.length > 0 ? args.join(' ') : '';
  const result = execSync(`npx alloy-cli-frontend scan ${cliArgs} --json`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  process.stdout.write(result);
} catch (error) {
  const stderr = error.stderr ? error.stderr.toString() : '';
  const stdout = error.stdout ? error.stdout.toString() : '';

  try {
    const parsed = JSON.parse(stderr || stdout);
    console.error(JSON.stringify(parsed));
  } catch {
    console.error(JSON.stringify({ error: stderr || stdout || error.message }));
  }
  process.exit(1);
}
