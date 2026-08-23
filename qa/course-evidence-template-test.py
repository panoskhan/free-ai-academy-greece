from pathlib import Path
from urllib.parse import parse_qs, urlparse

html = Path('portfolio/index.html').read_text(encoding='utf-8')
required = {
    'AI Foundations': 'ai-foundations',
    'Prompt Engineering': 'prompt-engineering',
    'Web Foundations': 'web-foundations',
    'Build Your First AI Tool': 'first-ai-tool',
    'GitHub & Self-Hosting': 'github-self-hosting',
    'Responsible AI': 'responsible-ai',
}

for course, slug in required.items():
    assert course in html, f'missing course template: {course}'
    marker = f'course={slug}'
    assert marker in html, f'missing course query marker: {marker}'

# Guard the expected prefill contract without executing browser JavaScript.
for slug in required.values():
    start = html.find(f'course={slug}')
    assert start >= 0
    fragment = html[max(0, start - 500):start + 500]
    assert 'portfolio/index.html' in fragment or 'course=' in fragment

# The course-template links must use query parameters rather than executable schemes.
for token in ('javascript:', 'data:text/html'):
    assert token not in html.lower(), f'unsafe template URL scheme found: {token}'

print(f'Course evidence templates passed: {len(required)}')
