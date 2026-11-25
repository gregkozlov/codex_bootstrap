// Self-test for upkeep-nudge.mjs. Each case is a throwaway project in the temp directory, never this tree.
// Run from anywhere:
//   node .codex/hooks/tests/upkeep-nudge-test.mjs
// Every case line must read "ok"; the last line counts them.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hook = join(here, '..', 'upkeep-nudge.mjs');
const scratch = mkdtempSync(join(tmpdir(), 'upkeep-nudge-'));
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// [name, the stamp's text or null for none, whether .git is a file (a linked worktree), the expected output]
const cases = [
  ['no stamp (nudge)', null, false, /has no recorded run/],
  ['stamp from today (silent)', `${daysAgo(0)}\n`, false, null],
  ['stamp 29 days old (silent)', `${daysAgo(29)}\n`, false, null],
  ['stamp 30 days old (nudge)', `${daysAgo(30)}\n`, false, /last ran 30 days ago/],
  ['unreadable stamp (nudge)', 'last week\n', false, /has no recorded run/],
  ['stamp 30 days ahead (nudge)', `${daysAgo(-30)}\n`, false, /dated in the future/],
  ['stamp dated tomorrow (silent)', `${daysAgo(-1)}\n`, false, null],
  ['BOM, CRLF and trailing text (silent)', `${String.fromCharCode(0xfeff)}${daysAgo(2)} deep\r\n`, false, null],
  ['linked worktree, no stamp (silent)', null, true, null],
];

let failed = 0;
const run = (name, project, payload, want) => {
  const r = spawnSync(process.execPath, [hook], { input: payload, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: project } });
  const out = (r.stdout ?? '').trim();
  const ok = r.status === 0 && (want ? want.test(out) && JSON.parse(out).hookSpecificOutput?.hookEventName === 'SessionStart' : out === '');
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(40)} exit ${r.status}  ${out.slice(0, 70)}`);
};
try {
  cases.forEach(([name, stamp, worktree, want], index) => {
    const project = join(scratch, String(index));
    mkdirSync(join(project, '.ai-layer'), { recursive: true });
    if (worktree) writeFileSync(join(project, '.git'), 'gitdir: elsewhere\n');
    else mkdirSync(join(project, '.git'));
    if (stamp !== null) writeFileSync(join(project, '.ai-layer', '.last-maintain'), stamp);
    run(name, project, '{}', want);
  });
  run('the line names the skill as $maintain-ai-layer', join(scratch, '0'), '{}', /`\$maintain-ai-layer` is due/);
  // As a session runs it: no variable set, started in a subfolder. The hook must find the project by its own
  // location - a copy installed into a throwaway project, first with a fresh stamp, then with none.
  const project = join(scratch, 'installed');
  const installed = join(project, '.codex', 'hooks', 'upkeep-nudge.mjs');
  mkdirSync(dirname(installed), { recursive: true });
  mkdirSync(join(project, '.ai-layer'));
  mkdirSync(join(project, '.git'));
  mkdirSync(join(project, 'app'));
  copyFileSync(hook, installed);
  const { CLAUDE_PROJECT_DIR: ignored, ...bareEnv } = process.env;
  const asInstalled = (name, want) => {
    const payload = JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup', cwd: join(project, 'app') });
    const r = spawnSync(process.execPath, [installed], { input: payload, encoding: 'utf8', cwd: join(project, 'app'), env: bareEnv });
    const out = (r.stdout ?? '').trim();
    const ok = r.status === 0 && (want ? want.test(out) : out === '');
    if (!ok) failed += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(40)} exit ${r.status}  ${out.slice(0, 70)}`);
  };
  writeFileSync(join(project, '.ai-layer', '.last-maintain'), `${daysAgo(0)}\n`);
  asInstalled('installed, cwd a subfolder (silent)', null);
  rmSync(join(project, '.ai-layer', '.last-maintain'));
  asInstalled('installed, stamp removed (nudge)', /has no recorded run/);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
const total = cases.length + 3;
console.log(`${total - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
