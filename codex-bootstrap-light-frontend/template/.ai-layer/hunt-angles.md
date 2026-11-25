# Attack angles for hunt

The `hunt` agent reads this file before it attacks a change or a plan. It is the project's own: `maintain-ai-layer init` tunes it to the stack, and every task that learns a new defect class adds to it.

**Budget: 6 KB for this file** (its size in bytes). Past it, an addition first merges same-class angles and drops retired ones - a class a lint rule now catches, an API that is gone. A convention the linter checks is not an entry, and neither is an angle outside the Reachability bar of `AGENTS.md`.

Replace the classes this project does not have and **add the angles your own bugs teach you**: a defect that surfaces after a review goes into this list in the same task, phrased as the check that would have caught it. The library is only as good as the bugs that fed it.

**Data at the edges**
- The empty case: zero rows, an empty string, an empty array reduced without an initial value, a division whose denominator is the count.
- The one-element case, and the case where every element is equal - a comparator, a min/max, a percentage of a total of zero.
- `null` versus missing versus `0` versus `''`: which does the code test for, and which does the source actually send? A `?? default` on one side of a comparison and not the other silently reports "changed"; `value || ''` swallows a typed `0`.
- A value that arrives as a string where a number is assumed (`"12" + 1`), or scaled differently than assumed (0-1 versus 0-100).
- Free text refused: a rule on a name, description or address that rejects non-ASCII letters or punctuation (`é ñ ø`, `& / ( ) .`) - an ASCII class, `\w`, a character whitelist, an ASCII-only email check, an email checked untrimmed.

**Identity and keys**
- Two items with the same id, an item with no id, an id that is `0` or `''` - what does the list, the map, the cache or the dedup do with each.
- A key built by concatenation: a separator that appears inside a part collapses two different keys into one.
- Order assumed but not guaranteed: an object's key order, an unsorted response, a `Promise.all` result read by index against a list that was filtered.

**State and effects**
- A flag set in one handler and cleared in others: name every exit path, including the library's own (an escape key, a click outside, an unmount) - which one forgets to clear it.
- A stale closure: a callback registered once that reads a value captured at registration; a debounce or timeout that fires after the inputs changed.
- Two results of one user's own actions arriving out of order: the slower request resolving last and overwriting the newer one.
- A reset keyed on fetched data re-runs on every refetch and wipes what the user was typing.
- A cached or memoized value whose dependency list omits something it reads, and its opposite - a dependency that changes identity every render and defeats the memo.
- A Save or Confirm not disabled while its write is pending sends it twice; a token written to storage or a log; a permission check that renders or fetches while the permission is missing or still loading.

**Persistence and cache**
- A write that does not invalidate what it changed: after the mutation, which reader still shows the old value, and for how long.
- A stored shape that changed: what does the code do with the version already in a user's storage, written by the previous release.
- A key that is per-user or per-tenant in one place and global in another.

**Errors and the unhappy path**
- The failure branch: what is rendered, what is logged, what is left half-written when the call rejects. A `catch` that swallows and returns a default turns a broken backend into a plausible wrong number.
- A partial failure inside a loop or a batch: does the second half still run, and is the first half rolled back.
- A timeout, a 401 mid-flight, an error the backend's contract does name and the code never handles.
- Two errors told apart by matching the message text (`includes`, `startsWith`) instead of the status or an error code.

**Types versus runtime**
- An indexed access assumed to exist (`list[i].x` after a `find` or a filter), a non-null assertion, an `as` cast: what is the real value when the assumption breaks.
- A union or enum widened by the API: the `default` branch, or the absence of one.
- A number formatted for display with a locale's conventions and then parsed back, or compared as a string.

**Boundaries in time**
- A day, week or month boundary, a timezone, a DST hour, an inclusive versus exclusive range end, a sentinel date.
- A period whose start is after its end, and the "today" that is computed twice in one flow and can straddle midnight.
