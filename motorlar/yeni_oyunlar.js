// yeni_oyunlar.js - 9 ve 10. Sınıf Yeni Mini Oyunlar Motoru

/* ==========================================================================
   1. ÖNCE Mİ, SONRA MI? (KRONOLOJİK HİGHER OR LOWER)
   ========================================================================== */

const timelineEventsDB = [
    { title: "Hammurabi Kanunları", year: -1750, era: "MÖ 1750", desc: "Babil Kralı Hammurabi'nin 'Göze göz, dişe diş' esasına dayalı kanunları." },
    { title: "Kadeş Barış Antlaşması", year: -1258, era: "MÖ 1258", desc: "Tarihin ilk yazılı barış antlaşması (Hititler ve Mısırlılar)." },
    { title: "Mete Han'ın Tahta Çıkışı", year: -209, era: "MÖ 209", desc: "Asya Hun Devleti'nde Türk Kara Kuvvetleri'nin kuruluş yılı kabul edilen onluk sistem." },
    { title: "Çin Seddi'nin İnşası", year: -214, era: "MÖ 214", desc: "Türk ve Moğol akınlarına karşı Çin Qin Hanedanı tarafından başlatılan büyük savunma hattı." },
    { title: "Kavimler Göçü", year: 375, era: "375", desc: "Hunların batıya hareketiyle Avrupa'nın etnik ve siyasi haritasını kökten değiştiren göç." },
    { title: "Batı Roma'nın Yıkılışı", year: 476, era: "476", desc: "İlk Çağ'ın kapanıp Orta Çağ'ın başladığı kabul edilen büyük çöküş." },
    { title: "I. Göktürk Devleti'nin Kuruluşu", year: 552, era: "552", desc: "Bumin Kağan önderliğinde Ötüken merkezli kurulan ilk 'Türk' adlı devlet." },
    { title: "Hicret", year: 622, era: "622", desc: "Müslümanların Mekke'den Medine'ye göçü ve İslam Devleti'nin temellerinin atılışı." },
    { title: "Orhun Abideleri'nin Dikilişi", year: 732, era: "732", desc: "Kül Tigin, Bilge Kağan ve Tonyukuk adına dikilen ilk Türkçe yazılı belgeler." },
    { title: "Talas Savaşı", year: 751, era: "751", desc: "Abbasiler ve Çinliler arasındaki savaş; Türklerin İslamiyet'e geçişinin hızlanması." },
    { title: "Karahanlıların İslamiyet'i Kabulü", year: 940, era: "940", desc: "Satuk Buğra Han döneminde Orta Asya'da kurulan ilk Türk-İslam Devleti." },
    { title: "Dandanakan Savaşı", year: 1040, era: "1040", desc: "Büyük Selçuklu Devleti'nin resmen kurulup Gaznelilerin gerilemeye başladığı savaş." },
    { title: "Malazgirt Zaferi", year: 1071, era: "1071", desc: "Sultan Alparslan'ın Bizans'ı yenerek Anadolu'nun kapılarını Türklere açması." },
    { title: "I. Haçlı Seferi (Kudüs'ün Düşüşü)", year: 1099, era: "1099", desc: "Avrupalı Haçlı ordularının Kudüs'ü ele geçirip Latin Krallığı kurması." },
    { title: "Miryokefalon Savaşı", year: 1176, era: "1176", desc: "II. Kılıç Arslan'ın zaferiyle Anadolu'nun kesin olarak Türk yurdu haline gelmesi." },
    { title: "Magna Carta", year: 1215, era: "1215", desc: "İngiltere'de kralın yetkilerini tarihte ilk kez kısıtlayan büyük sözleşme." },
    { title: "Kösedağ Savaşı", year: 1243, era: "1243", desc: "Anadolu Selçuklularının Moğollara yenilerek ikinci beylikler dönemine girmesi." },
    { title: "Osmanlı Devleti'nin Kuruluşu", year: 1299, era: "1299", desc: "Osman Gazi'nin Söğüt ve Domaniç bölgesinde beyliğin temellerini atması." },
    { title: "Bursa'nın Fethi", year: 1326, era: "1326", desc: "Orhan Gazi'nin Bursa'yı fethedip Osmanlı'nın ilk büyük başkenti yapması." },
    { title: "I. Kosova Savaşı", year: 1389, era: "1389", desc: "I. Murad'ın Haçlı ittifakını mağlup ettiği ve savaş alanında şehit düştüğü zafer." },
    { title: "Ankara Savaşı", year: 1402, era: "1402", desc: "Yıldırım Bayezid ile Timur arasındaki savaş; Fetret Devri'nin başlangıcı." },
    { title: "Varna Savaşı", year: 1444, era: "1444", desc: "II. Murad'ın Osmanlı tahtına dönerek Haçlı ordusunu Balkanlar'da bozguna uğratması." },
    { title: "İstanbul'un Fethi", year: 1453, era: "1453", desc: "Fatih Sultan Mehmet'in fethiyle Orta Çağ'ın kapanıp Yeni Çağ'ın başlaması." },
    { title: "Gutenberg'in Hareketli Matbaası", year: 1450, era: "1450", desc: "Avrupa'da kitap basımını hızlandırıp Rönesans ve Reform'u ateşleyen icat." },
    { title: "Amerika Kıtası'nın Keşfi", year: 1492, era: "1492", desc: "Kristof Kolomb'un Atlantik'i aşarak yeni kıtaya ayak basması." },
    { title: "Çaldıran Zaferi", year: 1514, era: "1514", desc: "Yavuz Sultan Selim'in Safevi Devleti'ne karşı Doğu Anadolu güvenliğini sağladığı savaş." },
    { title: "Ridaniye Savaşı ve Hilafet", year: 1517, era: "1517", desc: "Memlük Devleti'nin yıkılması, Mısır'ın fethi ve Hilafetin Osmanlı'ya geçişi." },
    { title: "Martin Luther'in 95 Tezi", year: 1517, era: "1517", desc: "Wittenberg Kilisesi kapısına asılan tezlerle Avrupa Reform hareketinin başlaması." },
    { title: "Mohaç Meydan Muharebesi", year: 1526, era: "1526", desc: "Kanuni Sultan Süleyman'ın 2 saatte Macar ordusunu yenerek Orta Avrupa'ya hakim oluşu." },
    { title: "Preveze Deniz Zaferi", year: 1538, era: "1538", desc: "Barbaros Hayreddin Paşa'nın Haçlı donanmasını yenerek Akdeniz'i Türk gölü yapması." },
    { title: "İnebahtı Deniz Muharebesi", year: 1571, era: "1571", desc: "Kıbrıs'ın fethinden sonra Haçlı donanmasının Osmanlı donanmasını yaktığı çatışma." }
];

let tlRefEvent = null;
let tlTargetEvent = null;
let tlScore = 0;
let tlBestScore = parseInt(localStorage.getItem('tarih_timeline_best')) || 0;
let tlAvailableEvents = [];

function initTimeline() {
    tlScore = 0;
    document.getElementById('tl-score').innerText = tlScore;
    document.getElementById('tl-best').innerText = tlBestScore;
    
    // Rastgele olay havuzunu doldur
    tlAvailableEvents = [...timelineEventsDB].sort(() => 0.5 - Math.random());
    
    tlRefEvent = tlAvailableEvents.pop();
    tlTargetEvent = tlAvailableEvents.pop();
    
    renderTimelineCards(false);
}

function renderTimelineCards(revealTarget = false) {
    // Referans Kartı
    document.getElementById('tl-ref-title').innerText = tlRefEvent.title;
    document.getElementById('tl-ref-desc').innerText = tlRefEvent.desc;
    document.getElementById('tl-ref-year').innerText = tlRefEvent.era;
    
    // Hedef Kartı
    document.getElementById('tl-target-title').innerText = tlTargetEvent.title;
    document.getElementById('tl-target-desc').innerText = tlTargetEvent.desc;
    const targetYearEl = document.getElementById('tl-target-year');
    
    if (revealTarget) {
        targetYearEl.innerText = tlTargetEvent.era;
        targetYearEl.classList.remove('hidden-year');
    } else {
        targetYearEl.innerText = "?";
        targetYearEl.classList.add('hidden-year');
    }
}

function guessTimeline(direction) {
    const isTargetBefore = tlTargetEvent.year < tlRefEvent.year;
    const isTargetAfter = tlTargetEvent.year > tlRefEvent.year;
    
    let isCorrect = false;
    if (direction === 'before' && isTargetBefore) isCorrect = true;
    if (direction === 'after' && isTargetAfter) isCorrect = true;
    if (tlTargetEvent.year === tlRefEvent.year) isCorrect = true; // Eşitlik durumunda doğru kabul edilir
    
    renderTimelineCards(true);
    
    const targetYearEl = document.getElementById('tl-target-year');
    const btnBefore = document.getElementById('btn-tl-before');
    const btnAfter = document.getElementById('btn-tl-after');
    btnBefore.disabled = true;
    btnAfter.disabled = true;

    if (isCorrect) {
        targetYearEl.style.backgroundColor = '#295F4E';
        targetYearEl.style.color = '#fff';
        tlScore++;
        document.getElementById('tl-score').innerText = tlScore;
        
        if (tlScore > tlBestScore) {
            tlBestScore = tlScore;
            localStorage.setItem('tarih_timeline_best', tlBestScore);
            document.getElementById('tl-best').innerText = tlBestScore;
        }
        if (typeof syncActiveUserGameData === 'function') syncActiveUserGameData();

        setTimeout(() => {
            targetYearEl.style.backgroundColor = '';
            targetYearEl.style.color = '';
            btnBefore.disabled = false;
            btnAfter.disabled = false;
            
            // Hedef kart referans karta dönüşür
            tlRefEvent = tlTargetEvent;
            if (tlAvailableEvents.length === 0) {
                tlAvailableEvents = [...timelineEventsDB].filter(e => e.title !== tlRefEvent.title).sort(() => 0.5 - Math.random());
            }
            tlTargetEvent = tlAvailableEvents.pop();
            renderTimelineCards(false);
        }, 1200);
    } else {
        targetYearEl.style.backgroundColor = '#991B1B';
        targetYearEl.style.color = '#fff';
        
        setTimeout(() => {
            targetYearEl.style.backgroundColor = '';
            targetYearEl.style.color = '';
            btnBefore.disabled = false;
            btnAfter.disabled = false;
            alert(`Yanlış Tahmin!\n\n${tlTargetEvent.title} (${tlTargetEvent.era}), ${tlRefEvent.title} (${tlRefEvent.era}) tarihinden ${isTargetBefore ? 'ÖNCE' : 'SONRA'} gerçekleşmiştir.\n\nSkorun: ${tlScore}`);
            initTimeline();
        }, 1200);
    }
}


/* ==========================================================================
   2. TARİHLE (TARİHSEL WORDLE / 5 HARFLİ BULMACA)
   ========================================================================== */

const wordleWordsDB = [
    { word: "TİMAR", clue: "Devlete hizmet karşılığı verilen dirlik toprağı." },
    { word: "İSKAN", clue: "Osmanlı'nın Balkanlar'ı Türkleştirme ve yerleştirme politikası." },
    { word: "DİVAN", clue: "Devlet işlerinin görüşülüp karara bağlandığı en yüksek kurul." },
    { word: "KAVİM", clue: "375'te göç ederek Avrupa'yı sarsan insan toplulukları." },
    { word: "CİZYE", clue: "Gayrimüslim erkeklerden askerlik muafiyeti karşılığı alınan vergi." },
    { word: "HARAÇ", clue: "Gayrimüslim tebaadan ürün üzerinden alınan toprak vergisi." },
    { word: "LONCA", clue: "Osmanlı esnaf ve sanatkarlarının mesleki dayanışma teşkilatı." },
    { word: "FATİH", clue: "İstanbul'u fethederek çağ açıp çağ kapatan padişah (II. Mehmed)." },
    { word: "YAVUZ", clue: "8 yılda hazineyi doldurup Hilafeti Osmanlı'ya taşıyan padişah." },
    { word: "YABGU", clue: "İlk Türk devletlerinde hükümdarın batıyı yöneten kardeşi/vekili." },
    { word: "VAKIF", clue: "Mülkünü hayır ve kamu yararına bağışlama esasına dayalı kurum." },
    { word: "BERAT", clue: "Osmanlı'da tayin, yetki veya imtiyaz veren padişah fermanı." },
    { word: "SEFER", clue: "Gaza ve fetih amacıyla ordunun sefere çıkması." },
    { word: "TEKKE", clue: "Tasavvuf ehlinin toplandığı ve manevi eğitim aldığı ocak." },
    { word: "KOLON", clue: "İlk Çağ'da deniz aşırı topraklarda kurulan ticaret merkezleri." },
    { word: "KÜTÜK", clue: "Tımar sisteminde toprak ve gelirlerin kaydedildiği defter." },
    { word: "GAZVE", clue: "İslam tarihinde Hz. Peygamber'in bizzat katıldığı askeri seferler." },
    { word: "BEYLİ", clue: "Anadolu'da kurulan beylikler ve beylik düzeni." },
    { word: "İSYAN", clue: "Celali veya Yeniçerilerin merkezi yönetime karşı ayaklanması." },
    { word: "KAZAS", clue: "Kadıların ve kazaskerlerin adli yönetim bölgesi." }
];

let wordleTarget = "";
let wordleClue = "";
let wordleGuesses = [];
let wordleCurrentGuess = "";
let wordleGameOver = false;

function initWordle() {
    const item = wordleWordsDB[Math.floor(Math.random() * wordleWordsDB.length)];
    wordleTarget = item.word.toLocaleUpperCase('tr-TR');
    wordleClue = item.clue;
    wordleGuesses = [];
    wordleCurrentGuess = "";
    wordleGameOver = false;

    renderWordleBoard();
    renderWordleKeyboard();
    document.getElementById('wordle-msg').innerText = "5 harfli tarihi kavramı tahmin et.";
}

function renderWordleBoard() {
    const board = document.getElementById('wordle-board');
    board.innerHTML = '';

    for (let r = 0; r < 6; r++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'wordle-row';

        const guess = wordleGuesses[r] || (r === wordleGuesses.length ? wordleCurrentGuess : "");
        const isSubmitted = r < wordleGuesses.length;

        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            const letter = guess[c] || "";
            cell.innerText = letter;

            if (letter) cell.classList.add('filled');

            if (isSubmitted) {
                const targetLetter = wordleTarget[c];
                if (letter === targetLetter) {
                    cell.classList.add('correct');
                } else if (wordleTarget.includes(letter)) {
                    cell.classList.add('present');
                } else {
                    cell.classList.add('absent');
                }
            }

            rowEl.appendChild(cell);
        }
        board.appendChild(rowEl);
    }
}

function renderWordleKeyboard() {
    const keyboardEl = document.getElementById('wordle-keyboard');
    keyboardEl.innerHTML = '';

    const rows = [
        ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
        ["GİRİŞ", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "SİL"]
    ];

    rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'wordle-key-row';

        row.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'wordle-key';
            if (key === "GİRİŞ" || key === "SİL") btn.classList.add('wide');
            btn.innerText = key;

            // Klavye tuş rengi durumu
            const status = getLetterStatus(key);
            if (status) btn.classList.add(status);

            btn.onclick = () => handleWordleKey(key);
            rowEl.appendChild(btn);
        });
        keyboardEl.appendChild(rowEl);
    });
}

function getLetterStatus(char) {
    let status = "";
    wordleGuesses.forEach(guess => {
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === char) {
                if (wordleTarget[i] === char) {
                    status = "correct";
                    return;
                } else if (wordleTarget.includes(char) && status !== "correct") {
                    status = "present";
                } else if (!wordleTarget.includes(char) && !status) {
                    status = "absent";
                }
            }
        }
    });
    return status;
}

function handleWordleKey(key) {
    if (wordleGameOver) return;

    if (key === "SİL") {
        wordleCurrentGuess = wordleCurrentGuess.slice(0, -1);
        renderWordleBoard();
        return;
    }

    if (key === "GİRİŞ") {
        if (wordleCurrentGuess.length < 5) {
            alert("Lütfen 5 harfli bir kelime yazın!");
            return;
        }

        wordleGuesses.push(wordleCurrentGuess);
        const won = wordleCurrentGuess === wordleTarget;
        wordleCurrentGuess = "";

        renderWordleBoard();
        renderWordleKeyboard();

        if (won) {
            wordleGameOver = true;
            let wWins = parseInt(localStorage.getItem('tarih_wordle_wins') || 0) + 1;
            localStorage.setItem('tarih_wordle_wins', wWins);
            let wPlayed = parseInt(localStorage.getItem('tarih_wordle_played') || 0) + 1;
            localStorage.setItem('tarih_wordle_played', wPlayed);
            if (typeof syncActiveUserGameData === 'function') syncActiveUserGameData();

            document.getElementById('wordle-msg').innerText = `Tebrikler! Doğru Kelime: ${wordleTarget} — (${wordleClue})`;
            setTimeout(() => {
                alert(`Harika! ${wordleGuesses.length}. tahminde bildin!\n\n${wordleTarget}: ${wordleClue}`);
            }, 400);
        } else if (wordleGuesses.length >= 6) {
            wordleGameOver = true;
            let wPlayed = parseInt(localStorage.getItem('tarih_wordle_played') || 0) + 1;
            localStorage.setItem('tarih_wordle_played', wPlayed);
            if (typeof syncActiveUserGameData === 'function') syncActiveUserGameData();

            document.getElementById('wordle-msg').innerText = `Oyun Bitti! Kelime: ${wordleTarget} — (${wordleClue})`;
            setTimeout(() => {
                alert(`Hakkın bitti!\n\nDoğru Kelime: ${wordleTarget}\nAnlamı: ${wordleClue}`);
            }, 400);
        }
        return;
    }

    if (wordleCurrentGuess.length < 5 && key.length === 1) {
        wordleCurrentGuess += key;
        renderWordleBoard();
    }
}

// Fiziksel klavye desteği
document.addEventListener('keydown', (e) => {
    const wordleContainer = document.getElementById('game-wordle');
    if (!wordleContainer || !wordleContainer.classList.contains('active')) return;

    if (e.key === 'Backspace') {
        handleWordleKey('SİL');
    } else if (e.key === 'Enter') {
        handleWordleKey('GİRİŞ');
    } else {
        const char = e.key.toLocaleUpperCase('tr-TR');
        if (/^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]$/i.test(char)) {
            handleWordleKey(char);
        }
    }
});


/* ==========================================================================
   3. TARİHSEL BAĞLANTILAR (CONNECTIONS - EN AZ 10 GRUP)
   ========================================================================== */

const connectionsPool = [
    {
        title: "Osmanlı Büyüme ve İskan Politikaları",
        level: 1,
        items: ["İskan", "İstimalet", "Devşirme", "Tımar"]
    },
    {
        title: "Osmanlı'nın İlk Merkezleri / Başkentleri",
        level: 1,
        items: ["Söğüt", "Bursa", "İznik", "Edirne"]
    },
    {
        title: "Avrupa'ya Göç Eden Türk Toplulukları",
        level: 2,
        items: ["Avarlar", "Bulgarlar", "Hunlar", "Macarlar"]
    },
    {
        title: "İlk Türk Devletlerinde Hükümdar Unvanları",
        level: 2,
        items: ["Kağan", "Hakan", "Han", "Yabgu"]
    },
    {
        title: "Orta Çağ Avrupa Feodal Toplum Sınıfları",
        level: 3,
        items: ["Süvari", "Senyör", "Serf", "Ruhban"]
    },
    {
        title: "Anadolu'da Kurulan İlk Türk Beylikleri",
        level: 2,
        items: ["Danişment", "Saltuklu", "Mengücek", "Artuklu"]
    },
    {
        title: "İlk Çağ Anadolu Uygarlıkları",
        level: 1,
        items: ["Hititler", "Frigler", "Urartular", "İyonlar"]
    },
    {
        title: "Osmanlı Divan-ı Hümayun Üyeleri",
        level: 2,
        items: ["Sadrazam", "Şeyhülislam", "Nişancı", "Defterdar"]
    },
    {
        title: "Tarihteki Önemli Türk-İslam Savaşları",
        level: 3,
        items: ["Dandanakan", "Malazgirt", "Katvan", "Miryokefalon"]
    },
    {
        title: "Mezopotamya Uygarlıkları",
        level: 1,
        items: ["Sümerler", "Akadlar", "Babiller", "Asurlar"]
    },
    {
        title: "Osmanlı Kapıkulu Askeri Ocakları",
        level: 3,
        items: ["Yeniçeri", "Cebeci", "Topçu", "Humbaracı"]
    },
    {
        title: "İslam Öncesi Türk Dini ve Defin Kavramları",
        level: 4,
        items: ["Kurgan", "Balbal", "Yuğ", "Uçmağ"]
    }
];

let connActiveGroups = [];
let connBoardItems = [];
let connSelectedItems = [];
let connMistakesLeft = 4;
let connSolvedGroups = [];

function initConnections() {
    connMistakesLeft = 4;
    connSelectedItems = [];
    connSolvedGroups = [];
    
    // 12 gruptan rastgele 4 tanesini seç
    const shuffledPool = [...connectionsPool].sort(() => 0.5 - Math.random());
    connActiveGroups = shuffledPool.slice(0, 4);

    connBoardItems = [];
    connActiveGroups.forEach(g => {
        g.items.forEach(item => {
            connBoardItems.push({ text: item, groupTitle: g.title, level: g.level });
        });
    });

    shuffleConnections();
    renderConnections();
}

function shuffleConnections() {
    connBoardItems.sort(() => 0.5 - Math.random());
    renderConnections();
}

function clearConnectionsSelection() {
    connSelectedItems = [];
    renderConnections();
}

function toggleConnectionsItem(itemText) {
    if (connSelectedItems.includes(itemText)) {
        connSelectedItems = connSelectedItems.filter(i => i !== itemText);
    } else {
        if (connSelectedItems.length < 4) {
            connSelectedItems.push(itemText);
        }
    }
    renderConnections();
}

function submitConnectionsGuess() {
    if (connSelectedItems.length !== 4) {
        alert("Lütfen 4 kelime seçiniz!");
        return;
    }

    // Seçilen 4 kelimenin hangi gruba ait olduğunu kontrol et
    let matchedGroup = null;
    for (const group of connActiveGroups) {
        const isMatch = group.items.every(item => connSelectedItems.includes(item));
        if (isMatch) {
            matchedGroup = group;
            break;
        }
    }

    if (matchedGroup) {
        // Doğru grup bulundu!
        connSolvedGroups.push(matchedGroup);
        // Tahtadan bu 4 kelimeyi çıkar
        connBoardItems = connBoardItems.filter(i => !matchedGroup.items.includes(i.text));
        connSelectedItems = [];
        renderConnections();

        if (connSolvedGroups.length === 4) {
            let cWins = parseInt(localStorage.getItem('tarih_conn_wins') || 0) + 1;
            localStorage.setItem('tarih_conn_wins', cWins);
            if (typeof syncActiveUserGameData === 'function') syncActiveUserGameData();

            setTimeout(() => {
                alert("Harika! Tüm tarihsel bağlantıları başarıyla çözdün!");
            }, 300);
        }
    } else {
        // Yanlış tahmin
        connMistakesLeft--;
        renderConnections();
        
        // 3 tanesi aynı gruba ait mi kontrol et (One Away mesajı)
        let oneAway = false;
        for (const group of connActiveGroups) {
            if (connSolvedGroups.includes(group)) continue;
            const matchCount = group.items.filter(item => connSelectedItems.includes(item)).length;
            if (matchCount === 3) {
                oneAway = true;
                break;
            }
        }

        if (connMistakesLeft > 0) {
            alert(oneAway ? "Çok Yaklaştın! (Seçtiklerinden 3'ü aynı gruptan!)" : "Bu kelimeler birbiriyle doğrudan eşleşmiyor.");
        } else {
            alert("Haklarınız tükendi! Kalan gruplar gösteriliyor.");
            // Kalan grupları otomatik çöz
            connActiveGroups.forEach(g => {
                if (!connSolvedGroups.includes(g)) connSolvedGroups.push(g);
            });
            connBoardItems = [];
            connSelectedItems = [];
            renderConnections();
        }
    }
}

function renderConnections() {
    const grid = document.getElementById('conn-grid');
    grid.innerHTML = '';

    // 1. Çözülen grupları yukarıda banner olarak göster
    connSolvedGroups.forEach(g => {
        const banner = document.createElement('div');
        banner.className = `conn-group-solved conn-lvl-${g.level}`;
        banner.innerHTML = `
            <div class="conn-group-title">${g.title}</div>
            <div class="conn-group-items">${g.items.join(', ')}</div>
        `;
        grid.appendChild(banner);
    });

    // 2. Kalan kelime kartlarını göster
    connBoardItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'conn-card';
        if (connSelectedItems.includes(item.text)) {
            card.classList.add('selected');
        }
        card.innerText = item.text;
        card.onclick = () => toggleConnectionsItem(item.text);
        grid.appendChild(card);
    });

    // 3. Kalan hata haklarını çiz
    const dotsContainer = document.getElementById('conn-dots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const dot = document.createElement('div');
        dot.className = 'conn-dot' + (i >= connMistakesLeft ? ' lost' : '');
        dotsContainer.appendChild(dot);
    }
}


/* ==========================================================================
   4. 5 İPUCU — BEN KİMİM? (EN AZ 10 TARİHİ ŞAHSİYET)
   ========================================================================== */

const whoAmIDB = [
    {
        name: "Mete Han",
        title: "Büyük Hun Hükümdarı",
        clues: [
            "MÖ 209 yılında tahta çıkarak Orta Asya'daki tüm Türk boylarını ilk kez tek bayrak altında topladım.",
            "Dünya askeri tarihine geçen 'onluk teşkilat' sistemini kurdum.",
            "Vatan toprağının kutsallığını savunup, düşmana 'Toprak milletindir, verilemez' dedim.",
            "Çin İmparatorluğu'nu vergiye bağlayıp Türk milletinin asimile olmaması için Çin'e yerleşmeyi yasakladım.",
            "Tarihte Türk Kara Kuvvetleri'nin kuruluş yılı kabul edilen hükümdarım."
        ],
        options: ["Mete Han", "Attila", "Bumin Kağan", "Kül Tigin"]
    },
    {
        name: "Bilge Kağan",
        title: "II. Göktürk (Kutluk) Kağanı",
        clues: [
            "Kardeşim Kül Tigin ve vezirim Tonyukuk ile birlikte devletimi en parlak çağına ulaştırdım.",
            "Ötüken merkezli devletimde 'Aç milleti doyurdum, çıplak milleti giydirdim' sözleriyle sosyal devleti savundum.",
            "Şehir kurup Budizm'i kabul etme fikrime vezirim Tonyukuk, 'Türklerin savaşçı ruhunu bozar' diyerek karşı çıktı.",
            "Moğolistan sınırlarında Türkçe'nin en eski ve en görkemli yazılı belgelerini taşlara kazıttım.",
            "Orhun Abideleri'nde Türk milletine seslenen ünlü kağanım."
        ],
        options: ["Bilge Kağan", "İlteriş Kağan", "Mukan Kağan", "Bayan Kağan"]
    },
    {
        name: "Sultan Alparslan",
        title: "Büyük Selçuklu Hükümdarı",
        clues: [
            "Hristiyan dünyasının 'ele geçirilemez' dediği müstahkem Ani Kalesi'ni fethedip 'Ebü'l-Feth' unvanı aldım.",
            "Büyük vezirim Nizamülmülk'ün devlet teşkilatlanması ve Nizamiye Medreseleri hamlelerine tam destek verdim.",
            "Beyaz kefenimsi giysimle ordumun önüne geçip 'Ölürsem kefenim bu olsun' diye haykırdım.",
            "1071 yılında kendimden dört kat kalabalık Bizans ordusunu Hilal Taktiği ile hezimete uğrattım.",
            "Anadolu'nun kapılarını Türklere kesin olarak açan Malazgirt Fatihiyim."
        ],
        options: ["Sultan Alparslan", "Tuğrul Bey", "Sultan Melikşah", "Kılıç Arslan"]
    },
    {
        name: "Nizamülmülk",
        title: "Büyük Selçuklu Başveziri",
        clues: [
            "Hem Sultan Alparslan'a hem de Sultan Melikşah'a yaklaşık 30 yıl boyunca vezirlik yaptım.",
            "İkta sistemini geliştirerek Selçuklu askeri ve ekonomik gücünü zirveye taşıdım.",
            "Dönemin sapkın akımlarıyla fikren mücadele etmek için Bağdat ve Nişabur'da ünlü medreseler kurdum.",
            "Hükümdarlara devlet yönetimi, adalet ve teşkilat öğütleri veren ünlü 'Siyasetname'yi kaleme aldım.",
            "Batıniler (Haşhaşiler) tarafından şehit edilen efsanevi Selçuklu veziriyim."
        ],
        options: ["Nizamülmülk", "Gazali", "Ömer Hayyam", "İbni Sina"]
    },
    {
        name: "Mevlânâ Celâleddîn-i Rûmî",
        title: "Mutasavvıf, Şair ve Düşünür",
        clues: [
            "Belh şehrinde doğdum; Moğol istilası sebebiyle ailemle göç edip Konya'ya yerleştim.",
            "Anadolu Selçuklularının dağılma sürecinde halka sevgi, barış ve manevi güç aşıladım.",
            "Şems-i Tebrîzî ile olan dostluğum tasavvufi düşünce dünyamı derinden sarstı ve aydınlattı.",
            "'Ne olursan ol, yine gel' çağrısıyla insan sevgisini ve hoşgörüyü evrensel kıldım.",
            "26 bin beyitlik ünlü 'Mesnevî' eserinin yazarı ve Mevlevilik yolunun piriyim."
        ],
        options: ["Mevlânâ", "Yunus Emre", "Hacı Bektaş-ı Veli", "Ahi Evran"]
    },
    {
        name: "Osman Gazi",
        title: "Osmanlı Devleti'nin Kurucusu",
        clues: [
            "Oğuzların Bozok kolunun Kayı boyuna mensubum; babam Ertuğrul Gazi'den beyliği devraldım.",
            "Ahi teşkilatının lideri Şeyh Edebali'nin kızı Bala Hatun ile evlenerek Ahilerin desteğini kazandım.",
            "Bizans tekfurlarına karşı Karacahisar, Yarhisar ve İnegöl gibi önemli kaleleri fethettim.",
            "1302 Koyunhisar Savaşı'nda Bizans ordusunu ilk kez mağlup ederek beyliğimin adını duyurdum.",
            "Söğüt ve Domaniç'te 600 yıl sürecek cihan imparatorluğuna adını veren kurucuyum."
        ],
        options: ["Osman Gazi", "Orhan Gazi", "Ertuğrul Gazi", "Gündüz Alp"]
    },
    {
        name: "Orhan Gazi",
        title: "İkinci Osmanlı Padişahı",
        clues: [
            "Beyliği aşiretten devlete dönüştürerek ilk düzenli ordu olan 'Yaya ve Müsellem'i kurdum.",
            "Bursa'yı fethederek devletime başkent yaptım ve İznik'te ilk Osmanlı medresesini açtım.",
            "Karesioğulları Beyliği'ni topraklarıma katarak Osmanlı'nın ilk deniz gücüne sahip olmasını sağladım.",
            "Bizans'a yardım karşılığı Çimpe Kalesi'ni alarak Osmanlı'nın Rumeli'deki ilk üssünü elde ettim.",
            "Babam Osman Gazi'den devraldığım sınırları Marmara Denizi kıyılarına ulaştıran 'Sultan' unvanlı padişahım."
        ],
        options: ["Orhan Gazi", "I. Murad", "Yıldırım Bayezid", "Çelebi Mehmed"]
    },
    {
        name: "Fatih Sultan Mehmet",
        title: "Yedinci Osmanlı Padişahı (Fatih)",
        clues: [
            "Henüz 12 yaşında tahta çıktım; Haçlı tehlikesi üzerine tahtı babam II. Murad'a devredip sonra yeniden geçtim.",
            "Şahi toplarını döktürüp gemileri karadan Haliç'e yürüterek askeri dehamı kanıtladım.",
            "Topkapı Sarayı'nı ve Sahn-ı Seman Medreseleri'ni yaptırıp 'Avnî' mahlasıyla şiirler yazdım.",
            "İlk Osmanlı kanunnamesi olan 'Kanunname-i Âl-i Osman'ı hazırlatarak merkezi otoriteyi mutlaklaştırdım.",
            "1453'te İstanbul'u fethederek Doğu Roma'ya (Bizans) son veren hükümdarım."
        ],
        options: ["Fatih Sultan Mehmet", "Yavuz Sultan Selim", "Kanuni Sultan Süleyman", "II. Bayezid"]
    },
    {
        name: "Yavuz Sultan Selim",
        title: "Dokuzuncu Osmanlı Padişahı",
        clues: [
            "Sekiz yıllık kısa saltanatıma seksen yıllık fetih ve başarı sığdırdım.",
            "Çaldıran'da Şah İsmail'i, Mercidabık ve Ridaniye'de Memlükleri mağlup ederek Doğu siyasetini çözdüm.",
            "Kutsal Emanetleri İstanbul'a getirdim ve 'Hâdimü'l-Haremeyn' (Mekke ve Medine'nin Hizmetkârı) unvanını aldım.",
            "Devlet hazinesini altınla doldurup 'Kim ki benden çok doldurursa mühür onun olsun' diye vasiyet ettim.",
            "Osmanlı'nın ilk halife padişahıyım."
        ],
        options: ["Yavuz Sultan Selim", "Fatih Sultan Mehmet", "Kanuni Sultan Süleyman", "Yıldırım Bayezid"]
    },
    {
        name: "Kanuni Sultan Süleyman",
        title: "Onuncu Osmanlı Padişahı (Muhteşem)",
        clues: [
            "46 yıl boyunca Osmanlı tahtında kalarak en uzun süre hüküm süren padişah oldum.",
            "Batı dünyasında 'Muhteşem', Doğu'da ise adaleti ve kanunları titizlikle uyguladığım için 'Kanuni' olarak anıldım.",
            "Belgrad, Rodos ve Mohaç gibi kritik zaferlerle imparatorluğun sınırlarını Orta Avrupa'ya genişlettim.",
            "'Muhibbî' mahlasıyla 'Halk içinde muteber bir nesne yok devlet gibi / Olmaya devlet cihanda bir nefes sıhhat gibi' dizelerini yazdım.",
            "Mimar Sinan'a Süleymaniye Camii'ni inşa ettiren Osmanlı'nın zirve hükümdarıyım."
        ],
        options: ["Kanuni Sultan Süleyman", "Yavuz Sultan Selim", "II. Selim", "Sokullu Mehmed Paşa"]
    },
    {
        name: "Mimar Sinan",
        title: "Osmanlı Başmimarı (Koca Sinan)",
        clues: [
            "Devşirme olarak Yeniçeri ocağına girdim; ordu mühendisi olarak seferlerde köprüler ve kaleler inşa ettim.",
            "Kanuni, II. Selim ve III. Murad dönemlerinde yarım asra yakın süre başmimarlık yaptım.",
            "Şehzade Camii'ne 'çıraklık', Süleymaniye Camii'ne 'kalfalık' eserim dedim.",
            "Edirne'deki Selimiye Camii'ni 'ustalık eserim' olarak dünya mimarlık mirasına armağan ettim.",
            "Osmanlı klasik mimarisini zirveye taşıyan, yüzlerce cami, medrese ve su kemeri bırakan dehayım."
        ],
        options: ["Mimar Sinan", "Sedefkar Mehmed Ağa", "Mimar Hayreddin", "Matrakçı Nasuh"]
    },
    {
        name: "İbn-i Sina",
        title: "Tıp Bilgini ve Filozof (Avicenna)",
        clues: [
            "Buhara yakınlarında doğdum; genç yaşta tıp, felsefe, astronomi ve mantık alanlarında eserler verdim.",
            "Bulaşıcı hastalıkların mikroskobik kurtçuklarla geçtiğini ve karantinanın önemini yüzyıllar önce keşfettim.",
            "Batı dünyasında 'Avicenna' ve 'Hekimlerin Piri' olarak tanındım.",
            "Yazdığım devasa eser, Avrupa üniversitelerinde 600 yıl boyunca temel tıp ders kitabı olarak okutuldu.",
            "Tıp dünyasının şaheseri 'El-Kânûn fi't-Tıbb' (Tıbbın Kanunu) kitabının yazarıyım."
        ],
        options: ["İbn-i Sina", "Farabi", "Biruni", "Harezmi"]
    }
];

let whoamiCurrentIndex = 0;
let whoamiShuffledList = [];
let whoamiClueStage = 0; // 0 to 4
let whoamiScore = 0;
let whoamiTotalPoints = 0;

function initWhoAmI() {
    whoamiTotalPoints = 0;
    whoamiCurrentIndex = 0;
    whoamiShuffledList = [...whoAmIDB].sort(() => 0.5 - Math.random());
    document.getElementById('whoami-total-score').innerText = whoamiTotalPoints;
    loadWhoAmIRound();
}

function loadWhoAmIRound() {
    if (whoamiCurrentIndex >= whoamiShuffledList.length) {
        let currentHigh = parseInt(localStorage.getItem('tarih_whoami_high') || 0);
        if (whoamiTotalPoints > currentHigh) {
            localStorage.setItem('tarih_whoami_high', whoamiTotalPoints);
        }
        if (typeof syncActiveUserGameData === 'function') syncActiveUserGameData();

        alert(`Oyun Bitti! Tebrikler!\n\nToplam Skorunuz: ${whoamiTotalPoints} / ${whoamiShuffledList.length * 100}`);
        initWhoAmI();
        return;
    }

    whoamiClueStage = 0;
    const char = whoamiShuffledList[whoamiCurrentIndex];
    document.getElementById('whoami-round-info').innerText = `${whoamiCurrentIndex + 1} / ${whoamiShuffledList.length}`;
    document.getElementById('whoami-result-area').style.display = 'none';
    document.getElementById('whoami-options-area').style.display = 'grid';

    renderWhoAmIClues();
    renderWhoAmIOptions();
}

function renderWhoAmIClues() {
    const char = whoamiShuffledList[whoamiCurrentIndex];
    const list = document.getElementById('whoami-clue-list');
    list.innerHTML = '';

    const points = [100, 80, 60, 40, 20];

    for (let i = 0; i < 5; i++) {
        const item = document.createElement('div');
        if (i <= whoamiClueStage) {
            item.className = 'whoami-clue-item';
            item.innerHTML = `
                <span class="whoami-clue-num">${points[i]}P</span>
                <div>${char.clues[i]}</div>
            `;
        } else if (i === whoamiClueStage + 1) {
            item.className = 'whoami-clue-item whoami-clue-locked';
            item.innerHTML = `<span><i class="fa-solid fa-lock"></i> ${i + 1}. İpucunu Aç (-20 Puan)</span>`;
            item.onclick = () => {
                whoamiClueStage++;
                renderWhoAmIClues();
            };
        } else {
            item.className = 'whoami-clue-item whoami-clue-locked';
            item.innerHTML = `<span><i class="fa-solid fa-lock"></i> ${i + 1}. İpucu</span>`;
        }
        list.appendChild(item);
    }
}

function renderWhoAmIOptions() {
    const char = whoamiShuffledList[whoamiCurrentIndex];
    const optionsArea = document.getElementById('whoami-options-area');
    optionsArea.innerHTML = '';

    // Seçenekleri karıştır
    const shuffledOpts = [...char.options].sort(() => 0.5 - Math.random());

    shuffledOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'whoami-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => checkWhoAmIAnswer(opt, btn);
        optionsArea.appendChild(btn);
    });
}

function checkWhoAmIAnswer(selectedName, btnEl) {
    const char = whoamiShuffledList[whoamiCurrentIndex];
    const pointsMap = [100, 80, 60, 40, 20];
    const earnedPoints = pointsMap[whoamiClueStage];

    const allBtns = document.querySelectorAll('.whoami-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    if (selectedName === char.name) {
        btnEl.classList.add('correct');
        whoamiTotalPoints += earnedPoints;
        document.getElementById('whoami-total-score').innerText = whoamiTotalPoints;

        setTimeout(() => {
            showWhoAmIResult(true, earnedPoints);
        }, 600);
    } else {
        btnEl.classList.add('wrong');
        allBtns.forEach(b => {
            if (b.innerText === char.name) b.classList.add('correct');
        });

        setTimeout(() => {
            showWhoAmIResult(false, 0);
        }, 1000);
    }
}

function showWhoAmIResult(isCorrect, points) {
    const char = whoamiShuffledList[whoamiCurrentIndex];
    document.getElementById('whoami-options-area').style.display = 'none';
    const resultArea = document.getElementById('whoami-result-area');
    resultArea.style.display = 'block';

    resultArea.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 8px;">${isCorrect ? '🎉' : '📖'}</div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; color: ${isCorrect ? '#295F4E' : '#991B1B'}; margin-bottom: 4px;">
            ${isCorrect ? `Tebrikler! +${points} Puan` : 'Cevap: ' + char.name}
        </h3>
        <p style="font-family: 'IBM Plex Mono', monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 15px;">${char.title}</p>
        <p style="font-size: 0.88rem; line-height: 1.5; color: var(--ink); margin-bottom: 20px;">${char.clues[0]} ${char.clues[3]}</p>
        <button class="action-btn" onclick="nextWhoAmIRound()"><i class="fa-solid fa-arrow-right"></i> Sıradaki Karakter</button>
    `;
}

function nextWhoAmIRound() {
    whoamiCurrentIndex++;
    loadWhoAmIRound();
}

// Sayfa yüklendiğinde yeni oyunları başlat
window.addEventListener('DOMContentLoaded', () => {
    initTimeline();
    initWordle();
    initConnections();
    initWhoAmI();
});
