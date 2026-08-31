const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('website-builder/multi-page-studio-v2.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!match) throw new Error('FAIL Builder script not found');
const source = match[1];

if (/\beval\s*\(/.test(source)) throw new Error('FAIL eval present');
if (/<script[^>]+src=["']https?:/i.test(html)) throw new Error('FAIL remote script');

function el() {
  return {
    children: [], textContent: '', innerHTML: '', className: '', value: '',
    onclick: null, title: '', scrollTop: 0, scrollHeight: 0,
    appendChild(x) { this.children.push(x); return x; },
    replaceChildren(...xs) { this.children = xs; },
    addEventListener(type, fn) { this['on' + type] = fn; },
    querySelectorAll() { return []; },
    click() { if (typeof this.onclick === 'function') this.onclick({ preventDefault() {} }); }
  };
}

const nodes = {};
['messages','prompt','send','qa','export','json','desktop','mobile','tabs','order','preview','model','status']
  .forEach(id => { nodes[id] = el(); });

const storage = new Map();
const document = {
  getElementById(id) { return nodes[id] || (nodes[id] = el()); },
  createElement() { return el(); }
};
const context = {
  console,
  document,
  localStorage: {
    getItem(k) { return storage.has(k) ? storage.get(k) : null; },
    setItem(k, v) { storage.set(k, String(v)); }
  },
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  Blob: class Blob { constructor(parts, opts) { this.parts = parts; this.type = opts && opts.type; } },
  setTimeout(fn) { fn(); return 1; }
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'multi-page-studio-v2.html' });

const state = () => vm.runInContext('site', context);
const invoke = (name, arg) => vm.runInContext(`${name}(${JSON.stringify(arg)})`, context);
const assert = (condition, message) => { if (!condition) throw new Error('FAIL ' + message); };

// 1. Generate: actual build() must create the requested pages.
invoke('build', 'Create a bakery website with Home, Menu, About and Contact pages.');
let s = state();
assert(s.business === 'Bakery', 'generation did not set business');
assert(s.pages.map(p => p.name).join('|') === 'Home|Menu|About|Contact', 'generation page structure is wrong');
assert(s.qa === 'not-run', 'generation should require QA');

// 2. Edit color: actual edit() must mutate the model and invalidate QA.
invoke('edit', 'Make the hero blue');
s = state();
assert(s.accent === '#2563eb', 'blue edit did not change accent');
assert(s.qa === 'not-run', 'editing should invalidate QA');

// 3. Add page: actual edit() must add a page once.
invoke('edit', 'Add pricing');
s = state();
assert(s.pages.some(p => p.name === 'Pricing'), 'add page did not add Pricing');
const countAfterAdd = s.pages.length;
invoke('edit', 'Add pricing');
assert(state().pages.length === countAfterAdd, 'add page is not idempotent');

// 4. Reorder: actual movePage() must place Contact before About.
invoke('edit', 'Move Contact before About');
s = state();
assert(s.pages.findIndex(p => p.name === 'Contact') < s.pages.findIndex(p => p.name === 'About'), 'reorder did not move Contact before About');

// 5. Responsive mode: actual edit() must switch the model to mobile.
invoke('edit', 'Make it mobile-friendly');
s = state();
assert(s.responsive === 'mobile', 'mobile-friendly command did not set mobile mode');

// 6. QA: actual qa() must pass the generated/edited model.
invoke('qa');
s = state();
assert(s.qa === 'passed', 'QA did not pass a valid generated model');
assert(s.status === 'preview', 'QA did not enter preview status');

// 7. Export: actual exportSite() must perform its QA gate and create an export.
invoke('exportSite');
assert(state().qa === 'passed', 'export invalidated a passing QA state');

// 8. JSON save: actual saveJson() must execute without throwing.
vm.runInContext('saveJson()', context);

// 9. Keyboard submission: actual handler must be installed on prompt.
assert(typeof nodes.prompt.onkeydown === 'function', 'keyboard submission handler missing');

console.log('PASS Builder behavioral flow: generate -> edit -> add page -> reorder -> mobile -> QA -> export -> JSON');
