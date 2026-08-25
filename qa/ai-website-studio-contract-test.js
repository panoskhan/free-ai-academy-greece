const fs=require('fs');
const html=fs.readFileSync('website-builder/ai-studio.html','utf8');
const contract=JSON.parse(fs.readFileSync('data/ai-website-studio-contract.json','utf8'));
const required=['function infer','function applyEdit','function generate','function edit','function render','function exportHtml','localStorage','URL.createObjectURL','JSON.stringify(site','aria-live','Save Project JSON'];
for(const marker of required){if(!html.includes(marker))throw new Error(`AI Studio missing marker: ${marker}`)}
if(html.includes('sk-')||html.includes('ghp_')||html.includes('AIza'))throw new Error('AI Studio contains a browser secret marker');
if(contract.id!=='faa-ai-website-studio-contract/v1')throw new Error('Wrong AI Studio contract id');
for(const phase of ['prompt','intent','site-model','preview','edit','export','qa','publish'])if(!contract.flow.includes(phase))throw new Error(`Missing flow phase: ${phase}`);
for(const key of ['business','title','description','pages','style','accent','cards'])if(!contract.siteModel.required.includes(key))throw new Error(`Missing site model field: ${key}`);
console.log('AI Website Studio contract QA passed');
