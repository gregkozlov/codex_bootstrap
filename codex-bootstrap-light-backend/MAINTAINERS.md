# Maintaining the light backend layer for Codex

For whoever changes this bootstrap. An adopter needs only `README.md`; the model installing it reads `INSTALL.md`. Everything the light frontend layer's [MAINTAINERS.md](../codex-bootstrap-light-frontend/MAINTAINERS.md) records about Codex itself - "Measured", "The live run", "The switch in `guard.mjs`", the decisions taken before the port - holds here too and is not repeated; this file records what the backend adds.

## What it is built from

- It is a port of the Claude Code layer `claude-bootstrap-light-backend` in [claude_bootstrap](https://github.com/gregkozlov/claude_bootstrap), built from that repository's commit `a9126bd`, **over the Codex light frontend layer**: what the two Claude light layers share byte for byte, the two Codex layers share too; what the Claude backend layer changes against its frontend twin is ported by meaning onto the Codex light frontend file. Always from a commit, never from a working tree or from the project the bootstraps came from.
- **A fix the Claude layer also needs is made there first** and arrives here as a copy; a Codex-only fix stays here and is listed in this file.
- The layer spans the same four places as the light frontend one: the root `AGENTS.md`, `.codex/`, `.agents/skills/` and `.ai-layer/`.

## The three file lists

Paths on the right are under `template/`. `cmp` proves each line; run it before publishing.

**Identical to the Claude layer** (`claude-bootstrap-light-backend/template/.claude/...` at the commit above):

| Claude layer | Here |
| --- | --- |
| `hooks/guard.mjs` | `.codex/hooks/guard.mjs` |
| `hooks/tests/guard-test.mjs` | `.codex/hooks/tests/guard-test.mjs` |
| `hooks/tests/guard-shell-test.mjs` | `.codex/hooks/tests/guard-shell-test.mjs` |
| `hooks/backend-guard.mjs` | `.codex/hooks/backend-guard.mjs` |
| `hooks/tests/backend-guard-test.mjs` | `.codex/hooks/tests/backend-guard-test.mjs` |
| `skills/maintain-ai-layer/references/settled.md` | `.ai-layer/settled.md` |

**Identical to the Codex light frontend layer**: `.codex/hooks/guard.mjs`, `.codex/hooks/tests/guard-test.mjs`, `.codex/hooks/tests/guard-shell-test.mjs`, `.ai-layer/settled.md`, `.codex/hooks/upkeep-nudge.mjs`, `.codex/hooks/tests/upkeep-nudge-test.mjs`, `.agents/skills/maintain-ai-layer/layer-refs.mjs`, `.agents/skills/handoff/SKILL.md`, `.agents/skills/retro/SKILL.md` with its `agents/openai.yaml`, `.codex/rules/git.rules`, `.ai-layer/rules/.gitkeep`.

**Forked**: none of its own. The three forks the light frontend layer lists (`upkeep-nudge.mjs`, its suite, `layer-refs.mjs`) are copied from there unchanged; a change to the Claude original is ported by hand into that layer first, then copied here.

Everything else is a rewrite and has no byte contract.

## What maps to what

| Claude light backend | Here | How |
| --- | --- | --- |
| `CLAUDE.md` | `AGENTS.md` | rewrite: the Codex light frontend `AGENTS.md` plus the backend's delta - the server's reachability bar, "Data, secrets and the outside world" (no Read or Grep tool, so a search is `git grep`; what the Claude hook asks about the Codex hook **refuses**; the sandbox rule below), an interactive database client or console beside the interactive shell, the command-chain script rule, the `[fill]` Tests, Data and migrations, Configuration and environments sections, the backend lifecycle wording (a contract is an endpoint, a schema, a payload, a config key; step 3 exercises the changed path locally and names what the sandbox stops; step 6 names what the owner must do by hand), the skip rule's never-trivial list. "Never start or stop the dev server" became "never stop a service or container you did not start". The liveness check gained a second call, `Get-Content .env.layer-probe`, which only `backend-guard.mjs` refuses: trust is kept per hook, and an edited project list leaves that hook alone unreviewed. The section names "Shell and file edits", "Data, secrets and the outside world" and "Punctuation" are cited by the guards' refusals and must not be renamed. |
| `settings.json` `hooks` | `.codex/hooks.json` | redesign: the light frontend file plus a second `PreToolUse` entry, matcher `Bash\|apply_patch`, for `backend-guard.mjs`. No `Read` / `Grep` matcher: Codex has no such caller. |
| `permissions.deny` / `allow` | `.codex/rules/git.rules` | the light frontend file; the allow list (`unzip -p` and the suite calls included) is dropped - a read needs no grant, and `allow` means "run outside the sandbox". |
| `agents/hunt.md` | `.codex/agents/hunt.toml` + `.ai-layer/hunt-angles.md` | rewrite in the light frontend TOML shape; the server angles move to the angles file (5.7 KB of its 6 KB budget). The `-sources.jar` read stays (`unzip -p`, or `tar -xOf` where `unzip` is missing). |
| `agents/drift.md` | `.codex/agents/drift.toml` | rewrite: the light frontend TOML plus the backend delta (API descriptions, environment variables, no recursive search, the Gaps note) and the 24 KiB budget. |
| `skills/debug` | `.agents/skills/debug/SKILL.md` | rewrite: the backend's request-to-response boundaries, local reproduction only; with no `run_in_background`, a local instance is one the developer started, or a test that starts and stops what it needs; a run the sandbox stops is the developer's, and their output is the observation. |
| `maintain-ai-layer/SKILL.md`, `references/deep.md`, `references/rules.md` | same, under `.agents/skills/` | the light frontend files plus the backend delta: the three hook lists reported with the exact entry, the frozen migrations never edited, the check command run only when what it needs is up and the sandbox lets it, the server examples. `deep.md` keeps the light frontend's M1-M4 / D1-D6 numbering. |
| `references/init.md` | same | rewrite: the backend's five-agent survey (four `explorer`, one `default`), data, configuration and deploy manifests, the one question always asked (where the local env file points), stale hook lists reported in I4. |
| `hooks/README.md` | `.codex/hooks/README.md` | rewrite: the light frontend README plus the backend section in its Codex form - refusal where the other form asks, the "only under Codex" refusals, the patch forms, the project lists, the four suites, the switches. |
| `rules/.gitkeep`, `references/settled.md`, `handoff`, `retro`, `layer-refs.mjs`, the two guard suites, `upkeep-nudge.mjs` and its suite | as in the light frontend layer | copies |
| `INSTALL.md`, `README.md` | same names | rewrite: the light frontend files plus the three backend placeholders, the fourth suite, the frozen list proved by hand with a Codex payload, the backend questions, the "nothing run against a database" rule. |

Rows with no single file:

- **Built-in agents and their effort**: as the light frontend layer. `init`'s five survey agents are four `explorer` and one `default`, each with `reasoning_effort: "high"` and `fork_turns: "none"`, no `model`; the custom agents carry `model_reasoning_effort = "high"`.
- **Claude Code's memory**: dropped, as in the light frontend layer (`deep`'s memory step, `retro`'s memory option).
- **`layer-refs.mjs`**: the light frontend copy; it already scans `AGENTS.md`, the three layer folders and `.codex/agents/*.toml`. A backticked `npm run <x>` in a layer doc must name a script the project has, so the hooks README speaks of "a package script run through `npm`" instead.
- **The upkeep stamp and its reminder**: as the light frontend layer (`.ai-layer/.last-maintain`, 30 days).
- **The update path under a live guard**: section U of `INSTALL.md`, with `backend-guard.mjs` and its suite in the prepared temp tree and the old layer's frozen check among what refuses.
- **Plan mode and the reviewer on a plan**: as the light frontend layer.
- **Everything the layer writes at run time**: as the light frontend layer; `backend-guard.mjs` writes nothing.
- **Placeholders**: the light five plus `FROZEN_PATHS`, `SECRET_PATHS`, `FORBIDDEN_COMMANDS` - JSON arrays inside raw strings, in `backend-guard.mjs` only; its suite builds its unfilled values from parts, so the install's placeholder search never hits it.
- **The sandbox rule** (taken before the port: a check command or a local request the sandbox stops is the developer's to run; the layer never edits Codex configuration): `AGENTS.md` "Shell and file edits", "Data, secrets and the outside world" and lifecycle step 3, `debug` phase 1, `deep` and `init`'s check-command lines.
- **The misfilled-list rule** (taken before the port: a project list that failed to parse refuses every call, naming it): in `backend-guard.mjs` (`codexCall`), told in the hooks README and `INSTALL.md` step 5.

## What it drops, against its Claude original

| Dropped | Why, and what carries the obligation instead |
| --- | --- |
| Every `permissionDecision: "ask"` | Codex has none (it failed open when measured). The five kinds - a data wipe, a printed secret, another host, the migration history, a search too large to check - are refusals with a sentence of their own: the user runs the command in their own terminal, or a search is narrowed |
| The `Read` / `Grep` checks | no such caller; a shell read carries the secret checks, and a refusal that would send the model to the Grep tool names `git grep` |
| `systemMessage` for a misfilled list | it reached nobody when measured; the list refuses every call instead |
| `run_in_background` for a local instance | no such parameter, and how a long-running server is kept and stopped across calls is unmeasured; the developer's instance, or a test that starts and stops what it needs |
| The allow list (`unzip -p`, the suite calls) | an `allow` rule runs outside the sandbox without asking |
| The "own repo" mode, a `.claude/CLAUDE.md` variant, the memory steps, model pins | as in the light frontend layer |

## Decisions on record

The light frontend layer's "Decisions on record" hold here unchanged. The owner's answers in this layer's session (2026-11-25), not reopened by a later one:

1. The `AGENTS.md` budget of this layer is **24 KiB** (the light frontend one keeps 20 KB). The layer's own text is about 20 KB of it.
2. Gaps `backend-guard.mjs` shared with its Claude Code form were fixed in both forms, in the Claude repository's commit above.
3. A delete of a secret file is refused in both forms, from the shell and as a patch.
4. Under Codex an interactive database client, a framework console (`rails c`, `manage.py shell` / `dbshell`, `artisan tinker`, `flask shell`) and a shell left open in a container are refused.
5. The plan this layer was built by, as a whole.
6. The full frontend layer is not ported: this repository carries the two light layers, and a later session teaches the sync skill the new repository.

Taken on the owner's behalf while porting, each open to an overrule:

- "Never start or stop the dev server" became "never stop a service or container you did not start": a server layer needs a local instance for lifecycle step 3 - one the developer started, or a test that starts what it needs.
- `debug` counts the developer's own run of a reproduction the sandbox stopped as the phase-1 observation.
- `deep.md` and `rules.md` keep the light frontend's M1-M4 / D1-D6 numbering rather than the Claude backend's D1-D10, so the two Codex layers cite the same step names.
- The suite's list cases go into part 1 (the other tool's form) at its marked place, as in the Claude layer; the matching is the same code in both forms, and part 4 proves the Codex wording.
- `hunt` may read a `-sources.jar` with `tar -xOf` where `unzip` is missing (Windows ships `tar`, not `unzip`).

## The switch in `backend-guard.mjs`

- The flag is `--harness codex` or `--harness=codex`, in any letter case, the same parse as `guard.mjs`. Any other value runs the other tool's form, which blocks nothing here.
- **The functions that read Codex input**, all behind the `CODEX` constant: `codexCall` (the entry: an event that is not `PreToolUse` does nothing; a misfilled list refuses first), `codexShell` and `commandLine` (the grammar, and an argument-list command written back as one line), `patchOps` and `checkPatch` (a patch, file by file: a written path as a write, a `Delete File` or a `Move to`'s source as a shell delete), `deny` and `codexWording` (the JSON refusal; `.claude/` paths, `CLAUDE.md` and the Grep-tool remedy rewritten), `CODEX_QUESTION` (the five former questions as refusals), `sessionClient`, `clientStaysOpen`, `consoleStaysOpen`, `consoleOpen` and `clusterHas` (an interactive client, console or container shell), `tooDeep` (a shell nested past three levels), and the main block (a call that throws after parsing is refused).
- Every refusal cites `AGENTS.md, Data, secrets and the outside world`: that heading must exist word for word.
- **The command form in `hooks.json`** is `node "$(git rev-parse --show-cdup).codex/hooks/backend-guard.mjs" --harness codex` (the relative form both Codex layers moved to in this session: `--show-toplevel` under a folder with non-ASCII letters came back garbled from PowerShell 7 and Windows PowerShell, and neither hook started; the new line answered in both and in `bash`, from the root and from a subfolder), a second `PreToolUse` entry with matcher `Bash|apply_patch`, timeout 10 seconds. The light frontend layer measured that two `PreToolUse` hooks on one call both run and either one's refusal blocks it.

## Measured

Engine `codex-cli 0.171.0-alpha.13.2` (the desktop app's own), on Windows. What the light frontend layer measured holds here; this layer's session (2026-11-25) added, offline:

- `debug prompt-input` in a scratch install: the whole `AGENTS.md` of 23 KB is in the prompt, first heading to last line, the filled `<CHECK_COMMAND>` and `<STACK>` included; `debug`, `handoff` and `maintain-ai-layer` are in the skill list with their descriptions, `retro` is not.
- `execpolicy check` against `git.rules`: `git commit` and `git push` answer `forbidden`, `git status` matches nothing.

## Proof

**Offline (2026-11-25):**

- `node --check` on every script of the template and of each scratch install.
- The suites, in installs made as `INSTALL.md` says into fresh scratch repositories with a server project (a committed migration with no remote, an untracked `.env` and `config/local.settings.json`, a `Makefile` with `deploy`), filled from the maintainers' backend answers: `guard-test.mjs` 93 passed, `guard-shell-test.mjs` 417 passed, `backend-guard-test.mjs` 792 passed, `upkeep-nudge-test.mjs` 12 passed; unfilled, `backend-guard-test.mjs` 792 and `guard-test.mjs` 93 passed, and `guard-shell-test.mjs` fails the 13 cases built from the unfilled source folder, as its README says. With the project's own secret file at the root, one `backend-guard-test.mjs` case fails as described under "Known gaps" (791 passed). `layer-refs.mjs`: 0 unresolved. In personal mode `git check-ignore` names the layer's paths and `git status` shows none of them.
- Each guard class through **both** registered `PreToolUse` lines, a Codex-shaped payload on stdin, started in a subfolder, in PowerShell 7, Windows PowerShell and `bash` - 63 cases, all as expected in all three shells; for every refusal the hook expected to refuse is the one that did:

| Class | Refused | Passed |
| --- | --- | --- |
| `guard.mjs` classes | `git commit` (plain, `-C .`, `2>&1`), `Set-Content` into the tree, `cd .`, two deletes, `apply_patch` through the shell, a bare `pwsh`, a generated client, an em dash, a patch to `backend-guard.mjs`, a shell delete of it, `drift` patching and spawning, the first patch to a ruled path | the retry after the rule, a source patch, `git status`, a new migration |
| secret read | `Get-Content` and `cat` of `.env`, the project list's file, `git show HEAD:.env`, `node -e` reading `.env` | `.env.example`, `git grep` over tracked files |
| glob, pipe feed | `Get-Content ../../.en*`, `Get-Item .env \| Get-Content`, `echo .env \| xargs cat` | - |
| upload, folder copy | `curl -F "f=@.env"`, `Compress-Archive` and `Copy-Item -Recurse` of the root | - |
| recursive search | `Get-ChildItem -Recurse \| Select-String`, `grep -rn` over the root | - |
| secret delete and write | `Remove-Item .env`, a `Delete File` of it, a `Move to` away from it, an `Update File` of it | - |
| frozen | a patch editing, deleting or moving the committed migration, a shell delete of it | a new migration file |
| deploy | `kubectl apply`, `terraform apply`, `docker push`, `make deploy` (the project list) | `kubectl --context kind-dev apply` |
| former questions | `docker compose down -v`, `alembic downgrade base`, a `DROP` handed to `psql`, `alembic stamp`, `kubectl get secret -o yaml`, `aws secretsmanager get-secret-value`, `ssh` to a host, `psql -h <host>` | `alembic downgrade -1` |
| interactive client | a bare `psql`, `bin/rails c`, `python manage.py shell`, `docker compose exec app bash`, `docker exec -it db psql` | `psql -c "select 1"` |
| misfilled list | with `FROZEN_RAW` broken, `git status` and a source patch, each naming the list | - |

- The maintainers' anonymity scan over this repository: clean, its review lines (a database client's own flag) read and recorded. No dash characters. `cmp` over the lists above.

**Live:** not run yet - see "The live run".

## The live run

Pending: a scratch install with a logging hook registered beside the layer's own, a prompt that has Codex try each guard class of both hooks, a spawn of `hunt` and `drift` each trying one patch, each skill by name and an interactive `psql`; then a desktop pass after the hooks are trusted in Settings > Hooks. A refusal that did not happen there is a blocker. Its results replace this section.

## Known gaps

The light frontend layer's "Known gaps" hold for `guard.mjs`. For `backend-guard.mjs`:

- **What it cannot see**: a secret reached through a variable or a subexpression (`$p = '.env'; gc $p`, `Get-Content (Join-Path . '.env')`, `Get-Content (Resolve-Path .env)`); a chain of two pipes; a here-string assigned to a variable and used later; a delete inside a launcher's argument list (`Start-Process pwsh -ArgumentList '-c Remove-Item .env'`); a tool named with `.com`; a script file or task-runner target that runs a forbidden command; SQL in a file; a database host taken from the environment or a config file.
- A home-folder walk is expanded only for `~`, `$HOME`, `${HOME}`, `$env:USERPROFILE`, `$env:HOME`, `%USERPROFILE%` at the start of a path.
- `docker run -it <image>` with no command is refused even when the image runs a server.
- `rm` with a hundred paths takes about 6 s with the frozen list filled (one `git ls-files` per path); the hook's timeout is 10 s.
- **The suite's first part runs from the project root** (shared with the Claude layer): in a project that holds a file of its own secret list at the root, `zip that leaves the env file out (allow)` - `zip -r /tmp/app.zip . -x .env` - is refused, correctly, and the suite reports one failure. `INSTALL.md` step 8 tells the installer so. The fix belongs in the Claude repository's suite (run the folder-walking cases in a temp folder), and then arrives here as a copy.
- What is typed into a running command fires no hook: a client the hook does not know (`SESSION_CLIENTS`) left open is a database shell nothing checks.
- The default sandbox has no network: a check command or a local request may be stopped there, and the layer's text hands it to the developer rather than asking for configuration.

## The numbers that must agree

- **The spawn count per task**, "usually 1-2, at most 5": `template/AGENTS.md` "Development Workflow", `README.md` "What it costs", `maintain-ai-layer/references/deep.md` D5.
- **The `AGENTS.md` budget**: 24 KiB. The layer's own text is about 20 KB (`grep -v "^\[fill\]"`: 20 595 bytes), the template 23 277 bytes; `AGENTS.md` "Surgical Changes", `drift.toml` "Gaps", `maintain-ai-layer/SKILL.md`, `INSTALL.md` step 4 and `README.md` "What it costs" state it.
- **The hunt angles** stay under the 6 KB `.ai-layer/hunt-angles.md` states (5 702 bytes).
- **The unit count of `deep`** in `README.md` (18 `AGENTS.md` sections, the angles file, 2 agents, 4 skills, the hooks README; about 42 spawns with five rules) against `deep.md` D1 and the headings of `template/AGENTS.md`; `init`'s 5 survey agents against `init.md` I1.
- **The upkeep pace**: 30 days, as in the light frontend layer.

## Before publishing a change

- `cmp` over both "identical" lists, against the Claude repository's commit and against the light frontend layer.
- The four suites and `layer-refs.mjs` inside a filled scratch install made as `INSTALL.md` says, and every guard class through both `hooks.json` lines; `codex execpolicy check` on `git.rules`; `codex debug prompt-input` in the install.
- Search the folder for every skill, agent, step number and file name you changed, so nothing dangles; and for `CLAUDE`, `.claude`, `Claude Code`, `settings.json` and the other tool's tool names - the justified hits are the shared hooks and their suites, the neighbour-tool lines of `INSTALL.md` and `init.md`, and the lines that say this is a port.
- Plain hyphens only; no project, employer, customer, person, host or ticket names anywhere; no LICENSE, version stamp, uninstall section or installer script.
