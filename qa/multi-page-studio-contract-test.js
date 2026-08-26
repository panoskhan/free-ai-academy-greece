const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('website-builder/multi-page-studio.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
if (!script) throw new Error('Multi-page Studio script not found');
for (const marker of ['faa-ai-website-studio-contract/v1','function build','function edit','function qa','function exportSite','function saveJson','localStorage']) {
  if (!script.includes(marker)) throw new Error(`Missing marker: ${marker}`);
}
if (/sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{20,}/.test(script)) throw new Error('Browser secret marker detected');
const context = { console, localStorage: { getItem: () => null, setItem: () => {} }, document: { getElementById: () => ({}) } };
vm.createContext(context);
new vm.Script(script); // syntax/runtime compilation gate
console.log('Multi-page Studio contract QA markers and JavaScript compilation passed');
