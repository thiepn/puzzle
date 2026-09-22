# Repository Governance — Maintenance Baseline

This document records repository-level settings that should protect the 1.14.x maintenance line.

## What CI can enforce in source

The repository now provides one stable status check:

- **certification-summary**

It aggregates:

- release gate;
- four player-fuzz shards;
- endurance;
- recovery;
- QoL keyboard/mobile;
- Chromium / Firefox / WebKit resilience.

The summary succeeds only when every required underlying gate succeeds.

## Recommended main-branch rule

Configure a GitHub ruleset or classic branch protection for `main` with:

1. Require changes to enter through a pull request.
2. Require the **certification-summary** status before merge.
3. Require branches to be up to date before merge when practical.
4. Block force pushes to `main`.
5. Block deletion of `main`.
6. Require conversation resolution before merge when review comments exist.
7. Do not allow status-check bypass for routine maintenance.

For a single-maintainer repository, requiring an external approval is optional; requiring the automated certification summary is the important protection.

## Merge strategy

The maintenance process currently uses squash merges.

Repository API metadata shows squash, merge-commit, and rebase merge modes are all enabled. If the GitHub settings are simplified later, **squash merge only** is the cleanest fit for the current maintenance history.

## Current API visibility

At the Maintenance Pass 2 audit:

- repository rulesets endpoint returned no rulesets;
- classic branch-protection endpoint returned 403 to the connected GitHub App, so classic protection cannot be confirmed or changed from this integration;
- auto-merge is disabled;
- update-branch is disabled.

These are server-side GitHub settings and are not represented by repository files.

## Operational rule

Even if server-side protection is absent, the project maintenance rule remains:

> Do not merge a maintenance PR unless `certification-summary` and all underlying required gates are green.

If branch settings are changed manually, this document should be updated to match.
