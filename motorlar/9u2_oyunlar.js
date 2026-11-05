// ==========================================
// 9. SINIF 2. ÜNİTE OYUNLARI (İNSANLIĞIN İLK DÖNEMLERİ)
// ==========================================

function u2OyunModallariniYukle() {
    if(document.getElementById('u2ModallarKonteyner')) return;
    
    let container = document.createElement('div');
    container.id = 'u2ModallarKonteyner';
    container.innerHTML = `
        <!-- 2. Ticaret Kervanı -->
        <div id="ticaretKervaniModal" class="hidden oyun-tam-ekran" style="background: #e67e22;">
            <div class="oyun-ust-bar" style="background: #ba4a00;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('ticaretKervaniModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Ticaret Kervanı</div>
                <div style="font-weight: bold;">Altın: <span id="tkAltin">50</span></div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 20px; align-items:center; background: #fdebd0; overflow-y: auto;">
                <div id="tkSenaryo" style="font-size: 20px; color: #333; text-align: center; margin-bottom: 30px; max-width: 500px; line-height: 1.5; font-weight: bold;">Asurlu bir tüccarsınız. Anadolu'ya (Kültepe) doğru yola çıktınız. Karşınıza haramiler çıktı! Ne yapacaksınız?</div>
                <div id="tkSecenekler" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 400px;"></div>
            </div>
        </div>

        <!-- 3. Çağları Sırala -->
        <div id="caglariSiralaModal" class="hidden oyun-tam-ekran" style="background: #34495e;">
            <div class="oyun-ust-bar" style="background: #2c3e50;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('caglariSiralaModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Çağları Sırala</div>
                <button style="background: #2ecc71; color:white; border:none; padding: 5px 15px; font-weight:bold; border-radius: 5px; cursor:pointer;" onclick="csKontrolEt()">Kontrol Et</button>
            </div>
            <div style="flex:1; padding: 20px; display:flex; flex-direction:column; align-items:center; overflow-y: auto;">
                <p style="color: white; font-size: 16px; text-align: center; margin-bottom: 20px;">Tarih öncesi çağları (Taş ve Maden) en eskiden en yeniye doğru sıralayın.</p>
                <div id="csListe" style="display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 400px; padding-bottom: 30px;"></div>
            </div>
        </div>

        <!-- 4. Kabileni Koru -->
        <div id="kabileniKoruModal" class="hidden oyun-tam-ekran" style="background: #c0392b;">
            <div class="oyun-ust-bar" style="background: #922b21;">
                <button class="oyun-kapat-btn" onclick="oyunKapat('kabileniKoruModal')"><i class="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div style="font-weight: bold; font-size: 20px;">Kabileni Koru</div>
                <div style="font-weight: bold;">Nüfus: <span id="kkNufus">100</span></div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; padding: 20px; align-items:center; justify-content:center; background: #f2d7d5; overflow-y: auto;">
                <i class="fa-solid fa-fire" style="font-size: 60px; color: #e74c3c; margin-bottom: 20px;"></i>
                <div id="kkSoru" style="font-size: 22px; color: #333; text-align: center; margin-bottom: 30px; max-width: 500px; font-weight: bold;">Buzul Çağı bitiyor ve kuraklık başladı. Ne yapalım?</div>
                <div style="display: flex; gap: 20px; width: 100%; max-width: 400px;">
                    <button id="kkBtnA" style="flex:1; padding: 15px; font-size: 16px; font-weight: bold; background: #27ae60; color: white; border: none; border-radius: 10px; cursor: pointer;">Seçenek A</button>
                    <button id="kkBtnB" style="flex:1; padding: 15px; font-size: 16px; font-weight: bold; background: #2980b9; color: white; border: none; border-radius: 10px; cursor: pointer;">Seçenek B</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);
}


// ----------------------------------------------------
// 2. TİCARET KERVANI
// ----------------------------------------------------
let tkSenaryolar = [
    {
        soru: "Asurlu bir tüccarsın. Karşına Lidyalılar çıktı ve takas yerine 'para' adında bir icat kullanmak istiyorlar. Kabul edecek misin?",
        cevapA: "Evet, Parayı Kullan", sonucA: {altin: 20, mesaj: "Doğru karar! Ticaret hızlandı."},
        cevapB: "Hayır, Takasa Devam", sonucB: {altin: -10, mesaj: "Yanlış karar. Lidyalılar takası reddetti, zaman kaybettin."}
    },
    {
        soru: "Kervan yolda eşkıya saldırısına uğradı. Korumalara rüşvet verip kaçmak mı, savaşmak mı?",
        cevapA: "Rüşvet Ver (20 Altın)", sonucA: {altin: -20, mesaj: "Güvenle kaçtın ama altın kaybettin."},
        cevapB: "Savaş", sonucB: {altin: -30, mesaj: "Savaşta malların bir kısmını kaybettin."}
    },
    {
        soru: "Anadolu'ya Kültepe (Karum) pazarına vardın. Burada çivi yazısı ile ticari sözleşme yapmalı mıyız?",
        cevapA: "Evet, Yazıya Dök", sonucA: {altin: 30, mesaj: "Süper! Anadolu'ya yazıyı sen getirdin ve güvenli ticaret yaptın."},
        cevapB: "Söze Güven", sonucB: {altin: -20, mesaj: "Söz uçar yazı kalır. Borçlular borcunu inkar etti!"}
    }
];
let tkIndex = 0; let tkAltin = 50;
function baslatTicaretKervani() {
    u2OyunModallariniYukle();
    tkIndex = 0; tkAltin = 50; document.getElementById('tkAltin').innerText = tkAltin;
    document.getElementById('ticaretKervaniModal').classList.remove('hidden');
    tkSoruSor();
}
function tkSoruSor() {
    if(tkIndex >= tkSenaryolar.length || tkAltin <= 0) {
        alert("Oyun Bitti! Kalan Altın: " + tkAltin);
        oyunKapat('ticaretKervaniModal'); return;
    }
    let s = tkSenaryolar[tkIndex];
    document.getElementById('tkSenaryo').innerText = s.soru;
    let secAlan = document.getElementById('tkSecenekler'); secAlan.innerHTML = '';
    
    let btnA = document.createElement('button'); btnA.innerText = s.cevapA;
    btnA.style.cssText = 'padding: 15px; font-size: 16px; font-weight: bold; background: #2ecc71; color: white; border: none; border-radius: 10px; cursor: pointer;';
    btnA.onclick = () => tkKararVer(s.sonucA);
    
    let btnB = document.createElement('button'); btnB.innerText = s.cevapB;
    btnB.style.cssText = 'padding: 15px; font-size: 16px; font-weight: bold; background: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer;';
    btnB.onclick = () => tkKararVer(s.sonucB);
    
    secAlan.appendChild(btnA); secAlan.appendChild(btnB);
}
function tkKararVer(sonuc) {
    tkAltin += sonuc.altin; document.getElementById('tkAltin').innerText = tkAltin;
    alert(sonuc.mesaj + " (" + (sonuc.altin > 0 ? "+"+sonuc.altin : sonuc.altin) + " Altın)");
    tkIndex++; tkSoruSor();
}


// ----------------------------------------------------
// 3. ÇAĞLARI SIRALA
// ----------------------------------------------------
let csSirasi = ["Eski Taş (Paleolitik)", "Orta Taş (Mezolitik)", "Yeni Taş (Neolitik)", "Bakır (Kalkolitik)", "Tunç Çağı", "Demir Çağı"];
let csDragged = null;
function baslatCaglariSirala() {
    u2OyunModallariniYukle();
    let karma = [...csSirasi].sort(() => Math.random() - 0.5);
    let liste = document.getElementById('csListe'); liste.innerHTML = '';
    karma.forEach(item => {
        let div = document.createElement('div'); div.innerText = item; div.draggable = true;
        div.style.cssText = 'background: white; color: #2c3e50; padding: 15px; border-radius: 10px; font-weight: bold; cursor: grab; text-align: center; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        
        div.addEventListener('dragstart', () => { csDragged = div; setTimeout(()=>div.style.opacity='0.5', 0); });
        div.addEventListener('dragend', () => { div.style.opacity='1'; csDragged=null; });
        div.addEventListener('dragover', e => e.preventDefault());
        div.addEventListener('drop', function(e) {
            e.preventDefault(); if(this !== csDragged) {
                let all = Array.from(liste.children);
                if(all.indexOf(csDragged) < all.indexOf(this)) this.after(csDragged); else this.before(csDragged);
            }
        });
        
        let btnUst = document.createElement('button'); btnUst.innerHTML = '▲'; btnUst.style.cssText = 'border:none; background:transparent; font-size:20px; color:#2c3e50; margin-right:10px; cursor:pointer;';
        let btnAlt = document.createElement('button'); btnAlt.innerHTML = '▼'; btnAlt.style.cssText = 'border:none; background:transparent; font-size:20px; color:#2c3e50; margin-left:10px; cursor:pointer;';
        btnUst.onclick = (e) => { e.stopPropagation(); if(div.previousElementSibling) div.parentNode.insertBefore(div, div.previousElementSibling); };
        btnAlt.onclick = (e) => { e.stopPropagation(); if(div.nextElementSibling) div.parentNode.insertBefore(div, div.nextElementSibling.nextSibling); };
        
        let container = document.createElement('div'); container.style.display = 'flex'; container.style.alignItems = 'center'; container.style.justifyContent = 'space-between';
        container.appendChild(btnUst);
        let textNode = document.createElement('span'); textNode.innerText = item; textNode.style.flex = "1";
        container.appendChild(textNode);
        container.appendChild(btnAlt);
        
        div.innerHTML = ''; div.appendChild(container);
        liste.appendChild(div);
    });
    document.getElementById('caglariSiralaModal').classList.remove('hidden');
}
function csKontrolEt() {
    let currentOrder = Array.from(document.getElementById('csListe').children).map(c => c.querySelector('span').innerText);
    if(JSON.stringify(csSirasi) === JSON.stringify(currentOrder)) {
        alert("Harika! Tarih öncesi çağları doğru sıraladın."); oyunKapat('caglariSiralaModal');
    } else alert("Sıralamada hata var, taş ve maden devirlerini tekrar gözden geçir.");
}


// ----------------------------------------------------
// 4. KABİLENİ KORU
// ----------------------------------------------------
let kkSenaryolar = [
    {
        soru: "Buzul Çağı bitiyor, havalar ısınıyor. Mağaralardan çıkıp su kenarlarına göç edelim mi?",
        cevapA: "Evet, Göç Et", sonucA: {nufus: 20, mesaj: "Su kenarında tarıma başladınız! Nüfus arttı."},
        cevapB: "Hayır, Mağarada Kal", sonucB: {nufus: -30, mesaj: "Açlık başladı, kabilenin bir kısmı yok oldu."}
    },
    {
        soru: "Su kenarına yerleştik (Neolitik). Yabani buğdayları evcilleştirelim mi yoksa avlanmaya devam mı?",
        cevapA: "Tarım Yap", sonucA: {nufus: 30, mesaj: "Üretici yaşama geçtiniz, kabile köy oldu!"},
        cevapB: "Sadece Avlan", sonucB: {nufus: -10, mesaj: "Av hayvanları azaldı."}
    },
    {
        soru: "Köyde ürün fazlası (artı ürün) oluştu. Diğer köylerle takas edelim mi?",
        cevapA: "Takas (Ticaret) Yap", sonucA: {nufus: 20, mesaj: "Ticaret başladı, kültürel etkileşim hızlandı!"},
        cevapB: "Hepsini Sakla", sonucB: {nufus: -10, mesaj: "Ürünler çürüdü, fırsatı kaçırdınız."}
    }
];
let kkIndex = 0; let kkNufus = 100;
function baslatKabileniKoru() {
    u2OyunModallariniYukle(); kkIndex = 0; kkNufus = 100; document.getElementById('kkNufus').innerText = kkNufus;
    document.getElementById('kabileniKoruModal').classList.remove('hidden');
    kkSoruSor();
}
function kkSoruSor() {
    if(kkIndex >= kkSenaryolar.length || kkNufus <= 0) {
        alert("Oyun Bitti! Ulaştığınız Nüfus: " + kkNufus);
        oyunKapat('kabileniKoruModal'); return;
    }
    let s = kkSenaryolar[kkIndex];
    document.getElementById('kkSoru').innerText = s.soru;
    
    let bA = document.getElementById('kkBtnA'); bA.innerText = s.cevapA;
    bA.onclick = () => kkKararVer(s.sonucA);
    
    let bB = document.getElementById('kkBtnB'); bB.innerText = s.cevapB;
    bB.onclick = () => kkKararVer(s.sonucB);
}
function kkKararVer(sonuc) {
    kkNufus += sonuc.nufus; document.getElementById('kkNufus').innerText = kkNufus;
    alert(sonuc.mesaj + " (Nüfus: " + (sonuc.nufus>0 ? "+"+sonuc.nufus : sonuc.nufus) + ")");
    kkIndex++; kkSoruSor();
}


