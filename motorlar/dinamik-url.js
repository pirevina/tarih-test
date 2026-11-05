/* ═══════════════════════════════════════════════════════════════
   TARİH PORTALI — DİNAMİK URL & DERİN LİNK (DEEP LINKING) MOTORU
   Telif Hakkı (C) [2026] [Murat Mutlu, murat@kirkyama.uk]
   ═══════════════════════════════════════════════════════════════
   Bu motor; öğrencilerin test, video, PDF not, sunu, harita,
   oyun veya kavram kartı linklerine tıkladıklarında:
   1) Giriş yapmamışlarsa: Giriş ekranında hedef içeriği gösterir,
      giriş yapıldığı anda içeriği otomatik açar.
   2) Zaten giriş yapmışlarsa: İçeriği gecikmesiz direkt açar.
   3) Gezinme esnasında tarayıcının adres çubuğundaki URL'yi günceller.
   4) Öğretmenlerin tek tıkla doğrudan paylaşım linki kopyalamasını sağlar.
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Sınıf seviyesini URL'den tespit et (9 veya 10)
    const sinifSeviyesi = window.location.pathname.includes('sinif10') ? 10 : 9;
    const sinifDosyaAdi = sinifSeviyesi === 10 ? 'sinif10.html' : 'sinif9.html';

    let bekleyenHedef = null;
    let urlGuncellemeDevreDisi = false;

    /* ─── YARDIMCI: METİN NORMALİZASYONU (Fuzzy Match / Slugify) ─── */
    function slugify(text) {
        if (!text) return '';
        return text.toString().toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '')
            .trim();
    }

    function youtubeIdCikar(url) {
        if (!url || typeof url !== 'string') return null;
        if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    /* ─── KULLANICI GİRİŞ DURUMU KONTROLÜ ─── */
    function isGirisYapilmis() {
        try {
            if (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad) return true;
        } catch (e) {}

        const globalZumre = localStorage.getItem('globalZumreOturumu');
        if (globalZumre) return true;

        const sinifOturumu = localStorage.getItem('aktifOgrenci' + sinifSeviyesi);
        if (sinifOturumu) return true;

        // Ekran sınıflarından kontrol
        const girisEkrani = document.getElementById('girisEkrani');
        const menuEkrani = document.getElementById('menuEkrani');
        if (girisEkrani && girisEkrani.classList.contains('hidden') &&
            menuEkrani && !menuEkrani.classList.contains('hidden')) {
            return true;
        }

        return false;
    }

    /* ─── TÜM MATERYALLERİ DERLEME FONKSİYONU ─── */
    function tumMateryalleriGetir() {
        const sonuclar = [];
        const uniteler = ['u1', 'u2', 'u3'];
        
        uniteler.forEach(u => {
            if (typeof window.materyalleriYukle === 'function') {
                try {
                    window.materyalleriYukle(u);
                    if (window.aktifMateryaller && Array.isArray(window.aktifMateryaller)) {
                        window.aktifMateryaller.forEach(m => {
                            sonuclar.push({
                                uniteId: u,
                                baslik: m.baslik,
                                tur: m.tur,
                                icon: m.icon,
                                renk: m.renk,
                                link: m.link
                            });
                        });
                    }
                } catch (e) {
                    console.warn("Materyal listesi alınırken hata:", e);
                }
            }
        });
        return sonuclar;
    }

    /* ─── URL PARAMETRELERİNİ OKUMA (Search & Hash) ─── */
    function parametreleriAl() {
        const params = new URLSearchParams(window.location.search);
        
        // Eğer search boşsa hash kontrolü yap (#test=... veya #/test/...)
        if (![...params.keys()].length && window.location.hash) {
            let hashStr = window.location.hash.replace(/^#\/?/, '');
            if (hashStr.includes('=')) {
                return new URLSearchParams(hashStr);
            } else if (hashStr) {
                // Örn: #test_u1_genel_1
                const parts = hashStr.split('/');
                if (parts.length === 2) {
                    params.set(parts[0], parts[1]);
                } else {
                    params.set('test', hashStr);
                }
            }
        }
        return params;
    }

    /* ─── HEDEF İÇERİĞİ TESPİT ETME VE ÇÖZÜMLEME ─── */
    function hedefiCoz() {
        const params = parametreleriAl();
        if (!params) return null;

        const testParam = params.get('test') || params.get('sinav');
        const videoParam = params.get('video');
        const pdfParam = params.get('pdf');
        const sunuParam = params.get('sunu');
        const materyalParam = params.get('materyal');
        const haritaParam = params.get('harita');
        const oyunParam = params.get('oyun');
        const kartParam = params.get('kart') || params.get('flashcard');
        const sozlukParam = params.get('sozluk');
        const uniteParam = params.get('unite');
        const sekmeParam = params.get('sekme');
        const kategoriParam = params.get('kategori');

        // 1. TEST HEDEFİ
        if (testParam) {
            const arananTestId = testParam.trim();
            let hedefUnite = 'u1';
            let testBaslik = "Tarih Testi";
            let isKlasik = arananTestId.includes('klasik');

            if (window.MENU_VERI) {
                for (const [uId, uData] of Object.entries(window.MENU_VERI)) {
                    if (uData.testler) {
                        const t = uData.testler.find(x => x.id === arananTestId || slugify(x.baslik) === slugify(arananTestId));
                        if (t) {
                            hedefUnite = uId;
                            testBaslik = t.baslik;
                            isKlasik = t.isKlasik;
                            break;
                        }
                    }
                }
            }

            return {
                tip: 'test',
                id: arananTestId,
                tur: isKlasik ? 'Klasik Sınav (Açık Uçlu)' : 'Çoktan Seçmeli Test',
                baslik: testBaslik,
                uniteId: hedefUnite,
                uniteAdi: hedefUnite.toUpperCase() + '. Ünite',
                ikon: isKlasik ? 'fa-pen-to-square' : 'fa-file-signature',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(hedefUnite);
                    setTimeout(() => {
                        if (typeof window.testSec === 'function') window.testSec(arananTestId);
                    }, 120);
                }
            };
        }

        // 2. VİDEO DERS & BELGESEL HEDEFİ
        if (videoParam) {
            const aranan = videoParam.trim();
            const yId = youtubeIdCikar(aranan);
            const tumMat = tumMateryalleriGetir();
            
            let bulunan = tumMat.find(m => {
                if (m.tur !== 'Video Ders' && m.tur !== 'Belgesel') return false;
                if (yId && youtubeIdCikar(m.link) === yId) return true;
                if (slugify(m.baslik) === slugify(aranan)) return true;
                if (m.link && m.link.includes(aranan)) return true;
                return false;
            });

            const hedefUnite = bulunan ? bulunan.uniteId : (uniteParam || 'u1');
            const baslik = bulunan ? bulunan.baslik : decodeURIComponent(aranan);
            const videoLink = bulunan ? bulunan.link : (yId ? `https://youtu.be/${yId}` : aranan);

            return {
                tip: 'video',
                id: yId || aranan,
                tur: (bulunan && bulunan.tur) || 'Video Ders',
                baslik: baslik,
                uniteId: hedefUnite,
                uniteAdi: hedefUnite.toUpperCase() + '. Ünite',
                ikon: 'fa-film',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(hedefUnite);
                    setTimeout(() => {
                        if (typeof window.sekmeDegistir === 'function') window.sekmeDegistir('materyaller');
                        if (typeof window.kategoriSec === 'function') window.kategoriSec('Video');
                        
                        setTimeout(() => {
                            const kartlar = document.querySelectorAll('#odaMateryalleri .mat-card');
                            let hedefKart = null;
                            kartlar.forEach(k => {
                                if (slugify(k.innerText).includes(slugify(baslik))) hedefKart = k;
                            });
                            if (!hedefKart) hedefKart = document.querySelector('#odaMateryalleri .mat-card') || document.getElementById('odaMateryalleri');
                            
                            if (typeof window.oynatVideo === 'function') {
                                window.oynatVideo(videoLink, baslik, hedefKart);
                            }
                        }, 150);
                    }, 100);
                }
            };
        }

        // 3. PDF NOT VE SUNU HEDEFİ
        if (pdfParam || sunuParam || materyalParam) {
            const aranan = (pdfParam || sunuParam || materyalParam).trim();
            const hedefTur = sunuParam ? 'Sunu' : 'PDF Not';
            const tumMat = tumMateryalleriGetir();

            let bulunan = tumMat.find(m => {
                if (sunuParam && m.tur !== 'Sunu') return false;
                if (pdfParam && m.tur !== 'PDF Not') return false;
                if (slugify(m.baslik) === slugify(aranan)) return true;
                if (m.link && m.link.includes(aranan)) return true;
                return false;
            });

            const hedefUnite = bulunan ? bulunan.uniteId : (uniteParam || 'u1');
            const baslik = bulunan ? bulunan.baslik : decodeURIComponent(aranan);
            const docLink = bulunan ? bulunan.link : aranan;

            return {
                tip: 'pdf',
                id: aranan,
                tur: (bulunan && bulunan.tur) || hedefTur,
                baslik: baslik,
                uniteId: hedefUnite,
                uniteAdi: hedefUnite.toUpperCase() + '. Ünite',
                ikon: hedefTur === 'Sunu' ? 'fa-chalkboard-user' : 'fa-file-pdf',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(hedefUnite);
                    setTimeout(() => {
                        if (typeof window.sekmeDegistir === 'function') window.sekmeDegistir('materyaller');
                        if (typeof window.kategoriSec === 'function') window.kategoriSec(hedefTur);
                        
                        setTimeout(() => {
                            const kartlar = document.querySelectorAll('#odaMateryalleri .mat-card');
                            let hedefKart = null;
                            kartlar.forEach(k => {
                                if (slugify(k.innerText).includes(slugify(baslik))) hedefKart = k;
                            });
                            if (!hedefKart) hedefKart = document.querySelector('#odaMateryalleri .mat-card') || document.getElementById('odaMateryalleri');
                            
                            if (typeof window.oynatPdf === 'function') {
                                window.oynatPdf(docLink, baslik, hedefKart);
                            }
                        }, 150);
                    }, 100);
                }
            };
        }

        // 4. İNTERAKTİF HARİTA HEDEFİ
        if (haritaParam) {
            const aranan = haritaParam.trim();
            const tumMat = tumMateryalleriGetir();
            let bulunan = tumMat.find(m => m.tur === 'İnteraktif Harita' && (m.link === aranan || slugify(m.baslik) === slugify(aranan)));
            
            const haritaId = bulunan ? bulunan.link : aranan;
            const baslik = bulunan ? bulunan.baslik : decodeURIComponent(aranan);
            const hedefUnite = bulunan ? bulunan.uniteId : (uniteParam || 'u1');

            return {
                tip: 'harita',
                id: haritaId,
                tur: 'İnteraktif Harita',
                baslik: baslik,
                uniteId: hedefUnite,
                uniteAdi: hedefUnite.toUpperCase() + '. Ünite',
                ikon: 'fa-map-location-dot',
                ac: function () {
                    if (typeof window.acHarita === 'function') {
                        window.acHarita(haritaId, baslik);
                    }
                }
            };
        }

        // 5. OYUN VE SİMÜLASYON HEDEFİ
        if (oyunParam) {
            const aranan = oyunParam.trim();
            const hedefUnite = uniteParam || 'u1';
            let baslik = decodeURIComponent(aranan);

            return {
                tip: 'oyun',
                id: aranan,
                tur: 'Tarih Oyunu / Simülasyon',
                baslik: baslik,
                uniteId: hedefUnite,
                uniteAdi: hedefUnite.toUpperCase() + '. Ünite',
                ikon: 'fa-gamepad',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(hedefUnite);
                    setTimeout(() => {
                        if (typeof window.sekmeDegistir === 'function') window.sekmeDegistir('materyaller');
                        if (typeof window.kategoriSec === 'function') window.kategoriSec('Oyunlar');

                        // Standart oyun başlatıcı fonksiyonları dene
                        const funcName = 'baslat' + aranan.charAt(0).toUpperCase() + aranan.slice(1);
                        if (typeof window[funcName] === 'function') {
                            window[funcName]();
                        } else if (typeof window[aranan] === 'function') {
                            window[aranan]();
                        } else if (window.HARITA_MOTORU && typeof window.HARITA_MOTORU[aranan] === 'function') {
                            window.acHarita(aranan, baslik);
                        }
                    }, 120);
                }
            };
        }

        // 6. FLASHCARD (BİLGİ KARTLARI)
        if (kartParam) {
            const odaId = kartParam.trim();
            return {
                tip: 'kart',
                id: odaId,
                tur: 'Kavram / Bilgi Kartları',
                baslik: odaId.toUpperCase() + '. Ünite Kavram Kartları',
                uniteId: odaId,
                uniteAdi: odaId.toUpperCase() + '. Ünite',
                ikon: 'fa-clone',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(odaId);
                    setTimeout(() => {
                        if (typeof window.baslatFlashcard === 'function') window.baslatFlashcard(odaId);
                    }, 150);
                }
            };
        }

        // 7. SÖZLÜK
        if (sozlukParam) {
            const aranan = decodeURIComponent(sozlukParam.trim());
            return {
                tip: 'sozluk',
                id: aranan,
                tur: 'Tarih Terimleri Sözlüğü',
                baslik: `"${aranan}" Terim Analizi`,
                uniteId: 'genel',
                uniteAdi: 'Sözlük',
                ikon: 'fa-book-open',
                ac: function () {
                    if (typeof window.sozlukGoster === 'function') {
                        window.sozlukGoster();
                        const inp = document.getElementById('sozlukArama');
                        if (inp) {
                            inp.value = aranan;
                            if (typeof window.kavramAra === 'function') window.kavramAra();
                        }
                    }
                }
            };
        }

        // 8. DOĞRUDAN ÜNİTE VE KATEGORİ
        if (uniteParam) {
            const uId = uniteParam.trim();
            return {
                tip: 'unite',
                id: uId,
                tur: 'Ders Ünitesi',
                baslik: uId.toUpperCase() + '. Ünite Portalı',
                uniteId: uId,
                uniteAdi: uId.toUpperCase() + '. Ünite',
                ikon: 'fa-folder-open',
                ac: function () {
                    if (typeof window.odayaGir === 'function') window.odayaGir(uId);
                    if (sekmeParam && typeof window.sekmeDegistir === 'function') {
                        setTimeout(() => window.sekmeDegistir(sekmeParam), 100);
                    }
                    if (kategoriParam && typeof window.kategoriSec === 'function') {
                        setTimeout(() => window.kategoriSec(kategoriParam), 200);
                    }
                }
            };
        }

        return null;
    }

    /* ─── GİRİŞ EKRANINDA HEDEF İÇERİK BİLGİLENDİRME KARTINI OLUŞTURMA ─── */
    function hedefBannerGoster(hedef) {
        if (!hedef) return;
        
        let mevcutKart = document.getElementById('hedefIcerikKarti');
        if (mevcutKart) mevcutKart.remove();

        const banner = document.createElement('div');
        banner.id = 'hedefIcerikKarti';
        banner.className = 'hedef-icerik-karti';
        banner.setAttribute('role', 'status');
        banner.setAttribute('aria-live', 'polite');

        banner.innerHTML = `
            <div class="hedef-icerik-ikon">
                <i class="fa-solid ${hedef.ikon || 'fa-compass'}"></i>
            </div>
            <div class="hedef-icerik-govde">
                <div class="hedef-icerik-rozet-satir">
                    <span class="hedef-icerik-rozet"><i class="fa-solid fa-arrow-right-to-bracket"></i> ${hedef.tur}</span>
                    <span class="hedef-icerik-unite-rozet">${hedef.uniteAdi}</span>
                </div>
                <div class="hedef-icerik-baslik">${hedef.baslik}</div>
                <p class="hedef-icerik-aciklama">
                    Öğretmeninizin paylaştığı bu içeriğe ulaşmak için bilgilerinizi giriniz. 
                    <strong>Giriş yaptığınızda içerik doğrudan açılacaktır.</strong>
                </p>
            </div>
            <button type="button" class="hedef-icerik-iptal-btn" title="Hedefi Kapat" onclick="document.getElementById('hedefIcerikKarti').remove();">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Giriş kartının en üstüne yerleştir (hem 9. hem 10. sınıf şablonuyla uyumlu)
        const hedefYuva = document.getElementById('ogrenciGirisFormu') ||
                          document.querySelector('.egypt-card') ||
                          document.querySelector('.ott-card') ||
                          document.getElementById('girisEkrani');

        if (hedefYuva) {
            if (hedefYuva.id === 'ogrenciGirisFormu') {
                hedefYuva.parentNode.insertBefore(banner, hedefYuva);
            } else {
                hedefYuva.insertBefore(banner, hedefYuva.firstChild);
            }
        }
    }

    /* ─── CANLI URL SENKRONİZASYONU (history.replaceState) ─── */
    function urlGuncelle(params) {
        if (urlGuncellemeDevreDisi) return;
        if (!window.history || !window.history.replaceState) return;

        try {
            const url = new URL(window.location.href);
            // Dinamik yönlendirme anahtarlarını temizle
            ['test', 'sinav', 'video', 'pdf', 'sunu', 'materyal', 'harita', 'oyun', 'kart', 'flashcard', 'sozluk', 'unite', 'sekme', 'kategori'].forEach(p => url.searchParams.delete(p));
            
            if (params && typeof params === 'object') {
                for (const [k, v] of Object.entries(params)) {
                    if (v !== null && v !== undefined && v !== '') {
                        url.searchParams.set(k, v);
                    }
                }
            }

            // Hash'i temizle
            url.hash = '';

            window.history.replaceState(null, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
        } catch (e) {
            console.warn("URL güncellenirken hata:", e);
        }
    }

    /* ─── TOAST BİLDİRİMİ ─── */
    function toastGoster(baslik, aciklama) {
        let toast = document.getElementById('dinamikUrlToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dinamikUrlToast';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div class="toast-ikon"><i class="fa-solid fa-check"></i></div>
            <div class="toast-govde">
                <span class="toast-baslik">${baslik}</span>
                <span class="toast-aciklama">${aciklama}</span>
            </div>
        `;

        toast.classList.add('aktif');

        if (window.__toastZamanlayici) clearTimeout(window.__toastZamanlayici);
        window.__toastZamanlayici = setTimeout(() => {
            toast.classList.remove('aktif');
        }, 3200);
    }

    /* ─── DOĞRUDAN PAYLAŞIM LİNKİ KOPYALAYICI ─── */
    function linkKopyala(paramKey, paramVal, baslik) {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set(paramKey, paramVal);
        const link = url.toString();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                toastGoster("Bağlantı Panoya Kopyalandı!", `"${baslik || paramVal}" içeriğinin direkt linki kopyalandı. Öğrencilerinizle paylaşabilirsiniz.`);
            }).catch(() => {
                prompt("Aşağıdaki bağlantıyı kopyalayabilirsiniz:", link);
            });
        } else {
            prompt("Aşağıdaki bağlantıyı kopyalayabilirsiniz:", link);
        }
    }

    /* ─── OTOMATİK DOM GELİŞTİRİCİSİ (Share Buttons Injection) ─── */
    function domPaylasimButonlariniEkle() {
        // 1. Test satırlarına paylaş butonu entegrasyonu
        const testSatirlari = document.querySelectorAll('.test-item-row');
        testSatirlari.forEach(satir => {
            if (satir.querySelector('.test-item-share-btn')) return;
            const baslaBtn = satir.querySelector('.test-item-start-btn');
            if (!baslaBtn) return;

            const onclickAttr = baslaBtn.getAttribute('onclick') || '';
            const match = onclickAttr.match(/testSec\(['"]([^'"]+)['"]\)/);
            if (!match) return;

            const testId = match[1];
            const baslikEl = satir.querySelector('.test-item-title');
            const baslik = baslikEl ? baslikEl.innerText.replace('Çözüldü', '').trim() : testId;

            let actionsContainer = satir.querySelector('.test-item-actions');
            if (!actionsContainer) {
                actionsContainer = document.createElement('div');
                actionsContainer.className = 'test-item-actions';
                baslaBtn.parentNode.insertBefore(actionsContainer, baslaBtn);
                actionsContainer.appendChild(baslaBtn);
            }

            const shareBtn = document.createElement('button');
            shareBtn.type = 'button';
            shareBtn.className = 'test-item-share-btn';
            shareBtn.title = 'Test Bağlantısını Kopyala';
            shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
            shareBtn.onclick = function (e) {
                e.stopPropagation();
                linkKopyala('test', testId, baslik);
            };

            actionsContainer.insertBefore(shareBtn, baslaBtn);
        });

        // 2. Materyal kartlarına paylaş butonu entegrasyonu
        const matKartlari = document.querySelectorAll('.mat-card');
        matKartlari.forEach(kart => {
            if (kart.querySelector('.mat-share-btn')) return;

            const onclickAttr = kart.getAttribute('onclick') || '';
            let paramKey = null;
            let paramVal = null;
            let baslik = '';

            const baslikEl = kart.querySelector('.mat-title');
            if (baslikEl) baslik = baslikEl.innerText.trim();

            if (onclickAttr.includes('oynatVideo')) {
                paramKey = 'video';
                paramVal = baslik;
            } else if (onclickAttr.includes('oynatPdf')) {
                const turEl = kart.querySelector('.mat-type');
                const tur = turEl ? turEl.innerText.trim() : '';
                paramKey = tur === 'Sunu' ? 'sunu' : 'pdf';
                paramVal = baslik;
            } else if (onclickAttr.includes('acHarita')) {
                const match = onclickAttr.match(/acHarita\(['"]([^'"]+)['"]/);
                if (match) {
                    paramKey = 'harita';
                    paramVal = match[1];
                }
            } else if (onclickAttr.includes('oynatPodcast')) {
                paramKey = 'materyal';
                paramVal = baslik;
            }

            if (paramKey && paramVal) {
                const shareBtn = document.createElement('button');
                shareBtn.type = 'button';
                shareBtn.className = 'mat-share-btn';
                shareBtn.title = 'Materyal Bağlantısını Kopyala';
                shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
                shareBtn.onclick = function (e) {
                    e.stopPropagation();
                    linkKopyala(paramKey, paramVal, baslik);
                };
                kart.appendChild(shareBtn);
            }
        });
    }

    /* ─── FONKSİYON SARMALAYICILARI (Orijinal Fonksiyonlara Hook) ─── */
    function motorFonksiyonlariniSarmala() {
        // 1. odayaGir
        const origOdayaGir = window.odayaGir;
        if (typeof origOdayaGir === 'function' && !origOdayaGir.__dinamikUrlHook) {
            window.odayaGir = function (uniteId) {
                urlGuncelle({ unite: uniteId });
                const res = origOdayaGir.apply(this, arguments);
                setTimeout(domPaylasimButonlariniEkle, 80);
                return res;
            };
            window.odayaGir.__dinamikUrlHook = true;
        }

        // 2. salonaDon
        const origSalonaDon = window.salonaDon;
        if (typeof origSalonaDon === 'function' && !origSalonaDon.__dinamikUrlHook) {
            window.salonaDon = function () {
                urlGuncelle(null);
                return origSalonaDon.apply(this, arguments);
            };
            window.salonaDon.__dinamikUrlHook = true;
        }

        // 3. testSec
        const origTestSec = window.testSec;
        if (typeof origTestSec === 'function' && !origTestSec.__dinamikUrlHook) {
            window.testSec = function (testKodu) {
                urlGuncelle({ test: testKodu });
                return origTestSec.apply(this, arguments);
            };
            window.testSec.__dinamikUrlHook = true;
        }

        // 4. testtenCik
        const origTesttenCik = window.testtenCik;
        if (typeof origTesttenCik === 'function' && !origTesttenCik.__dinamikUrlHook) {
            window.testtenCik = function () {
                const res = origTesttenCik.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda } : null);
                return res;
            };
            window.testtenCik.__dinamikUrlHook = true;
        }

        // 5. sinavBitir (Sonuç ekranı)
        const origSinavBitir = window.sinavBitir;
        if (typeof origSinavBitir === 'function' && !origSinavBitir.__dinamikUrlHook) {
            window.sinavBitir = function () {
                const res = origSinavBitir.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda } : null);
                return res;
            };
            window.sinavBitir.__dinamikUrlHook = true;
        }

        // 6. oynatVideo
        const origOynatVideo = window.oynatVideo;
        if (typeof origOynatVideo === 'function' && !origOynatVideo.__dinamikUrlHook) {
            window.oynatVideo = function (url, baslik, element) {
                urlGuncelle({ video: baslik || youtubeIdCikar(url) });
                return origOynatVideo.apply(this, arguments);
            };
            window.oynatVideo.__dinamikUrlHook = true;
        }

        // 7. videoKapat
        const origVideoKapat = window.videoKapat;
        if (typeof origVideoKapat === 'function' && !origVideoKapat.__dinamikUrlHook) {
            window.videoKapat = function () {
                const res = origVideoKapat.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda, sekme: 'materyaller' } : null);
                return res;
            };
            window.videoKapat.__dinamikUrlHook = true;
        }

        // 8. oynatPdf
        const origOynatPdf = window.oynatPdf;
        if (typeof origOynatPdf === 'function' && !origOynatPdf.__dinamikUrlHook) {
            window.oynatPdf = function (url, baslik, element) {
                urlGuncelle({ pdf: baslik });
                return origOynatPdf.apply(this, arguments);
            };
            window.oynatPdf.__dinamikUrlHook = true;
        }

        // 9. pdfKapat
        const origPdfKapat = window.pdfKapat;
        if (typeof origPdfKapat === 'function' && !origPdfKapat.__dinamikUrlHook) {
            window.pdfKapat = function () {
                const res = origPdfKapat.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda, sekme: 'materyaller' } : null);
                return res;
            };
            window.pdfKapat.__dinamikUrlHook = true;
        }

        // 10. acHarita
        const origAcHarita = window.acHarita;
        if (typeof origAcHarita === 'function' && !origAcHarita.__dinamikUrlHook) {
            window.acHarita = function (haritaId, baslik, element) {
                urlGuncelle({ harita: haritaId });
                return origAcHarita.apply(this, arguments);
            };
            window.acHarita.__dinamikUrlHook = true;
        }

        // 11. haritaKapat
        const origHaritaKapat = window.haritaKapat;
        if (typeof origHaritaKapat === 'function' && !origHaritaKapat.__dinamikUrlHook) {
            window.haritaKapat = function () {
                const res = origHaritaKapat.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda } : null);
                return res;
            };
            window.haritaKapat.__dinamikUrlHook = true;
        }

        // 12. baslatFlashcard
        const origBaslatFlashcard = window.baslatFlashcard;
        if (typeof origBaslatFlashcard === 'function' && !origBaslatFlashcard.__dinamikUrlHook) {
            window.baslatFlashcard = function (odaId) {
                urlGuncelle({ kart: odaId });
                return origBaslatFlashcard.apply(this, arguments);
            };
            window.baslatFlashcard.__dinamikUrlHook = true;
        }

        // 13. fcKapat
        const origFcKapat = window.fcKapat;
        if (typeof origFcKapat === 'function' && !origFcKapat.__dinamikUrlHook) {
            window.fcKapat = function () {
                const res = origFcKapat.apply(this, arguments);
                urlGuncelle(window.aktifOda ? { unite: window.aktifOda } : null);
                return res;
            };
            window.fcKapat.__dinamikUrlHook = true;
        }

        // 14. konuFiltrele sonrasında paylaşım butonlarını bağla
        const origKonuFiltrele = window.konuFiltrele;
        if (typeof origKonuFiltrele === 'function' && !origKonuFiltrele.__dinamikUrlHook) {
            window.konuFiltrele = function () {
                const res = origKonuFiltrele.apply(this, arguments);
                setTimeout(domPaylasimButonlariniEkle, 50);
                return res;
            };
            window.konuFiltrele.__dinamikUrlHook = true;
        }

        // 15. kategoriSec sonrasında materyal paylaşım butonlarını bağla
        const origKategoriSec = window.kategoriSec;
        if (typeof origKategoriSec === 'function' && !origKategoriSec.__dinamikUrlHook) {
            window.kategoriSec = function () {
                const res = origKategoriSec.apply(this, arguments);
                setTimeout(domPaylasimButonlariniEkle, 50);
                return res;
            };
            window.kategoriSec.__dinamikUrlHook = true;
        }

        // 16. girisBasariliIslemleri (GİRİŞ YAPILDIĞINDA HEDEFİ AÇ)
        const origGirisBasarili = window.girisBasariliIslemleri;
        if (typeof origGirisBasarili === 'function' && !origGirisBasarili.__dinamikUrlHook) {
            window.girisBasariliIslemleri = function (ogr) {
                const res = origGirisBasarili.apply(this, arguments);

                // Giriş başarılı olunca hedefi çalıştır
                if (bekleyenHedef && typeof bekleyenHedef.ac === 'function') {
                    const hedefKarti = document.getElementById('hedefIcerikKarti');
                    if (hedefKarti) hedefKarti.remove();

                    setTimeout(() => {
                        bekleyenHedef.ac();
                        bekleyenHedef = null;
                    }, 200);
                }
                return res;
            };
            window.girisBasariliIslemleri.__dinamikUrlHook = true;
        }
    }

    /* ─── SİSTEMİ BAŞLATMA VE YÖNLENDİRME AKIŞI ─── */
    function sistemiBaslat() {
        motorFonksiyonlariniSarmala();

        const hedef = hedefiCoz();
        if (!hedef) {
            // Hedef parametre yoksa DOM butonlarını zenginleştir ve bitir
            domPaylasimButonlariniEkle();
            return;
        }

        bekleyenHedef = hedef;

        if (isGirisYapilmis()) {
            // Kullanıcı zaten giriş yapmış -> direkt hedef içeriğe git
            setTimeout(() => {
                hedef.ac();
                bekleyenHedef = null;
            }, 180);
        } else {
            // Kullanıcı henüz giriş yapmamış -> giriş ekranında bilgilendirici kartı göster
            hedefBannerGoster(hedef);
        }

        // DOM değiştikçe paylaşım butonlarını koru
        if (window.MutationObserver) {
            const mo = new MutationObserver(() => domPaylasimButonlariniEkle());
            const odaTestleri = document.getElementById('odaTestleri');
            const odaMateryalleri = document.getElementById('odaMateryalleri');
            if (odaTestleri) mo.observe(odaTestleri, { childList: true });
            if (odaMateryalleri) mo.observe(odaMateryalleri, { childList: true });
        }
    }

    // Dışa aktarılan genel API
    window.DinamikUrl = {
        paylasTest: function (testId, baslik) { linkKopyala('test', testId, baslik); },
        paylasMateryal: function (tur, link, baslik) {
            let key = 'materyal';
            if (tur === 'Video Ders' || tur === 'Belgesel') key = 'video';
            else if (tur === 'Sunu') key = 'sunu';
            else if (tur === 'PDF Not') key = 'pdf';
            else if (tur === 'İnteraktif Harita') key = 'harita';
            linkKopyala(key, baslik, baslik);
        },
        paylasHarita: function (haritaId, baslik) { linkKopyala('harita', haritaId, baslik); },
        linkKopyala: linkKopyala,
        toastGoster: toastGoster,
        yenile: sistemiBaslat
    };

    // Sayfa ve tüm bağımlılıklar yüklendiğinde çalıştır
    if (document.readyState === 'complete') {
        setTimeout(sistemiBaslat, 80);
    } else {
        window.addEventListener('load', () => setTimeout(sistemiBaslat, 80));
    }
})();
