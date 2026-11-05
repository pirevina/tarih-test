const fs = require('fs');
const path = require('path');

const motorFiles = [
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif9.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif10.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif11.js',
    'c:/Users/belok/Desktop/tarih-portal/motorlar/motor_sinif12.js'
];

for (const filePath of motorFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const isCRLF = content.includes('\r\n');
    const eol = isCRLF ? '\r\n' : '\n';

    // 1. Declare _guvenliKasa and _aktifSinavOturumu near suankiSorular
    if (!content.includes('let _guvenliKasa')) {
        content = content.replace(
            /let\s+suankiSorular\s*=\s*\[\];/,
            `let suankiSorular = [];${eol}    let _guvenliKasa = {};${eol}    let _aktifSinavOturumu = null;`
        );
    }

    // 2. Improve cleanText
    content = content.replace(
        /function\s+cleanText\(text\)\s*\{\s*return\s+text\.replace\(\/\^\[A-E\]\\\)\s*\*\/,\s*['"]['"]\);\s*\}/,
        `function cleanText(text) {${eol}        if (!text || typeof text !== 'string') return '';${eol}        return text.replace(/^[A-E]\\)\\s*/, '').trim();${eol}    }`
    );

    // 3. Update testSec rendering block with Cloaking & Anti-Tamper Session
    const oldTestSecBlock = /flagged\s*=\s*\{\};\s*autoSaveData\s*=\s*\{\s*cevaplar:\s*\{\},\s*flagged:\s*\{\},\s*ihlal:\s*0,\s*testKodu:\s*testKodu,\s*ogrenci:\s*ogrenci,\s*startTime:\s*Date\.now\(\)\s*\};\s*if\s*\(isKlasik\)\s*\{\s*renderKlasik\(alan,\s*hamSorular\);\s*\}\s*else\s*\{\s*suankiSorular\s*=\s*shuffle\(JSON\.parse\(JSON\.stringify\(hamSorular\)\)\)\.map\(s\s*=>\s*\{\s*s\.shuffledOptions\s*=\s*shuffle\(\[\.\.\.s\.secenekler\]\);\s*return\s*s;\s*\}\);\s*renderTest\(alan\);\s*\}/;

    const newTestSecBlock = `flagged = {};

        // ═══ GÜVENLİK KALKANI: OTURUM DAMGASI & GİZLİ KASA ═══
        const baslangicTs = Date.now();
        const ogrenciId = ogrenci ? (ogrenci.no || ogrenci.ad || "Anonim") : "Bilinmeyen";
        _aktifSinavOturumu = {
            testKodu: testKodu,
            ogrenciId: ogrenciId,
            baslangic: baslangicTs,
            soruSayisi: hamSorular.length,
            token: (typeof _sha256 === 'function' ? _sha256("TarihSinavKalkan_" + testKodu + "_" + baslangicTs + "_" + ogrenciId) : "TOK_" + baslangicTs)
        };

        _guvenliKasa[testKodu] = [];
        autoSaveData = { cevaplar: {}, flagged: {}, ihlal: 0, testKodu: testKodu, ogrenci: ogrenci, startTime: baslangicTs };

        if (isKlasik) {
            const arindirilmisKlasik = hamSorular.map((item, idx) => {
                _guvenliKasa[testKodu][idx] = { soru: item.soru, cevap: item.cevap };
                const kopya = Object.assign({}, item);
                delete kopya.cevap;
                return kopya;
            });
            renderKlasik(alan, arindirilmisKlasik);
        } else {
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
            renderTest(alan);
        }

        // Sınav süresince window.allTests içindeki cevapları maskele
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
        }`;

    if (oldTestSecBlock.test(content)) {
        content = content.replace(oldTestSecBlock, newTestSecBlock.split('\n').join(eol));
    } else {
        console.error('testSec block regex match failed in:', filePath);
    }

    // 4. Update Klasik explanation rendering in testiBitir
    const oldKlasikForEach = /sourceSorular\.forEach\(\(item,\s*index\)\s*=>\s*\{\s*const\s+cvp\s*=\s*autoSaveData\.cevaplar\[index\]\s*\|\|\s*["']["'];\s*raporMetni\s*\+=\s*["']S["']\s*\+\s*\(index\+1\)\s*\+\s*["']: ["']\s*\+\s*cvp\.replace\(\/\\n\/g,\s*["'] ["']\)\s*\+\s*["'] \|\| ["'];\s*detayHtml\s*\+=\s*["']<div class=['"]explanation-card['"]><div style=['"]font-weight:700; margin-bottom:10px; font-size:16px;['"]>Soru ["']\s*\+\s*\(index\+1\)\s*\+\s*["']: ["']\s*\+\s*item\.soru\s*\+\s*["']<\/div><div style=['"]margin-bottom:15px; padding: 10px; background: rgba\(230, 126, 34, 0\.1\); border-radius: 8px;['"]><span style=['"]color:#e67e22; font-weight:800; display:block; margin-bottom:5px;['"]>Sizin Cevabınız:<\/span>["']\s*\+\s*\(cvp\s*\|\|\s*["']<i>Boş bırakıldı<\/i>["']\)\s*\+\s*["']<\/div><div style=['"]background:rgba\(39, 174, 96, 0\.1\); padding:15px; border-radius:8px;['"]><span style=['"]color:#27ae60; font-weight:800; display:block; margin-bottom:5px;['"]>Beklenen Cevap:<\/span>["']\s*\+\s*item\.cevap\s*\+\s*["']<\/div><\/div>["'];\s*\}\);/;

    const newKlasikForEach = `sourceSorular.forEach((item, index) => {
                const cvp = autoSaveData.cevaplar[index] || "";
                const kasaVerisi = (_guvenliKasa[aktifTest] && _guvenliKasa[aktifTest][index]) 
                    ? _guvenliKasa[aktifTest][index] 
                    : { cevap: "" };
                raporMetni += "S" + (index+1) + ": " + cvp.replace(/\\n/g," ") + " || ";
                detayHtml += "<div class='explanation-card'><div style='font-weight:700; margin-bottom:10px; font-size:16px;'>Soru " + (index+1) + ": " + item.soru + "</div><div style='margin-bottom:15px; padding: 10px; background: rgba(230, 126, 34, 0.1); border-radius: 8px;'><span style='color:#e67e22; font-weight:800; display:block; margin-bottom:5px;'>Sizin Cevabınız:</span>" + (cvp || "<i>Boş bırakıldı</i>") + "</div><div style='background:rgba(39, 174, 96, 0.1); padding:15px; border-radius:8px;'><span style='color:#27ae60; font-weight:800; display:block; margin-bottom:5px;'>Beklenen Cevap:</span>" + (kasaVerisi.cevap || item._gizliCevap || item.cevap || "") + "</div></div>";
            });`;

    if (oldKlasikForEach.test(content)) {
        content = content.replace(oldKlasikForEach, newKlasikForEach.split('\n').join(eol));
    } else {
        console.error('Klasik forEach regex match failed in:', filePath);
    }

    // 5. Update Multiple Choice evaluation loop in testiBitir
    const oldMultipleChoiceLoop = /suankiSorular\.forEach\(\(soru,\s*index\)\s*=>\s*\{\s*const\s+secilen\s*=\s*autoSaveData\.cevaplar\[index\]\s*\|\|\s*["']BOŞ["'];\s*const\s+dogruMetin\s*=\s*cleanText\(soru\.cevap\);\s*const\s+isCorrect\s*=\s*\(secilen\s*===\s*dogruMetin\);/;

    const newMultipleChoiceLoop = `suankiSorular.forEach((soru, index) => {
                const secilen = autoSaveData.cevaplar[index] || "BOŞ";
                const kasaVerisi = (_guvenliKasa[aktifTest] && _guvenliKasa[aktifTest][index]) 
                    ? _guvenliKasa[aktifTest][index] 
                    : { cevap: "", aciklama: "" };
                const dogruMetin = cleanText(kasaVerisi.cevap || "");
                const isCorrect = (secilen === dogruMetin);`;

    if (oldMultipleChoiceLoop.test(content)) {
        content = content.replace(oldMultipleChoiceLoop, newMultipleChoiceLoop.split('\n').join(eol));
    } else {
        console.error('Multiple choice loop regex match failed in:', filePath);
    }

    // Also update the explanation and explanation-card wrong replacement inside the loop
    // Replace: soru.aciklama with kasaVerisi.aciklama
    // We can do this in the loop region
    content = content.replace(
        /detayHtml\s*\+=\s*["']<div class=['"]explanation-card correct['"]>.*?soru\.aciklama\s*\|\|\s*["']["']\).*?<\/div><\/div>["'];/,
        (match) => match.replace('soru.aciklama', 'kasaVerisi.aciklama')
    );
    content = content.replace(
        /detayHtml\s*\+=\s*["']<div class=['"]explanation-card wrong['"]>.*?soru\.aciklama\s*\|\|\s*["']["']\).*?<\/div><\/div>["'];/,
        (match) => match.replace('soru.aciklama', 'kasaVerisi.aciklama')
    );

    // 6. Add Security Token & Anti-Tamper check before sending data to SCRIPT_URL
    const oldDataSend = /const\s+data\s*=\s*\{\s*isim:\s*ogrenci\.ad,\s*sinif:\s*ogrenci\.sinif,\s*numara:\s*ogrenci\.no,\s*puan:\s*puan,\s*rapor:\s*["']\(Süre: ["']\s*\+\s*gecenSureStr\s*\+\s*["']\) ["']\s*\+\s*raporMetni\s*\};/;

    const newDataSend = `// ═══ GÜVENLİK DOĞRULAMA İMZASI & SÜRE DENETİMİ ═══
        if (_aktifSinavOturumu) {
            const minBeklenenSure = Math.max(10, (suankiSorular ? suankiSorular.length : 5) * 2);
            let guvenlikNotu = "";
            if (gecenSureSn < minBeklenenSure && (suankiSorular ? suankiSorular.length : 0) >= 5) {
                guvenlikNotu = " [ŞÜPHELİ HIZ]";
            }
            const imzaKodu = (typeof _sha256 === 'function' ? _sha256(_aktifSinavOturumu.token + ":" + puan + ":" + gecenSureSn).substring(0, 8).toUpperCase() : "OK");
            raporMetni += " [İmza: #" + imzaKodu + "]" + guvenlikNotu;
        }

        // Test tamamlandıktan sonra window.allTests maskesini kaldır
        if (window.allTests && window.allTests[aktifTest]) {
            window.allTests[aktifTest].forEach(item => {
                if (item._orijinalKorumada) {
                    item.cevap = item._gizliCevap;
                    item.aciklama = item._gizliAciklama;
                    delete item._gizliCevap;
                    delete item._gizliAciklama;
                    delete item._orijinalKorumada;
                }
            });
        }

        const data = { isim: ogrenci.ad, sinif: ogrenci.sinif, numara: ogrenci.no, puan: puan, rapor: "(Süre: " + gecenSureStr + ") " + raporMetni };`;

    if (oldDataSend.test(content)) {
        content = content.replace(oldDataSend, newDataSend.split('\n').join(eol));
    } else {
        console.error('Data send regex match failed in:', filePath);
    }

    // 7. In anasayfayaDon() and testtenCik(), remove mask from window.allTests if leaving
    const maskResetCode = `if (window.allTests && aktifTest && window.allTests[aktifTest]) {
            window.allTests[aktifTest].forEach(item => {
                if (item._orijinalKorumada) {
                    item.cevap = item._gizliCevap;
                    item.aciklama = item._gizliAciklama;
                    delete item._gizliCevap;
                    delete item._gizliAciklama;
                    delete item._orijinalKorumada;
                }
            });
        }`;

    // Update anasayfayaDon
    content = content.replace(
        /function\s+anasayfayaDon\(\)\s*\{/,
        `function anasayfayaDon() {${eol}        ${maskResetCode.split('\n').join(eol + '        ')}`
    );

    // Update testtenCik
    content = content.replace(
        /function\s+testtenCik\(\)\s*\{\s*if\(confirm\([^)]+\)\)\s*\{/,
        (match) => `${match}${eol}            ${maskResetCode.split('\n').join(eol + '            ')}`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', path.basename(filePath));
}
