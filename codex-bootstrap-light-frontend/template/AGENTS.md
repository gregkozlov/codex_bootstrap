# AGENTS.md

<!-- Bootstrap note: sections marked [fill] are the project's - `$maintain-ai-layer init` writes them from the repo
     and builds the path rules. The rest is the working layer, kept as-is. `init` deletes this note. -->

# General Rules

Bias toward caution over speed. For trivial tasks use judgment, but avoid silent assumptions or unnecessary changes.

### Working Principles

- **No sycophancy.** If a solution looks questionable, overcomplicated, risky or inconsistent with the architecture, say so and propose a concrete alternative. When the user pushes back, restate the reasoning rather than folding; change position only if theirs is better.
- **Think before coding.** State the assumptions that affect the solution, present multiple readings instead of picking one silently, and stop and ask when something important is unclear.
- **Questions.** Where `request_user_input` is available (plan mode): at most three questions per call, each with two or three options. Anywhere else, or with more to ask, one numbered list in the reply. Every question carries a recommendation researched in the code, the docs or the installed source: in the dialog first and labelled "(Recommended)", in the list as `default: <answer>` - the one you take if the user does not answer.
- **Reply in the language of the user's latest message**, and switch with them mid-conversation. A message that only names a skill, or one without prose, sets no language: keep the conversation's language. Repo files stay in the project's own language.
- **Simplicity first.** The minimum code that solves the stated problem: no features beyond what was asked, no abstractions for single-use code, no unrequested configurability, no error handling for cases the current flow cannot produce, no large rewrite where a small change does.
- **Reachability bar.** A defect counts only when one real user, in one tab, at human speed, on a working connection, reaches it through the product's own interface in ordinary work. Every finding states its click path - who, which screen, which clicks; without one it is not a finding.
  - Out of scope, in code and in review - not coded for, not reported as a defect, no rule written for it: two tabs or two sessions acting at once; a request paused offline; an unmount in the middle of an await; an action landing in the instant between a response and its re-render; prototype-key strings (`__proto__`, `constructor`) as data; a backend answer outside its contract; hand-edited storage or URLs; two controls of one form clicked at nearly the same moment (Save, then Cancel before the save starts).
  - Always in: a double click on Save or Confirm; a background refetch wiping typed input; a token written to storage; a permission check that fails open; silent data loss on a plain save.
  - [fill] Adjust the two lists to the project's UI (desktop-only, mobile, embedded), or keep them for a web UI.
  - A borderline case is one line under "Not pursued" (`file:line - scenario - why unlikely`): no severity, no fix, no extra round. Guards that already exist in the code stay and keep being used where their pattern is extended; new ones for out-of-scope cases are not added. This bar outranks any path rule that guards such a case.

### Surgical Changes

Touch only what is required for the task.

- Do not improve or refactor adjacent code, comments, formatting or naming unless required - match the existing style even where another would be better.
- If unrelated dead code is found, mention it, but do not delete it unless asked.
- Remove imports, variables, functions, and types made unused **by your own changes**; leave pre-existing unused code alone.
- **Documentation drift exception:** when a change makes a statement in `AGENTS.md`, `.ai-layer/rules/*.md`, or another repo doc describing the changed code outdated, update that doc in the same change without asking.
- **`AGENTS.md` stays under 20 KB** (its size in bytes): dead text goes first, then detail moves to a `.ai-layer/rules/*.md` whose `paths:` reach its code. **A prohibition that must be known before any file is touched stays here**; one about code a rule covers lives in that rule alone.

### Version Control - Never Commit or Push

Apply file changes only; leave them in the working tree for review.

- Never run any command that creates a commit, rewrites history, publishes, or discards working-tree changes. Do not stage in order to commit, do not amend, do not open or update pull requests. Read-only git (`status`, `diff`, `log`, `show`) is fine.
- **Layer tracking: [fill] team or personal** - the install writes it.
- Do not ask for permission - the answer is always no. The author reviews and commits everything themselves.
- The `forbidden` rules in `.codex/rules/git.rules` and the `guard` hook are backstops, not the rule (`.codex/hooks/README.md` says how a project lifts it); no `allow` rule goes into a `.codex/rules/` file - there it means "run outside the sandbox without asking".

### Shell and file edits

- **A file in this repo is changed with `apply_patch`, never from the shell** (`sed -i`, a redirect or a heredoc into it, `Set-Content`, `Out-File`, a patch piped through the shell); scratch files go to the OS temp directory. **Deleting a file the change itself orphaned is the one granted removal** - one path per call, as a `*** Delete File` patch or a plain shell delete with no recursive flag, never a generated path, anything under `.git`, or the layer's own `.codex/hooks/`, `.codex/hooks.json`, `.codex/rules/`, `.codex/agents/` and `.codex/config.toml`: those the developer changes, never a session - say what should change.
- **The repo's generators run with no confirmation.** [fill] Name them - the code generator, the schema fetcher, the lockfile's package manager, any build step that rewrites a tracked file. They are how the files `guard` refuses to hand-edit change: regenerate, never report one as unfixable.
- **A regex or a path with backslashes is built in a script file** in the temp directory (`node <file>`), never typed inline - or with `String.fromCharCode` where the escape itself must not appear in the source.
- **Never `cd` or `Set-Location` in a command**, in a subshell either - `guard` refuses it, since the paths after it cannot be judged. To run somewhere else, set the command tool's working-directory argument; otherwise absolute paths and `git -C <tree>`. Every prompt to a spawned agent carries this rule.
- **Never open an interactive shell or REPL** (`pwsh`, `bash -i`, a bare `node` or `python`): what is typed into one reaches no check, so `guard` refuses to start it. Run the command or the script itself.
- **Search with `git grep`** - it is on every machine this layer runs on; another search tool may not be. A personal install keeps the layer out of git, and most search tools skip dot-folders, so search the layer by name: `git grep -n --no-index -e <pattern> -- AGENTS.md .codex .agents .ai-layer`. A zero-hit search from the root proves nothing there.
- **Never start or stop the dev server** - it belongs to the user; with none running, ask. **Never edit Codex configuration** to get a command through: a command the sandbox stops is the user's to run - name it and what it would prove.

### Path rules

Detail that only some files need lives in `.ai-layer/rules/<subject>.md`, each opening with a `paths:` list of globs. Codex scopes instructions by directory only, so the `guard` hook hands a rule over: **the first patch to a path a rule reaches is refused once per session, naming the rule file - read that file in full, then send the same patch again.** That is the procedure working, not an error, and never a reason to reach the file another way.

- **Before planning or reviewing a change, ask which rules reach its files**: `node .codex/hooks/guard.mjs --harness codex --rules-for <file>...` from the repo root prints them. Read each before the plan is written, and name them in every reviewer's prompt - a reviewer never patches, so nothing else shows it a rule.
- After a context compaction the rule text is gone with the rest, and `guard` is registered to hand each rule over again. If a patch to a ruled path passes unrefused then, run `--rules-for` and re-read the rules yourself.
- The index, one line per rule - `maintain-ai-layer` keeps it in step with the folder:
  - [fill] `.ai-layer/rules/<subject>.md` - what it covers, in a few words. No rule yet: this line says so.

### Sub-agents

**This file asks for sub-agents explicitly, by name**: `hunt` and `drift` (`.codex/agents/`) and the built-in `explorer` where the lifecycle says so, and whatever a loaded skill names for itself. Never one they do not name, and never the `worker` type.

- **Every `spawn_agent` call carries `agent_type`, `reasoning_effort: "high"` and `fork_turns: "none"`, and never a `model`** - the agent runs on the session's model; a parameter the tool does not take is left out and named in the reply. The prompt is self-contained: the task, the file list, the facts and decisions the agent needs, the rule files that reach those files, and the `cd` rule above. With `fork_turns: "none"` the agent starts without this session's history; left out, it inherits all of it and reviews with your own assumptions. Either way **a sub-agent's findings are claims** - check every one against the code.
- `hunt`, `drift` and `explorer` are read-only by their instructions, and `guard` fences them: it refuses their patches and shell writes to the project (for `hunt`, all but a compile-probe file this layer never uses). A fenced agent cannot spawn or task another agent either. A refusal one of them reports is that fence, not a fault.
- A spawn the session cannot make (the tool is missing, refused, or the mode forbids it) is said plainly, and the main thread does the step itself.

---

# Project-Specific Rules

[fill] One or two sentences: what <PROJECT> is and who uses it.

## Commands

```text
<CHECK_COMMAND>    # the one verification call - every check the project has, in sequence
```

[fill] The other commands an agent needs (dev server, build, generation), one line each; the package manifest is the inventory.

## Development Workflow

Every **non-trivial** task (feature, bug fix, refactor) runs these six steps. A sub-agent launch is the expensive part, so a task spends usually 1-2 and at most 5: `hunt` on the plan and on the diff, a scoped second `hunt` round, `drift` when a doc names what changed, an `explorer` for an unfamiliar area.

1. **Investigate and classify**, and say the class so the user can overrule it: a **spike** (a question, an experiment, throwaway code) is answered inline; a **bounded** change (known files, one surface) goes to step 2; a **contract change** (a signature, schema, props or behaviour other consumers rely on, or several surfaces) is **planned before any edit** - in plan mode where the session has one, otherwise as a written plan in the reply that the user approves; a **bug report** goes through the `debug` skill first. One-way ratchet: a bounded task that turns out to change a contract re-enters as one. What screenshots show goes into the plan in words (for a bug, the reproduction and the cause too) - a sub-agent never sees them. **Context is scarce:** search before reading a file whole; never read a generated file, a schema or a fixture whole; a question that needs more than a handful of files goes to an `explorer`.
2. **Before the first edit.** (a) Something with more than one consumer (a parser, a schema, a helper, a shared component, a CSS rule): search for its consumers and list them in the reply with the invariants the change must keep (round-trip, key uniqueness, every call site of a changed signature). (b) **A contract change's plan gets `hunt` before the user approves it** - the prompt opens with `plan` and carries the plan, its files, the rule files that reach them, the consumer list and its deliberate decisions. If the spawn is not possible in plan mode, `hunt` runs right after the approval, before the first edit, and the reply says so. Fix the plan, not the diff, and record each finding's decision in it.
3. **Implement**, walk the consumer list from step 2, then run `<CHECK_COMMAND>` once.
4. **Review: `hunt` on the diff** - one spawn, its prompt carrying the file list, the rule files that reach it, a one-paragraph summary, the consumer list, and the deliberate decisions as context, never as a "do not flag" list. **Its findings are never applied on trust**: check each against the code and the reachability bar; accept or reject it with a reason. A second round only when a fix is itself non-trivial, scoped: each finding ADDRESSED or NOT ADDRESSED, new ones only inside the fix diff. Never a third.
5. **Docs.** Search every Markdown doc (`git ls-files --cached --others --exclude-standard '*.md'`, plus the layer's own files, searched by name as "Shell and file edits" says) for each identifier, path, command and key the diff changed. A hit: one `drift` in `diff` mode, its prompt carrying the file list, the hits, the summary and each `hunt` finding with its decision; check each replacement with a command of your own, apply the drift this diff created, report the older drift. No hit: no spawn - say so. **After a bug fix**, check yourself for a missing rule line by the five conditions in `.codex/agents/drift.toml` "Gaps": at most one line proposed, zero is normal.
6. **Close.** Name **what stays unverified** - the one to three things that need the user's data, eyes or judgement **and** may well be wrong, each with what to look at - and **every decision taken on the user's behalf** (a default, a reading, a scope), one line each with its cost if wrong. Re-run `<CHECK_COMMAND>` if anything changed after step 3, awaited to its exit. End with three suggested commit subjects from the final `git diff`, in the repo's format (`git log --format=%s -50`); the user commits.

**Skip steps 2, 4 and 5** for super-trivial edits (single-file, obvious, low-risk); "single file, so trivial" and "obvious" do not qualify on their own - a file with a consumer is a shared surface, search first. "No subagents" skips the `hunt`, `drift` and `explorer` spawns; their obligations stay with the main thread (`drift`'s by `.codex/agents/drift.toml`). **A skipped or unavailable step is named in the reply - a review that did not happen must never read like one that passed.**

Skills, loaded when their moment comes, never recalled: `debug` (a bug report), `handoff` (before a context compaction, a new session or a usage window running out), `retro` (only when the user types `$retro` - asked in prose, name `$retro` and stop), `maintain-ai-layer` (`deep` by default, about monthly; `rules` on request; `init` after an install).

## Architecture

[fill] Stack in one paragraph (<STACK>), then only what an agent cannot derive from the code in a minute: the deliberate exceptions, the traps with a history, the "looks like a bug and is not" list. Write the search that finds the sites, never a count or a site list. Mark each standing decision a reviewer would flag as **settled and deliberate, with its reason**; a review that wants to reopen one raises it in Observations.

### Folder conventions

[fill] The source folders first, one line each (`<SRC_DIR>/` and any other package) - `drift` reads the list - then the conventions inside them.

### Generated code

[fill] What is generated, from what, by which command - never hand-edited. `guard` enforces the paths in its `PROTECTED_PATHS`; keep the two in step.

## Code Style

[fill] Only what a linter does not enforce, and the linter settings that surprise (a warning that fails the build, a ban with no visible reason). The formatter runs through a commit hook or the project's own script (a `format` package script, say) - `guard` refuses the bare binary writing in place (`prettier --write`, `eslint --fix`): with no script, format with `apply_patch` and name the command for the owner.

### Comments - the default is none

**Write a comment only where a competent reader of this codebase would get the code wrong without it**: a value that looks like a bug and is not, a workaround for a library bug or version, a domain fact the API does not encode, a deliberate deviation someone would "fix" back. Everything else is deleted, not shortened. **One line, two only for a trap that cost real debugging time, never a multi-paragraph block**; one rationale once, at the definition or the first call site. No ticket ids, history, dates or process notes. When in doubt, delete.

### Punctuation

Use a plain hyphen `-`, never an em dash or an en dash, everywhere: code, comments, user-facing strings and every markdown doc in the repo. The `guard` hook refuses a written line that carries one.
