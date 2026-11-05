/* ═══════════════════════════════════════════════════════════════
   TARİH PORTALI – İNTERAKTİF KULLANIM REHBERİ (Vanilla JS)
   - Ana tur: yalnızca bir kez gösterilir (localStorage: 'rehberIzlendi'),
     sayfalar arası ilerleme 'rehberAdim' anahtarında tutulur
   - Ödev turu: "Ödev / Çalışma Gönder" butonuna tıklanınca bir kez gösterilir
     (localStorage: 'rehberOdevIzlendi')
   - Gerekli HTML: #rehber-overlay, #rehber-kutusu (#rehber-metin, #rehber-ileri,
     #rehber-atla, #rehber-sayac) ve stiller/rehber.css
   - Menülerdeki "Tanıtım Turu" butonları window.rehberiBaslat() çağırır
═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    // Sınıf sayfalarında giriş ekranı (#girisEkrani) bulunur; ana sayfada bulunmaz.
    var SAYFA = document.getElementById('girisEkrani') ? 'sinif' : 'index';

    /* ── Ana tur adımları ──
       sayfa        : adımın gösterileceği sayfa türü
       secici       : hedef elementin CSS seçicisi (virgülle birden fazla aday)
       id           : hedefte ID yoksa atanacak mantıklı ID
       girisGerekli : hedef sadece giriş yapıldıktan sonra görünür (görünmüyorsa bekle) */
    var ANA_ADIMLAR = [
        {
            sayfa: 'index',
            secici: '.monolith-stage',
            id: 'rehber-sinif-kartlari',
            metin: 'Tarih Portalına hoş geldiniz! Öncelikle kendi sınıf seviyenizi seçerek ilgili portala giriş yapın.'
        },
        {
            sayfa: 'sinif',
            secici: '#girisEkrani .bal-card, #girisEkrani .egypt-card, #girisEkrani .ott-card, #ogrenciGirisFormu',
            id: 'rehber-giris-formu',
            metin: 'Bilgilerinizi ve size verilen şifreyi eksiksiz girerek sisteme giriş yapabilirsiniz.'
        },
        {
            sayfa: 'sinif',
            secici: '.odev-btn',
            id: 'rehber-odev-butonu',
            girisGerekli: true,
            metin: 'Öğretmeninize iletmeniz gereken proje, ödev ve çalışmaları bu butonu kullanarak gönderebilirsiniz.'
        },
        {
            sayfa: 'sinif',
            secici: '#btnHamburger',
            id: 'rehber-menu-butonu',
            metin: 'Güvenliğiniz için sisteme ilk girişinizden sonra sağ üst menüden şifrenizi değiştirmeyi unutmayın. Başarılar dileriz!'
        }
    ];

    /* ── Ödev gönderme turu: 'Ödev / Çalışma Gönder' tıklanınca açılan pencerede ── */
    var ODEV_ADIMLARI = [
        {
            sayfa: 'sinif',
            secici: '#odevModal .upload-area',
            id: 'rehber-odev-dosya-alani',
            metin: 'Bu alana dokunarak defterinizin veya ödevinizin fotoğraflarını ya da PDF dosyasını seçin. Galerinizden birden fazla dosya seçebilirsiniz (en fazla 10 dosya).'
        },
        {
            sayfa: 'sinif',
            secici: '#odevGonderBtn',
            id: 'rehber-odev-gonder-butonu',
            metin: 'Dosyalarınızı seçtikten sonra Gönder butonuna basın. Yükleme çubuğu tamamlanana kadar sayfayı kapatmayın; ödeviniz doğrudan öğretmeninize ulaşacaktır.'
        }
    ];

    var TURLAR = {
        ana:  { adimlar: ANA_ADIMLAR,   bitti: 'rehberIzlendi',      adim: 'rehberAdim' },
        odev: { adimlar: ODEV_ADIMLARI, bitti: 'rehberOdevIzlendi',  adim: null }
    };

    // Aktif tur
    var TUR = 'ana';
    var ADIMLAR = ANA_ADIMLAR;
    var ANAHTAR_BITTI = TURLAR.ana.bitti;
    var ANAHTAR_ADIM  = TURLAR.ana.adim;

    var overlay, kutu, metinEl, ileriBtn, atlaBtn, sayacEl;
    var suankiIndex = -1;
    var suankiHedef = null;
    var vurgulananlar = [];     // { el, siniflar: [] }
    var bekleZamanlayici = null;
    var bildirimZamanlayici = null;
    var konumBekleme = null;
    var rafBekliyor = false;

    /* ── Yardımcılar ── */
    function oku(k)    { if (!k) return null; try { return localStorage.getItem(k); } catch (e) { return null; } }
    function yaz(k, v) { if (!k) return; try { localStorage.setItem(k, v); } catch (e) {} }
    function sil(k)    { if (!k) return; try { localStorage.removeItem(k); } catch (e) {} }

    function turSec(ad) {
        TUR = ad;
        ADIMLAR = TURLAR[ad].adimlar;
        ANAHTAR_BITTI = TURLAR[ad].bitti;
        ANAHTAR_ADIM = TURLAR[ad].adim;
    }

    function gorunurMu(el) {
        if (!el) return false;
        if (!el.getClientRects().length) return false; // display:none zinciri
        var cs = window.getComputedStyle(el);
        return cs.visibility !== 'hidden' && cs.opacity !== '0';
    }

    function girisEkraniAcikMi() {
        return SAYFA === 'sinif' && gorunurMu(document.getElementById('girisEkrani'));
    }

    function turAktifMi() {
        return !!kutu && kutu.classList.contains('aktif') && !kutu.classList.contains('rehber-bildirim');
    }

    function hedefBul(adim) {
        var el = document.querySelector(adim.secici);
        if (el && !el.id && adim.id) el.id = adim.id; // ID yoksa mantıklı bir ID ata
        return el;
    }

    function ilkUygunAdim() {
        for (var i = 0; i < ADIMLAR.length; i++) {
            if (ADIMLAR[i].sayfa === SAYFA) return i;
        }
        return ADIMLAR.length;
    }

    /* ── Vurgu yönetimi ── */
    function yiginOlusturuyorMu(cs) {
        if (cs.position !== 'static') return true;
        return (cs.transform !== 'none' && cs.transform !== '') ||
               (cs.filter !== 'none' && cs.filter !== '') ||
               (cs.backdropFilter && cs.backdropFilter !== 'none') ||
               (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none') ||
               parseFloat(cs.opacity) < 1 ||
               cs.isolation === 'isolate';
    }

    function vurguUygula(el) {
        var cs = window.getComputedStyle(el);
        var kayit = { el: el, siniflar: ['rehber-hedef-aktif'] };
        if (cs.position === 'static') kayit.siniflar.push('rehber-hedef-statik');
        el.classList.add.apply(el.classList, kayit.siniflar);
        vurgulananlar.push(kayit);

        // Hedefin atalarından stacking context oluşturanları overlay'in üstüne çıkar
        var ata = el.parentElement;
        while (ata && ata !== document.body && ata !== document.documentElement) {
            var acs = window.getComputedStyle(ata);
            if (yiginOlusturuyorMu(acs)) {
                var a = { el: ata, siniflar: ['rehber-ata-yigin'] };
                if (acs.position === 'static') a.siniflar.push('rehber-ata-statik');
                ata.classList.add.apply(ata.classList, a.siniflar);
                vurgulananlar.push(a);
            }
            ata = ata.parentElement;
        }
    }

    function vurguKaldir() {
        vurgulananlar.forEach(function (k) {
            k.el.classList.remove.apply(k.el.classList, k.siniflar);
        });
        vurgulananlar = [];
        suankiHedef = null;
    }

    /* ── Kutu konumlandırma ── */
    function kutuKonumla() {
        if (!suankiHedef || !kutu.classList.contains('aktif')) return;
        var r  = suankiHedef.getBoundingClientRect();
        var kw = kutu.offsetWidth, kh = kutu.offsetHeight;
        var vw = window.innerWidth, vh = window.innerHeight;
        var bosluk = 16, kenar = 10;

        var ust = r.bottom + bosluk;                          // önce hedefin altı
        if (ust + kh > vh - kenar) ust = r.top - kh - bosluk; // sığmazsa üstü
        if (ust < kenar) ust = Math.max(kenar, vh - kh - 14); // yine olmazsa ekranın altı

        var sol = r.left + r.width / 2 - kw / 2;
        sol = Math.min(Math.max(kenar, sol), vw - kw - kenar);

        kutu.style.top  = Math.round(ust) + 'px';
        kutu.style.left = Math.round(sol) + 'px';
    }

    function konumIstegi() {
        if (rafBekliyor) return;
        rafBekliyor = true;
        window.requestAnimationFrame(function () { rafBekliyor = false; kutuKonumla(); });
    }

    /* ── Gösterim ── */
    function gizle() {
        overlay.classList.remove('aktif');
        kutu.classList.remove('aktif');
        kutu.classList.remove('rehber-bildirim');
    }

    function bildirimGoster(metin, sureMs) {
        clearTimeout(bildirimZamanlayici);
        suankiHedef = null;
        overlay.classList.remove('aktif');
        metinEl.textContent = metin;
        sayacEl.textContent = '';
        kutu.classList.add('rehber-bildirim', 'aktif');
        kutu.style.left = Math.max(10, (window.innerWidth - kutu.offsetWidth) / 2) + 'px';
        kutu.style.top  = Math.max(10, window.innerHeight - kutu.offsetHeight - 24) + 'px';
        bildirimZamanlayici = setTimeout(function () {
            if (kutu.classList.contains('rehber-bildirim')) gizle();
        }, sureMs || 5000);
    }

    function adimGoster(i, el) {
        clearTimeout(bildirimZamanlayici);
        clearTimeout(konumBekleme);
        vurguKaldir();
        kutu.classList.remove('rehber-bildirim');

        suankiIndex = i;
        suankiHedef = el;
        yaz(ANAHTAR_ADIM, String(i));

        sayacEl.textContent = 'Adım ' + (i + 1) + ' / ' + ADIMLAR.length;
        metinEl.textContent = ADIMLAR[i].metin;
        ileriBtn.textContent = (i === ADIMLAR.length - 1) ? 'Bitir' : 'İleri';

        vurguUygula(el);
        overlay.classList.add('aktif');
        kutu.classList.add('aktif');

        try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
            el.scrollIntoView();
        }
        kutuKonumla();
        // Yumuşak kaydırma bittikten sonra kutuyu hedefin yanına yerleştir
        konumBekleme = setTimeout(kutuKonumla, 550);
    }

    /* Adım başlat. Sonraki adım başka bir sayfadaysa (ana sayfa → sınıf sayfası)
       tur, öğrenci kendi sınıfını seçip sayfaya girene kadar duraklatılır. */
    function adimBaslat(i) {
        clearInterval(bekleZamanlayici);
        while (i < ADIMLAR.length) {
            var adim = ADIMLAR[i];

            if (adim.sayfa !== SAYFA) {
                if (SAYFA === 'index' && adim.sayfa === 'sinif') {
                    sinifSecimiBekle(i);
                } else {
                    gizle();
                }
                return;
            }

            var el = hedefBul(adim);
            if (gorunurMu(el)) { adimGoster(i, el); return; }

            // Hedef şu an DOM'da görünmüyor
            if (adim.girisGerekli && girisEkraniAcikMi()) {
                bekle(i);            // giriş yapılınca otomatik devam
                return;
            }
            i++;                     // başka sebeple yoksa adımı atla
        }
        bitir();
    }

    function sinifSecimiBekle(i) {
        vurguKaldir();
        yaz(ANAHTAR_ADIM, String(i));
        bildirimGoster('Tur duraklatıldı. Lütfen sınıfınızı seçip "Sınıfa Git" ile portala girin; tur orada kaldığı yerden devam edecek.', 9000);
    }

    function bekle(i) {
        var liste = ADIMLAR, tur = TUR;
        vurguKaldir();
        yaz(ANAHTAR_ADIM, String(i));
        bildirimGoster('Rehber, giriş yaptıktan sonra kaldığı yerden devam edecek. Önce sisteme giriş yapın.');
        clearInterval(bekleZamanlayici);
        bekleZamanlayici = setInterval(function () {
            if (gorunurMu(hedefBul(liste[i]))) {
                clearInterval(bekleZamanlayici);
                gizle();
                setTimeout(function () { turSec(tur); adimBaslat(i); }, 500);
            }
        }, 700);
    }

    function bitir() {
        clearInterval(bekleZamanlayici);
        clearTimeout(bildirimZamanlayici);
        vurguKaldir();
        gizle();
        yaz(ANAHTAR_BITTI, '1');
        sil(ANAHTAR_ADIM);
    }

    function ileri() {
        if (suankiIndex < 0) return;
        adimBaslat(suankiIndex + 1);
    }

    /* ── Başlatma ── */
    function kur() {
        if (overlay) return true;
        overlay  = document.getElementById('rehber-overlay');
        kutu     = document.getElementById('rehber-kutusu');
        if (!overlay || !kutu) { overlay = null; return false; }
        metinEl  = document.getElementById('rehber-metin');
        ileriBtn = document.getElementById('rehber-ileri');
        atlaBtn  = document.getElementById('rehber-atla');
        sayacEl  = document.getElementById('rehber-sayac');

        ileriBtn.addEventListener('click', ileri);
        atlaBtn.addEventListener('click', bitir);
        window.addEventListener('resize', konumIstegi);
        window.addEventListener('scroll', konumIstegi, true);

        // "Ödev / Çalışma Gönder" tıklanınca ödev gönderme turunu (bir kez) başlat
        document.addEventListener('click', odevTiklandi);
        return true;
    }

    function odevTiklandi(e) {
        if (!e.target.closest || !e.target.closest('.odev-btn')) return;
        if (turAktifMi() || turuTamamlandiMi('odev')) return;
        setTimeout(function () {
            var modal = document.getElementById('odevModal');
            if (!modal || window.getComputedStyle(modal).display === 'none') return; // giriş yapılmamış vb.
            if (turAktifMi()) return;
            clearInterval(bekleZamanlayici);
            turSec('odev');
            adimBaslat(0);
        }, 350);
    }

    function turuTamamlandiMi(ad) { return oku(TURLAR[ad].bitti) === '1'; }

    function baslangicIndexi() {
        var kayitli = parseInt(oku(ANAHTAR_ADIM), 10);
        if (isNaN(kayitli)) kayitli = 0;
        // Sınıf sayfasına doğrudan gelen öğrenci için ilk uygun adımdan başla
        if (SAYFA === 'sinif' && ADIMLAR[kayitli] && ADIMLAR[kayitli].sayfa !== 'sinif') {
            return ilkUygunAdim();
        }
        return kayitli;
    }

    // Menülerdeki "Tanıtım Turu" butonları ve ana sayfadaki "Turu yeniden başlat" çağırır
    window.rehberiBaslat = function () {
        if (!kur()) return;
        // Açık açılır menüyü kapat
        var dd = document.getElementById('hamburgerDropdown');
        if (dd) dd.classList.remove('active');

        clearInterval(bekleZamanlayici);
        vurguKaldir();
        gizle();
        turSec('ana');
        sil(TURLAR.ana.bitti);
        sil(TURLAR.ana.adim);
        sil(TURLAR.odev.bitti);   // ödev turu da bir sonraki tıklamada yeniden gösterilsin
        adimBaslat(SAYFA === 'index' ? 0 : ilkUygunAdim());
    };

    function otomatikBaslat() {
        if (!kur()) return;
        if (oku(ANAHTAR_BITTI) === '1') return;     // sadece bir kez göster
        setTimeout(function () { adimBaslat(baslangicIndexi()); }, 700);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', otomatikBaslat);
    } else {
        otomatikBaslat();
    }
})();
