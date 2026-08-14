# Multi-Academy Data Model

The Academy is moving from page-based prototypes toward a reusable content model.

## Hierarchy

**Academy → Course → Lesson / Quiz → Project → Evidence → Release**

Each Academy also owns branding and a release record.

## Why this model

- One creator can manage multiple Academies.
- Each Academy can have different courses and projects.
- Branding is isolated per Academy.
- Release state is explicit.
- Repository/commit/preview information can later be connected to real GitHub integration.
- The same model can work locally, in a static export, or behind a future server API.

## Release states

`draft → testing → preview → production`

A production release should require a successful QA result and an explicit creator action.

## Privacy principle

Student evidence and personal information should not be stored in this public static data model. A future authenticated backend should separate public course content from private learner records and use appropriate access controls.
