#!/usr/bin/env node
// Mechanical reference check over the AI layer: every backticked repo path, `npm run <script>`, "the `x` skill",
// "`x` agent / subagent" and, in the layer's own skills and hooks docs, `$x` must still resolve. A path counts as
// resolved when it exists, is a known per-machine path, or is gitignored outside the layer's folders.
// Read-only; always exits 0.
//
//   node .agents/skills/maintain-ai-layer/layer-refs.mjs [file-or-dir ...]
//
// No arguments: AGENTS.md, every *.md under .ai-layer/, .agents/ and .codex/ on disk, every .codex/agents/*.toml
// and every tracked or unignored *.md - outside a git repository the layer's own files alone.
// With arguments: only those (a directory is scanned for *.md and *.toml one level deep).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LAYER_DIRS = ['.codex', '.agents', '.ai-layer'];
const BUILT_IN_AGENTS = new Set(['default', 'explorer', 'worker']);
// PowerShell's own variables, which a hooks or skill doc may quote: never a skill name.
const SHELL_VARIABLES = new Set(['null', 'true', 'false', 'args', 'input', 'this', 'error', 'home', 'host', 'matches', 'profile', 'psscriptroot']);
// Only a span starting with one of these is read as a repo path. The project's other top-level folders go into
// .ai-layer/layer-refs-prefixes, one prefix per line (`packages/`), `#` for a comment: `init` writes that file.
const PREFIXES = ['<SRC_DIR>/', ...LAYER_DIRS.map((dir) => `${dir}/`), ...extraPrefixes()];
const SUFFIXES = ['', '.ts', '.tsx', '.mjs', '.js', '.json', '.md', '.toml', '/index.ts', '/index.tsx'];

function extraPrefixes() {
  try {
    return fs
      .readFileSync(path.join(ROOT, '.ai-layer', 'layer-refs-prefixes'), 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => (line.endsWith('/') ? line : `${line}/`));
  } catch {
    return [];
  }
}

const git = (...args) =>
  execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

const targets = () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    let tracked = [];
    try {
      tracked = git('ls-files', '--cached', '--others', '--exclude-standard', '*.md')
        .split('\n')
        .filter((f) => f && !f.includes('node_modules/'));
    } catch {
      console.log('layer-refs: git lists no files here (no repository, or git failed) - only the layer\'s own files are checked');
    }
    // A personal install keeps the layer out of the project's git, so it is read from disk.
    const fromDisk = (dir) =>
      fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
        const rel = `${dir}/${entry.name}`;
        if (entry.isDirectory()) return ['node_modules', '.git'].includes(entry.name) ? [] : fromDisk(rel);
        return entry.name.endsWith('.md') || /^\.codex\/agents\/[^/]+\.toml$/.test(rel) ? [rel] : [];
      });
    const layer = LAYER_DIRS.filter((dir) => fs.existsSync(path.join(ROOT, dir))).flatMap(fromDisk);
    return [...new Set(['AGENTS.md', ...layer, ...tracked])].map((f) => path.join(ROOT, f)).filter((f) => fs.existsSync(f));
  }
  return args.flatMap((arg) => {
    const full = path.resolve(ROOT, arg);
    if (!fs.existsSync(full)) return [];
    if (!fs.statSync(full).isDirectory()) return [full];
    return fs
      .readdirSync(full)
      .filter((f) => f.endsWith('.md') || f.endsWith('.toml'))
      .map((f) => path.join(full, f));
  });
};

const names = (dir, pick) => (fs.existsSync(dir) ? fs.readdirSync(dir).map(pick).filter(Boolean) : []);
const skills = new Set(names(path.join(ROOT, '.agents', 'skills'), (d) => d));
// An agent answers to the `name` its file declares, which need not be the file's name.
const agentsDir = path.join(ROOT, '.codex', 'agents');
const agents = new Set(
  names(agentsDir, (f) => {
    if (!f.endsWith('.toml')) return null;
    return /^name\s*=\s*["']([^"']+)["']/m.exec(fs.readFileSync(path.join(agentsDir, f), 'utf8'))?.[1] ?? f.slice(0, -5);
  })
);
const manifests = new Map();
const scriptsIn = (dir) => {
  if (!manifests.has(dir)) {
    let found = null;
    try {
      found = Object.keys(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).scripts ?? {});
    } catch {
      // No package.json in this folder, or one that does not parse.
    }
    manifests.set(dir, found);
  }
  return manifests.get(dir);
};
// `npm run x` is held to the nearest package.json at or above the file, then to the ones above it up to the root: a
// workspace's doc names its own package's scripts and the root's. A file outside the repo is held to the root's.
const scriptsFor = (file) => {
  const rel = path.relative(ROOT, path.dirname(file));
  const parts = rel.startsWith('..') || path.isAbsolute(rel) ? [] : rel.split(path.sep).filter(Boolean);
  const found = [ROOT, ...parts.map((_, i) => path.join(ROOT, ...parts.slice(0, i + 1)))].map(scriptsIn).filter(Boolean);
  return found.length ? new Set(found.flat()) : null;
};

const onDisk = (ref) => SUFFIXES.some((suffix) => fs.existsSync(path.join(ROOT, ref.replace(/\/$/, '') + suffix)));
// Paths that exist per machine or per run, or belong to the developer and may be absent.
const LOCAL_ONLY = /^\.ai-layer\/(?:handoff\.md|\.last-maintain|layer-refs-prefixes|check\.mjs)$|^\.codex\/config\.toml$/;
const inLayer = (ref) => LAYER_DIRS.some((dir) => ref.startsWith(`${dir}/`));
const ignored = (ref) => {
  try {
    execFileSync('git', ['-C', ROOT, 'check-ignore', '-q', '--no-index', ref], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};
// Inside the layer's folders only the known per-machine paths count: a personal install ignores every typo there.
const resolves = (ref) => onDisk(ref) || LOCAL_ONLY.test(ref) || (!inLayer(ref) && ignored(ref));

const cleanPath = (span) => {
  const ref = span
    .replace(/[.,;:)]+$/, '')
    .replace(/:\d+(-\d+)?$/, '')
    .replace(/#.*$/, '');
  if (!PREFIXES.some((p) => ref.startsWith(p))) return null;
  if (/[\s<>*{}$\\|()[\]]|\.\.\./.test(ref)) return null;
  // Compile probes exist only while a reviewer runs; Foo / Bar are placeholders in worked examples.
  if (/__hunt_probe|\/(Foo|Bar)(\/|$)/.test(ref)) return null;
  return ref;
};

let total = 0;
const files = targets();
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  // `$name` is a skill only in text this layer wrote: in a project's docs it is a variable or a framework's own name.
  const ownText = /^\.(?:agents|codex)\//.test(rel);
  const problems = [];
  const scripts = scriptsFor(file);
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      const at = `${i + 1}`;
      for (const [, span] of line.matchAll(/`([^`\n]+)`/g)) {
        const ref = cleanPath(span);
        if (ref && !resolves(ref)) problems.push(`${at}: path ${ref}`);
        const npm = span.match(/^npm run ([\w:-]*[\w-])(?![\w:<-])/);
        if (npm && scripts && !scripts.has(npm[1])) problems.push(`${at}: npm script ${npm[1]}`);
        const called = ownText && span.match(/^\$([a-z][a-z0-9-]{3,})(?:\s|$)/);
        if (called && !SHELL_VARIABLES.has(called[1]) && !skills.has(called[1])) problems.push(`${at}: skill ${called[1]}`);
      }
      for (const [, name] of line.matchAll(/the `([a-z][a-z0-9-]*)` skill/g)) {
        if (!skills.has(name)) problems.push(`${at}: skill ${name}`);
      }
      for (const [, name] of line.matchAll(/`([A-Za-z][\w-]*)` (?:sub)?agent\b/g)) {
        if (!agents.has(name) && !BUILT_IN_AGENTS.has(name)) problems.push(`${at}: agent ${name}`);
      }
    });
  if (problems.length) {
    console.log(`${rel}\n${problems.map((p) => `  ${p}`).join('\n')}`);
    total += problems.length;
  }
}
console.log(`layer-refs: ${files.length} files, ${total} unresolved references`);
