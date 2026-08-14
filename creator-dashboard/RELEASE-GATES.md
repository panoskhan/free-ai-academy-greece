# Preview and Production Release Gates

## Release lifecycle

**Draft → Exported → QA passed → Preview → Creator approved → Production ready → Deployed**

### Gate 1 — Export

The generated project is deterministic and contains no credentials or private data.

### Gate 2 — QA

The repository passes the Academy QA workflow. A failed check blocks the release.

### Gate 3 — Preview

The creator reviews the actual generated output on the target viewport(s). Preview is not production.

### Gate 4 — Production approval

Before deployment, show:

- repository and owner,
- commit SHA,
- QA status,
- target environment,
- deployment destination,
- whether a custom domain is configured.

The creator explicitly confirms production deployment.

## Failure handling

If QA or deployment fails, keep the previous production version untouched and show the failure state. Never claim a deployment succeeded without a confirmed provider result.

## Ownership

The creator owns the generated project and chooses where to host it. The Academy's role is to provide educational tooling, safe generation, validation and documentation.
