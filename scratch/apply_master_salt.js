const fs = require('fs');
const path = require('path');

const SHA256_FUNCTION = `    // Güvenli Master Şifre Doğrulama (Tuzlanmış SHA-256)
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
        ascii += '\\x80';
        while (ascii[l] % 64 - 56) ascii += '\\x00';
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

`;

const SECURE_LOGIN_BLOCK = `        if (ad.toLocaleLowerCase('tr-TR') === "murat mutlu") {
            const _SALT = "BogaziciTarih_2026_MuratMutlu_#Key!";
            const _HASH = "c2003bf55bd2f06c61066252eb2857111e32b5ba678d70d17316b290871103d6";
            if (_sha256(_SALT + girilenSifre) === _HASH) {
                ogrenci = { ad: "Murat Mutlu (Öğretmen)", sinif: sinif || "Master", no: numara || "Öğretmen" };
                girisBasariliIslemleri(ogrenci);
            } else { alert("Master şifresi hatalı!"); }
            return;
        }`;

const OLD_LOGIN_REGEX = /if\s*\(\s*ad\.toLocaleLowerCase\('tr-TR'\)\s*===\s*["']murat mutlu["']\s*\)\s*\{\s*if\s*\(\s*girilenSifre\s*===\s*["']1310["']\s*\)\s*\{\s*ogrenci\s*=\s*\{\s*ad:\s*["']Murat Mutlu\s*\(Öğretmen\)["'],\s*sinif:\s*sinif\s*\|\|\s*["']Master["'],\s*no:\s*numara\s*\|\|\s*["']1310["']\s*\};\s*girisBasariliIslemleri\(ogrenci\);\s*\}\s*else\s*\{\s*alert\(["']Master şifresi hatalı!["']\);\s*\}\s*return;\s*\}/;

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

    if (!OLD_LOGIN_REGEX.test(content)) {
        console.error('Regex match failed for:', filePath);
        continue;
    }

    // Replace login block
    content = content.replace(OLD_LOGIN_REGEX, SECURE_LOGIN_BLOCK.split('\n').join(eol));

    // Inject _sha256 if not already present
    if (!content.includes('function _sha256(')) {
        const girisIdx = content.indexOf('function girisYap()');
        if (girisIdx !== -1) {
            content = content.slice(0, girisIdx) + SHA256_FUNCTION.split('\n').join(eol) + content.slice(girisIdx);
        } else {
            console.error('Could not find function girisYap() in:', filePath);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated:', path.basename(filePath));
}

// Update unite-kilit.js comment mentioning 1310
const uniteKilitPath = 'c:/Users/belok/Desktop/tarih-portal/motorlar/unite-kilit.js';
if (fs.existsSync(uniteKilitPath)) {
    let ukContent = fs.readFileSync(uniteKilitPath, 'utf8');
    if (ukContent.includes('(1310)')) {
        ukContent = ukContent.replace('(1310)', '(master şifre)');
        fs.writeFileSync(uniteKilitPath, ukContent, 'utf8');
        console.log('Successfully cleaned comment in unite-kilit.js');
    }
}

// Update tema3_kervan.html
const kervanPath = 'c:/Users/belok/Desktop/tarih-portal/tema3_kervan.html';
if (fs.existsSync(kervanPath)) {
    let kContent = fs.readFileSync(kervanPath, 'utf8');
    if (kContent.includes("u==='murat'&&p==='1310'")) {
        // Embed _sha256 function before doLogin if not present
        if (!kContent.includes('function _sha256(')) {
            const doLoginIdx = kContent.indexOf('function doLogin()');
            if (doLoginIdx !== -1) {
                kContent = kContent.slice(0, doLoginIdx) + SHA256_FUNCTION + kContent.slice(doLoginIdx);
            }
        }
        const kervanOld = "if(u==='murat'&&p==='1310'){";
        const kervanNew = `const _SALT = "BogaziciTarih_2026_MuratMutlu_#Key!";
  const _HASH = "c2003bf55bd2f06c61066252eb2857111e32b5ba678d70d17316b290871103d6";
  if(u==='murat'&&_sha256(_SALT+p)===_HASH){`;
        kContent = kContent.replace(kervanOld, kervanNew);
        fs.writeFileSync(kervanPath, kContent, 'utf8');
        console.log('Successfully updated tema3_kervan.html');
    }
}

// Update sinif11 - Orijinal.html
const sinif11OrigPath = 'c:/Users/belok/Desktop/tarih-portal/sinif11 - Orijinal.html';
if (fs.existsSync(sinif11OrigPath)) {
    let content = fs.readFileSync(sinif11OrigPath, 'utf8');
    const isCRLF = content.includes('\r\n');
    const eol = isCRLF ? '\r\n' : '\n';

    if (OLD_LOGIN_REGEX.test(content)) {
        content = content.replace(OLD_LOGIN_REGEX, SECURE_LOGIN_BLOCK.split('\n').join(eol));
        if (!content.includes('function _sha256(')) {
            const girisIdx = content.indexOf('function girisYap()');
            if (girisIdx !== -1) {
                content = content.slice(0, girisIdx) + SHA256_FUNCTION.split('\n').join(eol) + content.slice(girisIdx);
            }
        }
        fs.writeFileSync(sinif11OrigPath, content, 'utf8');
        console.log('Successfully updated sinif11 - Orijinal.html');
    }
}
