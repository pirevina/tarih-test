const fs = require('fs');
const path = require('path');

const dirs = ['sinif9sorular', 'sinif10sorular', 'sinif11sorular', 'sinif12sorular'];
let totalTests = 0;
let fileCount = 0;

for (const d of dirs) {
    const p = path.join('c:/Users/belok/Desktop/tarih-portal', d);
    if (!fs.existsSync(p)) continue;
    const files = fs.readdirSync(p).filter(f => f.startsWith('u') && f.endsWith('.js'));
    for (const f of files) {
        fileCount++;
        const content = fs.readFileSync(path.join(p, f), 'utf8');
        const matches = content.match(/test_u\w+/g);
        if (matches) totalTests += (new Set(matches)).size;
    }
}
console.log('Total question files:', fileCount);
console.log('Unique test keys approximately:', totalTests);
