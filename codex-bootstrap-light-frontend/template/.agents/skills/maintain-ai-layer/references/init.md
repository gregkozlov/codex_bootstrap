# init mode

Turns a freshly installed layer into **this** project's layer: the project sections of `AGENTS.md` written from facts found in the repo, a path-scoped rule set built or brought up to date and enriched, and the project-tuned files of the layer written. It runs right after the install (`INSTALL.md` ends by asking for it), and again whenever the owner wants: a second `init` on a filled layer is the normal case, not an error - it takes the same path, correcting what went stale and adding what is missing, never rewriting from scratch.

How it differs from the other modes: `rules` works on the rule set alone, without `AGENTS.md` and without the tuning; `deep` audits every file of the layer as it stands. `init` reads the project first and writes the project-specific parts: `AGENTS.md`, the rules and the tuned files. It runs the `rules` steps by reference and does not restate them.

Every standing rule of `SKILL.md` holds, and so does its "Record the run". Everything this mode writes is `AGENTS.md` or a file under `.ai-layer/`, so it runs in the default sandbox. The survey below is deliberately thorough - a cheap layer saves spawns elsewhere, never here, since a rule set built on a thin survey costs every later session.

## I1. Survey

First the current state, in the main thread: the size of `AGENTS.md` in bytes, `git grep -n --no-index -F "[fill]" -- AGENTS.md .codex .agents .ai-layer`, the bootstrap note at the top of `AGENTS.md` (still there, or gone), and the files in `.ai-layer/rules` (none but `.gitkeep` means no project rule yet). The answer decides the shape of the run: `AGENTS.md` sections still `[fill]` are written, filled ones are corrected and completed (I2); no project rule means building the set, existing rules mean updating and enriching them (I3).

Then spawn these read-only agents in one turn, each by `SKILL.md`'s spawn rule, each told never to patch, never to write a file, and never to `cd` (absolute paths, `git -C <tree>`):

- (a) **`explorer`, the toolchain:** the package manifest and its scripts (the real check, build, dev, generation and lint commands - never a lockfile), the build, type-check and lint configs, and **what the linter and the type checker already enforce** - their rule lists and ignore lists - since a rule that restates an enforced check is dead text.
- (b) **`explorer`, the layout:** `git ls-files` per top-level folder with counts, the real source directory, the naming and folder conventions visible in the code (three sites each), the shared modules other code imports most (`git grep -l` by import), and what is generated - a folder or file a generator in the manifest rewrites (an API client, protobuf output, migrations, a minified config) - with the command that regenerates it.
- (c) **`explorer`, the written knowledge:** `README*`, `CONTRIBUTING*`, `docs/`, ADRs, another tool's instruction files (`CLAUDE.md` and its rules folder, `.cursorrules`, `.github/copilot-instructions.md`), a decisions or won't-fix list, and whatever the install merged from an earlier `AGENTS.md` (its project facts, its prohibitions); plus the current `AGENTS.md` and every `.ai-layer/rules/*.md`. It returns the facts, the stated conventions, the deliberate exceptions with their reasons, and every statement that contradicts the code.
- (d) **`default`, the fix history:** `git log --since=12.months --no-merges -i --grep="^fix" --format="%h %s" --name-only` (widen the `--grep` to the project's own fix-subject convention after a look at `git log --format=%s -50`), each commit's diff read with `git show`; it names each defect class, and returns the classes fixed twice or once in a shared module, with the commits and the files they touched.

Each prompt names the folders it may read. Write the four answers' substance into the run file before the next step: they are the evidence every later step cites.

## I2. AGENTS.md

- **Every `[fill]` section is written from I1's facts alone**: the stack, the commands, the folder conventions, the generated code, the architecture facts an agent cannot derive from the code in a minute (the deliberate exceptions, the traps with a history, the "looks like a bug and is not" list), the code-style rules no linter enforces. Not an inventory of folders, not a restatement of a framework's docs, not a rule the linter already enforces.
- **A command goes in only once it was found in the manifest**; a read-only check among them (type-check, lint, build) is also run once, and its output is the evidence. Never run a command that writes tracked files or reaches outside the machine (a generator, a migration, a deploy, a publish) or a dev server - document it from the manifest, or ask in I5. A check command that fails is written down as the project's pre-existing state, never fixed here; one the sandbox stops is the owner's to run - name it in the report.
- **Each standing decision a reviewer would otherwise flag** is marked settled and deliberate, with its reason.
- **Where text lives:** a prohibition that must be known before any file is touched (never create X, which tool to pick) goes into `AGENTS.md`; a convention, a mechanic or a prohibition about code in certain files is rule text (I3). Keep `AGENTS.md` under the budget its "Surgical Changes" section states; more is a signal to move detail into a rule, not to pad.
- **A section already filled is not rewritten**: a statement the code contradicts is corrected, a missing project fact is added, the rest stays in the owner's words.
- A `[fill]` the repo cannot answer becomes a question (I5), never a guess; a section that has nothing to say yet keeps one line saying so.
- **The `Layer tracking` line is the install's**: never rewrite it. In a personal layer no tracked file of the project is edited.
- When nothing is `[fill]` any more, delete the bootstrap note at the top of `AGENTS.md`.

## I3. Rules

Read `references/rules.md` "Writing a rule" first, and measure every rule as `SKILL.md` "Measuring a rule" says.

- **No project rule:** run `references/rules.md` R7, handing its candidate agents I1's answers so they do not survey again.
- **Rules already there - update and enrich them, never rebuild:** run `references/rules.md` R1-R5. Every existing rule is checked against the code: stale facts corrected, dead lines removed, `paths:` fitted to the real call sites both ways, a rule whose sections serve different files split. Then **enrich**: the useful project knowledge the rules do not hold yet - conventions the code shows, traps from the fix history (I1 d), protected paths, the contracts of shared modules (I1 b).
- **What may become rule text**, on top of R5's five conditions: every statement carries its evidence - three or more real sites, or a fix commit - in the run file; it does not repeat the linter, the type checker or `AGENTS.md`; and it helps whoever edits the files under its glob. A statement with no evidence is a question for the owner (I5), never a rule.
- Every rule is path-scoped, its globs point at the files that really call what it describes, its reach is measured before and after, it has its index line in `AGENTS.md` "Path rules" (the `[fill]` line there is replaced by the index, or by one line saying there is no rule yet), and it stays within the per-rule budget `references/rules.md` states.
- **The project's own style and decisions are kept**: the wording of an existing rule, an entry of `.ai-layer/settled.md`, and anything `AGENTS.md` marks settled.

## I4. Tune the project's files

Two files under `.ai-layer/` carry generic defaults that only the project can settle. Write each from I1's facts:

- `.ai-layer/hunt-angles.md` - keep the shape of the attack angles; delete the classes the stack cannot produce, and add one per defect class I1 (d) found fixed twice, each as a concrete check; stay inside the budget the file states.
- `.ai-layer/layer-refs-prefixes` - the project's other top-level folders a doc names by path, one prefix per line (`packages/`); `layer-refs.mjs` reads it. A project with one source folder needs no such file.

Then every other `[fill]` the step-I1 search found under `.ai-layer/`. One it found under `.codex/` or `.agents/` is reported with the text to put there.

## I5. Questions - one round

What the repo could not answer goes to the owner once, after I2-I4, as `AGENTS.md` "Questions" says: one numbered list in the reply, every item with a recommendation checked against the code first, written as `default: <answer>`. Typical items: a check command when the project has none (in a team layer, propose the package script that would chain the checks; in a personal one, a command the layer owns, never a package script; never invent a command), a candidate rule with too little evidence, a contradiction between an old doc and the code, whether the never-commit policy the layer ships stays (the hooks README says how the developer switches it off; the plain-hyphen rule has no off-switch). Apply the answers; a question left unanswered keeps its default, marked as assumed in the report.

## I6. Verify, report, stamp

```text
git grep -n --no-index -F "[fill]" -- AGENTS.md .codex .agents .ai-layer
git grep -n --no-index -E "<[A-Z][A-Z_]{2,}>" -- AGENTS.md .codex .agents .ai-layer
node .agents/skills/maintain-ai-layer/layer-refs.mjs
```

No `[fill]` left but the ones I5 left open and the mentions of the marker in `maintain-ai-layer`'s own `SKILL.md` and `init.md`; no unfilled placeholder; every `layer-refs` hit explained; `AGENTS.md` inside its budget; every rule's reach measured once more, and the index in step with the folder. Then the project's check command, run once - a failure in a file this run did not touch is the project's own state.

The report, in the user's language: what the survey read; the `AGENTS.md` sections written and the ones corrected; the rules created, updated, split and deleted, and the knowledge added, each with the evidence it stands on (sites or a commit); the candidates rejected, each with the condition it failed; the files tuned; the questions with their answers or assumed defaults; the numbers before and after (`AGENTS.md` bytes, rule count and bytes, reach); and what is left to the owner (a pair for `.codex/` or for a skill the sandbox kept read-only, a check the sandbox stopped).

Last, write today's date (`YYYY-MM-DD`, the only line) into `.ai-layer/.last-maintain` with `apply_patch` - committed with the layer in team mode, per machine in a personal one: the layer was just checked against the repo, and `upkeep-nudge.mjs` counts the days to the next pass from it. In team mode the stamp is one more file for the owner to commit.
