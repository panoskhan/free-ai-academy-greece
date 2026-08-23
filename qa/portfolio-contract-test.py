import json
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = json.loads(Path('data/portfolio-record-schema.json').read_text(encoding='utf-8'))


def validate_record(record):
    assert isinstance(record, dict)
    assert set(record) <= {'project', 'url', 'evidence', 'createdAt'}
    assert isinstance(record.get('project'), str) and 1 <= len(record['project']) <= 120
    assert isinstance(record.get('evidence'), str) and 1 <= len(record['evidence']) <= 1000
    assert 'createdAt' in record and isinstance(record['createdAt'], str)
    datetime.fromisoformat(record['createdAt'].replace('Z', '+00:00'))
    if 'url' in record:
        assert isinstance(record['url'], str) and len(record['url']) <= 300
        assert record['url'].startswith(('http://', 'https://')) and ' ' not in record['url']


def validate_export(payload):
    assert payload['schema'] == SCHEMA['properties']['schema']['const']
    datetime.fromisoformat(payload['exportedAt'].replace('Z', '+00:00'))
    assert isinstance(payload['records'], list)
    for record in payload['records']:
        validate_record(record)


now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
valid = {
    'schema': 'faa-portfolio-record/v1',
    'exportedAt': now,
    'records': [
        {
            'project': 'Greek Study Helper',
            'url': 'https://example.com/demo',
            'evidence': 'README, tests, deployment notes and reflection.',
            'createdAt': now,
        }
    ],
}
validate_export(valid)

for bad in [
    {**valid, 'schema': 'wrong/v1'},
    {**valid, 'records': [{**valid['records'][0], 'project': ''}]},
    {**valid, 'records': [{**valid['records'][0], 'evidence': 'x' * 1001}]},
    {**valid, 'records': [{**valid['records'][0], 'unexpected': True}]},
    {**valid, 'records': [{**valid['records'][0], 'url': 'javascript:alert(1)'}]},
    {**valid, 'records': [{**valid['records'][0], 'url': 'https://example.com/bad url'}]},
]:
    try:
        validate_export(bad)
    except (AssertionError, ValueError, KeyError):
        continue
    raise AssertionError(f'Invalid portfolio export accepted: {bad}')

print('Portfolio export contract fixture passed')
print('Portfolio invalid-record rejection checks passed')
