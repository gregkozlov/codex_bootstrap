# Codex working layer - light, for a frontend

A small working layer for OpenAI Codex in a codebase with a UI: a six-step task lifecycle, one reviewer, a guard hook, path-scoped rules and a monthly upkeep pass. Terms: [Glossary](#glossary).

> [!IMPORTANT]
> Run the install in Codex at **high reasoning effort**, in a session started at your project's root **with full access** - `codex --sandbox danger-full-access`, or the app's full-access mode: the install writes into `.codex/`, `.agents/` and `.git/info/exclude`, which Codex's default sandbox keeps read-only, and reads this folder, which lies outside the project. Then paste this prompt, with the path filled in:

```text
Integrate the Codex working layer I unpacked at <path to this folder> into this project.

1. Read INSTALL.md in that folder first and follow it - it covers a first install and an update of a layer installed earlier.
2. Never overwrite what this project already has (AGENTS.md, anything under .codex/ or .agents/, another tool's files): merge it or leave it, and say what happened to each file.
3. Read every value the layer needs from this repo; ask me in chat only what the repo cannot answer.
4. Change files only - no commits, no pushes.
5. Finish with the report INSTALL.md asks for, then tell me to start a new session, review the hooks and run $maintain-ai-layer init.
```

> [!NOTE]
> **Requirements**
> - **Codex** - the CLI or the desktop app - recent enough for project hooks (`.codex/hooks.json`), custom agents (`.codex/agents/*.toml`) and skills in `.agents/skills/`.
> - **Node 18 or later.** The hooks are Node scripts: without `node` on PATH they do not run.
> - **A git repository.** The hooks find the project through git; the install refuses a folder that is not one.

## Install

1. Download this repository (Code > Download ZIP, or `git clone`) and unpack it **outside** your project. You need one folder of it: `codex-bootstrap-light-frontend`.
2. Start Codex at the repository root of your project as the box above says, and paste the prompt.
3. The install first asks where the layer lives in git (below), then asks only what the repo cannot answer - usually the check command and whether "never commit" stays.
4. When it is done, start a new session in your usual access mode. **Trust the project and review the hooks** (`/hooks` in the CLI; in the app Settings > Hooks, then "Trust all" for the project), and start a new thread. Codex does not ask you to: it silently skips a hook nobody reviewed, and until then only the plain git verbs of `.codex/rules/git.rules` are refused. To check, ask Codex to run `cd .` - "Blocked by .codex/hooks/guard.mjs" means the guard is live.
5. Run `$maintain-ai-layer init`. It writes the project sections of `AGENTS.md`, builds path rules from your code and tunes the reviewer's attack angles to the project.

The same prompt updates a layer installed from an older version of this bootstrap, keeping its mode. An update cannot overwrite the hooks from inside a session - the layer's own guard protects them - so it prepares the new files and gives you the copy commands to run.

**Where the layer lives**

| Mode | What you get |
| --- | --- |
| **Personal** (recommended) | `AGENTS.md`, `.codex/`, `.agents/` and `.ai-layer/` listed in `.git/info/exclude`: yours alone, no tracked file of the project touched. It has no history; `git clean -x` or `git stash -a` can delete it, and a new `git worktree` does not get it. |
| **Team** | committed with the project: everyone who runs Codex in the repo gets it |

If git already tracks a root `AGENTS.md`, personal mode is not possible: the install stops and offers team mode.

> [!WARNING]
> In team mode the rules apply to everyone who runs Codex in the repo - agree it with the team first. The install makes the layer committable but commits nothing.

## What a task looks like

You ask for a change in plain words, with screenshots if you have them. Then:

1. Codex reads the code, names the task's class (spike, bounded, contract change, bug) and asks what is unclear.
2. A contract change is planned first, and `hunt` reviews the plan before you approve it.
3. Before the first edit, Codex lists every consumer of what it will change.
4. It implements and runs your check command once. The first patch to a file a path rule covers is refused once, with the rule to read - that is the layer handing the rule over.
5. `hunt` reviews the diff. Codex checks each finding and accepts or rejects it with a reason.
6. It searches the docs for what changed; `drift` runs only when a doc names it.
7. It closes with what stays unverified, the decisions it took for you and three commit subjects. You commit.

A bug report starts with the `debug` skill (reproduce, gather evidence, name the cause) and then follows the same steps.

## What it costs

**In short:** a trivial edit spawns no agent, a normal task 1-2 (at most 5), and the monthly upkeep about 38. That upkeep run is the largest single bill the layer asks for - start it when your usage window has room.

There are two bills. **`AGENTS.md` is paid on every turn**: the template is about 17 KB, and its budget is 20 KB (roughly 5k tokens). **An agent spawn is paid once**, so it is the expensive unit. The table counts spawns per task.

| Task | Agent spawns | Which |
| --- | --- | --- |
| Super-trivial edit (one file, obvious, low risk) | 0 | none |
| Bounded change (known files, one surface) | usually 1, at most 4 | `hunt` on the diff; extras below |
| Contract change (planned first) | usually 2, at most 5 | `hunt` on the plan and on the diff; extras below |
| Bug fix | as its class above | `debug` and the gap check (the one rule line the bug shows no doc had) run in the main thread |
| Any task under "no subagents" | 0 | the main thread does every step itself |

The extras, each at most once: a second `hunt` round when a fix is itself non-trivial, `drift` when a doc names what changed, an `explorer` when step 1 must sweep an unfamiliar area.

| Agent | Model | Effort | Set where |
| --- | --- | --- | --- |
| `hunt` | the session's | high | `.codex/agents/hunt.toml` |
| `drift` | the session's | high | `.codex/agents/drift.toml` |
| `explorer`, `default` (built in) | the session's | high | asked for on every spawn the layer makes |

No agent pins a model: each runs on the model your session runs on, so a cheaper model for the session is a cheaper review too.

**Upkeep is the big spawn bill**, and nothing runs until you type the command.

| Run | When | Spawns |
| --- | --- | --- |
| the install | once | none - it runs in the main thread |
| `init` | once after the install, again when the project has moved on | 4 survey agents (3 `explorer`, 1 `default` on the fix history). With no rules yet, 1 `default` per area of up to ~250 source files, 1 for root config and 1 per rule family (a rule and the sibling rules split off it). About 14 for a 1,000-file project. |
| `deep` (the default once `AGENTS.md` has no `[fill]` line left; until then a bare `$maintain-ai-layer` runs `init`) | about once a month - a session-start reminder tells you when | 1 `drift` per unit: 14 `AGENTS.md` sections, each rule, the angles file, 2 agents, 4 skills, the hooks README, each README in the source tree. Then 1 `default` per rule family, 4 for new-rule search, 2 for a workflow walk. About 38 with five rules. |
| `rules` | when you ask | 1 `drift` per rule, 1 `default` per rule family, 4 for new-rule search |

To spend less:

- Keep `AGENTS.md` lean. Detail that only some files need goes into `.ai-layer/rules/<name>.md` with a `paths:` list, which reaches a session only when it patches a matching file.
- Say "no subagents" for a task you will review yourself; the steps still run, in the main thread.
- Run daily work at a lower reasoning effort if you like - the layer's own agents ask for high by themselves.

## When a hook stops you

> [!TIP]
> The `guard` hook refuses a tool call that breaks a rule, and its message says which rule and why.
> - **Read the reason first.** Most messages also name the form to retry with, such as absolute paths instead of `cd`, or `apply_patch` instead of `sed -i`. Codex should retry that way by itself.
> - **"Path rules apply to ..."** is not a fault: read the rule file it names; the same patch then passes.
> - **When the command is yours to run** - a commit, a push, a delete the layer refuses - run it in your own terminal.
> - **To switch a rule off** for the whole project, `.codex/hooks/README.md` "Switching a rule off" lists every place it lives. Those edits are yours: a session cannot change the hooks. The plain-hyphen rule has no off-switch.

## What is in it

| Part | What it does |
| --- | --- |
| `AGENTS.md` | the working rules, the six-step lifecycle and `[fill]` sections that `init` writes for your project |
| `hunt` agent | the one reviewer: runtime defects only, each with a concrete failure scenario, on the plan and on the diff |
| `drift` agent | the doc checker: re-checks every doc claim a change touches and returns exact replacements |
| `guard.mjs` hook | refuses commits and pushes, shell writes into the tree, `cd`, protected paths and dashes; keeps the reviewers read-only; hands over path rules; runs locally, no tokens |
| `git.rules` | Codex command rules forbidding the banned git verbs - a second line behind the guard |
| `upkeep-nudge.mjs` hook | at session start, says once when the monthly upkeep is due; silent otherwise |
| `.ai-layer/` | what the layer writes while it works: your path rules, the reviewer's attack angles, settled findings, the hand-off file, the upkeep stamp |
| `debug` skill | root cause before any fix, for every defect report |
| `handoff` skill | writes `.ai-layer/handoff.md` before a context compaction, a new session or a usage window running out |
| `retro` skill | only from `$retro`: what went badly in a task and the cheapest fix for each |
| `maintain-ai-layer` skill | the upkeep: `deep`, `rules` and `init` |

This layer is a port of a Claude Code layer with the same lifecycle; the two can live in one repository side by side and share no file.

## Verify

After the install, and after any edit to a hook, run these from the project root:

```text
node .codex/hooks/tests/guard-test.mjs
node .codex/hooks/tests/guard-shell-test.mjs
node .codex/hooks/tests/upkeep-nudge-test.mjs
node .agents/skills/maintain-ai-layer/layer-refs.mjs
```

Each case line reads `ok` and each suite ends with `N passed, 0 failed`. `layer-refs` lists each path, script, skill or agent name in the docs that does not resolve. The suites prove the scripts; that the hooks actually run in your sessions is the hook review's business (`/hooks`).

## Glossary

| Term | Meaning |
| --- | --- |
| lifecycle | the six steps every non-trivial task runs, in `AGENTS.md` "Development Workflow" |
| `hunt` | the review agent; it looks for runtime defects in a plan or a diff |
| `drift` | the doc-check agent; it finds doc statements a change made false |
| reachability bar | a defect counts only when one real user reaches it in ordinary work, with a stated click path |
| Not pursued | the one-line list for borderline cases: no severity, no fix, no extra round |
| `[fill]` | a project-specific part of a template file, written by `$maintain-ai-layer init` |
| path rule | a `.ai-layer/rules/*.md` file with a `paths:` list; the guard refuses the first patch to a matching file once per session and names the rule to read |
| rule reach | the set of files a rule's globs match, measured with `git ls-files` and the guard's `--rules-for` |
| fence | the guard's per-agent write limit: it refuses the patches and shell writes of `drift` and the built-in `explorer` anywhere in the project, and `hunt`'s everywhere but one compile-probe file this layer never uses |

How the layer is built, what it measured about Codex and what it drops against its Claude Code original: [MAINTAINERS.md](MAINTAINERS.md).
