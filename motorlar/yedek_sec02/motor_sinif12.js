// --- 12. SINIF SCRIPT VE API YOLLARI ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDZ3mW8pTOoDlv5ZoEbY1wrilIj9ojvnZT8Ofc_QZWp3PHKBCuNiRSsg9pnO-Jezoz6A/exec"; 
    const SIFRE_API_URL = "https://script.google.com/macros/s/AKfycbzH3YQxw_6r0i7uItFStlp2nkUzmxaPhUw_v1u8hs6swV6lqY9XXRZ3Q5x64C5vpPEROQ/exec"; 
    const ODEV_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcjHGzdFq96J7JD9YKJJE20DEUqQLgfdzilAci7kpUVS-lHMFM25a39zdvxeaOPhtgjw/exec"; 
    
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.onkeydown = function(e) { if(e.keyCode === 123 || (e.ctrlKey && e.keyCode === 85)) return false; };

    let ogrenci = {};
    let aktifTest = null;
    let suankiSorular = [];
    let timerInterval;
    let baslangicZamani;
    let flagged = {}; 
    let ihlalSayisi = 0;
    let autoSaveData = {};
    let aktifOda = null;
    let aktifMateryaller = [];
	
    const AKTIF_DUYURU_VERSIYONU = "duyuru_v1_12sinif"; // 12. sınıfa özel duyuru kimliği

    let fcCurrentIndex = 0;
    let fcAktifKartlar = [];
    let videoPlayer = null;

    /* --- YENİ HAMBURGER MENÜ VE REHBER JAVASCRIPT MOTORU --- */
    function menuToggle(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.toggle('active');
    }

    function rehberGoster() { 
        document.getElementById('rehberModal').style.display = 'block'; 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
    
    function rehberKapat() { document.getElementById('rehberModal').style.display = 'none'; }

    function cikisYap() {
        const dropdown = document.getElementById('hamburgerDropdown');
        if (dropdown) dropdown.classList.remove('active');

        const sayfaNo = window.location.pathname.match(/\d+/) ? window.location.pathname.match(/\d+/)[0] : "";
        const aktifVar = (sayfaNo && localStorage.getItem('aktifOgrenci' + sayfaNo)) ||
                         localStorage.getItem('globalZumreOturumu') ||
                         localStorage.getItem('aktifOgrenci') ||
                         localStorage.getItem('aktifOgrenci9') ||
                         localStorage.getItem('aktifOgrenci10') ||
                         localStorage.getItem('aktifOgrenci11') ||
                         localStorage.getItem('aktifOgrenci12') ||
                         (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad);

        if (!aktifVar) {
            alert("Henüz sisteme giriş yapmadınız.");
            return;
        }

        if (!confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
            return;
        }

        if (sayfaNo) {
            localStorage.removeItem('aktifOgrenci' + sayfaNo);
        }
        localStorage.removeItem('aktifOgrenci');
        localStorage.removeItem('aktifOgrenci9');
        localStorage.removeItem('aktifOgrenci10');
        localStorage.removeItem('aktifOgrenci11');
        localStorage.removeItem('aktifOgrenci12');
        localStorage.removeItem('globalZumreOturumu');
        localStorage.removeItem('sinavSession');
        localStorage.removeItem('sinavSession11');
        localStorage.removeItem('sinavSession12');
        localStorage.removeItem('tarih_portal_active_user');

        window.location.reload();
    }
    window.cikisYap = cikisYap;


    function enableDragScroll(slider) {
        let isDown = false; let startX; let scrollLeft;
        slider.addEventListener('mousedown', (e) => { isDown = true; slider.classList.add('active'); startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('active'); });
        slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - slider.offsetLeft; const walk = (x - startX) * 2; slider.scrollLeft = scrollLeft - walk; });
    }

    function scrollKonu(direction) {
        const container = document.getElementById('konuFiltreleri');
        if(container) { container.scrollLeft += direction * 200; }
    }

    function sekmeDegistir(hedef) {
        document.getElementById('btnTabTestler').classList.remove('active');
        document.getElementById('btnTabMateryaller').classList.remove('active');
        document.getElementById('tabTestler').classList.remove('active');
        document.getElementById('tabMateryaller').classList.remove('active');
        
        if(hedef === 'testler') {
            document.getElementById('btnTabTestler').classList.add('active');
            document.getElementById('tabTestler').classList.add('active');
        } else {
            document.getElementById('btnTabMateryaller').classList.add('active');
            document.getElementById('tabMateryaller').classList.add('active');
            if (typeof kategorilereDon === 'function') kategorilereDon();
        }
    }

    function baslatFlashcard(odaId) {
        if(typeof BILGI_KARTLARI === 'undefined' || !BILGI_KARTLARI[odaId] || BILGI_KARTLARI[odaId].length === 0) {
            alert("Öğretmeniniz bu üniteye henüz kavram kartı eklememiş.");
            return;
        }
        fcAktifKartlar = BILGI_KARTLARI[odaId];
        fcCurrentIndex = 0;
        document.getElementById('flashcardModal').style.display = 'block';
        gosterFlashcard();
    }

    function gosterFlashcard() {
        const kart = document.getElementById('flashcardElement');
        kart.classList.remove('is-flipped');
        
        setTimeout(() => {
            document.getElementById('fcTerm').innerText = fcAktifKartlar[fcCurrentIndex].terim;
            document.getElementById('fcDef').innerText = fcAktifKartlar[fcCurrentIndex].anlam;
            document.getElementById('fcCounter').innerText = (fcCurrentIndex + 1) + " / " + fcAktifKartlar.length;
        }, 150);
    }

    function fcCevir() { document.getElementById('flashcardElement').classList.toggle('is-flipped'); }
    function fcIleri() { if(fcCurrentIndex < fcAktifKartlar.length - 1) { fcCurrentIndex++; gosterFlashcard(); } }
    function fcGeri() { if(fcCurrentIndex > 0) { fcCurrentIndex--; gosterFlashcard(); } }
    function fcKapat() { document.getElementById('flashcardModal').style.display = 'none'; }

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { 
            const modals = document.querySelectorAll('.modal'); 
            modals.forEach(modal => { if (modal.style.display === 'block') { modal.style.display = 'none'; } }); 
            const fcModal = document.getElementById('flashcardModal');
            if (fcModal && fcModal.style.display === 'block') { fcModal.style.display = 'none'; }
            videoKapat(); 
        }
        if(document.getElementById('flashcardModal').style.display === 'block') {
            if(event.key === 'ArrowRight') fcIleri();
            if(event.key === 'ArrowLeft') fcGeri();
            if(event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); fcCevir(); }
        }
    });

    function youtubeIdCikar(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function oynatVideo(url, baslik, element) {
        if(url === "#") {
            alert("Öğretmeniniz bu video içeriğini henüz yüklemedi."); return;
        }
        
        const videoId = youtubeIdCikar(url);
        if (!videoId) {
            alert("Geçerli bir YouTube linki bulunamadı. Lütfen öğretmeninize bildirin.");
            return;
        }

        const inlineContainer = document.getElementById('inlineVideoContainer');
        
        if (inlineContainer.previousElementSibling === element && !inlineContainer.classList.contains('hidden')) {
            videoKapat();
            return;
        }

        document.getElementById('inlineVideoBaslik').innerText = baslik;
        element.parentNode.insertBefore(inlineContainer, element.nextSibling);
        inlineContainer.classList.remove('hidden');

        if (!videoPlayer) {
            const iframe = document.getElementById('youtubeIframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?origin=https://plyr.io&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
            
            videoPlayer = new Plyr('#player', {
                youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
            });
        } else {
            videoPlayer.source = {
                type: 'video',
                sources: [
                    { src: videoId, provider: 'youtube' }
                ]
            };
        }
        
        setTimeout(() => { inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }

    function videoKapat() {
        const inlineContainer = document.getElementById('inlineVideoContainer');
        if (inlineContainer) {
            inlineContainer.classList.add('hidden');
            if (videoPlayer) { videoPlayer.stop(); }
            document.body.appendChild(inlineContainer); 
        }
    }

    function oynatPdf(url, baslik, element) {
        if(url === "#") { alert("Öğretmeniniz bu dokümanı henüz yüklemedi."); return; }

        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (inlineContainer.previousElementSibling === element && !inlineContainer.classList.contains('hidden')) {
            pdfKapat(); return;
        }

        document.getElementById('inlinePdfBaslik').innerText = baslik;
        element.parentNode.insertBefore(inlineContainer, element.nextSibling);
        inlineContainer.classList.remove('hidden');

        let isleyiciUrl = url;
        if (!url.includes('drive.google.com')) {
            let temiz = url; try { temiz = decodeURI(url); } catch(e){} isleyiciUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(temiz) + '&embedded=true';
        }

        document.getElementById('pdfIframe').src = isleyiciUrl;
        setTimeout(() => { inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }

    function pdfKapat() {
        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (inlineContainer) {
            inlineContainer.classList.add('hidden');
            document.getElementById('pdfIframe').src = ""; 
            document.body.appendChild(inlineContainer); 
        }
    }

    /* --- 12. SINIF MATERYAL HAVUZU --- */
    function materyalleriYukle(uniteId) {
        aktifMateryaller = [];
        
        if (uniteId === 'u1') {
            aktifMateryaller = [
                { baslik: "Trablusgarp ve Balkan Savaşları", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "I. Dünya Savaşı ve Çanakkale", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Mondros Ateşkes Antlaşması", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Cemiyetler ve Hazırlıklar", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "1. Ünite Ders Notu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "I. Dünya Savaşı Cepheler Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u2') {
            aktifMateryaller = [
                { baslik: "Genelgeler ve Kongreler", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "TBMM'nin Açılışı", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Kurtuluş Savaşı Cepheleri", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Mudanya ve Lozan Barış Antlaşması", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "2. Ünite Ders Notu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Milli Mücadele Cepheleri Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        } else if (uniteId === 'u3') {
            aktifMateryaller = [
                { baslik: "Atatürk İlkeleri", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Siyasi ve Hukuki Alanda İnkılaplar", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Eğitim ve Kültür Alanında İnkılaplar", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Atatürk Dönemi Türk Dış Politikası", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "3. Ünite Ders Notu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "#" },
                { baslik: "Atatürk İnkılapları Kavram Haritası", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2ecc71", link: "#" }
            ];
        }
    }

    function kategoriSec(hedefTur) {
        document.getElementById('materyalKategorileri').classList.add('hidden');
        document.getElementById('materyalListesiAlani').classList.remove('hidden');
        
        const matAlani = document.getElementById('odaMateryalleri');
        matAlani.innerHTML = '';
        
        let filtrelenmis = aktifMateryaller.filter(m => {
            if (hedefTur === 'Video') return m.tur === 'Video Ders' || m.tur === 'Belgesel';
            return m.tur === hedefTur;
        });

        if(filtrelenmis.length === 0) {
            matAlani.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:20px; opacity:0.6; font-weight: bold;">Bu kategoride henüz materyal bulunmamaktadır.</div>';
            return;
        }

        filtrelenmis.forEach(m => {
            if (m.tur === 'Podcast') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatPodcast('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}')">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else if (m.tur === 'Video Ders' || m.tur === 'Belgesel') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatVideo('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else if (m.tur === 'PDF Not' || m.tur === 'Sunu') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="oynatPdf('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>
                `;
            } else {
                matAlani.innerHTML += `
                    <a href="${m.link}" target="_blank" class="mat-card">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </a>
                `;
            }
        });
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function kategorilereDon() {
        document.getElementById('materyalKategorileri').classList.remove('hidden');
        document.getElementById('materyalListesiAlani').classList.add('hidden');
        const aramaInput = document.getElementById('materyalArama');
        if(aramaInput) { aramaInput.value = ""; document.getElementById('matAramaTemizle').style.display = 'none'; }
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function materyalAra() {
        const input = document.getElementById('materyalArama');
        const clearBtn = document.getElementById('matAramaTemizle');
        const filter = input.value.toLocaleLowerCase('tr-TR').trim();
        const matAlani = document.getElementById('odaMateryalleri');
        
        if (filter.length > 0) { 
            clearBtn.style.display = 'flex'; 
            document.getElementById('materyalKategorileri').classList.add('hidden');
            document.getElementById('materyalListesiAlani').classList.remove('hidden');
            
            let filtrelenmis = aktifMateryaller.filter(m => m.baslik.toLocaleLowerCase('tr-TR').includes(filter));
            matAlani.innerHTML = '';
            
            if(filtrelenmis.length === 0) {
                matAlani.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:20px; opacity:0.6; font-weight: bold;">Aradığınız kritere uygun materyal bulunamadı.</div>';
                return;
            }

            filtrelenmis.forEach(m => {
                if (m.tur === 'Podcast') {
                    matAlani.innerHTML += `<div class="mat-card" style="cursor:pointer;" onclick="oynatPodcast('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}')">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>`;
                } else if (m.tur === 'Video Ders' || m.tur === 'Belgesel') {
                    matAlani.innerHTML += `<div class="mat-card" style="cursor:pointer;" onclick="oynatVideo('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>`;
                } else if (m.tur === 'PDF Not' || m.tur === 'Sunu') {
                    matAlani.innerHTML += `<div class="mat-card" style="cursor:pointer;" onclick="oynatPdf('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </div>`;
                } else {
                    matAlani.innerHTML += `<a href="${m.link}" target="_blank" class="mat-card">
                        <div class="mat-icon" style="color: ${m.renk};"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="mat-info">
                            <span class="mat-title">${m.baslik}</span>
                            <span class="mat-type">${m.tur}</span>
                        </div>
                    </a>`;
                }
            });
        } else { 
            clearBtn.style.display = 'none'; 
            kategorilereDon();
        }
    }

    function matAramaTemizleBtn() {
        const input = document.getElementById('materyalArama');
        input.value = "";
        materyalAra();
        input.focus();
    }
	function oynatPodcast(link, baslik) {
        if(link === "#") { alert("Öğretmeniniz bu podcast içeriğini henüz yüklemedi."); return; }
        
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const playerTitle = document.getElementById('playerTitle');
        const floatingBtn = document.getElementById('iletisimBtnFloating');
        const playBtn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        playerTitle.innerText = baslik;
        playerAudio.src = link;
        playerContainer.classList.add('active');
        
        playerAudio.play().then(() => {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            iconBox.classList.add('playing');
        }).catch(e => {
            playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            iconBox.classList.remove('playing');
        });
        
        if (floatingBtn) floatingBtn.style.bottom = window.innerWidth <= 768 ? '155px' : '135px';
    }

    function kapatPlayer() {
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const floatingBtn = document.getElementById('iletisimBtnFloating');
        const iconBox = document.getElementById('podcastIconBox');
        const playBtn = document.getElementById('playPauseBtn');
        
        playerAudio.pause();
        playerAudio.src = "";
        playerContainer.classList.remove('active');
        iconBox.classList.remove('playing');
        playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        
        if (floatingBtn) floatingBtn.style.bottom = '25px';
    }

    function togglePlay() {
        const audio = document.getElementById('mainAudio');
        const btn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        if (audio.paused) {
            audio.play();
            btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            iconBox.classList.add('playing');
        } else {
            audio.pause();
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            iconBox.classList.remove('playing');
        }
    }

    function skipAudio(seconds) {
        const audio = document.getElementById('mainAudio');
        audio.currentTime += seconds;
    }

    function updateProgress() {
        const audio = document.getElementById('mainAudio');
        const fill = document.getElementById('progressBarFill');
        const currentDisplay = document.getElementById('currentTimeDisplay');
        
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            fill.style.width = percent + '%';
            currentDisplay.innerText = formatTime(audio.currentTime);
        }
    }

    function setDuration() {
        const audio = document.getElementById('mainAudio');
        const durationDisplay = document.getElementById('durationDisplay');
        if(audio.duration) durationDisplay.innerText = formatTime(audio.duration);
    }

    function seekAudio(event) {
        const audio = document.getElementById('mainAudio');
        const bar = document.getElementById('progressBarBg');
        const clickX = event.clientX - bar.getBoundingClientRect().left;
        if(audio.duration) audio.currentTime = (clickX / bar.getBoundingClientRect().width) * audio.duration;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60); const sec = Math.floor(seconds % 60);
        return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function audioEnded() {
        document.getElementById('playPauseBtn').innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        document.getElementById('podcastIconBox').classList.remove('playing');
        document.getElementById('progressBarFill').style.width = '0%';
        document.getElementById('currentTimeDisplay').innerText = '00:00';
    }

    function odayaGir(uniteId) {
        aktifOda = uniteId;
        document.getElementById('anaKlasorler').style.display = 'none';
        
        const introBox = document.querySelector('.intro-box');
        if(introBox) introBox.style.display = 'none';

        const oda = document.getElementById('sinavOdasi');
        const data = window.MENU_VERI ? window.MENU_VERI[uniteId] : null;
        
        if (!data) {
            alert("Sistem Hatası: Soru kataloğu yüklenemedi. Lütfen bağlantınızı kontrol ediniz.");
            salonaDon(); return;
        }

        document.getElementById('odaBasligi').innerText = data.baslik;

        sekmeDegistir('testler');
        materyalleriYukle(uniteId);

        const konular = new Set();
        data.testler.forEach(t => { if(!t.isKlasik && t.konu) konular.add(t.konu); });
        const hasKlasik = data.testler.some(t => t.isKlasik);

        const chipAlani = document.getElementById('konuFiltreleri');
        chipAlani.innerHTML = "<button class='konu-chip active' onclick=\"konuFiltrele('Tümü', this)\">Tümü</button>";
        
        konular.forEach(k => {
            const safeK = k.replace(/'/g, "\\'");
            chipAlani.innerHTML += "<button class='konu-chip' onclick=\"konuFiltrele('" + safeK + "', this)\">" + k + "</button>";
        });
        if (hasKlasik) {
            chipAlani.innerHTML += "<button class='konu-chip klasik' onclick=\"konuFiltrele('Klasik Sınavlar', this)\"><i class=\"fa-solid fa-pen-nib\"></i> Klasik Sınavlar</button>";
        }

        oda.classList.remove('hidden');
        enableDragScroll(chipAlani);
        konuFiltrele('Tümü', chipAlani.firstElementChild);
        
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function konuFiltrele(konuAdi, btnElement) {
        document.querySelectorAll('#konuFiltreleri .konu-chip').forEach(btn => btn.classList.remove('active'));
        if(btnElement) btnElement.classList.add('active');

        const aramaInput = document.getElementById('testArama');
        if(aramaInput) { aramaInput.value = ""; document.getElementById('aramaTemizle').style.display = 'none'; }

        const data = window.MENU_VERI[aktifOda];
        const testAlani = document.getElementById('odaTestleri');
        testAlani.innerHTML = '';

        const filtrelenmisTestler = data.testler.filter(t => {
            if (konuAdi === 'Tümü') return true;
            if (konuAdi === 'Klasik Sınavlar' && t.isKlasik) return true;
            return t.konu === konuAdi && !t.isKlasik;
        });

        if (filtrelenmisTestler.length === 0) {
            testAlani.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6; font-weight:bold;">Bu kritere uygun test bulunamadı.</div>';
        } else {
            // --- 12. SINIF İZOLE HAFIZA ---
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler12')) || [];
            
            filtrelenmisTestler.forEach(t => {
                const row = document.createElement('div');
                row.className = "test-item-row " + (t.isKlasik ? "klasik" : "");
                const icon = t.isKlasik ? '<i class="fa-solid fa-pen-to-square"></i>' : '<i class="fa-solid fa-file-signature"></i>';
                
                let solvedBadge = cozulenler.includes(t.id) ? '<span style="color:#27ae60; font-size:12px; font-weight:bold; margin-left:10px; padding:3px 8px; background:rgba(39,174,96,0.1); border-radius:8px;"><i class="fa-solid fa-check"></i> Çözüldü</span>' : '';

                let rHtml = "<div class='test-item-left'><div class='test-item-icon'>" + icon + "</div><div class='test-item-info'>";
                rHtml += "<span class='test-item-title'>" + t.baslik + solvedBadge + "</span><span class='test-item-meta'>" + t.aciklama + "</span></div></div>";
                rHtml += "<button class='test-item-start-btn' onclick=\"testSec('" + t.id + "')\">Başla ►</button>";
                row.innerHTML = rHtml;
                testAlani.appendChild(row);
            });
        }
    }

    function salonaDon() {
        document.getElementById('sinavOdasi').classList.add('hidden');
        aktifOda = null;
        document.getElementById('anaKlasorler').style.display = 'grid';
        const introBox = document.querySelector('.intro-box');
        if(introBox) introBox.style.display = 'flex';
    }

    window.onload = function() {
        // --- 12. SINIF İZOLE HAFIZA ---
        const kayitliTema = localStorage.getItem('tema12');
        const btnTema = document.getElementById('btnTema');
        
        if(kayitliTema !== null) { 
            document.body.className = kayitliTema;
            if(btnTema) {
                if(kayitliTema === 'dark-mode') btnTema.innerHTML = '<i class="fa-solid fa-scroll"></i>';
                else if(kayitliTema === 'sepia-mode') btnTema.innerHTML = '<i class="fa-solid fa-sun"></i>';
                else btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        } else {
            document.body.className = '';
            if(btnTema) btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('tema12', '');
        }
        
        if(localStorage.getItem('fontSize12')) {
            document.documentElement.style.setProperty('--font-size-base', localStorage.getItem('fontSize12') + 'px');
        }
        
// --- YENİ SSO (EVRENSEL GİRİŞ) KONTROLÜ ---
        const globalZumre = localStorage.getItem('globalZumreOturumu');
        const sayfaNo = window.location.pathname.match(/\d+/) ? window.location.pathname.match(/\d+/)[0] : "9";
        const kayitliOgrenci = localStorage.getItem('aktifOgrenci' + sayfaNo);
        
        if(globalZumre) {
            // Öğretmen daha önce herhangi bir sınıftan girmişse, direkt kapıları aç.
            ogrenci = JSON.parse(globalZumre);
            document.getElementById("girisEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
            const btnSozluk = document.getElementById("btnSozluk");
            if(btnSozluk) btnSozluk.classList.remove("hidden");
        
        const btnMuzik = document.getElementById("btnMuzik");
        if(btnMuzik) btnMuzik.classList.remove("hidden");
            const btnDuyuru = document.getElementById("btnDuyuru");
            if (btnDuyuru) { btnDuyuru.classList.remove("hidden"); if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); }
        } else if(kayitliOgrenci) {
            // Sadece bu sınıfa girmiş bir öğrenci varsa içeri al.
            ogrenci = JSON.parse(kayitliOgrenci);
            document.getElementById("girisEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
            const btnSozluk = document.getElementById("btnSozluk");
            if(btnSozluk) btnSozluk.classList.remove("hidden");
            const btnMuzik = document.getElementById("btnMuzik");
            if(btnMuzik) btnMuzik.classList.remove("hidden");
            const btnDuyuru = document.getElementById("btnDuyuru");
            if (btnDuyuru) { btnDuyuru.classList.remove("hidden"); if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); }
        }

        const savedSession = localStorage.getItem('sinavSession12');
        if (savedSession) {
            if(confirm("Yarım kalmış bir sınavınız var. Devam etmek ister misiniz?")) {
                restoreSession(JSON.parse(savedSession));
            } else {
                localStorage.removeItem('sinavSession12');
            }
        }
        
        window.onbeforeunload = function() {
            if (!document.getElementById("testEkrani").classList.contains("hidden")) {
                return "Sınavınız bitmedi. Çıkarsanız verileriniz kaybolabilir.";
            }
        };
    };

    function temaCycle() {
        const body = document.body;
        const btnTema = document.getElementById('btnTema');
        const isDark = body.classList.contains('dark-mode');
        const isSepia = body.classList.contains('sepia-mode');

        if (!isDark && !isSepia) {
            body.classList.add('dark-mode');
            localStorage.setItem('tema12', 'dark-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-scroll"></i>';
        } else if (isDark) {
            body.classList.remove('dark-mode');
            body.classList.add('sepia-mode');
            localStorage.setItem('tema12', 'sepia-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else if (isSepia) {
            body.classList.remove('sepia-mode');
            localStorage.setItem('tema12', '');
            btnTema.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }

    function fontDegistir(delta) {
        const htmlRoot = document.documentElement;
        let currentStyle = getComputedStyle(htmlRoot).getPropertyValue('--font-size-base').trim();
        let currentSize = parseInt(currentStyle) || 16; 
        let newSize = currentSize + delta;
        if(newSize >= 14 && newSize <= 24) {
            htmlRoot.style.setProperty('--font-size-base', newSize + 'px');
            localStorage.setItem('fontSize12', newSize);
        }
    }

function girisBasariliIslemleri(ogr) {
        // --- YENİ SSO (EVRENSEL GİRİŞ) MOTORU ---
        // Eğer giriş yapan bir öğretmense, onu evrensel "Zümre" hafızasına kaydet.
        if (ogr.ad.includes('(Zümre)') || ogr.ad.includes('(Öğretmen)')) {
            localStorage.setItem('globalZumreOturumu', JSON.stringify(ogr));
        } else {
            // Eğer öğrenciyse, sadece girdiği sınıfın yerel hafızasına kaydet.
            // Sınıf numarasını URL'den (sinif9.html vb.) otomatik olarak çekiyoruz.
            const sayfaNo = window.location.pathname.match(/\d+/) ? window.location.pathname.match(/\d+/)[0] : "9";
            localStorage.setItem('aktifOgrenci' + sayfaNo, JSON.stringify(ogr));
        }

        document.getElementById("girisEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        document.getElementById("kullaniciAdiSpan").innerText = ogr.ad;
        
        const btnSozluk = document.getElementById("btnSozluk");
        if(btnSozluk) btnSozluk.classList.remove("hidden");
        const btnMuzik = document.getElementById("btnMuzik");
        if(btnMuzik) btnMuzik.classList.remove("hidden");
        
        const btnDuyuru = document.getElementById("btnDuyuru");
        if (btnDuyuru) { 
            btnDuyuru.classList.remove("hidden"); 
            if(typeof duyuruRozetKontrol === 'function') duyuruRozetKontrol(); 
        }
    }

    function girisTuruDegistir(tur) {
        document.getElementById('btnOgrenciTab').classList.remove('active');
        document.getElementById('btnOgretmenTab').classList.remove('active');
        document.getElementById('ogrenciGirisFormu').classList.add('hidden');
        document.getElementById('ogretmenGirisFormu').classList.add('hidden');
        
        if(tur === 'ogrenci') {
            document.getElementById('btnOgrenciTab').classList.add('active');
            document.getElementById('ogrenciGirisFormu').classList.remove('hidden');
        } else {
            document.getElementById('btnOgretmenTab').classList.add('active');
            document.getElementById('ogretmenGirisFormu').classList.remove('hidden');
        }
    }

        // Güvenli Master Şifre Doğrulama (Tuzlanmış SHA-256)
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
        ascii += '\x80';
        while (ascii[l] % 64 - 56) ascii += '\x00';
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

function girisYap() {
        const ad = document.getElementById("adSoyad").value.trim();
        const sinif = document.getElementById("sinif").value;
        const numara = document.getElementById("numara").value.trim();
        const girilenSifre = document.getElementById("sifre").value.trim();
        
                if (ad.toLocaleLowerCase('tr-TR') === "murat mutlu") {
            const _SALT = "BogaziciTarih_2026_MuratMutlu_#Key!";
            const _HASH = "c2003bf55bd2f06c61066252eb2857111e32b5ba678d70d17316b290871103d6";
            if (_sha256(_SALT + girilenSifre) === _HASH) {
                ogrenci = { ad: "Murat Mutlu (Öğretmen)", sinif: sinif || "Master", no: numara || "Öğretmen" };
                girisBasariliIslemleri(ogrenci);
            } else { alert("Master şifresi hatalı!"); }
            return;
        }

        if (!ad || !sinif || !numara || !girilenSifre) { alert("Lütfen tüm alanları eksiksiz doldurunuz!"); return; }

        const loginBtn = document.querySelector(".btn-login");
        const eskiMetin = loginBtn.innerText;
        loginBtn.innerText = "Bağlanıyor...";
        loginBtn.disabled = true;

        fetch(SIFRE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ islem: "giris", sinif: sinif, ogrenciNo: numara, sifre: girilenSifre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.durum === "basarili") {
                const temizGirilenAd = ad.replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
                const temizTabloAd = data.adSoyad.replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
                
                if (temizGirilenAd !== temizTabloAd) {
                    alert("Girdiğiniz Ad Soyad sistemdekiyle uyuşmuyor. Lütfen kontrol ediniz.");
                } else {
                    ogrenci = { ad: data.adSoyad, sinif: data.sinif, no: numara };
                    girisBasariliIslemleri(ogrenci);
                }
            } else {
                alert(data.mesaj); 
            }
        })
        .catch(error => {
            alert("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
        })
        .finally(() => {
            loginBtn.innerText = eskiMetin;
            loginBtn.disabled = false;
        });
    }

    function ogretmenGirisYap() {
        const ad = document.getElementById("ogretmenAd").value.trim();
        const vipKodu = document.getElementById("vipKodu").value.trim();
        const sifre = document.getElementById("ogretmenSifre").value.trim();

        if (!ad || !sifre) { alert("Lütfen adınızı ve şifrenizi giriniz! (VIP kodu sadece ilk kayıtta zorunludur)"); return; }

        const loginBtn = document.getElementById("btnOgretmenLogin");
        const eskiMetin = loginBtn.innerHTML;
        loginBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Sisteme Giriliyor...";
        loginBtn.disabled = true;

        fetch(SIFRE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ islem: "ogretmen_kayit", adSoyad: ad, vipKodu: vipKodu, sifre: sifre })
        })
        .then(response => response.json())
        .then(data => {
            if (data.durum === "basarili") {
                ogrenci = { ad: data.adSoyad + " (Zümre)", sinif: data.sinif, no: data.no };
                girisBasariliIslemleri(ogrenci);
            } else {
                alert(data.mesaj); 
            }
        })
        .catch(error => {
            alert("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
        })
        .finally(() => {
            loginBtn.innerHTML = eskiMetin;
            loginBtn.disabled = false;
        });
    }

    function sozlukGoster() { document.getElementById('sozlukModal').style.display = 'block'; kavramAra(); document.getElementById('sozlukArama').focus(); }
    function sozlukKapat() { document.getElementById('sozlukModal').style.display = 'none'; document.getElementById('sozlukArama').value = ""; }
    
    function kavramAra() {
        const query = document.getElementById('sozlukArama').value.toLowerCase();
        const listeDiv = document.getElementById('kavramListesi');
        listeDiv.innerHTML = "";
        
        if (typeof KAVRAMLAR !== 'undefined') {
            KAVRAMLAR.forEach(k => {
                if(k.terim.toLowerCase().includes(query) || k.anlam.toLowerCase().includes(query)) {
                    listeDiv.innerHTML += "<div class='kavram-item'><span class='kavram-baslik'>" + k.terim + "</span><span style='opacity: 0.8;'>" + k.anlam + "</span></div>";
                }
            });
        }
        if(listeDiv.innerHTML === "") { listeDiv.innerHTML = "<div style='padding:15px; text-align:center; color:#e74c3c;'>Kavram bulunamadı.</div>"; }
    }

    function iletisimGoster() { document.getElementById('iletisimModal').style.display = 'block'; }
    function iletisimKapat() { document.getElementById('iletisimModal').style.display = 'none'; document.getElementById('ogrenciMesaji').value = ""; }
    
    function mesajGonder() {
        const mesaj = document.getElementById('ogrenciMesaji').value;
        if(mesaj.trim() === "") { alert("Lütfen bir mesaj yazınız."); return; }
        if(!ogrenci || !ogrenci.ad) { alert("Ana ekrandan giriş yapmalısınız."); return; }

        const btn = document.querySelectorAll('#iletisimModal .action-btn')[1];
        const eskiMetin = btn ? btn.innerText : "Gönder";
        if(btn) { btn.innerText = "Gönderiliyor..."; btn.disabled = true; }

        const data = { isim: ogrenci.ad, sinif: ogrenci.sinif, numara: ogrenci.no || "Belirtilmedi", puan: "İLETİŞİM/MESAJ", rapor: mesaj };
        fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) })
        .then(() => { alert("Mesajınız iletilmiştir."); iletisimKapat(); if(btn) { btn.innerText = eskiMetin; btn.disabled = false; } })
        .catch(e => { alert("Mesaj gönderilemedi."); if(btn) { btn.innerText = eskiMetin; btn.disabled = false; } });
    }

    function duyuruGoster() { 
        document.getElementById('duyuruModal').style.display = 'block'; 
        localStorage.setItem("okunanDuyuru12", AKTIF_DUYURU_VERSIYONU); 
        document.getElementById('duyuruRozeti').classList.add('hidden'); 
        const genelRozet = document.getElementById('duyuruRozetiGenel');
        if(genelRozet) genelRozet.classList.add('hidden'); 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }

    function duyuruRozetKontrol() {
        const okunan = localStorage.getItem("okunanDuyuru12");
        if (okunan !== AKTIF_DUYURU_VERSIYONU) {
            document.getElementById('duyuruRozeti').classList.remove('hidden'); 
            const genelRozet = document.getElementById('duyuruRozetiGenel');
            if(genelRozet) genelRozet.classList.remove('hidden'); 
        }
    }
    
    function duyuruKapat() { document.getElementById('duyuruModal').style.display = 'none'; }
    function odeveGit() { duyuruKapat(); testSec('test_u1_20_yuzyil_1'); }

    function testSec(testKodu) {
        aktifTest = testKodu;
        const isKlasik = testKodu.includes('klasik');
        const alan = document.getElementById("sorularAlani");
        alan.innerHTML = "";

        let hamSorular = (window.allTests && window.allTests[testKodu]) ? window.allTests[testKodu] : [];
        
        if (!hamSorular || hamSorular.length === 0) {
            alan.innerHTML = "<div style='padding:30px; text-align:center; border:2px dashed #e74c3c; border-radius:10px; background:#fadbd8;'><h3 style='color:#c0392b;'><i class=\"fa-solid fa-triangle-exclamation\"></i> Sorular Yüklenemedi!</h3><p style='color:#333; font-weight:bold;'>Sistem '" + testKodu + "' isimli test verisini bulamadı.</p><p style='font-size:14px; color:#555;'>Lütfen JS dosyanızın içindeki tanımlamanın (Örn: window.allTests['" + testKodu + "']) menü koduyla harfi harfine aynı olduğunu kontrol edin.</p></div>";
            document.getElementById("menuEkrani").classList.add("hidden");
            document.getElementById("testEkrani").classList.remove("hidden");
            document.getElementById("testBaslik").innerText = "Hata Sayfası";
            document.getElementById("sayac").innerText = "--:--";
            return; 
        }

        document.getElementById("menuEkrani").classList.add("hidden");
        document.getElementById("testEkrani").classList.remove("hidden");
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(e=>{});

        ihlalSayisi = 0;
        document.addEventListener("visibilitychange", ihlalTakip);

        let testAdi = isKlasik ? "Klasik Sınav (Açık Uçlu)" : "Çoktan Seçmeli Test";
        if (window.MENU_VERI && aktifOda) {
            const testData = window.MENU_VERI[aktifOda].testler.find(t => t.id === testKodu);
            if (testData) testAdi = testData.baslik;
        }
        document.getElementById("testBaslik").innerText = testAdi;

        sayacBaslat(isKlasik ? 40 * 60 : 30 * 60);

        flagged = {};
        autoSaveData = { cevaplar: {}, flagged: {}, ihlal: 0, testKodu: testKodu, ogrenci: ogrenci, startTime: Date.now() };

        if (isKlasik) {
            renderKlasik(alan, hamSorular);
        } else {
            suankiSorular = shuffle(JSON.parse(JSON.stringify(hamSorular))).map(s => {
                s.shuffledOptions = shuffle([...s.secenekler]); return s;
            });
            renderTest(alan);
        }
        updateProgress();
        saveToLocal();
    }

    function cleanText(text) { return text.replace(/^[A-E]\)\s*/, ''); }

    function renderTest(alan) {
        const map = document.getElementById("navMap");
        map.innerHTML = "";
        enableDragScroll(map); 
        
        suankiSorular.forEach((soru, index) => {
            const dot = document.createElement("div");
            dot.className = "nav-dot"; dot.innerText = index + 1; dot.id = "dot-" + index;
            dot.onclick = () => document.getElementById("soru-kart-" + index).scrollIntoView({behavior: "smooth"});
            map.appendChild(dot);

            const kart = document.createElement("div");
            kart.className = "question-card"; kart.id = "soru-kart-" + index;
            
            let qHtml = "<div class='question-header'>";
            let konuEtiketi = soru.robotKonu ? " <span style='font-size:13px; font-weight:600; color:var(--text-color); opacity:0.6; margin-left: 8px;'>[" + soru.robotKonu + "]</span>" : "";
            qHtml += "<span class='question-number'>Soru " + (index + 1) + konuEtiketi + "</span>";
            qHtml += "<button class='flag-btn' id='flag-" + index + "' onclick='bayrakKoy(" + index + ")'><i class=\"fa-solid fa-flag\"></i> Sonra Bak</button>";
            qHtml += "</div>";
            qHtml += "<div class='question-text'>" + soru.soru + "</div>";
            qHtml += "<div class='options'>";
            
            const labels = ["A", "B", "C", "D", "E"];
            soru.shuffledOptions.forEach((optText, i) => {
                const cleanOpt = cleanText(optText);
                const safeOpt = cleanOpt.replace(/'/g, "\\'");
                qHtml += "<label><input type='radio' name='soru" + index + "' value='" + safeOpt + "' onchange=\"cevapVerildi(" + index + ", '" + safeOpt + "')\"> <b>" + labels[i] + ")</b> " + cleanOpt + "</label>";
            });
            qHtml += "</div>";
            kart.innerHTML = qHtml;
            alan.appendChild(kart);
        });
    }

    function renderKlasik(alan, sourceSorular) {
        const map = document.getElementById("navMap");
        map.innerHTML = "";
        enableDragScroll(map); 

        sourceSorular.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "question-card";
            
            let cHtml = "<div class='question-text'>Soru " + (index+1) + ": " + item.soru + "</div>";
            cHtml += "<text" + "area id='klasikCevap" + index + "' oninput='cevapVerildi(" + index + ", this.value)' style='width:100%; height:140px;' placeholder='Cevabınızı buraya yazınız...'></text" + "area>";
            
            div.innerHTML = cHtml;
            alan.appendChild(div);
        });
    }

    function cevapVerildi(index, value) {
        autoSaveData.cevaplar[index] = value;
        if(!aktifTest.includes('klasik')) { document.getElementById("dot-" + index).classList.add("answered"); updateProgress(); }
        saveToLocal();
    }

    function bayrakKoy(index) {
        const btn = document.getElementById("flag-" + index);
        const dot = document.getElementById("dot-" + index);
        if (flagged[index]) {
            delete flagged[index]; delete autoSaveData.flagged[index];
            btn.classList.remove("active"); dot.classList.remove("flagged"); btn.innerHTML = '<i class="fa-solid fa-flag"></i> Sonra Bak';
        } else {
            flagged[index] = true; autoSaveData.flagged[index] = true;
            btn.classList.add("active"); dot.classList.add("flagged"); btn.innerHTML = '<i class="fa-solid fa-flag"></i> İşaretlendi';
        }
        saveToLocal();
    }

    function updateProgress() {
        if(!aktifTest || aktifTest.includes('klasik') || suankiSorular.length === 0) return;
        const answered = Object.keys(autoSaveData.cevaplar).length;
        document.getElementById("progress-bar").style.width = ((answered / suankiSorular.length) * 100) + "%";
    }

    function saveToLocal() {
        autoSaveData.ihlal = ihlalSayisi; localStorage.setItem('sinavSession12', JSON.stringify(autoSaveData));
    }

    function restoreSession(data) {
        document.getElementById("girisEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        ogrenci = data.ogrenci; document.getElementById("kullaniciAdiSpan").innerText = ogrenci.ad;
        document.getElementById("btnSozluk").classList.remove("hidden");
        if(document.getElementById("btnDuyuru")) document.getElementById("btnDuyuru").classList.remove("hidden");
    }

    function ihlalTakip() { if (!document.hidden) return; ihlalSayisi++; document.title = "⚠️ UYARI (" + ihlalSayisi + ") - Sekme Değiştirildi!"; saveToLocal(); }

    function sayacBaslat(saniye) {
        clearInterval(timerInterval); baslangicZamani = new Date(); let kalan = saniye;
        const display = document.getElementById("sayac");
        timerInterval = setInterval(() => {
            let dk = Math.floor(kalan / 60); let sn = kalan % 60;
            display.innerText = dk + ":" + (sn < 10 ? '0' : '') + sn;
            if (--kalan < 0) { clearInterval(timerInterval); alert("Süre doldu!"); testiBitir(true); }
        }, 1000);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
        return array;
    }

    function ozetGoster() {
        const isKlasik = aktifTest.includes('klasik');
        let sourceSorular = typeof window.allTests !== 'undefined' && window.allTests[aktifTest] ? window.allTests[aktifTest] : [];
        const toplam = isKlasik ? sourceSorular.length : suankiSorular.length;
        if(toplam === 0) { alert("Test boştur."); return; }
        
        const cevaplanan = Object.keys(autoSaveData.cevaplar).length;
        const bos = toplam - cevaplanan;
        const isaretli = Object.keys(flagged).length;

        let oHtml = "<div class='modal-stat'><i class=\"fa-solid fa-check\"></i> Cevaplanan: <b>" + cevaplanan + "</b></div>";
        oHtml += "<div class='modal-stat' style='color:" + (bos>0?'#e74c3c':'#27ae60') + "'><i class=\"fa-solid fa-triangle-exclamation\"></i> Boş Bırakılan: <b>" + bos + "</b></div>";
        oHtml += "<div class='modal-stat' style='color:#f39c12'><i class=\"fa-solid fa-flag\"></i> İşaretlenen: <b>" + isaretli + "</b></div>";
        oHtml += "<p style='margin-top: 20px; font-weight: 500;'>Sınavı bitirmek istediğinize emin misiniz?</p>";
        
        document.getElementById("modalIcerik").innerHTML = oHtml;
        document.getElementById("ozetModal").style.display = "block";
    }

    function modalKapat() { document.getElementById("ozetModal").style.display = "none"; }

    function testiBitir(otomatik = false) {
        modalKapat(); clearInterval(timerInterval);
        document.removeEventListener("visibilitychange", ihlalTakip);
        localStorage.removeItem('sinavSession12'); 

        /* --- 12. SINIF İZOLE HAFIZA (KAYIT) --- */
        if (aktifTest && !aktifTest.includes('robot_sinavi')) {
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler12')) || [];
            if (!cozulenler.includes(aktifTest)) {
                cozulenler.push(aktifTest);
                localStorage.setItem('cozulenTestler12', JSON.stringify(cozulenler));
            }
        }

        const bitisZamani = new Date();
        const gecenSureSn = Math.floor((bitisZamani - baslangicZamani) / 1000);
        const gecenSureStr = Math.floor(gecenSureSn / 60) + " dk " + (gecenSureSn % 60) + " sn";
        let raporMetni = ""; let puan = 0; let detayHtml = "";

        if (aktifTest.includes('klasik')) {
            raporMetni = "[KLASİK] ";
            detayHtml = "<h3 style='color:var(--text-color); border-bottom:2px solid var(--card-border); padding-bottom:15px; margin-bottom: 20px;'>Cevap Anahtarı</h3>";
            let sourceSorular = typeof window.allTests !== 'undefined' && window.allTests[aktifTest] ? window.allTests[aktifTest] : [];
            
            sourceSorular.forEach((item, index) => {
                const cvp = autoSaveData.cevaplar[index] || "";
                raporMetni += "S" + (index+1) + ": " + cvp.replace(/\n/g," ") + " || ";
                detayHtml += "<div class='explanation-card'><div style='font-weight:700; margin-bottom:10px; font-size:16px;'>Soru " + (index+1) + ": " + item.soru + "</div><div style='margin-bottom:15px; padding: 10px; background: rgba(230, 126, 34, 0.1); border-radius: 8px;'><span style='color:#e67e22; font-weight:800; display:block; margin-bottom:5px;'>Sizin Cevabınız:</span>" + (cvp || "<i>Boş bırakıldı</i>") + "</div><div style='background:rgba(39, 174, 96, 0.1); padding:15px; border-radius:8px;'><span style='color:#27ae60; font-weight:800; display:block; margin-bottom:5px;'>Beklenen Cevap:</span>" + item.cevap + "</div></div>";
            });

            puan = "DEĞERLENDİRİLECEK";
            document.getElementById("klasikMesaj").style.display = "block";
        } else {
            let dogruSayisi = 0; raporMetni = "[" + aktifTest.toUpperCase() + "] ";
            
            suankiSorular.forEach((soru, index) => {
                const secilen = autoSaveData.cevaplar[index] || "BOŞ";
                const dogruMetin = cleanText(soru.cevap);
                const isCorrect = (secilen === dogruMetin);
                
                if (isCorrect) {
                    dogruSayisi++;
                    detayHtml += "<div class='explanation-card correct'><div style='font-weight:800; font-size:16px; margin-bottom:8px; color:#27ae60;'>Soru " + (index+1) + " <i class=\"fa-solid fa-check\"></i></div><div style='margin-bottom:8px; font-weight: 500;'>" + soru.soru + "</div><div style='margin-bottom:8px;'>Sizin Cevabınız: <b>" + secilen + "</b></div><div style='opacity:0.9; font-size:14px;'><i>" + (soru.aciklama || "") + "</i></div></div>";
                } else {
                    detayHtml += "<div class='explanation-card wrong'><div style='font-weight:800; font-size:16px; margin-bottom:8px; color:#e74c3c;'>Soru " + (index+1) + " <i class=\"fa-solid fa-xmark\"></i></div><div style='margin-bottom:8px; font-weight: 500;'>" + soru.soru + "</div><div style='margin-bottom:4px; text-decoration: line-through; opacity: 0.8;'>Sizin Cevabınız: " + secilen + "</div><div style='margin-bottom:8px;'>Doğru Cevap: <b style='color:#e74c3c;'>" + dogruMetin + "</b></div><div style='opacity:0.9; font-size:14px;'><i>" + (soru.aciklama || "") + "</i></div></div>";
                    raporMetni += "S" + (index+1) + ":Y (" + secilen + ") | ";
                }
            });

            puan = Math.round((dogruSayisi / suankiSorular.length) * 100);
            raporMetni += " Doğru: " + dogruSayisi + "/" + suankiSorular.length;
            
            const msgBox = document.getElementById("ozelMotivasyonKutusu");
            if(puan < 50) { msgBox.innerHTML = "Daha fazla çalışmalısın. <i class=\"fa-solid fa-stop\"></i>"; msgBox.style.color = "#e74c3c"; msgBox.style.background = "rgba(231, 76, 60, 0.1)"; }
            else if(puan < 85) { msgBox.innerHTML = "İyi gidiyorsun, biraz daha gayret! <i class=\"fa-solid fa-thumbs-up\"></i>"; msgBox.style.color = "#f39c12"; msgBox.style.background = "rgba(243, 156, 18, 0.1)"; }
            else { msgBox.innerHTML = "Tebrikler! Harika bir sonuç. <i class=\"fa-solid fa-star\"></i>"; msgBox.style.color = "#27ae60"; msgBox.style.background = "rgba(39, 174, 96, 0.1)"; }
            
            document.getElementById("puanKutusu").style.display = "block";
            document.getElementById("puanGostergesi").innerText = puan + " Puan";
        }

        document.getElementById("testEkrani").classList.add("hidden");
        document.getElementById("sonucEkrani").classList.remove("hidden");
        document.getElementById("bitirmeSuresi").innerText = "Süre: " + gecenSureStr;
        document.getElementById("detayliCozumler").innerHTML = detayHtml;

        if(ihlalSayisi > 0) {
            document.getElementById("ihlalSayisi").innerHTML = "<i class=\"fa-solid fa-triangle-exclamation\"></i> " + ihlalSayisi + " kez sekme değiştirdiniz!";
            raporMetni += " [İHLAL: " + ihlalSayisi + "]";
        } else {
            document.getElementById("ihlalSayisi").innerHTML = "<i class=\"fa-solid fa-check\"></i> Sınav odağı korundu.";
            document.getElementById("ihlalSayisi").style.color = "#27ae60";
        }

        const data = { isim: ogrenci.ad, sinif: ogrenci.sinif, numara: ogrenci.no, puan: puan, rapor: "(Süre: " + gecenSureStr + ") " + raporMetni };
        fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).catch(e => console.log(e));
    }

    function anasayfayaDon() {
        document.getElementById("sonucEkrani").classList.add("hidden");
        document.getElementById("menuEkrani").classList.remove("hidden");
        if(typeof salonaDon === 'function') salonaDon();
        aktifTest = null; ihlalSayisi = 0;
        document.getElementById("puanKutusu").style.display = "none";
        document.getElementById("klasikMesaj").style.display = "none";
        window.scrollTo(0,0);
    }

    function testtenCik() {
        if(confirm("Testten çıkmak istediğinize emin misiniz? Kaydetmediğiniz ilerlemeler kaybolacaktır.")) {
            clearInterval(timerInterval); document.removeEventListener("visibilitychange", ihlalTakip);
            localStorage.removeItem('sinavSession12'); document.getElementById("testEkrani").classList.add("hidden");
            document.getElementById("menuEkrani").classList.remove("hidden");
            aktifTest = null; ihlalSayisi = 0; window.scrollTo(0,0);
        }
    }

    function testAra() {
        const input = document.getElementById('testArama');
        const clearBtn = document.getElementById('aramaTemizle');
        const filter = input.value.toLocaleLowerCase('tr-TR');
        const testItems = document.querySelectorAll('.test-item-row');
        
        if (filter.length > 0) { clearBtn.style.display = 'flex'; } 
        else { clearBtn.style.display = 'none'; }

        testItems.forEach(item => {
            const title = item.querySelector('.test-item-title').innerText.toLocaleLowerCase('tr-TR');
            const desc = item.querySelector('.test-item-meta').innerText.toLocaleLowerCase('tr-TR');
            if (title.includes(filter) || desc.includes(filter)) {
                item.style.display = ''; 
            } else {
                item.style.display = 'none';
            }
        });
    }

    function aramaTemizleBtn() {
        const input = document.getElementById('testArama');
        input.value = "";
        testAra();
        input.focus();
    }

    /* --- OTOMATİK SINAV ROBOTU JAVASCRIPT FONKSİYONLARI --- */
    function robotGoster() {
        if (typeof window.MENU_VERI === 'undefined') {
            alert("Sistem Hatası: Soru kataloğu yüklenemedi."); return;
        }
        const uniteSelect = document.getElementById('robotUnite');
        uniteSelect.innerHTML = '<option value="tumu">Tüm Ünitelerden Karma</option>';
        for (const [key, value] of Object.entries(window.MENU_VERI)) {
            uniteSelect.innerHTML += `<option value="${key}">${value.baslik}</option>`;
        }
        robotKonuGuncelle();
        document.getElementById('robotModal').style.display = 'block';
    }

    function robotKonuGuncelle() {
        const uniteSelect = document.getElementById('robotUnite').value;
        const konuSelect = document.getElementById('robotKonu');
        konuSelect.innerHTML = '<option value="tumu">Tüm Konulardan Karma</option>';

        let konular = new Set();
        if (uniteSelect === 'tumu') {
            for (const key in window.MENU_VERI) {
                window.MENU_VERI[key].testler.forEach(t => {
                    if (!t.isKlasik && t.konu) konular.add(t.konu);
                });
            }
        } else {
            window.MENU_VERI[uniteSelect].testler.forEach(t => {
                if (!t.isKlasik && t.konu) konular.add(t.konu);
            });
        }

        konular.forEach(k => {
            const safeK = k.replace(/'/g, "\\'");
            konuSelect.innerHTML += `<option value="${safeK}">${k}</option>`;
        });
    }

    function robotKapat() { document.getElementById('robotModal').style.display = 'none'; }

    function robotSinavBaslat() {
        const unite = document.getElementById('robotUnite').value;
        const konu = document.getElementById('robotKonu').value;
        const sayi = parseInt(document.getElementById('robotSoruSayisi').value);

        let testIdHavuzu = [];

        for (const [key, data] of Object.entries(window.MENU_VERI)) {
            if (unite !== 'tumu' && key !== unite) continue;

            data.testler.forEach(t => {
                if (t.isKlasik) return; 
                if (konu !== 'tumu' && t.konu !== konu) return;
                testIdHavuzu.push({id: t.id, konu: t.konu});
            });
        }

        let soruHavuzu = [];
        testIdHavuzu.forEach(tItem => {
            if (window.allTests && window.allTests[tItem.id]) {
                let testSorulari = JSON.parse(JSON.stringify(window.allTests[tItem.id]));
                testSorulari.forEach(s => s.robotKonu = tItem.konu);
                soruHavuzu = soruHavuzu.concat(testSorulari);
            }
        });

        if (soruHavuzu.length === 0) {
            alert("Seçtiğiniz kriterlere uygun soru bulunamadı. Lütfen başka bir ünite/konu seçiniz.");
            return;
        }

        soruHavuzu = shuffle(soruHavuzu);
        let secilenSorular = soruHavuzu.slice(0, sayi);

        if(typeof window.allTests === 'undefined') window.allTests = {};
        window.allTests["robot_sinavi"] = secilenSorular;

        robotKapat();
        aktifOda = null; 
        testSec("robot_sinavi");
        
        document.getElementById("testBaslik").innerHTML = '<i class="fa-solid fa-robot"></i> Özel Karma Sınav (' + secilenSorular.length + ' Soru)';
    }

    /* --- YEDEKLEME (LOCAL STORAGE) FONKSİYONLARI --- */
    function yedekleGoster() { 
        document.getElementById('yedekModal').style.display = 'block'; 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
    
    function yedekleKapat() { document.getElementById('yedekModal').style.display = 'none'; }

    function verileriIndir() {
        const data = {
            aktifOgrenci: localStorage.getItem('aktifOgrenci12'),
            cozulenTestler: localStorage.getItem('cozulenTestler12'),
            tema: localStorage.getItem('tema12'),
            fontSize: localStorage.getItem('fontSize12')
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = "Tarih_Portali_Yedek_12.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function veriYukle(event) {
        const file = event.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if(data.aktifOgrenci) localStorage.setItem('aktifOgrenci12', data.aktifOgrenci);
                if(data.cozulenTestler) localStorage.setItem('cozulenTestler12', data.cozulenTestler);
                if(data.tema) localStorage.setItem('tema12', data.tema);
                if(data.fontSize) localStorage.setItem('fontSize12', data.fontSize);
                alert("Veriler başarıyla yüklendi! Sayfa yenileniyor.");
                location.reload();
            } catch (err) {
                alert("Hata: Geçersiz yedek dosyası!");
            }
        };
        reader.readAsText(file);
    }

    const sifreModal = document.getElementById("sifreModal");
    const sifreBtn = document.getElementById("sifreDegistirBtn");
    const sifreKaydetBtn = document.getElementById("sifreKaydetBtn");
    const sifreMesajDiv = document.getElementById("sifreMesaj");

    if(sifreBtn) {
        sifreBtn.onclick = function() { 
            sifreModal.style.display = "block"; 
            sifreMesajDiv.innerHTML = ""; 
            const dropdown = document.getElementById('hamburgerDropdown');
            if(dropdown) dropdown.classList.remove('active');
        };
    }

    function sifreKapat() {
        sifreModal.style.display = "none";
        document.getElementById("eskiSifre").value = "";
        document.getElementById("yeniSifre").value = "";
    }

    if(sifreKaydetBtn) {
        sifreKaydetBtn.onclick = function() {
            const no = ogrenci.no;
            const eski = document.getElementById("eskiSifre").value.trim();
            const yeni = document.getElementById("yeniSifre").value.trim();

            if(!eski || !yeni) {
                sifreMesajDiv.innerHTML = "Lütfen eski ve yeni şifrenizi girin.";
                sifreMesajDiv.style.color = "#e74c3c";
                return;
            }

            sifreKaydetBtn.innerText = "Güncelleniyor...";
            sifreKaydetBtn.disabled = true;

            fetch(SIFRE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ islem: "sifre_degistir", ogrenciNo: no, eskiSifre: eski, yeniSifre: yeni })
            })
            .then(response => response.json())
            .then(data => {
                if(data.durum === "basarili") {
                    sifreMesajDiv.innerHTML = data.mesaj;
                    sifreMesajDiv.style.color = "#27ae60";
                    document.getElementById("eskiSifre").value = "";
                    document.getElementById("yeniSifre").value = "";
                } else {
                    sifreMesajDiv.innerHTML = data.mesaj;
                    sifreMesajDiv.style.color = "#e74c3c";
                }
            })
            .catch(error => {
                sifreMesajDiv.innerHTML = "Bağlantı hatası. Lütfen tekrar deneyin.";
                sifreMesajDiv.style.color = "#e74c3c";
            })
            .finally(() => {
                sifreKaydetBtn.innerText = "Şifreyi Güncelle";
                sifreKaydetBtn.disabled = false;
            });
        };
    }
    
    let odevKuyrugu = [];
    let suAnkiYuklemeIndeksi = 0;
    let yuklemeId = "";
    
    function odevGoster() {
        if(!ogrenci || !ogrenci.ad) { alert("Lütfen önce ana ekrandan giriş yapın."); return; }
        document.getElementById('odevModal').style.display = 'block';
        odevKuyrugu = [];
        document.getElementById('secilenDosyalarListesi').innerHTML = "";
        document.getElementById('odevGonderBtn').disabled = true;
        document.getElementById('yuklemeBariBg').style.display = 'none';
        document.getElementById('genelYuklemeDurumu').style.display = 'none';
        document.getElementById('dosyaSecici').value = "";
    }

    function odevKapat() { document.getElementById('odevModal').style.display = 'none'; }

    function dosyalariHazirla(event) {
        const files = event.target.files;
        if(files.length === 0) return;
        if(files.length > 10) { alert("Tek seferde en fazla 10 dosya seçebilirsiniz."); return; }
        
        odevKuyrugu = Array.from(files);
        const listeDiv = document.getElementById('secilenDosyalarListesi');
        listeDiv.innerHTML = "";
        
        odevKuyrugu.forEach((file, index) => {
            listeDiv.innerHTML += `<div class="file-item" id="fileItem-${index}">
                <span><i class="${file.type.includes('pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-image'}"></i> ${file.name.substring(0,20)}...</span>
                <span class="status waiting" id="fileStatus-${index}">Bekliyor</span>
            </div>`;
        });
        
        document.getElementById('odevGonderBtn').disabled = false;
    }

    async function odevleriGonder() {
        if(odevKuyrugu.length === 0) return;
        
        document.getElementById('odevGonderBtn').disabled = true;
        document.getElementById('odevIptalBtn').disabled = true;
        document.getElementById('yuklemeBariBg').style.display = 'block';
        document.getElementById('genelYuklemeDurumu').style.display = 'block';
        
        yuklemeId = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        suAnkiYuklemeIndeksi = 0;
        
        kuyruguIsle();
    }

    async function kuyruguIsle() {
        if (suAnkiYuklemeIndeksi >= odevKuyrugu.length) {
            document.getElementById('genelYuklemeDurumu').innerText = "Tüm dosyalar başarıyla yüklendi!";
            document.getElementById('odevIptalBtn').innerText = "Kapat";
            document.getElementById('odevIptalBtn').disabled = false;
            alert("Ödevleriniz başarıyla öğretmeninize iletildi!");
            return;
        }
        
        let i = suAnkiYuklemeIndeksi;
        let file = odevKuyrugu[i];
        
        document.getElementById(`fileStatus-${i}`).innerText = "Yükleniyor...";
        document.getElementById(`fileStatus-${i}`).className = "status uploading";
        document.getElementById('genelYuklemeDurumu').innerText = `${i + 1} / ${odevKuyrugu.length} Yükleniyor...`;
        document.getElementById('yuklemeBariFill').style.width = ((i) / odevKuyrugu.length * 100) + "%";

        try {
            let base64Data = "";
            if (file.type.startsWith('image/')) {
                base64Data = await resimSikistirVeBase64Yap(file); 
            } else {
                base64Data = await fileToBase64(file);
            }
            
            const payload = {
                islem: "odev_yukle",
                ad: ogrenci.ad,
                no: ogrenci.no,
                sinif: ogrenci.sinif,
                dosyaAdi: file.name,
                mimeType: file.type,
                base64Data: base64Data.split("base64,")[1],
                yuklemeId: yuklemeId
            };

            await fetch(ODEV_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            document.getElementById(`fileStatus-${i}`).innerText = "Başarılı";
            document.getElementById(`fileStatus-${i}`).className = "status success";
            
        } catch (error) {
            console.error(error);
            document.getElementById(`fileStatus-${i}`).innerText = "Hata!";
            document.getElementById(`fileStatus-${i}`).className = "status error";
        }

        suAnkiYuklemeIndeksi++;
        document.getElementById('yuklemeBariFill').style.width = ((suAnkiYuklemeIndeksi) / odevKuyrugu.length * 100) + "%";
        
        setTimeout(kuyruguIsle, 1000); 
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function resimSikistirVeBase64Yap(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(file.type, 0.7)); 
                };
            };
        });
    }

    window.addEventListener('click', function(event) { 
        if (event.target.classList.contains('modal')) { 
            event.target.style.display = 'none'; 
        } 
        
        /* --- YENİ EKLENEN: MENÜ DIŞINA TIKLANINCA MENÜYÜ KAPATMA MOTORU --- */
        const dropdown = document.getElementById('hamburgerDropdown');
        if (dropdown && dropdown.classList.contains('active') && !event.target.closest('.dropdown-menu-container')) {
            dropdown.classList.remove('active');
        }
    });