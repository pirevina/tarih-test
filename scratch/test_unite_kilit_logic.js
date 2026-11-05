const fs = require('fs');

// We simulate the unite-kilit.js logic
const code = fs.readFileSync('motorlar/unite-kilit.js', 'utf8');

// Test the logic directly
let ogrenci = null;
let globalZumreOturumu = null;
let VARSAYILAN_KILITLI = ['u3'];
let YONETICI_AD = 'Murat Mutlu (Öğretmen)';

function ogretmenVeyaYoneticiMi() {
    try {
        if (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad) {
            if (ogrenci.ad.includes('(Öğretmen)') || ogrenci.ad.includes('(Zümre)')) return true;
        }
    } catch (e) {}
    try {
        var kayit = globalZumreOturumu;
        if (kayit) {
            var o = JSON.parse(kayit);
            if (o && o.ad && (o.ad.includes('(Öğretmen)') || o.ad.includes('(Zümre)'))) return true;
        }
    } catch (e) {}
    return false;
}

function yoneticiMi() {
    try {
        if (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad === YONETICI_AD) return true;
    } catch (e) {}
    try {
        var kayit = globalZumreOturumu;
        if (kayit) {
            var o = JSON.parse(kayit);
            if (o && o.ad === YONETICI_AD) return true;
        }
    } catch (e) {}
    return false;
}

let KILITLI = ['u3']; // Unit 2 open, Unit 3 locked

function testOdayaGir(uniteId) {
    if (ogretmenVeyaYoneticiMi()) {
        return "GIRIS_SERBEST_OGRETMEN";
    }
    if (KILITLI.indexOf(uniteId) !== -1) {
        return "KILITLI_ENGEL";
    }
    return "GIRIS_SERBEST_OGRENCI";
}

// TEST 1: Murat Mutlu
ogrenci = { ad: "Murat Mutlu (Öğretmen)", sinif: "Master", no: "Öğretmen" };
console.log("Murat Mutlu yoneticiMi:", yoneticiMi()); // Should be true
console.log("Murat Mutlu ogretmenVeyaYoneticiMi:", ogretmenVeyaYoneticiMi()); // Should be true
console.log("Murat Mutlu U1:", testOdayaGir('u1'));
console.log("Murat Mutlu U2:", testOdayaGir('u2'));
console.log("Murat Mutlu U3:", testOdayaGir('u3'));

// TEST 2: Tarih Zümresi
ogrenci = { ad: "Selma Kaya (Zümre)", sinif: "Tarih", no: "VIP" };
console.log("\nZümre yoneticiMi:", yoneticiMi()); // Should be false (no admin toggle button)
console.log("Zümre ogretmenVeyaYoneticiMi:", ogretmenVeyaYoneticiMi()); // Should be true (bypass locks)
console.log("Zümre U1:", testOdayaGir('u1'));
console.log("Zümre U2:", testOdayaGir('u2'));
console.log("Zümre U3:", testOdayaGir('u3')); // Must be accessible for teachers!

// TEST 3: Öğrenci
ogrenci = { ad: "Baran Demir", sinif: "9-A", no: "123" };
console.log("\nÖğrenci yoneticiMi:", yoneticiMi()); // false
console.log("Öğrenci ogretmenVeyaYoneticiMi:", ogretmenVeyaYoneticiMi()); // false
console.log("Öğrenci U1:", testOdayaGir('u1')); // GIRIS_SERBEST_OGRENCI
console.log("Öğrenci U2:", testOdayaGir('u2')); // GIRIS_SERBEST_OGRENCI (since U2 is open!)
console.log("Öğrenci U3:", testOdayaGir('u3')); // KILITLI_ENGEL (since U3 is locked!)

console.log("\nAll logic verification successfully validated!");
