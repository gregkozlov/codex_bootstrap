---
name: maintain-ai-layer
description: Upkeep of the AI layer against the code - deep (default, about monthly), rules; init fills AGENTS.md, the path rules and the hunt angles after an install. Use on "$maintain-ai-layer", "maintain the AI layer", "audit the layer", "optimize the rules".
---

# maintain-ai-layer

The AI layer rots quietly: a file moves and a rule still names it, a count grows, a glob matches nothing or a whole rule is handed over for files it never mentions, an `AGENTS.md` paragraph describes code that changed. This skill is the recurring pass that fixes that. It never touches the source code, and it runs nothing that needs the service, a database or a secret but the project's own check command. The deliverable is the edited layer plus the report.

## Mode

The word after the skill's name in the user's message picks the mode (`$maintain-ai-layer rules`), and the first line of the reply names it. With no such word, when `AGENTS.md` still carries `[fill]` lines, the mode is `init` - say so in the first line. Each mode's steps live in `references/<mode>.md` in this skill's folder (an alias reads its mode's file): read that file before the first step, and only the others it names, plus `.ai-layer/settled.md` (Standing rules).

- **`deep`** (also `deep-audit`, and the default with no mode word on a filled layer) - about once a month, when the session-start reminder asks, and after a large refactor: the mechanical checks in the main thread (dead references, rule globs that match nothing, wrong counts, always-on bytes), then a `drift` fact-check of every layer file, the `rules` steps, cross-file consistency, the hooks and a walk of whole tasks through the lifecycle. Dozens of agent spawns.
- **`rules`** - the rule set alone, in depth: every rule checked against the code, `paths:` over- and under-reach, a rule whose sections serve different files split, new rules from a sweep of the code and its fix history, stale ones corrected or deleted. With no project rule, it builds the set from the whole project. Run it after a large code change.
- **`init`** - the project-specific parts, from a survey of the repo: the `[fill]` sections of `AGENTS.md`, the rule set built or updated and enriched, and the hunt angles tuned to the project. Run it once right after the install, and again whenever the project has moved on; a second run updates, it never rebuilds. `rules` touches the rules alone, `deep` audits the layer as it stands.

**Every mode spends agent spawns by the dozen, and only when the user starts it** - the reminder tells the user, it never starts a run. `deep` is the routine one, about monthly; `rules` runs on request. `init` is thorough by design, because every later session pays for a rule set built on a thin survey.

## Measuring a rule

The `guard` hook is what hands a rule over, so the reach of a rule - the files whose first patch brings it - is what `guard` matches. Two measurements, both read-only:

- **From a file to its rules:** `node .codex/hooks/guard.mjs --harness codex --rules-for <file>...` from the repo root prints every rule file that reaches those paths. It is the hook's own matching, so it is the truth.
- **From a rule to its files:** for each item of its `paths:` list, `git ls-files --cached --others --exclude-standard ':(glob)<glob>'`. Three places where git and the hook read a glob differently: a brace group (`*.{yml,yaml}`) is expanded by hand, one call per alternative; a glob without a slash matches at any depth for the hook, so measure it as `**/<glob>` too; a trailing `/**` the hook strips, which reaches the same files. The union is the rule's reach. Spot-check it with `--rules-for` on one file inside the reach and one outside.

A rule the hook reads no `paths:` from (no frontmatter, a misspelled key, a flow list) reaches every path: the first patch of every session is refused with it. **Every `*.md` in `.ai-layer/rules/` is a rule** - a note or a draft never goes there.

## Standing rules (all modes)

**This skill applies what it verified itself**, with no approval round: a stale fact, a dead line, a misplaced paragraph, a glob change goes in once one command of your own has confirmed it against the code. These limits still hold, because they come from `AGENTS.md` and this skill cannot lift them:

- **Check every finding before applying it.** An agent's `replace:` / `with:` pair is re-verified with one command of your own before the patch. A finding you reject is logged with its reason.
- **Where text lives:** a prohibition that must be known before any file is touched stays in `AGENTS.md`; one about code in a file a rule covers, and every detail, goes to the `.ai-layer/rules/*.md` file whose `paths:` reach that code. `AGENTS.md` stays under its 24 KiB budget (its size in bytes). Every rule file has one index line in `AGENTS.md` "Path rules", and every index line names a file that exists.
- **A `paths:` change is measured before and after** ("Measuring a rule"): the files that needed the rule are still reached, and the ones that did not are gone. A glob is never widened to reach one more file - the text moves to the rule whose globs already reach it.
- **The code is not the doc's servant.** When code breaks a written policy in several places, the policy is rewritten only if `git log` shows a deliberate move away from it. Otherwise it is a code finding for the report, and this skill never fixes it.
- **Settled is settled.** A decision `AGENTS.md` marks as settled and deliberate is not reopened; a finding against one goes to the report as a note about the decision, not a defect. Findings earlier runs settled are in `.ai-layer/settled.md`: every agent prompt carries that list, a matching finding is logged as settled and not reported, and the run appends each new owner answer and each accepted rejection to it.
- **What this skill writes, and what it only reports.** It patches `AGENTS.md` and everything under `.ai-layer/`. **Never edited, only reported:** `.codex/**` - the hooks, their registration, the command rules, the agents; `guard` refuses a session's write there; a stale entry in a hook's project lists - a migration folder that moved, a new secret file - is a report line with the exact entry to add (`PROTECTED_PATHS` in `guard.mjs`, `FROZEN_RAW`, `SECRET_RAW` and `FORBIDDEN_RAW` in `backend-guard.mjs`) - the generated paths the guard protects and the committed migrations `backend-guard` freezes. A correction to one of those is handed to the developer as an exact `replace:` / `with:` pair. A skill file under `.agents/skills/` is patched once; when the sandbox stops that write, the pair is handed over the same way - never worked around.
- **A team layer is shared.** With `Layer tracking: team`, a personal preference never goes into `AGENTS.md` or a rule: it belongs in the developer's own global instructions file, theirs to edit, and goes into the report as a suggestion.
- **Searching the layer:** a personal install keeps the layer out of git, and most search tools skip dot-folders, so a low-hit answer from the repo root proves nothing: name the files, `git grep -n --no-index -e <pattern> -- AGENTS.md .codex .agents .ai-layer` (`git grep` is always there; another search tool may not be). Every agent prompt that searches the layer carries this.
- **Edits use `apply_patch` only.** No commits, plain hyphens. In a team layer, if the branch is not the default one, say so before the first edit - an AI-layer edit riding on a feature branch is the owner's call.
- **Record the run** in `ai-layer-<mode>.md` in the OS temp directory: the mode, the baseline numbers, every finding with its decision (applied, rejected with the reason, reported), and the numbers after. Every agent prompt names the files it may read and carries the decisions this run already took. A run that may outlive the session (`deep`, `rules`, `init`) runs the `handoff` skill before the context is compacted, naming that file.
- **Stamp the run.** A `deep` or `init` run in the main tree ends by writing today's date (`YYYY-MM-DD`, the only line) into `.ai-layer/.last-maintain` with `apply_patch` - committed with the layer in team mode, per machine in a personal one; `upkeep-nudge.mjs` reads it at session start and asks for the next pass after 30 days. In team mode the stamp is one more file for the owner to commit. `rules` does not stamp.
- **This skill explicitly asks for sub-agents**: the custom `drift` and the built-in `explorer` and `default`, in the numbers its mode files state, by `AGENTS.md` "Sub-agents" - every `spawn_agent` call with `reasoning_effort: "high"`, `fork_turns: "none"`, no `model`, and a self-contained prompt. Each is told it is read-only; `guard` holds `drift` and `explorer` to that, a `default` agent only its prompt does. A wave is as many agents as the mode file says, fewer where the session's own agent limit is lower.

## Report

The `deep` and `rules` report is in the user's language and short (`init` writes the report its own file names):

1. **Mode and what ran** - each agent type with its count (`drift` x24 in 3 waves, `default` x2), and every step skipped, with the reason.
2. **Numbers, before -> after** - `AGENTS.md` bytes; the rule count and total rule bytes; `layer-refs` unresolved; the check command.
3. **Applied** - grouped by file, one line per change; the rules added, split, merged and deleted come first, each with its reason.
4. **Reported, not applied** - the pairs for `.codex/` and for any skill file the sandbox kept read-only, code findings, findings against settled decisions, workflow design proposals; each answerable in one line.
5. **Not checked** - `unverifiable` claims, and every step skipped with its reason (a check command whose database was not up, or that the sandbox stopped).
