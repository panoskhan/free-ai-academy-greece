# 🇬🇷 Free AI Academy Greece

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23405130.svg)](https://doi.org/10.5281/zenodo.23405130)

**Μάθε. Χτίσε. Δοκίμασε. Δημοσίευσε.**

A free, Greek-first practical academy for learning AI by building real, portable projects.

## Mission

Help people in Greece understand AI, build useful tools, test their work responsibly, and leave with projects they can run, publish, or self-host themselves.

## Current platform

- 🏠 Greek-first responsive homepage
- 🎓 Six-course core curriculum
- 🧪 Practical labs and project deliverables
- 🗺️ A–Z learning roadmap
- 🛠️ Project Studio with beginner-to-final-project ideas
- 📈 Local student progress dashboard
- 🧾 Evidence Portfolio with portable proof-of-work records
- 🏆 Certificate verification foundation
- 🐙 GitHub and self-hosting education
- 🛠️ Website Builder with local persistence, live preview, tests, versions and standalone export
- 🎛️ Creator Workspace connecting website and academy project flows
- 🚦 Release Center with explicit QA/preview/production boundaries
- 🔎 Search-index policy: generated sitemap, self-canonical content pages, noindexed tools
- 📱 Installable web-app manifest foundation
- ♿ Accessibility and responsible-AI principles
- 🔐 Privacy-first, no-secret-in-browser guidance
- 🚫 No fake accreditation or invented credentials

## Core curriculum

1. AI Foundations
2. Prompt Engineering
3. Web Foundations
4. Build Your First AI Tool
5. GitHub & Self-Hosting
6. Responsible AI

## Specialisation courses

Beyond the six-course core, eight more courses (07–14) cover Python, business, image AI, data, app building and study skills, plus:

- **13 · AI για δημόσιες υπηρεσίες** — a civic-tech course built on the Gatekeeper-OS case study: the citizen's problem, honest failure states, privacy by design, input validation and signed passes, and how to move from a mock-data prototype to a permitted pilot.
- **14 · Έτοιμος/η για AI Hackathon** — preparation for AI hackathons such as AI Hackathon Greece: a 72-hour problem, team roles, schedule and feature freeze, a demo that survives failure, and a pitch built on the judging criteria.

Completing courses 11, 13 and 14 earns the **Civic Builder** badge on the student dashboard.

## Learning philosophy

**Learn → Quiz → Build → Test → Document → Publish.**

The goal is demonstrable ability, not passive completion. Learners should leave with ordinary source files they can inspect, modify, export, publish, or self-host.

## Evidence Portfolio

The Evidence Portfolio turns learning into portable proof-of-work. Learners can record real projects, demos or repositories, testing and verification notes, documentation, responsible-AI evidence, delivery/self-hosting evidence, and reflections. Records are stored locally and can be exported as JSON. Portfolio evidence is not an accredited qualification or independent certification.

## Certificates

The Academy may issue a **Certificate of Completion / Βεβαίωση Ολοκλήρωσης** when published requirements are met. This is an educational record issued by the project and must not be represented as a government, university, regulated-profession, or accredited qualification unless formal recognition is obtained.

## Trust standard

AI-generated educational material is not automatically treated as correct. Published lessons should be reviewed, sources identified where appropriate, uncertainty disclosed, and important factual claims checked before release.

## Privacy standard

The current student dashboard and Evidence Portfolio store progress and records locally in the learner's browser. Learners should never place secrets, passwords, or sensitive personal data into public repositories or untrusted AI prompts.

## Project identity

The project may be presented as an independent open-source initiative of **Panos Khan Foundation**, subject to the foundation's official naming and governance decisions.

## Search indexing policy

Google reported two problems in Search Console: *Alternate page with proper canonical tag* and
*Crawled - currently not indexed*. Both came from the same root cause — URLs were being offered
to the crawler that were never meant to be indexed.

The site now splits pages into two groups:

**Indexable content pages** (25 URLs) — the homepage, the course catalogue and its courses, the
lesson, the A–Z path, Project Studio, Evidence Portfolio, the quality standard, and the
about/contact/privacy/terms/accessibility/certificates pages. Each one is self-canonical, carries a
unique title and meta description, structured data, breadcrumbs, a shared footer of internal links,
and enough unique content to be worth indexing. These are the only URLs in `sitemap.xml`.

**Noindexed tool surfaces** (23 pages) — the builders, creator dashboard, student dashboard,
assessment recorder, preview and release-center screens, the QA checklists and `404.html`. These are
interactive, browser-local tools with little readable text, so a crawler would fetch them and then
decline to index them. They declare `<meta name="robots" content="noindex,follow">` and are kept out
of the sitemap. They are deliberately **not** blocked in `robots.txt`: a disallowed URL can never be
crawled, so Google would never see the noindex and the URL could linger in results.

Internal links always use the canonical directory form (`/courses/`, never `/courses/index.html`),
which is what produced the duplicate "alternate page" URLs.

### Keeping it consistent

```bash
python3 qa/build-sitemap.py   # regenerate sitemap.xml from the pages themselves
python3 qa/seo-audit.py       # verify canonicals, sitemap coverage and thin pages
```

`qa/build-sitemap.py` derives the sitemap from each page's robots meta, so the two can never drift.
`qa/seo-audit.py` runs in CI and fails the build on a missing or wrong canonical, a page thinner
than 250 words that is still indexable, a duplicate title or description, an `/index.html` internal
link, or any mismatch between the sitemap and the indexable pages.

> **Note:** crawlers only read `robots.txt` from the domain root
> (`https://panoskhan.online/robots.txt`). The copy in this repository documents intent; the sitemap
> itself is submitted in Google Search Console.

## QA and release status

The repository contains an automated Academy QA workflow covering core files, HTML metadata, JSON contracts, end-to-end static smoke tests, local navigation, builder safety, portfolio safety, sitemap structure, published sitemap URLs, and published GitHub Pages smoke routes. The Website Builder and Academy Builder remain browser-first prototypes: authenticated GitHub repository creation and production deployment still require a real backend/deployment integration and are never falsely reported as complete.

Public QA and launch checklists persist human-review progress locally and can export review status for release records. A feature is treated as released only after automated QA and applicable published-route verification provide evidence for the current commit.
