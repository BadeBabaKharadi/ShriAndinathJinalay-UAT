# Shri Andinath Jinalay UAT — AI Instructions

This repository is the UAT counterpart of `BadeBabaKharadi/ShriAndinathJinalay`.

- Read and apply [`.ai/repo-profile.md`](../.ai/repo-profile.md) before making changes.
- Follow `SPEC.md` and `CONTRIBUTING.md`.
- Treat the production repository and approved specification as the product contract.
- Never silently redefine production behaviour through a UAT-only change.
- Add/update relevant tests for every behavioural change.
- Run `npm run check` and relevant browser/link/unit/integration checks when available.
- Investigate actual CI failures and fix root causes until required CI checks are green.
- Never claim a check passed unless it was actually run.
- Keep intentional UAT-only differences documented.
