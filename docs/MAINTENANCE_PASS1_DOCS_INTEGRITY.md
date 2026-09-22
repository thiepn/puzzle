# Maintenance Pass 1 — Post-Handoff Documentation & Operations Integrity

## Scope

This is the first maintenance pass after the formal 1.14.0 handoff.

No application runtime, puzzle logic, storage schema, backup schema, service-worker runtime, or catalog behavior is changed.

## Audit findings

The post-handoff README audit found maintenance/documentation drift that could mislead future work:

- **28 README file references** pointed to files no longer present in the repository.
- The retired `scripts/build-standalone.py` command was still documented.
- Local-run instructions used the old `endless-puzzle-arcade` directory name instead of the current repository folder.
- A historical Wave 6 note incorrectly said the “current release” used cache v21.
- The Wave 8 historical section called its old build the “current build.”
- The Development direction section still described unfinished release work instead of formal maintenance mode.
- The operational-documentation index pointed to seven retired/nonexistent files.

These defects did not affect the PWA runtime, but they made the maintenance instructions unreliable.

## Corrections

README now:

- clearly marks Wave 1–8 sections as historical summaries;
- removes dead Wave-era artifact links that are no longer retained;
- distinguishes historical cache versions from the current runtime;
- uses the current repository folder in local-run instructions;
- removes the retired standalone-build command;
- points to the actual maintained operational documents;
- describes Development direction as formal maintenance mode;
- avoids presenting early Wave 10 maintenance versions as the current supported line.

## Documentation integrity regression

Added `scripts/test-docs-integrity.mjs`.

It verifies:

1. README current release matches:
   - `APP_VERSION`;
   - release-manifest phase;
   - service-worker cache version.
2. Every maintained repository file path referenced in README actually exists.
3. Known retired paths/commands do not reappear.
4. Local-run instructions use the current repository folder.
5. Formal maintenance mode and the current operations index remain visible.

The test is required by:

- the cumulative release checker;
- normal PR/release CI;
- the scheduled maintenance baseline workflow.

## Release identity

Unchanged:

- app: **1.14.0**
- PWA cache: **v33**
- IndexedDB schema: **1**
- backup schema: **1**
- catalog: **36 games**
- project mode: **MAINTENANCE_BASELINE**

This is intentionally a documentation/tooling-only maintenance change.
