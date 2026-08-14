# Release Process

Every meaningful feature follows the same rule:

**BUILD → TEST → DEPLOY → VERIFY → NEXT TASK**

## 1. Build

Implement one focused feature and keep the public interface understandable on mobile.

## 2. Test

Run the repository QA workflow. It checks required files, HTML basics, local links, obvious secrets, Builder safety and sitemap coverage.

## 3. Deploy

Merge/push the tested change to the production branch used by GitHub Pages.

## 4. Verify

The QA workflow also checks the published GitHub Pages URLs. A release is not considered complete merely because a commit exists.

## 5. Next task

Only after the release gate passes should the next feature be started.

## Important limitation

The current project can automatically verify the public static GitHub Pages site. It cannot honestly claim that arbitrary creator repositories have been deployed until the authenticated GitHub integration and deployment backend exist.

## Release evidence

For important releases record:

- commit SHA
- QA run result
- published URL
- feature tested
- known limitations

This keeps the Academy auditable and prevents documentation from claiming functionality that has not actually been deployed.