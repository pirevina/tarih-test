/* ═══════════════════════════════════════════════════════════════
   ÜNİTE KİLİDİ VE MASTER YÖNETİM SİSTEMİ (V2.1)
   - 9. ve 10. sınıflarda ünite erişim kontrolü
   - Kilitli üniteler SADECE Murat Mutlu kullanıcısına açıktır
   - Öğrencilere VE Zümre öğretmenlerine kilitli üniteler tamamen kapalıdır
   - Kilitli üniteye tıklandığında uyarı modalı gösterilir:
     "Konularımız ilerledikçe öğretmeniniz bu üniteyi kullanımınıza açacaktır."
   - Murat Mutlu üniteyi açtığında (toggle Açık yapıldığında)
     hem öğrenciler hem zümreler üniteye serbestçe erişebilir.
═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    // Varsayılan kilit listesi (Ünite 1 açık, Ünite 2 ve 3 kilitli)
    var VARSAYILAN_KILITLI = ["u3"];
    var MESAJ = 'Konularımız ilerledikçe öğretmeniniz bu üniteyi kullanımınıza açacaktır.';
    var YONETICI_AD = 'Murat Mutlu (Öğretmen)';

    // Sınıf seviyesi (URL'den 9 veya 10 tespit edilir)
    function getSinifNo() {
        var match = window.location.pathname.match(/sinif(\d+)/);
        return match ? match[1] : '9';
    }

    /* Giriş yapan kişi SADECE Murat Mutlu mu? */
    function isMuratMutlu() {
        try {
            if (typeof ogrenci !== 'undefined' && ogrenci && ogrenci.ad) {
                var ad = ogrenci.ad.toLocaleLowerCase('tr-TR');
                if (ad.indexOf('murat') !== -1 && ad.indexOf('mutlu') !== -1) return true;
            }
        } catch (e) {}
        try {
            var kayit = localStorage.getItem('globalZumreOturumu');
            if (kayit) {
                var o = JSON.parse(kayit);
                if (o && o.ad) {
                    var ad = o.ad.toLocaleLowerCase('tr-TR');
                    if (ad.indexOf('murat') !== -1 && ad.indexOf('mutlu') !== -1) return true;
                }
            }
        } catch (e) {}
        return false;
    }

    // Aktif kilitli listesini getir
    function kilitliListesiGetir() {
        var sNo = getSinifNo();

        // 1. Öncelik: localStorage (Öğretmenin tarayıcıdaki son ayarı)
        try {
            var ozel = localStorage.getItem('portal_kilit_ayarlari_sinif' + sNo);
            if (ozel) {
                var p1 = JSON.parse(ozel);
                if (Array.isArray(p1)) return p1;
            }
            var genel = localStorage.getItem('portal_kilit_ayarlari');
            if (genel) {
                var p2 = JSON.parse(genel);
                if (Array.isArray(p2)) return p2;
            }
        } catch (e) {}

        // 2. Öncelik: kilit_verisi.js dosyasından yüklenen merkezi veri
        try {
            if (window.PORTAL_KILIT_VERISI) {
                var key = 'sinif' + sNo;
                if (window.PORTAL_KILIT_VERISI[key] && Array.isArray(window.PORTAL_KILIT_VERISI[key].kilitli)) {
                    return window.PORTAL_KILIT_VERISI[key].kilitli.slice();
                }
            }
        } catch (e) {}

        // 3. Öncelik: Varsayılan liste
        return VARSAYILAN_KILITLI.slice();
    }

    var KILITLI = kilitliListesiGetir();
    var modal;
    var yonetimModal;

    /* ─── SUNUCUDAN KİLİT DURUMU SENKRONİZASYONU ─── */
    function sunucudanKilitDurumuYukle(cb) {
        var sNo = getSinifNo();
        fetch('kilit_durumu.json?t=' + Date.now(), { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('Ağ hatası');
                return res.json();
            })
            .then(function (data) {
                if (data) {
                    var key = 'sinif' + sNo;
                    if (data[key] && Array.isArray(data[key].kilitli)) {
                        KILITLI = data[key].kilitli;
                        try {
                            localStorage.setItem('portal_kilit_ayarlari_sinif' + sNo, JSON.stringify(KILITLI));
                            localStorage.setItem('portal_kilit_ayarlari', JSON.stringify(KILITLI));
                        } catch (e) {}
                        kartlariGuncelle();
                        if (typeof cb === 'function') cb(null, KILITLI);
                        return;
                    }
                }
                if (typeof cb === 'function') cb(null, KILITLI);
            })
            .catch(function (err) {
                if (typeof cb === 'function') cb(err, KILITLI);
            });
    }

    /* ─── KİLİT UYARI MODALI (ÖĞRENCİ VE ZÜMRELER İÇİN) ─── */
    function modalKur() {
        if (modal) return;
        modal = document.createElement('div');
        modal.id = 'uniteKilitModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML =
            '<div class="unite-kilit-kutu">' +
                '<div class="unite-kilit-ikon"><i class="fa-solid fa-lock"></i></div>' +
                '<h3 class="unite-kilit-baslik">Bu Ünite Henüz Açılmadı</h3>' +
                '<p class="unite-kilit-metin"></p>' +
                '<button type="button" class="unite-kilit-btn">Anladım</button>' +
            '</div>';
        modal.querySelector('.unite-kilit-metin').textContent = MESAJ;
        document.body.appendChild(modal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target.classList.contains('unite-kilit-btn')) kapat();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') kapat();
        });
    }

    function uyariGoster() {
        modalKur();
        modal.classList.add('aktif');
    }

    function kapat() {
        if (modal) modal.classList.remove('aktif');
    }

    /* ─── KARTLARI GÜNCELLE ─── */
    function kartlariGuncelle() {
        KILITLI = kilitliListesiGetir();
        var admin = isMuratMutlu();
        var tumKlasorler = ['u1', 'u2', 'u3'];

        tumKlasorler.forEach(function (id) {
            var btn = document.querySelector('.folder-btn[onclick*="\'' + id + '\'"]');
            if (btn) {
                // Murat Mutlu için kilitler etkisizdir. Öğrenci ve zümreler için listedeyse kilitlenir.
                var kilitliMi = !admin && KILITLI.indexOf(id) !== -1;
                btn.classList.toggle('unite-kilitli', kilitliMi);
            }
        });

        // Yönetim butonunu göster/gizle
        yonetimButonunuGuncelle();
    }

    /* ─── MURAT MUTLU İÇİN YÖNETİM BUTONUNU YERLEŞTİR ─── */
    function yonetimButonunuGuncelle() {
        var admin = isMuratMutlu();
        var pill = document.getElementById('btnKilitYonetimPill');
        var dropItem = document.getElementById('btnKilitYonetimDropdown');

        if (admin) {
            // 1. Hoşgeldin başlığının yanındaki pill buton
            if (!pill) {
                var span = document.getElementById('kullaniciAdiSpan');
                if (span && span.parentNode) {
                    pill = document.createElement('button');
                    pill.id = 'btnKilitYonetimPill';
                    pill.className = 'kilit-yonetim-pill';
                    pill.type = 'button';
                    pill.title = 'Öğrenci ve Zümrelerin erişebileceği üniteleri yönet';
                    pill.innerHTML = '<i class="fa-solid fa-lock-open"></i> Ünite Kilitleri';
                    pill.onclick = uniteKilitYonetimGoster;
                    span.parentNode.appendChild(pill);
                }
            }

            // 2. Hamburger menü içindeki yönetim öğesi
            if (!dropItem) {
                var drop = document.getElementById('hamburgerDropdown');
                if (drop) {
                    dropItem = document.createElement('button');
                    dropItem.id = 'btnKilitYonetimDropdown';
                    dropItem.className = 'dropdown-item';
                    dropItem.type = 'button';
                    dropItem.innerHTML = '<i class="fa-solid fa-sliders" style="color:#d4af37;"></i> Ünite Kilit Ayarları';
                    dropItem.onclick = function () {
                        if (typeof menuToggle === 'function') {
                            var h = document.getElementById('hamburgerDropdown');
                            if (h) h.classList.remove('active');
                        }
                        uniteKilitYonetimGoster();
                    };
                    drop.appendChild(dropItem);
                }
            }
        } else {
            if (pill) pill.remove();
            if (dropItem) dropItem.remove();
        }
    }

    /* ─── MURAT MUTLU ÜNİTE KİLİT YÖNETİM MODALI ─── */
    function uniteKilitYonetimGoster() {
        var sNo = getSinifNo();
        KILITLI = kilitliListesiGetir();

        var unitBilgileri = sNo === '10' ? [
            { id: 'u1', ad: '1. Ünite', desc: "Türkistan'dan Türkiye'ye (1040-1299)", zorunluAcik: true },
            { id: 'u2', ad: '2. Ünite', desc: "Beylikten Devlete Osmanlı (1299-1453)", zorunluAcik: false },
            { id: 'u3', ad: '3. Ünite', desc: "Cihan Devleti Osmanlı (1453-1683)", zorunluAcik: false }
        ] : [
            { id: 'u1', ad: '1. Ünite', desc: "Geçmişin İnşa Sürecinde Tarih", zorunluAcik: true },
            { id: 'u2', ad: '2. Ünite', desc: "Eski Çağ Medeniyetleri", zorunluAcik: false },
            { id: 'u3', ad: '3. Ünite', desc: "Orta Çağ Medeniyetleri", zorunluAcik: false }
        ];

        if (!yonetimModal) {
            yonetimModal = document.createElement('div');
            yonetimModal.id = 'uniteKilitYonetimModal';
            yonetimModal.setAttribute('role', 'dialog');
            yonetimModal.setAttribute('aria-modal', 'true');
            document.body.appendChild(yonetimModal);

            yonetimModal.addEventListener('click', function (e) {
                if (e.target === yonetimModal) yonetimModalKapat();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && yonetimModal.classList.contains('aktif')) yonetimModalKapat();
            });
        }

        var html = '<div class="kilit-yonetim-kutu">' +
            '<div class="kilit-yonetim-ust">' +
                '<h3 class="kilit-yonetim-baslik"><i class="fa-solid fa-shield-halved"></i> ' + sNo + '. Sınıf Ünite Kilitleri</h3>' +
                '<button type="button" class="kilit-yonetim-kapat" onclick="window.uniteKilitYonetimKapat()"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>' +
            '<p class="kilit-yonetim-aciklama">Öğrenci ve zümrelerin erişebileceği üniteleri seçiniz. <strong>Açık</strong> yapılan üniteler tüm kullanıcılara anında aktif olur.</p>' +
            '<div class="kilit-yonetim-liste">';

        unitBilgileri.forEach(function (u) {
            var kilitli = !u.zorunluAcik && KILITLI.indexOf(u.id) !== -1;
            var durumMetni = kilitli ? 'Kilitli' : 'Açık';
            var durumSinif = kilitli ? 'durum-kilitli' : 'durum-acik';

            html += '<div class="kilit-yonetim-satir">' +
                '<div class="kilit-unite-bilgi">' +
                    '<span class="kilit-unite-ad">' + u.ad + ' — ' + u.desc + '</span>' +
                    '<span class="kilit-unite-aciklama">' + (u.zorunluAcik ? 'Temel ünite (Her zaman açık)' : 'Erişim durumu') + '</span>' +
                '</div>' +
                '<div class="kilit-toggle-wrap">';

            if (u.zorunluAcik) {
                html += '<span class="kilit-durum-rozet durum-acik"><i class="fa-solid fa-check"></i> Her Zaman Açık</span>';
            } else {
                html += '<span class="kilit-durum-rozet ' + durumSinif + '" id="rozet_' + u.id + '">' + durumMetni + '</span>' +
                    '<label class="kilit-toggle">' +
                        '<input type="checkbox" id="chk_' + u.id + '" ' + (!kilitli ? 'checked' : '') + ' onchange="window._kilitDurumDegisti(\'' + u.id + '\', this.checked)">' +
                        '<span class="kilit-toggle-slider"></span>' +
                    '</label>';
            }
            html += '</div></div>';
        });

        html += '</div>' +
            '<button type="button" class="kilit-yonetim-btn-kaydet" onclick="window.uniteKilitKaydet()"><i class="fa-solid fa-floppy-disk"></i> Değişiklikleri Kaydet ve Uygula</button>' +
            '<div class="kilit-yonetim-toast" id="kilitYonetimToast"></div>' +
        '</div>';

        yonetimModal.innerHTML = html;
        yonetimModal.classList.add('aktif');
    }

    function yonetimModalKapat() {
        if (yonetimModal) yonetimModal.classList.remove('aktif');
    }

    // Toggle değiştiğinde rozet metnini ve rengini anında güncelle
    window._kilitDurumDegisti = function (uniteId, acikMi) {
        var rozet = document.getElementById('rozet_' + uniteId);
        if (rozet) {
            rozet.textContent = acikMi ? 'Açık' : 'Kilitli';
            rozet.className = 'kilit-durum-rozet ' + (acikMi ? 'durum-acik' : 'durum-kilitli');
        }
    };

    // Değişiklikleri kaydet ve hem yerel hem sunucuya senkronize et
    window.uniteKilitKaydet = function () {
        var sNo = getSinifNo();
        var yeniKilitli = [];

        ['u2', 'u3'].forEach(function (id) {
            var chk = document.getElementById('chk_' + id);
            // Checkbox işaretli DEĞİLSE ünite kilitlidir
            if (chk && !chk.checked) {
                yeniKilitli.push(id);
            }
        });

        KILITLI = yeniKilitli;

        // 1. window nesnesini güncelle
        try {
            if (window.PORTAL_KILIT_VERISI) {
                var key = 'sinif' + sNo;
                if (!window.PORTAL_KILIT_VERISI[key]) window.PORTAL_KILIT_VERISI[key] = {};
                window.PORTAL_KILIT_VERISI[key].kilitli = yeniKilitli;
            }
        } catch (e) {}

        // 2. localStorage kaydet
        try {
            localStorage.setItem('portal_kilit_ayarlari_sinif' + sNo, JSON.stringify(yeniKilitli));
            localStorage.setItem('portal_kilit_ayarlari', JSON.stringify(yeniKilitli));
        } catch (e) {}

        // 3. Sunucuya POST at
        try {
            fetch('/api/unite-kilit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kilitli: yeniKilitli, sinif: sNo, guncelleyen: YONETICI_AD })
            }).catch(function () {});
        } catch (e) {}

        kartlariGuncelle();

        var toast = document.getElementById('kilitYonetimToast');
        if (toast) {
            var mesaj = yeniKilitli.length === 0 
                ? 'Tüm üniteler başarıyla kullanıma açıldı!' 
                : 'Ayarlar güncellendi! Kilitli: ' + yeniKilitli.map(function(k){ return k.toUpperCase(); }).join(', ');
            toast.textContent = '✅ ' + mesaj;
            toast.className = 'kilit-yonetim-toast basarili';
        }

        setTimeout(function () {
            yonetimModalKapat();
        }, 1100);
    };

    window.uniteKilitYonetimGoster = uniteKilitYonetimGoster;
    window.uniteKilitYonetimKapat = yonetimModalKapat;
    window.sunucudanKilitDurumuYukle = sunucudanKilitDurumuYukle;

    function kur() {
        // Tüm giriş noktalarını kapsamak için odayaGir'i sarmala
        var orijinal = window.odayaGir;
        if (typeof orijinal === 'function' && !orijinal.__uniteKilitli) {
            window.odayaGir = function (uniteId) {
                // SADECE Murat Mutlu kilitli üniteye doğrudan girebilir
                if (isMuratMutlu()) {
                    return orijinal.apply(this, arguments);
                }

                // Öğrenciler VE Zümreler için kilit kontrolü
                KILITLI = kilitliListesiGetir();
                if (KILITLI.indexOf(uniteId) !== -1) {
                    uyariGoster();
                    return;
                }
                return orijinal.apply(this, arguments);
            };
            window.odayaGir.__uniteKilitli = true;
        }

        // Sayfa yüklendiğinde sunucudan güncel durumu çek
        sunucudanKilitDurumuYukle(function () {
            kartlariGuncelle();
        });

        kartlariGuncelle();

        // Giriş/çıkış veya DOM değişimlerinde kart ve buton görünümünü tazele
        if (window.MutationObserver) {
            var mo = new MutationObserver(kartlariGuncelle);
            ['girisEkrani', 'menuEkrani'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
            });
        }

        // Pencereye veya sekmeye geri dönüldüğünde canlı senkronize et
        window.addEventListener('focus', function () {
            sunucudanKilitDurumuYukle();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur);
    else kur();
})();
