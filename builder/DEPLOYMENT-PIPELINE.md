# Builder → GitHub → Preview → Deploy

## Pipeline

**Builder** → **Export** → **GitHub repository** → **QA** → **Preview** → **Production**

### 1. Builder

The creator assembles course metadata, lessons, quizzes and a project brief in the browser.

### 2. Export

The Builder generates deterministic static files. The export must not contain secrets, credentials or hidden remote execution.

### 3. GitHub

With explicit authorization, the integration creates or updates a repository and commits the generated files.

### 4. QA

`.github/workflows/academy-qa.yml` checks core files, HTML basics, local navigation targets, obvious secret patterns, Builder safety markers and sitemap coverage.

### 5. Preview

A preview deployment should come from the user's repository. For static projects, GitHub Pages is a natural option. For dynamic applications, deployment should happen on infrastructure owned or controlled by the user.

### 6. Production

Production deployment must be an explicit action. The Academy should show the target repository, commit, QA status and deployment destination before the user confirms.

## Future dashboard states

- Draft
- Tests running
- Tests passed
- Preview ready
- Production ready
- Deployed
- Deployment failed

## Principle

The Academy provides the education and tooling; the creator retains ownership and control of the generated project and its hosting.