---
name: retro
description: Retrospective of the task this session just ran, ending in numbered improvements with recommended defaults. Only when the user types $retro.
---

# retro

The owner asks for this after a task: an honest look at how the pass went and what to change so the next one goes better. It is a proposal, never an action - **nothing is changed until the user answers.** Reply in the user's language; any file content written later stays in the project's own language. It spawns no sub-agent.

No praise padding and no self-flagellation. "I should be more careful" is not a finding; a named moment, its cost and the cheapest thing that would have caught it is.

## 1. Collect the evidence - from the record, not from memory

- The conversation, oldest first, and `.ai-layer/handoff.md` if this task wrote one. **The strongest signal is every time the user caught something** - pointed at a defect, asked "why didn't you", had to repeat or correct an instruction. Quote each.
- Rework: a file or a concern edited in more than one round, a decision reversed, a change undone.
- Friction: refused tool calls, guard refusals other than a path rule's one hand-over, sandbox stops, commands that failed or had to be retried.
- Cost against value: `hunt` spawns against findings accepted, a step skipped as trivial that was not.
- What stayed unverified at the end, and why.

## 2. Sort it

- **Worked** - only what has evidence: what it caught, prevented or settled. A step that ran and found nothing is not an entry.
- **Went badly** - each item with the moment (a quote, a `file:line`, a round), what it cost (a round, a user correction, a wasted spawn) and the root cause: a knowledge gap, a skipped or mis-ordered step, an unchecked assumption, a gap in the tooling or the docs.

Settled user decisions are context, not mistakes - do not relitigate them.

## 3. Propose improvements - one per bad item, each with a default

Fix each at the cheapest layer that would have caught it, in this order of preference:

1. a tool that fails - a lint rule, a check script, a `guard` check (the developer's edit: a session cannot change `.codex/hooks/`);
2. one line in a path rule, `.ai-layer/rules/*.md`, that reaches the code, for a defect class a user can hit in ordinary work;
3. a prohibition in `AGENTS.md` - only one that must be known before any file is touched (mind its 20 KB budget);
4. a new attack angle in `.ai-layer/hunt-angles.md`, or a step in a skill;
5. for a habit with no file to change, one line in `AGENTS.md` Working Principles - or nothing, said plainly: this layer keeps no private notes between sessions.

**Check feasibility before proposing**: read the config, script or rule the change would touch and say what you found. Never propose changing what worked.

Numbered list, each entry: **the problem** in one line, **the proposal** (what, which file), **cost or risk**, and **Default: do / don't / variant** with its reason. Close with one line naming what answering "go with the defaults" would do, so the user can answer per number or all at once.

## 4. After the answer

Apply the chosen items through the normal lifecycle - the change's class decides the steps. A change under `.codex/` is handed to the developer as the exact text to put where; a skill under `.agents/` is patched where the sandbox allows it, and handed over the same way where it does not.
