#!/usr/bin/env python3
"""Contract checks for course-specific Evidence Portfolio entry links."""
from pathlib import Path
from urllib.parse import parse_qs, urlparse

COURSES = {
    "ai-foundations": "AI Foundations",
    "prompt-engineering": "Prompt Engineering",
    "web-foundations": "Web Foundations",
    "first-ai-tool": "Build Your First AI Tool",
    "github-self-hosting": "GitHub & Self-Hosting",
    "responsible-ai": "Responsible AI",
}

ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "portfolio" / "index.html"
COURSE_HUB = ROOT / "courses" / "index.html"


def fail(message: str) -> None:
    raise AssertionError(message)


def main() -> None:
    hub = COURSE_HUB.read_text(encoding="utf-8")
    portfolio = PORTFOLIO.read_text(encoding="utf-8")

    for slug, title in COURSES.items():
        marker = f"course={slug}"
        if marker not in hub:
            fail(f"course hub missing evidence link query: {marker}")
        if title not in portfolio:
            fail(f"portfolio missing course template label: {title}")
        parsed = urlparse(f"../portfolio/index.html?course={slug}")
        if parsed.path != "../portfolio/index.html":
            fail(f"unexpected portfolio path for {slug}")
        if parse_qs(parsed.query).get("course") != [slug]:
            fail(f"unexpected course query for {slug}")

    if "URLSearchParams" not in portfolio:
        fail("portfolio does not expose the course-prefill contract")

    print(f"PASS: {len(COURSES)}/{len(COURSES)} course evidence templates validated")


if __name__ == "__main__":
    main()
