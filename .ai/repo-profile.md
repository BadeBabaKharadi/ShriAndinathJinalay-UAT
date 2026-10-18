# AI Repository Profile — Shri Andinath Jinalay UAT

This is the UAT counterpart of `BadeBabaKharadi/ShriAndinathJinalay`.

## Identity
- Repository: BadeBabaKharadi/ShriAndinathJinalay-UAT
- Default branch: `master`
- Purpose: UAT/validation environment for the temple website/platform

## Source of truth
1. `.github/copilot-instructions.md` in the production repository where applicable.
2. `SPEC.md` and `CONTRIBUTING.md` in this repository.
3. Production repository `BadeBabaKharadi/ShriAndinathJinalay` for the intended production contract.
4. UAT code/configuration and CI for environment-specific behaviour.

## Developer operating contract
1. Treat UAT as a validation environment, not an independent product definition.
2. Inspect the production repository contract/spec before making product-level changes.
3. Keep UAT behaviour intentionally aligned with production unless the change is explicitly UAT-only.
4. Add/update tests for changed behaviour.
5. Run `npm run check` and relevant browser/link/unit/integration checks.
6. Monitor CI and fix actual failures until required checks are green.
7. Never use UAT-only changes to silently redefine production requirements.
8. Document intentional UAT differences.

## Product Owner operating contract
Product decisions belong to the production product/specification. Use this repository to validate those decisions, capture UAT findings and identify release blockers.

## Quality gate
UAT is complete only when acceptance criteria pass, regression checks pass, CI is green, and all release-blocking findings are resolved or explicitly accepted.

## Environment rule
Do not assume a UAT-only route, endpoint, asset or configuration exists in production. Clearly label environment-specific behaviour in issues/PRs.
