# GitHub Integration Architecture

## Goal

Allow a creator to move a Builder project into their own GitHub repository without turning the Academy into an arbitrary-code execution service.

## Safe flow

1. Build course/lesson/quiz/project in the browser.
2. Run local/static validation.
3. Export a deterministic project package.
4. User chooses GitHub repository and explicitly authorizes access.
5. Create/update files in that repository through GitHub's API.
6. Commit the generated package.
7. GitHub Actions runs QA.
8. A preview can be deployed from the repository.
9. Production deployment remains an explicit user action.

## Required security boundary

- Never collect or store a user's GitHub password.
- Never ask a user to paste a personal access token into a public page.
- Prefer GitHub OAuth/App authorization with least-privilege permissions when a server-side integration is introduced.
- Do not execute arbitrary user code on Academy infrastructure.
- Treat generated project files as untrusted input.
- Keep repository creation and deployment actions explicit and auditable.

## Current repository

The Builder is still client-side and can export standalone HTML. The Academy now has a GitHub Actions QA workflow that can validate generated/static repository content.

## Next implementation phase

A future backend integration can accept an authenticated GitHub installation/session and create a repository or commit generated files. The integration should return the repository URL and commit SHA, then let GitHub Actions perform validation and deployment.

## Preview strategy

Prefer repository-native previews such as GitHub Pages or a dedicated preview branch. Do not execute arbitrary submitted source on the Academy server. For richer application previews, users can deploy to their own infrastructure.
