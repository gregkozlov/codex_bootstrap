# deep mode

The default mode, about once a month. **The mechanical checks are commands in the main thread** (M1-M4); then `drift` over every unit, the rules, consistency, hooks and a walk of whole tasks (D1-D6).

## M1. Baseline

Run these and copy the numbers into the run file:

```text
git status --short --branch
git log --oneline -1
node .agents/skills/maintain-ai-layer/layer-refs.mjs      # dead paths, package scripts, skill and agent names in the layer and every tracked *.md
```

Then the sizes in bytes - `AGENTS.md`, each `.ai-layer/rules/*.md` with the rule count and their total, `.ai-layer/hunt-angles.md` (`wc -c` in a POSIX shell, `(Get-Item <file>).Length` in PowerShell).

## M2. Mechanical fixes

- **`layer-refs` hits.** Find where each dead reference went (`git log --diff-filter=R --name-status -- <old path>`, or search for the identifier) and correct it; a hit in a file the layer does not own, or in one this skill only reports (`SKILL.md`, Standing rules), is reported, not edited. A path or package command deliberately named as something that must not exist or is not tracked (a forbidden folder, a refused command form, a placeholder in an example) is not stale - leave it, and say so once in the report.
- **Rule globs.** For every `.ai-layer/rules/*.md`, measure each glob of its `paths:` ("Measuring a rule" in `SKILL.md`). A glob matching nothing points at code that moved - point it there, or drop it. A rule left with no glob is merged into a neighbour or deleted; a rule with no `paths:` at all reaches every path - give it globs or move its text into `AGENTS.md` within the budget.
- **The index.** Every rule file has one line in `AGENTS.md` "Path rules", and every line there names a file that exists: add the missing line, delete the dead one. A file in `.ai-layer/rules/` that is not a rule (a note, a draft) moves out - the hook reads every `*.md` there as one.
- **Counts.** Search `AGENTS.md` and the rules for a number or number word attached to something countable ("the six hooks", "two routes", "a handful of sites"), re-measure each with a command, and fix the wrong ones. Where a count keeps drifting, replace it with the search that finds the sites.

## M3. Always-on text

- **`AGENTS.md`:** delete text that is true but dead - a status, an instruction for a change already applied, an alternative nothing uses, a paragraph a rule already says. Text only one area needs - a mechanic, or a prohibition about code in files a rule covers - moves to the rule that reaches that area, with nothing but the index line left behind; a prohibition that must be known before any file is touched stays.
- **Descriptions:** the `description` of every skill that may be invoked implicitly (no `agents/openai.yaml` with `allow_implicit_invocation: false`) is listed in every session. One over ~300 characters is reported with its trimmed form, down to the trigger phrases.
- **The hunt angles** stay under the budget `.ai-layer/hunt-angles.md` states for itself; past it, merge same-class angles and drop retired ones - a class a lint rule now catches, an API that is gone.

## M4. Consistency

- Every skill and agent a file names exists (`layer-refs` covers the names), and every step number another file cites matches `AGENTS.md` Development Workflow: `git grep -n --no-index -e "step [0-9]" -- AGENTS.md .codex .agents .ai-layer`.
- `hunt`'s two modes match what lifecycle steps 2 and 4 hand it, and `drift`'s two what lifecycle step 5 and this skill hand it.

## D1. drift over every unit

The units are:

- each `##` and `###` section of `AGENTS.md` (`git grep -n --no-index -e "^##" -- AGENTS.md`);
- each `.ai-layer/rules/*.md`, and `.ai-layer/hunt-angles.md`;
- each `.codex/agents/*.toml`;
- each skill's `SKILL.md` plus its `references/*.md`;
- `.codex/hooks/README.md`;
- every tracked README in the source folders (`AGENTS.md` Folder conventions lists them), generated ones left out.

Spawn one `drift` in `section` mode per unit, in waves of up to **eight in parallel**. Each run lists only the claims that need action, and each prompt carries `.ai-layer/settled.md` and this run's decisions so far. Between waves, check the returned pairs and apply or report them (`SKILL.md`, Standing rules), so that the next wave reads the corrected text. An `unverifiable` claim goes to the report as unverified, a `code-violates-policy` one as a code finding.

## D2. Rules

Run `references/rules.md`: R1's inventory (M1-M2 already ran); R2's two decisions - a rule whose subject is gone, a rule that restates another - on D1's results for the rule files; then R3-R5 - reach both ways, the split, and the rules the code needs. A layer with no project rule runs R7 instead of R2-R5.

## D3. Cross-file consistency

Check that each rule is stated once. Find a statement that appears in two files with different content: search for its key phrase across the layer (`SKILL.md`, "Searching the layer"). The copy that survives is chosen by the "where text lives" standing rule in `SKILL.md`.

Two more checks:

- The lifecycle steps live only in `AGENTS.md` Development Workflow. A restatement elsewhere becomes a pointer.
- Each agent's description matches how `AGENTS.md` and the skills spawn it.

## D4. Hooks, command rules and agents (report only)

Every command in `.codex/hooks.json` must point to an existing file, and every hook file must be registered and described in `.codex/hooks/README.md`. The `forbidden` rules in `.codex/rules/git.rules` must still match what `AGENTS.md` "Version Control" forbids, and no rule there may be an `allow`. The three project lists at the top of `backend-guard.mjs` must still match what the code shows: every migration folder under its frozen list, every secret file the repo's ignore file names under its secret list, the project's own deploy and reset commands under its forbidden list. Each `.codex/agents/*.toml` carries `model_reasoning_effort = "high"` and no `model`. Run the hooks' self-tests (`.codex/hooks/tests/*.mjs`, each with `node`): each case line reads `ok` and each suite ends with `N passed, 0 failed`. The README is fact-checked in D1. A mismatch goes to the report, and nothing under `.codex/` is edited. The report also reminds the developer of what no session can see: a hook changed since it was last trusted is skipped until it is reviewed again.

## D5. Workflow walk

A `drift` run checks one unit, so a break at the seam between two steps passes every run. This step walks whole tasks through the lifecycle. Spawn two `default` agents in parallel, read-only: they may run `git grep`, `git log` and the shell's read commands, and they never patch or write a file. Each one reads the `AGENTS.md` "Version Control", "Shell and file edits", "Data, secrets and the outside world", "Path rules", "Sub-agents" and "Development Workflow" sections, the `debug`, `handoff` and `retro` skills, `.codex/agents/hunt.toml` and `drift.toml`, `.codex/hooks/README.md`, the hook files, `.codex/hooks.json` and `.codex/rules/git.rules`.

- (a) walks a **bounded** fix, and then the same fix as **super-trivial** and under "no subagents";
- (b) walks a **contract change** that carries a migration through its plan, and a **bug report** from a shared environment through `debug`.

At every step, the agent checks:

- **Inputs:** what the step needs, and which earlier step produces it.
- **Outputs:** what the step hands on, and who consumes it.
- **Agent prompts:** what the step says to put in an agent's prompt, against what that agent's instructions demand, its fence and its modes.
- **Hooks and the sandbox:** what `guard`, `backend-guard` and `upkeep-nudge` do at that point, against what the step expects - a step that needs a call one of them refuses (a secret read, a migration reset, a write to a shared environment), or one the default sandbox stops with no word on who runs it, is a break.
- **Skips and the spawn budget:** whether the skip rule and the spawn count ("usually 1-2, at most 5") agree across files.

Each agent returns only the breaks. A break is a step that cannot run as written, an input nothing produces, or two files that disagree. Each break comes with the scenario, the step, and both texts quoted verbatim. The fix is either an exact `replace:` / `with:` pair or "design question for the owner". A contradiction with one plainly right side is applied under the standing rules. A process gap, such as a missing step, a reorder, or a defect that passes every reviewer, goes to the report as a proposal, because the shape of the process is the owner's call. A break in hook code, the registration, the command rules or an agent file goes to the report only.

## D6. Verify and report

Re-run the M1 commands, then the project's check command once, only when what it needs is already up and the sandbox lets it run: a failure in a file this run did not touch belongs to someone else - say so and leave it. Stamp the run - in team mode the stamp is one more file for the owner to commit - and write the report (`SKILL.md`).
