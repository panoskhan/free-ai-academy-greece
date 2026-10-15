#!/usr/bin/env python3
"""Regenerate sitemap.xml from the pages that are actually indexable.

A page is included unless it declares robots noindex, so the sitemap can never
drift from the pages themselves. Run after adding, removing or de-indexing a page:

    python3 qa/build-sitemap.py
"""
from __future__ import annotations

import datetime
import importlib.util
import subprocess
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location("seo_lib", Path(__file__).with_name("seo-lib.py"))
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)


def git(*args: str) -> str:
    try:
        out = subprocess.run(["git", *args], cwd=seo.ROOT, capture_output=True, text=True, timeout=20)
        return out.stdout.strip() if out.returncode == 0 else ""
    except Exception:
        return ""


def last_modified(page: Path, dirty: set[str]) -> str:
    """Commit date of the page; today when it has uncommitted edits waiting to ship."""
    relative = page.relative_to(seo.ROOT).as_posix()
    if relative in dirty:
        return datetime.date.today().isoformat()
    return git("log", "-1", "--format=%cs", "--", relative) or datetime.date.today().isoformat()


def pending_changes() -> set[str]:
    """Paths edited but not yet committed; these ship with today's date."""
    changed = git("diff", "--name-only", "HEAD").splitlines()
    untracked = git("ls-files", "--others", "--exclude-standard").splitlines()
    return {line.strip() for line in changed + untracked if line.strip()}


def main() -> int:
    dirty = pending_changes()
    pages = seo.indexable_pages()
    entries = sorted((seo.canonical_url(p), last_modified(p, dirty)) for p in pages)

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, stamp in entries:
        lines.append(f"  <url><loc>{url}</loc><lastmod>{stamp}</lastmod></url>")
    lines.append("</urlset>")

    (seo.ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"sitemap.xml written with {len(entries)} indexable URLs")
    excluded = len(seo.html_pages()) - len(pages)
    print(f"excluded as noindex: {excluded} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
