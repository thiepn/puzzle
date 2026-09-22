# Puzzle Arcade — Production Rollback

Puzzle Arcade is deployed as a static GitHub Pages application. Rollback therefore means restoring a previously certified source release and allowing the normal CI/deploy pipeline to republish it.

## When to rollback

Rollback is appropriate when the current production release has a serious defect and a safe forward fix is not immediately ready.

Typical cases:

- app shell fails to load;
- deployment integrity is mixed or stale;
- a broad persistence regression appears;
- multiple games become unusable;
- offline/PWA update behavior is broken;
- a security defect requires immediate removal of a change.

For a narrow defect with a small verified forward fix, a normal patch may be safer than reverting.

## Before rollback

1. Identify the last known-good merge commit.
2. Determine whether the bad release changed:
   - IndexedDB schema;
   - backup schema;
   - persisted active-record shape;
   - history shape;
   - service-worker cache behavior.
3. If storage compatibility changed, do **not** assume an older runtime can safely read newer data.
4. Preserve evidence/logs from the failing production release.

## Safe rollback path

Preferred process:

1. Create a rollback branch from current `main`.
2. Revert the offending merge commit(s) while keeping unrelated later safe fixes only if they remain compatible.
3. Add or retain the regression test that demonstrates the failure.
4. Update release identity if runtime bytes change.
5. Advance the service-worker cache generation for any changed runtime files.
6. Run the complete required PR matrix.
7. Merge only when green.
8. Let the normal Pages deployment publish the rollback build.
9. Require production integrity verification to pass.

Do not manually upload ad-hoc Pages files outside the certified pipeline.

## Service-worker rule

Never reuse an old cache generation for new bytes.

Even when the application behavior is being rolled back, the rollback build is a new deployment generation if its runtime bytes differ from the currently published release.

## Storage rollback warning

A source-code rollback does not automatically roll back browser data.

If a bad release wrote a new incompatible data format:

- keep the newer runtime long enough to perform a safe migration, or
- ship an explicit downgrade migration.

Do not publish an older runtime that will misinterpret or destroy newer stored data.

## Failed deployment

If the source merge is correct but Pages deployment verification fails:

1. do not declare the release live;
2. inspect the deploy / production integrity job;
3. verify whether the issue is propagation, stale cache, or staged-file mismatch;
4. fix the deployment pipeline or source identity;
5. rerun through the certified path.

## Communication

Release notes should state what was rolled back when the change was user-visible.

Do not claim that local user data was rolled back: browser-local data persists independently of static application deployment.
