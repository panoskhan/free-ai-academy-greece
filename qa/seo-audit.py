#!/usr/bin/env python3
"""Index-health audit for the Academy site.

Checks the things that make Google drop a page from the index or file it under
"Crawled - currently not indexed" / "Alternate page with proper canonical tag":

  * every page declares a title, meta description, H1 and canonical URL
  * canonical URLs point at the page itself, in directory form
  * no internal link points at an /index.html duplicate of a directory URL
  * sitemap.xml lists exactly the indexable pages, and nothing noindexed
  * indexable pages carry enough unique content to be worth indexing
  * titles and meta descriptions are unique across indexable pages
  * social preview images resolve to a file that exists

Standard library only. Run locally with:  python3 qa/seo-audit.py
"""
from __future__ import annotations

import importlib.util
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

spec = importlib.util.spec_from_file_location("seo_lib", Path(__file__).with_name("seo-lib.py"))
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)

# A page below this many words of visible text reads as thin to a crawler and is
# very likely to be crawled and then left out of the index.
MIN_WORDS = 250
DESCRIPTION_MIN, DESCRIPTION_MAX = 70, 320
TITLE_MAX = 70


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages = seo.html_pages()
    titles: dict[str, str] = {}
    descriptions: dict[str, str] = {}
    indexable: list[Path] = []

    for page in pages:
        relative = page.relative_to(seo.ROOT).as_posix()
        text = page.read_text(encoding="utf-8")
        noindex = seo.is_noindex(text)
        if not noindex:
            indexable.append(page)

        title_match = re.search(r"(?is)<title>(.*?)</title>", text)
        title = title_match.group(1).strip() if title_match else ""
        if not title:
            errors.append(f"{relative}: missing <title>")
        elif len(title) > TITLE_MAX:
            warnings.append(f"{relative}: title is {len(title)} chars, may be truncated in results")

        description = seo.meta_content(text, "description") or ""
        if not description.strip():
            errors.append(f"{relative}: missing meta description")
        elif not noindex and not DESCRIPTION_MIN <= len(description) <= DESCRIPTION_MAX:
            warnings.append(f"{relative}: meta description is {len(description)} chars")

        if not re.search(r"(?is)<h1[\s>]", text):
            errors.append(f"{relative}: missing <h1>")

        canonical = seo.canonical_tag(text)
        expected = seo.canonical_url(page)
        if not noindex:
            if not canonical:
                errors.append(f"{relative}: missing canonical link")
            elif canonical != expected:
                errors.append(f"{relative}: canonical is {canonical}, expected {expected}")

            words = seo.visible_words(text)
            if words < MIN_WORDS:
                errors.append(
                    f"{relative}: only {words} words of visible text; indexable pages need "
                    f"at least {MIN_WORDS} or should be marked noindex"
                )

            if title:
                titles.setdefault(title, relative)
                if titles[title] != relative:
                    errors.append(f"{relative}: duplicate <title> shared with {titles[title]}")
            if description:
                descriptions.setdefault(description, relative)
                if descriptions[description] != relative:
                    errors.append(
                        f"{relative}: duplicate meta description shared with {descriptions[description]}"
                    )

        # internal links must use the canonical directory form
        for target in re.findall(r'href=["\']([^"\']+)["\']', text):
            if target.startswith(("http://", "https://", "//", "mailto:", "tel:", "#")):
                continue
            if re.search(r"(^|/)index\.html($|[#?])", target):
                errors.append(f"{relative}: links to {target}; use the directory URL instead")

        # social images must resolve. The shared preview image lives in the
        # domain-root repository and is verified by published-verify.yml, so only
        # images this project serves itself are checked against the filesystem.
        for prop, attr in (("og:image", "property"), ("twitter:image", "name")):
            value = seo.meta_content(text, prop, attr)
            if not value:
                continue
            parsed = urlparse(value)
            if parsed.netloc and parsed.netloc != urlparse(seo.SITE_ORIGIN).netloc:
                errors.append(f"{relative}: {prop} points at another domain: {value}")
                continue
            if not parsed.path.startswith(seo.BASE_PATH + "/"):
                continue  # served by the domain-root site, not this repository
            local = seo.ROOT / parsed.path[len(seo.BASE_PATH) + 1:]
            if not local.exists():
                errors.append(f"{relative}: {prop} does not resolve to a file: {value}")

    # sitemap must match the indexable set exactly
    root = ET.parse(seo.ROOT / "sitemap.xml").getroot()
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    listed = {node.text.strip() for node in root.findall(f"{ns}url/{ns}loc") if node.text}
    expected_urls = {seo.canonical_url(p) for p in indexable}

    for url in sorted(listed - expected_urls):
        errors.append(f"sitemap.xml lists {url}, which is noindexed or does not exist")
    for url in sorted(expected_urls - listed):
        errors.append(f"sitemap.xml is missing indexable page {url}")

    robots = (seo.ROOT / "robots.txt").read_text(encoding="utf-8")
    for line in robots.splitlines():
        if line.lower().startswith("disallow:"):
            value = line.split(":", 1)[1].strip()
            if value and any(url.endswith(value) or value in url for url in expected_urls):
                errors.append(f"robots.txt disallows {value}, which blocks an indexable page")

    print(f"Pages checked: {len(pages)}  indexable: {len(indexable)}  noindex: {len(pages) - len(indexable)}")
    print(f"Sitemap URLs: {len(listed)}")

    if warnings:
        print("\nWARNINGS:")
        for warning in warnings:
            print(f"- {warning}")

    if errors:
        print("\nFAILURES:")
        for error in errors:
            print(f"- {error}")
        print(f"\nSEO audit failed with {len(errors)} issue(s).")
        return 1

    print("\nSEO audit passed: canonicals, sitemap and index coverage are consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
