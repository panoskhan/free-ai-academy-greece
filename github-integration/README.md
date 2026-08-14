# GitHub Integration

This folder defines the safe implementation boundary for connecting Academy Builder projects to GitHub.

## User flow

1. Creator finishes a Builder draft.
2. Creator runs local/static checks.
3. Creator chooses **Connect GitHub**.
4. A future GitHub App/OAuth flow requests only the minimum permissions needed.
5. The integration receives an authorization result server-side; the public frontend never receives or stores a GitHub password.
6. The service creates or updates a repository and commits generated static files.
7. The commit SHA is recorded in the creator workflow.
8. GitHub Actions runs Academy QA.
9. A passing run enables the Preview state.
10. Production deployment remains an explicit creator action.

## Security requirements

- Do not request GitHub passwords.
- Do not ask creators to paste personal access tokens into the Academy website.
- Use least-privilege GitHub App/OAuth permissions.
- Store secrets only in a server-side secret manager when a backend is introduced.
- Never execute arbitrary generated code on Academy infrastructure.
- Treat repository content as untrusted.
- Log repository, commit, QA result and deployment state without logging credentials.

## Current state

The Academy currently has:

- a browser-only Builder,
- deterministic static HTML export,
- a GitHub Actions QA workflow,
- a creator deployment workflow UI,
- architecture documentation for repository creation and preview deployment.

Actual OAuth/App authorization and server-side repository creation require a deployed backend and GitHub App configuration. The UI must not pretend those operations are available until that integration exists.
