// portal.js - Ana Veri ve Oyunlaştırma Motoru

/* =========================================================
   1. PROFİL VE ROZET SİSTEMİ (GAMIFICATION)
   ========================================================= */

// Rozet Veritabanı
const badgesDB = {
    'satranc_usta': { title: 'Büyük Usta', desc: 'Satrançta bilgisayarı yendin.', icon: '♔', color: '#5d4037' },
    '2048_zekasi': { title: '2048 Zekası', desc: '2048 oyununda 2048 karesine ulaştın.', icon: '🧠', color: '#8E523A' }
};

// Portal Verilerini Yükle
function loadPortalData() {
    let data = localStorage.getItem('tarih_portal_data');
    if (data) {
        return JSON.parse(data);
    }
    return {
        studentName: '',
        unlockedBadges: [],
        joinDate: new Date().toLocaleDateString('tr-TR')
    };
}

// Portal Verilerini Kaydet
function savePortalData(data) {
    localStorage.setItem('tarih_portal_data', JSON.stringify(data));
}

// Öğrenci Adını Güncelle
function setStudentName(name) {
    let data = loadPortalData();
    data.studentName = name;
    savePortalData(data);
    renderProfile(); // Profil sayfasındaysa günceller
}

// Rozet Aç
function unlockBadge(badgeId) {
    let data = loadPortalData();
    if (!data.unlockedBadges.includes(badgeId) && badgesDB[badgeId]) {
        data.unlockedBadges.push(badgeId);
        savePortalData(data);
        showBadgeNotification(badgesDB[badgeId]);
        if(typeof syncActiveUserGameData === 'function') syncActiveUserGameData();
        
        // Eğer profil sayfasındaysa arayüzü güncelle
        if(typeof renderProfile === 'function') {
            renderProfile();
        }
    }
}

// Rozet Bildirimi Göster
function showBadgeNotification(badge) {
    const notif = document.createElement('div');
    notif.className = 'badge-notification';
    notif.innerHTML = `
        <div class="bn-icon" style="color: ${badge.color}">${badge.icon}</div>
        <div class="bn-text">
            <div class="bn-title">YENİ ROZET AÇILDI!</div>
            <div class="bn-name">${badge.title}</div>
        </div>
    `;
    document.body.appendChild(notif);
    
    // Animasyon
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

/* =========================================================
   2. TARİHTE BUGÜN SİSTEMİ
   ========================================================= */

const todayInHistoryDB = {
    // Örnek birkaç ay ve gün. Kapsamlı yapılabilir.
    "1_1": "1929 - Millet Mektepleri açıldı.",
    "3_18": "1915 - Çanakkale Zaferi kazanıldı.",
    "4_23": "1920 - TBMM açıldı.",
    "5_19": "1919 - Atatürk'ün Samsun'a çıkışı.",
    "5_29": "1453 - İstanbul'un Fethi.",
    "8_26": "1071 - Malazgirt Meydan Muharebesi.",
    "8_30": "1922 - Büyük Taarruz zaferle sonuçlandı.",
    "10_29": "1923 - Cumhuriyet ilan edildi.",
    "11_10": "1938 - Atatürk'ün vefatı."
};

const genericHistoryFacts = [
    "Hititler, tarihte bilinen ilk yazılı antlaşma olan Kadeş Antlaşması'nı Mısırlılarla imzalamıştır.",
    "Osmanlı Devleti'nin ilk başkenti Söğüt ve Domaniç'tir.",
    "Fransız İhtilali 1789'da gerçekleşmiş ve dünyaya milliyetçilik akımını yaymıştır.",
    "Roma İmparatorluğu MS 395'te Doğu ve Batı olarak ikiye ayrılmıştır.",
    "Tarihte parayı ilk bulan uygarlık Lidyalılardır.",
    "İstanbul tam 3 imparatorluğa başkentlik yapmıştır: Roma, Bizans ve Osmanlı.",
    "Göbeklitepe, MÖ 9600 yıllarında inşa edilmiş bilinen en eski tapınaktır.",
    "Piri Reis, 1513 yılında çizdiği dünya haritasında Amerika kıtasını oldukça isabetli göstermiştir.",
    "Eski Mısır'da hiyerogliflerin çözülmesini sağlayan Rosetta Taşı 1799'da Napolyon'un askerleri tarafından bulunmuştur.",
    "Dünyanın bilinen ilk üniversitelerinden biri olan Karawiyyin, 859 yılında Fas'ta Fatıma el-Fıhri tarafından kurulmuştur.",
    "Osmanlı'da matbaayı kuran İbrahim Müteferrika, ilk basılı eser olan Vankulu Lügatı'nı 1729'da yayımlamıştır."
];

let tihIndex = 0;
let tihItems = [];

function renderTodayInHistory() {
    const container = document.getElementById('today-in-history');
    if (!container) return;
    
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const key = `${month}_${day}`;
    
    tihItems = [];
    if(todayInHistoryDB[key]) {
        tihItems.push(todayInHistoryDB[key]);
    }
    
    // Geri kalanları rastgele doldur, toplam 5 olacak şekilde
    let shuffled = [...genericHistoryFacts].sort(() => 0.5 - Math.random());
    while(tihItems.length < 5 && shuffled.length > 0) {
        tihItems.push(shuffled.pop());
    }
    
    tihIndex = 0;
    updateTihDisplay();
}

function updateTihDisplay() {
    const container = document.getElementById('today-in-history');
    if (!container) return;
    
    let text = tihItems[tihIndex];
    let isSpecificDay = (tihIndex === 0 && text.includes(" - ")); // Çok basit bir kontrol
    
    container.innerHTML = `
        <div class="tih-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
                <i class="fa-solid ${isSpecificDay ? 'fa-calendar-day' : 'fa-lightbulb'}"></i> 
                ${isSpecificDay ? 'Tarihte Bugün' : 'Günün Tarih Bilgisi'}
            </div>
            <div style="display: flex; gap: 15px; font-size: 1.1rem; color: var(--c-9);">
                <i class="fa-solid fa-circle-chevron-left" style="cursor:pointer;" onclick="changeTih(-1)"></i>
                <span style="font-family:'IBM Plex Mono'; font-size: 0.65rem; color: var(--muted);">${tihIndex + 1} / 5</span>
                <i class="fa-solid fa-circle-chevron-right" style="cursor:pointer;" onclick="changeTih(1)"></i>
            </div>
        </div>
        <div class="tih-body" style="min-height: 60px; display:flex; align-items:center;">${text}</div>
    `;
}

function changeTih(dir) {
    tihIndex += dir;
    if(tihIndex < 0) tihIndex = tihItems.length - 1;
    if(tihIndex >= tihItems.length) tihIndex = 0;
    updateTihDisplay();
}


