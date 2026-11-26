# Maintaining the light frontend layer for Codex

For whoever changes this bootstrap; the backend layer's `MAINTAINERS.md` builds on what this one measured. An adopter needs only `README.md`; the model installing it reads `INSTALL.md`.

## What it is built from

- It is a port of the Claude Code layer `claude-bootstrap-light-frontend` in [claude_bootstrap](https://github.com/gregkozlov/claude_bootstrap), built from that repository's commit `e6f378b` - always from a commit, never from a working tree, and never from the project the bootstraps came from.
- The goal is the same working discipline under Codex, not a file-by-file transliteration: a unit Codex cannot carry is redesigned or dropped with its reason, never faked.
- **A fix the Claude layer also needs is made there first** and arrives here as a copy; a Codex-only fix stays here and is listed in this file.
- The layer spans four places in a project: the root `AGENTS.md`, `.codex/` (hooks, their registration, command rules, agents), `.agents/skills/` and `.ai-layer/` (everything the layer writes while it works). Skills never go into `.codex/skills/`: it is scanned today and documented nowhere.

## The three file lists

Paths on the right are under `template/`. `cmp` proves each line; run it before publishing.

**Identical to the Claude layer** (`claude-bootstrap-light-frontend/template/.claude/...` at the commit above):

| Claude layer | Here |
| --- | --- |
| `hooks/guard.mjs` | `.codex/hooks/guard.mjs` |
| `hooks/tests/guard-test.mjs` | `.codex/hooks/tests/guard-test.mjs` |
| `hooks/tests/guard-shell-test.mjs` | `.codex/hooks/tests/guard-shell-test.mjs` |
| `skills/maintain-ai-layer/references/settled.md` | `.ai-layer/settled.md` |

**Identical across the Codex layers** - this repository carries two, this one and `codex-bootstrap-light-backend`, and `cmp` confirms each line against the other: the four files above, `.codex/hooks/upkeep-nudge.mjs`, `.codex/hooks/tests/upkeep-nudge-test.mjs`, `.agents/skills/maintain-ai-layer/layer-refs.mjs`, `.agents/skills/handoff/SKILL.md`, `.agents/skills/retro/SKILL.md` with its `agents/openai.yaml`, `.codex/rules/git.rules`, `.ai-layer/rules/.gitkeep`.

**Forked** from the Claude layer (small scripts, under 10 KB each; a change to the Claude original is ported by hand, not copied):

| File | What the fork changes |
| --- | --- |
| `.codex/hooks/upkeep-nudge.mjs` | the stamp is `.ai-layer/.last-maintain`; the root is the hook's own location (the payload's `cwd` is never used; `CLAUDE_PROJECT_DIR` stays as the suite's override, the same variable the guard's suites set); the line names `$maintain-ai-layer`. `DUE_DAYS` stays 30. |
| `.codex/hooks/tests/upkeep-nudge-test.mjs` | the stamp's folder, and three more cases: the skill's name in the line, and a copy of the hook installed into a throwaway project and started in a subfolder with no variable set - silent with a fresh stamp, speaking once the stamp is removed. The 29-day case stays. |
| `.agents/skills/maintain-ai-layer/layer-refs.mjs` | scans `AGENTS.md`, every `*.md` under `.codex/`, `.agents/` and `.ai-layer/`, each `.codex/agents/*.toml` and every tracked `*.md`; an agent resolves by the `name =` of its TOML, the built-ins are `default`, `explorer`, `worker`; skills resolve in `.agents/skills/`; `$name` is checked as a skill only in files under `.agents/` and `.codex/`, PowerShell's own variables excepted; a directory argument is scanned for `*.toml` too; the path prefixes are the source directory, the three layer folders and the lines of the optional `.ai-layer/layer-refs-prefixes`. |

Everything else is a rewrite and has no byte contract.

## What maps to what

| Claude layer | Here | How |
| --- | --- | --- |
| `CLAUDE.md` | `AGENTS.md` | rewrite. The section names "Shell and file edits" and "Punctuation" are cited by the guard's refusals and must not be renamed. Two sections are new: "Path rules" (how the guard hands a rule over, `--rules-for`, the index) and "Sub-agents" (the explicit ask Codex's spawn tool requires, the spawn parameters, the fence). |
| `settings.json` `hooks` | `.codex/hooks.json` | redesign: the command line below; `guard` on `PreToolUse` (`Bash\|apply_patch`) and on `SessionStart` (`startup\|clear\|compact`), `upkeep-nudge` on `SessionStart` (`startup\|clear`). |
| `permissions.deny` | `.codex/rules/git.rules` | redesign: `forbidden` prefix rules for the banned git verbs and nothing else. A bare `git stash` cannot be told from `git stash list` by a prefix, so the stash rule lists the writing subcommands and the guard refuses the bare form. |
| `permissions.allow` | - | drop: an `allow` rule means "run outside the sandbox without asking". |
| `agents/hunt.md`, `drift.md` | `.codex/agents/hunt.toml`, `drift.toml` | rewrite: `name`, `description`, `model_reasoning_effort = "high"`, no `model`, the body in a `'''` literal string (so a backslash stays a backslash). The `tools:` line has no counterpart: the guard's fence keeps them read-only. |
| `hunt`'s "Attack angles" section | `.ai-layer/hunt-angles.md` | redesign: a session cannot write `.codex/agents/`, and the angles are the part a project tunes. `hunt.toml` tells the agent to read the file. |
| `rules/.gitkeep`, `.claude/rules/*.md` | `.ai-layer/rules/` | move; the format and the `paths:` globs are unchanged, the loader is the guard. |
| skills `debug`, `handoff`, `retro`, `maintain-ai-layer` | `.agents/skills/<name>/` | rewrite. `retro` is explicit-only through `agents/openai.yaml` (`policy.allow_implicit_invocation: false`). The hand-off file is `.ai-layer/handoff.md`; an upkeep run's record goes to the OS temp directory. |
| `references/settled.md` | `.ai-layer/settled.md` | move: a run appends to it. |
| `references/init.md` | `references/init.md` | rewrite, for this layer alone. In the Claude repository one `init.md` serves that repository's two frontend layers; the Codex repository has one frontend layer, so the file names only this layer's units. The backend layer has its own. |
| `INSTALL.md`, `README.md`, `MAINTAINERS.md` | same names | rewrite. |

Rows with no single file:

- **Built-in agents and their effort.** `Explore` became `explorer`, `general-purpose` became `default`, `Plan` has no counterpart (a contract change is planned in plan mode where the session has one, otherwise as a written plan). No agent pins a model. Effort is pinned twice: `model_reasoning_effort = "high"` in each custom agent's file, and `reasoning_effort: "high"` asked for on every spawn the layer makes - the only place a built-in agent's effort can be set without editing Codex configuration, which the layer never does. Whether the spawn tool of a given session takes that parameter is in "Measured".
- **A clean start is asked for, not assumed.** A spawned agent inherits the parent's whole context unless the spawn passes `fork_turns: "none"`; with it, one run showed a clean start (below). The text therefore asks for that parameter on every spawn and still tells the main thread to treat a sub-agent's findings as claims to check.
- **Claude Code's memory folder** has no counterpart the layer can read as files. Dropped: the memory step of `deep` (the steps after it were renumbered: the workflow walk is D5, verify is D6), the memory option of `retro` (now a line in `AGENTS.md`, or nothing), "memory files" in `handoff` and in the upkeep's standing rules.
- **The upkeep stamp** is `.ai-layer/.last-maintain`; the reminder reads "In your first reply, tell the user in one line that `$maintain-ai-layer` is due. Never start it unasked."
- **Questions.** `request_user_input` exists in plan mode only (one to three questions, two or three options); everywhere else the layer asks in one numbered list with a `default:` per item. The install and `init` run in the default mode, so both use the list.
- **Plan mode and the reviewer on a plan.** `hunt` reviews a contract change's plan before the user approves it; if a spawn is not possible in plan mode, it runs right after the approval, before the first edit, and the reply says so.
- **Access.** Install and update write `.codex/`, `.agents/` and `.git/info/exclude`, read-only under the default sandbox, so `INSTALL.md` and `README.md` ask for one full-access session. Daily work, `init` and upkeep write only `AGENTS.md` and `.ai-layer/`, and run in the default sandbox.
- **The update path under a live guard.** A session cannot overwrite the hooks, their registration, the command rules or the agents. `INSTALL.md` section U has the installer prepare the new versions in a temp folder laid out as `.codex/...`, prove them there, and hand the developer the copy commands; it ends with the hook review, since a changed hook is skipped until reviewed.
- **Everything the layer writes at run time**: `.ai-layer/.last-maintain`, `.ai-layer/handoff.md`, `.ai-layer/rules/*.md`, `.ai-layer/hunt-angles.md`, `.ai-layer/settled.md`, `.ai-layer/layer-refs-prefixes`, in personal mode `.ai-layer/check.mjs` when the check needs several commands; outside the project the guard's rule notes (`ai-layer-rules/` in the OS temp directory) and an upkeep run's record.
- **Placeholders**: the Claude layer's five. `<CHECK_COMMAND>` no longer sits in a JSON allow list, but it must be valid in every shell a developer's Codex may start, so it is still one plain command or `node .ai-layer/check.mjs`.
- **Install modes**: two, personal and team. There is no "own nested repo" mode: the layer spans the root and three folders, which one nested repository cannot hold.

## What it drops, against its Claude original

| Dropped | Why, and what carries the obligation instead |
| --- | --- |
| The allow list | see above; the default sandbox and the user's own approvals decide what runs unasked |
| The "own repo" install mode | the layer is not one folder |
| A `.claude/CLAUDE.md` personal variant, and every "which `CLAUDE.md`" paragraph | Codex reads `AGENTS.md` from the root down; the layer's file is always the root one. A tracked root `AGENTS.md` met in personal mode stops the install, which offers team mode; an `AGENTS.override.md` is never written |
| The memory audit, the memory option of `retro` | no memory folder to read |
| `argument-hint`, slash-command wording | a skill is called as `$name`; the mode is the word after it |
| "A rule loads when a matching file is read" | a rule is handed over at the first patch to a matching path, and asked for with `--rules-for` before planning or reviewing; a session that only reads a file is not shown its rules |
| A project that is not a git repository | refused: the hooks find the project through git |
| Model pins (`sonnet`) on agents and on upkeep spawns | the owner's decision: an agent inherits the session's model, since slugs change every few months |

What the Claude light layer already dropped against the Claude repository's larger frontend layer (the review ladder, the Stop hook, session folders, the browser check) is in that layer's own `MAINTAINERS.md` and holds here unchanged. That larger layer has no Codex port (the owner's decision, 2026-11-25): this repository carries the two light layers only.

## Decisions on record

Taken with the owner before the port (2026-11-24) - not reopened by a later session:

1. A refusal is JSON on stdout with exit 0 - never exit code 2.
2. `guard.mjs` stays one file for both tools, behind `--harness codex`; a change is made in the Claude repository first and copied here.
3. `permissionDecision: "ask"` does not exist under Codex: whatever a Claude layer asks about is refused here, with a reason that fits.
4. Documented locations only, two install modes, no hook that copies `AGENTS.md` anywhere.
5. No agent pins a model; every agent carries high reasoning effort.
6. The command rules file holds `forbidden` rules for the banned git verbs and nothing else.
7. What the layer writes at run time lives in `.ai-layer/`.
8. A tracked root `AGENTS.md` met in personal mode stops the install; never an `AGENTS.override.md`.
9. Path-scoped rules are a base mechanism of the layer, so the layer builds them: the rule files keep their format in `.ai-layer/rules/`, `AGENTS.md` carries their index, and the guard refuses the first patch to a matching path once per session and agent, naming the file - never quoting the rule's text, since a long reason is cut.

The owner's answers while the guard was taught Codex (2026-11-25):

1. A `*** Move to:` is judged by both ends - the source as a delete, the destination as a write - not refused like a shell move.
2. A misfilled `PROTECTED_PATHS` refuses every call, naming the list.
3. The built-in `explorer` is fenced to no project path, beside the layer's own agent names.
4. Project-tuned text lives in `.ai-layer/` (the hunt angles, `settled.md`, the `layer-refs` prefixes), so daily work, `init` and upkeep need nothing beyond the default sandbox.
5. The plan this layer was built by, as a whole.
6. After the desktop pass showed that unreviewed hooks are skipped without a word: a session checks once, before its first edit, that the guard is live - it runs `cd .`, which the guard refuses - and tells the user at once when the command simply runs (`AGENTS.md`, "Shell and file edits"). It costs one call per session.

Taken on the owner's behalf while porting, each open to an overrule:

- `.codex/config.toml` is a protected layer path, because it can switch hooks off. Cost: a session cannot edit the project's Codex configuration.
- A patch that writes under `.git` is refused (under Claude Code an Edit there passes, as a known gap).
- An editor agent (`comments`, a name kept in the shared guard for the Claude repository's larger layer) is fenced from the shell too.
- The guard's rule notes live in the OS temp directory, not in `.ai-layer/`.
- The suites keep the other tool's cases and gained a Codex block each.
- Rule globs are read as Claude Code's rule loader reads them, not as gitignore does, so one rule file reaches the same files under both tools.
- The stash rule lists subcommands; a bare `git stash` is the guard's alone.
- `guard` is registered on `SessionStart` for `startup`, `clear` and `compact`, not for `resume`: a resumed session still has its context, so its rule notes stay.
- `layer-refs` checks `$name` as a skill only in the layer's own skills and hooks docs: in a project's docs it is a variable or a framework's own name.
- The budget of `AGENTS.md` stays at 20 KB as planned, though the layer's own text grew to about 16 KB with the two new sections and the three rules the live runs added - about 4 KB is left to the project, against about 8 KB in the Claude layer. If that proves tight, 24 KiB - the backend layer's budget (the owner's answer, 2026-11-25) - is the next step, still inside Codex's 32 KiB chain limit.
- `init.md` was written for this layer alone rather than kept generic for a larger one.
- A skill file under `.agents/skills/` is patched by upkeep when the sandbox lets the write through, and handed to the developer as an exact pair when it does not.

## The switch in `guard.mjs`

- The flag is `--harness codex` or `--harness=codex`, in any letter case. Any other value silently runs the other tool's form, where a refusal is exit code 2 - which does not block under Codex on Windows.
- The functions that read Codex input, all behind the `CODEX` constant: `codexCall` (the entry: `SessionStart` goes to `forgetRules`, any other event that is not `PreToolUse` does nothing), `codexShell` and `commandLine` (the grammar and the argument-list form of a shell call), `patchOps` and `checkPatch` (a patch, file by file), `guardedPath` with `CODEX_LAYER` (the layer's own files), `CODEX_FENCED_AGENTS` with `READ_ONLY_FENCE` / `UPDATE_ONLY_FENCE` (the fence by `agent_type`), `loadRules`, `globRegex`, `rulesFor`, `ruleGate`, `forgetRules` (path rules), `deny` and `codexWording` (the JSON refusal and the wording), `projectRoot` (the root from `HOOK_ROOT`, or `CLAUDE_PROJECT_DIR` when the suites set it - never from `cwd`).
- `codexWording` rewrites five phrases of a refusal written for the other tool: the guard's path, `CLAUDE.md` to `AGENTS.md`, "with Edit or Write" to "with apply_patch", "the session scratchpad or /tmp" to "the temp directory", "under the scratchpad" to "under the temp directory". A new refusal keeps to those phrases; the Codex block of each suite fails on one that does not.
- **The command form in `hooks.json`** is `node "$(git rev-parse --show-cdup).codex/hooks/guard.mjs" --harness codex`. Until the backend layer's session (2026-11-25) it was `"$(git rev-parse --show-toplevel)/..."`, the form the live run below used; that one failed under a project folder with non-ASCII letters, since PowerShell decodes git's output with the console code page - the hook did not start, which allows every call. The relative form answered in PowerShell 7, Windows PowerShell and `bash`, from the root and a subfolder of such a folder. Codex starts a hook as `pwsh.exe -NoProfile -Command "<command>"` on Windows; `${...}` variables of other tools do not expand, no environment variable carries the project root, and the hook's working directory is the session's. This line was run with a payload on stdin in PowerShell 7, Windows PowerShell and `bash`, from a subfolder: every guard class answered as expected in all three (the proof list below).
- `--rules-for` and its files come last on the command line; it sets the switch by itself, so it answers with or without `--harness codex`.
- **`hooks.json` registers the guard on four tool names**: `Bash`, `apply_patch`, and the two the hook sees for starting or tasking an agent, `collaborationspawn_agent` and `collaborationfollowup_task` (the guard tests the name's ending). A later engine that renames them leaves spawns unchecked, not blocked.
- Under the switch a `cd` is refused at any depth with its own sentence, written in `checkChdir` rather than through `codexWording`, because the other tool's sentence ("moves the working directory for every later call") is false here.

## Measured

Engine `codex-cli 0.171.0-alpha.13.2`, the desktop app's own (the newest `codex.exe` under `%LOCALAPPDATA%/OpenAI/Codex/bin/`), on Windows. Nothing here was measured on macOS or Linux.

**In a headless run of the engine with a logging hook (2026-11-24):**

- A hook command runs as `pwsh.exe -NoProfile -Command "<command>"`. That wrapper turns a script's exit code 2 into 1: a hook that exited 2 blocked neither a shell command nor a patch.
- JSON `deny` on stdout blocked a `Bash` call in the main thread, and the reason reached the model verbatim. `permissionDecision: "ask"` failed open: the command ran and nobody was asked. A `systemMessage` reached neither the model nor the run output.
- Every payload carries `session_id`, `transcript_path`, `cwd`, `hook_event_name`, `model`, `permission_mode`, mostly `turn_id`; `PreToolUse` adds `tool_name`, `tool_use_id`, `tool_input`.
- A shell call is `tool_name: "Bash"` with `tool_input.command` a string, whatever the shell - there PowerShell 7. There is no read tool: a file is read with a shell command.
- A file edit is `tool_name: "apply_patch"`, `tool_input.command` the patch text, paths relative to the session's `cwd`.
- A tool call made inside a sub-agent carries the parent's `session_id` plus `agent_id` and `agent_type` (the custom agent's `name`). `SubagentStart` and `SubagentStop` fire. The spawn itself reaches the hook as `tool_name: "collaborationspawn_agent"` with `agent_type`, `task_name` and an unreadable `message`.
- A spawned agent started with the parent's whole context: it quoted the parent's earlier steps.
- A token-form `forbidden` rule was enforced at run time although the command is wrapped in a shell.
- `PreToolUse` `additionalContext` reached the model after the call it rode on - which is why a path rule is a refusal and not a hint.
- `SessionStart` `additionalContext`, a `Stop` block with `stop_hook_active` on the continuation, a skill loaded from its description and reading its own `references/` file, and `agents/openai.yaml` with `allow_implicit_invocation: false` worked as documented.

**Offline, with free engine commands and the installed layer (2026-11-25):**

- `debug prompt-input`, run with a scratch install as the working directory: the whole `AGENTS.md` of about 16 KB is in the prompt, first heading to last line; `debug`, `handoff` and `maintain-ai-layer` are in the skill list with their descriptions; `retro` is not; **no custom agent's `description` is in the prompt** - so only skill descriptions are always-on text. The same output carries the engine's own sentence that a command using redirection, substitution, an environment assignment or a wildcard "will not be evaluated against rules".
- `execpolicy check` against `git.rules`: `git commit`, `add`, `push`, `checkout`, `tag`, `stash pop`, `branch -D`, `worktree add` answer `forbidden`; `git status`, `log`, `stash list`, a bare `git stash` and `git -C . commit` match no rule - the last two are the guard's. The checker also proves the file parses: `match` / `not_match` examples and `#` comments are accepted.
- `features list`: `hooks` is `stable` and on; `multi_agent` is `deprecated` and on; `multi_agent_v2` is `stable` and off.

**Read in the engine binary, not yet seen in a run:**

- The patch grammar: `*** Begin Patch`, then hunks `*** Add File: `, `*** Delete File: `, `*** Update File: ` with an optional `*** Move to: ` line, `*** End Patch`; an optional `*** Environment ID: ` line after the first; a shell form of the tool exists (`apply_patch` as a command).
- `spawn_agent` parameters: `message` / `items`, `agent_type`, `task_name`, `model`, `reasoning_effort` ("Omit to inherit the parent effort"), `fork_turns` ("Defaults to `all`; use `none` to start without parent history"). Its own text: "Do not spawn sub-agents unless the user or applicable AGENTS.md/skill instructions explicitly ask" - hence the "Sub-agents" section. With `multi_agent_v2` off by default, the tool a session actually gets may be the older one without those two parameters; `AGENTS.md` tells the model to leave out and name a parameter the tool does not take.
- The command tool: `command`, `workdir`, `shell`, `tty`; a separate tool writes to a running command's stdin.
- `request_user_input`: one to three questions, two or three options each, plan mode only.

**Read in the documentation (2026-11-25)** - `https://learn.chatgpt.com/docs/hooks.md`, `/docs/agent-configuration/rules.md`, `/docs/agent-configuration/subagents.md`, `/docs/build-skills.md`, `/docs/agent-configuration/agents-md.md` (the `https://developers.openai.com/codex/` pages redirect there): the hook events and matchers; `apply_patch` "matchable as `apply_patch`, `Edit`, `Write`"; several matching hooks are launched concurrently; hook trust is recorded against the hook's hash, and a new or changed hook is skipped until reviewed; project hooks and rules load only for a trusted project; tool feedback beyond about 2500 tokens is cut to a head and a tail; a rule's `forbidden` beats `prompt` beats `allow`; a custom agent file needs `name`, `description`, `developer_instructions`; an agent without a model or effort inherits the parent's; skills are read from `.agents/skills` between the working directory and the repo root; the `AGENTS.md` chain is built once per run and stops at 32 KiB by default.

## Proof

**Offline (2026-11-25):**

- `node --check` on every script.
- The suites, in an install made into a fresh scratch repository: `guard-test.mjs` 93 passed unfilled and filled, `guard-shell-test.mjs` 417 passed filled, `upkeep-nudge-test.mjs` 12 passed; `layer-refs.mjs` 15 files, 0 unresolved; no placeholder left; in personal mode `git status --short` lists nothing of the layer and `git check-ignore` names all five probe paths.
- Each guard class through the `hooks.json` line itself, a Codex-shaped payload on stdin, started in a subfolder, the answer read back as JSON, in PowerShell 7, Windows PowerShell and `bash`:

| Class | Refused | Passed |
| --- | --- | --- |
| git | `git commit`, `git -C . commit`, `git commit ... 2>&1`, `git push` inside `node -e` | `git status` |
| shell write | `Set-Content`, a redirect and `sed -i` into the project | a redirect into the temp directory |
| `cd` | `Set-Location`, `cd`, a `cd` in a subshell | - |
| delete | two files in one call, a recursive delete, two `Delete File` in one patch | one orphaned file, by shell and by patch |
| a program by its bare name | `curl.exe -o` into the project, `rm.exe -rf` | a project script named `./install` |
| patch through the shell | `apply_patch` as a command word, inside a nested `pwsh`, behind a launcher | a search for the word |
| interactive session | `pwsh -NoLogo`, `node -i`, `cmd /k` | `node` running a script |
| move into the project | a `Move to` from the temp directory | - |
| spawn | `drift` spawning, `explorer` handing work on | the main thread spawning `hunt` |
| protected paths | a patch to a generated file, a new file matching the list, a shell delete of one | - |
| dash | an added line with an em dash | - |
| the layer's own files | patches to `hooks.json`, a hook, an agent, a new rules file, `config.toml`, a path under `.git`; a shell delete of a hook | a patch into `.ai-layer/` |
| no header | a patch with no file header | - |
| fence | `drift` patching; `explorer` writing and deleting from the shell; `hunt` patching a source file | `hunt` reading |
| wrong tree | a session whose `cwd` is outside the project | - |
| path rules | the first patch to a matching path; the same path for a sub-agent's own first patch; again after a `SessionStart` with `source: compact` | the retry; `--rules-for` lists the rule file |

**Live:** see "The live run" below.

## The live run

One headless run of the engine (2026-11-25) in a scratch install made as `INSTALL.md` says - personal mode, one path rule reaching `src/forms/**`, a logging-only hook registered beside the layer's own on every event, the workspace-write sandbox, approvals off, hook trust bypassed for that invocation. 38 steps, four sub-agent spawns. Every step ran.

**Refused live, each with the guard's reason reaching the model** (the engine shows it as `Command blocked by PreToolUse hook: <reason>. Command: <the call>`):

| Class | Refused live | Passed live |
| --- | --- | --- |
| protected paths | a patch to a generated file; a shell delete of a protected schema | - |
| dash | a patch adding a line with an em dash | - |
| shell write | a redirect and `Set-Content` into the project | a redirect into the temp directory |
| `cd` | `Set-Location src; git status --short` | - |
| delete | two files by one shell command; two `Delete File` in one patch | one `Delete File` |
| the layer's own files | a patch to `.codex/hooks.json`; a shell delete of `.codex/rules/git.rules` | - |
| patch through the shell | `apply_patch` with a here-string as the command | - |
| git | `git commit`, `git -C . commit`, `git commit ... 2>&1`, `git status --short; git commit` | `git stash list` |
| path rules | the main thread's first patch to a ruled file; a `default` sub-agent's own first patch to it, after the parent had been handed the rule | each retry after reading the rule |
| fence | the built-in `explorer`'s patch to a source file | - |

So JSON `deny` blocks an `apply_patch` call, blocks inside a sub-agent, and blocks with a second `PreToolUse` hook on the same call. For the four git commands the hook answered, not the command rules: the rules file was not reached.

**Not refused in that run, and it should have been:** `pwsh -NoProfile -Command "apply_patch ..."` passed the guard of that day; the sandbox then failed to start the nested shell, so nothing was written. The guard this layer ships refuses it (next section); that refusal is proved offline, through the hook line, not in a second live run.

**Not exercised:** `hunt` and `drift` declined to try a write at all, on their instructions, so their fence was proved offline only; `drift` likewise declined to spawn a child.

**Measured in that run:**

- **The sandbox.** A patch creating a file under `.codex/` or under `.agents/` (paths the guard does not protect) came back `patch rejected: writing outside of the project; rejected by user approval settings`; the same patch under `.ai-layer/` was written. With approvals off it is a failure, not a prompt.
- **The spawn tool** is `collaboration.spawn_agent` with `message`, `task_name`, `agent_type`, `fork_turns`, `model`, `reasoning_effort`; the hook sees `agent_type`, `task_name`, `fork_turns` and `reasoning_effort` in `tool_input`, and an unreadable `message`.
- **`fork_turns: "none"` gives a clean start**: `hunt` and `explorer`, spawned with it, knew no codeword that only the parent's prompt carried; `drift`, spawned without it, quoted the codeword from "the inherited parent context". The text of `AGENTS.md` was in the clean agent's context.
- **A sub-agent's calls** carry the parent's `session_id` plus its own `agent_id` and `agent_type`; the rule note of a sub-agent is a folder of its own under the session's. A sub-agent has the spawn tool too.
- **The command tool** is `exec_command` with `cmd`, `workdir`, `shell`, `tty` and others; the hook's `tool_input` carries `command` only. **A call made with `workdir` reaches the hook with the payload's `cwd` set to that directory**, so a relative path is judged from the right folder. The `shell` and `tty` arguments are invisible to the hook. On that machine `shell: "bash"` resolved to a system `bash.exe` that the sandbox denied.
- **The working directory does not persist**: after a call that changed it, the next call started in the project root.
- **Typing into a running command is invisible.** `node -i` started as an interactive session reached the hook as an ordinary `Bash` call; the text then sent through `write_stdin` fired no hook event at all.
- **`rg` was not on the path** (`CommandNotFoundException`). Every search command in the layer is `git grep` for that reason.
- **Session start**: the upkeep reminder reached the model, which opened its first reply with the line. `debug`, `handoff` and `maintain-ai-layer` were in the skill list, `retro` was not; each skill file and the `init` reference were read from `.agents/skills/` by path.
- `request_user_input` is listed as plan-mode only; a second tool, `request_user_input_async`, is listed in the default mode. The layer does not use it: it was not tried.

**One pass in the desktop app (2026-11-25), in the same scratch install, hooks not yet reviewed:**

- The app asked to trust the folder. **It did not offer to review the hooks, and it ran none of them**: the logging hook, registered on every event, wrote no line for the whole session. Nothing on screen said so.
- With no hook running, the first patch to a ruled file passed, `pwsh -NoLogo` opened a prompt and a subshell `cd` ran - none of that is the guard failing, it never ran.
- **`git commit -m "x"` was still refused, by the command rules alone**, and the rule's `justification` reached the model: `rejected: AGENTS.md, Version Control: apply file changes only ...`. So a multi-token `forbidden` rule works by itself, and it is the only line standing before the hook review.
- In the app's "Ask for approval" mode, patches creating a file under `.agents/skills/` and under `.codex/` (paths the guard does not protect) brought an approval prompt and were written once approved - a prompt there, where the headless run with approvals off got a failure.

This is why `INSTALL.md`, `README.md` and the hooks README tell the developer to open the hook review themselves and give them a one-command check that the guard is live.

**The same pass again after the review, in a new thread** - the guard of this layer's commit, approvals on (`permission_mode: default`):

- **Where the review is**: Settings > Hooks lists the project with its hooks marked "need review"; inside, "Trust all", or "Trust" and a switch on each hook, each shown under its `statusMessage`. Once trusted, every hook ran in the next thread.
- **Refused live by the guard, the reason shown on screen to the person as well as to the model**: `cd .` (the liveness check), `git commit -m "x"` (the hook answers before the command rules once it runs), the first patch to a ruled file (the retry passed after the rule was read), `pwsh -NoLogo` ("opens an interactive session"), and `(cd src && git status --short)`. The last two are the second guard round's refusals, seen live.
- A patch creating a file under `.agents/skills/` fired a `PermissionRequest` event - the approval prompt - and was written once approved.
- **`$maintain-ai-layer init` typed as a message** reached the session as that text, was shown as a skill chip, and selected `init`: the model read `references/init.md` and `.ai-layer/settled.md` before it was stopped. The trailing word works.
- The session-start reminder reached the model in the app too.
- Before a later patch to the ruled file the model ran `--rules-for` by itself, as `AGENTS.md` asks.

**Still unmeasured:** `PreCompact` / `PostCompact` and whether a compaction fires `SessionStart` with `source: compact` (no compaction was run); a patch through a nested shell and a spawn by a fenced agent against the new guard in a live run (both proved through the hook line); whether a child of a fenced agent inherits its type; anything on macOS or Linux.

## What the review and the live run changed in the guard

A review of the hooks against Codex-shaped payloads and the live run (both 2026-11-25) found forms the guard of the first Claude commit passed. They were fixed in the Claude repository in one round - the plan attacked by a fresh agent first, each fix with its suite cases - and the guard here is that commit's file. What was closed:

- **A patch handed to the shell anywhere a shell would run it**: inside `bash -lc` or `pwsh -Command`, as an argument list, behind a launcher or `xargs`, with a `.bat` / `.ps1` suffix, from a one-liner's code, and as patch text beside the tool's name (read raw, since an apostrophe in a patch line unbalances every quote after it). A search for the word passes.
- **A mover, deleter or downloader named with `.exe` / `.com` or by its full path** is judged by its bare name - in both tools' forms, the one change of that round that also acts without the switch. A relative path (`./install`, `tools/copy.cmd`) and a quoted path that merely opens a segment keep their spelling.
- **A `*** Move to` from outside the project into it** is refused.
- **Path rules**: a YAML comment after a glob is ignored; a file moved out of a ruled folder brings the rule; `--rules-for` answers without the flag.
- **An interactive session** is refused, because what is typed into a running command fires no hook (measured).
- **A `cd` is refused at any depth**, a Bash subshell included: `(cd .codex/hooks && rm guard.mjs)` used to pass, the delete being judged from the folder before the `cd`.
- **A fenced agent may not start or task another agent.**

What that round left, on purpose: the lists of the next section.

## Known gaps

- **An interactive program the guard does not know**: a database shell, `ssh`, a debugger, a terminal wrapper. The list in `SESSION_TOOL` is shells and common interpreters.
- **Indirection**: `git $v`, an alias defined in the call, `[IO.StreamWriter]::new(...)`, `Export-Csv`, `Expand-Archive`, `tar -x -C`; an in-place tool named with its suffix (`sed.exe -i`).
- A rule file in a subfolder of `.ai-layer/rules/`, or named with an upper-case `.MD`, is not read.
- The patch header reader is wider than the grammar: an `Update File` hunk whose context line reads like a file header is judged as naming that path (refused though harmless, in a doc about patches), and a patch that mixes a temp file with a project file has every added line dash-checked.
- A quoted full path to `pwsh.exe` behind the call operator is not read as a shell body; `cmd` grammar treats an apostrophe as a quote; a hook is not shown the shell a call asked for, so Bash text on Windows is judged by PowerShell grammar; UNC, 8.3 and `subst` spellings of a path; a trailing dot or `::$DATA` on a layer path.
- `--harness` with any other value runs the other tool's form (above).
- A patch may write under `.agents/skills/` and to `AGENTS.md` as far as the guard goes; the default sandbox stops the first.
- A session that only reads a file is never shown its path rules; a reviewer gets them only because the main thread names them (`--rules-for`).
- Hook trust is the developer's to keep: after an update, or any edit to a hook, the layer is unguarded until the hooks are reviewed again, and no session can see that from the inside.
- Nested `AGENTS.md` files are Codex's native way to scope instructions, and the layer deliberately does not use them for path rules: a directory is not a glob, such a file lands in the project's tracked tree, and it is read only along the path from the root to the folder a session starts in.

## The numbers that must agree

- **The spawn count per task**, "usually 1-2, at most 5" (`hunt` on the plan, `hunt` on the diff, a second `hunt` round, `drift`, an `explorer`). It is stated in `template/AGENTS.md` "Development Workflow", in `README.md` "What it costs" and checked by `maintain-ai-layer/references/deep.md` D5. Change all three together.
- **The `AGENTS.md` budget**: 20 KB. The layer's own text is about 16 KB (the file without its `[fill]` lines), the template about 17.3 KB; `README.md` "What it costs" states the template's size and the budget.
- **The upkeep pace**: `upkeep-nudge.mjs` asks after 30 days, its suite pins 29 days as silent, and `deep` is the mode a bare `$maintain-ai-layer` runs once `AGENTS.md` has no `[fill]` line left.
- **The unit count of `deep`** in `README.md` (14 `AGENTS.md` sections, the angles file, 2 agents, 4 skills, the hooks README) against `deep.md` D1 and the headings of `template/AGENTS.md`.

## Before publishing a change

- `cmp` over the "identical" lists above, against the Claude repository's commit and against each other Codex layer.
- The three suites and `layer-refs.mjs` inside a filled scratch install made as `INSTALL.md` says, and the guard classes through the `hooks.json` line; `codex execpolicy check` on `git.rules`.
- Search the folder for every skill, agent, step number and file name you changed, so nothing dangles; and for `CLAUDE`, `.claude`, `Claude Code`, `settings.json` and the other tool's tool names - the justified hits are the shared `guard.mjs` and its suites, `CLAUDE_PROJECT_DIR` in the upkeep hook and its suite, the neighbour-tool lines of `INSTALL.md` and `init.md`, and the lines that say this is a port.
- Plain hyphens only; no project, employer, customer, person, host or ticket names anywhere; no LICENSE, version stamp, uninstall section or installer script.
