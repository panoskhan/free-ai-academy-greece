const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('website-builder/contract-bridge.js', 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'contract-bridge.js' });

const api = context.window.FAAWebsiteContract;
if (!api) throw new Error('FAAWebsiteContract was not exported');
if (api.CONTRACT_ID !== 'faa-website-builder-contract/v1') throw new Error('Unexpected contract id');

const record = api.toContract({
  id: 'test-site',
  name: 'QA Site',
  version: 3,
  status: 'Preview',
  pages: { home: {} },
  design: { accent: '#635bff' },
  content: { hero: 'Hello' },
  seo: { language: 'el' },
  qa: 'passed',
  preview: 'ready',
  deployment: 'ready'
});

const validation = api.validate(record);
if (!validation.valid) throw new Error(`Valid contract rejected: ${validation.errors.join(', ')}`);

const readiness = api.readiness(record);
if (!readiness.ready) throw new Error('Release-ready contract was not reported ready');

const invalid = api.toContract({ id: '', name: '', status: 'unknown' });
const invalidResult = api.validate(invalid);
if (invalidResult.valid) throw new Error('Invalid contract was accepted');

const blocked = api.toContract({
  id: 'blocked-site', name: 'Blocked', version: 1, status: 'Draft',
  pages: {}, design: {}, content: {}, seo: {},
  qa: 'not-run', preview: 'not-ready', deployment: 'not-configured'
});
if (api.readiness(blocked).ready) throw new Error('Incomplete release was reported ready');

console.log('Website Builder contract bridge runtime test passed');
console.log('Valid record:', JSON.stringify(record));
console.log('Readiness:', JSON.stringify(readiness));
