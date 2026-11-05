// ==========================================
// 9. SINIF 1. ÜNİTE OYUNLARI (TARİH VE ZAMAN)
// ==========================================

function u1OyunModallariniYukle() {
    if(document.getElementById('u1ModallarKonteyner')) return;
    
    let container = document.createElement('div');
    container.id = 'u1ModallarKonteyner';
    container.innerHTML = `
        <!-- 1. Zaman Makinesi (Kronoloji) -->
        <div id="zamanMakinesiModal" class="hidden oyun-tam-ekran" style="background: #2980b9;">
            <div class="oyun-ust-bar" style="background: #2471a3;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('zamanMakinesiModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Zaman Makinesi</div>
                <button style="background: #f1c40f; color:#333; border:none; padding: 5px 15px; font-weight:bold; border-radius: 5px; cursor:pointer;" onclick="zmKontrolEt()">Kontrol Et</button>
            </div>
            <div style="flex:1; padding: 20px; display:flex; flex-direction:column; align-items:center; overflow-y: auto;">
                <p style="color: white; font-size: 16px; text-align: center; margin-bottom: 20px;">Tarihi olayları Eskiden (Üstte) -> Yeniye (Altta) doğru sürükleyerek sıralayın.</p>
                <div id="zmListe" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 400px; padding-bottom: 30px;"></div>
            </div>
        </div>

        <!-- 2. Yüzyıl Hesaplayıcı (Hız Oyunu) -->
        <div id="yuzyilHesaplayiciModal" class="hidden oyun-tam-ekran" style="background: #c0392b;">
            <div class="oyun-ust-bar" style="background: #a93226;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('yuzyilHesaplayiciModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Yüzyıl Hesaplayıcı</div>
                <div style="font-weight: bold;">Skor: <span id="yhSkor">0</span> | Süre: <span id="yhSure">30</span>s</div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 20px; align-items:center; justify-content:center; background: #ecf0f1;">
                <div id="yhYil" style="font-size: 80px; font-weight: bold; color: #c0392b; margin-bottom: 30px; text-shadow: 2px 2px 5px rgba(0,0,0,0.2);">1453</div>
                <div style="font-size: 18px; color: #333; margin-bottom: 20px; text-align: center; font-weight: bold;">Bu yıl kaçıncı yüzyıla aittir?</div>
                <div id="yhSecenekler" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; max-width: 400px;"></div>
            </div>
        </div>

        <!-- 3. Tarihçinin Büyüteci (Hafıza) -->
        <div id="tarihciBuyuteciModal" class="hidden oyun-tam-ekran" style="background: #8e44ad;">
            <div class="oyun-ust-bar" style="background: #7d3c98;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('tarihciBuyuteciModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Tarihçinin Büyüteci</div>
                <div style="font-weight: bold;">Hamle: <span id="tbHamle">0</span></div>
            </div>
            <div style="flex:1; display:flex; justify-content:center; align-items:center; padding: 20px; overflow-y: auto;">
                <div id="tbGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 500px; width: 100%;"></div>
            </div>
        </div>

        <!-- 4. Kaynak Avcısı (Sürükle Bırak) -->
        <div id="kaynakAvcisiModal" class="hidden oyun-tam-ekran" style="background: #f39c12;">
            <div class="oyun-ust-bar" style="background: #d68910;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('kaynakAvcisiModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Kaynak Avcısı</div>
                <div style="font-weight: bold;">Skor: <span id="kaSkor">0</span> / 10</div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 10px; background: #fdf5e6; overflow: hidden;">
                <div id="kaKaynakMetni" style="font-size: 24px; font-weight: bold; color: white; background: #e67e22; padding: 20px; border-radius: 15px; text-align: center; margin: 20px auto; max-width: 90%; cursor: grab; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" draggable="true">Fatih'in Kılıcı</div>
                
                <div style="display: flex; gap: 10px; width: 100%; height: 100%; margin-top: auto; padding-bottom: 20px;">
                    <div id="kaSepet1" style="flex:1; background: rgba(46, 204, 113, 0.2); border: 4px dashed #2ecc71; border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #27ae60; cursor:pointer;">
                        <i class="fa-solid fa-1" style="font-size: 40px; margin-bottom: 10px;"></i>
                        1. Elden Kaynak
                    </div>
                    <div id="kaSepet2" style="flex:1; background: rgba(52, 152, 219, 0.2); border: 4px dashed #3498db; border-radius: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #2980b9; cursor:pointer;">
                        <i class="fa-solid fa-2" style="font-size: 40px; margin-bottom: 10px;"></i>
                        2. Elden Kaynak
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);
}

// Genel Fonksiyon
function oyunKapat(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ----------------------------------------------------
// 1. ZAMAN MAKİNESİ (Kronoloji)
// ----------------------------------------------------
let zmSirasi = ["Yazının İcadı (MÖ 3200)", "Kavimler Göçü (375)", "İstanbul'un Fethi (1453)", "Fransız İhtilali (1789)", "Cumhuriyetin İlanı (1923)"];
let zmDragged = null;
function baslatZamanMakinesi() {
    u1OyunModallariniYukle(); 
    let karma = [...zmSirasi].sort(() => Math.random() - 0.5);
    let liste = document.getElementById('zmListe'); liste.innerHTML = '';
    karma.forEach((item, index) => {
        let div = document.createElement('div'); div.innerText = item; div.draggable = true;
        div.style.background = 'white'; div.style.color = '#2980b9'; div.style.padding = '15px'; div.style.borderRadius = '10px'; div.style.fontWeight = 'bold'; div.style.cursor = 'grab'; div.style.textAlign = 'center'; div.style.fontSize = '16px'; div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        div.addEventListener('dragstart', (e) => { zmDragged = div; setTimeout(()=>div.style.opacity='0.5', 0); });
        div.addEventListener('dragend', () => { div.style.opacity='1'; zmDragged=null; });
        div.addEventListener('dragover', (e) => { e.preventDefault(); });
        div.addEventListener('drop', function(e) {
            e.preventDefault(); if(this !== zmDragged) {
                let all = Array.from(liste.children);
                let aIdx = all.indexOf(zmDragged); let bIdx = all.indexOf(this);
                if(aIdx < bIdx) this.after(zmDragged); else this.before(zmDragged);
            }
        });
        
        // Mobil dokunmatik için basit yukarı/aşağı butonları ekleyelim (Sürükle bırak mobilde zor olabilir)
        let btnUst = document.createElement('button'); btnUst.innerHTML = '▲'; btnUst.style.cssText = 'border:none; background:transparent; font-size:20px; color:#2980b9; margin-right:10px; cursor:pointer;';
        let btnAlt = document.createElement('button'); btnAlt.innerHTML = '▼'; btnAlt.style.cssText = 'border:none; background:transparent; font-size:20px; color:#2980b9; margin-left:10px; cursor:pointer;';
        
        btnUst.onclick = (e) => { e.stopPropagation(); if(div.previousElementSibling) div.parentNode.insertBefore(div, div.previousElementSibling); };
        btnAlt.onclick = (e) => { e.stopPropagation(); if(div.nextElementSibling) div.parentNode.insertBefore(div, div.nextElementSibling.nextSibling); };
        
        let container = document.createElement('div');
        container.style.display = 'flex'; container.style.alignItems = 'center'; container.style.justifyContent = 'space-between';
        
        container.appendChild(btnUst);
        let textNode = document.createElement('span'); textNode.innerText = item; textNode.style.flex = "1";
        container.appendChild(textNode);
        container.appendChild(btnAlt);
        
        div.innerHTML = '';
        div.appendChild(container);
        
        liste.appendChild(div);
    });
    document.getElementById('zamanMakinesiModal').classList.remove('hidden');
}
function zmKontrolEt() {
    let currentOrder = Array.from(document.getElementById('zmListe').children).map(c => c.querySelector('span').innerText);
    let dogruMu = true;
    for(let i=0; i<zmSirasi.length; i++) { if(zmSirasi[i] !== currentOrder[i]) dogruMu = false; }
    if(dogruMu) { alert("Tebrikler! Tarihi doğru sıraya dizdiniz."); oyunKapat('zamanMakinesiModal'); }
    else alert("Sıralamada hatalar var, tekrar dene!");
}


// ----------------------------------------------------
// 2. YÜZYIL HESAPLAYICI
// ----------------------------------------------------
let yhSkor = 0; let yhKalanSure = 30; let yhInterval; let yhDogruCevap = "";
function baslatYuzyilHesaplayici() {
    u1OyunModallariniYukle(); yhSkor = 0; yhKalanSure = 30;
    document.getElementById('yhSkor').innerText = yhSkor; document.getElementById('yhSure').innerText = yhKalanSure;
    document.getElementById('yuzyilHesaplayiciModal').classList.remove('hidden');
    clearInterval(yhInterval);
    yhInterval = setInterval(() => {
        yhKalanSure--; document.getElementById('yhSure').innerText = yhKalanSure;
        if(yhKalanSure <= 0) { clearInterval(yhInterval); alert("Süre Doldu! Skor: " + yhSkor); oyunKapat('yuzyilHesaplayiciModal'); }
    }, 1000);
    yhSoruUret();
}
function yhSoruUret() {
    let yil = Math.floor(Math.random() * 2000) + 1; // 1-2000 arası
    document.getElementById('yhYil').innerText = yil;
    
    let yuzyil = Math.floor(yil / 100) + 1;
    if(yil % 100 === 0) yuzyil -= 1;
    yhDogruCevap = yuzyil + ". Yüzyıl";
    
    let secenekler = [yhDogruCevap, (yuzyil-1)+". Yüzyıl", (yuzyil+1)+". Yüzyıl", (yuzyil+2)+". Yüzyıl"];
    secenekler = [...new Set(secenekler)].sort(() => Math.random() - 0.5);
    
    let secAlan = document.getElementById('yhSecenekler'); secAlan.innerHTML = '';
    secenekler.forEach(s => {
        let btn = document.createElement('button'); btn.innerText = s;
        btn.style.cssText = 'padding: 20px; font-size: 18px; font-weight: bold; background: white; color: #c0392b; border: 3px solid #c0392b; border-radius: 10px; cursor: pointer;';
        btn.onclick = () => {
            if(s === yhDogruCevap) { yhSkor += 10; document.getElementById('yhSkor').innerText = yhSkor; btn.style.background = '#2ecc71'; btn.style.color = 'white'; setTimeout(yhSoruUret, 200); }
            else { btn.style.background = '#e74c3c'; btn.style.color = 'white'; yhKalanSure -= 3; if(yhKalanSure<0)yhKalanSure=0; }
        };
        secAlan.appendChild(btn);
    });
}


// ----------------------------------------------------
// 3. TARİHÇİNİN BÜYÜTECİ
// ----------------------------------------------------
const tbKartlar = [
    {id:1, text:"Numizmatik"}, {id:1, text:"Para Bilimi"},
    {id:2, text:"Paleografya"}, {id:2, text:"Eski Yazı"},
    {id:3, text:"Arkeoloji"}, {id:3, text:"Kazı Bilimi"},
    {id:4, text:"Epigrafi"}, {id:4, text:"Kitabe Bilimi"},
    {id:5, text:"Kronoloji"}, {id:5, text:"Zaman Bilimi"},
    {id:6, text:"Filoloji"}, {id:6, text:"Dil Bilimi"}
];
let tbAcik = []; let tbEslenen = 0; let tbHamle = 0;
function baslatTarihciBuyuteci() {
    u1OyunModallariniYukle(); tbAcik = []; tbEslenen = 0; tbHamle = 0;
    document.getElementById('tbHamle').innerText = tbHamle;
    let grid = document.getElementById('tbGrid'); grid.innerHTML = '';
    let karma = [...tbKartlar].sort(() => Math.random() - 0.5);
    karma.forEach(kart => {
        let div = document.createElement('div');
        div.style.cssText = 'background: #fff; height: 90px; display: flex; align-items: center; justify-content: center; color: transparent; font-size: 14px; font-weight: bold; border-radius: 10px; cursor: pointer; text-align: center; padding: 5px; box-shadow: inset 0 0 10px rgba(142, 68, 173, 0.5); transition: 0.3s;';
        div.dataset.id = kart.id; div.innerText = kart.text;
        div.onclick = () => tbKartSec(div);
        grid.appendChild(div);
    });
    document.getElementById('tarihciBuyuteciModal').classList.remove('hidden');
}
function tbKartSec(div) {
    if(tbAcik.length >= 2 || div.style.color === 'black') return;
    div.style.color = 'black'; div.style.background = '#f1c40f'; tbAcik.push(div);
    if(tbAcik.length === 2) {
        tbHamle++; document.getElementById('tbHamle').innerText = tbHamle;
        if(tbAcik[0].dataset.id === tbAcik[1].dataset.id) {
            setTimeout(() => { tbAcik[0].style.background = '#2ecc71'; tbAcik[1].style.background = '#2ecc71'; tbAcik = []; tbEslenen++; if(tbEslenen === 6) { alert(`Tebrikler! ${tbHamle} hamlede bitirdiniz.`); oyunKapat('tarihciBuyuteciModal'); } }, 500);
        } else {
            setTimeout(() => { tbAcik[0].style.color = 'transparent'; tbAcik[0].style.background = '#fff'; tbAcik[1].style.color = 'transparent'; tbAcik[1].style.background = '#fff'; tbAcik = []; }, 800);
        }
    }
}


// ----------------------------------------------------
// 4. KAYNAK AVCISI
// ----------------------------------------------------
const kaSorular = [
    { text: "Fatih'in Kılıcı", tip: 1 },
    { text: "Tarih Ders Kitabı", tip: 2 },
    { text: "Orhun Abideleri", tip: 1 },
    { text: "Halil İnalcık'ın Eseri", tip: 2 },
    { text: "Kadeş Antlaşması Tableti", tip: 1 },
    { text: "İstiklal Madalyası", tip: 1 },
    { text: "Ansiklopedi", tip: 2 },
    { text: "Tarihi Makale", tip: 2 },
    { text: "Atatürk'ün Nutuk Eseri", tip: 1 },
    { text: "Belgesel Filmi", tip: 2 }
];
let kaIndex = 0; let kaSkor = 0;
function baslatKaynakAvcisi() {
    u1OyunModallariniYukle();
    kaIndex = 0; kaSkor = 0; document.getElementById('kaSkor').innerText = kaSkor;
    kaSorular.sort(() => Math.random() - 0.5);
    kaSoruGoster();
    document.getElementById('kaynakAvcisiModal').classList.remove('hidden');
    
    let metin = document.getElementById('kaKaynakMetni');
    let s1 = document.getElementById('kaSepet1'); let s2 = document.getElementById('kaSepet2');
    
    metin.ondragstart = (e) => { e.dataTransfer.setData('text/plain', 'sürükleniyor'); };
    [s1, s2].forEach(sepet => {
        sepet.ondragover = (e) => e.preventDefault();
        sepet.ondrop = (e) => {
            e.preventDefault();
            kaDegerlendir(sepet.id === 'kaSepet1' ? 1 : 2);
        };
        sepet.onclick = () => { kaDegerlendir(sepet.id === 'kaSepet1' ? 1 : 2); };
    });
}
function kaSoruGoster() {
    if(kaIndex >= kaSorular.length) {
        alert("Oyun Bitti! Skorunuz: " + kaSkor + " / 10");
        oyunKapat('kaynakAvcisiModal'); return;
    }
    let metin = document.getElementById('kaKaynakMetni');
    metin.innerText = kaSorular[kaIndex].text;
    metin.style.transform = 'scale(0)';
    setTimeout(() => metin.style.transform = 'scale(1)', 100);
}
function kaDegerlendir(secilenTip) {
    if(kaSorular[kaIndex].tip === secilenTip) {
        kaSkor++; document.getElementById('kaSkor').innerText = kaSkor;
        document.getElementById('kaKaynakMetni').style.background = '#2ecc71'; 
    } else {
        document.getElementById('kaKaynakMetni').style.background = '#e74c3c'; 
    }
    setTimeout(() => { document.getElementById('kaKaynakMetni').style.background = '#e67e22'; kaIndex++; kaSoruGoster(); }, 400);
}

// ==========================================
// ESC TU�U �LE T�M OYUN MODALLARINI KAPATMA
// ==========================================
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        let acikModallar = document.querySelectorAll('.oyun-tam-ekran:not(.hidden)');
        acikModallar.forEach(function(modal) {
            modal.classList.add('hidden');
        });
    }
});
