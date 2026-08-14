# White-label multi-academy model

## Product model

One Academy framework can host or generate many independent Academy projects.

Each project can have:

- name and logo/branding
- language
- courses
- lessons
- quizzes
- projects
- assessment rules
- certificate policy
- repository
- preview URL
- production URL

## Ownership

The generated project belongs to the creator/organization that owns its repository and hosting account. The Academy framework should remain usable independently of a single hosting provider.

## Future roles

- Owner: full project and deployment control
- Editor: content and course editing
- Reviewer: assessment/quality review
- Instructor: learner-facing teaching tools
- Learner: course and project access

## Current implementation boundary

The static workspace is a local prototype. It does not yet provide server-side multi-user authentication, shared databases, billing, repository OAuth, or deployment orchestration.

Those features require a backend and explicit account/provider configuration. The public UI must not imply those capabilities exist before they are actually implemented.
