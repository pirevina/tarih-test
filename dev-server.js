const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const HOST = '0.0.0.0';
const BASE_DIR = __dirname;
const KILIT_FILE = path.join(BASE_DIR, 'kilit_durumu.json');

// Dinamik IPv4 tespiti (Wi-Fi / Ethernet öncelikli)
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // 192.168.x.x veya 10.x.x.x öncelikli
                if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                    return iface.address;
                }
            }
        }
    }
    // Fallback: ilk dahili olmayan IPv4
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

function readKilitDurumu() {
    try {
        if (fs.existsSync(KILIT_FILE)) {
            return JSON.parse(fs.readFileSync(KILIT_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Kilit dosyası okuma hatası:", e);
    }
    return {
        sinif9: { kilitli: ["u3"], sonGuncelleme: new Date().toISOString() },
        sinif10: { kilitli: ["u3"], sonGuncelleme: new Date().toISOString() }
    };
}

function writeKilitDurumu(data) {
    try {
        fs.writeFileSync(KILIT_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Kilit dosyası yazma hatası:", e);
        return false;
    }
}

const server = http.createServer((req, res) => {
    // CORS ön uçuş (preflight) desteği
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        });
        return res.end();
    }

    let parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    // API: ÜNİTE KİLİT GET & POST UÇ NOKTASI
    if (parsedUrl.pathname === '/api/unite-kilit') {
        if (req.method === 'GET') {
            const data = readKilitDurumu();
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });
            return res.end(JSON.stringify(data));
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body);
                    const current = readKilitDurumu();
                    const sinifNo = payload.sinif || '9';
                    const key = 'sinif' + sinifNo;
                    const kilitliArr = Array.isArray(payload.kilitli) ? payload.kilitli : [];

                    current[key] = {
                        kilitli: kilitliArr,
                        sonGuncelleme: new Date().toISOString(),
                        guncelleyen: payload.guncelleyen || 'Murat Mutlu (Öğretmen)'
                    };

                    writeKilitDurumu(current);

                    // kilit_verisi.js ve unite-kilit.js dosyalarını da kalıcı senkronize et
                    try {
                        const kilitVerisiPath = path.join(BASE_DIR, 'motorlar', 'kilit_verisi.js');
                        const jsCode = '/* ═══════════════════════════════════════════════════════════════\n' +
                                       '   TARİH PORTALI — MERKEZİ ÜNİTE KİLİT VERİSİ\n' +
                                       '   - Kilitli üniteler SADECE Murat Mutlu kullanıcısına açıktır\n' +
                                       '   - Öğrencilere ve Zümrelere kapalıdır\n' +
                                       '═══════════════════════════════════════════════════════════════ */\n' +
                                       'window.PORTAL_KILIT_VERISI = ' + JSON.stringify(current, null, 4) + ';\n';
                        fs.writeFileSync(kilitVerisiPath, jsCode, 'utf8');

                        const kilitJsPath = path.join(BASE_DIR, 'motorlar', 'unite-kilit.js');
                        if (fs.existsSync(kilitJsPath)) {
                            let jsContent = fs.readFileSync(kilitJsPath, 'utf8');
                            jsContent = jsContent.replace(/var\s+VARSAYILAN_KILITLI\s*=\s*\[[^\]]*\];/, `var VARSAYILAN_KILITLI = ${JSON.stringify(kilitliArr)};`);
                            fs.writeFileSync(kilitJsPath, jsContent, 'utf8');
                        }
                    } catch (err) {
                        console.error("Dosya senkronizasyon hatası:", err);
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: true, guncel: current[key] }));
                    console.log(`[KİLİT GÜNCELLENDİ] Sınıf: ${sinifNo}, Kilitli: [${kilitliArr.join(', ')}]`);
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
    }

    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(BASE_DIR, reqPath);

    // Dizin dışına çıkış engelleme
    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('403 Yasak Erişim');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`404 Bulunamadı: ${reqPath}`);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        };

        res.writeHead(200, headers);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

const activeIp = getLocalIp();

server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`>>> TARİH PORTALI GELİŞMİŞ TEST SUNUCUSU ÇALIŞIYOR <<<`);
    console.log(`Port: ${PORT}`);
    console.log(`Masaüstü Yerel URL  : http://localhost:${PORT}`);
    console.log(`Mobil / Wi-Fi URL   : http://${activeIp}:${PORT}`);
    console.log(`Mobil Test Paneli   : http://${activeIp}:${PORT}/mobil_kontrol.html`);
    console.log(`======================================================\n`);
});
