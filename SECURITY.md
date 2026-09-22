# Security Policy

Puzzle Arcade is a static, local-first browser application. It has no account system, application backend, analytics SDK, advertising SDK, remote game API, or third-party runtime JavaScript dependency.

## Supported release

The actively maintained production baseline is **1.14.x**. Security corrections should normally be released as patch versions unless they require a deliberate compatibility break.

## Security model

Puzzle Arcade stores settings, favorites, active puzzles, and local play history in the browser. The application does not treat that data as secret from other code running in the same origin/browser profile.

The production security baseline includes:

- a restrictive Content Security Policy;
- self-hosted scripts, styles, icons, dictionaries, and puzzle content;
- no runtime `eval` or `new Function`;
- bounded and sanitized shared-link seeds;
- bounded local history;
- bounded backup imports;
- backup schema and checksum validation before restore;
- atomic IndexedDB replacement for restore;
- scoped service-worker caches;
- same-origin service-worker fetch handling;
- release-file SHA-256 verification during deployment certification.

## Backup files

A backup contains local Puzzle Arcade state. It may reveal:

- which games were played;
- puzzle seeds and difficulty;
- settings and favorites;
- local result history.

Backups are not encrypted. Store them like any other personal local file.

The backup checksum is a corruption check, not a digital signature or proof of authenticity. Do not import backup files from untrusted sources.

## Reporting a vulnerability

Prefer GitHub private vulnerability reporting for the repository when that facility is available. Avoid publishing exploit details or sensitive proof-of-concept data in a public issue before a fix is available.

For ordinary non-security defects, use the normal repository issue workflow.

## Out of scope for the application

The hosting platform, browser, operating system, browser extensions, compromised same-origin content, and local device security remain outside Puzzle Arcade's application-level trust boundary.
