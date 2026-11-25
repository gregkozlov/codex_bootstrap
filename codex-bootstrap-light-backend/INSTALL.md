# Installing this layer - instructions for the model

You are Codex, running in the user's project - a server codebase in any language. The user unpacked this bootstrap folder somewhere outside the project and asked you to integrate the working layer in `template/` into the project. This file is your procedure. It is not copied into the project, and neither is anything else outside `template/`.

Four rules hold throughout:

- **Look before writing.** Every value comes from the repo or from the user. A plausible guess in a hook or in `AGENTS.md` is worse than a question: every later session believes it.
- **Nothing the project already has is destroyed.** An existing `AGENTS.md`, `AGENTS.override.md`, `.codex/hooks.json`, command rules file, agent, skill, or another tool's instruction file is merged or left alone, never overwritten, and the report names what happened to each. `.codex/config.toml` is never touched. **In personal mode (step 1) no tracked file of the project is touched at all.**
- **Files only.** No commit, no staging, no push, no package install, no source-code edit - the layer's own rules apply to you from the first minute.
- **Nothing is run against a database or a service, and no secret is read.** The install reads the repo: the example env file, never the real one; the migration folder's listing, never a connection. It starts nothing and applies nothing; the one exception is the project's own check command in step 8, run only when what it needs is already up.

Below, `BOOT` is the absolute path of this bootstrap folder and `PROJECT` the project root (`git rev-parse --show-toplevel`). Keep them quoted when you substitute them, since a path may hold a space. Never `cd` in a command: absolute paths, `git -C <dir>`. The command lines below are valid in PowerShell and in a POSIX shell; where one is described in words (list a folder, copy a file, feed a file to a command), use your shell's own command. This install runs in the main thread, with no sub-agents.

**Access.** The install writes into `PROJECT/.codex/`, `PROJECT/.agents/` and, in personal mode, `PROJECT/.git/info/exclude` - all read-only for you under the default sandbox - and reads `BOOT`, outside the project. The user was asked to start this one session with full access (`codex --sandbox danger-full-access`, or the app's full-access mode). **If a write there fails, or nothing offers to approve it, stop at that first failure and say so**: the user restarts with full access and pastes the prompt again. Never work around it, and never edit Codex configuration to get through. Daily work, `init` and the monthly upkeep afterwards run in the default sandbox.

## 1. Which case, and where the layer lives

```text
node --version
git -C "PROJECT" rev-parse --show-toplevel
git -C "PROJECT" status --short
git -C "PROJECT" ls-files AGENTS.md AGENTS.override.md .codex .agents .ai-layer
git -C "PROJECT" check-ignore -v AGENTS.md .codex/x .agents/x .ai-layer/x
```

Then list `PROJECT`'s root with hidden entries shown, and `PROJECT/.codex`, `PROJECT/.agents` and `PROJECT/.ai-layer` where they exist. `ls-files` prints what git tracks; `check-ignore -v` prints each path that is already ignored and by which file (nothing printed: nothing ignored).

- **No `node` on the path, or one older than 18: stop and tell the user.** The hooks are Node scripts whatever language the service is written in, and a hook that cannot start guards nothing. Installing Node is theirs to do.
- **`PROJECT` is not a git repository: stop.** The hooks find the project through git, and the frozen-migration check reads its index, so the layer cannot work there. Say so and install nothing.
- **The session's directory is not inside `PROJECT`: stop and say** to start Codex in `PROJECT` and paste the prompt again.

Then the case:

- **An update of this layer** - the project already has it from an earlier version of this bootstrap: `.codex/hooks/guard.mjs` opens with the "PreToolUse guard" header and `.codex/hooks/backend-guard.mjs` exists. Go to section U.
- **Another variant of this bootstrap** - the same guard header and no `.codex/hooks/backend-guard.mjs`: the light frontend layer is installed. Stop and ask the user whether to replace it with this one; never merge two.
- **A first install** - everything else, including a project with Codex configuration of its own that this bootstrap did not write. The mode question below, then steps 2-8.

**Ask the mode first**, before anything is copied, in one short message with the recommended option first and one line of reason each.

| Mode | What it means |
| --- | --- |
| **Personal** (recommended unless the repo says otherwise) | the layer is yours alone: `AGENTS.md`, `.codex/`, `.agents/` and `.ai-layer/` are listed in `.git/info/exclude`, and no tracked file of the project is touched. It has no history, `git clean -x` / `-X` and `git stash -a` delete it, and a new `git worktree` does not get it. |
| **Team** | the layer is committed with the project: everyone who runs Codex in the repo gets it. Choosing it is the yes for the root `AGENTS.md` merge and the one `.gitignore` line; every other tracked-file edit needs the user's yes. |

Recommend by what the commands showed. These states are not offered as choices:

- **git tracks the root `AGENTS.md`**: personal mode is impossible - the layer's text would have to go into a tracked file. **Stop the install and offer team mode**; the user decides. Never write an `AGENTS.override.md` instead: it would silently replace the team's file.
- **git tracks `.codex/hooks.json`**: the same - the registration would have to go into a tracked file. Stop and offer team mode.
- **An `AGENTS.override.md` exists at the root**: Codex reads it instead of the `AGENTS.md` beside it, so the layer's file would never load. Stop and say so. The install continues only once the user has removed or renamed it; never edit, merge into or delete it yourself.
- **The project tracks other files under `.codex/` or `.agents/`** (a team's own agents or skills): personal mode still works, with the layer's own paths excluded one by one (step 5) - an exclude cannot hide a tracked file.
- **The layer's paths are already ignored**: say where; no new line is needed for them.

The user may answer in their own words with another arrangement: follow it, and name once any consequence that follows. Two that always hold: a layer in a parent folder does not work (the hooks resolve the project through `git rev-parse --show-toplevel`), and skills are found only in `.agents/skills/` from the session's folder up to the repo root.

## 2. Inventory what is already here

Find the instruction files **by shape, not by a fixed list of names** - a project's own file may have been renamed to anything. Search the tracked and the untracked files of `PROJECT` for names containing `agents.md`, `claude`, `cursorrules` or `copilot-instructions` (any case), and list every file under `.codex/`, `.agents/` and `.ai-layer/`. Classify each hit and write the list down before copying anything:

- **The project's own root `AGENTS.md`**: merged in step 4 (team mode, or untracked in personal mode); tracked in personal mode stops the install (step 1).
- **Another tool's instruction files** - `CLAUDE.md` and a `.claude/` folder, `.cursorrules`, `.github/copilot-instructions.md`, an instructions section in a README: rules for the same repo, written for another tool. Read them for project facts worth carrying into `AGENTS.md`; never rewrite or delete them. A Claude Code layer from this bootstrap's sibling repository is such a neighbour: it stays, and the two do not share files.
- **An existing `.codex/hooks.json`**: merged in step 7 (tracked in personal mode stops the install, step 1).
- **`.codex/config.toml`**: read, never written. If it or the user's own configuration turns hooks off, the layer's hooks will not run - say so in the report.
- **Existing agents, skills, command rules or hooks**: left alone. A name collision with a template file (their `hunt`, `drift`, `debug`, `handoff`, `retro`, `maintain-ai-layer`, `git.rules`, `guard.mjs`, `backend-guard.mjs`) is reported, not resolved: the layer's file is the newcomer, so it is not copied over theirs, and the user decides whether to rename one. An existing rules file with an `allow` rule for a git verb this layer forbids, or for a deploy or a migration reset, is reported as a conflict for step 6.
- **Another complete working layer for Codex** (its own lifecycle, its own review agents): stop and ask the user before going on - two lifecycles in one repo is their decision, not a merge.

## 3. Copy the template, never overwriting

List every file under `BOOT/template` (hidden files included - most of it lives in dot-folders) and check each path against `PROJECT`: the ones that exist are collisions for steps 4 and 7 or go into the report as kept.

Copy every file that does not exist yet, one file per command, creating its folder first, from `BOOT/template/<path>` to `PROJECT/<path>` - a byte copy with the shell's own copy command, never retyped. Two rules of order:

- **`.codex/hooks/README.md` goes first**: it proves the session can write under `.codex/` (Access, above). If that copy fails, stop - nothing else has been written.
- **`.codex/hooks.json` goes last** (step 7): it registers the guards, and from the moment a session runs them `guard.mjs` refuses a shell copy into the project.

A file that exists is not copied: `AGENTS.md` is merged in step 4, `.codex/hooks.json` in step 7, and any other existing file goes into the report as kept, with a one-line note of how it differs from the template. Confirm the layer is complete afterwards: `AGENTS.md`; `.codex/agents/hunt.toml` and `drift.toml`; `.codex/hooks/guard.mjs`, `backend-guard.mjs`, `upkeep-nudge.mjs` and `README.md`; `.codex/hooks/tests/` (four files); `.codex/rules/git.rules`; `.agents/skills/debug/SKILL.md`, `handoff/SKILL.md`, `retro/SKILL.md` with `retro/agents/openai.yaml`, `maintain-ai-layer/SKILL.md` with `layer-refs.mjs` and its `references/` (three files); `.ai-layer/rules/.gitkeep`, `.ai-layer/hunt-angles.md` and `.ai-layer/settled.md` - and `.codex/hooks.json` once step 7 has run, plus `.ai-layer/check.mjs` when step 5 wrote one.

## 4. AGENTS.md

- **No root `AGENTS.md` before the install**: the template's copy is now in place.
- **The project has a root `AGENTS.md`** (team mode, or an untracked one in personal mode): merge, do not concatenate. Read the template's copy from `BOOT/template/AGENTS.md`. The layer's sections - Working Principles, Surgical Changes, Version Control, Shell and file edits, Data, secrets and the outside world, Path rules, Sub-agents, Development Workflow, Comments, Punctuation - come in verbatim, under their own headings (the guards' messages cite "Shell and file edits", "Data, secrets and the outside world" and "Punctuation" by name), with the bootstrap note at the top; the project's own facts (commands, architecture, conventions, prohibitions) go into the matching `[fill]` sections of the merged file, in the owner's words. A statement in the old file that contradicts the layer (a different lifecycle, a different review policy, "commit when done", "run the migrations on staging", "deploy when green") is **not merged silently**: it goes into the report as a conflict with your recommendation, for the user to settle. The `[fill]` sections the old file does not answer stay `[fill]` - `$maintain-ai-layer init` writes them. Write the merged file with `apply_patch`.
- **Mind the size.** The layer's budget for this file is 24 KiB, and the layer's own text takes about 20 KB of it; project detail past it is moved into path rules by `init`, not trimmed by you. Codex stops reading instruction files once the whole chain - the user's global file first, then this one - passes 32 KiB by default: read the size of the global file (`AGENTS.md` or `AGENTS.override.md` in the user's Codex home folder) and, when the two together pass that limit, say so in the report. Never edit the global file.

**In both modes**, replace the `Layer tracking` `[fill]` line with exactly one of these:

- team: `` - **Layer tracking: team.** The layer is committed with the project; a change to it is reviewed like code. ``
- personal: `` - **Layer tracking: personal.** `AGENTS.md`, `.codex/`, `.agents/` and `.ai-layer/` are kept out of the project's git by `.git/info/exclude`: never stage them or suggest committing them; `git clean -x` / `-X` and `git stash -a` would delete them. ``

## 5. The placeholders and the git exclusion

Fill these in every layer file that carries them, with `apply_patch`: `git -C "PROJECT" grep -l --no-index -E "<[A-Z][A-Z_]{2,}>" -- AGENTS.md .codex .agents .ai-layer` lists the files (`--no-index` makes git search files it does not track; `git grep` is used throughout because no other search tool is sure to be installed). Read each value from the repo; a value the repo cannot answer waits for step 6 and is filled right after it. Mark each in the report as **read from `<file>`** or **assumed**.

| Placeholder | What it is | Where to read it |
| --- | --- | --- |
| `<PROJECT>` | the project name | the build manifest's name (`pyproject.toml`, `go.mod`, `pom.xml` or the Gradle settings, `Cargo.toml`, a `.csproj`, `composer.json`, `package.json`, a gemspec), or the repo folder |
| `<STACK>` | the stack in one line - the language and its version, the web framework, the data layer (database, ORM or query builder, migration tool), the queue if there is one; it opens `hunt`'s first sentence | the manifest's direct dependencies with their major versions (never a lockfile) |
| `<SRC_DIR>` | **one** source folder, relative, forward slashes, no `./`, no trailing slash - it only feeds `guard.mjs`, its suites and `layer-refs.mjs`, which each take a single folder, so the choice is a light one | where most of the code lives, from `git ls-files`, not from convention (`app`, `src`, `internal`, `src/main/java`); with none (the code at the repo root, a flat Go module), the largest subfolder. A server's code often has several roots (`cmd` beside `internal`, one folder per service or module): name them all in the report - `init` writes the full list into `AGENTS.md` Folder conventions, where the skills read it |
| `<CHECK_COMMAND>` | the **one** verification call: every check the project has, in sequence | the task runner (`make check`, a `just` or `task` recipe), the manifest's scripts, the build tool's own aggregate (a Gradle `check`, a Maven `verify`), and the CI workflow, which shows what the project really runs. With several and no single entry point: in team mode propose the task-runner target or script that chains them (step 6); in personal mode nothing is added to a tracked file - the layer-owned script below. Never invent a command that does not exist |
| `<GENERATED_PATHS>` | a **JSON array** of regex sources for the files `guard.mjs` refuses to hand-edit, forward slashes, matching the path's tail | what a tool writes: generated clients and server stubs, protocol output, a compiled schema, the lockfile (the package manager is its generator); `[]` is a fine answer. Never the migration folder - a new migration must be writable, and the frozen list covers the old ones |
| `<FROZEN_PATHS>` | fills `FROZEN_RAW` in `backend-guard.mjs`: a **JSON array** of regex sources for the files the hook freezes once they are on the upstream default branch (with no remote, once git tracks them), forward slashes, matching the path's tail - never `^`, the test runs on the absolute path | the migration files: the migration tool's config, the folder its command writes to (`git ls-files` shows the numbered, dated or hash-named files). **The regex matches the migration files only, never a file a new migration has to edit** - a Liquibase master changelog or include list, a single append-only changelog, a Flyway repeatable `R__` script, a schema snapshot the tool rewrites: `"db/migrations/V[^/]+\\.sql$"`, not the bare folder; `"Migrations/\\d{14}_[^/]+\\.cs$"` (EF Core - never `*ModelSnapshot.cs`), `"alembic/versions/[^/]+\\.py$"`, `"/migrations/\\d{4}_[^/]+\\.py$"` (Django), `"migrations/\\d+_[^/]+\\.sql$"` (golang-migrate, goose). `[]` when the project has no migrations |
| `<SECRET_PATHS>` | fills `SECRET_RAW` in `backend-guard.mjs` (the built-in list beside it is the constant `SECRET_PATHS`): a **JSON array** of regex sources for the project's secret files beyond the built-in ones (env files, keys, credentials - `.codex/hooks/README.md` names them), matching the path's tail - never `^` | the repo's ignore file: an ignored config with a tracked example beside it (`config/local.settings.json`, `application-local.yml`) is one; `[]` is a fine answer. Read the ignore file and the names, never the files |
| `<FORBIDDEN_COMMANDS>` | fills `FORBIDDEN_RAW` in `backend-guard.mjs`: a **JSON array** of regex sources for the project's own commands that deploy, publish or run against a shared environment, tested against one command with its words joined by single spaces; a match is always refused | the task runner's targets and the manifest's scripts that wrap a deploy or a release (`"\\bmake\\s+deploy(?!\\S)"` - a closing `\\b` would refuse `make deploy-docs` too), a deploy tool the built-in list does not know, and a target or script that runs a migration, a seed or a job against a shared environment (`make migrate-staging`). Not the database wipes: the hook already refuses the ones it can read, and a target that wraps one (`make db-reset`) belongs here when the owner wants it refused too; `[]` is a fine answer |

**The values land inside code and text literals**, so each has a shape it must keep:

- The four lists each sit in a `` String.raw`...` `` template (`guard.mjs`, `backend-guard.mjs`) and are the JSON array itself, written as it would be in a `.json` file (`["app/clients/[^/]+/generated/", "\\.lock$"]` - a regex backslash doubled once for JSON); no backtick and no `${`. **A bare string, a broken array or a bad regex makes that hook refuse every call**, naming the list, until it is fixed; a backtick or `${` breaks the file, and a hook that cannot load allows every call. A placeholder left unfilled reads as an empty list.
- `<CHECK_COMMAND>` sits in `AGENTS.md` as text: one command line with no backtick, valid in every shell the project's developers use - so one plain command. When the checks need several commands or shell syntax: in team mode a task-runner target or script, and its call is the value; in personal mode write `PROJECT/.ai-layer/check.mjs` (Node: one `spawnSync` per command with `stdio: 'inherit'` and `shell: true`, exiting with the first non-zero status, with any flag that keeps the layer's own folders out of a whole-tree tool), and the value is `node .ai-layer/check.mjs`.
- `<SRC_DIR>` sits in single-quoted strings and regexes (`guard.mjs`, its two suites, `layer-refs.mjs`): letters, digits, `_`, `-`, `@` and `/` only, plus a `.` inside a name, never leading - and never `.` itself.
- `<PROJECT>` and `<STACK>` also sit inside a `'''` string of the agents' `.toml` files: never three apostrophes in a row.

When the search above shows no hit in a layer file, the placeholders are done; a `<UPPER_CASE>` token in a file the project wrote itself is not this search's business. The `[fill]` markers are not placeholders - they stay for `init`. `backend-guard-test.mjs` builds its unfilled values from parts, so it never shows a hit.

**Personal mode edits no tracked file to fit the layer** - not `.gitignore`, not the build manifest, not a linter or compiler config. A config change the layer would want (a lint exclude for the layer's folders) is skipped and named in the report with what it costs.

**The linter, the formatter check or any other whole-tree tool** may reach the layer's files (a tool that walks dot-folders honours `.gitignore`, not the exclude file). In team mode propose the tool's own ignore entry for the layer's paths (step 6), never a weakened rule for the whole tree; in personal mode the check command's own flags keep the layer out.

**The git exclusion, by mode.**

- **Personal:** add these lines to the file `git -C "PROJECT" rev-parse --git-path info/exclude` names (`.git/info/exclude` in a plain clone; a relative answer is relative to `PROJECT`), with `apply_patch`: `/AGENTS.md`, `/.codex/`, `/.agents/`, `/.ai-layer/`. No line for a path that is already ignored - name where. When the project tracks files under `.codex/` or `.agents/`, replace the folder lines by one line per layer path instead: `/.codex/hooks/`, `/.codex/hooks.json`, `/.codex/rules/git.rules`, `/.codex/agents/hunt.toml`, `/.codex/agents/drift.toml`, `/.agents/skills/debug/`, `/.agents/skills/handoff/`, `/.agents/skills/retro/`, `/.agents/skills/maintain-ai-layer/`. An exclude never hides a tracked file, so the team's own files in those folders stay visible.
- **Team:** append one line, `.ai-layer/handoff.md`, to the project's `.gitignore` - the hand-off file is per developer. Everything else of the layer is committed, the upkeep stamp `.ai-layer/.last-maintain` included: one `$maintain-ai-layer` run resets the reminder for the whole team. Committing the layer is the team's step, not this install's. A `.gitignore` line that hides part of the layer (`.codex/`, `.agents/`, a bare dot-folder pattern) is replaced only with the user's yes (step 6); without one, that part stays out of git and the report says so.

Then prove it:

```text
git -C "PROJECT" check-ignore -v AGENTS.md .codex/hooks/backend-guard.mjs .agents/skills/debug/SKILL.md .ai-layer/settled.md .ai-layer/handoff.md
```

Personal mode: all five are listed. Team mode: only `.ai-layer/handoff.md` is.

**A real env file that git tracks** (`git -C "PROJECT" ls-files` shows an env file beside the example files) is a finding for the report, by name only: the secrets in it are already in the history, and what to do about that is the owner's call. Do not open it and do not change the ignore file for it.

## 6. Ask, once

What the repo could not answer goes to the user in one round: one numbered list in the reply, every item with the answer you recommend - checked against the repo first - written as `default: <answer>`. Typical items:

- the check command when the project has none, or when it needs a database or a network the default sandbox will not give later sessions; which files are migrations and which are generated; the project's own deploy commands;
- an env file with no secret in it that the project tracks on purpose (`.env.test`) - the built-in list refuses it until its pattern in `SECRET_PATHS` (`backend-guard.mjs`) is narrowed: on the owner's yes, narrow it now, before step 7 registers the hook, add an `(allow)` case for the file to `backend-guard-test.mjs` and run the suite;
- whether local development drives a local cluster or a cloud emulator through `kubectl`, `aws` or `gcloud` - those pass only when the command itself names the local target (`--context kind-...`, `--endpoint-url http://localhost...`);
- **whether the "never commit" policy and the local-only rules stay** (default: they stay) - each is one section of `AGENTS.md` plus its guard checks, and `.codex/hooks/README.md` "Switching a rule off" says how to turn one off. The plain-hyphen rule is not a question: it is always on;
- a conflict from step 2 or 4, a name collision from step 2, in team mode a `.gitignore` line to replace.

An unanswered question keeps its default, marked as assumed. Then apply the answers: fill the values step 5 left open and run its proof. A user who lifts the never-commit policy gets it removed in every place `.codex/hooks/README.md` "Switching a rule off" lists - now, before step 7, while no guard is live: the `AGENTS.md` section, `.codex/rules/git.rules` (delete the copy), the guard hunks and the test cases; a lifted local-only rule is removed the same way.

## 7. hooks.json - the last copy

It registers the guards, so it comes after every other file and every filled value.

- **No `.codex/hooks.json` in the project**: copy the template's.
- **The project has one**: add the layer's registrations (every entry of the template's `hooks` block, under the same events - both `PreToolUse` entries, each with its own matcher) with `apply_patch`. A registration that already runs the same command takes the template's `matcher`, `timeout` and `statusMessage`; never a second entry. Never drop an entry that was there, and keep the JSON valid: `node -p "Object.keys(require(process.argv[1]).hooks).join()" "PROJECT/.codex/hooks.json"` must print the event names.

Never change the command lines: `node "$(git rev-parse --show-cdup).codex/hooks/<hook>.mjs" --harness codex` is the one form measured to work in every shell tried on Windows (PowerShell 7, Windows PowerShell, `bash`, `sh`), a project path with non-ASCII letters included, and without `--harness codex` neither guard blocks anything.

## 8. Prove it, report, hand over

```text
node --check "PROJECT/.codex/hooks/guard.mjs"
node --check "PROJECT/.codex/hooks/backend-guard.mjs"
node --check "PROJECT/.codex/hooks/upkeep-nudge.mjs"
node --check "PROJECT/.agents/skills/maintain-ai-layer/layer-refs.mjs"
node "PROJECT/.codex/hooks/tests/guard-test.mjs"
node "PROJECT/.codex/hooks/tests/guard-shell-test.mjs"
node "PROJECT/.codex/hooks/tests/backend-guard-test.mjs"
node "PROJECT/.codex/hooks/tests/upkeep-nudge-test.mjs"
node "PROJECT/.agents/skills/maintain-ai-layer/layer-refs.mjs"
git -C "PROJECT" grep -n --no-index -E "<[A-Z][A-Z_]{2,}>" -- AGENTS.md .codex .agents .ai-layer
git -C "PROJECT" status --short
```

No `node --check` error (run it on `.ai-layer/check.mjs` too when step 5 wrote one) - a filled value that broke a literal shows here first; each case line reads `ok` and each suite ends with `N passed, 0 failed`; `layer-refs` lists what does not resolve - every hit is explained (a `[fill]` example path is fine) or fixed; the placeholder search shows no layer file. A failing case is a bad list regex nine times out of ten - fix the value, not the test.
**Add one case per list entry**, then run each suite you added a case to again - without them nothing proves a list is live, since an empty list passes too:

- per entry of `<GENERATED_PATHS>`, in `guard-test.mjs`, in the block that starts the guard with `--harness codex`: `['patch: generated client (deny)', 'deny', P(patch('*** Update File: <a path the entry matches>', '@@', '+x'))],`;
- per entry of `<SECRET_PATHS>` and `<FORBIDDEN_COMMANDS>`, in `backend-guard-test.mjs`, at the marked place at the end of its first part - two commented lines there show the shape.

**The frozen list is proved by hand**, since the suite's frozen cases run in a temp repo with sample lists. Write a payload file in the OS temp directory: `{"hook_event_name":"PreToolUse","tool_name":"apply_patch","tool_input":{"command":"*** Begin Patch\n*** Update File: <a migration on the default branch - with no remote, one git tracks - relative to PROJECT, forward slashes>\n@@\n+x\n*** End Patch"},"cwd":"<PROJECT, forward slashes>"}`. Feed it on stdin to `node "PROJECT/.codex/hooks/backend-guard.mjs" --harness codex` (a pipe from `Get-Content -Raw <file>` in PowerShell, `< <file>` in a POSIX shell): it must print one JSON line with `"permissionDecision":"deny"`. The same payload with a new migration's path in the same folder (and the master changelog, where the tool has one) must print nothing.

Where `codex` is on the path and step 6 kept the never-commit policy, `codex execpolicy check --pretty --rules "PROJECT/.codex/rules/git.rules" -- git commit -m x` must answer `forbidden`. **In personal mode `git status --short` must list nothing the install added** - that proves no tracked file changed and the layer is excluded. Then run `<CHECK_COMMAND>` once, **only when what it needs is already up** - a check that wants a database or containers the session did not find running is reported as not run, with what it needs; a failure is the project's pre-existing state, reported, never fixed here - except a failure naming one of the layer's own files, which is the install's own: in team mode propose the tool's ignore entry (step 5), in personal mode put the ignoring flag into the check script.

**The report**, in the user's language, short: the case (first install or update) and the mode; what was read and what was assumed; every file copied, kept, merged or left alone, with what happened to it; the values filled, the four lists entry by entry; the config edits skipped in personal mode, with their cost; the conflicts and collisions with your recommendation; the test results; whether the check command ran.

**End with these three lines, always:**

1. Start a new Codex session in the project, in its usual access mode - full access was for the install only. Trust the project if Codex asks: it loads a project's `.codex/` only for a trusted project.
2. Review the hooks before anything else - `/hooks` in the CLI; in the app Settings > Hooks, where the project is listed with its hooks marked "need review" ("Trust all", or "Trust" on each). The layer's hooks are `guard.mjs`, registered twice, `backend-guard.mjs` and `upkeep-nudge.mjs` - the app lists each under its status line, not its file name: "Checking the call against the repo's prohibitions", "Forgetting the path rules a lost context was shown", "Checking the call for secrets, frozen migrations and outward commands", "Checking when the AI-layer upkeep last ran"; start a new thread once they are trusted. **Codex does not ask for this by itself: it skips an unreviewed hook without a word.** Until they are reviewed only the command rules stand - the plain git verbs `.codex/rules/git.rules` lists are refused, and everything else the guards would refuse, a secret read and a deploy included, goes through - and after any later change to a hook (a list entry included) that hook is skipped again until reviewed again. To see that both guards are live, ask Codex to run the shell command `cd .`, then `Get-Content .env.layer-probe`: answers beginning "Blocked by .codex/hooks/guard.mjs" and "Blocked by .codex/hooks/backend-guard.mjs" mean they are; a command that simply runs (a missing file is that) means its hook is still off.
3. Then run `$maintain-ai-layer init` at high reasoning effort: it writes the project sections of `AGENTS.md`, builds the path rules from the code, and tunes the hunt angles to this project. It asks once where the local env file points - no file it may read answers that. The session-start reminder will say `$maintain-ai-layer` is due until `init` has run - it means this `init` run.

## U. Updating a layer installed earlier

The project carries a layer from an older version of this bootstrap, possibly tuned since. The template is the new version of the generic parts; the project owns everything it filled or wrote. **The old layer's guards are live in this session**: they refuse a shell copy or move into the project, any patch or shell delete that touches `.codex/hooks/`, `.codex/hooks.json`, `.codex/rules/`, `.codex/agents/` or `.codex/config.toml`, a path under `.git`, and a patch to a migration on the default branch. So the update has two halves: what you write yourself, and what you prepare for the developer to copy.

**The mode is kept.** Read it from the `Layer tracking` line of `AGENTS.md`; nothing moves between modes.

**Before the first write, make the old layer recoverable.** Team: `git -C "PROJECT" status --short -- AGENTS.md .codex .agents .ai-layer` must print nothing - otherwise ask the owner to commit the layer and wait; that commit is the base for every diff. Personal: copy `AGENTS.md`, `.codex/`, `.agents/` and `.ai-layer/` into a new folder under the OS temp directory, named in the report.

**A rule the owner switched off stays off.** A section, a rules file or a guard check the template has and the project lacks is never restored unasked: list them and ask once whether each was removed on purpose. Where `AGENTS.md` has no "Never Commit or Push" section, the never-commit question is not asked again, `git.rules` is not restored, and the removed guard and test hunks are ported as deliberate. The same holds for a removed local-only rule and a deleted `backend-guard.mjs` rule.

1. **Compare.** For every file of `BOOT/template/`, `git diff --no-index --stat -- "PROJECT/<path>" "BOOT/template/<path>"` (a missing project file is new). For every layer file in the project that the template no longer has, find out whether it was the layer's (it carries the bootstrap's shape and an older version's file list names it) or the project's own.
2. **What you write yourself** - `AGENTS.md`, everything under `.ai-layer/`, and the skills under `.agents/skills/`, with `apply_patch`:
   - **Generic files** - the skills the project has not tuned: take the template's version (replace the file's content; a new file is an `*** Add File`).
   - **Tuned files - never replaced wholesale:** the filled `AGENTS.md`, `.ai-layer/hunt-angles.md`, `.ai-layer/settled.md`, `.ai-layer/layer-refs-prefixes`, the project's `.ai-layer/rules/*.md`, and the project's own skills. Port the template's changes to the layer text in them hunk by hunk, keeping the project's filled parts; a template section that replaces one the project filled keeps the project's facts.
   - A layer file the template dropped is deleted (a `*** Delete File` patch, one path per call) once nothing the project wrote depends on it and every reference to it is gone.
3. **What the developer copies** - the hooks and their tests, `hooks.json`, `git.rules`, the two agents. Prepare the new version of each changed file in a new folder under the OS temp directory, laid out as it will sit in the project (`<folder>/.codex/hooks/backend-guard.mjs`, ...): copy the template's file there, then re-apply the placeholder values the installed copy carries (step 5 - read them from the installed copy, the four lists included) and port every hunk the project changed on purpose (an extra guard case, an added list entry, a `rule(...)` line deleted to allow its own deploy, a switched-off rule). Prove them **there**: `node --check` on each script, and the four suites run from that folder's `.codex/hooks/tests/` - they find the hooks beside them. Then `git diff --no-index -- "<folder>/<path>" "BOOT/template/<path>"` for each prepared file must show only the filled placeholder lines and the hunks kept on purpose. A `hooks.json` the project extended keeps its own entries (step 7's merge, made in the prepared copy). In personal mode an exclude line the new version needs is handed over the same way.
4. **Hand over.** Give the developer one numbered list: each prepared file with the copy command for their own terminal (source in the temp folder, target in the project), one command per line, then the deletes of hook files the template dropped. Say plainly that until they run it the project keeps the old hooks.
5. Then step 6 for what this version asks that an older one did not, and step 8's proof for the half you wrote (`layer-refs`, the placeholder search, `git status --short`). **The report** adds, per file: taken from the template, ported hunk by hunk, kept as the project's, deleted, or prepared for the developer - and why.

**End an update with these lines:** the numbered copy list; then "review the hooks again (`/hooks` in the CLI, Settings > Hooks in the app) - a changed hook is skipped until it is reviewed, so after the copy nothing is guarded until you do"; then "`$maintain-ai-layer init` brings the project sections and the rules up to date with the new layer; it updates, it never rebuilds".
