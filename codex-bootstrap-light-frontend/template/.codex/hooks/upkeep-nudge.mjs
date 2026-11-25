#!/usr/bin/env node
// Says, at session start, when the AI-layer upkeep pass is overdue. `maintain-ai-layer` writes the date of its
// last run into .ai-layer/.last-maintain (committed with the layer in team mode, per machine in personal mode);
// nothing else reminds anyone to run it. Silent in a linked worktree, since the pass runs in the main tree and a
// second tree would otherwise be told so forever.
//
// Reports, never blocks. Exits 0 whatever happens.
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STAMP = '.ai-layer/.last-maintain';
const DUE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const BOM = 0xfeff;
// No variable carries the project root and the hook's cwd may be a subfolder: the root is where this file is installed.
const HOOK_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function inLinkedWorktree(root) {
  for (let dir = path.resolve(root); ; dir = path.dirname(dir)) {
    const git = await stat(path.join(dir, '.git')).catch(() => null);
    if (git) return git.isFile();
    if (path.dirname(dir) === dir) return false;
  }
}

async function lastRun(root) {
  const raw = await readFile(path.join(root, STAMP), 'utf8').catch(() => '');
  const text = raw.charCodeAt(0) === BOM ? raw.slice(1) : raw;
  const match = /^(\d{4})-(\d{2})-(\d{2})\b/.exec(text.trim());
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

try {
  // The payload is read so the pipe closes; nothing in it is needed.
  await readStdin();
  // CLAUDE_PROJECT_DIR is the variable the guard's suites already set; the self-test points this hook at a throwaway project with it.
  const root = process.env.CLAUDE_PROJECT_DIR || HOOK_ROOT;
  if (!(await inLinkedWorktree(root))) {
    const last = await lastRun(root);
    const days = last === null ? null : Math.floor((Date.now() - last) / DAY_MS);
    // -1 is a local date east of UTC written after midnight; further ahead is a mistyped stamp, which must not silence the nudge.
    const future = days !== null && days < -1;
    if (days === null || future || days >= DUE_DAYS) {
      const when =
        days === null
          ? `has no recorded run in this tree (${STAMP} is missing or unreadable)`
          : future
            ? `has a stamp dated in the future (${STAMP})`
            : `last ran ${days} days ago`;
      process.stdout.write(
        `${JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'SessionStart',
            additionalContext: `The AI-layer upkeep pass ${when}; it is due every ${DUE_DAYS} days. In your first reply, tell the user in one line that \`$maintain-ai-layer\` is due. Never start it unasked.`,
          },
        })}\n`
      );
    }
  }
} catch {
  // A session must start whatever this hook thinks.
}
process.exit(0);
