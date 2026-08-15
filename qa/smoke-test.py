#!/usr/bin/env python3
"""End-to-end static QA for the Academy repository.

This intentionally uses only Python's standard library so CI needs no package install.
It validates every HTML page, local links/assets/anchors, JSON documents, sitemap
integrity, robots.txt and the PWA manifest.
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE_PATH = "/free-ai-academy-greece"
SITE_ORIGIN = "https://panoskhan.github.io"

class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tags = []
        self.ids = set()
        self.links = []
        self.scripts = []
        self.title = ""
        self.in_title = False
        self.meta_description = False
        self.h1_count = 0
        self.onclick = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append(tag)
        if "id" in attrs and attrs["id"]:
            self.ids.add(attrs["id"])
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and attrs.get("name", "").lower() == "description" and attrs.get("content", "").strip():
            self.meta_description = True
        if tag in {"a", "link", "script", "img", "iframe", "source", "video", "audio"}:
            attr = "src" if tag in {"script", "img", "iframe", "source", "video", "audio"} else "href"
            if attrs.get(attr):
                self.links.append((attr, attrs[attr], tag))
        if attrs.get("onclick"):
            self.onclick.append(attrs["onclick"])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data.strip()


def fail(errors, message):
    errors.append(message)


def resolve_local(source: Path, target: str):
    target = target.split("?", 1)[0]
    if target.startswith("#"):
        return source, target[1:]
    if target.startswith("/"):
        if target.startswith(BASE_PATH):
            target = target[len(BASE_PATH):] or "/"
        path = ROOT / target.lstrip("/")
    else:
        path = source.parent / target
    path = path.resolve()
    try:
        path.relative_to(ROOT.resolve())
    except ValueError:
        return None, None
    if path.is_dir():
        path = path / "index.html"
    return path, None


def main():
    errors = []
    html_files = sorted(ROOT.rglob("*.html"))
    html_files = [p for p in html_files if ".git" not in p.parts]
    print(f"HTML pages discovered: {len(html_files)}")

    page_data = {}
    for page in html_files:
        text = page.read_text(encoding="utf-8", errors="strict")
        parser = PageParser()
        try:
            parser.feed(text)
        except Exception as exc:
            fail(errors, f"HTML parse error: {page}: {exc}")
            continue
        relative = page.relative_to(ROOT)
        if not re.search(r"<!doctype\s+html", text, re.I):
            fail(errors, f"Missing doctype: {relative}")
        # 404 is still a real HTML document and should be accessible/consistent.
        lang = re.search(r'<html[^>]*\blang=["\']([^"\']+)', text, re.I)
        if not lang or lang.group(1).lower() != "el":
            fail(errors, f'Missing lang="el": {relative}')
        if not re.search(r'<meta[^>]+charset=["\']?utf-8', text, re.I):
            fail(errors, f"Missing UTF-8 charset: {relative}")
        if not re.search(r'<meta[^>]+name=["\']viewport["\']', text, re.I):
            fail(errors, f"Missing viewport: {relative}")
        if not parser.title:
            fail(errors, f"Missing title: {relative}")
        if not parser.meta_description:
            fail(errors, f"Missing meta description: {relative}")
        if parser.h1_count < 1:
            fail(errors, f"Missing H1: {relative}")
        for attr, target, tag in parser.links:
            target = target.strip()
            if not target or target.startswith(("javascript:", "data:")):
                fail(errors, f"Invalid {tag} {attr}: {relative} -> {target!r}")
                continue
            parsed = urlparse(target)
            if parsed.scheme or parsed.netloc:
                continue
            local, fragment = resolve_local(page, target)
            if local is None:
                continue
            if not local.exists():
                fail(errors, f"Broken local {tag} {attr}: {relative} -> {target}")
            if fragment and local == page and fragment not in parser.ids:
                fail(errors, f"Broken anchor: {relative} -> #{fragment}")
        page_data[page] = parser

    # JSON syntax + minimum model consistency checks.
    for path in sorted(ROOT.rglob("*.json")):
        if ".git" in path.parts:
            continue
        try:
            obj = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(errors, f"Invalid JSON: {path.relative_to(ROOT)}: {exc}")
            continue
        if path.name == "example-academy.json":
            if not isinstance(obj.get("academies"), list) or not obj["academies"]:
                fail(errors, "example-academy.json has no academies")
            else:
                academy = obj["academies"][0]
                for key in ("id", "name", "status", "branding", "courses", "projects", "release"):
                    if key not in academy:
                        fail(errors, f"example-academy.json missing academy field: {key}")
                if academy.get("release", {}).get("qaPassed") is not True:
                    fail(errors, "example-academy.json release.qaPassed is not true")

    # Sitemap XML + every URL must map to an existing repository page.
    sitemap = ROOT / "sitemap.xml"
    try:
        tree = ET.parse(sitemap)
        root = tree.getroot()
        locs = [x.text.strip() for x in root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc") if x.text]
        if not locs:
            fail(errors, "sitemap.xml contains no URLs")
        for loc in locs:
            parsed = urlparse(loc)
            if parsed.scheme != "https" or parsed.netloc != "panoskhan.github.io":
                fail(errors, f"Unexpected sitemap origin: {loc}")
                continue
            path_part = parsed.path
            if path_part == BASE_PATH or path_part == BASE_PATH + "/":
                local = ROOT / "index.html"
            elif path_part.startswith(BASE_PATH + "/"):
                local = ROOT / path_part[len(BASE_PATH) + 1:]
                if local.is_dir():
                    local = local / "index.html"
            else:
                fail(errors, f"Sitemap URL outside project: {loc}")
                continue
            if not local.exists():
                fail(errors, f"Sitemap target missing: {loc} -> {local.relative_to(ROOT) if local.is_relative_to(ROOT) else local}")
        print(f"Sitemap URLs checked: {len(locs)}")
    except Exception as exc:
        fail(errors, f"Invalid sitemap.xml: {exc}")

    # robots.txt should expose the same sitemap.
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    expected_sitemap = SITE_ORIGIN + BASE_PATH + "/sitemap.xml"
    if expected_sitemap not in robots:
        fail(errors, "robots.txt does not reference the canonical sitemap")

    # PWA manifest must parse and point to a real start page.
    manifest = ROOT / "manifest.webmanifest"
    try:
        obj = json.loads(manifest.read_text(encoding="utf-8"))
        if not obj.get("name") or not obj.get("start_url"):
            fail(errors, "manifest.webmanifest missing name/start_url")
        start = obj.get("start_url", "./").split("?", 1)[0].split("#", 1)[0]
        start_path = ROOT / start.strip("./")
        if start_path.is_dir():
            start_path = start_path / "index.html"
        if not start_path.exists():
            fail(errors, f"Manifest start_url does not map to a file: {start}")
    except Exception as exc:
        fail(errors, f"Invalid manifest.webmanifest: {exc}")

    if errors:
        print("\nFAILURES:")
        for error in errors:
            print(f"- {error}")
        print(f"\nSmoke test failed with {len(errors)} issue(s).")
        return 1

    print("All static A-Z smoke tests passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
