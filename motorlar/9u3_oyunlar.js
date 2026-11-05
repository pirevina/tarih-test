// ==========================================
// 9. SINIF 3. ÜNİTE OYUNLARI (ORTA ÇAĞ'DA DÜNYA)
// ==========================================

function u3OyunModallariniYukle() {
    if(document.getElementById('u3ModallarKonteyner')) return;
    
    let container = document.createElement('div');
    container.id = 'u3ModallarKonteyner';
    container.innerHTML = `
        <!-- 1. Kale Savunması -->
        <div id="kaleSavunmasiModal" class="hidden oyun-tam-ekran" style="background: #2c3e50;">
            <div class="oyun-ust-bar" style="background: #1a252f;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('kaleSavunmasiModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Kale Savunması</div>
                <div style="font-weight: bold;">Skor: <span id="ksSkor">0</span> | Kale Canı: <span id="ksCan">100</span></div>
            </div>
            <div id="ksOyunAlani" style="flex:1; position: relative; overflow: hidden; background: #34495e; touch-action: none;">
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; background: url('https://www.transparenttextures.com/patterns/brick-wall.png') #7f8c8d; border-top: 5px solid #bdc3c7; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; color: white;">KALENİZ</div>
            </div>
        </div>

        <!-- 2. İpek Yolu Tüccarı -->
        <div id="ipekYoluModal" class="hidden oyun-tam-ekran" style="background: #f39c12;">
            <div class="oyun-ust-bar" style="background: #d68910;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('ipekYoluModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">İpek Yolu Tüccarı</div>
                <div style="font-weight: bold;">Altın: <span id="iyAltin">100</span> | İpek: <span id="iyIpek">0</span></div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 20px; align-items:center; background: #fdf2e9; overflow-y: auto;">
                <div id="iySehir" style="font-size: 28px; font-weight: bold; color: #d35400; margin-bottom: 10px;">Çin (Xi'an)</div>
                <div id="iyOlay" style="font-size: 16px; color: #7f8c8d; text-align: center; margin-bottom: 30px; font-style: italic;">Yolculuk yeni başlıyor...</div>
                
                <div style="display: flex; gap: 20px; width: 100%; max-width: 400px; margin-bottom: 20px;">
                    <button onclick="iyIpekAl()" style="flex:1; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer;">İpek AL (-<span id="iyFiyatAl">20</span> Altın)</button>
                    <button onclick="iyIpekSat()" style="flex:1; padding: 15px; background: #2980b9; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer;">İpek SAT (+<span id="iyFiyatSat">25</span> Altın)</button>
                </div>
                <button onclick="iyYolaCik()" style="width: 100%; max-width: 400px; padding: 15px; background: #8e44ad; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 18px; cursor: pointer;"><i class="fa-solid fa-camel"></i> Sonraki Şehre Git</button>
            </div>
        </div>

        <!-- 3. Veba Doktoru -->
        <div id="vebaDoktoruModal" class="hidden oyun-tam-ekran" style="background: #111;">
            <div class="oyun-ust-bar" style="background: #000;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('vebaDoktoruModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Veba Doktoru</div>
                <div style="font-weight: bold;">Nüfus: <span id="vdNufus">100</span> | Ekonomi: <span id="vdEkonomi">100</span></div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 20px; align-items:center; justify-content:center; background: #222; overflow-y: auto;">
                <i class="fa-solid fa-mask" style="font-size: 60px; color: #fff; margin-bottom: 20px;"></i>
                <div id="vdDurum" style="font-size: 22px; color: #eee; text-align: center; margin-bottom: 30px; max-width: 500px; font-weight: bold; line-height: 1.5;">Avrupa'ya veba salgını yayıldı. Limanları ticarete kapatalım mı?</div>
                <div style="display: flex; gap: 20px; width: 100%; max-width: 400px;">
                    <button onclick="vdKarar(1)" id="vdBtnEvet" style="flex:1; padding: 15px; font-size: 16px; font-weight: bold; background: #27ae60; color: white; border: none; border-radius: 10px; cursor: pointer;">Evet (Nüfus Artar, Ekonomi Düşer)</button>
                    <button onclick="vdKarar(0)" id="vdBtnHayir" style="flex:1; padding: 15px; font-size: 16px; font-weight: bold; background: #c0392b; color: white; border: none; border-radius: 10px; cursor: pointer;">Hayır (Ekonomi Artar, Nüfus Düşer)</button>
                </div>
            </div>
        </div>

    `;
    document.body.appendChild(container);
}


// ----------------------------------------------------
// 1. KALE SAVUNMASI (Tıklama)
// ----------------------------------------------------
let ksSkor = 0; let ksCan = 100; let ksOyunBitti = false; let ksUretimInterval; let ksDusmeInterval;
function baslatKaleSavunmasi() {
    u3OyunModallariniYukle();
    ksSkor = 0; ksCan = 100; ksOyunBitti = false;
    document.getElementById('ksSkor').innerText = ksSkor; document.getElementById('ksCan').innerText = ksCan;
    
    document.querySelectorAll('.ks-dusman').forEach(n => n.remove());
    document.getElementById('kaleSavunmasiModal').classList.remove('hidden');

    clearInterval(ksUretimInterval); clearInterval(ksDusmeInterval);
    ksUretimInterval = setInterval(ksDusmanUret, 800);
    ksDusmeInterval = setInterval(ksDusmanDusur, 50);
}
function ksDusmanUret() {
    if(ksOyunBitti) return;
    let alan = document.getElementById('ksOyunAlani');
    let dusman = document.createElement('div');
    dusman.classList.add('ks-dusman');
    
    dusman.innerHTML = Math.random() > 0.5 ? '🛡️' : '🔥'; // Kalkan (Barbar) veya Ateş (Mancınık)
    dusman.style.position = 'absolute';
    dusman.style.top = '-50px';
    dusman.style.left = Math.floor(Math.random() * 80) + 10 + "%";
    dusman.style.fontSize = '40px';
    dusman.style.cursor = 'crosshair';
    
    // Tıklayarak vurma
    dusman.onmousedown = (e) => { e.stopPropagation(); if(!ksOyunBitti) ksDusmanVur(dusman); };
    dusman.ontouchstart = (e) => { e.preventDefault(); e.stopPropagation(); if(!ksOyunBitti) ksDusmanVur(dusman); };
    
    alan.appendChild(dusman);
}
function ksDusmanVur(el) {
    ksSkor += 10; document.getElementById('ksSkor').innerText = ksSkor;
    el.innerHTML = '💥';
    setTimeout(() => el.remove(), 150);
}
function ksDusmanDusur() {
    if(ksOyunBitti) return;
    let dusmanlar = document.querySelectorAll('.ks-dusman');
    let kaleTop = window.innerHeight - 80; 
    
    dusmanlar.forEach(d => {
        if(d.innerHTML === '💥') return;
        let top = parseFloat(d.style.top) || -50;
        top += 4; 
        d.style.top = top + 'px';
        
        let dRect = d.getBoundingClientRect();
        if (dRect.bottom >= kaleTop) {
            ksCan -= 10; document.getElementById('ksCan').innerText = ksCan;
            d.innerHTML = '💥';
            setTimeout(() => d.remove(), 100);
            
            if(ksCan <= 0) {
                ksOyunBitti = true;
                clearInterval(ksUretimInterval); clearInterval(ksDusmeInterval);
                alert("Kale Düştü! Skorunuz: " + ksSkor);
                oyunKapat('kaleSavunmasiModal');
            }
        }
    });
}

// ----------------------------------------------------
// 2. İPEK YOLU TÜCCARI
// ----------------------------------------------------
const iySehirler = ["Çin (Xi'an)", "Semerkant", "Buhara", "Tebriz", "İstanbul"];
let iyIndex = 0; let iyAltin = 100; let iyIpek = 0; let iyFiyat = 20;
function baslatIpekYolu() {
    u3OyunModallariniYukle();
    iyIndex = 0; iyAltin = 100; iyIpek = 0;
    document.getElementById('ipekYoluModal').classList.remove('hidden');
    iySehirGuncelle();
}
function iySehirGuncelle() {
    if(iyIndex >= iySehirler.length) {
        alert("İstanbul'a vardınız! Oyun Bitti. Toplam Altın: " + iyAltin);
        oyunKapat('ipekYoluModal'); return;
    }
    document.getElementById('iySehir').innerText = iySehirler[iyIndex];
    
    document.getElementById('iyAltin').innerText = iyAltin;
    document.getElementById('iyIpek').innerText = iyIpek;
    
    // Fiyat şehre göre artar (Batıya gittikçe değerlenir)
    iyFiyat = 20 + (iyIndex * 15) + Math.floor(Math.random() * 10); 
    document.getElementById('iyFiyatAl').innerText = iyFiyat;
    document.getElementById('iyFiyatSat').innerText = iyFiyat + 5; // Satış hep biraz daha karlı
    
    let olaylar = ["Pazar çok canlı.", "Hava çok sıcak, ticaret yavaş.", "Eşkıyalar yolları kesmiş fiyatlar yüksek.", "Bolluk var fiyatlar dengeli."];
    document.getElementById('iyOlay').innerText = olaylar[Math.floor(Math.random() * olaylar.length)];
}
function iyIpekAl() {
    if(iyAltin >= iyFiyat) { iyAltin -= iyFiyat; iyIpek++; iySehirGuncelle(); }
    else alert("Yeterli altınınız yok!");
}
function iyIpekSat() {
    if(iyIpek > 0) { iyAltin += (iyFiyat + 5); iyIpek--; iySehirGuncelle(); }
    else alert("Satacak ipeğiniz yok!");
}
function iyYolaCik() {
    // Yolda olay
    let sans = Math.random();
    if(sans < 0.2) { alert("Yolda kervana eşkıya saldırdı! 1 İpek kaybettin."); if(iyIpek>0) iyIpek--; }
    else if(sans < 0.4) { alert("Vahada su buldunuz, yolculuk hızlandı."); }
    iyIndex++;
    iySehirGuncelle();
}


// ----------------------------------------------------
// 3. VEBA DOKTORU
// ----------------------------------------------------
const vdSorular = [
    { s: "Veba şehre ulaştı. Limanları ve ticareti kapatalım mı?", eN: 10, eE: -20, hN: -30, hE: 20 },
    { s: "Halk panik içinde! Kiliselere sığınıyorlar. Toplanmalarını yasaklayalım mı?", eN: 20, eE: -10, hN: -40, hE: 5 },
    { s: "Vebalı hastaları şehirden sürelim mi?", eN: 15, eE: -5, hN: -20, hE: 0 },
    { s: "Doğudan gelen baharat kervanını şehre alalım mı? İlaç olabilir.", eN: -15, eE: 30, hN: 10, hE: -10 },
    { s: "Doktorlara maske ve kıyafet için hazineden ödenek ayıralım mı?", eN: 25, eE: -25, hN: -25, hE: 10 }
];
let vdIndex = 0; let vdNufus = 100; let vdEkonomi = 100;
function baslatVebaDoktoru() {
    u3OyunModallariniYukle();
    vdIndex = 0; vdNufus = 100; vdEkonomi = 100;
    document.getElementById('vebaDoktoruModal').classList.remove('hidden');
    vdGuncelle();
}
function vdGuncelle() {
    document.getElementById('vdNufus').innerText = vdNufus; document.getElementById('vdEkonomi').innerText = vdEkonomi;
    if(vdNufus <= 0) { alert("Herkes öldü! Krallık yıkıldı."); oyunKapat('vebaDoktoruModal'); return; }
    if(vdEkonomi <= 0) { alert("Hazine iflas etti! İsyan çıktı."); oyunKapat('vebaDoktoruModal'); return; }
    if(vdIndex >= vdSorular.length) { alert("Salgını atlattınız! Krallık kurtuldu."); oyunKapat('vebaDoktoruModal'); return; }
    
    document.getElementById('vdDurum').innerText = vdSorular[vdIndex].s;
}
function vdKarar(tip) {
    let soru = vdSorular[vdIndex];
    if(tip === 1) { vdNufus += soru.eN; vdEkonomi += soru.eE; }
    else { vdNufus += soru.hN; vdEkonomi += soru.hE; }
    vdIndex++; vdGuncelle();
}

// ----------------------------------------------------

// 3. Ünite Animasyon Durdurucu (ESC)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        let kModal = document.getElementById('kaleSavunmasiModal');
        if(kModal && !kModal.classList.contains('hidden')) {
            ksOyunBitti = true;
            clearInterval(ksUretimInterval);
            clearInterval(ksDusmeInterval);
        }
    }
});
