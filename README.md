# Codex bootstraps

Ready-made working layers for [OpenAI Codex](https://developers.openai.com/codex): the instructions, hooks, agents and skills that make Codex work in a repository the same disciplined way every time - classify the task, list who consumes what changes, implement, review, check the docs, close with what stays unverified. You install a layer by pasting one prompt into Codex; Codex then follows the layer's `INSTALL.md` and fits it to your project.

The layers are ports of the Claude Code layers in [claude_bootstrap](https://github.com/gregkozlov/claude_bootstrap): the same working discipline, rebuilt on Codex's own mechanisms. A unit Codex cannot carry was redesigned or dropped, never faked - each layer's `MAINTAINERS.md` says which, and what was measured.

## Which layer

| Layer | For | What it is |
| --- | --- | --- |
| [codex-bootstrap-light-frontend](codex-bootstrap-light-frontend/README.md) | a codebase with a UI | six-step lifecycle, one reviewer (`hunt`), a doc checker (`drift`), a guard hook, path-scoped rules, monthly upkeep |
| [codex-bootstrap-light-backend](codex-bootstrap-light-backend/README.md) | a server codebase, any language | the same, retargeted at a server: a second guard hook for secrets, frozen migrations, deploys and database sessions, a server's attack angles, local-only rules |

One layer per repository: a repository with both a server and a UI takes the layer that matches where the risk is.

## Install

> [!IMPORTANT]
> Each layer's own README opens with the exact prompt to paste and the access the install needs. In short:

1. Download this repository (Code > Download ZIP, or `git clone`) and unpack it **outside** your project. You need one layer folder of it.
2. Start Codex at your project's repository root, at high reasoning effort and with full access for this one session - the install writes into `.codex/`, `.agents/` and `.git/info/exclude`, which the default sandbox keeps read-only.
3. Paste the prompt from the layer's README, with the path to the folder filled in. The install asks where the layer lives in git (yours alone, or committed for the team) and only what the repository cannot answer.
4. Start a new session, trust the project and review the hooks (`/hooks` in the CLI, Settings > Hooks in the app) - Codex skips a hook nobody reviewed.
5. Run `$maintain-ai-layer init`: it writes the project-specific parts from your code.

> [!NOTE]
> A layer needs Node 18 or later on PATH (its hooks are Node scripts) and a git repository. It changes files only: it never commits, and by default it forbids Codex to commit - you review and commit everything yourself.
