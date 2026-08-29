const fs=require('fs');
const html=fs.readFileSync('website-builder/multi-page-studio-v2.html','utf8');
const required=['id="send"','id="qa"','id="export"','id="json"','id="desktop"','id="mobile"','Move Contact before About','mobile-friendly','function build(','function edit(','function movePage(','function qa(','function exportSite('];
const missing=required.filter(x=>!html.includes(x));
if(missing.length){console.error('FAIL missing:',missing.join(', '));process.exit(1)}
if(/\beval\s*\(/.test(html)){console.error('FAIL eval present');process.exit(1)}
if(/<script[^>]+src=["']https?:/i.test(html)){console.error('FAIL remote script');process.exit(1)}
if(!/addEventListener\('keydown'/.test(html)){console.error('FAIL keyboard submit handling');process.exit(1)}
console.log('PASS builder interaction contract:',required.length,'checks');
