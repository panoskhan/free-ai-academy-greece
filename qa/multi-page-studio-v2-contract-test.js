const fs=require('fs');
const html=fs.readFileSync('website-builder/multi-page-studio-v2.html','utf8');
const required=['Move Contact before About','mobile-friendly','responsive','Full QA','Export Site','localStorage','site.pages.splice','site.accent','data-page'];
const missing=required.filter(x=>!html.includes(x));
if(missing.length){console.error('FAIL missing:',missing.join(', '));process.exit(1)}
if(/\beval\s*\(/.test(html)){console.error('FAIL eval present');process.exit(1)}
if(/<script[^>]+src=["']https?:/i.test(html)){console.error('FAIL remote script');process.exit(1)}
console.log('PASS multi-page studio v2 contract:',required.length,'checks');
