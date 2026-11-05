// auth.js — Tarih Portalı Kullanıcı ve İlerleme Yönetimi

const AUTH_USERS_KEY = 'tarih_portal_users';
const AUTH_ACTIVE_USER_KEY = 'tarih_active_user';

/* --- KULLANICI DEPOSU YARDIMCILARI --- */
function getAllUsers() {
    try {
        const raw = localStorage.getItem(AUTH_USERS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch(e) {
        return {};
    }
}

function saveAllUsers(users) {
    try {
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    } catch(e) {
        console.error("Kullanıcılar kaydedilemedi:", e);
    }
}

function getActiveUser() {
    return localStorage.getItem(AUTH_ACTIVE_USER_KEY) || null;
}

function getActiveUserData() {
    const active = getActiveUser();
    if (!active) return null;
    const users = getAllUsers();
    return users[active.toLowerCase()] || null;
}

/* --- OYUN İLERLEME VE VERİ YÖNETİMİ --- */
function collectAllGameData() {
    let portalData = {};
    try {
        portalData = JSON.parse(localStorage.getItem('tarih_portal_data') || '{}');
    } catch(e) {}

    return {
        score2048: parseInt(localStorage.getItem('tarih_2048_score')) || 0,
        best2048: parseInt(localStorage.getItem('tarih_2048_best')) || 0,
        grid2048: localStorage.getItem('tarih_2048_grid') || null,
        bestMemory: localStorage.getItem('tarih_memory_best') || null,
        bestHangman: parseInt(localStorage.getItem('tarih_hangman_best')) || 0,
        sudokuGrid: localStorage.getItem('tarih_sudoku_grid') || null,
        sudokuInit: localStorage.getItem('tarih_sudoku_init') || null,
        timelineBest: parseInt(localStorage.getItem('tarih_timeline_best')) || 0,
        wordleWins: parseInt(localStorage.getItem('tarih_wordle_wins')) || 0,
        wordlePlayed: parseInt(localStorage.getItem('tarih_wordle_played')) || 0,
        connWins: parseInt(localStorage.getItem('tarih_conn_wins')) || 0,
        whoamiBest: parseInt(localStorage.getItem('tarih_whoami_high')) || 0,
        portalData: portalData
    };
}

function applyGameDataToSession(gameData) {
    if (!gameData || typeof gameData !== 'object') return;

    if (gameData.score2048 !== undefined) localStorage.setItem('tarih_2048_score', gameData.score2048);
    if (gameData.best2048 !== undefined) {
        localStorage.setItem('tarih_2048_best', gameData.best2048);
        if (typeof best2048 !== 'undefined') best2048 = gameData.best2048;
        const el = document.getElementById('best-2048');
        if (el) el.innerText = gameData.best2048;
    }
    if (gameData.grid2048 !== undefined && gameData.grid2048 !== null) {
        localStorage.setItem('tarih_2048_grid', typeof gameData.grid2048 === 'string' ? gameData.grid2048 : JSON.stringify(gameData.grid2048));
    }
    if (gameData.bestMemory !== undefined && gameData.bestMemory !== null) {
        localStorage.setItem('tarih_memory_best', gameData.bestMemory);
        if (typeof bestMemory !== 'undefined') bestMemory = gameData.bestMemory;
        const el = document.getElementById('best-memory');
        if (el) el.innerText = gameData.bestMemory;
    }
    if (gameData.bestHangman !== undefined) {
        localStorage.setItem('tarih_hangman_best', gameData.bestHangman);
        if (typeof bestHangman !== 'undefined') bestHangman = gameData.bestHangman;
        const el = document.getElementById('best-hangman');
        if (el) el.innerText = gameData.bestHangman;
    }
    if (gameData.sudokuGrid !== undefined && gameData.sudokuGrid !== null) {
        localStorage.setItem('tarih_sudoku_grid', typeof gameData.sudokuGrid === 'string' ? gameData.sudokuGrid : JSON.stringify(gameData.sudokuGrid));
    }
    if (gameData.sudokuInit !== undefined && gameData.sudokuInit !== null) {
        localStorage.setItem('tarih_sudoku_init', typeof gameData.sudokuInit === 'string' ? gameData.sudokuInit : JSON.stringify(gameData.sudokuInit));
    }
    if (gameData.timelineBest !== undefined) {
        localStorage.setItem('tarih_timeline_best', gameData.timelineBest);
        if (typeof tlBestScore !== 'undefined') tlBestScore = gameData.timelineBest;
        const el = document.getElementById('timeline-best');
        if (el) el.innerText = gameData.timelineBest;
    }
    if (gameData.wordleWins !== undefined) localStorage.setItem('tarih_wordle_wins', gameData.wordleWins);
    if (gameData.wordlePlayed !== undefined) localStorage.setItem('tarih_wordle_played', gameData.wordlePlayed);
    if (gameData.connWins !== undefined) localStorage.setItem('tarih_conn_wins', gameData.connWins);
    if (gameData.whoamiBest !== undefined) localStorage.setItem('tarih_whoami_high', gameData.whoamiBest);
    if (gameData.portalData !== undefined) {
        localStorage.setItem('tarih_portal_data', typeof gameData.portalData === 'string' ? gameData.portalData : JSON.stringify(gameData.portalData));
    }
}

function syncActiveUserGameData() {
    const active = getActiveUser();
    if (!active) return;
    const users = getAllUsers();
    const key = active.toLowerCase();
    if (users[key]) {
        users[key].gameData = collectAllGameData();
        users[key].lastActiveAt = new Date().toISOString();
        saveAllUsers(users);
    }
}

// Sayfa kapanırken veya yenilenirken verileri senkronize et
window.addEventListener('beforeunload', syncActiveUserGameData);

/* --- GİRİŞ VE KAYIT İŞLEMLERİ --- */
function registerUser(username, password) {
    username = (username || '').trim();
    password = (password || '').trim();

    if (username.length < 2) {
        return { success: false, message: 'Kullanıcı adı en az 2 karakter olmalıdır.' };
    }
    if (password.length < 3) {
        return { success: false, message: 'Şifre en az 3 karakter olmalıdır.' };
    }

    const key = username.toLowerCase();
    const users = getAllUsers();

    if (users[key]) {
        return { success: false, message: 'Bu kullanıcı adı zaten alınmış!' };
    }

    // Mevcut oturumdaki ilerlemeleri de hesaba dahil et
    const currentProgress = collectAllGameData();

    users[key] = {
        username: username,
        password: password,
        createdAt: new Date().toLocaleDateString('tr-TR'),
        lastActiveAt: new Date().toISOString(),
        gameData: currentProgress
    };

    saveAllUsers(users);
    localStorage.setItem(AUTH_ACTIVE_USER_KEY, username);
    updateAuthUI();

    return { success: true, message: `Hoş geldin ${username}! Kaydın başarıyla oluşturuldu.` };
}

function loginUser(username, password) {
    username = (username || '').trim();
    password = (password || '').trim();

    if (!username || !password) {
        return { success: false, message: 'Lütfen kullanıcı adı ve şifrenizi girin.' };
    }

    const key = username.toLowerCase();
    const users = getAllUsers();
    const user = users[key];

    if (!user) {
        return { success: false, message: 'Kullanıcı bulunamadı. Lütfen önce kayıt olun.' };
    }

    if (user.password !== password) {
        return { success: false, message: 'Şifre hatalı! Lütfen tekrar deneyin.' };
    }

    // Aktif kullanıcıyı ayarla ve kullanıcının kaydedilmiş oyun verilerini oturuma uygula
    localStorage.setItem(AUTH_ACTIVE_USER_KEY, user.username);
    if (user.gameData) {
        applyGameDataToSession(user.gameData);
    }

    user.lastActiveAt = new Date().toISOString();
    saveAllUsers(users);

    updateAuthUI();
    return { success: true, message: `Tekrar hoş geldin, ${user.username}!` };
}

function logoutUser() {
    syncActiveUserGameData();
    const prevUser = getActiveUser();
    localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
    closeProfileDropdown();
    updateAuthUI();
    alert(`Görüşmek üzere ${prevUser || ''}! Oturumun güvenle kapatıldı.`);
}

/* --- VERİ İNDİR / VERİ YÜKLE ENTEGRASYONU --- */
function exportUserData() {
    const active = getActiveUser();
    syncActiveUserGameData();

    const dataPayload = {
        app: "Tarih Portalı",
        version: "2.0",
        username: active || "Misafir",
        exportedAt: new Date().toLocaleString('tr-TR'),
        gameData: collectAllGameData()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
    const filename = active ? `tarih_${active.replace(/\s+/g, '_')}_verileri.json` : `tarih_oyun_verileri.json`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importUserData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const gameData = parsed.gameData || parsed; // Hem yeni hem eski formata tam uyum
            
            applyGameDataToSession(gameData);
            syncActiveUserGameData();
            
            alert("Oyun verileriniz başarıyla yüklendi!");
            closeProfileDropdown();
            updateAuthUI();
            
            // Eğer oyun açıksa verilerin tazelenmesi için hafifçe yenileyelim
            setTimeout(() => location.reload(), 300);
        } catch(err) {
            alert("Geçersiz veya bozuk veri dosyası formatı!");
        }
    };
    reader.readAsText(file);
}

function triggerImportFile() {
    const input = document.getElementById('importFile');
    if (input) {
        input.value = '';
        input.click();
    }
}

// Eski exportData / importData referanslarını doğrudan bağlayalım
window.exportData = exportUserData;
window.importData = importUserData;
window.triggerImportFile = triggerImportFile;

/* --- UI / MODAL VE PROFİL WİDGET YÖNETİMİ --- */
let currentAuthTab = 'login';

function openAuthModal(tab = 'login') {
    closeProfileDropdown();
    switchAuthTab(tab);
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        const alertBox = document.getElementById('authAlert');
        if (alertBox) {
            alertBox.className = 'auth-alert';
            alertBox.innerText = '';
        }
        setTimeout(() => {
            const userInput = document.getElementById('authUsername');
            if (userInput) userInput.focus();
        }, 150);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
    currentAuthTab = tab;
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    const submitBtn = document.getElementById('authSubmitBtn');
    const titleEl = document.getElementById('authModalTitle');
    const switchEl = document.getElementById('authFooterSwitch');
    const alertBox = document.getElementById('authAlert');

    if (alertBox) {
        alertBox.className = 'auth-alert';
        alertBox.innerText = '';
    }

    if (tab === 'register') {
        if (tabRegister) tabRegister.classList.add('active');
        if (tabLogin) tabLogin.classList.remove('active');
        if (titleEl) titleEl.innerText = "Yeni Profil Oluştur";
        if (submitBtn) submitBtn.innerHTML = `<span>Kayıt Ol ve Başla</span> <i class="fa-solid fa-user-plus"></i>`;
        if (switchEl) switchEl.innerHTML = `<span>Zaten bir hesabın var mı?</span> <a href="javascript:void(0)" onclick="switchAuthTab('login')">Giriş Yap</a>`;
    } else {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (titleEl) titleEl.innerText = "Tarih Portalı Girişi";
        if (submitBtn) submitBtn.innerHTML = `<span>Giriş Yap</span> <i class="fa-solid fa-arrow-right"></i>`;
        if (switchEl) switchEl.innerHTML = `<span>Hesabın yok mu?</span> <a href="javascript:void(0)" onclick="switchAuthTab('register')">Hemen Kayıt Ol</a>`;
    }
}

function togglePasswordVisibility() {
    const input = document.getElementById('authPassword');
    const icon = document.getElementById('authEyeIcon');
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

function handleAuthSubmit(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById('authUsername');
    const passwordInput = document.getElementById('authPassword');
    const alertBox = document.getElementById('authAlert');

    const username = usernameInput ? usernameInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    let res;
    if (currentAuthTab === 'register') {
        res = registerUser(username, password);
    } else {
        res = loginUser(username, password);
    }

    if (alertBox) {
        alertBox.className = 'auth-alert ' + (res.success ? 'success' : 'error');
        alertBox.innerText = res.message;
    }

    if (res.success) {
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        setTimeout(() => {
            closeAuthModal();
        }, 900);
    }
}

function handleProfileClick() {
    const active = getActiveUser();
    if (!active) {
        openAuthModal('login');
    } else {
        toggleProfileDropdown();
    }
}

function toggleProfileDropdown() {
    const dd = document.getElementById('userProfileDropdown');
    if (!dd) return;
    dd.classList.toggle('active');
    if (dd.classList.contains('active')) {
        renderProfileDropdownStats();
    }
}

function closeProfileDropdown() {
    const dd = document.getElementById('userProfileDropdown');
    if (dd) dd.classList.remove('active');
}

// Profil dışına tıklandığında dropdown menüyü kapat
document.addEventListener('click', (e) => {
    const widget = document.getElementById('userProfileWidget');
    if (widget && !widget.contains(e.target)) {
        closeProfileDropdown();
    }
});

// ESC ile modal ve dropdown kapatma
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAuthModal();
        closeProfileDropdown();
    }
});

function renderProfileDropdownStats() {
    const statsContainer = document.getElementById('upDropdownStats');
    if (!statsContainer) return;

    const data = collectAllGameData();
    const badgesCount = (data.portalData && data.portalData.unlockedBadges) ? data.portalData.unlockedBadges.length : 0;

    statsContainer.innerHTML = `
        <div class="up-stat-item">
            <span class="up-stat-label">2048 Rekor</span>
            <span class="up-stat-val">${data.best2048 || 0}</span>
        </div>
        <div class="up-stat-item">
            <span class="up-stat-label">Kelime Avı</span>
            <span class="up-stat-val">${data.bestHangman || 0}</span>
        </div>
        <div class="up-stat-item">
            <span class="up-stat-label">Önce/Sonra</span>
            <span class="up-stat-val">${data.timelineBest || 0}</span>
        </div>
        <div class="up-stat-item">
            <span class="up-stat-label">Rozetler</span>
            <span class="up-stat-val">${badgesCount}</span>
        </div>
    `;
}

function updateAuthUI() {
    const active = getActiveUser();
    const profileBtn = document.getElementById('userProfileBtn');
    const avatarInner = document.getElementById('userAvatarInner');
    const ddAvatar = document.getElementById('upDropdownAvatar');
    const ddName = document.getElementById('upDropdownName');

    if (active) {
        const firstLetter = active.trim().charAt(0).toLocaleUpperCase('tr-TR');
        
        if (profileBtn) {
            profileBtn.classList.remove('guest');
            profileBtn.setAttribute('title', `Profil: ${active} (Tıkla ve İncele)`);
        }
        if (avatarInner) {
            avatarInner.innerHTML = firstLetter;
        }
        if (ddAvatar) {
            ddAvatar.innerHTML = firstLetter;
        }
        if (ddName) {
            ddName.innerText = active;
        }
    } else {
        if (profileBtn) {
            profileBtn.classList.add('guest');
            profileBtn.setAttribute('title', 'Giriş Yap / Kayıt Ol');
        }
        if (avatarInner) {
            avatarInner.innerHTML = `<i class="fa-solid fa-user"></i>`;
        }
        if (ddAvatar) {
            ddAvatar.innerHTML = '?';
        }
        if (ddName) {
            ddName.innerText = 'Misafir Öğrenci';
        }
    }
}

// Sayfa yüklendiğinde UI'ı hazırla
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auth')) {
            openAuthModal(urlParams.get('auth'));
        } else if (urlParams.get('profile')) {
            if (getActiveUser()) {
                toggleProfileDropdown();
            } else {
                openAuthModal('login');
            }
        }
    } catch(e) {}
});
