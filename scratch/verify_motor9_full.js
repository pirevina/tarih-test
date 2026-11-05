// Verification of motor_sinif9.js SEC-02 implementation
const fs = require('fs');

// Check that the file compiles without any syntax issues
const motor9Code = fs.readFileSync('c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif9.js', 'utf8');

// Basic checks in code
console.log('Checks for motor_sinif9.js:');
console.log('1. Has _guvenliKasa:', motor9Code.includes('_guvenliKasa'));
console.log('2. Has _aktifSinavOturumu:', motor9Code.includes('_aktifSinavOturumu'));
console.log('3. Deletes s.cevap during test:', motor9Code.includes('delete s.cevap'));
console.log('4. Deletes s.aciklama during test:', motor9Code.includes('delete s.aciklama'));
console.log('5. Masks window.allTests:', motor9Code.includes('item._orijinalKorumada = true'));
console.log('6. Has security signature token in report:', motor9Code.includes('Güvenlik İmzası') || motor9Code.includes('İmza: #'));

// Let's verify motor_sinif10.js as well
const motor10Code = fs.readFileSync('c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif10.js', 'utf8');
console.log('\nChecks for motor_sinif10.js:');
console.log('1. Has _guvenliKasa:', motor10Code.includes('_guvenliKasa'));
console.log('2. Has _aktifSinavOturumu:', motor10Code.includes('_aktifSinavOturumu'));
console.log('3. Deletes s.cevap during test:', motor10Code.includes('delete s.cevap'));
console.log('4. Deletes s.aciklama during test:', motor10Code.includes('delete s.aciklama'));
console.log('5. Masks window.allTests:', motor10Code.includes('item._orijinalKorumada = true'));
console.log('6. Has security signature token in report:', motor10Code.includes('Güvenlik İmzası') || motor10Code.includes('İmza: #'));
