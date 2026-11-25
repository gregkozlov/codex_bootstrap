# rules mode

The rule set, and nothing else in the layer: every rule checked against the code, each `paths:` matched to the files its text needs (over-reach and under-reach), a rule whose sections serve different files split, and the rules the code needs and no layer file states added. With no project rule at all - the state right after the install, which ships none - R7 builds the set from the whole project. `deep` runs R1's inventory, R2's two decisions and R3-R5 as its D2, or R7 when there is no project rule.

The run applies what it verified, like `deep`. Reach is measured as `SKILL.md` "Measuring a rule" says, before and after every change.

## Writing a rule

- The file is `.ai-layer/rules/<subject>.md`, opening with a `paths:` frontmatter in block form - one glob per line, each a single-quoted item (`  - 'src/**/*.tsx'`). A flow list, a string or a misspelled key makes the `guard` hook read no globs, and the rule then reaches every path.
- **Point the globs at the files whose writing the text changes**, not at everything it governs: a rule about a query cache belongs on the files that call queries. Narrow by pattern (`.tsx` only, `index.tsx` only, a folder the text is about), never by listing today's folder names - the next module with the same shape is the file such a list misses. Reach is paid once per session and agent: the first patch to a matching path is refused, and the whole file is read before the retry. Under-reach is paid in defects.
- **A prohibition that must be known before any file is touched stays in `AGENTS.md`**: a rule arrives only with the first patch to a matching path, which is too late for "never create X" somewhere else. A prohibition about code in the files a rule covers lives in that rule alone. Text one process step needs goes into that step's skill.
- **Every rule has one index line in `AGENTS.md` "Path rules"**: the file and its subject in a few words, never its globs or its text.
- A rule file's own budget is 20 KiB (its size in bytes, LF text).
- A count or a site list rots - write the search that finds the sites.

## R1. Baseline

`references/deep.md` M1 and M2. Then the inventory into the run file - per rule: its bytes, its `##` headings, its globs and its reach - and the union of all reaches against `git ls-files --cached --others --exclude-standard` of the source folders (`AGENTS.md` Folder conventions lists them): the **unreached folders**, which no rule reaches at all. Then the **heaviest files**: for the most-edited folders, the summed bytes of every rule that reaches a file there.

**No project rule** - no `.ai-layer/rules/*.md` - sends the run to R7; R2-R5 have nothing to work on.

## R2. Against the code

One `drift` in `section` mode per rule file, in waves of up to eight in parallel (the claims that need action only; `.ai-layer/settled.md` and this run's decisions in every prompt; the pairs applied between waves). Then:

- **A rule whose subject is gone** - every component, helper, path and identifier it is about deleted from the code (`git log --diff-filter=D` finds where it went) - is deleted (a `*** Delete File` patch, one file per call), with its index line and every reference `layer-refs` then reports. A rule with part of its subject gone loses those sections only.
- **A rule that restates `AGENTS.md` or another rule** keeps one copy, chosen by the "where text lives" standing rule.

## R3. Reach, both ways

Spawn one `default` agent per rule family (a rule with its `-internals` / `-<suffix>` siblings), in waves of up to eight, read-only: `git grep`, `git ls-files`, `git log`, `git show` and the shell's read commands, never a patch or a written file. Each prompt carries the family's rule files, "Measuring a rule" from `SKILL.md`, "Writing a rule" above, `.ai-layer/settled.md` and this run's decisions. Each agent returns:

- **Section map** - for each `##` section, the files its text changes how someone writes, as globs; the reached files no section needs (**over-reach**).
- **Under-reach** - the identifiers each section is about (components, hooks, helpers, props, file names), their use sites from `git grep --untracked -l`, minus the rule's reach. A site counts only when the section's text would change how that file is written; an import that needs nothing of the text does not.
- **The fix** - the new `paths:` as a narrowed or widened pattern, never a list of today's folder names, with the reach before and after.

Apply each fix after measuring it yourself. A section that serves a strict subset of the rule's files goes to R4.

## R4. Split and trim

**A rule is split by audience, never by size.** Two halves that reach the same files cost the same bytes as one file and add a file to keep in step. Size only picks the candidates: a rule over ~8 KB, and every rule that adds to one of R1's heaviest files.

- **Sections with a different audience** (R3's section map) move to a rule whose globs fit them: an existing one, or a split. The usual shape is `<name>.md` for the call sites and `<name>-internals.md` for the component's own folder. A split is made only when R3's map names files that stop receiving the moved text, and the reach after it must show that.
- **One audience, still heavy** - trim instead: true-but-dead text, a mechanic only one process step needs (to that step's skill), a second copy.
- **The floor:** a rule that would end under ~1 KB is merged into the rule whose globs it shares.
- The pointers to the old file are re-aimed (`git grep -n --no-index -F "<rule>.md" -- AGENTS.md .codex .agents .ai-layer`), the index line first.

A candidate `.ai-layer/settled.md` already answered is logged as settled.

## R5. Rules the code needs

Cut the source folders into three areas of roughly equal file count by top-level folder (`git ls-files <source folders>`, counted per second-level folder), generated code left out. Spawn four agents in parallel, read-only, as in R3: three `explorer`, one per area, each told to be very thorough and told the unreached folders in its area first; and one `default` on the **fix history**: `git log --since=6.months --no-merges -i --grep="^fix" --format="%h %s" --name-only` (the project's fix-commit prefix in `--grep`), each commit's diff read with `git show`, its defect class named, and the classes fixed twice, or once in a shared component, returned with the commits. The fourth is not spawned when the caller already holds a fix-history answer (`init`'s I1): that answer stands in for it.

Each prompt lists the layer files and asks for:

1. Conventions that a competent newcomer would get wrong and that no layer file states, each with at least three sites as evidence.
2. Shared components, helpers or hooks that the layer should point to but never names. Example: a rule says to build X, and X already exists.
3. Every policy in `AGENTS.md` or a rule that the code breaks, with the site count.

**A candidate becomes rule text only when all five hold:**

1. **Evidence:** three sites that follow it, or a fix commit whose cause it names.
2. A competent newcomer would get it wrong.
3. Neither the type checker nor the linter catches it: an enforced rule teaches itself through its error.
4. No layer file says it - `AGENTS.md`, a rule, an agent, a skill - and `.ai-layer/settled.md` did not reject it.
5. **An audience:** the files it binds fit a glob narrower than the tree. A prohibition that must be known before any file is touched goes into `AGENTS.md` within its budget instead; nothing becomes a rule without `paths:`.

It lands as a line or a paragraph in the rule whose `paths:` reach those files, and a new file only when no rule reaches them or the reaching rule's audience is much wider than the text needs - by "Writing a rule". Policy breaks go through the "code is not the doc's servant" standing rule. Each rejected candidate is logged with the condition it failed.

## R6. Verify

The rule count, the bytes, every changed rule's reach, the index against the folder, `layer-refs` and the size of `AGENTS.md`, against R1. Then `references/deep.md` D6, without the stamp: `rules` does not stamp.

## R7. No project rule: build the set

1. **Survey.** `git ls-files` per top-level folder with counts, the stack from the package manifest, and the `AGENTS.md` sections. Cut the code into areas of at most ~250 source files (a large folder by its subfolders), plus one for the root config files.
2. **Candidates.** One `default` agent per area, waves of up to eight, read-only as in R3, plus R5's fix-history agent - none when the caller already holds a fix-history answer (`init`'s I1), which the candidates get instead. Each returns the R5 asks, every candidate with its sites and the glob of the files it binds. `AGENTS.md` text that only one area needs (a mechanic, or a prohibition about code in that area's files) is a candidate too: it moves into the rule, with nothing but the index line left behind - the move that keeps `AGENTS.md` inside its budget.
3. **Filter** by R5's five conditions.
4. **Cluster by audience:** one rule per set of files that needs the same text, named by its subject; R4's floor and split shape hold from the first draft.
5. **Write** each rule by "Writing a rule", measure its reach, and add its index line.
6. Then R3 over the new set, and R6.
