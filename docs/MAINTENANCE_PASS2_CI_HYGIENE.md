# Maintenance Pass 2 — CI, Workflow & Repository Hygiene

## Scope

This pass audits and cleans the repository automation around the certified 1.14.0 maintenance baseline.

No puzzle logic, UI, runtime assets, storage schemas, backup format, or catalog behavior are changed.

## Findings

### 1. Static release tests were duplicated inside the same jobs

`bootstrap.yml` and the scheduled maintenance workflow ran several static contract tests individually and then invoked `scripts/release-check.mjs`, which ran the same tests again.

Correction:

- the workflow now calls the cumulative release checker once;
- the release checker remains the single owner of the static contract suite;
- Python/browser syntax and real-browser tests remain separate.

This reduces CI work without reducing coverage.

### 2. Test jobs inherited deployment privileges

The main workflow granted Pages write and OIDC token permissions at workflow scope.

Correction:

- workflow-level permissions are now read-only;
- Pages write + OIDC permissions exist only on the deploy job.

### 3. Browser automation dependency was unpinned

Every browser job used an unversioned `pip install playwright`. The same source commit could therefore execute against a different automation stack over time.

Correction:

- `.github/requirements-ci.txt` pins Playwright;
- the baseline pin introduced by this pass is **1.63.0**;
- every Python workflow installs from that file;
- pip caching is enabled;
- Dependabot now tracks the pinned Python CI dependency.

### 4. GitHub Actions majors were stale

The previous workflows used Action majors that emitted Node 20 deprecation warnings on current GitHub-hosted runners.

Updated first-party Action baselines:

- `actions/checkout@v7`
- `actions/setup-node@v7`
- `actions/setup-python@v7`
- `actions/upload-artifact@v7`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

Dependabot groups future GitHub Actions updates into one monthly PR.

### 5. Deep Sunday suites overlapped

The three heavyweight scheduled suites previously started within one hour:

- generator deep stress;
- player deep fuzz;
- long-session endurance.

That caused avoidable runner contention.

They are now staggered:

- generator deep stress: **02:17 UTC Sunday**
- player deep fuzz: **04:17 UTC Sunday**
- deep endurance: **06:17 UTC Sunday**

Each scheduled workflow also has concurrency cancellation so duplicate manual/scheduled runs do not stack.

### 6. Docs/tooling-only pushes could redeploy identical production bytes

The release workflow deployed on every push to main after the gate matrix, even if only documentation or CI tooling changed.

Correction:

- the release gate detects changes across the complete GitHub push range;
- deployment only runs when one of the staged production files or `release-manifest.json` changed;
- documentation/tooling-only merges still receive the complete regression matrix but skip redundant Pages publication.

### 7. Production smoke duplicated release identity logic

The deployment smoke hard-coded the current app/cache version in shell greps even though `verify-deployed-release.mjs` already validates the committed release manifest against deployed bytes.

Correction:

- removed the hard-coded version/cache greps;
- the release manifest remains the single release-identity authority.

### 8. Required checks had no stable aggregate name

Matrix jobs have dynamic names, especially player fuzz shards.

Correction:

- added a stable `certification-summary` job;
- it fails unless every required production gate succeeds;
- deployment depends on this summary;
- repository branch protection can require the stable summary status.

## Repository governance audit

Observed through the connected GitHub API:

- default branch: `main`;
- repository is public;
- repository rulesets: none returned;
- squash, merge-commit, and rebase merge modes are enabled;
- auto-merge is disabled;
- update-branch is disabled.

Classic branch-protection details cannot be read by the connected GitHub App because that endpoint requires administration access unavailable to this integration.

See `docs/REPOSITORY_GOVERNANCE.md` for the recommended server-side settings.

## CI hygiene regression

Added `scripts/test-ci-hygiene.mjs`.

It verifies:

- expected workflow inventory;
- minimum first-party Actions majors;
- exact Playwright pinning;
- pip cache/requirements use;
- least-privilege deploy permissions;
- no duplicate static contract execution;
- runtime-change-aware deployment;
- no hard-coded release version/cache smoke logic;
- stable certification summary wiring;
- staggered deep schedules;
- scheduled concurrency cancellation;
- artifact reports cannot disappear silently;
- Dependabot tracks both Actions and Python CI dependencies.

The test is part of `scripts/release-check.mjs`, so it runs on every release/PR gate and in the scheduled maintenance baseline.

## Release identity

Unchanged:

- app: **1.14.0**
- PWA cache: **v33**
- IndexedDB schema: **1**
- backup schema: **1**
- catalog: **36 games**
- project mode: **MAINTENANCE_BASELINE**
