# Attack angles for hunt

The `hunt` agent reads this file before it attacks a change or a plan. It is the project's own: `maintain-ai-layer init` tunes it to the stack, and every task that learns a new defect class adds to it.

**Budget: 6 KB for this file** (its size in bytes). Past it, an addition first merges same-class angles and drops retired ones - a class a lint rule now catches, an API that is gone. A convention the linter checks is not an entry, and neither is an angle outside the Reachability bar of `AGENTS.md`.

Replace the classes this project does not have and **add the angles your own bugs teach you**: a defect that surfaces after a review goes into this list in the same task, phrased as the check that would have caught it. The library is only as good as the bugs that fed it.

**Input at the boundary**
- A missing field versus an explicit `null` versus `""` versus `0`; an empty list or body; a default applied on create and re-applied on a partial update.
- A value the type allows and the domain does not: a negative quantity, a page size of zero or a million, a start after an end, an id of another kind.
- Free text refused or mangled: non-ASCII letters, an apostrophe, an email compared untrimmed or case-sensitively, a string cut by bytes.
- Untrusted input reaching an interpreter: a query built by concatenation, a shell command, a file path with `..`, a template, a URL the server then fetches.
- A field the caller must never set, bound from the body onto the model: an owner id, a role, a price, a status.

**Authorization and tenancy**
- A new or changed entry point: is it authenticated, and does it check that **this** caller may touch **this** row - an id from the path or body looked up with no owner or tenant filter.
- A check made on one path to the data and not on the second: a batch endpoint, an export, a job, a nested include.
- A query, cache key, file name or uniqueness check scoped per tenant in one place and global in another.
- A response, log line or error that carries more than the caller may see: a hash, a token, another user's field, a stack trace.

**Transactions and concurrency**
- Read, decide, write with no lock or constraint: two requests both pass the check - a duplicate row, a double spend, a lost update. Name what stops the second one.
- Writes that must land together: which run outside the transaction, and what is left when the third fails. A side effect inside it (an email, a message, an outbound call) that happens though it rolls back, or one after the commit that a crash loses.
- The same request twice - a client retry after a timeout, a redelivered message, a restarted job: is the handler idempotent, and by which key.
- A lock or transaction held across a slow call; two paths taking the same locks in a different order.
- Mutable state shared by requests: a module-level cache, a singleton, a value read after its request ended.
- Once per process, not per deployment: a scheduler, an in-memory lock, cache or rate limit that holds on one instance and breaks with several replicas or workers.
- Messages out of order; a poison message retried forever, with no retry limit or dead-letter path.

**Schema and stored data**
- The rows already there: a new non-null column with no default, a tightened constraint, a removed enum value - what the migration does with them, and what the new code does with a row the old code wrote.
- The deploy window: old code on the new schema and new code on the old - a column renamed or dropped in the release that stops reading it.
- A migration that locks or rewrites a large table, or cannot be re-run after failing halfway.
- A shape that outlives the code: a cached value, a queued message, a stored document, a token read by a version that did not write it.

**Queries and load**
- A query inside a loop over rows; a list with no limit; a whole table or file loaded to count or filter it.
- A caller-controlled filter or sort on an unindexed column; offset paging over rows that move; an order with ties and no tiebreaker.
- A cache the write that changes its source never invalidates, or keyed without an input it depends on.
- A blocking call on an event loop (a sync driver in an async handler), or a slow path that exhausts the connection pool so every other request waits.

**Errors and partial failure**
- The failure branch: what is committed, returned and logged when the call fails. A `catch` that returns a default turns an outage into a plausible wrong answer; an error mapped to the wrong status.
- An outbound call with no timeout; a retry with no limit, or of a call that is not idempotent.
- A batch that fails in the middle: does the rest run, is the first half undone, does the caller learn which items failed.
- A connection, file handle, lock or temp file not released on the error path.
- Two errors told apart by message text instead of a type or a code.

**Numbers and time**
- Money or quantity in a float; rounding per line versus on the total; a divisor that can be zero; a unit assumed - cents or units, seconds or milliseconds.
- A day or month boundary, a naive timestamp compared with an aware one, "today" in server time for a user elsewhere, an inclusive versus exclusive range end.
- "Now" read twice in one flow; ordering by a timestamp two rows share.

**Contracts with callers**
- A response field removed, renamed, retyped or made nullable; a status or error shape changed; a new required request field - which caller breaks, the ones outside this repo included.
- An enum the change widens: the consumer's default branch, or the absence of one.
- A config key or environment variable the change needs: what happens where it is not set.
