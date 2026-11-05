// --- 10. SINIF SCRIPT VE API YOLLARI ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwSSZmA83naSrT4Smwgxnhpa9YIMFXfjP2ufQI8WS2q0NrvDULuBa2a-DiyQsNBSAZK7Q/exec"; 
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
	
    const AKTIF_DUYURU_VERSIYONU = "duyuru_v2_10sinif"; // 10. sınıfa özel duyuru versiyonu

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
            modals.forEach(modal => { 
                if (modal.style.display === 'block') { 
                    modal.style.display = 'none'; 
                    if(modal.id === 'haritaModal') haritaKapat(); // HARİTA BELLEĞİNİ TEMİZLER
                } 
            }); 
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

// --- YENİ PDF.JS MOTORU DEĞİŞKENLERİ VE FONKSİYONLARI ---
    let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, pdfScale = 1.2, pdfCanvas = null, pdfCtx = null;

    function renderPdfPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            let viewport = page.getViewport({scale: pdfScale});
            const renderArea = document.getElementById('pdfRenderArea');
            
            // Mobilde ekrana sığdırmak için akıllı ölçekleme
            if(renderArea && renderArea.clientWidth < viewport.width) {
                pdfScale = (renderArea.clientWidth - 40) / (viewport.width / pdfScale);
                viewport = page.getViewport({scale: pdfScale});
            }

            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;

            let renderContext = { canvasContext: pdfCtx, viewport: viewport };
            let renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) { renderPdfPage(pageNumPending); pageNumPending = null; }
            });
        });
        document.getElementById('pdfPageInfo').textContent = num + ' / ' + pdfDoc.numPages;
    }

    function queueRenderPage(num) {
        if (pageRendering) { pageNumPending = num; } else { renderPdfPage(num); }
    }

    function onPdfPrev() { if (pageNum <= 1) return; pageNum--; queueRenderPage(pageNum); }
    function onPdfNext() { if (pageNum >= pdfDoc.numPages) return; pageNum++; queueRenderPage(pageNum); }
    function onPdfZoomIn() { pdfScale += 0.2; queueRenderPage(pageNum); }
    function onPdfZoomOut() { if (pdfScale <= 0.6) return; pdfScale -= 0.2; queueRenderPage(pageNum); }

        function pdfUrlTemizle(hamUrl) {
        if (!hamUrl || typeof hamUrl !== 'string') return hamUrl;
        try { return decodeURI(hamUrl); } catch (e) {
            try { return decodeURIComponent(hamUrl); } catch (e2) { return hamUrl; }
        }
    }

    function googleViewerUrlUret(hamUrl) {
        const temiz = pdfUrlTemizle(hamUrl);
        return 'https://docs.google.com/viewer?url=' + encodeURIComponent(temiz) + '&embedded=true';
    }

    function oynatPdf(url, baslik, element) {
        if(url === "#" || !url) { alert("Öğretmeniniz bu dokümanı henüz yüklemedi."); return; }

        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (element && inlineContainer.previousElementSibling === element && !inlineContainer.classList.contains('hidden')) {
            pdfKapat(); return;
        }

        document.getElementById('inlinePdfBaslik').innerText = baslik;
        
        // İndirme ve Yeni Sekmede Açma linklerini güncelle
        const dlBtn = document.getElementById('pdfDownloadBtn');
        if (dlBtn) dlBtn.href = url;
        const newTabBtn = document.getElementById('pdfNewTabBtn');
        if (newTabBtn) newTabBtn.href = url;
        
        if (element && element.parentNode) {
            element.parentNode.insertBefore(inlineContainer, element.nextSibling);
        } else {
            const odaMat = document.getElementById('odaMateryalleri');
            if (odaMat) odaMat.prepend(inlineContainer);
        }
        inlineContainer.classList.remove('hidden');

        const renderArea = document.getElementById('pdfRenderArea');
        renderArea.style.padding = '0';
        renderArea.style.background = '#ffffff';
        renderArea.style.minHeight = '72vh';

        // Şık Yükleniyor Göstergesi
        renderArea.innerHTML = `
            <div id="pdfLoadingSpinner" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; min-height:520px; background:#181818; color:var(--accent-color);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size:36px; margin-bottom:14px; color:#f1c40f;"></i>
                <span style="font-size:15px; font-weight:700; color:#fff;">Ders Dokümanı Yükleniyor...</span>
                <span style="font-size:12px; color:rgba(255,255,255,0.7); margin-top:6px;">Lütfen bekleyiniz</span>
            </div>
        `;
        document.getElementById('pdfPageInfo').textContent = "Yükleniyor...";

        // 1. AŞAMA: Dosyayı PDF.js ile açmayı dene (R2 CORS izni varsa anında yerel çizilir)
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.getDocument({ url: url, withCredentials: false }).promise.then(function(pdfDoc_) {
                pdfDoc = pdfDoc_;
                pageNum = 1;
                pdfScale = 1.2;
                renderArea.style.padding = '20px 0';
                renderArea.style.background = 'rgba(0,0,0,0.1)';
                renderArea.innerHTML = '<canvas id="pdfCanvas" style="box-shadow: 0 4px 15px rgba(0,0,0,0.3); max-width: 100%; height: auto;"></canvas>';
                pdfCanvas = document.getElementById('pdfCanvas');
                pdfCtx = pdfCanvas.getContext('2d');
                renderPdfPage(pageNum);
                document.querySelectorAll('#inlinePdfContainer .pdf-js-ctrl').forEach(b => b.style.display = 'flex');
            }).catch(function(error) {
                console.warn("PDF.js CORS veya ağ engeli. Google Viewer motoruna geçiliyor...", error);
                googleViewerYukle(url);
            });
        } else {
            googleViewerYukle(url);
        }

        setTimeout(() => { inlineContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    }

    function googleViewerYukle(url) {
        const renderArea = document.getElementById('pdfRenderArea');
        document.querySelectorAll('#inlinePdfContainer .pdf-js-ctrl').forEach(b => b.style.display = 'none');
        
        const pageInfo = document.getElementById('pdfPageInfo');
        if (pageInfo) pageInfo.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Döküman';

        let isleyiciUrl = url;
        if (!url.includes('drive.google.com')) {
            isleyiciUrl = googleViewerUrlUret(url);
        }

        renderArea.style.padding = '0';
        renderArea.style.background = '#ffffff';

        const iframe = document.createElement('iframe');
        iframe.id = 'pdfIframeEl';
        iframe.src = isleyiciUrl;
        iframe.style.cssText = 'width: 100%; height: 75vh; min-height: 520px; border: none; display: none; background: #ffffff;';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('loading', 'lazy');

        iframe.onload = function() {
            const spinner = document.getElementById('pdfLoadingSpinner');
            if (spinner) spinner.remove();
            iframe.style.display = 'block';
        };

        // Zaman aşımı durumunda (bazı mobil tarayıcılarda onload tetiklenmezse) iframe'i göster
        setTimeout(() => {
            const spinner = document.getElementById('pdfLoadingSpinner');
            if (spinner) spinner.remove();
            iframe.style.display = 'block';
        }, 3200);

        renderArea.appendChild(iframe);
    }

    function pdfKapat() {
        const inlineContainer = document.getElementById('inlinePdfContainer');
        if (inlineContainer) {
            inlineContainer.classList.add('hidden');
            pdfDoc = null;
            const renderArea = document.getElementById('pdfRenderArea');
            if (renderArea) {
                renderArea.innerHTML = '';
                renderArea.style.padding = '';
                renderArea.style.background = '';
            }
            document.body.appendChild(inlineContainer); 
        }
    }

    /* --- 10. SINIF MATERYAL HAVUZU --- */
    function materyalleriYukle(uniteId) {
        aktifMateryaller = [];
        
        if (uniteId === 'u1') {
            aktifMateryaller = [
                { baslik: "Önemli Askerî Mücadelelerin Türk Tarihinin Seyrine Etkileri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/LkgkKMMB7OQ" },
				{ baslik: "Anadolu'nun Yurt Edinilmesi", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/9lxHiVbRNcc" },
                { baslik: "Malazgirt, Miryakefalon ve Haçlı Seferleri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/Tw6ndazF9RQ" },
				{ baslik: "Kösedağ Savaşı: Bir İmparatorluğun Çöküşü", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/xbOBIA2A1ys" },
				{ baslik: "Türkistan'dan Türkiye'ye Türklerde Devlet ve Ordu Teşkilatları", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/bNQ6hYPgwUA" },
				{ baslik: "Türklerde Sosyoekonomik Hayat ve Şehirleşme", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/6xuHYfCp2OM" },
				{ baslik: "Türklerde Toplumsal Yapı ve Sınıflar", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/B9bDdpm9YZM" },
				{ baslik: "Eğitim, Mimari ve Sanat", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/JgizPqZsA2c" },
				{ baslik: "Türk İslam Alimleri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/NETnbP_aNuM" },
                { baslik: "Anadolu'nun Türkleşmesi", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Büyük Selçuklu Devleti", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Oğuz Göçleri ve Anadolu", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/1.%20O%C4%9Fuz%20G%C3%B6%C3%A7leri%20ve%20Anadolu.pdf" },
				{ baslik: "Anadolu'nun İlk Fatihleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/2.%20Anadolu'nun%20%C4%B0lk%20Fatihleri.pdf" },
				{ baslik: "Anadolu'da Selçuklu Bizans Mücadelesi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/3.%20Anadolu'da%20Sel%C3%A7uklu%20Bizans%20M%C3%BCcadelesi.pdf" },
				{ baslik: "Moğol İstilasının Anadolu'daki Siyasi, Sosyal ve Kültürel Değişimi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/6.%20Mo%C4%9Fol%20%C4%B0stilas%C4%B1n%C4%B1n%20Anadolu'daki%20Siyasi%2C%20Sosyal%20ve%20K%C3%BClt%C3%BCrel%20De%C4%9Fi%C5%9Fimi.pdf" },
				{ baslik: "Haçlılar Karşısında Türkler", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/5.%20Ha%C3%A7l%C4%B1lar%20Kar%C5%9F%C4%B1s%C4%B1nda%20T%C3%BCrkler.pdf" },
				{ baslik: "Önemli Askerî Mücadelelerin Türk Tarihinin Seyrine Etkileri", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/10.1.1%20Genel%20%C3%96zet.pdf" },
				{ baslik: "Türkistan'dan Türkiye'ye Türklerde Devlet ve Ordu Teşkilatları", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/10.1.2%20Genel%20%C3%96zet.pdf" },
				{ baslik: "Türklerde Toplumsal Yapı ve Sınıflar", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/10.1.3%20T%C3%BCrklerde%20Toplumsal%20Yap%C4%B1%20ve%20S%C4%B1n%C4%B1flar.pdf" },
				{ baslik: "Türkler'de Eğitim, Mimari ve Sanat", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/10.1.4%20E%C4%9Fitim%2C%20Mimari%20ve%20Sanat.pdf" },
				{ baslik: "Türk-İslam Alimleri", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/10.1.4.%20T%C3%BCrk-%C4%B0slam%20Alimleri.pdf" },
				{ baslik: "Malazgirt, Miryakefalon, Haçlı Seferleri", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/Malazgirt%2C%20Miryakefalon%2C%20Ha%C3%A7l%C4%B1%201.pdf" },
				{ baslik: "Anadolu'nun Yurt Edinilmesi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/Anadolu'nun%20Yurt%20Edinilmesi.pdf" },
				{ baslik: "Kösedağ Savaşı", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.1.Unite/K%C3%B6seda%C4%9F%20Sava%C5%9F%C4%B1.pdf" },                
                { baslik: "Büyük Selçuklu Askeri Stratejisi (1040-1071)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u1_selcuklu_1" },
                { baslik: "İbn Battuta: Selçuklu Sosyoekonomik Ağı", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u1_battuta_2" },
                { baslik: "Türk-İslam Bilim ve Kültür Merkezleri", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#C9A84C", link: "harita_u1_bilim_3" },
				{ baslik: "Oğuz Göçleri ve Anadolu'nun Türkleşmesi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#27ae60", link: "harita_u1_oguz_4" },
				{ baslik: "Kut Anlayışı ve Selçuklu Devlet Teşkilatı", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u1_idari_5" },
				{ baslik: "Haçlı Seferleri ve Anadolu'nun Savunulması", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2980b9", link: "harita_u1_hacli_6" },
				{ baslik: "İlk Türk-İslam Beylikleri ve Mimari Eserler", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#27ae60", link: "harita_u1_beylikler_7" },
				{ baslik: "Miryokefalon Savaşı ve Yurt Tutan Stratejisi (1176)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u1_miryokefalon_8" },
				{ baslik: "I. Alaeddin Keykubat: Zirve Dönemi ve Deniz Aşırı Seferler", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2980b9", link: "harita_u1_keykubat_9" },
				{ baslik: "Kösedağ Savaşı ve Siyasi Birliğin Parçalanması (1243)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u1_kosedag_10" }
            ];
        } else if (uniteId === 'u2') {
            aktifMateryaller = [
                { baslik: "Osmanlı Kuruluş Tezleri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/a5YM4cZKDlY" },
				{ baslik: "Kuruluş Dönemi Askeri ve Siyasi Gelişmeler", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/s0sU4HxafSQ" },
				{ baslik: "Osmanlı'da Ordu, Hukuk, Toprak", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/zF6Z3g7t5i4" },
				{ baslik: "Osmanlı'da İskan ve İstimalet", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/MgMKEPe7t4I" },
				{ baslik: "Osmanlı'da İlim İrfan Geleneği", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "https://youtu.be/9kGl05CWnA0" },
				{ baslik: "Ankara Savaşı ve Fetret Devri", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "VideoLink" },
				{ baslik: "Devşirme ve Yeniçeri Ocağı", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "VideoLink" },
				{ baslik: "Tımar Sistemi", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "VideoLink" },
				{ baslik: "Videoİsim", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "VideoLink" },
				{ baslik: "Videoİsim", tur: "Video Ders", icon: "fa-film", renk: "#e74c3c", link: "VideoLink" },
				{ baslik: "Beylikten Devlete Osmanlı", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Osmanlı'nın Kuruluşu", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Ankara Savaşı", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Ankara Savaşı 1. Bölüm (Tarih 101)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Tarih-101/101-y%C4%B1ld%C4%B1r%C4%B1m-bayezid-x-timur-ankara-sava%C5%9F%C4%B1-i.-b%C3%B6l%C3%BCm.mp3" },
                { baslik: "Ankara Savaşı 2. Bölüm (Tarih 101)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Tarih-101/101-y%C4%B1ld%C4%B1r%C4%B1m-bayezid-x-timur-ankara-sava%C5%9F%C4%B1-ii.-b%C3%B6l%C3%BCm.m4a" },
				{ baslik: "Seyyahlar - İbn Batuta (Geri Dönüyoruz)", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "https://depo.kirkyama.uk/Podcast/Geri-Donuyoruz/geri-d%C3%B6n%C3%BCyoruz-%2335-_-seyyahlar-%231_-i%CC%87bn-battuta.mp3" },
                { baslik: "Beylikten Devlete Osmanlı Siyaseti", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/7.%20Beylikten%20Devlete%20Osmanl%C4%B1%20Siyaseti.pdf" },
				{ baslik: "Osmanlı'nın Kuruluşuyla İlgili Görüşler", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/8.%20Osmanl%C4%B1'n%C4%B1n%20Kurulu%C5%9Fuyla%20%C4%B0lgili%20G%C3%B6r%C3%BC%C5%9Fler.pdf" },
				{ baslik: "Osmanlı Bizans İlişkileri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/9.%20Osmanl%C4%B1%20Bizans%20%C4%B0li%C5%9Fkileri.pdf" },
				{ baslik: "Balkan Fetihleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/10.%20Balkan%20Fetihleri.pdf" },
				{ baslik: "Türk Siyasi Birliğini Sağlama Mücadelesi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/11.%20T%C3%BCrk%20Siyasi%20Birli%C4%9Fini%20Sa%C4%9Flama%20M%C3%BCcadelesi.pdf" },
				{ baslik: "Türk Devletlerinin Liderlik Mücadelesi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/12.%20T%C3%BCrk%20Devletlerinin%20Liderlik%20M%C3%BCcadelesi.pdf" },
				{ baslik: "Fetret Devri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/13.%20Fetret%20Devri.pdf" },
				{ baslik: "Sultan ve Osmanlı Merkez Teşkiltaı - 1", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/27.%20Sultan%20ve%20Osmanl%C4%B1%20Merkez%20Te%C5%9Fkilta%C4%B1%20-%201.pdf" },
				{ baslik: "Sultan ve Osmanlı Merkez Teşkiltaı - 2", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/28.%2027.%20Sultan%20ve%20Osmanl%C4%B1%20Merkez%20Te%C5%9Fkilta%C4%B1%20-%202.pdf" },
				{ baslik: "Yeniçeriler ve Devşirme Sistemi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/29.%20Yeni%C3%A7eriler%20ve%20Dev%C5%9Firme%20Sistemi.pdf" },
				{ baslik: "Yeniçeriler", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/30.%20Yeni%C3%A7eriler.pdf" },
				{ baslik: "Anadolu'nun Kandilleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/31.%20Anadolu'nun%20Kandilleri.pdf" },
				{ baslik: "Halk Kültürü ve Kitabi Kültür", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/32.%20Halk%20K%C3%BClt%C3%BCr%C3%BC%20ve%20Kitabi%20K%C3%BClt%C3%BCr.pdf" },
				{ baslik: "Osmanlı'da Askeri Sınıf", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/14.%20Osmanl%C4%B1'da%20Askeri%20S%C4%B1n%C4%B1f.pdf" },
				{ baslik: "Osmanlı Kuruluş Tezleri", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/10.2.1.%20Osmanl%C4%B1%20Kurulu%C5%9F%20Tezleri.pdf" },
				{ baslik: "Kuruluş Dönemi Askeri ve Siyasi Gelişmeler", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/10.2.2.%20Kurulu%C5%9F%20D%C3%B6nemi%20Askeri%20ve%20Siyasi%20Geli%C5%9Fmeler.pdf" },
				{ baslik: "Tımar Sistemi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/T%C4%B1mar%20Sistemi.pdf" },
				{ baslik: "Devşirme ve Yeniçeri Ocağı", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/Dev%C5%9Firme%20ve%20Yeni%C3%A7eri%20Oca%C4%9F%C4%B1.pdf" },
				{ baslik: "Osmanlı'da Yönetim ve Orduda Değişim", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/10.2.3.%20Osmanl%C4%B1'da%20Y%C3%B6netim%20ve%20Orduda%20De%C4%9Fi%C5%9Fim.pdf" },
				{ baslik: "Ankara Savaşı ve Fetret Devri", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/Ankara%20Sava%C5%9F%C4%B1%20ve%20Fetret%20Devri.pdf" },
				{ baslik: "Osmanlı'da İskan ve İstimalet", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/10.2.4.%20Osmanl%C4%B1'da%20%C4%B0skan%20ve%20%C4%B0stimalet.pdf" },
				{ baslik: "Osmanlı'da İlim İrfan Geleneği", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "https://depo.kirkyama.uk/PDF/10.SinifSunular/10.2.Unite/10.2.5.%20Osmanl%C4%B1'da%20%C4%B0lim%20%C4%B0rfan%20Gelene%C4%9Fi.pdf" },
				{ baslik: "Beylik Döneminde Osmanlı Askeri Gücü", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/15.%20Beylik%20D%C3%B6neminde%20Osmanl%C4%B1%20Askeri%20G%C3%BCc%C3%BC.pdf" },
				{ baslik: "Tımar Sistemi", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/16.%20T%C4%B1mar%20Sistemi.pdf" },
				{ baslik: "Fetihle Gelen Dönüşüm", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/17.%20Fetihle%20Gelen%20D%C3%B6n%C3%BC%C5%9F%C3%BCm.pdf" },
				{ baslik: "Kuruluşun Coğrafi Şifresi (1299-1302)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#27ae60", link: "harita_u2_kurulus_1" },
                { baslik: "Koyunhisar (Bafeus): İlk Büyük Hesaplaşma", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u2_koyunhisar_2" },
                { baslik: "İpek Yolu'nun Yeni Kapısı: Bursa ve İznik", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2980b9", link: "harita_u2_ipekyolu_3" },
				{ baslik: "Rumeli'ye İlk Köprü: Çimpe ve Gelibolu (1353)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u2_cimpe_4" },
                { baslik: "Balkanların Kapısı: Edirne ve Fetih (1363)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#27ae60", link: "harita_u2_edirne_5" },
                { baslik: "Anadolu Türk Birliği ve Barışçıl Diplomasi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#C9A84C", link: "harita_u2_atb_6" },
				{ baslik: "Niğbolu: Sultan-ı İklim-i Rum (1396)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2980b9", link: "harita_u2_nigbolu_7" },
                { baslik: "Ankara Savaşı: Dağılma ve Kırılma (1402)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8e44ad", link: "harita_u2_ankara_8" },
                { baslik: "Varna ve II. Kosova: Balkanların Tapusu", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u2_kosova_9" },
                { baslik: "İstanbul Kuşatmasına Hazırlık: Rumeli Hisarı", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#27ae60", link: "harita_u2_rumeli_10" }
            ];
        } else if (uniteId === 'u3') {
            aktifMateryaller = [
                { baslik: "İstanbul'un Fethi", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Kanuni ve Cihan Devleti", tur: "Belgesel", icon: "fa-film", renk: "#e74c3c", link: "#" },
                { baslik: "Osmanlı Deniz Seferleri", tur: "Video Ders", icon: "fa-youtube", renk: "#e74c3c", link: "#" },
                { baslik: "Coğrafi Keşifler ve Osmanlı", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: "Rönesans ve Avrupa", tur: "Podcast", icon: "fa-podcast", renk: "#9b59b6", link: "#" },
                { baslik: " Fetih ve Fatih", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/18.%20Fetih%20ve%20Fatih.pdf" },
				{ baslik: "Dünya Gücü Osmanlı (1453-1595)", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/25.%20D%C3%BCnya%20G%C3%BCc%C3%BC%20Osmanl%C4%B1%20(1453-1595).pdf" },
				{ baslik: " II. Bayezid ve Cem Sultan", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/19.%20II.%20Bayezid%20ve%20Cem%20Sultan.pdf" },
				{ baslik: "Gücünün Zirvesinde Osmanlı", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/20.%20G%C3%BCc%C3%BCn%C3%BCn%20Zirvesinde%20Osmanl%C4%B1.pdf" },
				{ baslik: "Osmanlı'nın Gücü ve Stratejik Rakipleri", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/23.%20Osmanl%C4%B1'n%C4%B1n%20G%C3%BCc%C3%BC%20ve%20Stratejik%20Rakipleri.pdf" },
				{ baslik: "Osmanlı'nın Dünya Gücü Olması", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/24.%20Osmanl%C4%B1'n%C4%B1n%20D%C3%BCnya%20G%C3%BCc%C3%BC%20Olmas%C4%B1.pdf" },
				{ baslik: "1520-1595 Arasındaki Siyasi Gelişmeler", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/21.%201520-1595%20Aras%C4%B1ndaki%20Siyasi%20Geli%C5%9Fmeler.pdf" },
				{ baslik: "Osmanlı'nın Kapitülasyon Siyaseti", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/22.%20Osmanl%C4%B1'n%C4%B1n%20Kapit%C3%BClasyon%20Siyaseti.pdf" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Sunuİsmi", tur: "Sunu", icon: "fa-chalkboard-user", renk: "#e84393", link: "link" },
				{ baslik: "Osmanl'nın Kara ve Deniz Poltikaları (Hint Deniz Seferleri)", tur: "PDF Not", icon: "fa-file-pdf", renk: "#e67e22", link: "https://depo.kirkyama.uk/PDF/10.SinifOGM/26.%20Osmanl'n%C4%B1n%20Kara%20ve%20Deniz%20Poltikalar%C4%B1%20(Hint%20Deniz%20Seferleri).pdf" },
                { baslik: "Fatih'ten Kanuni'ye Cihan Devleti (1453-1566)", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#8B1A1A", link: "harita_u3_cihan_1" },
                { baslik: "Zengin Ticaret Yollarının Denetimi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#2980b9", link: "harita_u3_ticaret_2" },
                { baslik: "Ordu Revizyonu: Tımar'ın Düşüşü, Kapıkulu'nun Yükselişi", tur: "İnteraktif Harita", icon: "fa-map-location-dot", renk: "#C9A84C", link: "harita_u3_ordudevrimi_3" },
				{ baslik: "Coğrafi Keşifler ve Yeni Rotalar (Animasyonlu)", tur: "İnteraktif Harita", icon: "fa-ship", renk: "#8B1A1A", link: "harita_u3_kesifler_5" },
				{ baslik: "Dünya Gücü Osmanlı (Poligon Efektli)", tur: "İnteraktif Harita", icon: "fa-globe", renk: "#8B1A1A", link: "harita_u3_cihan_1" }
            ];
        }
    }

    function kategoriSec(hedefTur) {
        if(hedefTur === 'Flashcard') {
            baslatFlashcard(aktifOda);
            return;
        }

        document.getElementById('materyalKategorileri').classList.add('hidden');
        document.getElementById('materyalListesiAlani').classList.remove('hidden');
        
        const matAlani = document.getElementById('odaMateryalleri');
        matAlani.innerHTML = '';
        
        // --- OYUNLAR MANTIĞI (ÜNİTELERE GÖRE DİNAMİK YAPI) ---
        if(hedefTur === 'Oyunlar') {
            matAlani.style.display = 'grid';
            matAlani.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            matAlani.style.gap = '20px';
            
            if (aktifOda === 'u1') {
                matAlani.innerHTML = `
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u1_arac_ikta', 'İkta Sistemi: Kılıç ve Saban', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-wheat-awn"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">İkta Sistemi</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">Simülatör</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #2980b9 0%, #3498db 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u1_arac_divan', 'Divan-ı Saltanat: Karar Odası', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-scale-balanced"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Divan-ı Saltanat</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">Eşleştirme</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u1_arac_ahi', 'Ahi Evran\'ın Tezgahı', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-hammer"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Ahi Evran'ın Tezgahı</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">Simülasyon</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #d35400 0%, #e67e22 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u1_arac_kulliye', 'Külliye Mimarı: Vakıf Sistemi', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-building-columns"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Külliye Mimarı</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">Simülatör</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u1_arac_hacli_radar', 'Haçlı Seferleri: Motivasyon Radarı', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-radar"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Haçlı Seferleri Radarı</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">Analiz</span></div>
                    </div>
                `;
            } else if (aktifOda === 'u2') {
                matAlani.innerHTML = `
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #2980b9 0%, #3498db 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_iskan_11', 'Balkanlar İskân Simülatörü', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-users-gear"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Balkanlar İskân Simülatörü</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_istimalet_12', 'İstimalet (Gönül Alma) Radarı', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-heart-circle-check"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">İstimalet (Gönül Alma) Radarı</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_timar_13', 'Tımar Sistemi Çarkı (Seviye 2)', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-horse-head"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Tımar Sistemi Çarkı (Seviye 2)</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_devsirme_14', 'Devşirme - Kapıkulu Serüveni', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-person-military-to-person"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Devşirme - Kapıkulu Serüveni</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_divan_15', 'Divan-ı Hümayun: Karar Odası', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-landmark-dome"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Divan-ı Hümayun: Karar Odası</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_fetret_16', 'Fetret Devri: Devleti Birleştir', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-chess-king"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Fetret Devri: Devleti Birleştir</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_diplomasi_17', 'Beylik Diplomasi Çarkı (ATSB)', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-earth-asia"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Beylik Diplomasi Çarkı (ATSB)</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_ordu_18', 'Osmanlı Ordu Yapısı (Eşleştirme)', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-person-military-rifle"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Osmanlı Ordu Yapısı (Eşleştirme)</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_bursa_19', 'Vakıf Şehir: Bursa Mimarı', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-city"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Vakıf Şehir: Bursa Mimarı</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                    <div class="mat-card" style="cursor:pointer; background: linear-gradient(135deg, #2980b9 0%, #3498db 100%); color: white; border: none; transform: scale(1); transition: transform 0.3s;" onclick="acHarita('harita_u2_arac_1402_20', 'Tarihin Kırılma Noktası: 1402 Analizi', this)" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="mat-icon" style="color: white; font-size: 2.5rem; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 15px;"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
                        <div class="mat-info"><span class="mat-title" style="color: white; font-size: 1.5rem; font-weight: 800;">Tarihin Kırılma Noktası: 1402 Analizi</span><span class="mat-type" style="color: rgba(255,255,255,0.9);">İnteraktif Harita</span></div>
                    </div>
                `;
            } else {
                matAlani.innerHTML = `<div style="grid-column: 1 / -1; color:white; padding: 20px; font-size: 18px; text-align: center;">Bu ünite için oyunlar henüz eklenmedi.</div>`;
            }
            return;
        }

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
            } else if (m.tur === 'İnteraktif Harita') {
                matAlani.innerHTML += `
                    <div class="mat-card" style="cursor:pointer;" onclick="acHarita('${m.link.replace(/'/g, "\\'")}', '${m.baslik.replace(/'/g, "\\'")}', this)">
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

function oynatPodcast(link, baslik) {
        if(link === "#") { alert("Öğretmeniniz bu podcast içeriğini henüz yüklemedi."); return; }
        
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const playerTitle = document.getElementById('playerTitle');
        const playBtn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        playerTitle.innerText = baslik;
        playerAudio.src = link;
        
        // Yeni podcast açıldığında göstergeleri sıfırla
        if(document.getElementById('durationDisplay')) document.getElementById('durationDisplay').innerText = "00:00";
        if(document.getElementById('currentTimeDisplay')) document.getElementById('currentTimeDisplay').innerText = "00:00";
        if(document.getElementById('progressBarFill')) document.getElementById('progressBarFill').style.width = "0%";
        
        playerContainer.classList.add('active');
        
        playerAudio.play().then(() => {
            if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if(iconBox) iconBox.classList.add('playing');
        }).catch(e => {
            if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            if(iconBox) iconBox.classList.remove('playing');
        });
    }

    function kapatPlayer() {
        const playerContainer = document.getElementById('audioPlayerContainer');
        const playerAudio = document.getElementById('mainAudio');
        const iconBox = document.getElementById('podcastIconBox');
        const playBtn = document.getElementById('playPauseBtn');
        
        if(playerAudio) { playerAudio.pause(); playerAudio.src = ""; }
        if(playerContainer) playerContainer.classList.remove('active');
        if(iconBox) iconBox.classList.remove('playing');
        if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
    }

    function togglePlay() {
        const audio = document.getElementById('mainAudio');
        const btn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        
        if (!audio || !audio.src) return;

        if (audio.paused) {
            audio.play();
            if(btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            if(iconBox) iconBox.classList.add('playing');
        } else {
            audio.pause();
            if(btn) btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
            if(iconBox) iconBox.classList.remove('playing');
        }
    }

    function skipAudio(seconds) {
        const audio = document.getElementById('mainAudio');
        if(audio && audio.src && !isNaN(audio.currentTime)) {
            audio.currentTime += seconds;
        }
    }

    function updateProgress() {
        const audio = document.getElementById('mainAudio');
        const fill = document.getElementById('progressBarFill');
        const currentDisplay = document.getElementById('currentTimeDisplay');
        
        if (!audio || isNaN(audio.currentTime)) return;

        // Süre hesaplanamasa bile saniye ekranda her zaman akacak
        if(currentDisplay) currentDisplay.innerText = formatTime(audio.currentTime);
        
        // Süre verisi varsa ilerleme çubuğunu doldur
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity && audio.duration > 0) {
            const percent = (audio.currentTime / audio.duration) * 100;
            if(fill) fill.style.width = percent + '%';
          }
          if(typeof senkronizeEt === 'function') senkronizeEt();
    }

    function setDuration() {
        const audio = document.getElementById('mainAudio');
        const durationDisplay = document.getElementById('durationDisplay');
        
        if(audio && audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            if(durationDisplay) durationDisplay.innerText = formatTime(audio.duration);
        } else {
            // Sunucu toplam süreyi vermiyorsa
            if(durationDisplay) durationDisplay.innerText = "Yükleniyor...";
        }
    }

    function seekAudio(event) {
        const audio = document.getElementById('mainAudio');
        const bar = document.getElementById('progressBarBg');
        
        if(audio && audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
            const clickX = event.clientX - bar.getBoundingClientRect().left;
            audio.currentTime = (clickX / bar.getBoundingClientRect().width) * audio.duration;
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const min = Math.floor(seconds / 60); 
        const sec = Math.floor(seconds % 60);
        return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function audioEnded() {
        const btn = document.getElementById('playPauseBtn');
        const iconBox = document.getElementById('podcastIconBox');
        if(btn) btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 3px;"></i>';
        if(iconBox) iconBox.classList.remove('playing');
        if(document.getElementById('progressBarFill')) document.getElementById('progressBarFill').style.width = '0%';
        if(document.getElementById('currentTimeDisplay')) document.getElementById('currentTimeDisplay').innerText = '00:00';
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

    function odayaGir(uniteId) {
        aktifOda = uniteId;
        document.getElementById('anaKlasorler').style.display = 'none';

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
        data.testler.forEach(t => { if(!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu); });
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
            if (t.konu === "Geçmişin İnşa Sürecinde Tarih") return false;
            if (konuAdi === 'Tümü') return true;
            if (konuAdi === 'Klasik Sınavlar' && t.isKlasik) return true;
            return t.konu === konuAdi && !t.isKlasik;
        });

        if (filtrelenmisTestler.length === 0) {
            testAlani.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6; font-weight:bold;">Bu kritere uygun test bulunamadı.</div>';
        } else {
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler')) || [];
            
            filtrelenmisTestler.forEach(t => {
                const row = document.createElement('div');
                row.className = "test-item-row " + (t.isKlasik ? "klasik" : "");
                const icon = t.isKlasik ? '<i class="fa-solid fa-pen-to-square"></i>' : '<i class="fa-solid fa-file-signature"></i>';
                
                let solvedBadge = cozulenler.includes(t.id) ? '<span style="color:#27ae60; font-size:12px; font-weight:bold; margin-left:10px; padding:3px 8px; background:rgba(39,174,96,0.1); border-radius:8px;"><i class="fa-solid fa-check"></i> Çözüldü</span>' : '';

                let rHtml = "<div class='test-item-left'><div class='test-item-icon'>" + icon + "</div><div class='test-item-info'>";
                rHtml += "<span class='test-item-title'>" + t.baslik + solvedBadge + "</span><span class='test-item-meta'>" + t.aciklama + "</span></div></div>";
                rHtml += "<div class='test-item-actions'>";
                rHtml += "<button type='button' class='test-item-share-btn' title='Test Bağlantısını Kopyala' onclick=\"event.stopPropagation(); window.DinamikUrl && window.DinamikUrl.paylasTest('" + t.id + "', '" + t.baslik.replace(/'/g, "\\'") + "')\"><i class='fa-solid fa-share-nodes'></i></button>";
                rHtml += "<button class='test-item-start-btn' onclick=\"testSec('" + t.id + "')\">Başla ►</button>";
                rHtml += "</div>";
                row.innerHTML = rHtml;
                testAlani.appendChild(row);
            });
        }
    }

    function salonaDon() {
        document.getElementById('sinavOdasi').classList.add('hidden');
        aktifOda = null;
        document.getElementById('anaKlasorler').style.display = 'grid';
    }

    window.onload = function() {
        const kayitliTema = localStorage.getItem('tema');
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
            localStorage.setItem('tema', '');
        }
        
        if(localStorage.getItem('fontSize')) {
            document.documentElement.style.setProperty('--font-size-base', localStorage.getItem('fontSize') + 'px');
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

        const savedSession = localStorage.getItem('sinavSession');
        if (savedSession) {
            if(confirm("Yarım kalmış bir sınavınız var. Devam etmek ister misiniz?")) {
                restoreSession(JSON.parse(savedSession));
            } else {
                localStorage.removeItem('sinavSession');
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
            localStorage.setItem('tema', 'dark-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-scroll"></i>';
        } else if (isDark) {
            body.classList.remove('dark-mode');
            body.classList.add('sepia-mode');
            localStorage.setItem('tema', 'sepia-mode');
            btnTema.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else if (isSepia) {
            body.classList.remove('sepia-mode');
            localStorage.setItem('tema', '');
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
            localStorage.setItem('fontSize', newSize);
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

        const loginBtn = document.querySelector("#ogrenciGirisFormu .btn-login");
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
    // --- BİBLİYOGRAFYA (KAYNAKLAR) FONKSİYONLARI ---
    function kaynaklarGoster() {
        document.getElementById('kaynaklarModal').style.display = 'block';
        const listeAlani = document.getElementById('kaynakListesiAlani');
        listeAlani.innerHTML = ""; // İçini temizle
        
        // Hamburger menüyü kapat
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');

        if (typeof KAYNAKLAR !== 'undefined' && KAYNAKLAR.length > 0) {
            // Kaynakları yazar adına göre alfabetik sırala
            const siraliKaynaklar = [...KAYNAKLAR].sort((a, b) => a.yazar.localeCompare(b.yazar, 'tr-TR'));
            
            siraliKaynaklar.forEach(k => {
                listeAlani.innerHTML += `
                <div style="padding: 12px 15px; border-bottom: 1px solid var(--card-border); font-size: 14px; line-height: 1.5;">
                    <span style="color: var(--accent-color); font-weight: 700;">${k.yazar}</span>, 
                    <span style="font-style: italic;">${k.eser}</span>, 
                    <span style="opacity: 0.8;">${k.detay}</span>
                </div>`;
            });
            if(listeAlani.lastElementChild) listeAlani.lastElementChild.style.borderBottom = "none";
        } else {
            listeAlani.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.6; font-weight:bold;">Henüz kaynak eklenmemiştir.</div>`;
        }
    }

    function kaynaklarKapat() {
        document.getElementById('kaynaklarModal').style.display = 'none';
    }
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
        localStorage.setItem("okunanDuyuru", AKTIF_DUYURU_VERSIYONU); 
        document.getElementById('duyuruRozeti').classList.add('hidden'); 
        const genelRozet = document.getElementById('duyuruRozetiGenel');
        if(genelRozet) genelRozet.classList.add('hidden'); 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }

    function duyuruRozetKontrol() {
        const okunan = localStorage.getItem("okunanDuyuru");
        if (okunan !== AKTIF_DUYURU_VERSIYONU) {
            document.getElementById('duyuruRozeti').classList.remove('hidden'); 
            const genelRozet = document.getElementById('duyuruRozetiGenel');
            if(genelRozet) genelRozet.classList.remove('hidden'); 
        }
    }
    
    function duyuruKapat() { document.getElementById('duyuruModal').style.display = 'none'; }
    function odeveGit() { duyuruKapat(); testSec('test_u2_genel_1'); }

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
        autoSaveData.ihlal = ihlalSayisi; localStorage.setItem('sinavSession', JSON.stringify(autoSaveData));
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
        localStorage.removeItem('sinavSession'); 

        if (aktifTest && !aktifTest.includes('robot_sinavi')) {
            let cozulenler = JSON.parse(localStorage.getItem('cozulenTestler')) || [];
            if (!cozulenler.includes(aktifTest)) {
                cozulenler.push(aktifTest);
                localStorage.setItem('cozulenTestler', JSON.stringify(cozulenler));
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
            localStorage.removeItem('sinavSession'); document.getElementById("testEkrani").classList.add("hidden");
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
                    if (!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu);
                });
            }
        } else {
            window.MENU_VERI[uniteSelect].testler.forEach(t => {
                if (!t.isKlasik && t.konu && t.konu !== "Geçmişin İnşa Sürecinde Tarih") konular.add(t.konu);
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
                if (t.konu === "Geçmişin İnşa Sürecinde Tarih") return; 
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

    function yedekleGoster() { 
        document.getElementById('yedekModal').style.display = 'block'; 
        const dropdown = document.getElementById('hamburgerDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
    
    function yedekleKapat() { document.getElementById('yedekModal').style.display = 'none'; }

    function verileriIndir() {
        const data = {
            aktifOgrenci: localStorage.getItem('aktifOgrenci'),
            cozulenTestler: localStorage.getItem('cozulenTestler'),
            tema: localStorage.getItem('tema'),
            fontSize: localStorage.getItem('fontSize')
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = "Tarih_Portali_Yedek.json";
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
                if(data.aktifOgrenci) localStorage.setItem('aktifOgrenci', data.aktifOgrenci);
                if(data.cozulenTestler) localStorage.setItem('cozulenTestler', data.cozulenTestler);
                if(data.tema) localStorage.setItem('tema', data.tema);
                if(data.fontSize) localStorage.setItem('fontSize', data.fontSize);
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
// =========================================
// === MÜZİK KUTUSU (YAN PANEL) MOTORU ===
// =========================================
    let aktifMuzikIndex = -1; // Sadece görsel takip için
    window.suAnkiKategoriIndex = -1; // Çalan şarkının kategorisi
    let aktifSarkiIndex = -1; // Çalan şarkının indexi
    let muzikCaliyor = false;
    let gorunumModu = 'kategori'; // 'kategori' veya 'sarki'

    function toggleMuzikPanel() {
        const panel = document.getElementById('muzikPanel');
        if (!panel) return;
        panel.classList.toggle('aktif');
        
        if(panel.classList.contains('aktif')) {
            if(document.getElementById('muzikListeContainer').innerHTML === "" || gorunumModu === 'kategori') {
                gorunumModu = 'kategori';
                muzikListesiniOlustur();
            }
        }
    }

    function muzikListesiniOlustur() {
        const konteyner = document.getElementById('muzikListeContainer');
        konteyner.innerHTML = "";

        if (typeof window.MUZIK_VERITABANI === 'undefined' || window.MUZIK_VERITABANI.length === 0) {
            konteyner.innerHTML = "<div style='text-align:center; padding:20px; opacity:0.6; color:var(--text-color); font-weight:600;'>Henüz müzik yüklenmedi.</div>";
            return;
        }

        if (gorunumModu === 'kategori') {
            window.MUZIK_VERITABANI.forEach((kat, index) => {
                const div = document.createElement('div');
                div.className = `muzik-liste-item`;
                div.style.cursor = 'pointer';
                div.onclick = () => kategoriSecMuzik(index);
                
                div.innerHTML = `
                    <div class="mat-icon" style="color: var(--accent-color); background: rgba(201,168,76,0.1); width:40px; height:40px; margin-right:12px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid ${kat.kategoriIkon || 'fa-folder'}"></i>
                    </div>
                    <div class="m-detay" style="flex:1; display:flex; flex-direction:column; text-align:left;">
                        <span class="m-isim" style="font-size: 15px;">${kat.kategoriAdi}</span>
                        <span class="m-sanatci" style="opacity:0.7;">${kat.sarkilar.length} Şarkı</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--text-color); opacity:0.5;"></i>
                `;
                konteyner.appendChild(div);
            });
} else if (gorunumModu === 'sarki') {
            const geriDiv = document.createElement('div');
            geriDiv.style.cursor = 'pointer'; 
            geriDiv.style.padding = '12px 15px'; 
            geriDiv.style.marginBottom = '10px';
            geriDiv.style.borderRadius = '8px'; 
            
            // --- YAPIŞKAN (STICKY) VE BUZLU CAM EFEKTİ ---
            geriDiv.style.position = 'sticky';
            geriDiv.style.top = '0';
            geriDiv.style.zIndex = '10';
            // Sitenin ana CSS değişkenlerinden (var) renkleri otomatik çeker
            geriDiv.style.background = 'var(--container-bg)'; 
            geriDiv.style.backdropFilter = 'blur(12px)'; 
            geriDiv.style.borderBottom = '1px solid var(--card-border)'; 
            geriDiv.style.color = 'var(--text-color)';
            // ---------------------------------------------

            geriDiv.style.display = 'flex'; 
            geriDiv.style.alignItems = 'center'; 
            geriDiv.style.gap = '10px'; 
            geriDiv.style.fontWeight = 'bold';
            geriDiv.onclick = () => { gorunumModu = 'kategori'; muzikListesiniOlustur(); };
            geriDiv.innerHTML = `<i class="fa-solid fa-arrow-left"></i> Klasörlere Dön (${window.MUZIK_VERITABANI[aktifMuzikIndex].kategoriAdi})`;
            konteyner.appendChild(geriDiv);

            const seciliKategori = window.MUZIK_VERITABANI[aktifMuzikIndex];
            seciliKategori.sarkilar.forEach((sarki, index) => {
                const suAnCalanMi = (window.suAnkiKategoriIndex === aktifMuzikIndex && aktifSarkiIndex === index);
                const div = document.createElement('div');
                div.className = `muzik-liste-item ${suAnCalanMi ? 'caliyor' : ''}`;
                div.onclick = () => sarkiCal(aktifMuzikIndex, index);
                
                div.innerHTML = `
                    <div class="mat-icon" style="color: var(--accent-color); background: rgba(201,168,76,0.1); width:40px; height:40px; margin-right:12px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid ${sarki.kapak || 'fa-music'}"></i>
                    </div>
                    <div class="m-detay" style="flex:1; display:flex; flex-direction:column; text-align:left;">
                        <span class="m-isim">${sarki.baslik}</span>
                        <span class="m-sanatci">${sarki.sanatci} <span style="opacity:0.5; margin-left:5px;">${sarki.sure || ''}</span></span>
                    </div>
                    ${suAnCalanMi ? '<i class="fa-solid fa-chart-simple fa-bounce" style="color:var(--accent-color);"></i>' : ''}
                `;
                konteyner.appendChild(div);
            });
        }
    }

    function kategoriSecMuzik(index) {
        aktifMuzikIndex = index;
        gorunumModu = 'sarki';
        muzikListesiniOlustur();
    }

    function sarkiCal(katIndex, sarkiIndex) {
        if (!window.MUZIK_VERITABANI || !window.MUZIK_VERITABANI[katIndex] || !window.MUZIK_VERITABANI[katIndex].sarkilar[sarkiIndex]) return;
        
        window.suAnkiKategoriIndex = katIndex;
        aktifMuzikIndex = katIndex; 
        aktifSarkiIndex = sarkiIndex;
        
        const sarki = window.MUZIK_VERITABANI[katIndex].sarkilar[sarkiIndex];
        const player = document.getElementById('muzikAudio');
        
        document.getElementById('calanSarkiBaslik').innerText = sarki.baslik;
        document.getElementById('calanSarkiSanatci').innerText = sarki.sanatci;
        
        player.src = sarki.link;
        player.play().then(() => {
            muzikCaliyor = true;
            document.getElementById('muzikPlayBtn').innerHTML = '<i class="fa-solid fa-pause"></i>';
            muzikListesiniOlustur(); 
        }).catch(e => console.log("Otomatik oynatma engellendi", e));
		// --- MEDIA SESSION API (TELEFON BİLDİRİM PANELİ KONTROLLERİ) ---
        if ('mediaSession' in navigator) {
            // Şarkı bilgilerini ve logoyu telefonun paneline gönderir
            navigator.mediaSession.metadata = new MediaMetadata({
                title: sarki.baslik,
                artist: sarki.sanatci,
                album: 'Boğaziçi Tarih Portalı',
                artwork: [
                    { src: 'https://depo.kirkyama.uk/favicon.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Paneldeki İleri ve Geri butonlarını bizim JS fonksiyonlarımıza bağlar
            navigator.mediaSession.setActionHandler('previoustrack', function() { oncekiSarki(); });
            navigator.mediaSession.setActionHandler('nexttrack', function() { sonrakiSarki(); });
        }
    }

    function toggleMuzikPlay() {
        const player = document.getElementById('muzikAudio');
        const btn = document.getElementById('muzikPlayBtn');
        
        if (aktifSarkiIndex === -1 && typeof window.MUZIK_VERITABANI !== 'undefined' && window.MUZIK_VERITABANI.length > 0) {
            if(window.MUZIK_VERITABANI[0].sarkilar.length > 0) {
                sarkiCal(0, 0); 
            }
            return;
        }

        if (muzikCaliyor) {
            player.pause();
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 2px;"></i>';
        } else {
            player.play();
            btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
        muzikCaliyor = !muzikCaliyor;
    }

    function sonrakiSarki() {
        if(window.suAnkiKategoriIndex === -1) return;
        const sarkilar = window.MUZIK_VERITABANI[window.suAnkiKategoriIndex].sarkilar;
        let yeniIndex = aktifSarkiIndex + 1;
        if (yeniIndex >= sarkilar.length) yeniIndex = 0; 
        sarkiCal(window.suAnkiKategoriIndex, yeniIndex);
    }

    function oncekiSarki() {
        if(window.suAnkiKategoriIndex === -1) return;
        const sarkilar = window.MUZIK_VERITABANI[window.suAnkiKategoriIndex].sarkilar;
        let yeniIndex = aktifSarkiIndex - 1;
        if (yeniIndex < 0) yeniIndex = sarkilar.length - 1; 
        sarkiCal(window.suAnkiKategoriIndex, yeniIndex);
    }

    function updateMuzikProgress() {
        const player = document.getElementById('muzikAudio');
        const fill = document.getElementById('muzikProgressFill');
        if (player && player.duration) {
            const percent = (player.currentTime / player.duration) * 100;
            fill.style.width = percent + '%';
          }
          if(typeof senkronizeEt === 'function') senkronizeEt();
    }

    function seekMuzik(event) {
        const player = document.getElementById('muzikAudio');
        const bg = document.getElementById('muzikProgressBg');
        if (player && player.duration) {
            const rect = bg.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            player.currentTime = pos * player.duration;
        }
    }
window.addEventListener('click', function(event) { 
        if (event.target.classList.contains('modal')) { 
            event.target.style.display = 'none'; 
            if(event.target.id === 'haritaModal') haritaKapat(); // Harita belleğini temizle
        }
        
        /* --- YENİ EKLENEN: MENÜ DIŞINA TIKLANINCA MENÜYÜ KAPATMA MOTORU --- */
        const dropdown = document.getElementById('hamburgerDropdown');
        if (dropdown && dropdown.classList.contains('active') && !event.target.closest('.dropdown-menu-container')) {
            dropdown.classList.remove('active');
        }
    });



// Harita Modal ESC Kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        const hm = document.getElementById('haritaModal');
        if(hm && !hm.classList.contains('hidden')) {
            haritaKapat();
        }
    }
});


















function acHarita(haritaId, baslik, element) {
    if(haritaId === "#") { alert("Öğretmeniniz bu haritayı henüz yüklemedi."); return; }

    const modal = document.getElementById('haritaModal');
    const controlsContainer = document.getElementById('mapControlsContainer');
    
    document.getElementById('haritaModalBaslik').innerHTML = '<i class="fa-solid fa-map-location-dot"></i> ' + baslik + ' <button type="button" class="harita-share-btn" onclick="event.stopPropagation(); window.DinamikUrl && window.DinamikUrl.paylasHarita(\'' + haritaId + '\', \'' + baslik.replace(/'/g, "\\'") + '\')"><i class="fa-solid fa-share-nodes"></i> Paylaş</button>';
    
    if (window.currentMapInstance) {
        window.currentMapInstance.remove();
        window.currentMapInstance = null;
    }
    
    controlsContainer.innerHTML = '';
    controlsContainer.style.display = 'none';
    
    modal.classList.remove('hidden');

    setTimeout(() => {
        if (window.HARITA_MOTORU && typeof window.HARITA_MOTORU[haritaId] === 'function') {
            window.HARITA_MOTORU[haritaId]();
            
            if(window.currentMapInstance) {
                window.currentMapInstance.invalidateSize();
                
                const imza = L.control({position: 'bottomleft'});
                imza.onAdd = function () {
                    const div = L.DomUtil.create('div', 'harita-imza');
                    div.style.backgroundColor = "rgba(13, 17, 23, 0.85)";
                    div.style.padding = "5px 10px";
                    div.style.borderRadius = "8px";
                    div.style.fontWeight = "700";
                    div.style.fontSize = "12px";
                    div.style.color = "var(--accent-color)";
                    div.style.border = "1px solid rgba(201,168,76,0.3)";
                    div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
                    div.style.backdropFilter = "blur(4px)";
                    div.innerHTML = '<i class="fa-solid fa-pen-nib" style="color: var(--accent-color); margin-right: 5px;"></i> Harita: Murat Mutlu';
                    return div;
                };
                imza.addTo(window.currentMapInstance);
            }

        } else {
            alert("Bu harita (" + haritaId + ") sisteme yüklenmemiş veya yapım aşamasındadır.");
            haritaKapat();
        }
    }, 150);
}

function haritaKapat() {
    const modal = document.getElementById('haritaModal');
    if (modal) {
        modal.classList.add('hidden');
        if (window.currentMapInstance) {
            window.currentMapInstance.remove();
            window.currentMapInstance = null;
        }
    }
}


// === KARAOKE MOTORU ===
window.karaokeData = []; 
window.karaokeAktifMi = false;
window.sonAktifLrcIndex = -1;

function parseLRC(lrcText) {
    if(!lrcText) return [];
    // Her türlü satır sonu karakterine göre böl (CRLF, LF, CR)
    const lines = lrcText.split(/\r\n|\n|\r/);
    const result = [];
    let lastTime = -1;
    
    for(let line of lines) {
        // [mm:ss.xx] veya [mm:ss:xx] veya [mm:ss] formatlarını destekler
        // Başında boşluk vb. olabilir
        const match = line.match(/\[(\d+):(\d+)[.:]?(\d*)\](.*)/);
        if(match) {
            const minutes = parseInt(match[1]);
            let secondsStr = match[2];
            if (match[3]) {
                secondsStr += "." + match[3];
            }
            const seconds = parseFloat(secondsStr);
            const time = minutes * 60 + seconds;
            let text = match[4].trim();
            
            // Aynı saniyeye sahip bir satır daha varsa onu çeviri olarak ekle
            if(lastTime === time && result.length > 0) {
                result[result.length-1].translation = text;
            } else {
                result.push({ time: time, text: text, translation: "" });
                lastTime = time;
            }
        }
    }
    return result;
}

function acKaraoke() {
    const modal = document.getElementById('karaokeModal');
    if(!modal) return;
    
    if(window.suAnkiKategoriIndex === -1 || typeof aktifSarkiIndex === 'undefined' || aktifSarkiIndex === -1) { alert("Lütfen şarkı sözlerini görmek için önce bir şarkı başlatın."); return; }
    const sarki = window.MUZIK_VERITABANI[window.suAnkiKategoriIndex].sarkilar[aktifSarkiIndex];
    document.getElementById('karaokeBaslik').innerText = sarki.baslik;
    document.getElementById('karaokeSanatci').innerText = sarki.sanatci;
    
    window.karaokeData = parseLRC(sarki.lrc);
    window.sonAktifLrcIndex = -1;
    const container = document.getElementById('karaokeContainer');
    container.innerHTML = "";
    
    if(window.karaokeData.length === 0) {
        container.innerHTML = `<div style="color:#fff; opacity:0.5; font-size:24px; margin-top:20vh;">Bu şarkı için eşzamanlı söz (LRC) bulunamadı.</div>`;
    } else {
        window.karaokeData.forEach((line, i) => {
            container.innerHTML += `
                <div id="lrc-line-${i}" class="lrc-line" style="margin-bottom: 30px; transition: all 0.4s ease; opacity: 0.3; transform: scale(0.9);">
                    <div style="color: white; font-size: 28px; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${line.text}</div>
                    ${line.translation ? `<div style="color: #bbb; font-size: 18px; font-style: italic; margin-top: 8px;">${line.translation}</div>` : ''}
                </div>
            `;
        });
    }
    
    modal.style.display = 'flex';
    window.karaokeAktifMi = true;
    senkronizeEt(); 
}

function kapatKaraoke() {
    const modal = document.getElementById('karaokeModal');
    if(modal) modal.style.display = 'none';
    window.karaokeAktifMi = false;
}

function senkronizeEt() {
    if(!window.karaokeAktifMi || window.karaokeData.length === 0) return;
    
    const audio = document.getElementById('muzikAudio');
    if(!audio) return;
    const currentTime = audio.currentTime;
    
    let aktifIndex = -1;
    for(let i = 0; i < window.karaokeData.length; i++) {
        if(currentTime >= window.karaokeData[i].time) {
            aktifIndex = i;
        } else {
            break;
        }
    }
    
    if(aktifIndex !== -1 && window.sonAktifLrcIndex !== aktifIndex) {
        if(window.sonAktifLrcIndex !== -1) {
            const eskiDiv = document.getElementById(`lrc-line-${window.sonAktifLrcIndex}`);
            if(eskiDiv) {
                eskiDiv.style.opacity = '0.3';
                eskiDiv.style.transform = 'scale(0.9)';
                eskiDiv.querySelector('div:first-child').style.color = 'white';
            }
        }
        
        const yeniDiv = document.getElementById(`lrc-line-${aktifIndex}`);
        if(yeniDiv) {
            yeniDiv.style.opacity = '1';
            yeniDiv.style.transform = 'scale(1.1)';
            yeniDiv.querySelector('div:first-child').style.color = 'var(--accent-color)'; 
            
            const container = document.getElementById('karaokeContainer');
            const scrollOffset = yeniDiv.offsetTop - (container.clientHeight / 2) + (yeniDiv.clientHeight / 2);
            container.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        }
        
        window.sonAktifLrcIndex = aktifIndex;
    }
}
