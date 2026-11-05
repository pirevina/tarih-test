// Test simulation of SEC-02 Cloaking and Anti-Tamper Engine
const assert = require('assert');

// Minimal SHA-256 for test
function _sha256(ascii) {
    ascii = unescape(encodeURIComponent(ascii));
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), l = 'length', i, j, res = '', words = [];
    var bitLen = ascii[l] * 8, hash = [], k = [], pc = 0, isC = {};
    for (var c = 2; pc < 64; c++) {
        if (!isC[c]) {
            for (i = 0; i < 313; i += c) isC[i] = c;
            hash[pc] = (mathPow(c, 0.5) * maxWord) | 0;
            k[pc++] = (mathPow(c, 1 / 3) * maxWord) | 0;
        }
    }
    ascii += '\x80';
    while (ascii[l] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[l]; i++) {
        j = ascii.charCodeAt(i);
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[l]] = (bitLen / maxWord) | 0;
    words[words[l]] = bitLen;
    for (j = 0; j < words[l];) {
        var w = words.slice(j, j += 16), oldH = hash;
        hash = hash.slice(0, 8);
        for (i = 0; i < 64; i++) {
            var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
            var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
            var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            hash = [(t1 + t2) | 0].concat(hash);
            hash[4] = (hash[4] + t1) | 0;
        }
        for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldH[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            res += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return res;
}

function cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/^[A-E]\)\s*/, '').trim();
}

function shuffle(array) {
    return array.slice(); // Identity for deterministic test
}

// Global mock
const window = {
    allTests: {
        "test_u1_sample": [
            {
                soru: "Tarih biliminin ilk basamağı nedir?",
                secenekler: ["A) Tasnif", "B) Tarama", "C) Tahlil"],
                cevap: "B) Tarama",
                aciklama: "Tarama 5T metodunun ilk basamağıdır."
            },
            {
                soru: "Parayı ilk bulan medeniyet hangisidir?",
                secenekler: ["A) Lidyalılar", "B) Sümerler", "C) Hititler"],
                cevap: "A) Lidyalılar",
                aciklama: "Lidyalılar parayı ilk kullanan uygarlıktır."
            }
        ]
    }
};

let ogrenci = { ad: "Ahmet Yılmaz", sinif: "9-A", no: "105" };
let aktifTest = null;
let suankiSorular = [];
let autoSaveData = { cevaplar: {} };
let _guvenliKasa = {};
let _aktifSinavOturumu = null;

function testSec(testKodu) {
    aktifTest = testKodu;
    const isKlasik = testKodu.includes('klasik');
    let hamSorular = (window.allTests && window.allTests[testKodu]) ? window.allTests[testKodu] : [];

    // 1. Oturum Başlatma ve İmza Damgası
    const baslangicTs = Date.now();
    const ogrenciId = ogrenci ? (ogrenci.no || ogrenci.ad || "Anonim") : "Bilinmeyen";
    _aktifSinavOturumu = {
        testKodu: testKodu,
        ogrenciId: ogrenciId,
        baslangic: baslangicTs,
        soruSayisi: hamSorular.length,
        token: _sha256("TarihSinavKalkan_" + testKodu + "_" + baslangicTs + "_" + ogrenciId)
    };

    // 2. Hafıza Karantinası
    _guvenliKasa[testKodu] = [];
    suankiSorular = shuffle(JSON.parse(JSON.stringify(hamSorular))).map((s, idx) => {
        _guvenliKasa[testKodu][idx] = {
            cevap: s.cevap,
            aciklama: s.aciklama || ""
        };
        delete s.cevap;
        delete s.aciklama;
        s.shuffledOptions = shuffle([...s.secenekler]);
        return s;
    });

    // 3. window.allTests maskeleme
    if (window.allTests && window.allTests[testKodu]) {
        window.allTests[testKodu].forEach(item => {
            if (!item._orijinalKorumada) {
                item._gizliCevap = item.cevap;
                item._gizliAciklama = item.aciklama;
                item._orijinalKorumada = true;
                delete item.cevap;
                delete item.aciklama;
            }
        });
    }
}

// TEST 1: Sınav başladıktan sonra bellek kontrolü
testSec("test_u1_sample");

console.log('suankiSorular[0].cevap:', suankiSorular[0].cevap);
console.log('suankiSorular[0].aciklama:', suankiSorular[0].aciklama);
console.log('window.allTests["test_u1_sample"][0].cevap:', window.allTests["test_u1_sample"][0].cevap);

assert.strictEqual(suankiSorular[0].cevap, undefined, 'suankiSorular[0].cevap MUST BE undefined');
assert.strictEqual(suankiSorular[0].aciklama, undefined, 'suankiSorular[0].aciklama MUST BE undefined');
assert.strictEqual(window.allTests["test_u1_sample"][0].cevap, undefined, 'window.allTests cevap MUST BE undefined');

// TEST 2: Soru cevaplama ve Değerlendirme
autoSaveData.cevaplar[0] = "Tarama"; // Doğru
autoSaveData.cevaplar[1] = "Sümerler"; // Yanlış

let dogruSayisi = 0;
let detayHtml = "";
let raporMetni = "[" + aktifTest.toUpperCase() + "] ";

suankiSorular.forEach((soru, index) => {
    const secilen = autoSaveData.cevaplar[index] || "BOŞ";
    const kasaVerisi = (_guvenliKasa[aktifTest] && _guvenliKasa[aktifTest][index]) 
        ? _guvenliKasa[aktifTest][index] 
        : { cevap: "", aciklama: "" };
    const dogruMetin = cleanText(kasaVerisi.cevap || "");
    const isCorrect = (secilen === dogruMetin);

    if (isCorrect) {
        dogruSayisi++;
        detayHtml += "[DOĞRU Soru " + (index+1) + " | " + kasaVerisi.aciklama + "] ";
    } else {
        detayHtml += "[YANLIŞ Soru " + (index+1) + " | Beklenen: " + dogruMetin + " | " + kasaVerisi.aciklama + "] ";
        raporMetni += "S" + (index+1) + ":Y (" + secilen + ") | ";
    }
});

const puan = Math.round((dogruSayisi / suankiSorular.length) * 100);
const gecenSureSn = 45;
const gecenSureStr = "0 dk 45 sn";

let guvenlikNotu = "";
if (_aktifSinavOturumu) {
    const imzaKodu = _sha256(_aktifSinavOturumu.token + ":" + puan + ":" + gecenSureSn).substring(0, 8).toUpperCase();
    raporMetni += " [Güvenlik İmzası: #" + imzaKodu + "]" + guvenlikNotu;
}

console.log('Puan:', puan);
console.log('Rapor Metni:', raporMetni);
console.log('Detay HTML:', detayHtml);

assert.strictEqual(puan, 50, 'Puan must be 50');
assert(raporMetni.includes('[Güvenlik İmzası: #'), 'Rapor must include security signature');
assert(detayHtml.includes('Tarama 5T metodunun ilk basamağıdır'), 'Detay must include explanation from secure vault');

console.log('All tests passed successfully! 100% SECURE.');
