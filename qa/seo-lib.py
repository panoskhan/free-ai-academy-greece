#!/usr/bin/env python3
"""Shared SEO helpers for the Academy repository.

Standard library only, so CI needs no package install. One rule lives here and is
used by both the sitemap generator and the SEO audit: a page belongs in the index
(and therefore in sitemap.xml) unless it declares robots noindex.
"""
from __future__ import annotations

import html as html_mod
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_PATH = "/free-ai-academy-greece"
SITE_ORIGIN = "https://panoskhan.online"
BASE_URL = SITE_ORIGIN + BASE_PATH + "/"

NOINDEX_RE = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']*)["\']', re.I)


def html_pages() -> list[Path]:
    return sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)


def is_noindex(text: str) -> bool:
    match = NOINDEX_RE.search(text)
    return bool(match) and "noindex" in match.group(1).lower()


def canonical_url(page: Path) -> str:
    """The one URL a page should be indexed under: directories end in a slash."""
    relative = page.relative_to(ROOT).as_posix()
    if relative.endswith("index.html"):
        relative = relative[: -len("index.html")]
    return BASE_URL + relative


def indexable_pages() -> list[Path]:
    return [p for p in html_pages() if not is_noindex(p.read_text(encoding="utf-8"))]


def visible_words(text: str) -> int:
    """Rough word count of what a crawler reads after scripts and styles are gone."""
    text = re.sub(r"(?is)<script.*?</script>", " ", text)
    text = re.sub(r"(?is)<style.*?</style>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    return len(html_mod.unescape(text).split())


def meta_content(text: str, name: str, attr: str = "name") -> str | None:
    pattern = re.compile(
        r'<meta[^>]+%s=["\']%s["\'][^>]*content=["\']([^"\']*)["\']' % (attr, re.escape(name)), re.I
    )
    match = pattern.search(text)
    if match:
        return html_mod.unescape(match.group(1))
    pattern = re.compile(
        r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*%s=["\']%s["\']' % (attr, re.escape(name)), re.I
    )
    match = pattern.search(text)
    return html_mod.unescape(match.group(1)) if match else None


def canonical_tag(text: str) -> str | None:
    match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', text, re.I)
    return match.group(1) if match else None
