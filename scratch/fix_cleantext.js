const fs = require('fs');

const files = [
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif9.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif10.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif11.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif12.js'
];

for (const f of files) {
    let c = fs.readFileSync(f, 'utf8');
    const isCRLF = c.includes('\r\n');
    const eol = isCRLF ? '\r\n' : '\n';
    const target = "function cleanText(text) { return text.replace(/^[A-E]\\)\\s*/, ''); }";
    const replacement = `function cleanText(text) {${eol}        if (!text || typeof text !== 'string') return '';${eol}        return text.replace(/^[A-E]\\)\\s*/, '').trim();${eol}    }`;
    if (c.includes(target)) {
        c = c.replace(target, replacement);
        fs.writeFileSync(f, c, 'utf8');
        console.log('cleanText updated in:', f);
    } else {
        console.log('cleanText target not found (or already updated) in:', f);
    }
}
