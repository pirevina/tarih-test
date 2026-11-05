(function(){
  var tabs  = document.querySelectorAll('.algo-tab');
  var panels = document.querySelectorAll('.algo-panel');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      panels.forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('ap-' + tab.dataset.p);
      if(target) target.classList.add('active');
    });
  });
})();


        // HİYERARŞİK MENÜ AÇMA/KAPAMA
        function toggleNavGroup(header) {
            header.classList.toggle('open');
            const subItems = header.nextElementSibling;
            subItems.classList.toggle('open');
        }

        // Tüm kavramları içeren dizi (CSV'lerden derlenmiş 28 kavram)
        const concepts = [
            // dijital-medya-nedir.csv
            { term: "Dijital Medya", definition: "İnternet ortamında kullanılan iletişim araçlarıdır. Somut iletişim araçlarından soyutlaşan bir formdur.", importance: "Örnekler: Sosyal Medya platformları, İnternet gazeteleri, Online ders platformları" },
            { term: "Sosyal Medya", definition: "Kullanıcıların içerik üretebildikleri ve diğer kullanıcılar ile paylaşabildikleri bir alt grup dijital medya araçlarıdır.", importance: "Örnekler: Facebook, Instagram, Twitter" },
            { term: "Dijitalleşme", definition: "Maddi bir forma sahip olan iletişim araçlarının elektronik ortama taşınması sürecidir.", importance: "Örnek: Kağıt-kalem yerine bilgisayar kullanılması, gazetenin internete taşınması" },
            { term: "İnteraktif İletişim", definition: "Sosyal medya platformlarında kullanıcıların aktif olarak bilgi alışverişi yapabilmesine verilen isimdir.", importance: "Örnek: Facebook'ta paylaşım yapma, Instagram'da yorum yapma" },
            { term: "Çevrimiçi (Online) Olma", definition: "Her an her yerden internete erişip, sosyal medyada aktif olabilme durumudur.", importance: "Örnek: Cep telefonlarından sosyal medya platformlarına girme, tabletlerden internet kaynaklı bilgiye erişim" },
            { term: "Web 2.0", definition: "İnternetin ve web sitelerinin interaktif hale geldiği dönemdir. İçerik oluşturucuların sayısı artmıştır.", importance: "Örnekler: Blogger, Wikipedia" },
            { term: "Geleneksel Medya", definition: "Dijital olmayan, maddi formda var olan iletişim araçlarıdır.", importance: "Örnekler: Gazete, televizyon, radyo" },
            { term: "İletişim Araçları", definition: "İnsanların birbiriyle bilgi ve düşünce alışverişinde bulunmak amacıyla kullandıkları araçlardır.", importance: "Örnekler: Telefon, e-posta, mektuplar" },
            { term: "İletişim Açlığı", definition: "İnsanların bilgi ve düşünce paylaşma ihtiyacına verilen ad.", importance: "Örnek: Sosyal medya kullanma isteği, haberlere anında ulaşma isteği" },
            { term: "Güvenli Dijital Medya Kullanımı", definition: "Dijital medya araçlarının bilinçli ve korunaklı bir şekilde kullanılmasını ifade eder.", importance: "Örnek: Kişisel bilgilerin korunması, güvenlik ayarlarını kullanma" },
            // sosyal-medya-okuryazarligi-nedir.csv
            { term: "Sosyal Medya Okuryazarlığı", definition: "Sosyal mecralardaki içerikleri ve bilgileri anlama, analiz etme, değerlendirme ve üretme becerisidir.", importance: "Önem: Bilinçli bir sosyal medya kullanıcısı olmak ve sahte içerikleri ayırt edebilmek için kritiktir." },
            { term: "Medya Okuryazarlığı", definition: "Kitle iletişim araçları tarafından sunulan bilgi ve iletileri yorumlama, sorgulama ve anlama becerisini kapsar.", importance: "Önem: Medyanın toplumu nasıl etkilediğini anlamak ve olumsuz etkilerine karşı korunmak için önemlidir." },
            { term: "Sosyal Medya Mecraları", definition: "Facebook, Twitter, Instagram, Pinterest, LinkedIn ve Google gibi platformlar farklı kullanım ve işlevlere sahiptir.", importance: "Önem: Her platformun kullanım şekillerini ve kurallarını bilme, onları en etkili ve amaca uygun şekilde kullanma becerisini gerektirir." },
            { term: "İleti ve Enformasyon Bombardımanı", definition: "Televizyon, radyo, sosyal medya ve kişilerarası iletişim aracılığıyla sürekli bilgi ve ileti alımı yaşanmaktadır.", importance: "Önem: Bu durum bilgi ve mesajların nasıl işlendiği, anlaşıldığı ve etkisinin nasıl oluşturulduğu konusunda bilinçlilik gerektirir." },
            { term: "Doğru ve Yanıltıcı İçerikler", definition: "Sosyal medyadaki gönderiler ve bilgiler doğru olmayabilir veya manipülasyon amacı ile oluşturulmuş olabilir.", importance: "Önem: Bunu tanımak ve bilgiyi sorgulamak adına sosyal medya okuryazarlığı kritik öneme sahiptir." },
            { term: "E-Ticaret", definition: "İnternet üzerinden yapılan alışveriş veya ticaret faaliyetleri.", importance: "Önem: Sosyal medya üzerinden e-ticaret faaliyetleri için, sosyal medya mecralarının kullanımına aşina olmak gerekiyor." },
            { term: "Mecra Kullanım Şartları ve Kuralları", definition: "Her sosyal medya mecrasının kullanım ve ihlal şartları vardır.", importance: "Önem: Bu şartlar ve kurallar, sosyal medyayı etkin ve doğru kullanmak için bilinmesi gerekenlerdir." },
            { term: "Veri Analizi", definition: "Ortalama 3.8 milyar kişinin sosyal medyayı aktif olarak kullanması, sosyal medya araştırmaları ve analizlerinin önemini artırmaktadır.", importance: "Önem: Bu verileri ve trendleri izlemek sosyal medyanın hangi noktada olduğunu ve neye doğru ilerlediğini anlamamızı sağlar." },
            { term: "Bilinçli Sosyal Medya Kullanıcıları", definition: "Sosyal medyayı bilinçli kullanan kişiler, sahte ve yanıltıcı bilgilere karşı daha güvende olurlar ve daha etkin kullanırlar.", importance: "Önem: Bu durum bireylerin ve toplumun genel bilgi seviyesini ve bilinç seviyesini artırır." },
            { term: "Manipülasyon ve Yanıltıcı Bilgiler", definition: "Sosyal medyada yanıltıcı ve manipülasyon amaçlı bilgilere karşı dikkatli olunmalıdır.", importance: "Önem: Sosyal medya okuryazarlığı, bu tür bilgilerin ayırt edilmesi ve bilinçli bir sosyal medya kullanıcı olunması açısından önemlidir." },
            // dijital-okuryazarlik-ile-medya-okuryazarligi-farklari.csv
            { term: "Medya Okuryazarlığı (Karşılaştırma)", definition: "Medyanın ortaya çıkardığı metin, video, görsel, programları ve kurallarını bilmeyi, çözümlemeyi ve sorgulamayı sağlayan bir yetenek.", importance: "Özellikler: Eleştirel düşünme becerisi, sorgulama yeteneği, medya ürünlerini analiz etme" },
            { term: "Dijital Okuryazarlık", definition: "Dijitalleşen dünya ve teknolojideki iletişim metotlarının etkin kullanımını ve eleştirebilmeyi sağlayan bir yetenek.", importance: "Özellikler: Bilgiye erişme ve bilgiyi yaratma yeteneği, sosyal medya ve dijital ortamların kullanım hakimiyeti" },
            { term: "5N1K", definition: "Eleştirel düşünme ve bilgiye ulaşma yöntemi olan, kim, ne, nerede, ne zaman, neden, nasıl sorularını temsil eder.", importance: "Özellikler: Haber niteliği taşıyan bilgilere objektif bakmayı sağlar, bilgiyi tüm yönleriyle irdelemeyi sağlar" },
            { term: "Kitle İletişim Araçları", definition: "Topluma bilgi, düşünce ve görüşlerin yayılmasını sağlayan araçlar.", importance: "Özellikler: Toplum ile birey veya kurumlar arasında iletişim sağlar, çok sayıda kişiye ulaşma potansiyeli" },
            { term: "Reklam", definition: "Bir ürün ya da hizmetin tanıtımının yapılması için kullanılan pazarlama teknikleri.", importance: "Özellikler: Hedef kitlenin dikkatini çekme, hikâye ve karakterler ile mesaj verme" },
            { term: "Haber Bültenleri", definition: "Güncel olayları ve bilgileri halka sunan medya metinleri.", importance: "Özellikler: Gerçek ve objektif olma niteliği, halkın bilgi edinmesini sağlama" },
            { term: "Sosyal Medya (Karşılaştırma)", definition: "İnternet kullanıcılarının bilgi, görüş ve deneyimlerini paylaştığı platformlar.", importance: "Özellikler: İnteraktif ve dinamik yapı, hızlı ve geniş kitleye ulaşma" },
            { term: "İnternet Haberciliği", definition: "Haber ve bilgilerin, dijital platformlarda, genellikle internet üzerinden sunulması.", importance: "Özellikler: 24/7 erişim, takipçiyi hedefleyen özelleştirme imkanı sunma" }
        ];

        // Kartları oluştur
        const grid = document.getElementById('concept-grid');
        concepts.forEach(concept => {
            const wrapper = document.createElement('div');
            wrapper.className = 'concept-card-wrapper';
            
            const card = document.createElement('div');
            card.className = 'concept-card';
            card.onclick = function() { this.classList.toggle('flipped'); };
            
            const front = document.createElement('div');
            front.className = 'card-face card-front';
            front.innerHTML = `<div class="card-term">${concept.term}</div><div style="font-size: 0.7rem; opacity: 0.5;">Dokun <i class="fa-solid fa-rotate"></i></div>`;
            
            const back = document.createElement('div');
            back.className = 'card-face card-back';
            back.innerHTML = `
                <div class="card-term">${concept.term}</div>
                <div class="card-definition">${concept.definition}</div>
                <div class="card-importance">${concept.importance}</div>
            `;
            
            card.appendChild(front);
            card.appendChild(back);
            wrapper.appendChild(card);
            grid.appendChild(wrapper);
        });

        // Hamburger menü işlevi
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main');
        const menuToggle = document.getElementById('menuToggle');
        let sidebarOpen = true;

        function toggleSidebar(e) {
            if(e) e.stopPropagation();
            sidebarOpen = !sidebarOpen;
            if (sidebarOpen) {
                sidebar.classList.remove('closed');
                sidebar.classList.add('open');
                main.classList.remove('sidebar-closed');
            } else {
                sidebar.classList.add('closed');
                sidebar.classList.remove('open');
                main.classList.add('sidebar-closed');
            }
        }

        menuToggle.addEventListener('click', toggleSidebar);

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && sidebarOpen && !sidebar.contains(e.target) && e.target !== menuToggle) {
                toggleSidebar();
            }
        });

        const conceptToggleBtn = document.getElementById('conceptToggle');
        
        conceptToggleBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            grid.classList.toggle('show');
            if(this.classList.contains('active')) {
                this.innerHTML = 'Kavramları Gizle <i class="fa-solid fa-chevron-up"></i>';
            } else {
                this.innerHTML = 'Kavramları Göster <i class="fa-solid fa-chevron-down"></i>';
            }
        });

        // Mobil görünümde başlangıçta sidebar kapalı olsun
        if (window.innerWidth <= 1024) {
            sidebar.classList.add('closed');
            sidebar.classList.remove('open');
            main.classList.add('sidebar-closed');
            sidebarOpen = false;
        }

        // Pencere boyutu değiştiğinde mobil kontrolü
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) {
                if (sidebarOpen) {
                    sidebar.classList.add('closed');
                    sidebar.classList.remove('open');
                    main.classList.add('sidebar-closed');
                    sidebarOpen = false;
                }
            } else {
                if (!sidebarOpen) {
                    sidebar.classList.remove('closed');
                    sidebar.classList.remove('open');
                    main.classList.remove('sidebar-closed');
                    sidebarOpen = true;
                }
                grid.classList.remove('show');
                conceptToggleBtn.classList.remove('active');
                conceptToggleBtn.innerHTML = 'Kavramları Göster <i class="fa-solid fa-chevron-down"></i>';
            }
        });

        // Arka plan görselleri
        const bgImages = {
            'intro': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000',
            'definition': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2000',
            'architecture': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000',
            'bubbles': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000',
            'mining': 'https://plus.unsplash.com/premium_photo-1682001956748-ee56a68d8802?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dq=80&w=2000',
            'dezenformasyon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2000',
            'mezenformasyon': 'https://plus.unsplash.com/premium_photo-1706911687157-bd8e41504a60?q=80&w=992&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D=80&w=2000',
            'deepfake': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=2000',
            'siber-zorbalik': 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2000',
            'vaka-analizleri': 'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=2000',
            'ruh-sagligi': 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000',
            'podcasts': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000',
            'safety': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2000',
            'concepts': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000'
        };

        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        const bgLayer = document.getElementById('bgLayer');

        window.addEventListener('scroll', () => {
            let current = "";
            sections.forEach(sec => {
                const top = window.scrollY;
                const offset = sec.offsetTop - 350;
                const height = sec.offsetHeight;
                const id = sec.getAttribute('id');
                if (top >= offset && top < offset + height) {
                    current = id;
                    sec.querySelector('.content-box').classList.add('active');
                    if(bgImages[id]) bgLayer.style.backgroundImage = `url('${bgImages[id]}')`;
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) link.classList.add('active');
            });
        });

        // ========== YENİ: ÖZEL SES OYNATICI JAVASCRİPTİ ==========
        document.querySelectorAll('.custom-audio-player').forEach(container => {
            const audioSrc = container.getAttribute('data-audio');
            if (!audioSrc) return;

            const audio = new Audio(audioSrc);
            audio.preload = 'metadata';

            const playBtn = container.querySelector('.play-pause-btn');
            const progressBar = container.querySelector('.progress-bar');
            const progressFill = container.querySelector('.progress-fill');
            const currentTimeSpan = container.querySelector('.current-time');
            const durationSpan = container.querySelector('.duration');

            function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }

            audio.addEventListener('loadedmetadata', () => {
                durationSpan.textContent = formatTime(audio.duration);
            });

            audio.addEventListener('timeupdate', () => {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = `${percent}%`;
                currentTimeSpan.textContent = formatTime(audio.currentTime);
            });

            playBtn.addEventListener('click', () => {
                if (audio.paused) {
                    // Diğer oynatıcıları durdur
                    document.querySelectorAll('.custom-audio-player').forEach(other => {
                        const otherAudio = other.audioObj;
                        if (otherAudio && otherAudio !== audio && !otherAudio.paused) {
                            otherAudio.pause();
                            const otherBtn = other.querySelector('.play-pause-btn i');
                            otherBtn.className = 'fa-solid fa-play';
                        }
                    });
                    audio.play();
                    playBtn.querySelector('i').className = 'fa-solid fa-pause';
                } else {
                    audio.pause();
                    playBtn.querySelector('i').className = 'fa-solid fa-play';
                }
            });

            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const seekTo = (clickX / width) * audio.duration;
                audio.currentTime = seekTo;
            });

            audio.addEventListener('ended', () => {
                playBtn.querySelector('i').className = 'fa-solid fa-play';
                progressFill.style.width = '0%';
                currentTimeSpan.textContent = '0:00';
            });

            container.audioObj = audio;
        });
// --- MODE SWITCHER LOGIC ---
function switchMode(mode) {
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const parentElements = document.querySelectorAll('.parent-only');
    const studentElements = document.querySelectorAll('.student-only');

    if (mode === 'all') {
        parentElements.forEach(el => { el.style.display = 'block'; setTimeout(() => el.style.opacity = '1', 50); });
        studentElements.forEach(el => { el.style.display = 'block'; setTimeout(() => el.style.opacity = '1', 50); });
    } else if (mode === 'student') {
        parentElements.forEach(el => { el.style.opacity = '0'; setTimeout(() => el.style.display = 'none', 300); });
        studentElements.forEach(el => { el.style.display = 'block'; setTimeout(() => el.style.opacity = '1', 50); });
    } else if (mode === 'parent') {
        studentElements.forEach(el => { el.style.opacity = '0'; setTimeout(() => el.style.display = 'none', 300); });
        parentElements.forEach(el => { el.style.display = 'block'; setTimeout(() => el.style.opacity = '1', 50); });
    }
}


// --- GAMIFICATION QUIZ LOGIC ---
const quizQuestions = [
    {
        q: "Bir WhatsApp grubunda 'Bu mesajı 10 kişiye gönderirsen WhatsApp ücretli olmayacak' şeklinde bir mesaj aldınız. Ne yaparsınız?",
        options: ["Hemen 10 kişiye gönderirim", "Mesajı görmezden gelirim ve silerim", "Arkadaşlarıma doğruluğunu sorarım"],
        correct: 1,
        explanation: "Bu klasik bir oltalama/spam taktiğidir. Resmi açıklamalar dışında bu tür mesajlara itibar etmemelisiniz."
    },
    {
        q: "İnternette çok ucuz fiyata satılan son model bir telefon gördünüz. Site adresi 'amaz0n-indirim.com'. Ne yapmalısınız?",
        options: ["Kredi kartı bilgilerimi girip hemen alırım", "Sitenin URL'sini (adresini) dikkatlice kontrol ederim", "Fırsatı kaçırmamak için kapıda ödeme seçerim"],
        correct: 1,
        explanation: "Orijinal sitelerin harflerini değiştirerek (amazon yerine amaz0n) yapılan bu dolandırıcılığa Phishing (Oltalama) denir. Adresi her zaman kontrol edin!"
    },
    {
        q: "Hangi durum siber zorbalık kapsamına girer?",
        options: ["Bir arkadaşınla mesajlaşırken şakalaşmak", "Birinin izni olmadan komik bir fotoğrafını gruplarda paylaşmak", "Sosyal medyada birini takipten çıkmak"],
        correct: 1,
        explanation: "Kişinin izni olmadan, onu küçük düşürecek içerikler paylaşmak açık bir siber zorbalık suçudur."
    }
];

let currentQ = 0;

function loadQuestion() {
    const qData = quizQuestions[currentQ];
    document.getElementById('q-text').innerText = qData.q;
    
    const optionsHtml = qData.options.map((opt, index) => 
        `<button class="quiz-btn" onclick="checkAnswer(` + index + `, this)">` + opt + `</button>`
    ).join('');
    
    document.getElementById('q-options').innerHTML = optionsHtml;
    document.getElementById('q-feedback').style.display = 'none';
}

function checkAnswer(index, btn) {
    const qData = quizQuestions[currentQ];
    const isCorrect = (index === qData.correct);
    
    // Disable all buttons
    const btns = document.querySelectorAll('.quiz-options .quiz-btn');
    btns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
        btns[qData.correct].classList.add('correct');
    }
    
    const feedback = document.getElementById('q-feedback');
    feedback.innerHTML = `<strong>` + (isCorrect ? 'Tebrikler, Doğru!' : 'Yanlış Cevap!') + `</strong><br>` + qData.explanation + 
        `<br><br><button class="quiz-btn" style="background:var(--gold); color:#000; border:none;" onclick="nextQuestion()">Sıradaki Soru ➔</button>`;
    feedback.style.display = 'block';
    feedback.style.backgroundColor = isCorrect ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)';
    feedback.style.border = '1px solid ' + (isCorrect ? '#2ecc71' : '#e74c3c');
}

function nextQuestion() {
    currentQ++;
    if (currentQ < quizQuestions.length) {
        loadQuestion();
    } else {
        document.getElementById('quiz-content').innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <i class="fa-solid fa-medal" style="font-size: 3rem; color: var(--gold); margin-bottom:15px;"></i>
                <h3>Harika! Testi Tamamladın.</h3>
                <p>Sosyal medya okuryazarlığı konusunda artık daha bilinçlisin.</p>
                <button class="quiz-btn" style="margin-top:15px;" onclick="currentQ=0; loadQuestion();">Tekrar Çöz</button>
            </div>
        `;
    }
}

// Initialize quiz when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('quiz')) {
        loadQuestion();
    }
});


// --- GAMIFICATION LOGIC ---
// XP Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const xpBar = document.getElementById('xp-bar');
    if (xpBar) xpBar.style.width = scrolled + '%';
});

// Interactive Scenario
function scenarioChoice(choice, btnElement) {
    const feedback = document.getElementById('scenario-feedback');
    const buttons = document.querySelectorAll('.scenario-btn');
    buttons.forEach(b => { b.style.opacity = '0.5'; b.disabled = true; });
    btnElement.style.opacity = '1';
    btnElement.style.borderColor = 'var(--gold)';
    
    feedback.style.display = 'block';
    if (choice === 2) {
        feedback.innerHTML = '<strong style="color:#2ecc71;"><i class="fa-solid fa-check"></i> DoÄŸru Karar!</strong><br>Siber zorbalÄ±ÄŸa aynÄ± ÅŸekilde karÅŸÄ±lÄ±k vermek seni de zorba durumuna dÃ¼ÅŸÃ¼rebilir ve sorunu bÃ¼yÃ¼tÃ¼r. En iyi yol kanÄ±tlarÄ± toplayÄ±p (ekran gÃ¶rÃ¼ntÃ¼sÃ¼) durumu gÃ¼vendiÄŸin bir yetiÅŸkine veya okul yÃ¶netimine bildirmektir.';
        feedback.style.borderLeftColor = '#2ecc71';
    } else {
        feedback.innerHTML = '<strong style="color:#e74c3c;"><i class="fa-solid fa-xmark"></i> YanlÄ±ÅŸ Hamle!</strong><br>Ã–fkeyle karÅŸÄ±lÄ±k vermek veya kavgaya girmek tam da zorbanÄ±n istediÄŸi ÅŸeydir. Bu durum senin de suÃ§lu duruma dÃ¼ÅŸmene veya psikolojik olarak daha Ã§ok yÄ±pranmana neden olur. DoÄŸru hamle kanÄ±tlarÄ± toplayÄ±p yetiÅŸkinlerden yardÄ±m almaktÄ±r.';
        feedback.style.borderLeftColor = '#e74c3c';
    }
}

// Content Unlock
function unlockContent(id) {
    const container = document.getElementById(id);
    if (container) {
        const overlay = container.querySelector('.lock-overlay');
        const blurred = container.querySelector('.blurred-text');
        overlay.style.display = 'none';
        blurred.style.filter = 'none';
        blurred.style.pointerEvents = 'auto';
    }
}