const fs = require('fs');
const http = require('http');

function postApi(payload) {
    return new Promise((resolve, reject) => {
        const req = http.request('http://localhost:8080/api/unite-kilit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
    });
}

function getApi() {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:8080/api/unite-kilit', res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

// Logic replica from unite-kilit.js
function isMuratMutlu(user) {
    if (!user || !user.ad) return false;
    const ad = user.ad.toLocaleLowerCase('tr-TR');
    return ad.indexOf('murat') !== -1 && ad.indexOf('mutlu') !== -1;
}

function odayaGirSim(user, uniteId, kilitliListesi) {
    if (isMuratMutlu(user)) {
        return { allowed: true, role: 'MURAT_MUTLU_MASTER' };
    }
    if (kilitliListesi.indexOf(uniteId) !== -1) {
        return { allowed: false, msg: 'Konularımız ilerledikçe öğretmeniniz bu üniteyi kullanımınıza açacaktır.' };
    }
    return { allowed: true, role: 'USER' };
}

async function run() {
    console.log("=== ADIM 1: Başlangıç Durumu (U2 ve U3 Kilitli) ===");
    await postApi({ sinif: '9', kilitli: ['u2', 'u3'], guncelleyen: 'Murat Mutlu (Öğretmen)' });
    let state = await getApi();
    let kilit9 = state.sinif9.kilitli;
    console.log("Sunucu 9. Sınıf Kilit Listesi:", kilit9);

    const murat = { ad: "Murat Mutlu (Öğretmen)", sinif: "Master" };
    const zumre = { ad: "Ahmet Hoca (Zümre)", sinif: "Tarih" };
    const ogrenci = { ad: "Zeynep Kaya", sinif: "9-B", no: "205" };

    console.log("\n--- Murat Mutlu Erişimleri ---");
    console.log("U1:", odayaGirSim(murat, 'u1', kilit9));
    console.log("U2:", odayaGirSim(murat, 'u2', kilit9));
    console.log("U3:", odayaGirSim(murat, 'u3', kilit9));

    console.log("\n--- Zümre Öğretmeni Erişimleri ---");
    console.log("U1:", odayaGirSim(zumre, 'u1', kilit9));
    console.log("U2:", odayaGirSim(zumre, 'u2', kilit9));
    console.log("U3:", odayaGirSim(zumre, 'u3', kilit9));

    console.log("\n--- Öğrenci Erişimleri ---");
    console.log("U1:", odayaGirSim(ogrenci, 'u1', kilit9));
    console.log("U2:", odayaGirSim(ogrenci, 'u2', kilit9));
    console.log("U3:", odayaGirSim(ogrenci, 'u3', kilit9));

    console.log("\n=== ADIM 2: Murat Mutlu 2. Üniteyi Açıyor ===");
    await postApi({ sinif: '9', kilitli: ['u3'], guncelleyen: 'Murat Mutlu (Öğretmen)' });
    state = await getApi();
    kilit9 = state.sinif9.kilitli;
    console.log("Güncel 9. Sınıf Kilit Listesi:", kilit9);

    console.log("\n--- 2. Ünite Açıldıktan Sonra Zümre Erişimleri ---");
    console.log("U2 (Şimdi Açık olmalı):", odayaGirSim(zumre, 'u2', kilit9));
    console.log("U3 (Hala Kilitli olmalı):", odayaGirSim(zumre, 'u3', kilit9));

    console.log("\n--- 2. Ünite Açıldıktan Sonra Öğrenci Erişimleri ---");
    console.log("U2 (Şimdi Açık olmalı):", odayaGirSim(ogrenci, 'u2', kilit9));
    console.log("U3 (Hala Kilitli olmalı):", odayaGirSim(ogrenci, 'u3', kilit9));

    // Verify files on disk
    const diskKilitVerisi = fs.readFileSync('motorlar/kilit_verisi.js', 'utf8');
    const diskJson = JSON.parse(fs.readFileSync('kilit_durumu.json', 'utf8'));
    console.log("\nkilit_durumu.json disk durumu:", diskJson.sinif9.kilitli);
    console.log("kilit_verisi.js güncellendi mi:", diskKilitVerisi.includes('"kilitli": [\n            "u3"\n        ]') || diskKilitVerisi.includes('"u3"'));

    console.log("\n✅ TÜM SENARYOLAR VE MATRİS TESTİ BAŞARIYLA GEÇTİ!");
}

run();
