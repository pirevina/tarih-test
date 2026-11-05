// Tüm harita çizim fonksiyonlarımızı tutan ana obje
window.HARITA_MOTORU = {
    
    // 1. HARİTA: KAVİMLER GÖÇÜ
    "kavimler_gocu": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center;">
                <label for="yearSlider" style="font-size: 1.1em; color: var(--text-color);">
                    <b>Yıl: <span id="yearDisplay" style="color: #2ecc71;">370</span></b>
                </label><br>
                <input type="range" id="yearSlider" min="370" max="600" value="370" step="1" style="width: 90%; cursor: pointer; accent-color: #2ecc71;">
                <p style="font-size: 0.85em; opacity: 0.7; margin-top: 5px;">Zamanı ilerletmek için kaydırıcıyı sağa doğru çekin.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Harita instance'ını global değişkene ata
        window.currentMapInstance = L.map('mapCanvas').setView([47.0, 15.0], 4);

// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const kavimlerVerisi = [
            { isim: "Hunlar", renk: "red", startYear: 375, endYear: 453, bilgi: "Avrupa'ya ilerleyerek büyük göçü başlattılar.", rota: [[48.0, 60.0], [48.5, 53.0], [49.0, 48.0], [48.0, 43.0], [47.5, 38.0], [46.0, 32.0], [47.0, 25.0], [47.0, 19.0]] },
            { isim: "Vizigotlar", renk: "blue", startYear: 376, endYear: 418, bilgi: "Balkanlardan İtalya'ya geçip Roma'yı yağmaladıktan sonra İspanya'ya ulaştılar.", rota: [[45.0, 28.0], [43.0, 27.0], [41.0, 28.0], [39.0, 22.0], [41.0, 20.0], [43.0, 15.0], [45.0, 12.0], [41.9, 12.5], [44.0, 8.0], [43.0, 4.0], [41.0, -2.0], [39.0, -4.0]] },
            { isim: "Vandallar", renk: "orange", startYear: 406, endYear: 439, bilgi: "Kuzey Afrika'ya geçip Kartaca merkezli devlet kurdular.", rota: [[52.0, 15.0], [50.0, 10.0], [48.0, 5.0], [45.0, 2.0], [42.0, 0.0], [40.0, -4.0], [36.0, -5.0], [36.8, 10.1]] },
            { isim: "Ostrogotlar", renk: "purple", startYear: 453, endYear: 493, bilgi: "İtalya'ya yönelerek Batı Roma'nın kalbinde krallık kurdular.", rota: [[47.0, 30.0], [46.0, 25.0], [44.0, 22.0], [45.0, 15.0], [44.0, 11.0], [41.9, 12.5]] },
            { isim: "Franklar", renk: "green", startYear: 420, endYear: 509, bilgi: "Bugünkü Fransa topraklarına yerleşip güçlü bir krallık kurdular.", rota: [[51.0, 7.0], [50.0, 5.0], [48.8, 2.3], [46.0, 1.0]] }
        ];

        let kavimCizgileri = {};
        kavimlerVerisi.forEach(kavim => {
            kavimCizgileri[kavim.isim] = L.polyline([], {color: kavim.renk, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${kavim.isim}</b><br>${kavim.bilgi}`);
        });

        function haritayiYilaGoreGuncelle(guncelYil) {
            kavimlerVerisi.forEach(kavim => {
                let gosterilecekRota = [];
                if (guncelYil >= kavim.endYear) {
                    gosterilecekRota = kavim.rota;
                } else if (guncelYil > kavim.startYear) {
                    let oran = (guncelYil - kavim.startYear) / (kavim.endYear - kavim.startYear);
                    let hedefIndex = Math.floor(kavim.rota.length * oran);
                    if (hedefIndex === 0 && oran > 0) hedefIndex = 1; 
                    gosterilecekRota = kavim.rota.slice(0, hedefIndex + 1);
                }
                kavimCizgileri[kavim.isim].setLatLngs(gosterilecekRota);
            });
        }

        document.getElementById('yearSlider').addEventListener('input', function(e) {
            const secilenYil = parseInt(e.target.value);
            document.getElementById('yearDisplay').innerText = secilenYil;
            haritayiYilaGoreGuncelle(secilenYil);
        });

        haritayiYilaGoreGuncelle(370); 
        
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Kavimler</h4>';
            kavimlerVerisi.forEach(k => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${k.renk}; width: 15px; height: 3px; display: inline-block; margin-right: 5px;"></i> ${k.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },

    // 2. HARİTA: TİCARET YOLLARI
    "ticaret_yollari": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Tarihi değiştiren büyük ticaret ağları. Detaylar için rotaların üzerine tıklayın.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        window.currentMapInstance = L.map('mapCanvas').setView([35.0, 50.0], 3);

// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const yollar = [
            { isim: "İpek Yolu", renk: "#e74c3c", bilgi: "Çin'den başlayarak Orta Asya üzerinden Avrupa'ya uzanan, ipek, porselen ve kağıt taşınan devasa ticaret ağı.", rota: [[34.2, 108.9], [40.1, 94.6], [39.4, 75.9], [39.6, 66.9], [37.6, 61.8], [35.5, 51.4], [33.3, 44.4], [36.2, 36.1], [41.0, 28.9]] },
            { isim: "Baharat Yolu", renk: "#f39c12", bilgi: "Hindistan'dan başlayıp deniz yoluyla Kızıldeniz'e, oradan İskenderiye üzerinden Avrupa'ya uzanan baharat hattı.", rota: [[11.2, 75.7], [15.0, 65.0], [12.7, 45.0], [20.0, 38.0], [31.2, 29.9], [35.0, 20.0], [45.4, 12.3]] },
            { isim: "Kral Yolu", renk: "#9b59b6", bilgi: "Sardes'ten (Manisa) başlayıp Pers başkenti Susa'ya uzanan, tarihin ilk büyük sistemli posta ve ticaret yolu.", rota: [[38.4, 28.0], [38.6, 31.9], [40.0, 34.6], [38.3, 38.3], [36.3, 43.1], [32.1, 48.2]] },
            { isim: "Kürk Yolu", renk: "#3498db", bilgi: "Sibirya ve Ural dağlarından başlayarak güneye, Hazar ve Karadeniz'e inen kuzey ticaret hattı.", rota: [[60.0, 70.0], [55.0, 60.0], [51.0, 51.0], [46.3, 48.0], [47.0, 39.0], [45.3, 34.4]] }
        ];

        yollar.forEach(yol => {
            L.polyline(yol.rota, {color: yol.renk, weight: 5, opacity: 0.8})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${yol.isim}</b><br>${yol.bilgi}`);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Ticaret Yolları</h4>';
            yollar.forEach(y => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${y.renk}; width: 15px; height: 3px; display: inline-block; margin-right: 5px;"></i> ${y.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },
	// 3. HARİTA: MEZOPOTAMYA UYGARLIKLARI
    "mezopotamya_uygarliklari": function() {
        // Kontrol paneli içeriğini ayarla
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Kadim Mezopotamya topraklarında kurulan uygarlıkları keşfedin. Detaylar için bölgelerin üzerine tıklayın.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Haritayı Mezopotamya üzerine odaklayarak başlat
        window.currentMapInstance = L.map('mapCanvas').setView([33.5, 43.5], 6);

        // Tarihi parşömen dokusunu yansıtan bir Leaflet-TileLayer ekle (Opsiyonel)
        // L.tileLayer('url_to_textured_tile_layer').addTo(window.currentMapInstance);
        // Varsayılan tile layer'ı kullan:
// Türkçe dil destekli ve Tarihi/Fiziki (Terrain) görünümlü harita altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        // Uygarlık verileri: Poligonlar ve Bilgiler
        const uygarliklar = [
            {
                isim: "Sümerler",
                renk: "#1e90ff", // Mavi (image_0.png'deki gibi)
                koordinatlar: [
                    [32.5, 43.0], [31.5, 43.5], [30.5, 44.5], [31.0, 45.5], [32.0, 45.0], [32.5, 44.0]
                ], // Yaklaşık poligon koordinatları
                bilgi: "<b>Sümerler (MÖ 4000-2000)</b><br>Mezopotamya medeniyetinin temelini attılar. Yazıyı (çivi yazısı) buldular, tekerleği icat ettiler, site devletleri (Ur, Uruk, Nippur) kurdular ve ziggurat denilen tapınaklar inşa ettiler."
            },
            {
                isim: "Akkadlar",
                renk: "#cd5c5c", // Kızıl (image_0.png'deki gibi)
                koordinatlar: [
                    [33.5, 42.5], [32.5, 43.0], [32.5, 44.0], [33.5, 43.5], [34.0, 43.0]
                ],
                bilgi: "<b>Akkadlar (MÖ 2350-2150)</b><br>Kral Sargon önderliğinde Mezopotamya'da ilk merkezi imparatorluğu kurdular. Sümer kültürünü benimsediler ve yaydılar."
            },
            {
                isim: "Babiller",
                renk: "#ffd700", // Sarı (image_0.png'deki gibi)
                koordinatlar: [
                    [33.0, 43.0], [32.0, 43.5], [31.5, 44.0], [31.5, 44.5], [32.5, 45.0], [33.0, 44.5], [33.5, 44.0]
                ],
                bilgi: "<b>Babiller (MÖ 1894-1595, MÖ 626-539)</b><br>Hammurabi Kanunları ile ünlüdürler. Babil'in Asma Bahçeleri ve Babil Kulesi bu dönemin önemli eserlerindendir."
            },
            {
                isim: "Asurlar",
                renk: "#9370db", // Mor (image_0.png'deki gibi)
                koordinatlar: [
                    [36.5, 41.0], [35.5, 42.0], [35.5, 43.5], [36.5, 43.0], [37.0, 42.0], [37.0, 41.5]
                ],
                bilgi: "<b>Asurlar (MÖ 2500-609)</b><br>Kuzey Mezopotamya'da kuruldular. Güçlü bir orduya ve merkezi bir yönetime sahiptiler. Başkentleri Ninova'da dünyanın ilk kütüphanesini kurdular."
            }
        ];

        // Uygarlık bölgelerini poligon olarak haritaya ekle
        uygarliklar.forEach(uygarlik => {
            L.polygon(uygarlik.koordinatlar, {
                color: uygarlik.renk,
                fillColor: uygarlik.renk,
                fillOpacity: 0.5,
                weight: 2
            })
            .addTo(window.currentMapInstance)
            .bindPopup(uygarlik.bilgi);
        });

        // Lejant Ekleme (image_0.png'deki gibi)
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Mezopotamya Uygarlıkları</h4>';
            uygarliklar.forEach(u => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${u.renk}; width: 15px; height: 10px; display: inline-block; margin-right: 5px; opacity: 0.7;"></i> ${u.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },
    // 4. HARİTA: İLK ÇAĞ UYGARLIKLARI (DÜNYA)
    "ilk_cag": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">İlk Çağ'da Asya, Avrupa, Afrika ve Amerika'da kurulan büyük medeniyetler.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        // Dünyayı görecek şekilde geniş bir açı ile başlat
        window.currentMapInstance = L.map('mapCanvas').setView([30.0, 30.0], 2);

        // Türkçe ve Fiziki Google Haritalar Altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const uygarliklar = [
            {
                isim: "Hititler (Anadolu)", renk: "#e74c3c",
                koordinatlar: [[41.0, 32.0], [38.0, 32.0], [38.0, 36.0], [40.0, 38.0], [41.0, 36.0]],
                bilgi: "<b>Hititler</b><br>Anadolu'nun ilk merkezi krallığı. Başkentleri Hattuşaş'tır. Pankuş meclisi ve Anal adı verilen yıllıklarla tarihe geçmişlerdir."
            },
            {
                isim: "Mısır Uygarlığı", renk: "#f1c40f",
                koordinatlar: [[31.0, 30.0], [24.0, 33.0], [22.0, 31.0], [30.0, 28.0]],
                bilgi: "<b>Mısır Uygarlığı</b><br>Nil Nehri etrafında gelişmiştir. Etrafı çöllerle kaplı olduğu için özgün bir kültürü vardır. Piramitler, hiyeroglif yazısı ve güneş takvimi ile öne çıkarlar."
            },
            {
                isim: "Hint Uygarlığı", renk: "#2ecc71",
                koordinatlar: [[25.0, 67.0], [20.0, 72.0], [25.0, 77.0], [30.0, 75.0]],
                bilgi: "<b>Hint Uygarlığı</b><br>İndus ve Ganj nehirleri boylarında kurulmuştur. Kast sistemi adı verilen katı bir sosyal sınıflandırma uygulamışlardır."
            },
            {
                isim: "Çin Uygarlığı", renk: "#e67e22",
                koordinatlar: [[35.0, 105.0], [30.0, 110.0], [35.0, 120.0], [40.0, 115.0]],
                bilgi: "<b>Çin Uygarlığı</b><br>Sarı Irmak ve Gökırmak etrafında şekillenmiştir. Kağıt, matbaa, barut ve pusula gibi dünyayı değiştiren icatları yapmışlardır."
            },
            {
                isim: "Yunan Uygarlığı", renk: "#3498db",
                koordinatlar: [[39.0, 20.0], [36.0, 21.0], [38.0, 24.0], [40.0, 23.0]],
                bilgi: "<b>Yunan Uygarlığı</b><br>Polis adı verilen şehir devletleri (Atina, Sparta) kurdular. Demokrasinin ilk izleri ve felsefi düşünce burada gelişmiştir."
            },
            {
                isim: "İnka Uygarlığı (Amerika)", renk: "#9b59b6",
                koordinatlar: [[-10.0, -78.0], [-20.0, -70.0], [-15.0, -68.0], [-5.0, -75.0]],
                bilgi: "<b>İnkalar</b><br>Güney Amerika'da And Dağları üzerinde muazzam taş işçiliği ile Machu Picchu gibi şehirler kuran büyük imparatorluk."
            },
            {
                isim: "Maya/Aztek (Amerika)", renk: "#8e44ad",
                koordinatlar: [[20.0, -90.0], [15.0, -90.0], [15.0, -88.0], [20.0, -87.0]],
                bilgi: "<b>Mayalar ve Aztekler</b><br>Orta Amerika'da (Meksika) tapınaklar inşa eden, astronomi ve matematikte (Sıfırın kullanımı) çok ileri giden medeniyetler."
            }
        ];

        uygarliklar.forEach(uygarlik => {
            L.polygon(uygarlik.koordinatlar, { color: uygarlik.renk, fillColor: uygarlik.renk, fillOpacity: 0.5, weight: 2 })
            .addTo(window.currentMapInstance)
            .bindPopup(uygarlik.bilgi);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">İlk Çağ Uygarlıkları</h4>';
            uygarliklar.forEach(u => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${u.renk}; width: 15px; height: 10px; display: inline-block; margin-right: 5px; opacity: 0.7;"></i> ${u.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    },

    // 5. HARİTA: İLK ÇAĞ GÖÇ YOLLARI
    "goc_yollari": function() {
        const controlsContainer = document.getElementById('mapControlsContainer');
        controlsContainer.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">İlk Çağ'da dünyayı şekillendiren kitlesel göç hareketleri. Çizgilere tıklayarak bilgi alabilirsiniz.</p>
            </div>
        `;
        controlsContainer.style.display = 'block';

        window.currentMapInstance = L.map('mapCanvas').setView([38.0, 45.0], 3);

        // Türkçe ve Fiziki Google Haritalar Altlığı
        L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
            maxZoom: 10,
            attribution: '© Google Haritalar (Fiziki)'
        }).addTo(window.currentMapInstance);

        const gocler = [
            {
                isim: "Ege (Deniz Kavimleri) Göçleri", renk: "#2980b9",
                bilgi: "<b>Ege Göçleri (MÖ 13. yy)</b><br>Balkanlardan gelerek Yunanistan, Anadolu ve Mısır'a kadar uzanan yıkıcı göç dalgasıdır. Hitit İmparatorluğu'nun yıkılmasına neden olmuştur.",
                rota: [[39.0, 22.0], [35.0, 25.0], [36.0, 32.0], [31.0, 32.0]]
            },
            {
                isim: "İç Asya (Türk) Göçleri - Batı", renk: "#c0392b",
                bilgi: "<b>İç Asya Göçleri</b><br>İklim değişiklikleri ve otlak yetersizliği nedeniyle Orta Asya'dan Hazar'ın kuzeyinden Avrupa'ya doğru yapılan göçler.",
                rota: [[45.0, 100.0], [48.0, 80.0], [47.0, 60.0], [48.0, 40.0], [45.0, 25.0]]
            },
            {
                isim: "İç Asya (Türk) Göçleri - Güney", renk: "#d35400",
                bilgi: "<b>İç Asya Göçleri</b><br>Orta Asya'dan Hindistan ve Çin'e doğru yapılan tarihi göç dalgaları.",
                rota: [[45.0, 100.0], [35.0, 80.0], [25.0, 75.0]]
            },
            {
                isim: "Babil Sürgünü (Yahudi Göçü)", renk: "#8e44ad",
                bilgi: "<b>Babil Sürgünü (MÖ 586)</b><br>Babil Kralı Nebukadnezar'ın Kudüs'ü işgal etmesiyle Yahudilerin Babil'e sürgün edilmesi olayıdır.",
                rota: [[31.7, 35.2], [33.0, 36.0], [34.0, 40.0], [32.5, 44.4]]
            },
            {
                isim: "İlk Hristiyanların Göçü", renk: "#27ae60",
                bilgi: "<b>İlk Hristiyanların Göçü (MS 1. ve 2. yy)</b><br>Roma İmparatorluğu'nun baskısı nedeniyle Kudüs'ten Antakya, Kapadokya (Kayseri) ve Roma'ya doğru yapılan dini göçler.",
                rota: [[31.7, 35.2], [36.2, 36.1], [38.6, 34.7], [40.0, 28.0], [41.9, 12.5]]
            }
        ];

        gocler.forEach(goc => {
            // Göç yönünü hissettirmek için tireli çizgi (dashArray) kullanıyoruz
            L.polyline(goc.rota, {color: goc.renk, weight: 4, dashArray: '10, 10'})
            .addTo(window.currentMapInstance)
            .bindPopup(goc.bilgi);
        });

        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            div.style.padding = "10px";
            div.style.borderRadius = "5px";
            div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Göç Yolları</h4>';
            gocler.forEach(g => {
                div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${g.renk}; width: 15px; height: 3px; border-bottom: 2px dashed #fff; display: inline-block; margin-right: 5px;"></i> ${g.isim}</div>`;
            });
            return div;
        };
        legend.addTo(window.currentMapInstance);
    }
    // YENİ HARİTALARI BURANIN ALTINA, VİRGÜL KOYARAK EKLEMEYE DEVAM EDECEĞİZ.
};
// BİZANS İMPARATORLUĞU'NUN DEĞİŞİMİ HARİTASI (Garantili Ekleme Yöntemi)
window.HARITA_MOTORU["bizans_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="bizansYilBaslik" style="margin: 0 0 5px 0; color: #C9A84C; font-size: 18px; font-weight: 800;">395 - Doğu Roma'nın Doğuşu</h4>
            <p id="bizansBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Kavimler Göçü sonrası Roma ikiye ayrıldı. Doğu Roma; Balkanlar, Anadolu, Suriye ve Mısır'a hakimdi.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">395</span>
                <input type="range" id="bizansSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #C9A84C; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">1453</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Doğu Akdeniz'e odakla
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 25.0], 5);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const bizansVerisi = [
        {
            yil: 395, isim: "395 - Doğu Roma'nın Doğuşu (Yıllara göre ilerlemek için aşağıdaki butonu kaydırın)", renk: "#C9A84C",
            bilgi: "Kavimler Göçü sonrası Roma ikiye ayrıldı. Doğu Roma; Balkanlar, Anadolu, Suriye, Mısır ve Kuzey Libya'ya hakimdi.",
            koordinatlar: [ [[45, 14], [45, 30], [42, 40], [35, 40], [30, 35], [30, 25], [32, 20], [32, 10], [38, 20], [40, 20]] ]
        },
        {
            yil: 565, isim: "565 - I. Justinianus Dönemi (Zirve)", renk: "#2ecc71",
            bilgi: "Justinianus; İtalya, Kuzey Afrika kıyıları ve Güney İspanya'yı da alarak Akdeniz'i tekrar bir Roma gölü haline getirdi.",
            koordinatlar: [ [[45, -5], [45, 30], [42, 40], [35, 40], [30, 35], [30, -5], [38, -5], [40, 20], [46, 12]] ]
        },
        {
            yil: 1025, isim: "1025 - II. Basileios Dönemi", renk: "#f39c12",
            bilgi: "İslam fetihleriyle daralan sınırlar, Makedon Hanedanı ile toparlandı. Balkanlar ve Anadolu'da tekrar tam hakimiyet sağlandı.",
            koordinatlar: [ [[44, 18], [44, 28], [41, 40], [36, 36], [36, 26], [39, 20]] ]
        },
        {
            yil: 1204, isim: "1204 - Latin İstilası ve Parçalanma", renk: "#e74c3c",
            bilgi: "IV. Haçlı Seferi ile İstanbul işgal edildi. Bizans; İznik, Epir ve Trabzon gibi küçük bölgesel devletlere bölündü.",
            koordinatlar: [
                [[41.5, 29], [41.5, 31], [39, 31], [39, 29]],
                [[41.5, 38], [41.5, 41], [40.5, 41], [40.5, 38]],
                [[40, 20], [40, 22], [38, 22], [38, 20]]
            ]
        },
        {
            yil: 1453, isim: "1453 - Çöküş Öncesi Son Sınırlar", renk: "#901010",
            bilgi: "Koca imparatorluk sadece İstanbul surlarının içine ve Yunanistan'daki Mora Yarımadası'na sıkışmış durumdaydı.",
            koordinatlar: [
                [[41.2, 28.8], [41.2, 29.2], [40.8, 29.2], [40.8, 28.8]],
                [[38.5, 21], [38.5, 23.5], [36.5, 23.5], [36.5, 21]]
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = bizansVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('bizansYilBaslik').innerText = veri.isim;
        document.getElementById('bizansYilBaslik').style.color = veri.renk;
        document.getElementById('bizansBilgi').innerText = veri.bilgi;
    }

    document.getElementById('bizansSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// SASANİ İMPARATORLUĞU'NUN DEĞİŞİMİ HARİTASI
window.HARITA_MOTORU["sasani_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="sasaniYilBaslik" style="margin: 0 0 5px 0; color: #C9A84C; font-size: 18px; font-weight: 800;">224 - İmparatorluğun Kuruluşu</h4>
            <p id="sasaniBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Ardeşir Babekan, Part İmparatorluğu'nu yıkarak Sasani Devleti'ni kurdu. Merkez İran ve Mezopotamya kontrol altına alındı.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">224</span>
                <input type="range" id="sasaniSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #C9A84C; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">651</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Doğu ve İran merkezli odakla
    window.currentMapInstance = L.map('mapCanvas').setView([33.0, 50.0], 5);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const sasaniVerisi = [
        {
            yil: 224, isim: "224 - İmparatorluğun Kuruluşu", renk: "#C9A84C", // Altın
            bilgi: "Ardeşir Babekan, Part İmparatorluğu'nu yıkarak Sasani Devleti'ni kurdu. Merkez İran, Persis ve Mezopotamya kontrol altına alındı.",
            koordinatlar: [ [[25, 48], [35, 43], [37, 45], [38, 55], [35, 60], [25, 60]] ]
        },
        {
            yil: 260, isim: "260 - I. Şapur Dönemi (Genişleme)", renk: "#2ecc71", // Yeşil
            bilgi: "Roma İmparatoru Valerianus esir alındı. Sınırlar Suriye'den İndus Nehri'ne, Kafkaslardan Basra Körfezi'ne kadar genişledi.",
            koordinatlar: [ [[25, 40], [36, 38], [40, 45], [42, 50], [40, 65], [25, 65]] ]
        },
        {
            yil: 620, isim: "620 - II. Hüsrev Dönemi (Zirve)", renk: "#f39c12", // Turuncu
            bilgi: "Sasani orduları Bizans'ı ağır yenilgilere uğratarak Suriye, Mısır, Anadolu ve İstanbul Boğazı'na kadar ulaştı. İmparatorluk en geniş sınırlarında.",
            koordinatlar: [ 
                [[13, 44], [25, 40], [30, 30], [22, 30], [31, 30], [32, 34], [41, 29], [41, 40], [42, 50], [40, 65], [25, 65], [25, 55], [13, 48]] 
            ]
        },
        {
            yil: 642, isim: "642 - Nihavend Savaşı ve Çöküş", renk: "#e74c3c", // Kırmızı
            bilgi: "Hz. Ömer döneminde İslam ordularına karşı alınan Kadisiye ve Nihavend yenilgileriyle Irak ve Batı İran kaybedildi. İmparatorluk hızla dağılıyor.",
            koordinatlar: [ [[28, 52], [36, 52], [38, 55], [39, 65], [28, 65]] ]
        },
        {
            yil: 651, isim: "651 - İmparatorluğun Sonu", renk: "#901010", // Koyu Kırmızı
            bilgi: "Son Sasani Kralı III. Yezdicerd'in Merv şehrinde öldürülmesiyle 400 yıllık Sasani İmparatorluğu tamamen tarih sahnesinden silindi.",
            koordinatlar: [ [[37, 61], [38, 61], [38, 62.5], [37, 62.5]] ] // Merv bölgesinde küçücük bir nokta
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = sasaniVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('sasaniYilBaslik').innerText = veri.isim;
        document.getElementById('sasaniYilBaslik').style.color = veri.renk;
        document.getElementById('sasaniBilgi').innerText = veri.bilgi;
    }

    document.getElementById('sasaniSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// 1. VE 2. GÖKTÜRK DEVLETLERİ HARİTASI
window.HARITA_MOTORU["gokturk_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="gokturkYilBaslik" style="margin: 0 0 5px 0; color: #3498db; font-size: 18px; font-weight: 800;">552 - I. Göktürk Devleti'nin Kuruluşu</h4>
            <p id="gokturkBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Bumin Kağan önderliğinde Avar (Juan-Juan) egemenliğine son verilerek Ötüken merkezli I. Göktürk Devleti kuruldu.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">552</span>
                <input type="range" id="gokturkSlider" min="0" max="5" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #3498db; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">744</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Asya ve Moğolistan (Ötüken) merkezli odakla
    window.currentMapInstance = L.map('mapCanvas').setView([45.0, 90.0], 4);

    // Fiziki Harita Altlığı (Dağlar ve bozkırlar net görünsün diye)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const gokturkVerisi = [
        {
            yil: 552, isim: "552 - I. Göktürk Devleti'nin Kuruluşu", renk: "#3498db", // Göktürk Mavisi
            bilgi: "Bumin Kağan önderliğinde Avar (Juan-Juan) egemenliğine son verilerek Ötüken merkezli I. Göktürk Devleti kuruldu. Bumin Kağan 'İl Kağan' unvanını aldı.",
            koordinatlar: [ [[43, 90], [50, 90], [52, 110], [45, 115], [40, 105]] ]
        },
        {
            yil: 582, isim: "582 - En Geniş Sınırlar", renk: "#2ecc71", // Yeşil
            bilgi: "Mukan Kağan ve İstemi Yabgu dönemlerindeki İpek Yolu fetihleriyle sınırlar Mançurya'dan Karadeniz'e ulaştı. Ancak devlet kısa süre sonra Doğu ve Batı olarak ikiye bölündü.",
            koordinatlar: [ [[40, 50], [50, 50], [55, 70], [55, 110], [50, 125], [40, 120], [35, 90], [38, 70], [35, 55]] ]
        },
        {
            yil: 630, isim: "630 - Fetret (Esaret) Devri", renk: "#7f8c8d", // Gri (Karanlık dönem)
            bilgi: "Zayıflayan Doğu ve Batı Göktürkleri, Çin (Tang Hanedanı) egemenliğine girdi. 50 yıl sürecek esaret ve bağımsızlık isyanları (Kürşad Ayaklanması) başladı.",
            koordinatlar: [ [[45, 100], [48, 100], [48, 110], [45, 110]] ] // Çin baskısıyla çok daralmış alan
        },
        {
            yil: 682, isim: "682 - II. Göktürk (Kutluk) Devleti", renk: "#f39c12", // Turuncu/Bronz (Diriliş)
            bilgi: "Kutluk (İlteriş) Kağan önderliğinde Çin'e karşı bağımsızlık kazanıldı. II. Göktürk Devleti kurularak dağınık Türk boyları yeniden tek bayrak altında birleştirildi.",
            koordinatlar: [ [[42, 90], [52, 90], [52, 115], [42, 115], [38, 105]] ]
        },
        {
            yil: 732, isim: "732 - Bilge Kağan ve Kül Tigin Dönemi", renk: "#C9A84C", // Altın (Zirve)
            bilgi: "Devletin en parlak dönemi. Çin vergiye bağlandı, Türk tarihi ve edebiyatının ilk yazılı kaynakları olan Orhun Abideleri (Bengü Taşlar) dikildi.",
            koordinatlar: [ [[40, 70], [52, 70], [55, 100], [52, 120], [40, 115], [35, 95]] ]
        },
        {
            yil: 744, isim: "744 - Çöküş", renk: "#e74c3c", // Kırmızı
            bilgi: "İç karışıklıklar ve zayıflayan merkezi otorite sonrası Basmıl, Karluk ve Uygur boylarının isyanı sonucunda II. Göktürk Devleti yıkıldı.",
            koordinatlar: [ [[46, 100], [48, 100], [48, 105], [46, 105]] ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = gokturkVerisi[index];

        // Eski sınırları haritadan temizle
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        // Yeni sınırları çiz
        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5' // Sınırların kesik çizgili olması için
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        // Arayüzdeki metinleri ve renkleri güncelle (Slider rengini de metne uyduruyoruz)
        document.getElementById('gokturkYilBaslik').innerText = veri.isim;
        document.getElementById('gokturkYilBaslik').style.color = veri.renk;
        document.getElementById('gokturkBilgi').innerText = veri.bilgi;
        document.getElementById('gokturkSlider').style.accentColor = veri.renk;
    }

    // Slider (Kaydırma Çubuğu) dinleyicisi
    document.getElementById('gokturkSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında 552 yılını yükle
    haritayiGuncelle(0);
};
// UYGUR DEVLETİ'NİN DEĞİŞİMİ VE YERLEŞİK HAYATA GEÇİŞ (744 - 840)
window.HARITA_MOTORU["uygur_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="uygurYilBaslik" style="margin: 0 0 5px 0; color: #1abc9c; font-size: 18px; font-weight: 800;">744 - Uygur Kağanlığı'nın Kuruluşu</h4>
            <p id="uygurBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Kutluk Bilge Kül Kağan önderliğinde II. Göktürk Devleti'ne son verilerek Ötüken merkezli Uygur Devleti kuruldu.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">744</span>
                <input type="range" id="uygurSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #1abc9c; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">840</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yılları ve sınırları değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    window.currentMapInstance = L.map('mapCanvas').setView([45.0, 95.0], 4);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const uygurVerisi = [
        {
            yil: 744, isim: "744 - Kuruluş (Ötüken Dönemi)", renk: "#1abc9c", // Turkuaz/Zümrüt
            bilgi: "II. Göktürklerin yıkılmasıyla kurulan devlet, geleneksel Türk merkezi Ötüken'i başkent yaptı. İlk dönemlerde bozkır kültürü hakimdi.",
            koordinatlar: [ [[43, 90], [50, 90], [52, 110], [45, 115], [40, 105]] ]
        },
        {
            yil: 751, isim: "751 - Bayan Çur ve Genişleme", renk: "#2ecc71", // Yeşil
            bilgi: "Talas Savaşı döneminde Çin'deki karışıklıklardan faydalanan Uygurlar, sınırlarını Mançurya'dan Aral Gölü'ne kadar genişlettiler.",
            koordinatlar: [ [[40, 60], [50, 60], [55, 80], [55, 115], [50, 125], [42, 120], [38, 100], [38, 70]] ]
        },
        {
            yil: 762, isim: "762 - Maniheizm ve Yerleşik Yaşam", renk: "#f39c12", // Turuncu (Kültürel dönüşüm)
            bilgi: "Bögü Kağan döneminde Maniheizm resmi din oldu. Et yeme ve savaşmanın yasaklandığı bu din etkisiyle ilk Türk şehirleri (Ordu-Balık) kurulmaya başlandı.",
            koordinatlar: [ [[42, 85], [52, 85], [52, 115], [42, 115], [38, 105]] ]
        },
        {
            yil: 800, isim: "800 - Kültürel Zirve ve Ticaret", renk: "#C9A84C", // Altın (Parlak dönem)
            bilgi: "Uygurlar matbaayı kullandılar, kütüphaneler kurdular ve ipek yolu ticaretini kontrol ettiler. Sanat ve edebiyatta muazzam bir gelişim yaşandı.",
            koordinatlar: [ [[40, 75], [52, 75], [53, 110], [42, 115], [36, 100]] ]
        },
        {
            yil: 840, isim: "840 - Kırgız İstilası ve Göç", renk: "#e74c3c", // Kırmızı (Çöküş)
            bilgi: "Şiddetli kıtlık ve salgın hastalıkların ardından Kırgızların saldırısı sonucu devlet yıkıldı. Uygurlar, Turfan ve Kansu bölgelerine göç etmek zorunda kaldı.",
            koordinatlar: [ 
                [[40, 85], [43, 85], [43, 90], [40, 90]], // Turfan Bölgesi
                [[36, 95], [39, 95], [39, 100], [36, 100]] // Kansu Bölgesi
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = uygurVerisi[index];
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('uygurYilBaslik').innerText = veri.isim;
        document.getElementById('uygurYilBaslik').style.color = veri.renk;
        document.getElementById('uygurBilgi').innerText = veri.bilgi;
        document.getElementById('uygurSlider').style.accentColor = veri.renk;
    }

    document.getElementById('uygurSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// İSLAM DEVLETİ'NİN GENİŞLEMESİ (622 - 661)
window.HARITA_MOTORU["islam_genisleme"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="islamYilBaslik" style="margin: 0 0 5px 0; color: #2ecc71; font-size: 18px; font-weight: 800;">622-632 Hz. Muhammed Dönemi</h4>
            <p id="islamBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 40px;">Medine İslam Devleti kuruldu. Bedir, Uhud, Hendek savaşları ve Mekke'nin fethiyle Arap Yarımadası'nın büyük bölümünde siyasi birlik sağlandı.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">622</span>
                <input type="range" id="islamSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #2ecc71; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">661</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Dönemleri değiştirmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Orta Doğu ve Arap Yarımadası'na odakla
    window.currentMapInstance = L.map('mapCanvas').setView([28.0, 42.0], 4);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const islamVerisi = [
        {
            donem: 0, isim: "Hz. Muhammed Dönemi (622-632)", renk: "#2ecc71", // Zümrüt Yeşili
            bilgi: "Medine İslam Devleti kuruldu. Bedir, Uhud, Hendek savaşları, Hudeybiye Barışı ve Mekke'nin fethiyle Arap Yarımadası'nda ilk kez siyasi birlik sağlandı.",
            koordinatlar: [ [[29, 35], [29, 48], [23, 60], [15, 54], [12, 44], [18, 40], [25, 36]] ]
        },
        {
            donem: 1, isim: "Hz. Ebubekir Dönemi (632-634)", renk: "#27ae60", // Koyu Yeşil
            bilgi: "Ridde (Dinden dönme) ve Yalancı Peygamberler olayları bastırılarak iç otorite sağlandı. Kuran-ı Kerim kitap (Mushaf) haline getirildi. Suriye ve Irak'a ilk seferler başladı.",
            koordinatlar: [ [[31, 35], [31, 47], [29, 48], [23, 60], [15, 54], [12, 44], [18, 40], [25, 36]] ] // Yarımada ve kuzeye hafif çıkış
        },
        {
            donem: 2, isim: "Hz. Ömer Dönemi (634-644)", renk: "#1abc9c", // Turkuaz
            bilgi: "En parlak genişleme dönemi. Yermük ve Ecnadeyn ile Suriye, Kadisiye ve Nihavend ile Sasani (İran) ve Irak, Amr İbnül As ile Mısır fethedildi. Devlet tam bir imparatorluğa dönüştü.",
            koordinatlar: [ [[31, 29], [36, 36], [37, 42], [35, 52], [33, 60], [25, 60], [15, 54], [12, 44], [18, 40], [25, 33], [28, 30]] ]
        },
        {
            donem: 3, isim: "Hz. Osman Dönemi (644-656)", renk: "#f1c40f", // Altın Sarısı
            bilgi: "Kuran-ı Kerim çoğaltılıp eyaletlere gönderildi. İlk İslam donanması kurularak Kıbrıs alındı. Sınırlar Kuzey Afrika'da (Libya) Tunus'a, doğuda Horasan ve Kafkaslara kadar genişledi.",
            koordinatlar: [ [[32, 20], [35, 33], [37, 36], [40, 44], [40, 65], [30, 65], [25, 60], [15, 54], [12, 44], [18, 40], [22, 30], [28, 20]] ]
        },
        {
            donem: 4, isim: "Hz. Ali Dönemi (656-661)", renk: "#e67e22", // Turuncu (İç karışıklıklar)
            bilgi: "Cemel Vakası ve Sıffin Savaşı gibi iç karışıklıklar (Fitne dönemi) nedeniyle bu dönemde yeni fetihler yapılamadı. Başkent Medine'den Kufe'ye taşındı.",
            koordinatlar: [ [[32, 20], [35, 33], [37, 36], [40, 44], [40, 65], [30, 65], [25, 60], [15, 54], [12, 44], [18, 40], [22, 30], [28, 20]] ] // Sınırlar aynı
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = islamVerisi[index];

        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        veri.koordinatlar.forEach(koords => {
            const poligon = L.polygon(koords, {
                color: veri.renk,
                fillColor: veri.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance);
            mevcutPoligonlar.push(poligon);
        });

        document.getElementById('islamYilBaslik').innerText = veri.isim;
        document.getElementById('islamYilBaslik').style.color = veri.renk;
        document.getElementById('islamBilgi').innerText = veri.bilgi;
        document.getElementById('islamSlider').style.accentColor = veri.renk;
    }

    document.getElementById('islamSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// EMEVİ VE ABBASİ DEVLETLERİNİN DEĞİŞİMİ (661 - 1258)
window.HARITA_MOTORU["emevi_abbasi_degisim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="emeviAbbasiBaslik" style="margin: 0 0 5px 0; color: #2ecc71; font-size: 18px; font-weight: 800;">661 - Emevi Devleti'nin Kuruluşu</h4>
            <p id="emeviAbbasiBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">Hz. Ali'nin vefatından sonra Muaviye, başkenti Şam (Dımaşk) yaparak Emevi Devleti'ni kurdu. Halifelik babadan oğula geçerek saltanata dönüştü.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">661</span>
                <input type="range" id="emeviAbbasiSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #2ecc71; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">950</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Devletlerin değişimini izlemek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Akdeniz ve Orta Doğu'yu görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([33.0, 25.0], 3);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const emeviAbbasiVerisi = [
        {
            yil: 661, isim: "661 - Emevi Devleti'nin Kuruluşu", anaRenk: "#2ecc71",
            bilgi: "Hz. Ali'nin vefatından sonra Muaviye, başkenti Şam (Dımaşk) yaparak Emevi Devleti'ni kurdu. Halifelik saltanata dönüştü.",
            poligonlar: [
                { ad: "Emeviler", renk: "#27ae60", coords: [ [[35, 35], [38, 45], [35, 60], [25, 60], [15, 50], [12, 44], [20, 35], [30, 30], [30, 40]] ] }
            ]
        },
        {
            yil: 732, isim: "732 - Emeviler'in Zirvesi", anaRenk: "#2ecc71",
            bilgi: "Kuzey Afrika tamamen fethedildi. Tarık bin Ziyad komutasında İspanya (Endülüs) alındı. Doğuda Türkistan ve Hindistan sınırlarına ulaşıldı.",
            poligonlar: [
                { ad: "Emeviler", renk: "#2ecc71", coords: [ [[43, -9], [43, 2], [36, -2], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, -9]] ] }
            ]
        },
        {
            yil: 750, isim: "750 - Abbasilerin Kuruluşu", anaRenk: "#9b59b6",
            bilgi: "Ebu'l Abbas, Emevi hanedanını yıkarak Abbasi Devleti'ni kurdu. Ancak İspanya'da bağımsız 'Endülüs Emevi Devleti' yaşamaya devam etti.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#8e44ad", coords: [ [[36, 0], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, 0]] ] },
                { ad: "Endülüs Emevileri", renk: "#2ecc71", coords: [ [[43, -9], [43, 2], [36, 0], [36, -9]] ] }
            ]
        },
        {
            yil: 800, isim: "800 - Harun Reşid ve Altın Çağ", anaRenk: "#9b59b6",
            bilgi: "Abbasiler başkenti Bağdat'a taşıdı. Beytülhikme kurularak bilim ve sanatta İslam'ın Altın Çağı yaşandı. Türkler için 'Samarra' askeri şehirleri kuruldu.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#9b59b6", coords: [ [[36, 10], [36, 35], [42, 45], [40, 70], [25, 65], [15, 50], [12, 44], [25, 35], [25, 10]] ] },
                { ad: "Endülüs Emevileri", renk: "#27ae60", coords: [ [[43, -9], [43, 2], [36, 0], [36, -9]] ] }
            ]
        },
        {
            yil: 950, isim: "950 - Abbasilerin Parçalanması", anaRenk: "#e67e22",
            bilgi: "Geniş sınırlara hükmetmek zorlaştı. Abbasiler Bağdat'a sıkışırken, Mısır ve Kuzey Afrika'da Tolunoğulları ve Fatımiler gibi yerel devletler (Tevaif-i Mülük) kuruldu.",
            poligonlar: [
                { ad: "Abbasiler", renk: "#8e44ad", coords: [ [[35, 40], [35, 48], [30, 48], [30, 40]] ] },
                { ad: "Yerel Devletler (Fatımiler vb.)", renk: "#d35400", coords: [ [[33, 10], [33, 35], [22, 35], [22, 10]] ] },
                { ad: "Endülüs Emevileri", renk: "#27ae60", coords: [ [[43, -9], [42, 3], [36, 0], [36, -9]] ] }
            ]
        }
    ];

    let mevcutPoligonlar = [];

    function haritayiGuncelle(index) {
        const veri = emeviAbbasiVerisi[index];

        // Eski poligonları temizle
        mevcutPoligonlar.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutPoligonlar = [];

        // Her devlet için yeni poligonları çiz
        veri.poligonlar.forEach(bolge => {
            const poligon = L.polygon(bolge.coords, {
                color: bolge.renk,
                fillColor: bolge.renk,
                fillOpacity: 0.45,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(window.currentMapInstance)
            .bindPopup(`<b>${bolge.ad}</b>`); // Tıklayınca devletin adını gösterir
            
            mevcutPoligonlar.push(poligon);
        });

        // Arayüz metinlerini ve slider rengini döneme göre güncelle
        document.getElementById('emeviAbbasiBaslik').innerText = veri.isim;
        document.getElementById('emeviAbbasiBaslik').style.color = veri.anaRenk;
        document.getElementById('emeviAbbasiBilgi').innerText = veri.bilgi;
        document.getElementById('emeviAbbasiSlider').style.accentColor = veri.anaRenk;
    }

    document.getElementById('emeviAbbasiSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    haritayiGuncelle(0);
};
// GELİŞMİŞ TİCARET YOLLARI HARİTASI (İpek, Baharat, Kral, Kürk)
window.HARITA_MOTORU["ticaret_yollari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="ticaretBaslik" style="margin: 0 0 5px 0; color: #f39c12; font-size: 18px; font-weight: 800;">Tarihi Ticaret Yolları</h4>
            <p id="ticaretBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">İlk ve Orta Çağ'da dünyayı birbirine bağlayan, sadece malların değil; kültürlerin, dinlerin ve icatların da taşındığı devasa ticaret ağları.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="ticaretSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #f39c12; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yolları ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Asya, Avrupa ve Afrika'yı görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([38.0, 60.0], 3);

    // Fiziki Harita Altlığı (Dağlar ve çöller ticaret yollarını belirler)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const yollar = [
        {
            id: 1, isim: "İpek Yolu", renk: "#e74c3c", // Kırmızı
            bilgi: "Çin'in Şian kentinden başlayıp Orta Asya (Semerkant, Buhara), İran ve Anadolu üzerinden Avrupa'ya uzanan en ünlü ticaret yoludur. İpek, kağıt, porselen ve barut taşınmıştır.",
            rota: [[34.2, 108.9], [40.1, 94.6], [39.4, 75.9], [39.6, 66.9], [37.6, 61.8], [35.5, 51.4], [33.3, 44.4], [36.2, 36.1], [41.0, 28.9], [45.4, 12.3]]
        },
        {
            id: 2, isim: "Baharat Yolu", renk: "#f39c12", // Turuncu
            bilgi: "Hindistan'dan başlayarak deniz yoluyla Kızıldeniz ve Basra Körfezi'ne, oradan da Mısır ve Suriye limanları üzerinden Avrupa'ya ulaşan hattır. Karabiber, tarçın, zencefil taşınmıştır.",
            rota: [[11.2, 75.7], [15.0, 65.0], [12.7, 45.0], [20.0, 38.0], [31.2, 29.9], [35.0, 20.0], [40.8, 14.2]]
        },
        {
            id: 3, isim: "Kral Yolu", renk: "#9b59b6", // Mor
            bilgi: "Lidyalılar ve Persler tarafından kurulan, Anadolu'da Sardes'ten (Manisa) başlayıp Pers başkenti Susa'ya uzanan ilk sistemli posta ve ticaret yoludur.",
            rota: [[38.4, 28.0], [38.6, 31.9], [40.0, 34.6], [38.3, 38.3], [36.3, 43.1], [32.1, 48.2]]
        },
        {
            id: 4, isim: "Kürk Yolu", renk: "#3498db", // Mavi
            bilgi: "Sibirya, Altay ve Ural dağlarının ormanlarından başlayarak İdil (Volga) Nehri üzerinden Hazar ve Karadeniz'e inen kuzey hattıdır. Samur, kunduz ve tilki kürkleri taşınırdı.",
            rota: [[60.0, 70.0], [55.0, 60.0], [51.0, 51.0], [46.3, 48.0], [47.0, 39.0], [45.3, 34.4]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski çizgileri temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm yolları göster
            yollar.forEach(yol => {
                const cizgi = L.polyline(yol.rota, {color: yol.renk, weight: 5, opacity: 0.85})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${yol.isim}</b><br>${yol.bilgi}`);
                mevcutCizgiler.push(cizgi);
            });
            
            document.getElementById('ticaretBaslik').innerText = "Tarihi Ticaret Yolları";
            document.getElementById('ticaretBaslik').style.color = "#f39c12";
            document.getElementById('ticaretBilgi').innerText = "İlk ve Orta Çağ'da dünyayı birbirine bağlayan, sadece malların değil; kültürlerin, dinlerin ve icatların da taşındığı devasa ticaret ağları.";
            document.getElementById('ticaretSlider').style.accentColor = "#f39c12";
        } else {
            // Slider kaydırıldığında: Tekil yol gösterimi
            const aktifYol = yollar[index - 1];
            
            // Diğer yolları soluk ve kesik çizgili olarak arka planda bırak
            yollar.forEach(yol => {
                if (yol.id !== aktifYol.id) {
                    const soluk = L.polyline(yol.rota, {color: yol.renk, weight: 3, opacity: 0.2, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili yolu kalın, parlak ve belirgin çiz
            const aktifCizgi = L.polyline(aktifYol.rota, {color: aktifYol.renk, weight: 7, opacity: 1})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifYol.isim}</b><br>${aktifYol.bilgi}`);
                
            mevcutCizgiler.push(aktifCizgi);
            
            // Otomatik olarak o yolun popup'ını aç (Öğrencinin dikkatini hemen çeker)
            aktifCizgi.openPopup();

            // Arayüzü güncelle
            document.getElementById('ticaretBaslik').innerText = aktifYol.isim;
            document.getElementById('ticaretBaslik').style.color = aktifYol.renk;
            document.getElementById('ticaretBilgi').innerText = aktifYol.bilgi;
            document.getElementById('ticaretSlider').style.accentColor = aktifYol.renk;
        }
    }

    document.getElementById('ticaretSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm yolları göster
    haritayiGuncelle(0);
};
// ORTA ÇAĞ'IN BÜYÜK DEVLETLERİ HARİTASI
window.HARITA_MOTORU["ortacag_devletleri"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="ortacagBaslik" style="margin: 0 0 5px 0; color: #9b59b6; font-size: 18px; font-weight: 800;">Orta Çağ'ın Büyük Güçleri</h4>
            <p id="ortacagBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">Orta Çağ boyunca Avrupa'dan Asya'ya kadar dünyayı şekillendiren, farklı yüzyıllarda zirveye ulaşmış en büyük imparatorluklar.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="ortacagSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #9b59b6; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Devletleri ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Avrupa ve Asya'yı tam görecek şekilde geniş açıyla odakla
    window.currentMapInstance = L.map('mapCanvas').setView([40.0, 50.0], 3);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const devletler = [
        {
            id: 1, isim: "Frank İmparatorluğu (Avrupa)", renk: "#3498db", // Mavi
            bilgi: "Kavimler Göçü sonrası Batı Avrupa'da kurulan en güçlü devlettir. Şarlman döneminde zirveye ulaşmış, Avrupa'da feodalizmin temellerini atmıştır.",
            rota: [[42, -5], [52, 2], [54, 10], [48, 14], [43, 12], [43, 3]]
        },
        {
            id: 2, isim: "Bizans İmparatorluğu", renk: "#9b59b6", // Mor
            bilgi: "Doğu Roma olarak da bilinir. Orta Çağ boyunca Anadolu, Balkanlar ve Doğu Akdeniz'e hükmetmiş, 1453'te Fatih Sultan Mehmet tarafından yıkılana kadar yaşamıştır.",
            rota: [[44, 18], [44, 28], [41, 40], [36, 36], [36, 26], [39, 20]]
        },
        {
            id: 3, isim: "Sasani İmparatorluğu", renk: "#2ecc71", // Yeşil
            bilgi: "Orta Doğu'da İran ve Mezopotamya'ya hükmeden devasa bir güçtür. Bizans ile sürekli savaşmış, 7. yüzyılda İslam Orduları (Hz. Ömer) tarafından yıkılmıştır.",
            rota: [[25, 40], [36, 38], [40, 45], [42, 50], [40, 65], [25, 65]]
        },
        {
            id: 4, isim: "Moğol İmparatorluğu", renk: "#e74c3c", // Kırmızı
            bilgi: "13. yüzyılda Cengiz Han tarafından kurulan, tarihin bitişik sınırlara sahip en büyük imparatorluğudur. Çin'den Doğu Avrupa'ya kadar Asya'yı kasıp kavurmuştur.",
            rota: [[50, 30], [55, 60], [60, 100], [55, 130], [35, 120], [25, 100], [25, 60], [35, 45], [40, 40]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski poligonları temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm devletleri göster
            devletler.forEach(devlet => {
                const poligon = L.polygon(devlet.rota, {color: devlet.renk, fillColor: devlet.renk, fillOpacity: 0.45, weight: 2})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${devlet.isim}</b><br>${devlet.bilgi}`);
                mevcutCizgiler.push(poligon);
            });
            
            document.getElementById('ortacagBaslik').innerText = "Orta Çağ'ın Büyük Güçleri";
            document.getElementById('ortacagBaslik').style.color = "#9b59b6";
            document.getElementById('ortacagBilgi').innerText = "Orta Çağ boyunca Avrupa'dan Asya'ya kadar dünyayı şekillendiren, farklı yüzyıllarda zirveye ulaşmış en büyük imparatorluklar.";
            document.getElementById('ortacagSlider').style.accentColor = "#9b59b6";
        } else {
            // Slider kaydırıldığında: Tekil devlet gösterimi
            const aktifDevlet = devletler[index - 1];
            
            // Diğer devletleri soluk ve kesik çizgili (sadece sınır) olarak arka planda bırak
            devletler.forEach(devlet => {
                if (devlet.id !== aktifDevlet.id) {
                    const soluk = L.polygon(devlet.rota, {color: devlet.renk, fillOpacity: 0.05, weight: 2, opacity: 0.3, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili devleti parlak ve belirgin çiz
            const aktifPoligon = L.polygon(aktifDevlet.rota, {color: aktifDevlet.renk, fillColor: aktifDevlet.renk, fillOpacity: 0.6, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifDevlet.isim}</b><br>${aktifDevlet.bilgi}`);
                
            mevcutCizgiler.push(aktifPoligon);
            aktifPoligon.openPopup();

            // Arayüzü güncelle
            document.getElementById('ortacagBaslik').innerText = aktifDevlet.isim;
            document.getElementById('ortacagBaslik').style.color = aktifDevlet.renk;
            document.getElementById('ortacagBilgi').innerText = aktifDevlet.bilgi;
            document.getElementById('ortacagSlider').style.accentColor = aktifDevlet.renk;
        }
    }

    document.getElementById('ortacagSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm devletleri göster
    haritayiGuncelle(0);
};
// İLK ÇAĞ ANADOLU UYGARLIKLARI HARİTASI
window.HARITA_MOTORU["anadolu_uygarliklari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="anadoluBaslik" style="margin: 0 0 5px 0; color: #e74c3c; font-size: 18px; font-weight: 800;">Anadolu Uygarlıkları</h4>
            <p id="anadoluBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">İlk Çağ'da Anadolu'da kurulan, ticaret, tarım, hukuk ve mimari alanlarında dünya medeniyetine yön veren büyük uygarlıklar.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(201,168,76,0.2);">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tümü</span>
                <input type="range" id="anadoluSlider" min="0" max="5" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #e74c3c; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color); font-size: 13px;">Tek Tek</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Uygarlıkları ayrı ayrı incelemek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı tam olarak Anadolu'nun merkezine odakla
    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 35.0], 6);

    // Fiziki Harita Altlığı (Dağların, nehirlerin görünmesi uygarlıkların yerleşimini anlamak için kritiktir)
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const uygarliklar = [
        {
            id: 1, isim: "Hititler", renk: "#e74c3c", // Kırmızı
            bilgi: "Merkezi Çorum (Hattuşaş) olan, Kızılırmak yayı içinde kurulan ilk merkezi krallık. Pankuş meclisi, Anal (yıllık) yazıcılığı ve Kadeş Antlaşması ile bilinirler.",
            rota: [[41.2, 32.5], [38.5, 32.0], [37.5, 35.0], [38.5, 38.0], [40.5, 37.5]]
        },
        {
            id: 2, isim: "Frigler", renk: "#e67e22", // Turuncu
            bilgi: "Başkentleri Ankara (Gordion) olan, Sakarya nehri boylarında kurulmuş tarım toplumudur. Tarımı koruyan çok sert kanunları vardır. Tapates (halı) ve Fibula (çengelli iğne) onlara aittir.",
            rota: [[40.5, 30.0], [38.5, 30.0], [38.0, 32.5], [40.0, 32.5]]
        },
        {
            id: 3, isim: "Lidyalılar", renk: "#f1c40f", // Altın Sarısı
            bilgi: "Gediz ve Menderes nehirleri arasında, başkenti Manisa (Sardes) olan ticaret devletidir. Parayı icat ederek takas usulünü bitirmiş, Kral Yolu'nu kurmuşlardır.",
            rota: [[39.5, 27.0], [38.0, 27.0], [38.0, 29.5], [39.5, 29.5]]
        },
        {
            id: 4, isim: "İyonyalılar", renk: "#3498db", // Mavi (Denizci)
            bilgi: "Ege kıyılarında (İzmir, Efes, Milet, Foça) şehir devletleri (Polis) halinde yaşadılar. Özgür düşünce ortamı sayesinde bilim, felsefe, tıp ve matematikte (Tales, Hipokrat) çok ilerlediler.",
            rota: [[39.5, 26.0], [37.0, 26.0], [37.0, 27.5], [39.0, 27.5]]
        },
        {
            id: 5, isim: "Urartular", renk: "#9b59b6", // Mor
            bilgi: "Doğu Anadolu'da, başkenti Van (Tuşpa) olan dağlık bölge uygarlığıdır. Taş işçiliğinde, madencilikte ve su mühendisliğinde (Şamran Kanalı) çok gelişmişlerdir.",
            rota: [[40.5, 41.0], [38.0, 41.0], [37.5, 44.0], [40.0, 44.5]]
        }
    ];

    let mevcutCizgiler = [];

    function haritayiGuncelle(index) {
        // Eski poligonları temizle
        mevcutCizgiler.forEach(p => window.currentMapInstance.removeLayer(p));
        mevcutCizgiler = [];

        if (index === 0) {
            // Slider en soldayken: Tüm uygarlıkları göster
            uygarliklar.forEach(uyg => {
                const poligon = L.polygon(uyg.rota, {color: uyg.renk, fillColor: uyg.renk, fillOpacity: 0.45, weight: 2})
                    .addTo(window.currentMapInstance)
                    .bindPopup(`<b>${uyg.isim}</b><br>${uyg.bilgi}`);
                mevcutCizgiler.push(poligon);
            });
            
            document.getElementById('anadoluBaslik').innerText = "Anadolu Uygarlıkları";
            document.getElementById('anadoluBaslik').style.color = "#e74c3c";
            document.getElementById('anadoluBilgi').innerText = "İlk Çağ'da Anadolu'da kurulan, ticaret, tarım, hukuk ve mimari alanlarında dünya medeniyetine yön veren büyük uygarlıklar.";
            document.getElementById('anadoluSlider').style.accentColor = "#e74c3c";
        } else {
            // Slider kaydırıldığında: Tekil uygarlık gösterimi
            const aktifUygarlik = uygarliklar[index - 1];
            
            // Diğer uygarlıkları soluk ve kesik çizgili (sadece sınır) olarak arka planda bırak
            uygarliklar.forEach(uyg => {
                if (uyg.id !== aktifUygarlik.id) {
                    const soluk = L.polygon(uyg.rota, {color: uyg.renk, fillOpacity: 0.05, weight: 2, opacity: 0.3, dashArray: '5, 10'})
                        .addTo(window.currentMapInstance);
                    mevcutCizgiler.push(soluk);
                }
            });

            // Seçili uygarlığı parlak ve belirgin çiz
            const aktifPoligon = L.polygon(aktifUygarlik.rota, {color: aktifUygarlik.renk, fillColor: aktifUygarlik.renk, fillOpacity: 0.6, weight: 4})
                .addTo(window.currentMapInstance)
                .bindPopup(`<b>${aktifUygarlik.isim}</b><br>${aktifUygarlik.bilgi}`);
                
            mevcutCizgiler.push(aktifPoligon);
            aktifPoligon.openPopup(); // Öğrencinin dikkatini hemen çekmek için popup otomatik açılır

            // Arayüzü güncelle
            document.getElementById('anadoluBaslik').innerText = aktifUygarlik.isim;
            document.getElementById('anadoluBaslik').style.color = aktifUygarlik.renk;
            document.getElementById('anadoluBilgi').innerText = aktifUygarlik.bilgi;
            document.getElementById('anadoluSlider').style.accentColor = aktifUygarlik.renk;
        }
    }

    document.getElementById('anadoluSlider').addEventListener('input', function(e) {
        haritayiGuncelle(parseInt(e.target.value));
    });

    // Harita ilk açıldığında tüm devletleri göster
    haritayiGuncelle(0);
};
// 7. HARİTA: TAKVİMLERİN COĞRAFYASI VE SERÜVENİ
window.HARITA_MOTORU["takvimlerin_seruveni"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Zamanın taksimi: Takvimlerin hangi coğrafi ve kültürel ihtiyaçlarla doğduğunu görmek için taralı alanları tıklayın.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı Avrasya ve Kuzey Afrika'yı görecek şekilde ayarla
    window.currentMapInstance = L.map('mapCanvas').setView([35.0, 65.0], 3);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const takvimler = [
        {
            isim: "12 Hayvanlı Türk Takvimi",
            renk: "#16a085",
            koordinatlar: [[45.0, 75.0], [53.0, 85.0], [53.0, 115.0], [45.0, 120.0], [38.0, 100.0]],
            bilgi: "<b>12 Hayvanlı Türk Takvimi (Orta Asya)</b><br>Güneş yılına dayalıdır. Bozkır kültüründe hayvancılıkla uğraşan Türklerin doğa gözlemleriyle şekillenmiştir. Her yıla bir hayvan ismi verilmesi, göçebe yaşamın doğayla bütünleşmiş halini yansıtır."
        },
        {
            isim: "Mısır Güneş Takvimi",
            renk: "#e67e22",
            koordinatlar: [[31.0, 28.0], [31.0, 34.0], [22.0, 34.0], [22.0, 28.0]],
            bilgi: "<b>Güneş Takvimi (Mısır)</b><br>Nil Nehri'nin taşma zamanlarını hesaplama ihtiyacı (tarım) sonucu doğmuştur. Bir yılı 365 gün olarak hesaplayarak Miladi takvimin temelini atmışlardır. Astronominin tarım için ne kadar hayati olduğunu gösterir."
        },
        {
            isim: "Sümer Ay Takvimi",
            renk: "#2980b9",
            koordinatlar: [[33.0, 43.0], [30.0, 47.0], [32.0, 48.0], [37.0, 45.0], [37.0, 42.0]],
            bilgi: "<b>Ay Takvimi (Sümerler/Mezopotamya)</b><br>Zigguratlarda yapılan astronomik gözlemlerle şekillenmiştir. Ay'ın evrelerini esas alan bu sistem, Mezopotamya'nın şehir devletleri yapısında dini ve idari işlerin düzenlenmesinde kullanılmıştır."
        },
        {
            isim: "Hicri Takvim",
            renk: "#27ae60",
            koordinatlar: [[25.0, 37.0], [25.0, 41.0], [20.0, 42.0], [18.0, 40.0], [20.0, 38.0]],
            bilgi: "<b>Hicri Takvim (Hicaz)</b><br>Ay yılı esaslıdır. Başlangıç olarak İslam tarihinin dönüm noktası olan Hicret'i (622) alır. Müslümanların dini günlerini ve ibadet vakitlerini belirleme ihtiyacıyla yaygınlaşmıştır."
        },
        {
            isim: "Celali Takvimi",
            renk: "#8e44ad",
            koordinatlar: [[38.0, 45.0], [40.0, 55.0], [35.0, 65.0], [28.0, 55.0], [30.0, 45.0]],
            bilgi: "<b>Celali Takvimi (Büyük Selçuklu)</b><br>Melikşah döneminde Ömer Hayyam başkanlığındaki bir heyetçe hazırlanmıştır. Tarım ve vergi toplama zamanlarını (ekonomik ihtiyaçlar) hatasız düzenlemek için Güneş yılı esasına göre kurgulanmış çok hassas bir takvimdir."
        }
    ];

    takvimler.forEach(t => {
        L.polygon(t.koordinatlar, { color: t.renk, fillColor: t.renk, fillOpacity: 0.5, weight: 2 })
        .addTo(window.currentMapInstance)
        .bindPopup(t.bilgi);
    });

    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.innerHTML = '<h4 style="margin: 0 0 5px 0; font-size:14px;">Zamanın Coğrafyası</h4>';
        takvimler.forEach(t => {
            div.innerHTML += `<div style="display:flex; align-items:center; margin-bottom:3px; font-size:12px;"><i style="background: ${t.renk}; width: 15px; height: 10px; display: inline-block; margin-right: 5px; opacity: 0.7;"></i> ${t.isim}</div>`;
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);
};
// 8. HARİTA: TARİHE YARDIMCI BİLİMLER VE BÜYÜK KEŞİFLER
window.HARITA_MOTORU["kesifler_haritasi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <p style="font-size: 0.9em; opacity: 0.8; margin: 0; color: var(--text-color);">Büyük keşiflerin üzerindeki renkli noktalara tıklayarak, bu keşiflerin hangi yardımcı bilim dallarıyla incelendiğini öğrenin.</p>
        </div>
    `;
    controlsContainer.style.display = 'block';

    // Haritayı dünyayı kapsayacak şekilde başlat
    window.currentMapInstance = L.map('mapCanvas').setView([35.0, 55.0], 3);

    // Fiziki Harita Altlığı
    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // ZENGİNLEŞTİRİLMİŞ KEŞİFLER LİSTESİ (10 ADET)
    const kesifler = [
        {
            isim: "Rosetta Taşı (Mısır)",
            renk: "#e74c3c", // Kırmızı
            koordinatlar: [31.4, 30.4],
            bilgi: "<b>Rosetta Taşı</b><br>Mısır hiyerogliflerinin çözülmesini sağlayan anahtardır.<br><br><b>İlgili Bilimler:</b><br>• <b>Epigrafi:</b> Kitabeleri inceler.<br>• <b>Filoloji:</b> Dilleri ve metinleri inceler."
        },
        {
            isim: "Orhun Abideleri (Moğolistan)",
            renk: "#3498db", // Mavi
            koordinatlar: [47.5, 102.8],
            bilgi: "<b>Orhun Abideleri</b><br>Türk adının geçtiği ilk yazılı metinlerdir.<br><br><b>İlgili Bilimler:</b><br>• <b>Epigrafi:</b> Anıtların üzerindeki yazıları inceler.<br>• <b>Filoloji:</b> Eski Türkçeyi analiz eder.<br>• <b>Karbon-14:</b> Taşın yaşını belirler."
        },
        {
            isim: "Terracotta Ordusu (Çin)",
            renk: "#e67e22", // Turuncu
            koordinatlar: [34.4, 109.3],
            bilgi: "<b>Terracotta Ordusu</b><br>Çin'in ilk imparatoru Qin Shi Huang'ın mezarındaki toprak askerler.<br><br><b>İlgili Bilimler:</b><br>• <b>Arkeoloji:</b> Kazı yoluyla bu yeraltı ordusunu gün ışığına çıkarmıştır.<br>• <b>Sanat Tarihi:</b> Dönemin heykeltıraşlık tekniklerini inceler."
        },
        {
            isim: "Lidya Sikkeleri (Manisa)",
            renk: "#f1c40f", // Sarı
            koordinatlar: [38.5, 28.0],
            bilgi: "<b>Lidya Sikkeleri</b><br>Tarihteki ilk madeni paralar Sardes'te basılmıştır.<br><br><b>İlgili Bilimler:</b><br>• <b>Nümismatik (Meskukat):</b> Eski paraları inceler.<br>• <b>Metalurji:</b> Paraların yapıldığı madenleri analiz eder."
        },
        {
            isim: "Göbeklitepe (Şanlıurfa)",
            renk: "#9b59b6", // Mor
            koordinatlar: [37.2, 38.9],
            bilgi: "<b>Göbeklitepe</b><br>Dünyanın bilinen en eski tapınak kompleksidir.<br><br><b>İlgili Bilimler:</b><br>• <b>Arkeoloji:</b> Kazılarla yerleşimi ortaya çıkarır.<br>• <b>Karbon-14:</b> MÖ 10.000'li yıllara dayanan tarihini kanıtlar.<br>• <b>Antropoloji:</b> İnsanların inanç ve sosyal yapısını inceler."
        },
        {
            isim: "Kadeş Antlaşması (Çorum)",
            renk: "#1abc9c", // Turkuaz
            koordinatlar: [40.0, 34.6], // Hattuşaş
            bilgi: "<b>Kadeş Antlaşması Kil Tableti</b><br>Tarihte bilinen ilk yazılı barış antlaşmasıdır. Hititler ve Mısırlılar arasında imzalanmıştır.<br><br><b>İlgili Bilimler:</b><br>• <b>Diplomatik:</b> Devletler arası resmi belgeleri ve antlaşmaları inceler.<br>• <b>Paleografi:</b> Çivi yazısının alfabesini çözer."
        },
        {
            isim: "Hammurabi Kanunları (Irak/İran)",
            renk: "#d35400", // Koyu Turuncu
            koordinatlar: [32.1, 48.2], // Susa (Bulunduğu yer)
            bilgi: "<b>Hammurabi Dikilitaşı</b><br>Babil Kralı Hammurabi'nin hazırlattığı, tarihin ilk kapsamlı anayasa metnidir.<br><br><b>İlgili Bilimler:</b><br>• <b>Hukuk Tarihi:</b> Eski kanunları ve ceza sistemini inceler.<br>• <b>Epigrafi:</b> Taş üzerindeki çivi yazılarını okur."
        },
        {
            isim: "Çatalhöyük (Konya)",
            renk: "#c0392b", // Bordo
            koordinatlar: [37.6, 32.8],
            bilgi: "<b>Çatalhöyük Neolitik Kenti</b><br>İnsanlığın ilk tarım ve şehir yerleşimlerinden biridir. Evlere çatılardan girilirdi.<br><br><b>İlgili Bilimler:</b><br>• <b>Arkeoloji:</b> Şehir kalıntılarını kazar.<br>• <b>Etnografya:</b> O dönemki insanların kültürlerini inceler."
        },
        {
            isim: "Ölü Deniz Yazmaları (Kudüs)",
            renk: "#2c3e50", // Koyu Lacivert
            koordinatlar: [31.7, 35.4], // Kumran Mağaraları
            bilgi: "<b>Ölü Deniz (Kumran) Yazmaları</b><br>Tarihteki en eski İncil ve Tevrat metinlerini içeren deri ve papirüs tomarlarıdır.<br><br><b>İlgili Bilimler:</b><br>• <b>Paleografi:</b> Çok eski alfabeleri (Aramice, İbranice) okur.<br>• <b>Filoloji:</b> Eski dillerin gramer yapısını inceler."
        },
        {
            isim: "Piri Reis Haritası (İstanbul)",
            renk: "#16a085", // Koyu Su Yeşili
            koordinatlar: [41.0, 28.9], // Topkapı Sarayı
            bilgi: "<b>Piri Reis'in Dünya Haritası (1513)</b><br>Ceylan derisi üzerine çizilmiş, Amerika kıtasını gösteren en eski ve gizemli haritalardan biridir.<br><br><b>İlgili Bilimler:</b><br>• <b>Coğrafya:</b> Yer şekillerini ve kıtaları inceler.<br>• <b>Karbon-14:</b> Derinin 16. yüzyıla ait olduğunu kanıtlar."
        }
    ];

    kesifler.forEach(k => {
        L.circleMarker(k.koordinatlar, { 
            color: k.renk, 
            fillColor: k.renk, 
            fillOpacity: 0.8, 
            radius: 8, 
            weight: 2 
        })
        .addTo(window.currentMapInstance)
        .bindPopup(k.bilgi);
    });

    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        
        // Lejantın çok uzamaması için iki sütunlu grid yapısı kullanıyoruz
        div.style.display = "grid";
        div.style.gridTemplateColumns = "1fr 1fr";
        div.style.gap = "0 15px";
        
        // Başlığı üstte tüm sütunları kapsayacak şekilde ayarlıyoruz
        const title = L.DomUtil.create('div');
        title.style.gridColumn = "1 / -1";
        title.innerHTML = '<h4 style="margin: 0 0 8px 0; font-size:14px; text-align:center;">Büyük Keşifler</h4>';
        div.appendChild(title);

        kesifler.forEach(k => {
            const item = L.DomUtil.create('div');
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.marginBottom = "5px";
            item.style.fontSize = "12px";
            item.innerHTML = `<i style="background: ${k.renk}; width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 6px; flex-shrink:0;"></i> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" title="${k.isim}">${k.isim.split(" ")[0]} ${k.isim.split(" ")[1] || ""}</span>`;
            div.appendChild(item);
        });
        return div;
    };
    legend.addTo(window.currentMapInstance);
};
// 9. HARİTA: TARİH YAZICILIĞININ GELİŞİM ROTALARI
window.HARITA_MOTORU["tarih_yaziciligi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="yazicilikYilBaslik" style="margin: 0 0 5px 0; color: #e67e22; font-size: 18px; font-weight: 800;">MÖ 1300 - Hitit Analları</h4>
            <p id="yazicilikBilgi" style="font-size: 0.9em; opacity: 0.9; margin-bottom: 15px; color: var(--text-color); min-height: 45px;">Hitit kralları, Tanrıya hesap vermek için zaferleri kadar yenilgilerini de yazdılar. Bu, objektif tarih yazıcılığının ilk adımıdır.</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(230,126,34,0.2);">
                <span style="font-weight: 700; color: var(--text-color);">Kadim</span>
                <input type="range" id="yazicilikSlider" min="0" max="4" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #e67e22; height: 6px; border-radius: 5px;">
                <span style="font-weight: 700; color: var(--text-color);">Modern</span>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Yazım türlerini ve rotaları keşfetmek için çubuğu sağa kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    window.currentMapInstance = L.map('mapCanvas').setView([35.0, 35.0], 4);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    const rotalar = [
        {
            isim: "Hitit Analları (Objektif Yazıcılık)",
            renk: "#e67e22",
            coords: [40.0, 34.6], // Hattuşaş
            bilgi: "<b>Hitit Analları (MÖ 1300)</b><br>Tarih yazıcılığının ilk tarafsız örnekleridir. Krallar, tanrılara hesap vereceklerine inandıkları için yenilgilerini de dürüstçe kaydetmişlerdir.",
            tur: "Objektif Tarih Yazıcılığı"
        },
        {
            isim: "Herodot (Hikayeci Yazıcılık)",
            renk: "#3498db",
            coords: [37.0, 27.4], // Bodrum/Halikarnas
            bilgi: "<b>Herodot (MÖ 5. YY)</b><br>Tarihin babası olarak kabul edilir. 'Historia' adlı eserinde efsanelerle gerçekleri harmanlamış, hikayeci bir dil kullanmıştır.",
            tur: "Hikayeci Tarih Yazıcılığı"
        },
        {
            isim: "Thukydides (Öğretici Yazıcılık)",
            renk: "#2ecc71",
            coords: [37.9, 23.7], // Atina
            bilgi: "<b>Thukydides (MÖ 5. YY)</b><br>Peloponnes Savaşlarını neden-sonuç ilişkisi içinde anlatmıştır. Amacı okuyucuya siyasi dersler vermektir.",
            tur: "Öğretici (Pragmatik) Yazıcılık"
        },
        {
            isim: "Taberî (İslam Dünyasında Rivayetçilik)",
            renk: "#f1c40f",
            coords: [33.3, 44.4], // Bağdat
            bilgi: "<b>Taberî (9. YY)</b><br>İslam tarih yazıcılığının en büyük isimlerindendir. Olayları habercilere (rivayet) dayandırarak geniş kapsamlı eserler bırakmıştır.",
            tur: "Rivayetçi Tarih Yazıcılığı"
        },
        {
            isim: "İbn Haldun (Bilimsel/Sosyolojik)",
            renk: "#9b59b6",
            coords: [30.0, 31.2], // Kahire/Tunus
            bilgi: "<b>İbn Haldun (14. YY)</b><br>'Mukaddime' eseriyle tarih felsefesinin kurucusu sayılır. Tarihi sadece olaylar yığını değil, toplumların yapısını inceleyen bir bilim olarak görmüştür.",
            tur: "Bilimsel/Felsefi Tarih Yazıcılığı"
        }
    ];

    let currentMarker = null;

    function rotayiGuncelle(index) {
        const rota = rotalar[index];

        if (currentMarker) window.currentMapInstance.removeLayer(currentMarker);

        currentMarker = L.circleMarker(rota.coords, {
            color: rota.renk,
            fillColor: rota.renk,
            fillOpacity: 0.8,
            radius: 12,
            weight: 3
        }).addTo(window.currentMapInstance)
          .bindPopup(`<b>${rota.isim}</b><br>${rota.bilgi}`)
          .openPopup();

        window.currentMapInstance.flyTo(rota.coords, 6);

        document.getElementById('yazicilikYilBaslik').innerText = rota.isim;
        document.getElementById('yazicilikYilBaslik').style.color = rota.renk;
        document.getElementById('yazicilikBilgi').innerText = rota.tur + ": " + rota.bilgi.split("<br>")[1].substring(0, 100) + "...";
        document.getElementById('yazicilikSlider').style.accentColor = rota.renk;
    }

    document.getElementById('yazicilikSlider').addEventListener('input', function(e) {
        rotayiGuncelle(parseInt(e.target.value));
    });

    rotayiGuncelle(0);
};
// 10. HARİTA: "SUYA DÜŞEN TAŞ" (OLAY VE OLGU)
window.HARITA_MOTORU["olay_olgu"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    controlsContainer.innerHTML = `
        <div style="text-align: center; padding: 10px;">
            <h4 id="ooBaslik" style="margin: 0 0 5px 0; color: #3498db; font-size: 18px; font-weight: 800;">Olay (Vaka) ve Olgu (Vakıa)</h4>
            
            <div style="background: rgba(255,255,255,0.8); border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                <p id="olayMetni" style="font-size: 0.95em; margin: 0 0 8px 0; color: #d35400; font-weight: bold;">
                    <i class="fa-solid fa-location-dot"></i> Olay: [Yükleniyor...]
                </p>
                <p id="olguMetni" style="font-size: 0.95em; margin: 0; color: #27ae60; font-weight: bold; opacity: 0; transition: opacity 0.8s ease;">
                    <i class="fa-solid fa-water"></i> Olgu: [Yükleniyor...]
                </p>
            </div>

            <button id="btnDalga" style="background: #3498db; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.3s;">
                <i class="fa-solid fa-gem"></i> Taşı Suya At (Olgu Dalgalarını Başlat)
            </button>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(0,0,0,0.05); padding: 10px 15px; border-radius: 8px;">
                <i class="fa-solid fa-arrow-left" style="opacity: 0.5;"></i>
                <input type="range" id="ooSlider" min="0" max="3" value="0" step="1" 
                       style="flex: 1; max-width: 300px; cursor: pointer; accent-color: #3498db; height: 6px; border-radius: 5px;">
                <i class="fa-solid fa-arrow-right" style="opacity: 0.5;"></i>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; color: var(--text-color);">Farklı örnekleri görmek için çubuğu kaydırın</div>
        </div>
    `;
    controlsContainer.style.display = 'block';

    window.currentMapInstance = L.map('mapCanvas').setView([39.0, 35.0], 5);

    L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}', {
        maxZoom: 10,
        attribution: '© Google Haritalar (Fiziki)'
    }).addTo(window.currentMapInstance);

    // 4 FARKLI OLAY-OLGU ÖRNEĞİ
    const ornekler = [
        {
            olayAd: "Malazgirt Meydan Muharebesi (1071)",
            olguAd: "Anadolu'nun Türkleşmesi ve İslamlaşması Süreci",
            coords: [39.14, 42.54], // Muş/Malazgirt
            renk: "#2ecc71", // Yeşil
            maxRadius: 800000 // Dalganın ulaşacağı metre cinsinden çap (Anadolu'yu kaplar)
        },
        {
            olayAd: "Fransız İhtilali (1789)",
            olguAd: "Milliyetçilik Akımının Yayılması ve Ulus Devletlerin Doğuşu",
            coords: [48.85, 2.35], // Paris
            renk: "#e74c3c", // Kırmızı
            maxRadius: 2500000 // Tüm Avrupa'yı kaplar
        },
        {
            olayAd: "Talas Savaşı (751)",
            olguAd: "Türklerin Kitleler Halinde İslamiyet'i Kabul Etmesi",
            coords: [42.52, 72.23], // Talas/Kırgızistan
            renk: "#1abc9c", // Turkuaz
            maxRadius: 1800000 // Orta Asya'ya yayılır
        },
        {
            olayAd: "İlk Buhar Makinesinin İcadı (1765)",
            olguAd: "Küresel Sanayileşme, İşçi Sınıfı ve Sömürgeciliğin Yayılması",
            coords: [53.48, -2.24], // Manchester/İngiltere
            renk: "#34495e", // Endüstriyel Koyu Gri
            maxRadius: 3500000 // Kıtalararası yayılır
        }
    ];

    let currentMarker = null;
    let currentWave = null;
    let waveInterval = null;

    function ornegiGuncelle(index) {
        const ornek = ornekler[index];

        // Haritayı temizle
        if (currentMarker) window.currentMapInstance.removeLayer(currentMarker);
        if (currentWave) window.currentMapInstance.removeLayer(currentWave);
        if (waveInterval) clearInterval(waveInterval);

        // Olay (Taş) noktasını koy
        currentMarker = L.marker(ornek.coords).addTo(window.currentMapInstance)
            .bindPopup(`<b>Olay:</b> ${ornek.olayAd}`);
        
        // Harita kamerası Olayın olduğu yere uçar
        window.currentMapInstance.flyTo(ornek.coords, 4, { duration: 1.5 });

        // Arayüz metinlerini güncelle
        document.getElementById('olayMetni').innerHTML = `<i class="fa-solid fa-location-dot"></i> <b>Kısa Süreli Olay (Vaka):</b> ${ornek.olayAd}`;
        document.getElementById('olguMetni').innerHTML = `<i class="fa-solid fa-water"></i> <b>Uzun Süreli Olgu (Vakıa):</b> ${ornek.olguAd}`;
        
        // Olgu metnini gizle ve butonu aktif et
        document.getElementById('olguMetni').style.opacity = "0";
        const btn = document.getElementById('btnDalga');
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.background = ornek.renk;
        document.getElementById('ooSlider').style.accentColor = ornek.renk;
        
        // Butonun tıklama işlevi (Dalga Animasyonu)
        btn.onclick = function() {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            document.getElementById('olguMetni').style.opacity = "1"; // Olgu yazısı yavaşça belirir

            // "Suya Düşen Taş" Animasyon Döngüsü
            let currentRadius = 10000; // 10km ile başla
            currentWave = L.circle(ornek.coords, {
                color: ornek.renk,
                fillColor: ornek.renk,
                fillOpacity: 0.3,
                weight: 2,
                radius: currentRadius
            }).addTo(window.currentMapInstance);

            waveInterval = setInterval(() => {
                currentRadius += ornek.maxRadius / 40; // Dalga 40 adımda büyür
                currentWave.setRadius(currentRadius);
                
                if (currentRadius >= ornek.maxRadius) {
                    clearInterval(waveInterval);
                    currentWave.bindPopup(`<b>Olgu:</b> ${ornek.olguAd}`).openPopup();
                }
            }, 30); // Saniyede 30 kare akıcılığında büyüme
        };
    }

    document.getElementById('ooSlider').addEventListener('input', function(e) {
        ornegiGuncelle(parseInt(e.target.value));
    });

    // İlk örneği yükle
    ornegiGuncelle(0);
};
// 11. ARAÇ: İNTERAKTİF YÜZYIL VE ÇEYREK HESAPLAMA SİMÜLATÖRÜ (KOMPAKT VERSİYON)
window.HARITA_MOTORU["yuzyil_hesaplama"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '5px 10px'; // Dikey boşluğu azalttık
    
    // Giriş alanını tek satıra indirdik ve açıklamayı küçülttük
    controlsContainer.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px;">
            <select id="zamanYonu" style="padding: 6px; border-radius: 6px; font-weight: bold; border: 2px solid #9b59b6; background: var(--container-bg); color: var(--text-color); font-size: 14px;">
                <option value="MO">MÖ</option>
                <option value="MS" selected>MS</option>
            </select>
            <input type="number" id="yilInput" placeholder="Yıl giriniz..." style="padding: 6px; border-radius: 6px; border: 2px solid #9b59b6; width: 100px; font-weight:bold; background: var(--container-bg); color: var(--text-color); font-size: 14px;">
            <button id="hesaplaBtn" style="background: #9b59b6; color: white; border: none; padding: 7px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
                Hesapla
            </button>
            <div style="font-size: 11px; opacity: 0.7; color: var(--text-color); width: 100%; text-align: center; margin-top: 2px;">Yılı girip 'Hesapla' butonuna dokunun.</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    mapCanvas.innerHTML = `
        <div id="zamanCetveliAlani" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; padding: 15px; background: var(--container-bg); box-sizing: border-box;">
            
            <div id="cetvelSonuc" style="font-size: 20px; font-weight: 800; color: var(--text-color); margin-bottom: 20px; text-align: center; width: 100%; min-height: 50px;">
                <span style="opacity: 0.5; font-size: 16px; font-weight: 400;">Sonuç burada belirecek</span>
            </div>
            
            <div id="grafikKutusu" style="width: 100%; max-width: 600px; opacity: 0; transition: opacity 0.5s ease;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: 900; font-size: 14px; color: var(--text-color); opacity: 0.8;">
                    <span id="yuzyilBas">0</span>
                    <span id="yuzyilOrta">50</span>
                    <span id="yuzyilSon">99</span>
                </div>

                <div style="position: relative; width: 100%; height: 50px; background: var(--card-border); border-radius: 8px; overflow: hidden; display: flex;">
                    <div id="ceyrek1" style="flex: 1; border-right: 1px dashed rgba(127,140,141,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: var(--text-color);">Ç1</div>
                    <div id="ceyrek2" style="flex: 1; border-right: 2px solid rgba(127,140,141,0.5); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: var(--text-color);">Ç2</div>
                    <div id="ceyrek3" style="flex: 1; border-right: 1px dashed rgba(127,140,141,0.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: var(--text-color);">Ç3</div>
                    <div id="ceyrek4" style="flex: 1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: var(--text-color);">Ç4</div>
                    <div id="zamanOku" style="position: absolute; top: 0; left: 0%; height: 100%; width: 4px; background: #e74c3c; box-shadow: 0 0 10px #e74c3c; transition: left 0.8s ease; z-index: 10;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 10px;">
                    <div id="yari1" style="width: 49%; text-align: center; padding: 6px; background: var(--option-bg); border-radius: 6px; font-size: 13px; font-weight: bold; color: var(--text-color); border: 1px solid var(--card-border);">1. Yarı</div>
                    <div id="yari2" style="width: 49%; text-align: center; padding: 6px; background: var(--option-bg); border-radius: 6px; font-size: 13px; font-weight: bold; color: var(--text-color); border: 1px solid var(--card-border);">2. Yarı</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('hesaplaBtn').addEventListener('click', function() {
        const yil = parseInt(document.getElementById('yilInput').value);
        const yon = document.getElementById('zamanYonu').value;
        if (!yil || yil < 1) return;

        const yuzyil = Math.ceil(yil / 100);
        let yilinIkiHanesi = yil % 100 === 0 ? 100 : yil % 100;
        let yari = "", ceyrek = "", leftPercent = 0;

        if (yon === "MS") {
            yari = (yilinIkiHanesi <= 49) ? "1. Yarı" : "2. Yarı";
            if (yilinIkiHanesi <= 24) ceyrek = "1. Çeyrek";
            else if (yilinIkiHanesi <= 49) ceyrek = "2. Çeyrek";
            else if (yilinIkiHanesi <= 74) ceyrek = "3. Çeyrek";
            else ceyrek = "4. Çeyrek";
            leftPercent = (yilinIkiHanesi === 100 ? 99 : yilinIkiHanesi);
            document.getElementById('yuzyilBas').innerText = (yuzyil - 1) * 100;
            document.getElementById('yuzyilSon').innerText = (yuzyil * 100) - 1;
        } else { 
            yari = (yilinIkiHanesi >= 50) ? "1. Yarı" : "2. Yarı";
            if (yilinIkiHanesi >= 75) ceyrek = "1. Çeyrek";
            else if (yilinIkiHanesi >= 50) ceyrek = "2. Çeyrek";
            else if (yilinIkiHanesi >= 25) ceyrek = "3. Çeyrek";
            else ceyrek = "4. Çeyrek";
            leftPercent = 100 - (yilinIkiHanesi === 100 ? 100 : yilinIkiHanesi);
            document.getElementById('yuzyilBas').innerText = yuzyil * 100;
            document.getElementById('yuzyilSon').innerText = (yuzyil - 1) * 100;
        }

        document.getElementById('cetvelSonuc').innerHTML = `<span style="color:#9b59b6">${yon} ${yil}</span><br><span style="font-size:16px">${yuzyil}. Yüzyıl - ${yari} - ${ceyrek}</span>`;
        document.getElementById('grafikKutusu').style.opacity = "1";
        document.getElementById('zamanOku').style.left = leftPercent + "%";

        // Renklendirme
        for(let i=1; i<=4; i++) document.getElementById('ceyrek'+i).style.background = "transparent";
        document.getElementById('yari1').style.background = document.getElementById('yari2').style.background = "var(--option-bg)";
        
        setTimeout(() => {
            const cMap = {"1. Çeyrek": 1, "2. Çeyrek": 2, "3. Çeyrek": 3, "4. Çeyrek": 4};
            document.getElementById('ceyrek'+cMap[ceyrek]).style.background = "rgba(155, 89, 182, 0.2)";
            if(yari === "1. Yarı") document.getElementById('yari1').style.background = "rgba(46, 204, 113, 0.2)";
            else document.getElementById('yari2').style.background = "rgba(46, 204, 113, 0.2)";
        }, 500);
    });
};
// 12. ARAÇ: TARİH DEDEKTİFİ (SAHTE BELGE AVCISI) - 5 VAKALI SÜRÜM
window.HARITA_MOTORU["tarih_dedektifi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #e74c3c; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-user-secret"></i> Tarih Dedektifi: Kaynak Eleştirisi</h4>
            <p style="font-size: 0.9em; opacity: 0.9; margin-bottom: 5px; color: var(--text-color);">Aşağıdaki tarihi iddiaları ve belgeleri inceleyin. Doğrulama araçlarını kullanarak belgenin orijinal (Gerçek) mi yoksa uydurma (Sahte) mi olduğunu kanıtlayın.</p>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // ZENGİNLEŞTİRİLMİŞ VAKA DOSYALARI (5 ADET)
    const vakalar = [
        {
            baslik: "VAKA DOSYASI #1: Eski Bir Antlaşma",
            iddia: "Kazılarda MÖ 1280 yılına ait, Hititler ve Mısırlılar arasında imzalanan Kadeş Antlaşması'nın çok iyi korunmuş, kağıt üzerine yazılmış bir kopyası bulundu!",
            ipucuZaman: "Kağıt, MÖ 2. yüzyılda Çin'de icat edilmiştir. MÖ 1280'de Anadolu veya Mısır'da kağıt bilinmiyordu.",
            ipucuFiziksel: "O dönemde antlaşmalar kil tabletlere veya papirüslere yazılırdı.",
            ipucuMantik: "Antlaşmanın metni tarihi gerçeklere uysa da, kullanıldığı materyal dönemin teknolojisiyle uyuşmuyor.",
            gercekMi: false,
            sonucMetni: "SAHTE! Bu bir Anakronizm (Zaman Yanılgısı) örneğidir. Belge içeriği doğru olsa bile, dış tenkit (materyal analizi) belgenin sahte olduğunu kanıtlar."
        },
        {
            baslik: "VAKA DOSYASI #2: Gizemli Hiyeroglifler",
            iddia: "Sosyal medyada yayılan bir fotoğrafta, Mısır Piramitlerinin içindeki bir duvarda uzay gemisi ve helikopter figürlerine benzeyen hiyeroglifler olduğu iddia ediliyor.",
            ipucuZaman: "Mısır uygarlığı döneminde motorlu taşıtlar veya uçan araçlar icat edilmemiştir.",
            ipucuFiziksel: "Epigrafi uzmanları (Yazıt bilimciler), bu şekillerin aslında iki farklı firavunun isimlerinin üst üste yazılmasıyla oluşan tesadüfi bir silinme olduğunu kanıtlamıştır.",
            ipucuMantik: "Tarih bilimi somut belgelere dayanır. Eski çağlarda devasa yapıların uzaylıların yardımıyla yapıldığı iddiası 'sözdebilim'dir.",
            gercekMi: false,
            sonucMetni: "SAHTE! Sosyal medyada sıkça dolaşan bu iddia, metinlerin üst üste binmesi (palimpsest) sonucu oluşan bir optik illüzyondur. Paleografi bilimi bu sahtekarlığı çürütmüştür."
        },
        {
            baslik: "VAKA DOSYASI #3: Sümerlerin Yakınması",
            iddia: "MÖ 2000'lere ait bir Sümer kil tabletinin çevirisinde şu cümle geçiyor: 'Günümüz gençliği çok bozuldu, büyüklere saygıları kalmadı. Dünyanın sonu yaklaşıyor olmalı.'",
            ipucuZaman: "Tablet gerçekten de Sümer dönemine aittir. O dönemde de nesiller arası çatışmalar yaşanıyordu.",
            ipucuFiziksel: "Filoloji uzmanları çivi yazısı metnini çevirmiş ve bu sitemkar edebi ifadenin tablette gerçekten yer aldığını doğrulamıştır.",
            ipucuMantik: "İnsan psikolojisi ve kuşak çatışmaları binlerce yıldır benzerdir. Bu metin, dönemin sosyal yapısını yansıtan birinci elden bir kaynaktır.",
            gercekMi: true,
            sonucMetni: "GERÇEK! Ne kadar modern görünse de, bu iddia doğrudur. İstanbul Arkeoloji Müzesi'nde de benzer edebi metinler barındıran orijinal Sümer tabletleri bulunmaktadır."
        },
        {
            baslik: "VAKA DOSYASI #4: İmparatorun Bağışı",
            iddia: "Avrupa'da yüzyıllarca kabul gören Latince bir belgede, 4. yüzyılda Roma İmparatoru Konstantin'in tüm Batı Roma'nın yönetimini Papa'ya bıraktığı yazıyor.",
            ipucuZaman: "Belgedeki bazı kelimeler ve hukuki terimler 4. yüzyılda değil, 8. yüzyılda kullanılmaya başlanmıştır.",
            ipucuFiziksel: "Rönesans bilginleri, metindeki Latince gramer yapısının (Filoloji) Klasik Roma dönemine değil, Orta Çağ'a ait olduğunu tespit etti.",
            ipucuMantik: "Güçlü bir imparatorun tüm siyasi gücünü sebepsiz yere devretmesi dönemin devlet mantığına aykırıdır.",
            gercekMi: false,
            sonucMetni: "SAHTE! 'Konstantin'in Bağışı' olarak bilinen bu belge tarihin en ünlü sahtekarlıklarından biridir. Lorenzo Valla, filoloji (dilbilim) kullanarak belgenin yüzyıllar sonra uydurulduğunu kanıtlamıştır."
        },
        {
            baslik: "VAKA DOSYASI #5: Diktatörün Günlükleri",
            iddia: "1983 yılında Almanya'da, Adolf Hitler'e ait olduğu iddia edilen ve onun gizli planlarını anlatan 60 ciltlik el yazması günlükler bulundu.",
            ipucuZaman: "Günlüklerin yazıldığı iddia edilen dönem ile kağıdın üretim tarihi uyuşmuyor.",
            ipucuFiziksel: "Kimyasal analizler, kağıdın içindeki beyazlatıcı maddenin ve mürekkebin 1950'lerden sonra (Hitler'in ölümünden sonra) icat edildiğini kanıtladı.",
            ipucuMantik: "Hitler'in hayatının son yıllarında ağır el titremesi (Parkinson) yaşadığı ve bu kadar uzun metinleri kendi eliyle yazamayacağı biliniyor.",
            gercekMi: false,
            sonucMetni: "SAHTE! 'Hitler Günlükleri' skandalı, dış tenkitin (kimya ve materyal analizi) ne kadar hayati olduğunu gösterir. Sahtekarlar kağıt ve mürekkep analizini hesaba katmamıştı."
        }
    ];

    let aktifVaka = 0;

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; padding: 20px; background: var(--container-bg); box-sizing: border-box; overflow-y: auto;">
            
            <div style="max-width: 700px; margin: 0 auto; background: var(--option-bg); border: 2px solid #34495e; border-radius: 10px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px dashed #7f8c8d; padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 id="vakaBaslik" style="margin: 0; color: #e74c3c; font-family: monospace; font-size: 20px;"></h3>
                    <span style="background: #e74c3c; color: white; padding: 3px 10px; border-radius: 5px; font-weight: bold; font-size: 12px; letter-spacing: 1px;">GİZLİ DOSYA ${aktifVaka + 1}/5</span>
                </div>
                
                <p id="vakaIddia" style="font-size: 16px; font-weight: 600; color: var(--text-color); margin-bottom: 25px; line-height: 1.5; padding: 15px; background: rgba(236, 240, 241, 0.1); border-left: 4px solid #3498db;"></p>

                <h4 style="margin: 0 0 10px 0; color: var(--text-color);"><i class="fa-solid fa-toolbox"></i> Doğrulama Araçları (İpuçları):</h4>
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="aracBtn" data-tip="zaman" style="flex:1; background: #34495e; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; transition: 0.3s; font-weight: bold;"><i class="fa-solid fa-clock"></i> Zaman Süzgeci</button>
                    <button class="aracBtn" data-tip="fiziksel" style="flex:1; background: #34495e; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; transition: 0.3s; font-weight: bold;"><i class="fa-solid fa-microscope"></i> Dış Tenkit</button>
                    <button class="aracBtn" data-tip="mantik" style="flex:1; background: #34495e; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; transition: 0.3s; font-weight: bold;"><i class="fa-solid fa-brain"></i> İç Tenkit</button>
                </div>

                <div id="ipucuAlani" style="display: none; background: rgba(241, 196, 15, 0.2); border-left: 4px solid #f1c40f; padding: 15px; margin-bottom: 20px; font-size: 14px; font-weight: bold; color: var(--text-color); min-height: 50px;"></div>

                <div id="kararAlani" style="text-align: center; border-top: 2px dashed #7f8c8d; padding-top: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: var(--text-color);">KARARIN NEDİR DEDEKTİF?</h4>
                    <button id="btnGercek" style="background: #27ae60; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; margin-right: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"><i class="fa-solid fa-check"></i> GERÇEK</button>
                    <button id="btnSahte" style="background: #c0392b; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"><i class="fa-solid fa-xmark"></i> SAHTE</button>
                </div>

                <div id="sonucAlani" style="display: none; margin-top: 20px; text-align: center; padding: 20px; border-radius: 10px; font-size: 16px; font-weight: bold;">
                    <p id="sonucMetni" style="margin: 0 0 15px 0; color: #fff;"></p>
                    <button id="btnSonraki" style="background: rgba(255,255,255,0.3); color: white; border: 2px solid white; padding: 8px 20px; border-radius: 5px; font-weight: bold; cursor: pointer;">Sonraki Dosya <i class="fa-solid fa-arrow-right"></i></button>
                </div>

            </div>
        </div>
    `;

    function vakayiYukle() {
        const v = vakalar[aktifVaka];
        document.getElementById('vakaBaslik').innerText = v.baslik;
        document.querySelector('span[style*="letter-spacing"]').innerText = `İncelenen Vaka ${aktifVaka + 1}/5`;
        document.getElementById('vakaIddia').innerHTML = `"${v.iddia}"`;
        document.getElementById('ipucuAlani').style.display = 'none';
        document.getElementById('sonucAlani').style.display = 'none';
        document.getElementById('kararAlani').style.display = 'block';

        document.querySelectorAll('.aracBtn').forEach(btn => {
            btn.style.opacity = '1';
            btn.onclick = function() {
                const tip = this.getAttribute('data-tip');
                const ipucuKutusu = document.getElementById('ipucuAlani');
                ipucuKutusu.style.display = 'block';
                if(tip === 'zaman') ipucuKutusu.innerHTML = `<i class="fa-solid fa-clock"></i> <b>Zaman Raporu:</b> ${v.ipucuZaman}`;
                if(tip === 'fiziksel') ipucuKutusu.innerHTML = `<i class="fa-solid fa-microscope"></i> <b>Materyal Raporu:</b> ${v.ipucuFiziksel}`;
                if(tip === 'mantik') ipucuKutusu.innerHTML = `<i class="fa-solid fa-brain"></i> <b>Mantık Raporu:</b> ${v.ipucuMantik}`;
                this.style.opacity = '0.5';
            };
        });
    }

    function karariKontrolEt(secimGercekMi) {
        const v = vakalar[aktifVaka];
        const sonucAlani = document.getElementById('sonucAlani');
        const sonucMetni = document.getElementById('sonucMetni');
        
        document.getElementById('kararAlani').style.display = 'none';
        sonucAlani.style.display = 'block';

        if(secimGercekMi === v.gercekMi) {
            sonucAlani.style.background = '#27ae60';
            sonucMetni.innerHTML = `<i class="fa-solid fa-star"></i> TEBRİKLER DEDEKTİF! Doğru bildin.<br><br>${v.sonucMetni}`;
        } else {
            sonucAlani.style.background = '#c0392b';
            sonucMetni.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> YANLIŞ KARAR! Dezenformasyon tuzağına düştün.<br><br>${v.sonucMetni}`;
        }

        if(aktifVaka === vakalar.length - 1) {
            document.getElementById('btnSonraki').innerText = "Vakaları Başa Sar";
        } else {
            document.getElementById('btnSonraki').innerHTML = "Sonraki Dosya <i class='fa-solid fa-arrow-right'></i>";
        }
    }

    document.getElementById('btnGercek').onclick = () => karariKontrolEt(true);
    document.getElementById('btnSahte').onclick = () => karariKontrolEt(false);
    
    document.getElementById('btnSonraki').onclick = () => {
        aktifVaka++;
        if(aktifVaka >= vakalar.length) aktifVaka = 0;
        vakayiYukle();
    };

    vakayiYukle();
};
// 13. ARAÇ: TARİHİ SİNEMA RADARI (BOĞAZİÇİ SİNEMA PLATFORMU ÖZEL SÜRÜMÜ)
window.HARITA_MOTORU["sinema_radari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #f39c12; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <span><i class="fa-solid fa-film"></i> Tarihi Sinema Radarı</span>
                <a href="https://sinema.kirkyama.uk" target="_blank" title="Filmleri İzlemek İçin Sinema Platformuna Git" style="font-size: 12px; color: #fff; background: #f39c12; text-decoration: none; padding: 3px 10px; border-radius: 15px; font-weight: bold; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> sinema.kirkyama.uk
                </a>
            </h4>
            <div style="display: flex; justify-content: center; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                <select id="filmSecici" style="padding: 6px; border-radius: 5px; border: 2px solid #f39c12; background: var(--container-bg); color: var(--text-color); font-weight: bold; font-size: 14px; max-width: 100%;">
                    <option value="gladiator">Gladiator (Gladyatör)</option>
                    <option value="braveheart">Braveheart (Cesur Yürek)</option>
                    <option value="troy">Troy (Truva)</option>
                    <option value="warhorse">War Horse (Savaş Atı)</option>
                    <option value="bati_cephesi">Batı Cephesinde Yeni Bir Şey Yok</option>
                    <option value="1917">1917</option>
                    <option value="nisan1915">Bir İnce Sızı Nisan 1915 (Tiyatro)</option>
                    <option value="hidden_figures">Hidden Figures (Gizli Sayılar)</option>
                    <option value="turtles">Kaplumbağalar da Uçar (Turtles Can Fly)</option>
                    <option value="sherlock">Sherlock Holmes: Gölge Oyunları</option>
                    <option value="kinglear">King Lear (Kral Lear)</option>
                </select>
            </div>
            <div style="font-size: 11px; opacity: 0.6; margin-top: 5px; color: var(--text-color);">Bir film seçin ve sahnelerin gerçek mi kurgu mu olduğunu analiz edin.</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // BOĞAZİÇİ SİNEMA PLATFORMUNDAKİ TÜM FİLMLERİN VERİTABANI
    const filmVerileri = {
        "gladiator": {
            aciklama: "Roma İmparatorluğu'nun altın çağının sonlarında, ihanete uğrayan bir generalin arenadaki mücadelesi.",
            sahneler: [
                { baslik: "İmparator Commodus'un Arenada Ölümü", iddia: "İmparator Commodus, gladyatör Maximus ile arenada halkın gözü önünde dövüşürken öldürülmüştür.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Commodus arenada dövüşmeyi çok severdi ancak arenada ölmedi. MS 192'de hamamda güreş hocası Narcissus tarafından boğularak suikasta uğradı." },
                { baslik: "Germen Savaşları ve Roma Ordusu", iddia: "Filmin başındaki devasa orman savaşı ve Roma ordusunun savaş düzeni (Testudo/Kaplumbağa vb.) o döneme aittir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> İmparator Marcus Aurelius dönemi gerçekten de kuzeydeki Germen kabileleriyle (Marcomanni) yapılan zorlu ve kanlı orman savaşlarıyla geçmiştir." }
            ]
        },
        "braveheart": {
            aciklama: "13. Yüzyılda İskoçya'nın İngiltere'ye karşı verdiği bağımsızlık savaşını ve William Wallace'ı anlatır.",
            sahneler: [
                { baslik: "Stirling Köprüsü Savaşı", iddia: "William Wallace'ın İngiliz ağır süvarilerini yendiği devasa savaş geniş bir ovada gerçekleşmiştir.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Savaşın gerçek adı 'Stirling KÖPRÜSÜ Savaşı'dır. Wallace, dar bir köprüden geçen İngilizleri tuzağa düşürerek yenmiştir. Filmde bütçe/çekim zorluğu nedeniyle köprü hiç gösterilmemiştir!" },
                { baslik: "İskoçların Bağımsızlık İsyanı", iddia: "William Wallace, İngiliz zulmüne (ve eşinin öldürülmesine) karşı halkı örgütleyen gerçek bir tarihi figürdür.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> William Wallace, İskoçya'nın en büyük milli kahramanlarından biridir ve I. Edward'ın ordularına karşı gerçekten de gerilla taktikleriyle büyük bir isyan başlatmıştır." }
            ]
        },
        "troy": {
            aciklama: "Homeros'un İlyada destanına dayanan, Akalar (Yunanlılar) ile Truvalılar arasındaki efsanevi savaşı konu alır.",
            sahneler: [
                { baslik: "Truva Şehri ve Zenginliği", iddia: "Truva adında devasa surlara sahip, Asya ile Avrupa arasında kilit bir ticaret şehri gerçekten vardı.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> Alman arkeolog Heinrich Schliemann'ın Çanakkale Hisarlık tepesinde yaptığı kazılar, Truva'nın var olduğunu ve defalarca yıkılıp yeniden yapıldığını kanıtlamıştır." },
                { baslik: "Aşil'in (Achilles) Truva Atına Binişi", iddia: "Savaş, içine Aşil'in de saklandığı devasa bir tahta at hilesiyle kazanılmıştır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU (MİTOLOJİ):</b> Truva savaşı gerçektir ancak 'Tahta At' muhtemelen bir metafordur (Depremi simgeleyen Poseidon'un atı veya bir kuşatma koçbaşı). Filmin aksine Homeros'un İlyada destanında Truva Atı geçmez bile!" }
            ]
        },
        "warhorse": {
            aciklama: "I. Dünya Savaşı'nın acımasız siperlerine satılan Joey adlı bir atın ve sahibinin hikayesi.",
            sahneler: [
                { baslik: "Milyonlarca Atın Kullanımı", iddia: "I. Dünya Savaşı'nda makineli tüfeklere ve tanklara rağmen milyonlarca at cepheye sürülmüş ve telef olmuştur.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> I. Dünya Savaşı'nda lojistik, top çekimi ve süvari hücumları için yaklaşık 8 milyon at kullanılmış ve büyük bir kısmı ölmüştür. Film bu acı trajediyi çok doğru yansıtır." },
                { baslik: "Siperler Arası Mucizevi Buluşma", iddia: "Joey'in tarafsız bölgedeki (No Man's Land) tellere takılması ve sahibinin onu gaz saldırısı sonrası bulması olayların standart akışıdır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Atların tellere takıldığı doğrudur ancak filmin sonundaki bu inanılmaz tesadüfler zinciri, savaşın acımasızlığını yumuşatmak için yazılmış melodramatik bir kurgudur." }
            ]
        },
        "bati_cephesi": {
            aciklama: "I. Dünya Savaşı'nda Alman ordusuna gönüllü katılan genç lise öğrencilerinin siperlerdeki psikolojik çöküşü.",
            sahneler: [
                { baslik: "Ateşkese Saniyeler Kala Taarruz", iddia: "11 Kasım 1918 sabahı, ateşkesin yürürlüğe girmesine 15 dakika kala Alman komutanlar askerleri tekrar ölüme göndermiştir.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Bu sahne 2022 yapımı filme özel bir dramatizasyondur. Kitapta veya 1930 filminde böyle bir sahne yoktur. Paul, ateşkesten aylar önce sıradan, sakin bir günde vurulur." },
                { baslik: "Askerlerin Psikolojik Yıkımı", iddia: "Savaşın başındaki milliyetçi heyecanın, çamurlu siperlerde ve tanklar karşısında büyük bir travmaya (Shell Shock) dönüşmesi.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> Yazar Erich Maria Remarque'ın bizzat yaşadıklarına dayanan bu eser, 'Kayıp Kuşak' denilen I. Dünya Savaşı gençliğinin gerçek travmasını yansıtır." }
            ]
        },
        "1917": {
            aciklama: "I. Dünya Savaşı'nda iki İngiliz askerinin, iletişim hatları kesik olan bir tabura çekilme emrini iletme çabası.",
            sahneler: [
                { baslik: "Kesintisiz Tek Plan Çekim", iddia: "Film, baştan sona hiç ara verilmeden tek bir kamera çekimiyle (One-shot) kaydedilmiştir.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Film tek bir çekim gibi görünse de aslında birçok gizli kurgu noktası içerir. Yönetmen Sam Mendes, seyirciyi karakterin yanından hiç ayırmamak için bu harika teknik illüzyonu kullanmıştır." },
                { baslik: "Tarafsız Bölge ve Alman Siperleri", iddia: "İngiliz askerlerinin geçtiği insansız bölge (No Man's Land), devasa kraterler ve terk edilmiş beton Alman siperleri gerçektir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> Filmin görsel tasarımı ve 'Almanların taktiksel olarak Hindenburg Hattı'na çekilmesi' olayı tamamen tarihi kayıtlara ve 1917 stratejilerine dayanır." }
            ]
        },
        "hidden_figures": {
            aciklama: "1960'larda ABD Uzay Yarışında (NASA), matematiksel dehalarıyla tarih yazan siyahi kadınların hikayesi.",
            sahneler: [
                { baslik: "Orbit (Yörünge) Hesaplamaları", iddia: "Astronot John Glenn, uzaya çıkmadan önce IBM bilgisayarlarına güvenmeyip hesaplamaları bizzat Katherine Johnson'ın yapmasını istemiştir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> Bu efsanevi olay kesinlikle doğrudur. Glenn, 'O kız (Katherine) rakamları kontrol etsin, o tamamsa ben uçmaya hazırım' demiştir." },
                { baslik: "Tuvalet Tabelasının Kırılması", iddia: "NASA müdürü Al Harrison (Kevin Costner), eline bir levye alıp 'NASA'da herkesin çişi aynı renktir' diyerek ayrımcı tuvalet tabelasını kırmıştır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Bu sahne Hollywood'un duygusal etki yaratmak için uydurduğu (White Savior tropeu) kurgusal bir andır. Gerçek hayatta Katherine Johnson ayrımcı tabelaları zaten gizlice görmezden geliyordu." }
            ]
        },
        "turtles": {
            aciklama: "ABD'nin Irak'ı işgali arifesinde, Türkiye-Irak sınırındaki mülteci kampında mayın toplayarak hayatta kalan yetim çocukların öyküsü.",
            sahneler: [
                { baslik: "Mayın Toplayan Çocuklar", iddia: "Bölgedeki çocuklar, Amerikan silah tüccarlarına satmak için elleriyle patlamamış kara mayınlarını sökmektedir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> Yönetmen Bahman Ghobadi, filmdeki çocukların çoğunu bölgeden seçmiştir ve maalesef savaş sonrası Irak-Türkiye-Suriye sınırlarında bu trajediler aynen yaşanmıştır." },
                { baslik: "Agrin'in Trajedisi", iddia: "Filmdeki ana karakterlerin yaşadığı sarsıcı son, belgesel niteliğinde birebir yaşanmış tek bir olayın kaydıdır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Filmin arka planı (Halepçe katliamı etkileri, mayınlar, Saddam'ın düşüşü) tamamen gerçek olsa da, Agrin ve Soran karakterlerinin dramatik hikayesi yönetmenin yazdığı edebi bir kurgudur." }
            ]
        },
        "sherlock": {
            aciklama: "Sanayi Devrimi sonrası Londra'da, Avrupa'yı I. Dünya Savaşına sürüklemeye çalışan Profesör Moriarty ile Sherlock'un zeka savaşı.",
            sahneler: [
                { baslik: "Sherlock Holmes'un Yaşamı", iddia: "Dünyanın en büyük dedektifi olan Sherlock Holmes, 19. yüzyıl sonlarında Londra'da gerçekten yaşamış bir şahıstır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Sherlock Holmes, yazar Sir Arthur Conan Doyle tarafından yaratılmış kurgusal bir romandır. O kadar inandırıcıdır ki hala 221B Baker Street'e mektuplar gelir." },
                { baslik: "Silahlanma Yarışı ve Silah Fabrikaları", iddia: "Filmde gösterilen devasa mühimmat fabrikaları, yeni toplar ve Avrupa devletleri arasındaki gergin silahlanma yarışı dönemin gerçeğidir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> 19. Yüzyılın sonu, Sanayi İnkılabının ölümcül silahlar ürettiği ve büyük devletlerin sömürgeler için I. Dünya Savaşı'na hazırlandığı gerçek bir 'Silahlı Barış' (Armed Peace) dönemidir." }
            ]
        },
        "kinglear": {
            aciklama: "Yaşlanan bir kralın, krallığını üç kızı arasında bölüştürme kararı almasıyla başlayan ihanet ve delilik trajedisi.",
            sahneler: [
                { baslik: "Antik Britanya Krallığı", iddia: "Kral Lear (Leir), Britanya'nın antik çağlarında yaşamış, ülkesini kızları arasında paylaştırmış gerçek bir tarihi figürdür.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK KURGU:</b> Lear, mitolojik/efsanevi bir figürdür (Leir of Britain). Shakespeare, bu eski efsaneyi alıp kendi edebi dehasıyla kurgulayarak tarihin en büyük tiyatro metinlerinden birini yaratmıştır." },
                { baslik: "Mutlak Monarşinin Çöküşü", iddia: "Kralın gücünü (topraklarını) devrettikten sonra otoritesini ve itibarını anında kaybetmesi, Orta Çağ feodal düzeninin temel bir gerçeğidir.", cevap: "gercek", gercek: "<b>TARİHİ/SOSYOLOJİK GERÇEKLİK:</b> Eser kurgu olsa da, feodal sistemde 'Toprak = Güç' denklemi kesin bir gerçektir. Toprağını ve ordusunu kaybeden bir kral, sadece unvanla ayakta kalamaz." }
            ]
        },
        "nisan1915": {
            aciklama: "Osmanlı'nın son döneminde yaşanan Tehcir (Zorunlu Göç) olaylarını ve iki toplum arasındaki acı kırılmaları anlatan bir tiyatro eseri.",
            sahneler: [
                { baslik: "1915 Tehcir Kanunu (Sevk ve İskân)", iddia: "I. Dünya Savaşı sırasında Kafkas Cephesindeki güvenlik nedeniyle Osmanlı Devleti Ermeni vatandaşlarını Suriye bölgesine göç ettirmiştir.", cevap: "gercek", gercek: "<b>TARİHİ GERÇEKLİK:</b> 1915 Sevk ve İskân Kanunu tarihi bir gerçektir. Savaşın getirdiği lojistik yetersizlikler, çetecilik faaliyetleri ve salgın hastalıklar nedeniyle yollarda büyük trajediler yaşanmıştır." },
                { baslik: "Karakterlerin Birebir Yaşamı", iddia: "Tiyatro sahnesinde izlenen belirli ailelerin ve karakterlerin diyalogları tarihi arşivlerden birebir alınmıştır.", cevap: "kurgu", gercek: "<b>SİNEMATOGRAFİK/TEATRAL KURGU:</b> Olayların tarihi arka planı gerçek olsa da, sahnede izlenen karakterler, o dönemin sosyolojik yapısını ve acılarını yansıtmak için yazar tarafından yaratılmış dramatik arketiplerdir." }
            ]
        }
    };

    let aktifFilm = "gladiator";
    let aktifSahneIdx = 0;

    function arayuzCiz() {
        const film = filmVerileri[aktifFilm];
        const sahne = film.sahneler[aktifSahneIdx];
        const comboSelect = document.getElementById('filmSecici').outerHTML; // Seçiciyi hafızada tut

        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; padding: 15px; background: var(--container-bg); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; overflow-y:auto;">
                <div style="max-width: 650px; width: 100%; background: var(--option-bg); border-radius: 12px; border: 3px solid #f39c12; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <span style="background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ANALİZ MODÜLÜ</span>
                        <h2 style="margin: 10px 0; color: var(--text-color); font-size: 20px;">${document.getElementById('filmSecici').options[document.getElementById('filmSecici').selectedIndex].text}</h2>
                        <p style="font-size: 13px; opacity: 0.8; font-style: italic; color: var(--text-color);">${film.aciklama}</p>
                    </div>

                    <div id="sahneKarti" style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px; border-left: 5px solid #f39c12; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 8px 0; color: #f39c12;">Sahne ${aktifSahneIdx + 1}/2: ${sahne.baslik}</h4>
                        <p style="margin: 0; font-size: 15px; color: var(--text-color); line-height: 1.5;">${sahne.iddia}</p>
                    </div>

                    <div id="kararButonlari" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="window.RADAR_KONTROL('gercek')" style="flex: 1; min-width:150px; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 14px;"><i class="fa-solid fa-landmark"></i> TARİHİ GERÇEKLİK</button>
                        <button onclick="window.RADAR_KONTROL('kurgu')" style="flex: 1; min-width:150px; background: #2980b9; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 14px;"><i class="fa-solid fa-clapperboard"></i> SİNEMATOGRAFİK KURGU</button>
                    </div>

                    <div id="sonucAlani" style="display: none; margin-top: 20px; padding: 15px; border-radius: 8px; animation: fadeIn 0.5s;">
                        <p id="sonucMetni" style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: white;"></p>
                        <button id="btnSonraki" style="background: rgba(255,255,255,0.3); color: white; border: 1px solid white; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Sonraki Sahne <i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    window.RADAR_KONTROL = function(secim) {
        const sahne = filmVerileri[aktifFilm].sahneler[aktifSahneIdx];
        const sonucAlani = document.getElementById('sonucAlani');
        const sonucMetni = document.getElementById('sonucMetni');
        const btnSonraki = document.getElementById('btnSonraki');

        sonucAlani.style.display = "block";
        document.getElementById('kararButonlari').style.display = "none";

        if (secim === sahne.cevap) {
            sonucAlani.style.background = "#27ae60";
            sonucMetni.innerHTML = `<i class="fa-solid fa-circle-check"></i> <b>DOĞRU ANALİZ!</b><br><br>${sahne.gercek}`;
        } else {
            sonucAlani.style.background = "#c0392b";
            sonucMetni.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <b>YANLIŞ ANALİZ!</b> Yönetmenin tuzağına düştünüz.<br><br>${sahne.gercek}`;
        }

        btnSonraki.onclick = function() {
            aktifSahneIdx++;
            if (aktifSahneIdx >= filmVerileri[aktifFilm].sahneler.length) {
                aktifSahneIdx = 0;
                alert("Bu film için analizi tamamladınız! Modülü kapatabilir veya menüden başka bir film seçebilirsiniz.");
            }
            arayuzCiz();
        };
    };

    // Dinamik dropdown değişikliğini yakala
    document.getElementById('mapControlsContainer').addEventListener('change', function(e) {
        if(e.target.id === 'filmSecici') {
            aktifFilm = e.target.value;
            aktifSahneIdx = 0;
            arayuzCiz();
        }
    });

    arayuzCiz();
};
// 14. ARAÇ: TARİHİ EMPATİ SİMÜLATÖRÜ (KARAR AĞACI / 6 SENARYOLU SÜRÜM)
window.HARITA_MOTORU["tarihi_empati"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #8e44ad; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-chess-knight"></i> Tarihsel Empati Simülatörü</h4>
            <div style="display: flex; justify-content: center; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                <select id="senaryoSecici" style="padding: 6px; border-radius: 5px; border: 2px solid #8e44ad; background: var(--container-bg); color: var(--text-color); font-weight: bold; font-size: 14px; max-width: 100%;">
                    <option value="kades">MÖ 1274 - Hitit Kralı Muvatalli (Kadeş Savaşı)</option>
                    <option value="metehan">MÖ 209 - Mete Han (Vatan Toprağı)</option>
                    <option value="iskender">MÖ 333 - Büyük İskender (Kör Düğüm)</option>
                    <option value="attila">MS 452 - Attila (Tanrının Kırbacı)</option>
                    <option value="bumin">MS 552 - Bumin Kağan (Bağımsızlık Ateşi)</option>
                    <option value="tarik">MS 711 - Tarık Bin Ziyad (Geri Dönüş Yok)</option>
                </select>
            </div>
            <div style="font-size: 11px; opacity: 0.8; margin-top: 8px; color: var(--text-color);">Geçmişi bugünün aklıyla değil, o dönemin şartlarıyla değerlendirin. Karar sizin!</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    const senaryolar = {
        // 1. KADEŞ SAVAŞI
        "kades": {
            baslik: "Kadeş'in Kaderi", karakter: "Hitit Kralı Muvatalli", kimlik: "Anadolu'nun en büyük askeri gücünün başındasın.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "Mısır Firavunu II. Ramses büyük bir orduyla Kadeş şehrine doğru ilerliyor. Casusların yakaladığı iki Bedevi, Ramses'in ordusunun hala çok uzakta, Halep'te olduğunu söylüyor. Ordun savaşa hazır ancak yorgun. Ne emredersin?",
                    ikon: "fa-campground",
                    secenekler: [
                        { metin: "Bedevilere inan ve hemen zayıf görünen öncü Mısır birliklerine saldır.", hedef: "dugum2_yanlis" },
                        { metin: "Bedevilerin Ramses'in casusu olabileceğinden şüphelen. Ordunu Kadeş kalesinin arkasına gizle.", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Bedeviler aslında Ramses'in casuslarıydı. Aceleyle saldırdığın için Ramses'in asıl ordusu seni pusuya düşürdü ve Hitit ordusu ağır kayıplar verdi.", sonuc: "basarisiz",
                    geriBildirim: "Anakronizm ve Strateji: Antik çağlarda uydu görüntüleri yoktu, istihbarat yanıltıcı olabilirdi. Gerçekte Muvatalli bu tuzağa düşmemiş ve Mısır ordusunu pusuya düşürmüştür."
                },
                "dugum2_dogru": {
                    metin: "Doğru Karar! Bedevilerin yalan söylediğini anladın ve ordunu Kadeş kalesinin arkasına başarıyla gizledin. Ramses, ordusunun büyük kısmından koparak senin pusuna düştü. Savaş arabalarınla Mısır ordusuna ağır bir darbe vurdun. Ancak savaş kilitlendi. Ne yapacaksın?",
                    ikon: "fa-shield-halved",
                    secenekler: [
                        { metin: "Ramses ölene kadar saldırıya devam et. Geri çekilmek yok!", hedef: "dugum3_yanlis" },
                        { metin: "Savaşın uzaması iki tarafı da tüketecek. Ateşkes teklif et.", hedef: "dugum3_dogru" }
                    ]
                },
                "dugum3_yanlis": {
                    metin: "Tarihi Hata! Savaş uzadıkça Mısır'ın yedek birlikleri yetişti. Hitit ordusu yıprandı ve kesin bir zafer kazanamadın. İki devlet de ağır yıkım yaşadı.", sonuc: "basarisiz",
                    geriBildirim: "Tarihi Empati: O dönemin şartlarında uzun süren meydan savaşları devletlerin ekonomisini tamamen çökertirdi. Mutlak yok etme stratejisi yerine diplomatik kazanç elde etmek daha akılcıydı."
                },
                "dugum3_dogru": {
                    metin: "Muhteşem Tarihi Empati! Her iki ordunun da yenişemeyeceğini ve bölgede yükselen Asur tehlikesini öngördün. Ramses ile savaşı durdurdun.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: Muvatalli barış yolunu seçti. Tarihin bilinen ilk yazılı antlaşması olan 'Kadeş Barış Antlaşması' imzalandı. Bu diplomatik zeka Anadolu'ya uzun bir barış getirdi."
                }
            }
        },
        // 2. METE HAN
        "metehan": {
            baslik: "Vatan Toprağı", karakter: "Asya Hun Hükümdarı Mete Han", kimlik: "Bozkırın yeni ve genç liderisin. Devletin sınırları tehdit altında.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "Tahta yeni geçtin. Doğudaki güçlü komşun Tunguzlar (Donghular) güçlenmeni istemiyor. Senden en sevdiğin atını istediler. Kurultay (Meclis) 'Bu bir hakarettir, savaşalım!' diyor. Ne karar vereceksin?",
                    ikon: "fa-horse-head",
                    secenekler: [
                        { metin: "Kurultayı dinle ve onurunu korumak için hemen savaş ilan et.", hedef: "dugum2_yanlis" },
                        { metin: "Ordun henüz tam hazır değil. Zaman kazanmak için atı ver.", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Ordun tam olarak teşkilatlanmamıştı (Onlu Sistem henüz oturmamıştı). Güçlü Tunguz ordusu karşısında yenilgiye uğradın ve devletin dağıldı.", sonuc: "basarisiz",
                    geriBildirim: "Tarihi Empati: Devlet adamlığı, kişisel duygularla değil, devletin bekası için rasyonel düşünmeyi gerektirir. Mete Han ordusunu hazırlamak için zaman kazanmayı seçmişti."
                },
                "dugum2_dogru": {
                    metin: "Doğru Karar! Zaman kazandın ve ordunu 'Onlu Sistem' ile eğitmeye devam ettin. Ancak Tunguzlar küstahlaştı. Şimdi de sınırda, tarıma elverişsiz çorak bir toprak parçasını istiyorlar. Kurultay 'Çorak toprak için savaşmaya değmez, verelim gitsin' diyor. Ne yapacaksın?",
                    ikon: "fa-mountain-sun",
                    secenekler: [
                        { metin: "Kurultayı dinle ve gereksiz bir toprak için savaşma, toprağı ver.", hedef: "dugum3_yanlis" },
                        { metin: "Toprak devletindir, verilmez! Savaş ilan et.", hedef: "dugum3_dogru" }
                    ]
                },
                "dugum3_yanlis": {
                    metin: "Tarihi Hata! Toprak tavizi verdiğin için boyların sana olan güveni sarsıldı. Bağımsızlık sembolünü kaybettin ve devlet zayıfladı.", sonuc: "basarisiz",
                    geriBildirim: "Vatan Bilinci: Tarihte toprak sadece ekonomik bir kaynak değil, egemenliğin ve bağımsızlığın sembolüdür. Toprak tavizi, devletin otoritesini yıkar."
                },
                "dugum3_dogru": {
                    metin: "Muhteşem Tarihi Empati! 'Toprak devletin temelidir, hiç kimseye verilmez!' diyerek ordunla ani bir baskın yaptın ve Tunguzları ağır bir yenilgiye uğrattın.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: Mete Han'ın bu tutumu, Türk tarihinde 'Vatan Sevgisi' ve 'Toprak Bütünlüğü' kavramlarının bilinen ilk ve en net örneğidir."
                }
            }
        },
        // 3. BÜYÜK İSKENDER
        "iskender": {
            baslik: "Kör Düğüm", karakter: "Makedon Kralı Büyük İskender", kimlik: "Gözünü tüm Asya'yı fethetmeye dikmiş genç, zeki ve hırslı bir komutansın.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "Pers İmparatorluğu'na karşı sefere çıktın. Frigya'nın başkenti Gordion'dasın. Tapınakta çözülemeyen antik bir düğüm var. Kehanete göre bu düğümü çözen kişi Asya'nın hakimi olacak. Tüm askerlerin ve komutanların seni izliyor. Düğümün uçları bile görünmüyor. Ne yapacaksın?",
                    ikon: "fa-ring",
                    secenekler: [
                        { metin: "Günlerce uğraşarak düğümü çözmenin mantıklı ve sabırlı yolunu ara.", hedef: "dugum2_yanlis" },
                        { metin: "Kılıcını çek ve düğümü tek hamlede ortadan ikiye kes!", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Düğümü çözmeyi başaramadın. Günlerce uğraşman ordunun sana olan ilahi inancını sarstı ve kehaneti gerçekleştiremediğin için prestij kaybettin.", sonuc: "basarisiz",
                    geriBildirim: "Liderlik Psikolojisi: Büyük askeri dehalar, kuralların dışına çıkabilen insanlardır. Takılıp kalmak bir imparator için zayıflık belirtisiydi."
                },
                "dugum2_dogru": {
                    metin: "Muhteşem Tarihi Empati! Kılıcını çekip düğümü kestin! 'Nasıl çözüldüğünün bir önemi yok!' diyerek orduna yenilmez olduğunu kanıtladın.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: İskender, Gordion düğümünü kılıcıyla keserek kuralları kendi yazan bir lider olduğunu göstermiş, askerlerinin maneviyatını zirveye taşıyarak Asya'nın derinliklerine (Hindistan'a kadar) ilerlemiştir."
                }
            }
        },
        // 4. ATTİLA
        "attila": {
            baslik: "Tanrının Kırbacı", karakter: "Avrupa Hun Hükümdarı Attila", kimlik: "Avrupa'yı titreten, en güçlü askeri dehanın sahibisin.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "Batı Roma İmparatorluğu'nu dize getirdin, ordunla İtalya'ya girdin ve Roma'nın kapılarına dayandın. Roma halkı dehşet içinde. Papa I. Leo büyük bir heyetle ve ganimetle huzuruna gelerek Roma'yı bağışlaman için yalvarıyor. Kurultaydaki bazı komutanların 'Roma'yı yakıp yıkalım' diyor. Ne yapacaksın?",
                    ikon: "fa-gavel",
                    secenekler: [
                        { metin: "Orduma kimse dur diyemez! Papa'yı reddet ve Roma'yı yağmala.", hedef: "dugum2_yanlis" },
                        { metin: "Papa'nın yüklü haraç teklifini kabul et, Roma'yı bağışla ve geri dön.", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Roma'yı yağmaladın ancak ordun İtalya'da baş gösteren veba salgınına yakalandı. Üstelik sen İtalya'dayken Doğu Roma (Bizans) arkadan başkentine saldırdı.", sonuc: "basarisiz",
                    geriBildirim: "Çok Cepheli Savaş: Bir lider ordu lojistiğini ve hastalıkları hesaba katmalıdır. Attila o dönem ordusundaki yorgunluğu ve doğudan gelen tehlikeyi biliyordu."
                },
                "dugum2_dogru": {
                    metin: "Muhteşem Tarihi Empati! Papa'nın ricasını (ve ağır vergiyi) kabul ettin. Roma'yı yağmalamadın ancak psikolojik olarak tüm Avrupa'nın senin önünde diz çökmesini sağladın.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: Attila ordusundaki salgın hastalıkları, yorgunluğu ve arkadan gelebilecek Marcianus (Bizans) saldırısını öngördü. Roma'yı haraca bağlayarak savaşmadan en büyük zaferi kazandı."
                }
            }
        },
        // 5. BUMİN KAĞAN
        "bumin": {
            baslik: "Bağımsızlık Ateşi", karakter: "Bumin Kağan", kimlik: "Avar Hakanlığı'na bağlı, demircilikle uğraşan Türk boylarının liderisin.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "Avar Hakanı, kendisine karşı isyan eden Tölesleri bastırmanı istedi. Başarıyla bastırdın. Ödül olarak Hakan'ın kızıyla evlenmek istedin. Ancak Hakan sana 'Sen benim sıradan bir demirci kölemsin, buna nasıl cüret edersin!' diyerek hakaret etti. Ne yapacaksın?",
                    ikon: "fa-hammer",
                    secenekler: [
                        { metin: "Avarlara karşı tek başına isyan etmek intihardır. Sessiz kal ve güçlenmeyi bekle.", hedef: "dugum2_yanlis" },
                        { metin: "Bu hakaret kabul edilemez. Çin'deki Batı Wei devletiyle ittifak kur ve isyan bayrağını çek.", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Sessiz kalarak boyların gözündeki itibarını kaybettin. Avarlar senin fazla güçlendiğini fark edip Türk boylarını dağıttı.", sonuc: "basarisiz",
                    geriBildirim: "Tarihi Empati: Bozkır kültüründe 'Kut' (yönetme yetkisi) cesaret ve başarıyla kanıtlanır. Liderlik fırsatını ve onurunu koruyamayanlar silinir."
                },
                "dugum2_dogru": {
                    metin: "Doğru Karar! Diplomatik zekanı kullanıp Batı Wei prensesiyle evlendin. Çin'in desteğini arkana alarak Avarlara saldırdın ve onları Orta Asya'dan sürdün. Yeni kurduğun bu devlete ne ad vereceksin?",
                    ikon: "fa-flag",
                    secenekler: [
                        { metin: "Bumin Kağanlığı", hedef: "dugum3_yanlis" },
                        { metin: "Göktürk Devleti", hedef: "dugum3_dogru" }
                    ]
                },
                "dugum3_yanlis": {
                    metin: "Tarihi Hata! Sadece kendi adınla anılan bir devlet kurmak, Türk boylarının aidiyetini tam olarak sağlayamazdı.", sonuc: "basarisiz",
                    geriBildirim: "Milli Kimlik: Bumin Kağan, tarihte ilk defa 'Türk' adını siyasi bir devlet adı olarak kullanarak tüm boyları tek bir milli kimlik altında toplamıştır."
                },
                "dugum3_dogru": {
                    metin: "Muhteşem Tarihi Empati! Tarihte ilk kez 'Türk' adını devlet adı olarak kullandın ve 'İl Kağan' unvanını aldın.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: 552'de kurulan Göktürk Devleti, Orta Asya'daki dağınık Türk boylarını birleştirmiş ve İpek Yolu'na hükmeden devasa bir imparatorluğa dönüşmüştür."
                }
            }
        },
        // 6. TARIK BİN ZİYAD
        "tarik": {
            baslik: "Geri Dönüş Yok", karakter: "İslam Komutanı Tarık Bin Ziyad", kimlik: "Kuzey Afrika'dan İspanya'yı fethe giden Emevi komutanısın.", baslangic: "dugum1",
            dugumler: {
                "dugum1": {
                    metin: "7000 kişilik ordunla Cebelitarık Boğazı'nı geçip İspanya'ya (Endülüs) ayak bastın. Karşıda Vizigot Kralı Rodrigo'nun yaklaşık 100.000 kişilik devasa ordusu var. Askerlerin sayıca az oldukları için korku içinde, gemilere binip geri dönmek istiyorlar. Ne emredeceksin?",
                    ikon: "fa-ship",
                    secenekler: [
                        { metin: "Askerler haklı, bu bir intihar. Disiplinli bir şekilde gemilere binip Kuzey Afrika'ya geri dönelim.", hedef: "dugum2_yanlis" },
                        { metin: "Bütün gemileri yakın! Arkamız deniz, önümüz düşman. Ya zafer ya şehadet!", hedef: "dugum2_dogru" }
                    ]
                },
                "dugum2_yanlis": {
                    metin: "Tarihi Hata! Geri çekilme sırasında ordu paniğe kapıldı, Vizigot süvarileri sahil şeridinde ordunu yok etti. İspanya'nın fethi yüzlerce yıl gecikti.", sonuc: "basarisiz",
                    geriBildirim: "Askeri Psikoloji: Sayıca az bir orduda 'kaçış' fikri bir kez kök salarsa disiplin biter. Komutan, askerlerine kazanmaktan başka bir çare bırakmamalıdır."
                },
                "dugum2_dogru": {
                    metin: "Muhteşem Tarihi Empati! Gemileri ateşe verdin. Askerlerine dönerek: 'Arkanızda düşman gibi deniz, önünüzde deniz gibi düşman var!' diyerek onları savaşa motive ettin.", sonuc: "basarili",
                    geriBildirim: "Gerçek Tarih: Tarık bin Ziyad'ın bu tarihi hamlesi askerlerdeki tüm korkuyu sildi. 711 yılındaki Kadiks (Guadalete) Savaşı'nda devasa Vizigot ordusunu yok ederek, 800 yıl sürecek Endülüs İslam medeniyetinin temellerini attı. Türkçedeki 'Gemileri yakmak' deyimi buradan gelir."
                }
            }
        }
    };

    let aktifSenaryoId = "kades";
    let aktifDugumId = "dugum1";

    function arayuzCiz() {
        const senaryo = senaryolar[aktifSenaryoId];
        const dugum = senaryo.dugumler[aktifDugumId];
        
        let icerikHTML = "";

        if (dugum.sonuc) {
            const sonucRengi = dugum.sonuc === "basarili" ? "#27ae60" : "#c0392b";
            const sonucIkonu = dugum.sonuc === "basarili" ? "fa-crown" : "fa-skull-crossbones";
            
            icerikHTML = `
                <div style="background: ${sonucRengi}; color: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                    <i class="fa-solid ${sonucIkonu}" style="font-size: 40px; margin-bottom: 15px;"></i>
                    <h3 style="margin: 0 0 15px 0; font-size: 20px;">${dugum.metin}</h3>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; font-size: 15px; line-height: 1.5; text-align: left;">
                        ${dugum.geriBildirim}
                    </div>
                </div>
                <button onclick="window.EMPATI_BASA_SAR()" style="background: var(--option-bg); color: var(--text-color); border: 2px solid ${sonucRengi}; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 15px; transition: 0.3s;">
                    <i class="fa-solid fa-rotate-left"></i> Senaryoyu Başa Sar
                </button>
            `;
        } else {
            icerikHTML = `
                <div style="background: rgba(0,0,0,0.05); border-left: 5px solid #8e44ad; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: left;">
                    <div style="text-align: center; margin-bottom: 15px; color: #8e44ad; font-size: 30px;">
                        <i class="fa-solid ${dugum.ikon}"></i>
                    </div>
                    <p style="margin: 0; font-size: 16px; color: var(--text-color); line-height: 1.6;">${dugum.metin}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${dugum.secenekler.map((secenek) => `
                        <button onclick="window.EMPATI_KARAR('${secenek.hedef}')" style="background: var(--option-bg); color: var(--text-color); border: 2px solid #8e44ad; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; transition: 0.3s; text-align: left;">
                            <i class="fa-solid fa-arrow-right-long" style="color: #8e44ad; margin-right: 10px;"></i> ${secenek.metin}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; padding: 15px; background: var(--container-bg); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; overflow-y:auto;">
                <div style="max-width: 650px; width: 100%; background: var(--option-bg); border-radius: 12px; border: 3px solid #8e44ad; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    
                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px dashed rgba(142, 68, 173, 0.3); padding-bottom: 15px;">
                        <h2 style="margin: 0 0 5px 0; color: #8e44ad; font-size: 22px;">${senaryo.baslik}</h2>
                        <div style="font-weight: bold; color: var(--text-color); font-size: 15px; margin-bottom: 5px;">
                            <i class="fa-solid fa-user-tie"></i> Rolün: <span style="color: #e67e22;">${senaryo.karakter}</span>
                        </div>
                        <div style="font-size: 13px; opacity: 0.7; color: var(--text-color);">${senaryo.kimlik}</div>
                    </div>

                    ${icerikHTML}
                    
                    <div style="font-size: 10px; color: var(--text-color); opacity: 0.5; margin-top: 25px; text-align: center;">
                        Simülasyon: Murat Mutlu
                    </div>
                </div>
            </div>
        `;
    }

    window.EMPATI_KARAR = function(hedefDugumId) {
        aktifDugumId = hedefDugumId;
        arayuzCiz();
    };

    window.EMPATI_BASA_SAR = function() {
        aktifDugumId = senaryolar[aktifSenaryoId].baslangic;
        arayuzCiz();
    };

    document.getElementById('mapControlsContainer').addEventListener('change', function(e) {
        if(e.target.id === 'senaryoSecici') {
            aktifSenaryoId = e.target.value;
            aktifDugumId = senaryolar[aktifSenaryoId].baslangic;
            arayuzCiz();
        }
    });

    arayuzCiz();
};
// 15. ARAÇ: KRONOLOJİ BULMACASI (ÇAYLAK'TAN ÜSTAT'A)
window.HARITA_MOTORU["kronoloji_bulmacasi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    // Üst Kontrol Paneli (Gizliyoruz çünkü oyun tam ekran olacak)
    controlsContainer.style.display = 'none';
    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    const seviyeler = [
        {
            baslik: "1. Seviye: İlk Çağ'ın Dönüm Noktaları",
            olaylar: [
                { id: "yazi", metin: "Sümerlerin Yazıyı İcat Etmesi", yil: -3200, yilMetni: "MÖ 3200" },
                { id: "kades", metin: "Kadeş Antlaşması", yil: -1280, yilMetni: "MÖ 1280" },
                { id: "para", metin: "Lidyalıların Parayı İcat Etmesi", yil: -700, yilMetni: "MÖ 7. Yüzyıl" },
                { id: "roma", metin: "Roma'nın İkiye Ayrılması", yil: 395, yilMetni: "MS 395" }
            ]
        },
        {
            baslik: "2. Seviye: Türk Tarihinin Kırılmaları",
            olaylar: [
                { id: "mete", metin: "Mete Han'ın Tahta Çıkışı", yil: -209, yilMetni: "MÖ 209" },
                { id: "kavimler", metin: "Kavimler Göçü", yil: 375, yilMetni: "MS 375" },
                { id: "gokturk", metin: "I. Göktürk Devleti'nin Kuruluşu", yil: 552, yilMetni: "MS 552" },
                { id: "uygur", metin: "Uygurların Yerleşik Hayata Geçişi", yil: 762, yilMetni: "MS 762" }
            ]
        },
        {
            baslik: "3. Seviye: İslam ve Orta Çağ",
            olaylar: [
                { id: "hicret", metin: "Hicret Olayı", yil: 622, yilMetni: "MS 622" },
                { id: "talas", metin: "Talas Savaşı", yil: 751, yilMetni: "MS 751" },
                { id: "malazgirt", metin: "Malazgirt Savaşı", yil: 1071, yilMetni: "MS 1071" },
                { id: "istanbul", metin: "İstanbul'un Fethi", yil: 1453, yilMetni: "MS 1453" }
            ]
        }
    ];

    let aktifSeviye = 0;
    let puan = 0;
    let seciliKart = null;
    let dogruSayisi = 0;

    function rutbeHesapla() {
        if (puan < 30) return { ad: "ÇAYLAK", renk: "#95a5a6", ikon: "fa-seedling" };
        if (puan < 70) return { ad: "KALFA", renk: "#3498db", ikon: "fa-hammer" };
        if (puan < 110) return { ad: "USTA", renk: "#e67e22", ikon: "fa-fire" };
        return { ad: "ÜSTAT", renk: "#f1c40f", ikon: "fa-crown" };
    }

    function diziyiKaristir(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    window.KART_SEC = function(id) {
        document.querySelectorAll('.krono-kart').forEach(k => k.style.border = "2px solid #ccc");
        const kart = document.getElementById("kart_" + id);
        if(kart) kart.style.border = "3px solid #f1c40f";
        seciliKart = id;
    };

    window.SLOT_TIKLA = function(hedefId) {
        if (!seciliKart) {
            alert("Önce yukarıdan bir olay kartı seçmelisin!");
            return;
        }

        const slot = document.getElementById("slot_" + hedefId);
        const kart = document.getElementById("kart_" + seciliKart);

        if (seciliKart === hedefId) {
            // DOĞRU EŞLEŞTİRME
            puan += 10;
            dogruSayisi++;
            
            // Kartı slota taşı ve kilitle
            slot.innerHTML = `<div style="background:#27ae60; color:white; padding:10px; border-radius:5px; font-weight:bold; height:100%; display:flex; align-items:center; justify-content:center; font-size:13px; text-align:center;"><i class="fa-solid fa-check" style="margin-right:5px;"></i> ${kart.innerText}</div>`;
            slot.style.border = "none";
            kart.style.display = "none";
            seciliKart = null;

            // Rütbeyi ve puanı güncelle
            arayuzGuncelle();

            // Seviye bitti mi kontrolü
            if (dogruSayisi === 4) {
                setTimeout(() => {
                    aktifSeviye++;
                    if (aktifSeviye < seviyeler.length) {
                        alert("Tebrikler! Seviye atladın. Puanın: " + puan);
                        seviyeYukle();
                    } else {
                        const sonRutbe = rutbeHesapla();
                        mapCanvas.innerHTML = `
                            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background:var(--container-bg); color:var(--text-color); text-align:center; padding:20px;">
                                <i class="fa-solid ${sonRutbe.ikon}" style="font-size:80px; color:${sonRutbe.renk}; margin-bottom:20px;"></i>
                                <h1 style="margin:0 0 10px 0;">OYUN BİTTİ!</h1>
                                <h2 style="margin:0; color:${sonRutbe.renk};">Nihai Rütben: ${sonRutbe.ad}</h2>
                                <h3 style="margin:10px 0;">Toplam Puan: ${puan}</h3>
                                <p style="opacity:0.8; margin-top:20px;">Tarihin akışına başarıyla yön verdin.</p>
                                <button onclick="window.HARITA_MOTORU['kronoloji_bulmacasi']()" style="margin-top:20px; padding:10px 20px; background:#3498db; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Tekrar Oyna</button>
                                
                                <div style="font-size: 12px; font-weight: bold; opacity: 0.6; margin-top: 35px;">
                                    <i class="fa-solid fa-gamepad"></i> Oyun: Murat Mutlu
                                </div>
                            </div>
                        `;
                    }
                }, 500);
            }
        } else {
            // YANLIŞ EŞLEŞTİRME
            puan = Math.max(0, puan - 5);
            slot.style.border = "3px solid #e74c3c";
            setTimeout(() => { slot.style.border = "3px dashed #7f8c8d"; }, 500);
            arayuzGuncelle();
        }
    };

    function arayuzGuncelle() {
        const rutbe = rutbeHesapla();
        document.getElementById('kronoPuan').innerText = puan;
        document.getElementById('kronoRutbe').innerHTML = `<i class="fa-solid ${rutbe.ikon}"></i> ${rutbe.ad}`;
        document.getElementById('kronoRutbe').style.color = rutbe.renk;
    }

    function seviyeYukle() {
        dogruSayisi = 0;
        seciliKart = null;
        const seviye = seviyeler[aktifSeviye];
        
        // Kartları karıştır
        const karisikOlaylar = diziyiKaristir([...seviye.olaylar]);

        // HTML İskeleti
        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--container-bg); box-sizing: border-box; overflow-y:auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                
                <div style="display:flex; justify-content:space-between; align-items:center; background: #2c3e50; color: white; padding: 15px 20px; flex-shrink: 0;">
                    <div>
                        <div style="font-size:12px; opacity:0.7;">Puan</div>
                        <div style="font-size:24px; font-weight:bold; color:#f1c40f;" id="kronoPuan">${puan}</div>
                    </div>
                    <div style="text-align:center;">
                        <h3 style="margin:0; font-size:16px;">KRONOLOJİ BULMACASI</h3>
                        <div style="font-size:12px; color:#bdc3c7;">${seviye.baslik}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px; opacity:0.7;">Rütbe</div>
                        <div style="font-size:18px; font-weight:bold;" id="kronoRutbe">Yükleniyor...</div>
                    </div>
                </div>

                <div style="flex: 1; padding: 15px; display: flex; flex-direction: column; max-width: 800px; margin: 0 auto; width: 100%;">
                    
                    <div style="margin-bottom: 20px;">
                        <div style="font-weight:bold; color:var(--text-color); margin-bottom:10px;"><i class="fa-solid fa-hand-pointer"></i> 1. Yerleştirmek İstediğin Olayı Seç:</div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            ${karisikOlaylar.map(o => `
                                <div id="kart_${o.id}" class="krono-kart" onclick="window.KART_SEC('${o.id}')" style="background:var(--option-bg); border:2px solid var(--card-border); padding:10px; border-radius:8px; font-size:13px; font-weight:bold; color:var(--text-color); cursor:pointer; transition:0.2s; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                                    ${o.metin}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="flex:1; background: rgba(0,0,0,0.03); border-radius: 12px; padding: 15px; border: 1px solid var(--card-border);">
                        <div style="font-weight:bold; color:var(--text-color); margin-bottom:15px;"><i class="fa-solid fa-bullseye"></i> 2. Boş Tarih Kutusuna Tıkla:</div>
                        
                        <div style="position:relative; padding-left:30px;">
                            <div style="position:absolute; left:15px; top:10px; bottom:10px; width:4px; background:#34495e; border-radius:2px;"></div>
                            
                            ${seviye.olaylar.map(o => `
                                <div style="position:relative; margin-bottom:20px; display:flex; align-items:center;">
                                    <div style="position:absolute; left:-24px; width:16px; height:16px; background:#f1c40f; border:3px solid #34495e; border-radius:50%; z-index:2;"></div>
                                    
                                    <div style="width: 90px; font-weight:900; color:#e74c3c; font-size:15px; text-shadow: 1px 1px 0px rgba(255,255,255,0.5);">
                                        ${o.yilMetni}
                                    </div>
                                    
                                    <div id="slot_${o.id}" onclick="window.SLOT_TIKLA('${o.id}')" style="flex:1; height:45px; background:rgba(255,255,255,0.5); border:3px dashed #7f8c8d; border-radius:8px; cursor:pointer; transition:0.3s;"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="font-size: 11px; font-weight: bold; color: var(--text-color); opacity: 0.5; margin-top: 25px; text-align: center; padding-bottom: 10px;">
                        <i class="fa-solid fa-gamepad"></i> Oyun: Murat Mutlu
                    </div>

                </div>
            </div>
        `;
        arayuzGuncelle();
    }

    seviyeYukle();
};
// 16. ARAÇ: TARİHİN DOMİNO TAŞLARI (NEDEN-SONUÇ SİMÜLATÖRÜ) - 6 SENARYO & DETAY PENCERELİ
window.HARITA_MOTORU["domino_etkisi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #e67e22; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-cubes-stacked"></i> Tarihin Domino Taşları</h4>
            <div style="display: flex; justify-content: center; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                <select id="zincirSecici" style="padding: 6px; border-radius: 5px; border: 2px solid #e67e22; background: var(--container-bg); color: var(--text-color); font-weight: bold; font-size: 14px; max-width: 100%;">
                    <option value="kavimler">1. Kavimler Göçü'nün Kelebek Etkisi</option>
                    <option value="hacli">2. Haçlı Seferleri ve Feodalitenin Çöküşü</option>
                    <option value="kesifler">3. Coğrafi Keşiflerden Sanayi İnkılabına</option>
                    <option value="fransiz">4. Fransız İhtilali ve Milliyetçilik</option>
                    <option value="sanayi">5. Sanayi İnkılabı ve Sömürgecilik</option>
                    <option value="savas">6. I. Dünya Savaşı'nın Patlak Vermesi</option>
                </select>
                <button id="btnDevir" style="background: #e67e22; color: white; border: none; padding: 7px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s;">
                    <i class="fa-solid fa-hand-point-right"></i> İlk Taşı Devir
                </button>
            </div>
            <div style="font-size: 11px; opacity: 0.8; margin-top: 8px; color: var(--text-color);">Tarihi olaylar birbirini tetikler. Olayın detayını okumak için taşlara tıklayın!</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // 6 ZENGİNLEŞTİRİLMİŞ SENARYO
    const zincirler = {
        "kavimler": {
            baslik: "Kavimler Göçü'nün Kelebek Etkisi", temaRengi: "#3498db",
            taslar: [
                { baslik: "Orta Asya'da Kuraklık", detay: "İklim değişiklikleri ve şiddetli kuraklık nedeniyle otlaklar azaldı, boylar arası mücadeleler arttı ve kıtlık baş gösterdi." },
                { baslik: "Türk Boylarının Göçü", detay: "Hayatta kalmak ve Çin baskısından kurtulmak isteyen Hunlar (Balamir önderliğinde) batıya, Karadeniz'in kuzeyine doğru büyük bir göç başlattı." },
                { baslik: "Barbar Kavimlerin İtilmesi", detay: "Hunların önünden kaçan Ostrogot, Vizigot ve Vandal gibi devasa kavimler domino etkisiyle Avrupa'ya, Roma sınırlarına yığıldı." },
                { baslik: "Roma'nın İkiye Ayrılması", detay: "Bu devasa göç dalgasına ve yağmalara dayanamayan Roma İmparatorluğu sarsıldı ve 395 yılında Doğu ve Batı olarak kesin bir şekilde ikiye bölündü." },
                { baslik: "Feodalitenin Doğuşu", detay: "Kralların halkı koruyamaması üzerine halk, can güvenliği için güçlü senyörlerin şatolarına sığındı. Avrupa'da Derebeylik (Feodalite) rejimi doğdu." }
            ]
        },
        "hacli": {
            baslik: "Haçlı Seferleri ve Feodalitenin Çöküşü", temaRengi: "#e74c3c",
            taslar: [
                { baslik: "Malazgirt Zaferi (1071)", detay: "Büyük Selçuklu Devleti, Bizans'ı yenerek Anadolu'nun kapılarını Türklere açtı. Türkler hızla Marmara kıyılarına kadar ulaştı." },
                { baslik: "Bizans'ın Yardım Çağrısı", detay: "Anadolu'yu kaybeden ve başkenti tehlikeye giren Bizans İmparatoru, gururunu hiçe sayarak Papa'dan acil askeri yardım istedi." },
                { baslik: "Haçlı Seferleri Başladı", detay: "Papa'nın dini kışkırtması ve Doğu'nun efsanevi zenginliklerine ulaşma hayaliyle yüz binlerce Avrupalı, Kudüs'ü alma bahanesiyle yola çıktı." },
                { baslik: "Derebeylerin Kayıpları", detay: "Sefere katılan şövalyelerin ve feodal senyörlerin büyük bir kısmı Doğu'daki savaşlarda öldü veya tüm ordularını kaybederek iflas etti." },
                { baslik: "Merkezi Krallıkların Güçlenmesi", detay: "Derebeylerin gücünü yitirmesiyle oluşan otorite boşluğunu Krallar doldurdu. Avrupa'da Feodalite zayıfladı, merkezi krallıklar güçlendi." }
            ]
        },
        "kesifler": {
            baslik: "Coğrafi Keşiflerden Sanayi İnkılabına", temaRengi: "#27ae60",
            taslar: [
                { baslik: "Ticaret Yollarının Fethi", detay: "İpek ve Baharat yollarının kontrolü (İstanbul'un ve Mısır'ın fethiyle) tamamen Osmanlı ve İslam devletlerinin eline geçti." },
                { baslik: "Yeni Yol Arayışları", detay: "Müslüman tüccarlara vergi ödemek istemeyen ve Doğu'ya ucuz yoldan ulaşmak isteyen Avrupalılar, pusulanın gelişimiyle okyanuslara açıldı." },
                { baslik: "Yeni Kıtaların Keşfi", detay: "Amerika kıtası ve Ümit Burnu keşfedildi. Akdeniz limanları (Venedik, Ceneviz) eski önemini yitirirken, Atlas Okyanusu limanları zenginleşti." },
                { baslik: "Sermaye Birikimi (Merkantilizm)", detay: "Yeni kıtalardaki tonlarca altın, gümüş ve hammadde Avrupa'ya taşındı. Avrupa olağanüstü bir zenginliğe ulaştı." },
                { baslik: "Sanayi İnkılabı", detay: "Keşiflerden elde edilen bu devasa sermaye birikimi ve bilimsel düşünce, devasa fabrikaların kurulmasını (Sanayi İnkılabı) tetikledi." }
            ]
        },
        "fransiz": {
            baslik: "Fransız İhtilali ve Milliyetçilik", temaRengi: "#9b59b6",
            taslar: [
                { baslik: "Aydınlanma Çağı Düşünürleri", detay: "Rousseau, Voltaire gibi düşünürler halka 'Eşitlik, Özgürlük ve Adalet' fikirlerini aşıladı. Kralların tanrısal gücü sorgulanmaya başlandı." },
                { baslik: "Ağır Vergiler ve Ekonomik Kriz", detay: "Fransız sarayının lüks harcamaları ve savaş masrafları nedeniyle halka ağır vergiler yüklendi, ekmek bile bulunamaz hale geldi." },
                { baslik: "Bastille Hapishanesi Baskını", detay: "Öfkelenen Paris halkı isyan etti ve 1789'da kraliyetin baskı sembolü olan Bastille hapishanesini basarak siyasi mahkumları serbest bıraktı." },
                { baslik: "Milliyetçilik Akımının Yayılması", detay: "İhtilal ile birlikte 'Her millete kendi bağımsız devleti' (Milliyetçilik) fikri, Napolyon savaşlarıyla tüm Avrupa'ya hızla yayıldı." },
                { baslik: "İmparatorlukların Parçalanması", detay: "Bu akım; Osmanlı, Avusturya-Macaristan ve Rusya gibi çok uluslu imparatorluklarda azınlık isyanlarını başlatarak bu devletleri parçaladı." }
            ]
        },
        "sanayi": {
            baslik: "Sanayi İnkılabı ve Sömürgecilik", temaRengi: "#f39c12",
            taslar: [
                { baslik: "Buhar Makinesinin İcadı", detay: "Kömürle ısıtılan suyun buhar gücüne dönüşmesi, insan ve hayvan gücünün yerini alarak dev bir teknolojik sıçrama yarattı." },
                { baslik: "Seri Üretime Geçiş", detay: "Küçük atölyelerin yerini binlerce işçinin çalıştığı dev fabrikalar aldı. Üretim hızlandı ve mallar ucuzladı." },
                { baslik: "Hammadde ve Pazar İhtiyacı", detay: "Fabrikaların durmaması için çok daha fazla pamuğa, demire ve kömüre; ayrıca üretilen fazla malları satacak yeni 'müşterilere' (pazarlara) ihtiyaç duyuldu." },
                { baslik: "Küresel Sömürgecilik (Emperyalizm)", detay: "Sanayileşen Avrupa devletleri, silah üstünlüklerini kullanarak Afrika ve Asya'yı işgal edip zenginliklerini sömürmeye başladılar." },
                { baslik: "I. Dünya Savaşı", detay: "İngiltere ve Fransa'nın sömürgelerine göz diken ve sanayileşmede geç kalan Almanya'nın agresif politikaları, dünyayı küresel bir savaşa sürükledi." }
            ]
        },
        "savas": {
            baslik: "I. Dünya Savaşı'nın Patlak Vermesi", temaRengi: "#34495e",
            taslar: [
                { baslik: "Avrupa'da Silahlanma ve Bloklaşma", detay: "Sömürgecilik yarışı ve milliyetçilik akımı, Avrupa'yı barut fıçısına çevirdi. Devletler İtilaf ve İttifak olarak iki kampa bölündü." },
                { baslik: "Saraybosna Suikasti", detay: "28 Haziran 1914'te Avusturya-Macaristan veliahdı Ferdinand, Saraybosna'yı ziyareti sırasında Sırp bir milliyetçi tarafından vurularak öldürüldü." },
                { baslik: "Avusturya'nın Sırbistan'a Savaş İlanı", detay: "Suikastten Sırbistan'ı sorumlu tutan Avusturya-Macaristan, Sırbistan'a savaş ilan etti." },
                { baslik: "Zincirleme İttifak Reaksiyonu", detay: "Sırbistan'ı korumak için Rusya; Rusya'ya karşı Almanya; Almanya'ya karşı ise Fransa ve İngiltere savaşa dahil oldu. Kıvılcım dünyayı sardı." },
                { baslik: "İmparatorlukların Yıkılışı", detay: "Milyonlarca insanın öldüğü savaşın sonunda; Osmanlı, Rus, Alman ve Avusturya-Macaristan imparatorlukları tarihe karıştı, yeni ulus devletler kuruldu." }
            ]
        }
    };

    let aktifZincir = "kavimler";
    let animasyonDevamEdiyor = false;
    let timerYakalayici = [];

    // Tıklanınca açılacak Modal (Detay Penceresi) Yapısı
    function modalGoster(baslik, detay, renk) {
        let modal = document.getElementById("dominoModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "dominoModal";
            modal.style.position = "absolute";
            modal.style.top = "0"; modal.style.left = "0"; modal.style.width = "100%"; modal.style.height = "100%";
            modal.style.backgroundColor = "rgba(0,0,0,0.7)";
            modal.style.zIndex = "999";
            modal.style.display = "flex"; modal.style.alignItems = "center"; modal.style.justifyContent = "center";
            modal.style.opacity = "0"; modal.style.transition = "opacity 0.3s ease";
            
            modal.innerHTML = `
                <div style="background: var(--option-bg); border-top: 6px solid #e74c3c; width: 85%; max-width: 450px; border-radius: 10px; padding: 25px; box-shadow: 0 15px 30px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform 0.3s ease; position: relative;">
                    <button onclick="document.getElementById('dominoModal').style.opacity='0'; setTimeout(()=>document.getElementById('dominoModal').style.display='none',300);" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 20px; color: var(--text-color); cursor: pointer; opacity: 0.7;">&times;</button>
                    <h3 id="modalBaslik" style="margin: 0 0 15px 0; color: #e74c3c; font-size: 18px; line-height: 1.3;"></h3>
                    <p id="modalDetay" style="margin: 0; color: var(--text-color); font-size: 15px; line-height: 1.6; opacity: 0.9;"></p>
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="document.getElementById('dominoModal').style.opacity='0'; setTimeout(()=>document.getElementById('dominoModal').style.display='none',300);" style="background: var(--card-border); color: var(--text-color); border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Anladım</button>
                    </div>
                </div>
            `;
            document.getElementById('mapCanvas').appendChild(modal);
        }

        document.getElementById("modalBaslik").innerText = baslik;
        document.getElementById("modalBaslik").style.color = renk;
        document.getElementById("modalDetay").innerHTML = detay;
        modal.firstElementChild.style.borderTopColor = renk;
        
        modal.style.display = "flex";
        setTimeout(() => {
            modal.style.opacity = "1";
            modal.firstElementChild.style.transform = "scale(1)";
        }, 10);
    }

    // Modal açma fonksiyonunu globale (window) ekleyelim ki tıklamalar çalışsın
    window.DOMINO_ACIKLAMA_GIZLI = function(baslik, detay, renk) {
        modalGoster(baslik, detay, renk);
    };

    function arayuzCiz() {
        const veri = zincirler[aktifZincir];
        const renk = veri.temaRengi;
        
        timerYakalayici.forEach(t => clearTimeout(t));
        timerYakalayici = [];
        animasyonDevamEdiyor = false;
        document.getElementById('btnDevir').disabled = false;
        document.getElementById('btnDevir').style.opacity = "1";

        let html = `
            <div style="width: 100%; height: 100%; padding: 20px; background: var(--container-bg); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; overflow-y:auto; font-family: 'Segoe UI', sans-serif; position: relative;">
                <div style="max-width: 600px; width: 100%;">
                    
                    <h2 style="text-align:center; color:${renk}; margin-bottom: 25px; font-size: 20px;">${veri.baslik}</h2>
                    <div style="text-align:center; margin-bottom: 25px; opacity:0.8; font-size: 13px; color:var(--text-color);"><i class="fa-solid fa-circle-info"></i> Taşlara tıklayarak tarihi detayları okuyabilirsiniz.</div>
                    
                    <div id="dominoKutusu" style="padding-left: 20px;">
        `;

        veri.taslar.forEach((tas, index) => {
            // escape single quotes for onclick function
            const escapedBaslik = tas.baslik.replace(/'/g, "\\'");
            const escapedDetay = tas.detay.replace(/'/g, "\\'");

            html += `
                <div class="domino-sarmal" style="position: relative; margin-bottom: 25px;">
                    <div id="tas_${index}" onclick="window.DOMINO_ACIKLAMA_GIZLI('${escapedBaslik}', '${escapedDetay}', '${renk}')" style="
                        background: var(--option-bg); 
                        border: 2px solid var(--card-border); 
                        border-left: 6px solid #7f8c8d; 
                        padding: 15px; 
                        border-radius: 8px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                        opacity: 0.4; 
                        transform: perspective(500px) rotateX(15deg); 
                        transform-origin: top; 
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        position: relative;
                        z-index: 2;
                        cursor: pointer;
                    " onmouseover="this.style.transform=this.style.transform.replace('scale(1.02)','') + ' scale(1.02)'; this.style.boxShadow='0 8px 15px rgba(0,0,0,0.2)';" onmouseout="this.style.transform=this.style.transform.replace(' scale(1.02)',''); this.style.boxShadow='';">
                        <h3 style="margin: 0; color: var(--text-color); font-size: 16px; display: flex; align-items: center; justify-content: space-between;">
                            <span>
                                <span style="display:inline-block; background:${renk}; color:white; width:22px; height:22px; text-align:center; border-radius:50%; font-size:14px; line-height:22px; margin-right:8px;">${index + 1}</span> 
                                ${tas.baslik}
                            </span>
                            <i class="fa-solid fa-magnifying-glass" style="opacity: 0.3; font-size: 14px;"></i>
                        </h3>
                    </div>
                    
                    ${index < veri.taslar.length - 1 ? `
                        <div id="ok_${index}" style="
                            position: absolute; 
                            left: 30px; 
                            top: 100%; 
                            width: 4px; 
                            height: 0px; 
                            background: ${renk}; 
                            transition: height 0.5s linear;
                            z-index: 1;
                        ">
                            <div style="
                                position: absolute; 
                                bottom: -6px; 
                                left: -4px; 
                                width: 0; 
                                height: 0; 
                                border-left: 6px solid transparent; 
                                border-right: 6px solid transparent; 
                                border-top: 8px solid ${renk};
                                opacity: 0;
                                transition: opacity 0.2s;
                            " id="okUcu_${index}"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                    </div>
                    
                    <div style="font-size: 12px; font-weight: bold; color: var(--text-color); opacity: 0.5; margin-top: 40px; text-align: center; border-top: 1px dashed var(--card-border); padding-top: 15px; padding-bottom: 20px;">
                        <i class="fa-solid fa-graduation-cap"></i> Eğitim Modülü: Murat Mutlu
                    </div>
                </div>
            </div>
        `;

        mapCanvas.innerHTML = html;
    }

    window.DOMINO_BASLAT = function() {
        if (animasyonDevamEdiyor) return;
        animasyonDevamEdiyor = true;
        document.getElementById('btnDevir').disabled = true;
        document.getElementById('btnDevir').style.opacity = "0.5";

        const veri = zincirler[aktifZincir];
        const renk = veri.temaRengi;
        let sure = 0;

        veri.taslar.forEach((tas, index) => {
            timerYakalayici.push(setTimeout(() => {
                const tasEl = document.getElementById(`tas_${index}`);
                
                tasEl.style.opacity = "1";
                tasEl.style.transform = "perspective(500px) rotateX(0deg)";
                tasEl.style.borderLeftColor = renk;
                
                if (index < veri.taslar.length - 1) {
                    timerYakalayici.push(setTimeout(() => {
                        const okEl = document.getElementById(`ok_${index}`);
                        const okUcu = document.getElementById(`okUcu_${index}`);
                        okEl.style.height = "25px";
                        setTimeout(() => { okUcu.style.opacity = "1"; }, 400);
                    }, 500));
                }

                tasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            }, sure));
            
            sure += 1200; // Akıcılığı artırmak için süreyi biraz kısalttık
        });

        timerYakalayici.push(setTimeout(() => {
            document.getElementById('btnDevir').innerHTML = '<i class="fa-solid fa-rotate-left"></i> Yeniden Oynat';
            document.getElementById('btnDevir').disabled = false;
            document.getElementById('btnDevir').style.opacity = "1";
            animasyonDevamEdiyor = false;
        }, sure));
    };

    document.getElementById('btnDevir').addEventListener('click', function() {
        if(this.innerText.includes("Yeniden Oynat")) {
            this.innerHTML = '<i class="fa-solid fa-hand-point-right"></i> İlk Taşı Devir';
            arayuzCiz();
            setTimeout(window.DOMINO_BASLAT, 100);
        } else {
            window.DOMINO_BASLAT();
        }
    });

    document.getElementById('zincirSecici').addEventListener('change', function(e) {
        aktifZincir = e.target.value;
        document.getElementById('btnDevir').innerHTML = '<i class="fa-solid fa-hand-point-right"></i> İlk Taşı Devir';
        arayuzCiz();
    });

    arayuzCiz();
};
// 17. ARAÇ: KÜLTÜREL ETKİLEŞİM ÇARKI (MEDENİYETLERİN MİRASI)
window.HARITA_MOTORU["kulturel_etkilesim"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #16a085; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-earth-europe"></i> Kültürel Etkileşim: Medeniyetlerin Mirası</h4>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 12px; color: var(--text-color);">Aşağıdaki miras kartlarından birini seçerek haritadaki yayılış serüvenini izleyin.</div>
            
            <div id="mirasKartlari" style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                <button onclick="window.MIRAS_SEC('kagit')" class="miras-btn" style="background: #f1c40f; color: #2c3e50; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fa-solid fa-scroll"></i> Kağıt</button>
                <button onclick="window.MIRAS_SEC('barut')" class="miras-btn" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fa-solid fa-bomb"></i> Barut</button>
                <button onclick="window.MIRAS_SEC('pusula')" class="miras-btn" style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fa-regular fa-compass"></i> Pusula</button>
                <button onclick="window.MIRAS_SEC('matbaa')" class="miras-btn" style="background: #9b59b6; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fa-solid fa-print"></i> Matbaa</button>
                <button onclick="window.MIRAS_SEC('yazi')" class="miras-btn" style="background: #34495e; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="fa-solid fa-pen-nib"></i> Yazı / Alfabe</button>
            </div>

            <div style="font-size: 11px; font-weight: bold; color: var(--text-color); opacity: 0.5; margin-top: 10px; border-top: 1px dashed var(--card-border); padding-top: 8px;">
                <i class="fa-solid fa-network-wired"></i> Konsept ve Tasarım: Murat Mutlu
            </div>
        </div>
    `;

    // Haritayı dünya genelini gösterecek şekilde başlat
    window.currentMapInstance = L.map('mapCanvas', { zoomControl: false }).setView([35.0, 55.0], 3);
    L.control.zoom({ position: 'bottomright' }).addTo(window.currentMapInstance);

    // Koyu/Sade bir altlık harita daha iyi kontrast sağlar
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 10,
        attribution: '© OpenStreetMap © CARTO'
    }).addTo(window.currentMapInstance);

    const mirasVerileri = {
        kagit: {
            renk: "#f39c12", // Koyu Sarı
            duraklar: [
                { koordinat: [34.3, 108.9], baslik: "1. Çin (MÖ 105)", detay: "Kağıt, ağaç kabukları ve paçavralar kullanılarak Çin'de icat edildi. Yüzyıllarca sır olarak saklandı.", ikon: "fa-leaf", tur: "İcat" },
                { koordinat: [42.5, 72.2], baslik: "2. Talas Savaşı (MS 751)", detay: "Çinliler ve Müslüman Araplar/Türkler arasındaki savaşta esir düşen Çinli kağıt ustaları, bu sırrı İslam dünyasına öğretti.", ikon: "fa-khanda", tur: "Savaş" },
                { koordinat: [33.3, 44.4], baslik: "3. Bağdat (MS 793)", detay: "İslam dünyasının ilk büyük kağıt fabrikaları Bağdat'ta kuruldu. Bilimsel eserler hızla çoğaltıldı.", ikon: "fa-book-quran", tur: "Ticaret/Üretim" },
                { koordinat: [37.8, -4.7], baslik: "4. Endülüs (MS 1150)", detay: "Müslüman İspanya (Endülüs) üzerinden kağıt Avrupa'ya geçti. İlk Avrupa kağıt fabrikası İspanya'da kuruldu.", ikon: "fa-mosque", tur: "Etkileşim" },
                { koordinat: [48.8, 2.3], baslik: "5. Avrupa & Rönesans", detay: "Kağıdın bollaşması ve ucuzlaması, daha sonra matbaayla birleşerek Rönesans ve Reform hareketlerini başlattı.", ikon: "fa-lightbulb", tur: "Sonuç" }
            ]
        },
        barut: {
            renk: "#e74c3c", // Kırmızı
            duraklar: [
                { koordinat: [34.3, 108.9], baslik: "1. Çin (MS 9. YY)", detay: "Çinli simyacılar ölümsüzlük iksirini ararken kazara barutu buldular. Başlangıçta havai fişek olarak kullanıldı.", ikon: "fa-fire-burst", tur: "İcat" },
                { koordinat: [35.6, 51.3], baslik: "2. İslam Dünyası", detay: "İpek Yolu ticareti ve Moğol istilaları aracılığıyla barut Ortadoğu'ya ulaştı ve ateşli silahlarda kullanılmaya başlandı.", ikon: "fa-camel", tur: "Ticaret/Göç" },
                { koordinat: [31.7, 35.2], baslik: "3. Haçlı Seferleri (11.-13. YY)", detay: "Avrupalılar, Haçlı Seferleri sırasında Müslümanlardan barutu ve ilk ilkel topları öğrendi.", ikon: "fa-cross", tur: "Savaş" },
                { koordinat: [48.8, 2.3], baslik: "4. Avrupa (Feodalitenin Çöküşü)", detay: "Avrupalı krallar barutu devasa toplarda kullanarak, yıkılmaz sanılan derebeyi şatolarını yerle bir etti. Merkezi krallıklar güçlendi.", ikon: "fa-chess-rook", tur: "Sonuç" }
            ]
        },
        pusula: {
            renk: "#2980b9", // Mavi
            duraklar: [
                { koordinat: [34.3, 108.9], baslik: "1. Çin (Han Hanedanı)", detay: "Mıknatıs taşının kuzeyi gösterdiği Çin'de keşfedildi. İlk pusulalar suda yüzen iğneler şeklindeydi.", ikon: "fa-magnet", tur: "İcat" },
                { koordinat: [25.2, 55.2], baslik: "2. Arap Denizciler", detay: "Hint Okyanusu'nda ticaret yapan Müslüman denizciler pusulayı Çinlilerden alarak geliştirdiler.", ikon: "fa-ship", tur: "Ticaret" },
                { koordinat: [41.9, 12.4], baslik: "3. Akdeniz ve İtalya", detay: "Haçlı Seferleri ve Akdeniz ticareti sayesinde pusula Avrupalı denizcilerin eline geçti ve kutu içine alındı.", ikon: "fa-anchor", tur: "Etkileşim" },
                { koordinat: [38.7, -9.1], baslik: "4. Coğrafi Keşifler", detay: "Pusulanın sapma açısının hesaplanmasıyla Avrupalılar açık denizlere korkusuzca açıldı ve yeni kıtalar keşfetti.", ikon: "fa-globe", tur: "Sonuç" }
            ]
        },
        matbaa: {
            renk: "#8e44ad", // Mor
            duraklar: [
                { koordinat: [34.3, 108.9], baslik: "1. Çin (Ahşap Baskı)", detay: "Metinler ahşap bloklara kazınarak mürekkeple kağıda basıldı.", ikon: "fa-tree", tur: "İcat" },
                { koordinat: [42.9, 89.1], baslik: "2. Uygur Türkleri", detay: "Uygurlar, tahtadan ve kilden tek tek hareketli harfler (tipo) yaparak modern matbaanın temelini attılar.", ikon: "fa-font", tur: "Geliştirme" },
                { koordinat: [46.8, 10.5], baslik: "3. Moğol İstilası & Ticaret", detay: "Moğolların batıya ilerleyişi ve İpek Yolu ticareti, bu baskı tekniğini Avrupa sınırlarına taşıdı.", ikon: "fa-horse", tur: "Göç/Savaş" },
                { koordinat: [50.0, 8.2], baslik: "4. Almanya (Gutenberg - 1450)", detay: "Johannes Gutenberg hareketli metal harfleri ve modern baskı makinesini icat etti.", ikon: "fa-print", tur: "İnovasyon" },
                { koordinat: [48.8, 2.3], baslik: "5. Rönesans ve Reform", detay: "Kitapların ucuzlamasıyla fikirler Avrupa'ya hızla yayıldı. Skolastik düşünce yıkıldı, aydınlanma başladı.", ikon: "fa-book-open", tur: "Sonuç" }
            ]
        },
        yazi: {
            renk: "#2c3e50", // Koyu Gri/Lacivert
            duraklar: [
                { koordinat: [31.3, 45.6], baslik: "1. Sümerler (MÖ 3200)", detay: "Tarihte ilk yazı (Çivi Yazısı) Mezopotamya'da Uruk şehrinde, tapınak kayıtlarını tutmak için icat edildi.", ikon: "fa-tablet", tur: "İcat" },
                { koordinat: [39.9, 35.4], baslik: "2. Anadolu (Asur Ticaret Kolonileri)", detay: "Asurlu tüccarlar, ticaret yapmak için geldikleri Kayseri (Kültepe) üzerinden yazıyı Anadolu'ya taşıyıp tarihi devirleri başlattı.", ikon: "fa-coins", tur: "Ticaret" },
                { koordinat: [33.8, 35.5], baslik: "3. Fenikeliler (MÖ 1000)", detay: "Doğu Akdeniz'deki denizci Fenikeliler, yüzlerce işaretten oluşan çivi yazısı yerine 22 harfli ilk modern Alfabeyi icat ettiler.", ikon: "fa-a", tur: "İnovasyon" },
                { koordinat: [41.9, 12.4], baslik: "4. Yunan ve Roma", detay: "Fenike alfabesi Akdeniz ticaretiyle önce Yunanlılara, oradan da Romalılara geçti ve günümüz Latin Alfabesi oluştu.", ikon: "fa-language", tur: "Sonuç" }
            ]
        }
    };

    let aktifCizgiler = [];
    let aktifMarkerlar = [];
    let cizimZamanlayicilari = [];

    // Haritayı Temizleme
    function haritayiTemizle() {
        aktifCizgiler.forEach(layer => window.currentMapInstance.removeLayer(layer));
        aktifMarkerlar.forEach(layer => window.currentMapInstance.removeLayer(layer));
        cizimZamanlayicilari.forEach(t => clearTimeout(t));
        aktifCizgiler = [];
        aktifMarkerlar = [];
        cizimZamanlayicilari = [];
    }

    window.MIRAS_SEC = function(mirasId) {
        // Buton efektleri
        document.querySelectorAll('.miras-btn').forEach(b => b.style.opacity = "0.5");
        event.currentTarget.style.opacity = "1";

        haritayiTemizle();
        const veri = mirasVerileri[mirasId];
        const noktalar = veri.duraklar;
        
        // Haritayı ilk noktaya kaydır
        window.currentMapInstance.flyTo(noktalar[0].koordinat, 4, { duration: 1 });

        let gecikme = 1000; // İlk nokta için 1 saniye bekle

        noktalar.forEach((nokta, index) => {
            // Noktayı (Marker) ve Pop-up'ı ekle
            cizimZamanlayicilari.push(setTimeout(() => {
                
                // Özel İkon Oluşturma
                const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color:${veri.renk}; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 0 10px ${veri.renk}; font-size:14px;"><i class="fa-solid ${nokta.ikon}"></i></div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const marker = L.marker(nokta.koordinat, { icon: customIcon }).addTo(window.currentMapInstance);
                
                const popupIcerik = `
                    <div style="text-align:center; min-width:150px;">
                        <span style="font-size:10px; font-weight:bold; color:white; background:${veri.renk}; padding:2px 8px; border-radius:10px; text-transform:uppercase;">${nokta.tur}</span>
                        <h4 style="margin:8px 0 5px 0; color:${veri.renk}; border-bottom:1px solid #eee; padding-bottom:5px;">${nokta.baslik}</h4>
                        <p style="margin:0; font-size:12px; color:#555; line-height:1.4;">${nokta.detay}</p>
                    </div>
                `;
                marker.bindPopup(popupIcerik).openPopup();
                aktifMarkerlar.push(marker);

                // Kamerayı noktaya doğru hafifçe kaydır
                window.currentMapInstance.panTo(nokta.koordinat);

            }, gecikme));

            // Sonraki noktaya giden oku (Çizgi) çiz
            if (index < noktalar.length - 1) {
                gecikme += 2500; // Çizgi çizimi ve okunması için bekleme süresi
                
                cizimZamanlayicilari.push(setTimeout(() => {
                    const baslangic = nokta.koordinat;
                    const bitis = noktalar[index + 1].koordinat;
                    
                    // Animasyonlu Çizgi (DashArray hilesi kullanıyoruz)
                    const cizgi = L.polyline([baslangic, bitis], {
                        color: veri.renk,
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 15', // Kesik çizgi (yol hissi)
                        lineJoin: 'round'
                    }).addTo(window.currentMapInstance);
                    
                    // Basit bir uçak/ok animasyonu da eklenebilir ama okunaklılığı bozmamak için kesik çizgiyi tercih ettik
                    aktifCizgiler.push(cizgi);
                    
                }, gecikme - 1000)); // Marker çıkmadan 1 saniye önce çizgiyi çizmeye başla
            }
        });
        
        // Animasyon bitince haritayı genelle
        cizimZamanlayicilari.push(setTimeout(() => {
            const grup = new L.featureGroup(aktifMarkerlar);
            window.currentMapInstance.flyToBounds(grup.getBounds(), { padding: [50, 50], duration: 1.5 });
        }, gecikme + 3000));
    };

    // İlk açılışta boş harita dursa da olur veya Kağıt otomatik seçilebilir
};
// 19. ARAÇ: COĞRAFYA KADERDİR (KATMANLI SU VE MEDENİYET HARİTASI)
window.HARITA_MOTORU["cografya_kaderdir"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #3498db; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-water"></i> Coğrafya Kaderdir</h4>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 10px; color: var(--text-color);">İlk Çağ medeniyetlerine can suyu vererek haritada nasıl yeşerdiklerini keşfedin.</div>
            <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px;" id="nehirButonlari">
                <button onclick="window.MEDENIYET_CANLANDIR('mezopotamya')" class="btn-nehir" style="background: #2c3e50; color: white; border: 2px solid #3498db; padding: 6px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-droplet"></i> Dicle & Fırat</button>
                <button onclick="window.MEDENIYET_CANLANDIR('misir')" class="btn-nehir" style="background: #2c3e50; color: white; border: 2px solid #f1c40f; padding: 6px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-droplet"></i> Nil Nehri</button>
                <button onclick="window.MEDENIYET_CANLANDIR('hint')" class="btn-nehir" style="background: #2c3e50; color: white; border: 2px solid #9b59b6; padding: 6px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-droplet"></i> İndus Nehri</button>
                <button onclick="window.MEDENIYET_CANLANDIR('cin')" class="btn-nehir" style="background: #2c3e50; color: white; border: 2px solid #e74c3c; padding: 6px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-droplet"></i> Sarı Irmak</button>
            </div>
            
            <div style="font-size: 11px; font-weight: bold; color: #3498db; margin-top: 10px; border-top: 1px dashed rgba(52, 152, 219, 0.5); padding-top: 8px;">
                <i class="fa-solid fa-graduation-cap"></i> Tasarım ve Kurgu: Murat Mutlu
            </div>
        </div>
    `;

    // Harita Başlangıcı (Fiziki Odaklı, Etiketsiz)
    window.currentMapInstance = L.map('mapCanvas', { zoomControl: false }).setView([30.0, 60.0], 4);
    L.control.zoom({ position: 'bottomleft' }).addTo(window.currentMapInstance);

    // Etiketsiz Fiziki Harita (Sadece coğrafya görünsün, medeniyetler bizimle belirecek)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 10,
        attribution: 'Tiles &copy; Esri'
    }).addTo(window.currentMapInstance);

    // Koyu bir filtre uygulayalım ki yeşillikler ve nehirler parlasın
    document.querySelector('.leaflet-tile-pane').style.filter = "brightness(0.8) contrast(1.2)";

    // Medeniyet Veritabanı
    const medeniyetler = {
        mezopotamya: {
            isim: "Mezopotamya Medeniyetleri",
            renk: "#3498db",
            odak: [33.0, 43.0], zoom: 6,
            nehirler: [
                [[38.5, 39.5], [36.0, 40.0], [34.0, 42.0], [31.0, 47.0]], // Fırat (Temsili)
                [[38.0, 40.5], [36.5, 43.0], [34.0, 44.0], [31.0, 47.0]]  // Dicle (Temsili)
            ],
            yesilAlan: [[37.0, 39.0], [36.0, 43.0], [31.0, 48.0], [30.0, 46.0], [34.0, 40.0]],
            sehirler: [
                { isim: "Sümer (Uruk)", koor: [31.3, 45.6] },
                { isim: "Babil", koor: [32.5, 44.4] },
                { isim: "Asur (Ninova)", koor: [36.3, 43.1] }
            ],
            bilgi: "İki Nehir Arası anlamına gelen Mezopotamya, Dicle ve Fırat nehirlerinin taşıdığı alüvyonlarla Bereketli Hilal'in kalbidir. Yazı, tekerlek ve ilk yazılı kanunlar burada yeşermiştir."
        },
        misir: {
            isim: "Mısır Medeniyeti",
            renk: "#f1c40f",
            odak: [26.0, 32.0], zoom: 6,
            nehirler: [
                [[22.0, 31.5], [26.0, 32.8], [30.0, 31.2], [31.5, 31.0]] // Nil (Temsili)
            ],
            yesilAlan: [[31.5, 30.0], [31.5, 32.0], [29.0, 31.5], [24.0, 33.0], [24.0, 32.0], [29.0, 30.5]],
            sehirler: [
                { isim: "Memfis (Aşağı Mısır)", koor: [29.8, 31.2] },
                { isim: "Teb (Yukarı Mısır)", koor: [25.7, 32.6] }
            ],
            bilgi: "Herodot'un deyimiyle 'Mısır, Nil'in bir armağanıdır.' Etrafı çöllerle çevrili olduğu için istilalardan korunmuş ve kendine özgü (hiyeroglif, piramitler) kapalı bir medeniyet kurmuştur."
        },
        hint: {
            isim: "Hint Medeniyeti",
            renk: "#9b59b6",
            odak: [28.0, 69.0], zoom: 5,
            nehirler: [
                [[33.0, 75.0], [30.0, 71.0], [26.0, 68.0], [24.0, 67.5]] // İndus (Temsili)
            ],
            yesilAlan: [[33.0, 76.0], [30.0, 73.0], [24.0, 69.0], [24.0, 66.0], [30.0, 69.0], [33.0, 74.0]],
            sehirler: [
                { isim: "Harappa", koor: [30.6, 72.8] },
                { isim: "Mohenjo-Daro", koor: [27.3, 68.1] }
            ],
            bilgi: "Ganj ve İndus nehirlerinin can verdiği bu coğrafya, dünyanın en eski planlı şehirlerine (ızgara planı ve kanalizasyon sistemi) ev sahipliği yapmıştır."
        },
        cin: {
            isim: "Çin Medeniyeti",
            renk: "#e74c3c",
            odak: [35.0, 110.0], zoom: 5,
            nehirler: [
                [[35.0, 95.0], [40.0, 110.0], [35.0, 115.0], [38.0, 118.0]] // Sarı Irmak / Huang He (Temsili)
            ],
            yesilAlan: [[34.0, 105.0], [41.0, 110.0], [38.0, 120.0], [34.0, 118.0], [33.0, 110.0]],
            sehirler: [
                { isim: "Anyang (Shang Hanedanı)", koor: [36.1, 114.3] }
            ],
            bilgi: "Sarı Irmak (Huang He) ve Gök Irmak (Yangtze) vadilerinde doğmuştur. İpekböcekçiliği, kağıt, pusula, matbaa ve barut gibi dünya tarihini değiştiren icatların vatanıdır."
        }
    };

    let aktifKatmanlar = [];
    let bilgiKutusu = null;

    window.MEDENIYET_CANLANDIR = function(id) {
        // Buton Efektleri
        document.querySelectorAll('.btn-nehir').forEach(btn => btn.style.background = "#2c3e50");
        event.currentTarget.style.background = medeniyetler[id].renk;

        // Eski katmanları temizle
        aktifKatmanlar.forEach(layer => window.currentMapInstance.removeLayer(layer));
        aktifKatmanlar = [];
        if(bilgiKutusu) bilgiKutusu.remove();

        const med = medeniyetler[id];
        
        // 1. Kamera Hareketi
        window.currentMapInstance.flyTo(med.odak, med.zoom, { duration: 1.5 });

        setTimeout(() => {
            // 2. Nehirleri Çiz (Mavi Su)
            med.nehirler.forEach(koor => {
                const nehir = L.polyline(koor, { color: '#3498db', weight: 6, opacity: 0.8 }).addTo(window.currentMapInstance);
                aktifKatmanlar.push(nehir);
            });

            // 3. Tarım Havzası (Yeşerme Efekti)
            setTimeout(() => {
                const tarim = L.polygon(med.yesilAlan, {
                    color: '#27ae60', fillColor: '#2ecc71', fillOpacity: 0.3, weight: 2
                }).addTo(window.currentMapInstance);
                aktifKatmanlar.push(tarim);

                // 4. Şehirler Pop-up
                setTimeout(() => {
                    med.sehirler.forEach(sehir => {
                        const icon = L.divIcon({
                            className: 'medeniyet-ikon',
                            html: `<div style="background:${med.renk}; color:white; padding:4px 8px; border-radius:10px; font-weight:bold; font-size:12px; border:2px solid white; white-space:nowrap; box-shadow:0 0 10px rgba(0,0,0,0.5);"><i class="fa-solid fa-building-columns"></i> ${sehir.isim}</div>`,
                            iconSize: null
                        });
                        const marker = L.marker(sehir.koor, { icon: icon }).addTo(window.currentMapInstance);
                        aktifKatmanlar.push(marker);
                    });

                    // 5. Bilgi Kutusu (Sağ Alt/Üst)
                    bilgiKutusu = L.control({position: 'bottomright'});
                    bilgiKutusu.onAdd = function () {
                        const div = L.DomUtil.create('div', 'info');
                        div.style.background = "var(--option-bg)";
                        div.style.color = "var(--text-color)";
                        div.style.padding = "15px";
                        div.style.borderRadius = "8px";
                        div.style.borderLeft = `5px solid ${med.renk}`;
                        div.style.maxWidth = "280px";
                        div.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
                        div.innerHTML = `
                            <h4 style="margin: 0 0 8px 0; color: ${med.renk};"><i class="fa-solid fa-book-journal-whills"></i> ${med.isim}</h4>
                            <p style="margin: 0; font-size: 13px; line-height: 1.5;">${med.bilgi}</p>
                            <div style="margin-top: 10px; font-size: 10px; opacity: 0.6; text-align: right; font-weight: bold;">
                                Hazırlayan: Murat Mutlu
                            </div>
                        `;
                        return div;
                    };
                    bilgiKutusu.addTo(window.currentMapInstance);

                }, 800);
            }, 600);
        }, 1500); // FlyTo bitiş süresi
    };
};
// 20. ARAÇ: BABİL YÜKSEK MAHKEMESİ (HAMMURABİ'NİN TOKMAĞI)
window.HARITA_MOTORU["hammurabi_mahkemesi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #8e44ad; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-gavel"></i> Babil Yüksek Mahkemesi</h4>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px; color: var(--text-color);">Hammurabi Kanunlarına göre hüküm verin. Unutmayın, modern adalet burada geçmez!</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    const davalar = [
        {
            konu: "Çöken Ev Vakası",
            olay: "Bir usta (mimar) soylu bir adam için ev yaptı. Ancak evi sağlam inşa etmediği için ev çöktü ve soylu adamın oğlu enkaz altında kalarak hayatını kaybetti. Babil Baş Yargıcı olarak hükmünüz nedir?",
            secenekler: [
                { metin: "Usta, ihmalkarlık suçundan 10 yıl zindana atılır.", dogruMu: false, mesaj: "Yanlış! Babil'de uzun süreli hapis cezası mantığı gelişmemiştir. Devlet mahkumu beslemek istemez." },
                { metin: "Usta, soylu adama yüklü miktarda gümüş öder.", dogruMu: false, mesaj: "Yanlış! Kanla ödenmesi gereken bir can borcu parayla kapatılamaz." },
                { metin: "Ustanın kendi oğlu idam edilir.", dogruMu: true, mesaj: "DOĞRU HÜKÜM! Kısasa Kısas (Lex Talionis). Ölen kişi ev sahibinin oğlu olduğu için, ustanın da oğlu öldürülür." }
            ],
            madde: "Madde 230: Eğer bir ustanın yaptığı ev çöküp ev sahibinin oğlunun ölümüne sebep olursa, o ustanın oğlu öldürülür."
        },
        {
            konu: "Kırık Kemik Vakası",
            olay: "Sokaktaki bir kavga sırasında, 'Soylu' (Hür) bir adam, 'Köle' (Avam) sınıfından bir adamın kemiğini kırdı. Hükmünüz nedir?",
            secenekler: [
                { metin: "Göze göz, dişe diş! Soylu adamın da kemiği kırılır.", dogruMu: false, mesaj: "Yanlış! Kısasa kısas kuralı sadece 'eşit sınıflar' arasında geçerlidir." },
                { metin: "Soylu adam, kölenin sahibine belirli bir miktar gümüş öder.", dogruMu: true, mesaj: "DOĞRU HÜKÜM! Sınıf Ayrımı. Köleler eşya veya mal statüsünde olduğu için, soylu adam sadece mal kaybı tazminatı öder." },
                { metin: "Soylu adam köle yapılarak o kölenin sahibine verilir.", dogruMu: false, mesaj: "Yanlış! Soylular kolay kolay köle sınıfına düşürülmezdi." }
            ],
            madde: "Madde 199: Eğer hür bir adam, bir kölenin gözünü çıkarır veya kemiğini kırarsa, kölenin değerinin yarısı kadar gümüş öder."
        },
        {
            konu: "Cerrahın Hatası",
            olay: "Bir cerrah (doktor), soylu bir adamı bronz bir bıçakla ameliyat etti ancak hasta ameliyat masasında hayatını kaybetti. Hükmünüz nedir?",
            secenekler: [
                { metin: "Cerrahın mesleğini yapması ömür boyu yasaklanır.", dogruMu: false, mesaj: "Yanlış! Modern bir tıbbi men cezası verdiniz. Babil hukuku çok daha acımasızdır." },
                { metin: "Cerrahın ameliyat yaptığı elleri kesilir.", dogruMu: true, mesaj: "DOĞRU HÜKÜM! Hammurabi kanunları mesleki hataları affetmezdi." },
                { metin: "Cerrah, ölen adamın ailesine tazminat öder.", dogruMu: false, mesaj: "Yanlış! Kısas kanunlarında para cezası sadece alt sınıflar için geçerliydi." }
            ],
            madde: "Madde 218: Eğer bir hekim, bir soyluyu ameliyat ederken onun ölümüne sebep olursa, o hekimin elleri kesilir."
        },
        {
            konu: "Borç ve Kölelik",
            olay: "Bir çiftçi, tüccardan aldığı borcu tarlasında çıkan kuraklık nedeniyle ödeyemedi. Borcuna karşılık tüccar ondan ne talep edebilir?",
            secenekler: [
                { metin: "Çiftçinin eşini ve çocuklarını 3 yıllığına köle olarak alır.", dogruMu: true, mesaj: "DOĞRU HÜKÜM! Babil'de borç köleliği çok yaygındı." },
                { metin: "Devlet borcu siler ve çiftçiye yeni tohum verir.", dogruMu: false, mesaj: "Yanlış! Sosyal devlet anlayışı bu dönemde mevcut değildi." },
                { metin: "Çiftçi borcunu ödeyene kadar zindana atılır.", dogruMu: false, mesaj: "Yanlış! Hapishanede yatan bir adam borcunu üreterek ödeyemez." }
            ],
            madde: "Madde 117: Eğer bir adam borcunu ödeyemezse eşini, oğlunu veya kızını borcuna karşılık verir; onlar üç yıl köle olarak çalışırlar, dördüncü yıl özgür kalırlar."
        }
    ];

    let aktifDava = 0;
    let puan = 0;

    function davaCiz() {
        if (aktifDava >= davalar.length) {
            // Oyun Bitti Ekranı
            let performans = puan === 4 ? "Kral Hammurabi seninle gurur duyuyor! Babil'in en acımasız ve adil yargıcısın." : "Babil'in sert kurallarına henüz alışamadın. Modern düşüncelerini kapıda bırakmalısın!";
            mapCanvas.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background:var(--container-bg); color:var(--text-color); padding:20px; text-align:center;">
                    <i class="fa-solid fa-scale-balanced" style="font-size: 60px; color: #8e44ad; margin-bottom: 20px;"></i>
                    <h2 style="margin: 0 0 10px 0;">MAHKEME SONA ERDİ</h2>
                    <h3 style="margin: 0; color: #e67e22;">Skor: ${puan} / ${davalar.length}</h3>
                    <p style="margin: 20px 0; max-width: 400px; line-height: 1.5;">${performans}</p>
                    <button onclick="window.HARITA_MOTORU['hammurabi_mahkemesi']()" style="padding: 10px 20px; background: #8e44ad; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Yeniden Yargıla</button>
                    
                    <div style="font-size: 11px; font-weight: bold; opacity: 0.5; margin-top: 30px;">
                        <i class="fa-solid fa-graduation-cap"></i> Eğitim Modülü: Murat Mutlu
                    </div>
                </div>
            `;
            return;
        }

        const dava = davalar[aktifDava];
        
        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; padding: 20px; background: var(--container-bg); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; overflow-y:auto; font-family: 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; width: 100%; background: var(--option-bg); border-radius: 12px; border: 3px solid #8e44ad; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    
                    <div style="text-align: center; border-bottom: 2px dashed rgba(142,68,173,0.3); padding-bottom: 15px; margin-bottom: 20px;">
                        <span style="background: #8e44ad; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">DAVA DOSYASI #${aktifDava + 1}</span>
                        <h2 style="margin: 15px 0 5px 0; color: #8e44ad;">${dava.konu}</h2>
                    </div>

                    <div style="background: rgba(0,0,0,0.03); border-left: 5px solid #8e44ad; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 16px; color: var(--text-color); line-height: 1.6;">${dava.olay}</p>
                    </div>

                    <div id="seceneklerAlani" style="display: flex; flex-direction: column; gap: 12px;">
                        ${dava.secenekler.map((secenek, index) => `
                            <button onclick="window.HUKUM_VER(${index})" style="background: var(--container-bg); color: var(--text-color); border: 2px solid #ccc; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; text-align: left; transition: 0.3s;" onmouseover="this.style.borderColor='#8e44ad'" onmouseout="this.style.borderColor='#ccc'">
                                <i class="fa-solid fa-gavel" style="color: #8e44ad; margin-right: 10px;"></i> ${secenek.metin}
                            </button>
                        `).join('')}
                    </div>

                    <div id="sonucAlani" style="display: none; margin-top: 20px; padding: 20px; border-radius: 8px; color: white; animation: fadeIn 0.4s;">
                        <h3 id="sonucBaslik" style="margin: 0 0 10px 0; font-size: 18px;"></h3>
                        <p id="sonucMesaj" style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;"></p>
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 5px; font-style: italic; font-size: 13px; margin-bottom: 15px;">
                            <i class="fa-solid fa-scroll"></i> <b>Tarihi Gerçek:</b> <span id="sonucMadde"></span>
                        </div>
                        <button onclick="window.SONRAKI_DAVA()" style="background: rgba(255,255,255,0.3); border: 1px solid white; color: white; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">Sıradaki Davaya Geç <i class="fa-solid fa-arrow-right"></i></button>
                    </div>

                    <div style="font-size: 11px; font-weight: bold; opacity: 0.5; margin-top: 25px; text-align: center;">
                        <i class="fa-solid fa-graduation-cap"></i> Eğitim Modülü: Murat Mutlu
                    </div>

                </div>
            </div>
        `;
    }

    window.HUKUM_VER = function(secilenIndex) {
        const dava = davalar[aktifDava];
        const secim = dava.secenekler[secilenIndex];
        
        document.getElementById('seceneklerAlani').style.display = 'none';
        const sonucAlani = document.getElementById('sonucAlani');
        sonucAlani.style.display = 'block';

        if(secim.dogruMu) {
            puan++;
            sonucAlani.style.background = "#27ae60";
            document.getElementById('sonucBaslik').innerHTML = '<i class="fa-solid fa-check"></i> TOKMAK DOĞRU VURULDU!';
        } else {
            sonucAlani.style.background = "#c0392b";
            document.getElementById('sonucBaslik').innerHTML = '<i class="fa-solid fa-xmark"></i> ANAKRONİZM HATASI!';
        }

        document.getElementById('sonucMesaj').innerText = secim.mesaj;
        document.getElementById('sonucMadde').innerText = dava.madde;
    };

    window.SONRAKI_DAVA = function() {
        aktifDava++;
        davaCiz();
    };

    davaCiz();
};
// 22. ARAÇ: ANTİK ŞİFRE ÇÖZÜCÜ (MİRAS ATÖLYESİ)
window.HARITA_MOTORU["antik_sifre"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    // Üst Kontrol Paneli
    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #16a085; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-scroll"></i> Antik Şifre Çözücü</h4>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px; color: var(--text-color);">İsminizi veya gizli mesajınızı yazın, İlk Çağ alfabelerine çevrilsin!</div>
        </div>
    `;

    // Leaflet motorunu devreden çıkar (Sadece arayüz kullanacağız)
    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // Alfabe Veritabanı (Unicode Karşılıkları)
    const alfabeler = {
        hiyeroglif: {
            isim: "Mısır Hiyeroglifi",
            arkaplan: "#f4e7c3", // Papirüs rengi
            renk: "#8e44ad",
            aciklama: "<b>Kısa Bilgi:</b> Hiyeroglifler (Kutsal Oyma), nesneleri temsil eden resim yazısıdır (İdeogram). Her sembol bir sesi veya kelimeyi ifade eder.",
            sozluk: {
                'A': '𓄿', 'B': '𓃀', 'C': '𓎡', 'D': '𓂧', 'E': '𓇋', 'F': '𓆑', 'G': '𓎼', 'H': '𓉔', 'I': '𓇋', 
                'J': '𓆓', 'K': '𓎡', 'L': '𓃭', 'M': '𓅓', 'N': '𓈖', 'O': '𓍯', 'P': '𓊪', 'Q': '𓈎', 'R': '𓂋', 
                'S': '𓋴', 'T': '𓏏', 'U': '𓅱', 'V': '𓆑', 'W': '𓅱', 'X': '𓎡𓋴', 'Y': '𓇌', 'Z': '𓊃'
            }
        },
        civi: {
            isim: "Sümer Çivi Yazısı",
            arkaplan: "#d2b48c", // Kil tablet rengi
            renk: "#d35400",
            aciklama: "<b>Kısa Bilgi:</b> Tarihin ilk yazısıdır. Sümerler tarafından ıslak kil tabletler üzerine çiviye benzeyen kamışlarla (stylus) yazılmıştır. Hecelerden oluşur.",
            sozluk: {
                'A': '𒀀', 'B': '𒁀', 'C': ' فونبټ', 'D': '𒁕', 'E': '𒂊', 'F': '𒉺', 'G': '𒂵', 'H': '𒄩', 'I': '𒄿', 
                'J': '𒅀', 'K': '𒅗', 'L': '𒆷', 'M': '𒈠', 'N': '𒈾', 'O': '𒌋', 'P': '𒉺', 'Q': '𒋡', 'R': '𒊏', 
                'S': '𒊓', 'T': '𒋫', 'U': '𒌋', 'V': '𒉿', 'W': '𒉿', 'X': '𒆜', 'Y': '𒅀', 'Z': '𒍝'
            }
        },
        fenike: {
            isim: "Fenike Alfabesi",
            arkaplan: "#bdc3c7", // Taş/Mermer rengi
            renk: "#2c3e50",
            aciklama: "<b>Kısa Bilgi:</b> Tarihteki ilk ses tabanlı harf sistemidir. Resimlerden kurtulup tamamen seslere (fonetik) odaklanmıştır. Günümüz Latin alfabesinin atasıdır. Sağdan sola yazılır.",
            sozluk: {
                'A': '𐤀', 'B': '𐤁', 'C': '𐤂', 'D': '𐤃', 'E': '𐤄', 'F': '𐤅', 'G': '𐤂', 'H': '𐤇', 'I': '𐤉', 
                'J': '𐤉', 'K': '𐤊', 'L': '𐤋', 'M': '𐤌', 'N': '𐤍', 'O': '𐤏', 'P': '𐤐', 'Q': '𐤒', 'R': '𐤓', 
                'S': '𐤎', 'T': '𐤕', 'U': '𐤅', 'V': '𐤅', 'W': '𐤅', 'X': '𐤎', 'Y': '𐤉', 'Z': '𐤆'
            }
        }
    };

    let aktifAlfabe = 'hiyeroglif';

    // Arayüzü Çizme
    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--container-bg); padding: 15px; box-sizing: border-box; overflow-y:auto; font-family: 'Segoe UI', sans-serif;">
            
            <div style="max-width: 700px; margin: 0 auto; width: 100%;">
                
                <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;">
                    <button id="btn_hiyeroglif" onclick="window.ALFABE_DEGISTIR('hiyeroglif')" style="flex:1; min-width:120px; padding: 12px; border: none; border-radius: 8px; background: #8e44ad; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"><i class="fa-solid fa-eye"></i> Mısır Hiyeroglifi</button>
                    <button id="btn_civi" onclick="window.ALFABE_DEGISTIR('civi')" style="flex:1; min-width:120px; padding: 12px; border: none; border-radius: 8px; background: #95a5a6; color: white; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-align-left"></i> Sümer Çivi Yazısı</button>
                    <button id="btn_fenike" onclick="window.ALFABE_DEGISTIR('fenike')" style="flex:1; min-width:120px; padding: 12px; border: none; border-radius: 8px; background: #95a5a6; color: white; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-a"></i> Fenike Alfabesi</button>
                </div>

                <div style="background: var(--option-bg); padding: 20px; border-radius: 12px; border: 2px solid var(--card-border); margin-bottom: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: var(--text-color); font-size: 16px;">Şifrelenecek Metni Girin:</h3>
                    <input type="text" id="sifreGirdisi" placeholder="Örn: MURAT MUTLU" onkeyup="window.SIFRE_CEVIR()" style="width: 80%; padding: 15px; font-size: 20px; border-radius: 8px; border: 2px solid #16a085; text-align: center; text-transform: uppercase; font-weight: bold; outline: none; background: var(--container-bg); color: var(--text-color);">
                </div>

                <div id="tabletEkrani" style="background: #f4e7c3; padding: 30px; border-radius: 15px; text-align: center; min-height: 150px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.3); border: 8px solid rgba(0,0,0,0.1); margin-bottom: 20px; position: relative;">
                    <div id="cevirilenMetin" style="font-size: 55px; color: #2c3e50; line-height: 1.5; word-break: break-all; letter-spacing: 5px;"></div>
                </div>

                <div id="bilgiKarti" style="background: rgba(0,0,0,0.05); border-left: 5px solid #8e44ad; padding: 15px; border-radius: 5px; color: var(--text-color); font-size: 14px; line-height: 1.5;">
                    ${alfabeler['hiyeroglif'].aciklama}
                </div>

                <div style="font-size: 11px; font-weight: bold; color: var(--text-color); opacity: 0.5; margin-top: 30px; text-align: center;">
                    <i class="fa-solid fa-graduation-cap"></i> Miras Atölyesi: Murat Mutlu
                </div>

            </div>
        </div>
    `;

    // Türkçe Karakterleri Temizleme Fonksiyonu
    function turkceTemizle(metin) {
        return metin.replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ç/g, 'C')
                    .replace(/ğ/g, 'G').replace(/ü/g, 'U').replace(/ş/g, 'S').replace(/ı/g, 'I').replace(/ö/g, 'O').replace(/ç/g, 'C');
    }

    // Çeviri Motoru
    window.SIFRE_CEVIR = function() {
        let girdi = document.getElementById('sifreGirdisi').value.toUpperCase();
        girdi = turkceTemizle(girdi);
        
        const sozluk = alfabeler[aktifAlfabe].sozluk;
        let sonuc = "";

        for(let i = 0; i < girdi.length; i++) {
            let harf = girdi[i];
            if(harf === " ") {
                sonuc += "&nbsp;&nbsp;&nbsp;"; // Boşluk
            } else if (sozluk[harf]) {
                sonuc += sozluk[harf];
            } else {
                sonuc += harf; // Sözlükte yoksa kendisini yaz (Noktalama işaretleri vs)
            }
        }

        // Fenike alfabesi sağdan sola yazılır
        if(aktifAlfabe === 'fenike') {
            document.getElementById('cevirilenMetin').style.direction = "rtl";
            document.getElementById('cevirilenMetin').style.textAlign = "right";
        } else {
            document.getElementById('cevirilenMetin').style.direction = "ltr";
            document.getElementById('cevirilenMetin').style.textAlign = "center";
        }

        document.getElementById('cevirilenMetin').innerHTML = sonuc;
    };

    // Alfabe Sekme Değiştirici
    window.ALFABE_DEGISTIR = function(alfabeId) {
        aktifAlfabe = alfabeId;
        const veri = alfabeler[alfabeId];

        // Buton renklerini sıfırla
        document.getElementById('btn_hiyeroglif').style.background = "#95a5a6";
        document.getElementById('btn_civi').style.background = "#95a5a6";
        document.getElementById('btn_fenike').style.background = "#95a5a6";
        document.getElementById('btn_hiyeroglif').style.boxShadow = "none";
        document.getElementById('btn_civi').style.boxShadow = "none";
        document.getElementById('btn_fenike').style.boxShadow = "none";

        // Aktif butonu renklendir
        const aktifBtn = document.getElementById(`btn_${alfabeId}`);
        aktifBtn.style.background = veri.renk;
        aktifBtn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";

        // Tablet arka planını ve bilgi notunu değiştir
        document.getElementById('tabletEkrani').style.background = veri.arkaplan;
        document.getElementById('bilgiKarti').innerHTML = veri.aciklama;
        document.getElementById('bilgiKarti').style.borderLeftColor = veri.renk;

        // Mevcut metni yeni alfabeyle tekrar çevir
        window.SIFRE_CEVIR();
    };
};
// 23. ARAÇ: NEOLİTİK KÖY KURUCUSU (ÇATALHÖYÜK SİMÜLASYONU) - 7 AŞAMALI SÜRÜM
window.HARITA_MOTORU["neolitik_koy"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #27ae60; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-wheat-awn"></i> Neolitik Köy Kurucusu</h4>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px; color: var(--text-color);">Kabileni Paleolitik mağaralardan çıkarıp, Çatalhöyük'te ilk medeniyeti kur!</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // 7 AŞAMALI DEVASA EVRİM AĞACI
    const asamalar = [
        {
            id: "tarim",
            renk: "#34495e", // Karanlık Mağara -> Tarım
            ikon: "fa-seedling",
            baslik: "Aşama 1: İklim Değişiyor (MÖ 10.000)",
            metin: "Buzul Çağı sona eriyor. Havalar ısınıyor, buzullar eriyor. Ancak alıştığınız büyük av hayvanları (mamutlar) kuzeye göç etti. Kabilen açlıkla yüz yüze. Doğa sana yeni bitkiler (yabani buğday) sunuyor. Ne yapacaksın?",
            secenekler: [
                { metin: "Hayvanların peşinden göç etmeye devam et.", dogruMu: false, sonuc: "Yanlış Karar! Hayvanlar çok uzağa gitti ve kabilen donarak telef oldu. Tüketici olarak kaldın." },
                { metin: "Buğday tohumlarını topla ve nehir kenarına ek.", dogruMu: true, sonuc: "Muazzam Karar! Tarımı (Üretici Hayatı) başlattın. Artık yiyecek aramak için göçmene gerek yok." }
            ]
        },
        {
            id: "evcillestirme",
            renk: "#27ae60", // Doğa/Yeşil
            ikon: "fa-paw",
            baslik: "Aşama 2: Hayvanların Evcilleştirilmesi (MÖ 8.500)",
            metin: "Tarlaların ürün veriyor ama sadece buğday yemek kabileni zayıf düşürüyor. Kışın et bulmak için hala tehlikeli ormanlara girip vahşi hayvanları avlıyorsunuz ve kayıplar veriyorsunuz. Çözümün nedir?",
            secenekler: [
                { metin: "Avlanmak bizim doğamızda var, mızrakları sivriltin!", dogruMu: false, sonuc: "Ölümcül Hata! Kışın çıkan fırtınada en iyi avcılarını kaybettin ve kabile açlıktan dağıldı." },
                { metin: "Yavru koyun ve keçileri yakalayıp köyde besleyelim.", dogruMu: true, sonuc: "Harika! Hayvanları evcilleştirdin. Artık et, süt ve yün her an elinin altında. Göçebe avcılık tamamen bitti." }
            ]
        },
        {
            id: "mimari",
            renk: "#d35400", // Toprak/Kerpiç
            ikon: "fa-house-chimney",
            baslik: "Aşama 3: Çatalhöyük Mimarisi (MÖ 7.400)",
            metin: "Konya Ovası'na yerleştin. Tarım ürünlerinizin ve hayvanlarınızın kokusu, yırtıcıları ve diğer kabileleri çekiyor. Taş duvar (Sur) örmeyi henüz bilmiyorsunuz. Kabileni nasıl koruyacaksın?",
            secenekler: [
                { metin: "Her aileyi birbirinden uzak, geniş bahçeli müstakil evlere yerleştir.", dogruMu: false, sonuc: "Ölümcül Hata! Dağınık evler savunmasız kaldı. Gece gelen yağmacılar kabileni yok etti." },
                { metin: "Evleri bitişik, kapısız ve penceresiz yap. Evlere çatıdan merdivenle girilsin.", dogruMu: true, sonuc: "Harika Bir Savunma İçgüdüsü! Çatalhöyük mimarisini icat ettin. Düşman geldiğinde merdivenleri yukarı çektin ve dış duvarlar doğal bir 'Sur' oldu." }
            ]
        },
        {
            id: "comlek",
            renk: "#c0392b", // Ateş ve Kil
            ikon: "fa-fire-burner",
            baslik: "Aşama 4: Seramik ve Çömlek (MÖ 7.000)",
            metin: "Tahıl hasadı muazzam. Ancak buğdayı kemirgenlerden korumak ve ateşte sulu yemek (çorba) pişirmek için hasır sepetler işe yaramıyor. Sepetler ateşte yanıyor. Ne yapacaksın?",
            secenekler: [
                { metin: "Sadece etleri közde kızartıp, buğdayı çiğ yemeye devam edelim.", dogruMu: false, sonuc: "Beslenme Hatası! Hastalıklar baş gösterdi ve nüfusun azaldı." },
                { metin: "Kili (çamuru) şekillendirip ateşte pişirelim ve kaplar yapalım.", dogruMu: true, sonuc: "Zeka Pırıltısı! Seramik (Çanak Çömlek) sanatını başlattın. Artık yiyecekleri güvenle depoluyor ve kaynatarak sağlıklı pişiriyorsun." }
            ]
        },
        {
            id: "inanc",
            renk: "#8e44ad", // Mistisizm/Sanat
            ikon: "fa-palette",
            baslik: "Aşama 5: Sanat ve İnanç (MÖ 6.500)",
            metin: "Karınları doyan ve güvende olan kabilenin artık korkuları (ölüm, doğa olayları) üzerine düşünecek vakti var. Evlerin iç duvarları çok boş. Onları nasıl değerlendireceksin?",
            secenekler: [
                { metin: "Duvarlara leopar, boğa başı ve bereket tanrıçası (Kybele) figürleri çizelim.", dogruMu: true, sonuc: "Muazzam! İnsanlığın ilk inanç sistemlerini ve iç mekan sanatını (Bükranion) yarattın. Toplumun manevi olarak birbirine bağlandı." },
                { metin: "Duvarlar sadece taşıyıcıdır, süslemeye ve inanca gerek yok.", dogruMu: false, sonuc: "Bağlar Koptu! İnsanlar manevi bir amaç bulamadı ve kabile içi çatışmalar başlayarak köy dağıldı." }
            ]
        },
        {
            id: "sosyoloji",
            renk: "#2980b9", // Toplum/Mülkiyet
            ikon: "fa-people-carry-box",
            baslik: "Aşama 6: Artı Ürün ve İş Bölümü (MÖ 6.000)",
            metin: "Evlerin depoları tıka basa buğday dolu (Artı Ürün). Artık herkesin tarlada çalışmasına gerek yok. Bu durumu nasıl yöneteceksin?",
            secenekler: [
                { metin: "Tahılı depola ve birilerini çömlekçi, rahip, asker olarak görevlendir.", dogruMu: true, sonuc: "Tebrikler! Mülkiyet kavramını ve Mesleki İş Bölümünü başlattın. Sınıflı toplumların temeli atıldı." },
                { metin: "Çalışmaya gerek yok, ambarlar bitene kadar yatıp dinlenelim.", dogruMu: false, sonuc: "Tembellik Sonunuz Oldu! Bir sonraki yıl kuraklık vurdu ve stoklar yetmedi." }
            ]
        },
        {
            id: "ticaret",
            renk: "#f39c12", // Ticaret/Altın
            ikon: "fa-handshake",
            baslik: "Aşama 7: Obsidyen Ticareti (MÖ 5.500)",
            metin: "Köyün büyüdü ama tarım aletleriniz ve silahlarınız kemik/taş olduğu için kırılıyor. Yakındaki Hasan Dağı eteklerinde çok keskin volkanik camlar (Obsidyen) var. Ama o bölge başka kabilelerin elinde.",
            secenekler: [
                { metin: "Elimizdeki fazla buğdayı verip onlardan obsidyen alalım.", dogruMu: true, sonuc: "Tarihi Bir Adım! Takas usulüyle tarihin ilk ticaret ağlarından birini kurdun. Çatalhöyük artık sadece bir köy değil, ticaret merkezi!" },
                { metin: "Onlara saldırıp obsidyenleri zorla alalım.", dogruMu: false, sonuc: "Savaş Hatası! Surlarınız ve yeterli silahınız olmadığı için düşman kabile sizi püskürttü ve köyünüzü yaktı." }
            ]
        }
    ];

    let mevcutAsama = 0;

    function arayuzCiz() {
        if (mevcutAsama >= asamalar.length) {
            finalEkrani();
            return;
        }

        const asama = asamalar[mevcutAsama];
        
        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--container-bg); padding: 20px; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; overflow-y:auto;">
                <div style="max-width: 650px; width: 100%; background: var(--option-bg); border-radius: 15px; border-top: 8px solid ${asama.renk}; padding: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="background: ${asama.renk}; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 15px auto; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                            <i class="fa-solid ${asama.ikon}"></i>
                        </div>
                        <h2 style="margin: 0 0 10px 0; color: ${asama.renk}; font-size: 20px;">${asama.baslik}</h2>
                        <div style="display:flex; justify-content:center; gap:5px; margin-bottom:15px;">
                            ${asamalar.map((a, i) => `<div style="width:15px; height:5px; border-radius:3px; background:${i <= mevcutAsama ? asama.renk : '#ccc'};"></div>`).join('')}
                        </div>
                        <p style="margin: 0; color: var(--text-color); font-size: 15px; line-height: 1.6; padding: 15px; background: rgba(0,0,0,0.03); border-radius: 8px; border-left: 4px solid ${asama.renk}; text-align: left;">
                            ${asama.metin}
                        </p>
                    </div>

                    <div id="secenekKutusu" style="display: flex; flex-direction: column; gap: 15px;">
                        ${asama.secenekler.map((sec, index) => `
                            <button onclick="window.KARAR_VER(${index})" style="background: var(--container-bg); color: var(--text-color); border: 2px solid var(--card-border); padding: 15px 20px; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer; text-align: left; transition: all 0.3s;" onmouseover="this.style.borderColor='${asama.renk}'; this.style.transform='scale(1.02)'" onmouseout="this.style.borderColor='var(--card-border)'; this.style.transform='scale(1)'">
                                <i class="fa-solid fa-arrow-right" style="color: ${asama.renk}; margin-right: 10px;"></i> ${sec.metin}
                            </button>
                        `).join('')}
                    </div>

                    <div id="sonucAlani" style="display: none; margin-top: 25px; padding: 20px; border-radius: 10px; color: white; animation: fadeIn 0.4s; text-align: center;">
                        <h3 id="sonucBaslik" style="margin: 0 0 10px 0; font-size: 18px;"></h3>
                        <p id="sonucMetin" style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5;"></p>
                        <button id="btnDevam" style="background: rgba(255,255,255,0.3); border: 2px solid white; color: white; padding: 10px 25px; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.3)'">Devam Et <i class="fa-solid fa-forward"></i></button>
                    </div>

                    <div style="font-size: 11px; font-weight: bold; color: var(--text-color); opacity: 0.4; margin-top: 30px; text-align: center; border-top: 1px dashed var(--card-border); padding-top: 10px;">
                        <i class="fa-solid fa-graduation-cap"></i> Oyun Kurgusu: Murat Mutlu
                    </div>

                </div>
            </div>
        `;
    }

    window.KARAR_VER = function(secimIndex) {
        const secim = asamalar[mevcutAsama].secenekler[secimIndex];
        document.getElementById('secenekKutusu').style.display = 'none';
        
        const sonucAlani = document.getElementById('sonucAlani');
        const btnDevam = document.getElementById('btnDevam');
        sonucAlani.style.display = 'block';

        if (secim.dogruMu) {
            sonucAlani.style.background = "#27ae60";
            document.getElementById('sonucBaslik').innerHTML = '<i class="fa-solid fa-circle-check"></i> DOĞRU HAMLE!';
            btnDevam.onclick = () => { mevcutAsama++; arayuzCiz(); };
        } else {
            sonucAlani.style.background = "#c0392b";
            document.getElementById('sonucBaslik').innerHTML = '<i class="fa-solid fa-skull"></i> KABİLEN YOK OLDU!';
            btnDevam.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Yeniden Dene';
            btnDevam.onclick = () => { arayuzCiz(); }; 
        }
        
        document.getElementById('sonucMetin').innerHTML = secim.sonuc;
    };

    function finalEkrani() {
        mapCanvas.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--container-bg); padding: 20px; box-sizing: border-box; font-family: 'Segoe UI', sans-serif;">
                <div style="max-width: 600px; width: 100%; background: #27ae60; border-radius: 15px; padding: 40px; text-align: center; color: white; box-shadow: 0 15px 35px rgba(0,0,0,0.3); animation: fadeIn 0.8s;">
                    <i class="fa-solid fa-city" style="font-size: 80px; margin-bottom: 20px; text-shadow: 0 5px 15px rgba(0,0,0,0.3);"></i>
                    <h1 style="margin: 0 0 15px 0; font-size: 32px; text-transform: uppercase;">Medeniyeti Kurdun!</h1>
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; opacity: 0.9;">
                        Buzul Çağı'nın zorluklarını aştın. Çatalhöyük'ün eşsiz savunma mimarisini icat ettin, çanak çömlek yaptın, duvarlara sanat eserleri çizdin, iş bölümünü ve Obsidyen ticaretini başlattın. Sen gerçek bir <b>Neolitik Lidersin!</b>
                    </p>
                    <button onclick="window.HARITA_MOTORU['neolitik_koy']()" style="background: white; color: #27ae60; border: none; padding: 12px 30px; border-radius: 30px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2);"><i class="fa-solid fa-rotate-left"></i> Oyunu Tekrar Oyna</button>
                    
                    <div style="font-size: 12px; font-weight: bold; margin-top: 30px; opacity: 0.8;">
                        Kurgu: Murat Mutlu
                    </div>
                </div>
            </div>
        `;
    }

    arayuzCiz(); 
};
// 24. ARAÇ: GÖBEKLİTEPE (PROFESYONEL ARKEOLOG VE ANALİZ PANELİ)
window.HARITA_MOTORU["gobeklitepe_kazi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #e67e22; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-shovels"></i> Göbeklitepe Arkeoloji Laboratuvarı</h4>
            <div style="font-size: 11px; opacity: 0.8; color: var(--text-color);">Tarihin akışını değiştirecek kanıtları gün yüzüne çıkarın.</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; background: #1a1a1a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; overflow: hidden; position: relative;">
            
            <div id="kaziHeader" style="position: absolute; top: 20px; text-align: center; width: 100%; color: #f1c40f; z-index: 5;">
                <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Saha Çalışması: Şanlıurfa / Göbeklitepe</h2>
                <p style="margin: 5px 0; font-size: 13px; color: #fff; opacity: 0.7;">Toprak katmanını temizlemek için fırçayı (fareyi) yüzeyde gezdirin.</p>
            </div>

            <div id="kaziViewport" style="position: relative; width: 320px; height: 320px; border: 10px solid #333; box-shadow: 0 0 50px rgba(0,0,0,0.5); border-radius: 5px;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #c2b280; display: flex; justify-content: space-around; align-items: flex-end; padding-bottom: 20px;">
                    <div style="display: flex; flex-direction: column; align-items: center; opacity: 0.9;">
                        <div style="width: 60px; height: 20px; background: #555; border-radius: 2px;"></div>
                        <div style="width: 25px; height: 80px; background: #666; display: flex; align-items: center; justify-content: center; color: #444; font-size: 14px;"><i class="fa-solid fa-spider"></i></div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 80px; height: 25px; background: #444; border-radius: 2px;"></div>
                        <div style="width: 35px; height: 120px; background: #555; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #333; font-size: 20px;">
                            <i class="fa-solid fa-kiwi-bird"></i>
                            <i class="fa-solid fa-worm"></i>
                        </div>
                    </div>
                </div>

                <div id="dirtGrid" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); z-index: 2;">
                </div>
            </div>

            <div style="width: 320px; height: 10px; background: #333; border-radius: 5px; margin-top: 20px; overflow: hidden;">
                <div id="progressBar" style="width: 0%; height: 100%; background: #e67e22; transition: width 0.3s;"></div>
            </div>

            <div id="analysisPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 100; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
                <div style="max-width: 500px; width: 100%; border: 1px solid #e67e22; padding: 30px; border-radius: 10px; background: #1a1a1a; box-shadow: 0 0 30px rgba(230, 126, 34, 0.2);">
                    <h2 style="color: #e67e22; margin-top: 0; text-align: center; border-bottom: 2px solid #e67e22; padding-bottom: 15px; font-size: 22px;">BULUNTU ANALİZ RAPORU</h2>
                    
                    <div style="margin: 20px 0; color: #ddd; font-size: 15px; line-height: 1.6;">
                        <p><b>Saha Gözlemi:</b> Kazı alanında yerleşik hayata dair (ev, mutfak) hiçbir iz yok. Su kaynağı kilometrelerce uzakta. Ancak devasa tapınak sütunları ve ritüel alanları bulundu.</p>
                        <p style="background: rgba(230,126,34,0.1); padding: 10px; border-radius: 5px; color: #f1c40f; font-weight: bold; text-align: center;">
                            SORU: Bu keşif, tarihin akışını nasıl değiştirir?
                        </p>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <button onclick="window.ANALYZE(false)" style="padding: 15px; background: transparent; border: 1px solid #444; color: #888; border-radius: 5px; cursor: pointer; font-size: 14px; transition: 0.3s;">İnsanların önce tarım yapıp sonra burayı bulduğunu kanıtlar.</button>
                        <button onclick="window.ANALYZE(true)" style="padding: 15px; background: #e67e22; border: none; color: white; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 5px 15px rgba(230,126,34,0.3);">İnancın, tarım ve yerleşik hayattan DAHA ÖNCE başladığını kanıtlar.</button>
                    </div>
                </div>
            </div>

            <div id="finalReport" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a1a; z-index: 110; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; text-align: center;">
                <div style="max-width: 550px;">
                    <i class="fa-solid fa-scroll" style="font-size: 60px; color: #2ecc71; margin-bottom: 20px;"></i>
                    <h2 style="color: #2ecc71; margin-bottom: 20px;">TARİH YENİDEN YAZILDI!</h2>
                    <div style="background: #2c3e50; padding: 25px; border-radius: 15px; border-top: 5px solid #2ecc71; color: #fff; text-align: left; line-height: 1.7;">
                        <p style="margin-top: 0;"><b>Göbeklitepe Paradigması:</b></p>
                        <p>Dünya tarihinin "Sıfır Noktası" kabul edilen bu keşif, şu klasik sıralamayı altüst etti:</p>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; font-weight: bold; color: #f1c40f; font-size: 14px;">
                            <span>DİN</span> <i class="fa-solid fa-arrow-right"></i> <span>TARIM</span> <i class="fa-solid fa-arrow-right"></i> <span>YERLEŞİK HAYAT</span>
                        </div>
                        <p>İnsanlar önce bir inanç etrafında toplandı; bu kalabalığı doyurma ihtiyacı tarımı, tarım ise yerleşik hayatı doğurdu.</p>
                    </div>
                    <div style="margin-top: 30px; font-size: 12px; font-weight: bold; color: #666;">MODÜL TASARIMI: MURAT MUTLU</div>
                </div>
            </div>
        </div>
    `;

    // Kazı Mekaniği
    const grid = document.getElementById('dirtGrid');
    let clearedTiles = 0;
    const totalTiles = 64;

    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.style.cssText = `background: #5d4037; border: 1px solid rgba(0,0,0,0.2); transition: opacity 0.4s ease; cursor: crosshair;`;
        
        const clear = function() {
            if (this.style.opacity !== '0') {
                this.style.opacity = '0';
                clearedTiles++;
                const progress = (clearedTiles / totalTiles) * 100;
                document.getElementById('progressBar').style.width = progress + '%';
                
                if (progress > 85) {
                    setTimeout(() => {
                        document.getElementById('analysisPanel').style.display = 'flex';
                    }, 800);
                }
            }
        };

        tile.addEventListener('mouseenter', clear);
        tile.addEventListener('touchstart', clear, {passive: true});
        grid.appendChild(tile);
    }

    window.ANALYZE = function(isCorrect) {
        if (!isCorrect) {
            alert("Dikkat Arkeolog! Kanıtlar bunu söylemiyor. Ev ve su olmayan bir yerde önce tarım yapılamazdı. Tekrar analiz et!");
            return;
        }
        document.getElementById('finalReport').style.display = 'flex';
    };
};
// 25. ARAÇ: BİLİMİN SOYAĞACI (10 DEV MİRAS - Murat Mutlu)
window.HARITA_MOTORU["bilim_soyagaci"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #f39c12; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-tree"></i> Bilimin Dev Soyağacı</h4>
            <div style="font-size: 11px; opacity: 0.9; color: var(--text-color);">10 Büyük İlk Çağ mirasını modern dünya ile eşleştirin.</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // 10 KİLİT EŞLEŞME
    const eslesmeler = [
        { id: "saat", antik: "60'lık Sayı Sistemi (Sümer)", modern: "Modern Saat ve Dakika", ikon: "fa-clock", bilgi: "Sümerlerin 60 tabanlı sistemi sayesinde bugün hala 1 saat 60 dakikadır." },
        { id: "hukuk", antik: "Hammurabi Kanunları (Babil)", modern: "Anayasa ve Hukuk Devleti", ikon: "fa-scale-balanced", bilgi: "Tarihin ilk yazılı ve kapsamlı kanunları, modern hukuk sistemlerinin temel taşıdır." },
        { id: "tip", antik: "Mumyalama Teknikleri (Mısır)", modern: "Tıp ve Anatomi Bilimi", ikon: "fa-stethoscopes", bilgi: "Mısırlılar mumyalama sayesinde insan vücudunu tanımış, eczacılık ve anatominin temelini atmıştır." },
        { id: "para", antik: "Lidya Sikkesi (Lidya)", modern: "Küresel Ekonomi ve Bankacılık", ikon: "fa-money-bill-transfer", bilgi: "Takas usulüne son veren Lidyalılar, bugün kullandığımız para sistemini başlattı." },
        { id: "yazi", antik: "Fenike Alfabesi (Fenike)", modern: "Latin Alfabesi ve İletişim", ikon: "fa-font", bilgi: "Ses temelli ilk alfabe olan Fenike sistemi, bugün kullandığımız alfabenin atasıdır." },
        { id: "astronomi", antik: "Ziggurat Gözlemleri (Sümer)", modern: "Uzay İstasyonları ve NASA", ikon: "fa-user-astronaut", bilgi: "Gök cisimlerini ilk kez sistematik gözleyen Mezopotamyalılar, uzay bilimini başlattı." },
        { id: "geometri", antik: "Nil Taşkın Ölçümleri (Mısır)", modern: "Modern Geometri ve Mimari", ikon: "fa-ruler-combined", bilgi: "Nil sularının tarlaları bozması sonucu arazi ölçümü için geliştirilen teknikler Geometriyi doğurdu." },
        { id: "burokrasi", antik: "Katiplik Sistemi (Sümer/Mısır)", modern: "Memurluk ve Devlet Arşivi", ikon: "fa-file-signature", bilgi: "Kayıt tutma ihtiyacı, bugünkü modern devlet bürokrasisinin ve arşivciliğin ilk örneğidir." },
        { id: "diplomasi", antik: "Kadeş Barış Antlaşması (Hitit)", modern: "Uluslararası Diplomasi ve BM", ikon: "fa-handshake", bilgi: "Tarihin ilk yazılı barış antlaşması, bugünkü uluslararası diplomasinin başlangıcıdır." },
        { id: "ulasim", antik: "Kral Yolu (Persler/Lidyalılar)", modern: "Otoyollar ve Kargo Ağı", ikon: "fa-truck-fast", bilgi: "Antik çağın otoyolu olan Kral Yolu, posta teşkilatının ve düzenli ulaşımın ilk modelidir." }
    ];

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; background: #1a1a1a; display: flex; flex-direction: column; align-items: center; padding: 15px; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; overflow-y:auto;">
            
            <div style="width: 100%; max-width: 900px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="color: #f39c12; text-align: center; font-weight: bold; border-bottom: 2px solid #f39c12; padding-bottom: 5px; margin-bottom: 5px;">ANTİK MİRAS</div>
                    ${eslesmeler.map(item => `
                        <div draggable="true" ondragstart="window.BILIM_DRAG(event, '${item.id}')" style="background: #eee; padding: 10px; border-radius: 6px; cursor: grab; font-size: 12px; font-weight: bold; color: #2c3e50; border-left: 4px solid #d35400; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            <i class="fa-solid fa-seedling" style="margin-right: 5px; color: #d35400;"></i> ${item.antik}
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="color: #3498db; text-align: center; font-weight: bold; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 5px;">MODERN KARŞILIK</div>
                    ${eslesmeler.map(item => `
                        <div id="target_${item.id}" ondragover="window.BILIM_ALLOW(event)" ondrop="window.BILIM_DROP(event, '${item.id}')" style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border: 1.5px dashed #3498db; min-height: 40px; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                            <i class="fa-solid ${item.ikon}" style="color: #3498db; opacity: 0.3;"></i>
                            <span style="color: #fff; opacity: 0.4; font-size: 11px;">Hedef nokta...</span>
                        </div>
                    `).join('')}
                </div>

            </div>

            <div id="bilimOverlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px; box-sizing: border-box;">
                <div style="max-width: 450px; border: 2px solid #f39c12; padding: 30px; border-radius: 15px; background: #1a1a1a;">
                    <i id="infoIkon" class="fa-solid" style="font-size: 50px; color: #f39c12; margin-bottom: 15px;"></i>
                    <h2 id="infoBaslik" style="color: #f39c12; margin: 0 0 15px 0; font-size: 22px;"></h2>
                    <p id="infoMetin" style="color: #fff; line-height: 1.6; font-size: 15px;"></p>
                    <button onclick="document.getElementById('bilimOverlay').style.display='none'" style="margin-top: 20px; padding: 10px 30px; background: #f39c12; border: none; color: #fff; border-radius: 5px; cursor: pointer; font-weight: bold;">Keşfe Devam Et</button>
                </div>
            </div>

            <div style="margin-top: 20px; font-size: 11px; color: #fff; opacity: 0.5; font-weight: bold;">
                <i class="fa-solid fa-graduation-cap"></i> Eğitim Modülü: Murat Mutlu
            </div>
        </div>
    `;

    // Sürükle-Bırak Mantığı
    window.BILIM_DRAG = (ev, id) => { ev.dataTransfer.setData("text", id); };
    window.BILIM_ALLOW = (ev) => { ev.preventDefault(); };

    window.BILIM_DROP = (ev, targetId) => {
        ev.preventDefault();
        const draggedId = ev.dataTransfer.getData("text");
        const targetEl = document.getElementById(`target_${targetId}`);

        if (draggedId === targetId) {
            const data = eslesmeler.find(x => x.id === draggedId);
            targetEl.style.background = "#27ae60";
            targetEl.style.border = "none";
            targetEl.innerHTML = `<i class="fa-solid ${data.ikon}" style="color: white;"></i> <span style="color:white; font-weight:bold; font-size:12px;">${data.modern}</span>`;
            
            // Bilgi Panelini Aç
            setTimeout(() => {
                document.getElementById('infoIkon').className = `fa-solid ${data.ikon}`;
                document.getElementById('infoBaslik').innerText = data.modern;
                document.getElementById('infoMetin').innerText = data.bilgi;
                document.getElementById('bilimOverlay').style.display = 'flex';
            }, 300);
        } else {
            targetEl.style.borderColor = "#c0392b";
            setTimeout(() => targetEl.style.borderColor = "#3498db", 500);
        }
    };
};
// 26. ARAÇ: PİRAMİDİN Basamakları (MISIR SOSYAL HİYERARŞİSİ)
window.HARITA_MOTORU["misir_piramidi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #d4af37; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-pyramids"></i> Piramidin Basamakları</h4>
            <div style="font-size: 11px; opacity: 0.9; color: var(--text-color);">Sınıf kartlarını piramitteki doğru statü basamağına yerleştirin.</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // Sınıf Verileri (En üstten en alta)
    const sınıflar = [
        { id: "firavun", isim: "Firavun", ikon: "fa-crown", detay: "<b>Tanrı-Kral:</b> Mısır'da her şeyin sahibi ve yaşayan bir tanrıdır. En tepede o bulunur; yasalar onun ağzından çıkar." },
        { id: "rahip", isim: "Vezirler ve Rahipler", ikon: "fa-ankh", detay: "<b>Dini ve Siyasi Güç:</b> Firavundan sonraki en yetkili gruptur. Tapınakları yönetir ve devlet işlerini firavun adına yürütürler." },
                { id: "katip", isim: "Katipler (Yazıcılar)", ikon: "fa-scroll", detay: "<b>Arşiv ve Vergi:</b> Okuma-yazma bilen nadir sınıftır. Hasadı sayar, vergileri kaydeder ve hiyeroglifi kullanarak devletin hafızasını oluştururlar." },
        { id: "mimar", isim: "Mimarlar ve Sanatçılar", ikon: "fa-compass-drafting", detay: "<b>İnşa ve Estetik:</b> Piramitlerin ve tapınakların tasarımcılarıdır. Zanaatları sayesinde toplumda saygın bir orta sınıfa sahiptirler." },
        { id: "serf", isim: "Çiftçiler ve Serfler", ikon: "fa-wheat-awn", detay: "<b>Temel Üreticiler:</b> Piramidin en geniş ve en alt tabakasıdır. Nil'in bereketiyle ülkeyi doyurur ve devasa yapıların inşaatında işçi olarak çalışırlar." }
    ];

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; background: #2c3e50; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; padding: 20px; box-sizing: border-box;">
            
            <div style="display: flex; gap: 40px; align-items: center; justify-content: center; flex-wrap: wrap;">
                
                <div id="piramitContainer" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                    ${sınıflar.map((s, index) => `
                        <div id="drop_${s.id}" ondragover="window.PIRAMIT_ALLOW(event)" ondrop="window.PIRAMIT_DROP(event, '${s.id}')" style="
                            width: ${100 + (index * 60)}px; 
                            height: 60px; 
                            background: rgba(255, 255, 255, 0.05); 
                            border: 2px dashed #d4af37; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            color: #d4af37; 
                            font-weight: bold; 
                            font-size: 14px; 
                            transition: 0.3s;
                            clip-path: polygon(${10 - (index*2)}% 0%, ${90 + (index*2)}% 0%, 100% 100%, 0% 100%);
                        ">
                            <i class="fa-solid fa-lock" style="opacity: 0.3; margin-right: 8px;"></i> Hedef Katman
                        </div>
                    `).join('')}
                </div>

                <div id="kartlarContainer" style="display: flex; flex-direction: column; gap: 10px;">
                    <h3 style="color: #d4af37; font-size: 16px; text-align: center; border-bottom: 1px solid #d4af37; padding-bottom: 5px;">Sosyal Sınıflar</h3>
                    ${[...sınıflar].sort(() => Math.random() - 0.5).map(s => `
                        <div draggable="true" ondragstart="window.PIRAMIT_DRAG(event, '${s.id}')" style="
                            background: #f1c40f; 
                            color: #2c3e50; 
                            padding: 12px 20px; 
                            border-radius: 5px; 
                            cursor: grab; 
                            font-weight: bold; 
                            display: flex; 
                            align-items: center; 
                            gap: 10px; 
                            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                            min-width: 180px;
                        ">
                            <i class="fa-solid ${s.ikon}"></i> ${s.isim}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="piramitOverlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px;">
                <div style="max-width: 450px; background: #1a1a1a; border: 3px solid #d4af37; padding: 30px; border-radius: 15px; box-shadow: 0 0 30px #d4af3755;">
                    <i id="pInfoIkon" class="fa-solid" style="font-size: 60px; color: #d4af37; margin-bottom: 20px;"></i>
                    <h2 id="pInfoBaslik" style="color: #d4af37; margin-bottom: 15px;"></h2>
                    <p id="pInfoMetin" style="color: #fff; line-height: 1.6; font-size: 15px;"></p>
                    <button onclick="document.getElementById('piramitOverlay').style.display='none'" style="margin-top: 20px; padding: 10px 30px; background: #d4af37; border: none; color: #1a1a1a; border-radius: 5px; cursor: pointer; font-weight: bold;">Devam Et</button>
                </div>
            </div>

            <div style="margin-top: 30px; font-size: 11px; color: #d4af37; opacity: 0.6; font-weight: bold;">
                <i class="fa-solid fa-graduation-cap"></i> Modül Tasarımı: Murat Mutlu
            </div>
        </div>
    `;

    // Sürükle-Bırak Mantığı
    window.PIRAMIT_DRAG = (ev, id) => {
        ev.dataTransfer.setData("text", id);
    };

    window.PIRAMIT_ALLOW = (ev) => {
        ev.preventDefault();
    };

    window.PIRAMIT_DROP = (ev, targetId) => {
        ev.preventDefault();
        const draggedId = ev.dataTransfer.getData("text");
        const targetEl = document.getElementById(`drop_${targetId}`);

        if (draggedId === targetId) {
            const data = sınıflar.find(x => x.id === draggedId);
            targetEl.style.background = "#d4af37";
            targetEl.style.borderStyle = "solid";
            targetEl.style.color = "#1a1a1a";
            targetEl.innerHTML = `<i class="fa-solid ${data.ikon}" style="margin-right:8px;"></i> ${data.isim}`;
            
            // Bilgi Panelini Aç
            setTimeout(() => {
                document.getElementById('pInfoIkon').className = `fa-solid ${data.ikon}`;
                document.getElementById('pInfoBaslik').innerText = data.isim;
                document.getElementById('pInfoMetin').innerHTML = data.detay;
                document.getElementById('piramitOverlay').style.display = 'flex';
            }, 300);
        } else {
            // Hata Durumu
            alert("Hiyerarşi Bozuldu! Bu sınıfın toplumdaki statüsü burası değil. Daha dikkatli analiz etmelisin!");
            targetEl.style.borderColor = "#c0392b";
            setTimeout(() => targetEl.style.borderColor = "#d4af37", 500);
        }
    };
};
// 27. ARAÇ: ANTİK KOLONİ ROTASI (AKDENİZ'İN EFENDİLERİ)
window.HARITA_MOTORU["antik_koloni_rotasi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #2980b9; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-anchor"></i> Akdeniz'in Efendileri</h4>
            <div style="font-size: 11px; opacity: 0.9; color: var(--text-color);">Fenike gemisine 'Alfabe' yükle ve Akdeniz kolonilerine dağıt!</div>
            <div style="margin-top: 8px;">
                <button id="btnGemiYukle" onclick="window.KOLONI_YUKLE()" style="background: #2980b9; color: white; border: none; padding: 6px 15px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s;"><i class="fa-solid fa-scroll"></i> Alfabeyi Gemice Yükle</button>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #2980b9; margin-top: 8px; border-top: 1px dashed rgba(41, 128, 185, 0.5); padding-top: 8px;">
                <i class="fa-solid fa-graduation-cap"></i> Modül Kurgusu: Murat Mutlu
            </div>
        </div>
    `;

    // Harita Başlangıcı (Akdeniz Havzası)
    window.currentMapInstance = L.map('mapCanvas', { zoomControl: false }).setView([36.0, 20.0], 5);
    L.control.zoom({ position: 'bottomright' }).addTo(window.currentMapInstance);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 10,
        attribution: '© OpenStreetMap'
    }).addTo(window.currentMapInstance);

    // Durak Verileri
    const duraklar = {
        sur: { id: "sur", isim: "Sur (Fenike)", koor: [33.27, 35.19], tip: "merkez", durum: "hazir", detay: "<b>Fenike (Lübnan):</b> Dağlık coğrafya tarıma izin vermeyince Fenikeliler denize yöneldi. Burada ilk 'Alfabe'yi icat ettiler." },
        kartaca: { id: "kartaca", isim: "Kartaca (Tunus)", koor: [36.85, 10.33], tip: "koloni", durum: "yok", detay: "<b>Kuzey Afrika:</b> Alfabeniz buraya ulaştı! Artık Kartacalı tüccarlar kayıtlarını bu 22 harfli sistemle tutacak." },
        iyonya: { id: "iyonya", isim: "İyonya (İzmir/Aydın)", koor: [38.41, 27.12], tip: "koloni", durum: "yok", detay: "<b>Anadolu Kıyıları:</b> Dağların denize dik uzanması İyonya'yı deniz ticaretine itti. Alfabeniz burada bilim ve felsefenin dili olacak." },
        atina: { id: "atina", isim: "Atina (Yunanistan)", koor: [37.98, 23.72], tip: "koloni", durum: "yok", detay: "<b>Avrupa Kapısı:</b> Alfabeniz Yunanlılar tarafından geliştirilerek Latin alfabesinin temelini oluşturacak." }
    };

    let gemiYuklu = false;
    let gemiMarker = null;
    let durakMarkerlari = {};

    // Durakları Çiz
    Object.values(duraklar).forEach(durak => {
        const icon = L.divIcon({
            className: 'durak-ikon',
            html: `<div id="icon_${durak.id}" style="background:${durak.tip === 'merkez' ? '#2c3e50' : '#bdc3c7'}; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3); font-size:14px;"><i class="fa-solid ${durak.tip === 'merkez' ? 'fa-scroll' : 'fa-anchor'}"></i></div>`,
            iconSize: [30, 30]
        });

        const marker = L.marker(durak.koor, { icon: icon }).addTo(window.currentMapInstance);
        marker.bindPopup(`<div style="text-align:center;"><b>${durak.isim}</b><br><small id="status_${durak.id}">${durak.tip === 'merkez' ? 'Alfabenin Doğduğu Yer' : 'Yazı henüz ulaşmadı'}</small></div>`);
        
        marker.on('click', () => {
            if (gemiYuklu && durak.tip === 'koloni' && durak.durum === 'yok') {
                window.GEMI_HAREKET(durak.id);
            }
        });

        durakMarkerlari[durak.id] = marker;
    });

    // Gemiyi Başlat
    const shipIcon = L.divIcon({
        className: 'ship-ikon',
        html: `<div id="gemi_visual" style="background:#2980b9; color:white; width:36px; height:36px; border-radius:50%; display:none; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 0 15px #2980b9; font-size:18px;"><i class="fa-solid fa-ship"></i></div>`,
        iconSize: [36, 36]
    });
    gemiMarker = L.marker(duraklar.sur.koor, { icon: shipIcon }).addTo(window.currentMapInstance);

    window.KOLONI_YUKLE = function() {
        gemiYuklu = true;
        document.getElementById('gemi_visual').style.display = 'flex';
        document.getElementById('btnGemiYukle').disabled = true;
        document.getElementById('btnGemiYukle').style.opacity = '0.5';
        alert("🚢 Gemiye 'Fenike Alfabesi' yüklendi! Şimdi harita üzerindeki çapa (⚓) ikonlarına tıklayarak alfabeyi Akdeniz'e yay.");
    };

    window.GEMI_HAREKET = function(targetId) {
        const hedef = duraklar[targetId];
        
        // Basit "Işınlanma" yerine küçük bir animasyon hissi (FlyTo ile gemiyi takip et)
        gemiMarker.setLatLng(hedef.koor);
        window.currentMapInstance.flyTo(hedef.koor, 6, { duration: 1.5 });

        setTimeout(() => {
            // Yazıyı Değiştir
            duraklar[targetId].durum = "var";
            document.getElementById(`icon_${targetId}`).style.background = "#2ecc71"; // Yeşerdi
            document.getElementById(`icon_${targetId}`).innerHTML = '<i class="fa-solid fa-font"></i>';
            document.getElementById(`status_${targetId}`).innerText = "Alfabe Kullanılıyor!";
            
            // Bilgi Penceresi
            durakMarkerlari[targetId].bindPopup(`
                <div style="text-align:center; min-width:150px;">
                    <h4 style="color:#2ecc71; margin:0 0 8px 0;"><i class="fa-solid fa-check-double"></i> Görev Başarılı</h4>
                    <p style="font-size:12px; margin:0;">${hedef.detay}</p>
                </div>
            `).openPopup();

            // Tüm duraklar doldu mu?
            const bittiMi = Object.values(duraklar).every(d => d.durum === 'var' || d.tip === 'merkez');
            if (bittiMi) {
                setTimeout(() => {
                    alert("🏆 TEBRİKLER! Fenike Alfabesini tüm Akdeniz'e yaydın. Ticaret sayesinde medeniyetlerin dili değişti ve Latin alfabesinin temeli atıldı!");
                }, 1000);
            }
        }, 1600);
    };
};
// 28. ARAÇ: BOZKIRIN ATLILARI (YAYLAK VE KIŞLAK SİMÜLASYONU)
// ID: klasik_u3_bozkir_1
window.HARITA_MOTORU["bozkir_atlilari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #d35400; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-horse"></i> Bozkırın Atlıları</h4>
            <div id="sezonBilgi" style="font-size: 12px; font-weight: bold; color: #2c3e50; background: #ecf0f1; padding: 5px; border-radius: 5px;">Mevsim: Bahar | Kervan Hazırlanıyor...</div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // Oyun Değişkenleri
    let mevsim = 0; // 0: Bahar, 1: Yaz, 2: Güz, 3: Kış
    let konum = "kislak"; // Başlangıç kışlakta
    let suruSagligi = 100;
    const mevsimler = [
        { ad: "Bahar", renk: "#2ecc71", mesaj: "Otlar yeşeriyor. Sürüler canlandı.", hedef: "yaylak", uyari: "Yaz yaklaşıyor! Sürüleri yüksek yaylaklara (serin yere) çıkarmazsan hayvanlar sıcaktan telef olur." },
        { ad: "Yaz", renk: "#f1c40f", mesaj: "Hava çok sıcak. Vadiler kurudu.", hedef: "yaylak", hata: "KIŞLAKTA KALDIN! Alçak yerlerde su bitti, sürüler susuzluktan kırılıyor!" },
        { ad: "Güz", renk: "#e67e22", mesaj: "Havalar soğuyor, yükseklere kar düşebilir.", hedef: "kislak", uyari: "Kış yaklaşıyor! Vadilerdeki korunaklı kışlaklara inmezsen sürüler dondurucu rüzgarda yok olur." },
        { ad: "Kış", renk: "#3498db", mesaj: "Dondurucu Sibirya soğukları geldi.", hedef: "kislak", hata: "YAYLAKTA KALDIN! Yüksek yerlere dev kar kütleleri indi, kervanın buz tuttu!" }
    ];

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #e0d6c8; font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
            
            <div id="bozkirHarita" style="flex: 1; position: relative; background: url('https://www.transparenttextures.com/patterns/paper-fibers.png'); transition: 1s;">
                
                <div id="area_yaylak" onclick="window.GOC_ET('yaylak')" style="position: absolute; top: 15%; left: 50%; transform: translateX(-50%); width: 220px; height: 120px; border: 3px dashed #2980b9; border-radius: 50% 50% 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); cursor: pointer;">
                    <i class="fa-solid fa-mountain" style="font-size: 30px; color: #2980b9;"></i>
                    <span style="font-weight: 900; color: #2980b9;">YAYLAK (Yüksekler)</span>
                </div>

                <div id="area_kislak" onclick="window.GOC_ET('kislak')" style="position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%); width: 220px; height: 120px; border: 3px dashed #d35400; border-radius: 0 0 50% 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); cursor: pointer;">
                    <i class="fa-solid fa-tent" style="font-size: 30px; color: #d35400;"></i>
                    <span style="font-weight: 900; color: #d35400;">KIŞLAK (Vadi)</span>
                </div>

                <div id="kervanOba" style="position: absolute; width: 50px; height: 50px; background: #8e44ad; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; box-shadow: 0 5px 15px rgba(0,0,0,0.3); left: 50%; transform: translateX(-50%); bottom: 20%;">
                    <i class="fa-solid fa-horse"></i>
                </div>

            </div>

            <div style="background: #2c3e50; padding: 15px; color: white; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 14px; font-weight: bold;"><i class="fa-solid fa-heart-pulse"></i> Sürü Sağlığı: <span id="healthDisplay">100</span>%</div>
                    <button onclick="window.MEVSIM_İLERLET()" style="background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer;"><i class="fa-solid fa-forward-step"></i> Mevsimi Geç</button>
                </div>
                <div id="asamaMesaj" style="font-size: 13px; line-height: 1.4; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border-left: 4px solid #f1c40f;">
                    Bahar geldi. Sürüleri hazırlayın Beyim! Yaz gelmeden serin yaylaklara çıkmalıyız.
                </div>
            </div>

            <div id="simFinal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px;">
                    <i id="finalIkon" class="fa-solid" style="font-size: 50px; margin-bottom: 15px;"></i>
                    <h2 id="finalBaslik" style="margin: 0 0 10px 0;"></h2>
                    <p id="finalMetin" style="font-size: 14px; color: #333; line-height: 1.6;"></p>
                    <button onclick="window.HARITA_MOTORU['bozkir_atlilari']()" style="margin-top: 20px; padding: 10px 20px; background: #2c3e50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Tekrar Dene</button>
                </div>
            </div>
        </div>
    `;

    // Mobil Uyumlu Hareket Fonksiyonu
    window.GOC_ET = function(hedef) {
        const kervan = document.getElementById('kervanOba');
        if (hedef === "yaylak") {
            kervan.style.bottom = "auto";
            kervan.style.top = "20%";
            konum = "yaylak";
        } else {
            kervan.style.top = "auto";
            kervan.style.bottom = "20%";
            konum = "kislak";
        }
    };

    window.MEVSIM_İLERLET = function() {
        mevsim = (mevsim + 1) % 4;
        const mVeri = mevsimler[mevsim];

        // Görsel Güncelleme
        document.getElementById('bozkirHarita').style.backgroundColor = mVeri.renk;
        document.getElementById('sezonBilgi').innerText = `Mevsim: ${mVeri.ad} | ${mVeri.mesaj}`;
        document.getElementById('sezonBilgi').style.color = mVeri.renk;
        document.getElementById('asamaMesaj').innerText = mVeri.uyari || mVeri.mesaj;

        // Kontrol: Sürü Doğru Yerde mi?
        // Yazın yaylakta, Kışın kışlakta olunmalı.
        if ((mevsim === 1 && konum !== "yaylak") || (mevsim === 3 && konum !== "kislak")) {
            suruSagligi -= 40;
            document.getElementById('healthDisplay').innerText = suruSagligi;
            document.getElementById('asamaMesaj').innerHTML = `<span style="color:#e74c3c; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> ${mVeri.hata}</span>`;
            
            if (suruSagligi <= 0) {
                window.BITIR(false, "Sürüleriniz yok oldu. Halkınız bozkırın çetin şartlarına yenik düştü. Konar-göçer yaşam hata kabul etmez!");
            }
        }

        // Bir tam tur döndüyse (Kış bittiyse ve sağ kaldıysa)
        if (mevsim === 0 && suruSagligi > 0) {
            window.BITIR(true, "Tebrikler Beyim! Mevsim döngüsünü başarıyla tamamladınız. Öğrencileriniz artık Türklerin neden yer değiştirmediğini, 'planlı göç' (Konar-Göçer) ile hayatta kaldıklarını anladı.");
        }
    };

    window.BITIR = function(basari, mesaj) {
        document.getElementById('simFinal').style.display = 'flex';
        document.getElementById('finalIkon').className = basari ? "fa-solid fa-trophy" : "fa-solid fa-skull-crossbones";
        document.getElementById('finalIkon').style.color = basari ? "#27ae60" : "#c0392b";
        document.getElementById('finalBaslik').innerText = basari ? "Bozkırın Hakimi!" : "Kervan Dağıldı!";
        document.getElementById('finalMetin').innerText = mesaj;
    };
};
// 29. ARAÇ: İPEK YOLU DİPLOMASİSİ (5 AŞAMALI BÜYÜK STRATEJİ)
// ID: diplomasi_u4_ipekyolu_v2
window.HARITA_MOTORU["ipek_yolu_diplomasi"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #8e44ad; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-chess-knight"></i> İpek Yolu Diplomasisi</h4>
            <div id="sezonBilgi" style="font-size: 11px; font-weight: bold; color: #2c3e50; background: #f1c40f; padding: 4px; border-radius: 4px;">Hedef: Orta Asya Hakimiyeti</div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #8e44ad; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-pen-nib"></i> Simülasyon: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    let asama = 1;

    const hikaye = {
        1: {
            baslik: "1. Aşama: Ortak Düşman (Akhunlar)",
            metin: "MÖ 557. İpek Yolu Akhunların kontrolünde. Sasaniler de bu durumdan rahatsız. İstemi Yabgu olarak ilk hamlen ne olacak?",
            butonlar: [
                { metin: "Sasanilerle İttifak Yap", aksiyon: "ittifak_sasani", dogru: true },
                { metin: "Bizans ile Uzlaş", aksiyon: "hata_bizans_erken", dogru: false }
            ]
        },
        2: {
            baslik: "2. Aşama: Akhunların Sonu",
            metin: "Müttefikin Sasanilerle birlikte Akhunları yıktın. Topraklar paylaşıldı. Ancak Sasaniler İpek Yolu'ndaki geçiş ücretlerini aşırı artırdı. Ne yapmalı?",
            butonlar: [
                { metin: "Sasanilere Elçi Gönder", aksiyon: "elci_sasani", dogru: true },
                { metin: "Hemen Savaş İlan Et", aksiyon: "hata_savas_erken", dogru: false }
            ]
        },
        3: {
            baslik: "3. Aşama: İhanet ve Zehir",
            metin: "Sasanilere gönderdiğin elçiler sarayda zehirlenerek öldürüldü! Sasani Şahı yolu tamamen kapattı. Ticaret durdu. Devlet zor durumda.",
            butonlar: [
                { metin: "Elçin Maniakh'ı ve heyeti Bizans'a Gönder", aksiyon: "elci_bizans", dogru: true },
                { metin: "Geri Adım At, Vergi Ver", aksiyon: "hata_taviz", dogru: false }
            ]
        },
        4: {
            baslik: "4. Aşama: İlk Temas (Konstantinopolis)",
            metin: "Elçin Maniakh, Bizans imparatoruna ulaştı. Türk tarihinde Avrupa'ya giden ilk heyet! Bizans, Sasanileri arkadan vurmayı kabul etti.",
            butonlar: [
                { metin: "Kıskaç Harekatını Başlat", aksiyon: "kiskac", dogru: true },
                { metin: "İttifakı Gizli Tut", aksiyon: "hata_bekle", dogru: false }
            ]
        },
        5: {
            baslik: "5. Aşama: Büyük Zafer",
            metin: "Doğudan Göktürkler, Batıdan Bizans saldırdı. Sasaniler iki ateş arasında kaldı! İpek Yolu artık tamamen senin kontrolünde.",
            butonlar: [
                { metin: "Tarihi Tescille", aksiyon: "final", dogru: true }
            ]
        }
    };

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #fdf5e6; font-family: 'Segoe UI', sans-serif; position: relative;">
            
            <div id="stratHarita" style="flex: 1; position: relative; background: url('https://www.transparenttextures.com/patterns/papyros.png'); overflow: hidden;">
                <div id="bizans" style="position: absolute; left: 10%; top: 40%; text-align: center; transition: 0.5s;"><i class="fa-solid fa-place-of-worship" style="color:#2980b9; font-size:25px;"></i><br><small>BİZANS</small></div>
                <div id="sasani" style="position: absolute; left: 45%; top: 45%; text-align: center; transition: 0.5s;"><i class="fa-solid fa-fire-flame-curved" style="color:#c0392b; font-size:25px;"></i><br><small>SASANİ</small></div>
                <div id="akhun" style="position: absolute; left: 65%; top: 30%; text-align: center; transition: 0.5s;"><i class="fa-solid fa-shield-halved" style="color:#7f8c8d; font-size:20px;"></i><br><small>AKHUN</small></div>
                <div id="gokturk" style="position: absolute; right: 10%; top: 35%; text-align: center; transition: 0.5s;"><i class="fa-solid fa-wolf-pack-white" style="color:#27ae60; font-size:30px;"></i><br><small>GÖKTÜRK</small></div>
                
                <div id="elciMarker" style="position: absolute; display: none; transition: 1.5s linear; z-index: 100; color: #8e44ad; font-size: 20px;"><i class="fa-solid fa-person-walking-luggage"></i></div>
            </div>

            <div id="decisionPanel" style="background: white; padding: 20px; box-shadow: 0 -5px 15px rgba(0,0,0,0.1); z-index: 10; border-top: 4px solid #8e44ad;">
                <div id="prog" style="display:flex; gap:4px; margin-bottom:10px;">
                    ${[1,2,3,4,5].map(i => `<div id="p${i}" style="flex:1; height:4px; background:#ddd;"></div>`).join('')}
                </div>
                <h3 id="panelBaslik" style="margin:0 0 10px 0; color:#8e44ad; font-size:16px;"></h3>
                <p id="panelMetin" style="font-size:13px; color:#333; line-height:1.5; margin-bottom:15px;"></p>
                <div id="panelButtons" style="display:flex; gap:10px; flex-wrap: wrap;"></div>
            </div>

            <div id="finalScreen" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; align-items:center; justify-content:center; padding:20px; text-align:center; color:white;">
                <div style="max-width:400px; border:2px solid #f1c40f; padding:30px; border-radius:15px;">
                    <i id="finalIcon" class="fa-solid" style="font-size:60px; margin-bottom:20px;"></i>
                    <h2 id="finalTitle"></h2>
                    <p id="finalText" style="font-size:14px; line-height:1.6;"></p>
                    <button onclick="window.HARITA_MOTORU['ipek_yolu_diplomasi']()" style="margin-top:20px; padding:12px 30px; background:#f1c40f; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">Yeniden Başla</button>
                    <div style="margin-top:20px; font-size:10px; opacity:0.6;"></div>
                </div>
            </div>
        </div>
    `;

    window.RENDER_ASAMA = function() {
        const d = hikaye[asama];
        document.getElementById('panelBaslik').innerText = d.baslik;
        document.getElementById('panelMetin').innerText = d.metin;
        const btnBox = document.getElementById('panelButtons');
        btnBox.innerHTML = '';
        
        // Progress bar güncelle
        for(let i=1; i<=5; i++) {
            document.getElementById(`p${i}`).style.background = i <= asama ? "#8e44ad" : "#ddd";
        }

        d.butonlar.forEach(btn => {
            const b = document.createElement('button');
            b.innerText = btn.metin;
            b.style.cssText = `flex:1; min-width:140px; padding:12px; border:none; border-radius:8px; background:${btn.dogru ? '#8e44ad' : '#95a5a6'}; color:white; font-weight:bold; cursor:pointer; font-size:12px;`;
            b.onclick = () => window.HAMLE_YAP(btn);
            btnBox.appendChild(b);
        });
    };

    window.HAMLE_YAP = function(btn) {
        if (!btn.dogru) {
            window.FINISH(false, btn.aksiyon);
            return;
        }

        const marker = document.getElementById('elciMarker');
        
        if (asama === 1) { // Akhunlara karşı ittifak
            document.getElementById('akhun').style.transform = "scale(0)";
            setTimeout(() => { asama = 2; window.RENDER_ASAMA(); }, 1000);
        } else if (asama === 2) { // Sasani elçisi
            marker.style.display = 'block';
            marker.style.left = "90%"; marker.style.top = "35%";
            setTimeout(() => {
                marker.style.left = "45%"; marker.style.top = "45%";
                setTimeout(() => {
                    alert("⚠️ Acı Haber: Sasaniler elçilerini zehirleyerek öldürdü!");
                    asama = 3; window.RENDER_ASAMA();
                }, 1600);
            }, 100);
        } else if (asama === 3) { // Bizans elçisi (Maniakh)
            marker.style.left = "90%"; marker.style.top = "35%";
            setTimeout(() => {
                marker.style.left = "10%"; marker.style.top = "40%";
                setTimeout(() => {
                    alert("🤝 Bizans İmparatoru müttefiklik teklifini kabul etti!");
                    asama = 4; window.RENDER_ASAMA();
                }, 1600);
            }, 100);
        } else if (asama === 4) { // Kıskaç
            document.getElementById('sasani').style.boxShadow = "0 0 30px red";
            asama = 5; window.RENDER_ASAMA();
        } else if (asama === 5) {
            window.FINISH(true);
        }
    };

    window.FINISH = function(basari, hata) {
        const screen = document.getElementById('finalScreen');
        const fTitle = document.getElementById('finalTitle');
        const fText = document.getElementById('finalText');
        const fIcon = document.getElementById('finalIcon');
        screen.style.display = 'flex';

        if (basari) {
            fIcon.className = "fa-solid fa-crown"; fIcon.style.color = "#f1c40f";
            fTitle.innerText = "DİPLOMASİ ÜSTADI";
            fText.innerHTML = "Tebrikler Beyim! İstemi Yabgu'nun meşhur <b>'Sasanileri iki ateş arasında bırakma'</b> stratejisini başarıyla uyguladın. İpek Yolu artık Türklerin kontrolünde!";
        } else {
            fIcon.className = "fa-solid fa-skull"; fIcon.style.color = "#c0392b";
            fTitle.innerText = "STRATEJİK HATA";
            if (hata === "hata_bizans_erken") fText.innerText = "Sasanilerle birleşmeden Bizans'a gitmek Akhunları güçlendirdi. Göktürk orduları Orta Asya'da sıkıştı.";
            else if (hata === "hata_savas_erken") fText.innerText = "Hazırlıksız savaş ilan etmek Sasanilerin fillerine karşı ordunu bozguna uğrattı.";
            else fText.innerText = "Verdiğin tavizler devletin bağımsızlığını yitirmesine neden oldu.";
        }
    };

    window.RENDER_ASAMA();
};
// 30. ARAÇ: FEODAL MALİKÂNE YÖNETİMİ (COĞRAFİ STRATEJİ VE OTARŞİ)
// ID: ekonomi_u3_feodalizm_v2
window.HARITA_MOTORU["feodal_malikane"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #5d4037; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-chess-rook"></i> Feodal Strateji Merkezi</h4>
            <div id="ekonomiDurum" style="font-size: 11px; font-weight: bold; color: #fff; background: #8d6e63; padding: 4px; border-radius: 4px;">Hedef: Yapıları doğru coğrafi konumlara inşa ederek Otarşi'yi sağla.</div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #5d4037; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-feather-pointed"></i> Simülasyon: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // Malikâne Verileri (Coğrafi Doğruluk Eklendi)
    const yapilar = [
        { id: "tarla", isim: "Tahıl Tarlaları", ikon: "fa-wheat-awn", dogruSlot: "ova", hata: "Tarlayı buraya kuramazsın! Tarım yapmak için düz, yumuşak ve geniş bir <b>Verimli Ova</b> bulmalısın.", bilgi: "<b>Ova Üretimi:</b> Halkın ve senyörün ekmeği buradan gelir. Köylüler 'Angarya' usulü burada çalışır." },
        { id: "degirmen", isim: "Su Değirmeni", ikon: "fa-wind", dogruSlot: "nehir", hata: "Su değirmeni buraya kurulamaz! Çarkların dönmesi için hızlı akan bir <b>Nehir Kenarı</b> bulmalısın.", bilgi: "<b>Nehir İşlemesi:</b> Tarladan gelen buğday nehir gücüyle burada un olur. Değirmen senyöründür, köylü kullanmak için vergi öder." },
        { id: "kilise", isim: "Köy Kilisesi", ikon: "fa-church", dogruSlot: "merkez", hata: "Kilise dış sınırlara kurulmaz! Halkın kolayca ulaşıp kontrol edilebilmesi için <b>Köy Merkezine</b> inşa edilmelidir.", bilgi: "<b>Merkezi Otorite:</b> Orta Çağ'da kilise sadece ibadet yeri değil, eğitimin ve toplumsal kontrolün merkezidir." },
        { id: "demirhane", isim: "Demirhane", ikon: "fa-hammer", dogruSlot: "dag", hata: "Demirhane ovaya kurulmaz! Kömür ve maden yataklarına yakın olmak için <b>Dağ Eteği'ne</b> kurulmalıdır.", bilgi: "<b>Madencilik & Teknoloji:</b> Saban demiri ve şövalye zırhları burada dövülür. Dışarıya bağımlılığı bitiren kilit yapıdır." },
        { id: "ahira", isim: "Ortak Otlak", ikon: "fa-cow", dogruSlot: "mera", hata: "Hayvanları buraya salamazsın! Sürünün güvenle yayılması için geniş <b>Bozkır / Mera</b> alanına ihtiyaç var.", bilgi: "<b>Bozkır Hayvancılığı:</b> Hayvanlar burada otlar. Et, süt ve deri ihtiyacı malikâne içinde karşılanır." },
        { id: "sur", isim: "Savunma Hattı", ikon: "fa-shield-halved", dogruSlot: "sinir", hata: "Savunma hattı iç bölgelere kurulmaz! Saldırıları önceden kesmek için <b>Açık Sınır</b> bölgelerine inşa edilmelidir.", bilgi: "<b>Sınır Güvenliği:</b> Saldırı anında köylüler bu surların arkasına sığınır. Güvenlik karşılığında sadakat verilir." }
    ];

    const slotlar = [
        { id: "ova", isim: "Verimli Ova", ikon: "fa-leaf", pos: [-100, -110], renk: "#aed581" },
        { id: "nehir", isim: "Nehir Kenarı", ikon: "fa-water", pos: [100, -110], renk: "#4fc3f7" },
        { id: "merkez", isim: "Köy Merkezi", ikon: "fa-map-pin", pos: [-140, 0], renk: "#ffb74d" },
        { id: "sinir", isim: "Açık Sınır", ikon: "fa-route", pos: [140, 0], renk: "#90a4ae" },
        { id: "dag", isim: "Dağ Eteği", ikon: "fa-mountain", pos: [-100, 110], renk: "#a1887f" },
        { id: "mera", isim: "Geniş Mera", ikon: "fa-tree", pos: [100, 110], renk: "#81c784" }
    ];

    let seciliYapi = null;
    let insaEdilenler = 0;

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #f5f5f5; font-family: 'Segoe UI', sans-serif; position: relative;">
            
            <div id="manorMap" style="flex: 1; position: relative; background: #c5e1a5; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                
                <div style="position: absolute; width: 60px; height: 100%; background: #4fc3f7; right: 20%; top: 0; opacity: 0.6; transform: skewX(-15deg);"></div>

                <div style="z-index: 5; text-align: center;">
                    <i class="fa-solid fa-castle" style="font-size: 80px; color: #5d4037; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));"></i>
                    <div style="background: #5d4037; color: white; padding: 4px 12px; border-radius: 10px; font-size: 12px; margin-top: 5px; font-weight: 800; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">SENYÖRÜN ŞATOSU</div>
                </div>

                ${slotlar.map(s => `
                    <div id="slot_${s.id}" onclick="window.INSA_ET('${s.id}')" style="position: absolute; width: 75px; height: 75px; border: 3px dashed ${s.renk}; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.3s; cursor: pointer; background: rgba(255,255,255,0.4); transform: translate(${s.pos[0]}px, ${s.pos[1]}px);">
                        <i class="fa-solid ${s.ikon}" style="font-size: 20px; color: ${s.renk}; opacity: 0.8;"></i>
                        <span style="font-size: 9px; font-weight: bold; color: #333; margin-top: 3px; text-align: center;">${s.isim}</span>
                    </div>
                `).join('')}
            </div>

            <div id="structureMenu" style="background: #fff; padding: 15px; border-top: 5px solid #5d4037; display: flex; gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                ${yapilar.map(y => `
                    <div id="card_${y.id}" onclick="window.YAPI_SEC('${y.id}')" style="min-width: 85px; background: #fdf5e6; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #ccc; cursor: pointer; transition: 0.3s;">
                        <i class="fa-solid ${y.ikon}" style="font-size: 24px; color: #5d4037;"></i>
                        <div style="font-size: 11px; font-weight: 900; margin-top: 8px; color: #5d4037 !important;">${y.isim}</div>
                    </div>
                `).join('')}
            </div>

            <div id="yapiBilgi" style="display: none; position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); width: 90%; background: #5d4037; color: white; padding: 15px; border-radius: 10px; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.6); animation: slideUp 0.3s;">
                <h4 id="bilgiBaslik" style="margin: 0 0 8px 0; color: #f1c40f; font-size: 16px;"></h4>
                <p id="bilgiMetin" style="font-size: 13px; margin: 0; line-height: 1.5; color: #fff !important;"></p>
                <button onclick="this.parentElement.style.display='none'" style="margin-top: 15px; background: #f1c40f; border: none; color: #5d4037; padding: 8px 20px; border-radius: 5px; font-size: 13px; font-weight: bold; cursor: pointer;">Anladım</button>
            </div>

            <div id="hataPanel" style="display: none; position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); width: 85%; background: #c0392b; color: white; padding: 15px; border-radius: 10px; z-index: 200; box-shadow: 0 10px 25px rgba(0,0,0,0.6); text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px; margin-bottom: 10px; color: #f1c40f;"></i>
                <h4 style="margin: 0 0 5px 0;">STRATEJİK HATA!</h4>
                <p id="hataMetin" style="font-size: 13px; margin: 0; line-height: 1.5;"></p>
                <button onclick="this.parentElement.style.display='none'" style="margin-top: 15px; background: white; border: none; color: #c0392b; padding: 6px 15px; border-radius: 5px; font-size: 12px; font-weight: bold; cursor: pointer;">Pardon Senyör</button>
            </div>
        </div>
    `;

    window.YAPI_SEC = function(yid) {
        yapilar.forEach(y => {
            document.getElementById(`card_${y.id}`).style.borderColor = "#ccc";
            document.getElementById(`card_${y.id}`).style.background = "#fdf5e6";
        });
        
        seciliYapi = yapilar.find(y => y.id === yid);
        document.getElementById(`card_${yid}`).style.borderColor = "#5d4037";
        document.getElementById(`card_${yid}`).style.background = "#e8d5b5"; 
    };

    window.INSA_ET = function(slotId) {
        if (!seciliYapi) {
            alert("Önce inşa etmek istediğiniz yapıyı alttaki menüden seçin Beyim!");
            return;
        }

        const slot = document.getElementById(`slot_${slotId}`);
        
        // Eğer o slot zaten doluysa işlem yapma
        if (!slot.innerHTML.includes('fa-solid')) return; 

        // STRATEJİ KONTROLÜ
        if (seciliYapi.dogruSlot !== slotId) {
            // Hata göster (Sarsıntı efekti)
            slot.style.transform = slot.style.transform + " rotate(5deg)";
            setTimeout(() => slot.style.transform = slot.style.transform.replace(" rotate(5deg)", ""), 100);
            
            document.getElementById('hataMetin').innerHTML = seciliYapi.hata;
            document.getElementById('hataPanel').style.display = 'block';
            return; // İNŞAATA İZİN VERME
        }

        // DOĞRU YERLEŞİM! İnşaata İzin Ver
        slot.style.border = "none";
        slot.style.background = "white";
        slot.style.boxShadow = "0 5px 10px rgba(0,0,0,0.3)";
        slot.innerHTML = `<i class="fa-solid ${seciliYapi.ikon}" style="font-size: 35px; color: #5d4037;"></i>`;
        
        document.getElementById('bilgiBaslik').innerText = seciliYapi.isim + " Kuruldu!";
        document.getElementById('bilgiMetin').innerHTML = seciliYapi.bilgi;
        document.getElementById('yapiBilgi').style.display = 'block';

        const card = document.getElementById(`card_${seciliYapi.id}`);
        card.style.opacity = "0.2";
        card.style.pointerEvents = "none";
        
        seciliYapi = null;
        insaEdilenler++;

        if (insaEdilenler === 6) {
            window.FEODAL_FINAL();
        }
    };

    window.FEODAL_FINAL = function() {
        setTimeout(() => {
            mapCanvas.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #5d4037; color: white; padding: 30px; text-align: center; font-family: 'Segoe UI', sans-serif;">
                    <div style="max-width: 450px;">
                        <i class="fa-solid fa-crown" style="font-size: 70px; color: #f1c40f; margin-bottom: 20px;"></i>
                        <h2 style="color: #f1c40f; margin-top: 0;">OTARŞİ VE STRATEJİ BAŞARILDI!</h2>
                        <p style="font-size: 15px; line-height: 1.7; color: #fff !important;">
                            Tebrikler Senyör! Hem <b>Coğrafyayı</b> doğru okudunuz hem de malikânenizi dışa bağımlılıktan kurtardınız.<br><br>
                            Artık nehriniz unu öğütüyor, dağınız kılıç dövüyor, ovasınız ekmek veriyor. Feodal Avrupa'da hayatta kalmanın tek yolu bu eşsiz dengedir.
                        </p>
                        <button onclick="window.HARITA_MOTORU['feodal_malikane']()" style="margin-top: 25px; padding: 12px 30px; background: #f1c40f; color: #5d4037; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">Yeniden Yönet</button>
                        <div style="margin-top: 30px; font-size: 11px; opacity: 0.7; color: #ccc;"></div>
                    </div>
                </div>
            `;
        }, 1200);
    };
};
// 31. ARAÇ: MAGNA CARTA (İLERİ SEVİYE LİSE SİMÜLASYONU - ANAKRONİZM VE TUZAKLAR)
// ID: siyaset_u3_magnacarta_v2
window.HARITA_MOTORU["magna_carta"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #8e44ad; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-scale-balanced"></i> Magna Carta: Runnymede Müzakereleri</h4>
            <div id="adaletDurum" style="font-size: 11px; font-weight: bold; color: #fff; background: #2c3e50; padding: 4px; border-radius: 4px;">Hedef: Anakronizme düşmeden (zaman hatası yapmadan) kralı sınırlandır.</div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #8e44ad; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-feather-pointed"></i>Modül: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    // İLERİ SEVİYE KARTLAR (DOĞRULAR VE TUZAKLAR)
    const maddeler = [
        // DOĞRULAR (1215 Bağlamı)
        { id: "vergi", tip: "dogru", baslik: "Vergi Onayı", ikon: "fa-coins", metin: "Kral, Büyük Meclis'in (Baronların) onayı olmadan 'Kalkan Parası' (Scutage) veya yeni vergiler toplayamaz.", aciklama: "<b>Mali Denetim:</b> Kralın cüzdanı meclise bağlandı. Bu madde, ileride 'Parlamento' fikrinin doğmasına zemin hazırlamıştır." },
        { id: "yargi", tip: "dogru", baslik: "Adil Yargılanma", ikon: "fa-gavel", metin: "Özgür hiç kimse, kendi dengi olanların yasal kararı olmadan tutuklanamaz veya mülküne el konulamaz.", aciklama: "<b>Hukuk Devleti (Habeas Corpus):</b> Kralın keyfi tutuklama yetkisi bitmiştir. 'Yargı gücü' kanunlara devredilmiştir." },
        { id: "adalet", tip: "dogru", baslik: "Adaletin Satılamaması", ikon: "fa-handshake-angle", metin: "Adalet kimseye satılamaz, geciktirilemez ve reddedilemez.", aciklama: "<b>Rüşvetin Önlenmesi:</b> Kralın mahkemeleri bir gelir kapısı gibi kullanması ve parayı vereni haklı bulması yasaklanmıştır." },
        { id: "kilise", tip: "dogru", baslik: "Kilisenin Özgürlüğü", ikon: "fa-church", metin: "İngiliz Kilisesi özgür olacak ve hakları eksiksiz tanınacaktır.", aciklama: "<b>Dini Denge:</b> Dönemin Papası III. Innocentius çok güçlüydü. Belge, din adamlarının devlet içindeki özerkliğini garanti altına almıştır." },
        
        // TUZAKLAR (Lise Seviyesi Anakronizm ve Yanılgılar)
        { id: "esitlik", tip: "tuzak", baslik: "Sınıf Eşitliği", ikon: "fa-users-slash", metin: "Serfler (Köylüler) dahil tüm İngiltere halkı mutlak olarak eşittir.", hataBaslik: "TARİHSEL YANILGI (Kavram Hatası)", hataMetin: "Magna Carta halka değil, <b>'Özgür Adamlara' (Baronlar, Tüccarlar, Rahipler)</b> haklar vermiştir. Nüfusun çoğunluğunu oluşturan Serfler (toprağa bağlı köylüler) bu haklardan faydalanamadı. Mutlak eşitlik çok daha modern bir kavramdır!" },
        { id: "kuvvetler", tip: "tuzak", baslik: "Kuvvetler Ayrılığı", ikon: "fa-code-branch", metin: "Yasama, Yürütme ve Yargı güçleri birbirinden tamamen ayrılacaktır.", hataBaslik: "ANAKRONİZM (Zaman Hatası)", hataMetin: "Bu kavramı 18. yüzyılda <b>Montesquieu</b> ortaya atmıştır! 1215 yılında kuvvetler ayrılığı yoktur, sadece kralın mutlak yetkilerinin 'ortaklaşa' kullanılması (Meclis onayı) vardır." },
        { id: "cumhuriyet", tip: "tuzak", baslik: "Cumhuriyetin İlanı", ikon: "fa-building-columns", metin: "Monarşi yıkılacak ve halk kendi yöneticilerini oylamayla seçecektir.", hataBaslik: "ANAKRONİZM (Zaman Hatası)", hataMetin: "Magna Carta kralı devirmeyi değil, kralı kanunlarla sınırlandırmayı (Meşruti Monarşiye doğru ilk adımı) hedefler. İngiltere hala bir krallıktır." },
        { id: "laiklik", tip: "tuzak", baslik: "Laik Devlet", ikon: "fa-book-open-reader", metin: "Kilise devlet işlerine karışmayacak ve din ile devlet ayrılacaktır.", hataBaslik: "ANAKRONİZM (Zaman Hatası)", hataMetin: "Orta Çağ'ın zirvesindesiniz! Din ve devlet işlerinin ayrılması (Laiklik) Avrupa'da Fransız İhtilali'nden sonra tartışılmaya başlanmıştır. Aksine Magna Carta, kiliseye özerklik vermiştir." }
    ];

    let dogruSayisi = 0; // Hedef 4
    let kralGucu = 100;
    let baronGucu = 20;
    let yerlesenKartlar = [];

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #e0d6c8; font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
            
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: url('https://www.transparenttextures.com/patterns/aged-paper.png');">
                
                <div style="position: absolute; top: 10px; width: 100%; text-align: center; color: #5d4037; opacity: 0.8; font-weight: bold;">
                    <i>"Hukuk, Kraldan Üstündür."</i>
                </div>

                <div style="position: relative; width: 340px; height: 250px;">
                    <div style="position: absolute; bottom: 0; left: 165px; width: 10px; height: 200px; background: #3e2723; border-radius: 5px;"></div>
                    <div style="position: absolute; bottom: 0; left: 130px; width: 80px; height: 20px; background: #3e2723; border-radius: 10px 10px 0 0;"></div>

                    <div id="teraziCubuk" style="position: absolute; top: 40px; left: 0; width: 340px; height: 12px; background: #5d4037; transform-origin: center center; transform: rotate(-25deg); transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 5px; z-index: 10;">
                        <div style="position: absolute; top: -6px; left: 158px; width: 24px; height: 24px; background: #f1c40f; border-radius: 50%; border: 3px solid #3e2723;"></div>
                        
                        <div id="kefe_kral" style="position: absolute; top: 12px; left: 0; transform-origin: top center; transform: rotate(25deg); transition: transform 1s;">
                            <div style="width: 2px; height: 70px; background: #2c3e50; margin: 0 auto;"></div>
                            <div style="width: 100px; height: 35px; background: #c0392b; border-radius: 0 0 50px 50px; display: flex; align-items: center; justify-content: center; transform: translateX(-49px); box-shadow: 0 10px 15px rgba(0,0,0,0.3);">
                                <i class="fa-solid fa-chess-king" style="color: #f1c40f; font-size: 30px; margin-top: -35px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>
                            </div>
                            <div style="position: absolute; top: 105px; left: -49px; width: 100px; text-align: center; font-weight: 900; font-size: 11px; color: #c0392b; background: rgba(255,255,255,0.7); border-radius: 4px;">KRAL YURTSUZ JOHN</div>
                        </div>

                        <div id="kefe_baron" style="position: absolute; top: 12px; right: 0; transform-origin: top center; transform: rotate(25deg); transition: transform 1s;">
                            <div style="width: 2px; height: 70px; background: #2c3e50; margin: 0 auto;"></div>
                            <div style="width: 100px; height: 35px; background: #2980b9; border-radius: 0 0 50px 50px; display: flex; align-items: center; justify-content: center; transform: translateX(-49px); box-shadow: 0 10px 15px rgba(0,0,0,0.3);">
                                <div id="baronIcerik" style="display: flex; gap: 3px; flex-wrap: wrap; justify-content: center; width: 80px; margin-top: -25px;"></div>
                            </div>
                            <div style="position: absolute; top: 105px; left: -49px; width: 100px; text-align: center; font-weight: 900; font-size: 11px; color: #2980b9; background: rgba(255,255,255,0.7); border-radius: 4px;">BARONLAR & KANUN</div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="maddeMenu" style="background: #3e2723; padding: 15px; border-top: 4px solid #f1c40f; overflow-y: auto; max-height: 40%;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                    ${[...maddeler].sort(() => Math.random() - 0.5).map(m => `
                        <div id="kart_${m.id}" onclick="window.MADDE_ONAYLA('${m.id}')" style="background: #fdf5e6; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #a1887f; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                            <i class="fa-solid ${m.ikon}" style="font-size: 20px; color: #5d4037;"></i>
                            <div style="font-size: 11px; font-weight: 900; margin-top: 8px; color: #5d4037 !important;">${m.baslik}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="modalPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
                <div id="modalIcerik" style="width: 100%; max-width: 450px; background: #fff; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 15px 30px rgba(0,0,0,0.5);">
                    <i id="modalIkon" class="fa-solid" style="font-size: 45px; margin-bottom: 15px;"></i>
                    <h3 id="modalBaslik" style="margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase;"></h3>
                    <p id="modalMetin" style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 20px; text-align: left; padding: 10px; background: #f9f9f9; border-radius: 5px;"></p>
                    <button onclick="document.getElementById('modalPanel').style.display='none'" style="background: #5d4037; color: white; border: none; padding: 10px 30px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">Müzakereye Dön</button>
                </div>
            </div>

            <div id="finalPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(62, 39, 35, 0.95); z-index: 200; align-items: center; justify-content: center; padding: 20px;">
                <div style="max-width: 480px; text-align: center; color: white;">
                    <i class="fa-solid fa-scroll" style="font-size: 70px; color: #f1c40f; margin-bottom: 20px;"></i>
                    <h2 style="color: #f1c40f; margin-top: 0;">MUTLAKİYET SINIRLANDI!</h2>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 5px solid #f1c40f; text-align: left; line-height: 1.6; font-size: 14px;">
                        Tebrikler! Anakronizm tuzaklarına düşmeden 1215 tarihsel bağlamına uygun olarak Magna Carta'yı oluşturdunuz.<br><br>
                        Dünya tarihinde ilk kez bir kral, yetkilerini kendi isteği dışında kanunlara (ve soylulara) devretmiştir. Bu olay <b>Meşrutiyete ve Demokrasiye</b> giden uzun yolun ilk taşıdır.
                    </div>
                    <button onclick="window.HARITA_MOTORU['magna_carta']()" style="margin-top: 25px; padding: 12px 30px; background: #f1c40f; color: #3e2723; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Simülasyonu Sıfırla</button>
                    <div style="margin-top: 30px; font-size: 11px; opacity: 0.5;">Lise Tarih Laboratuvarı - Murat Mutlu</div>
                </div>
            </div>

        </div>
    `;

    function teraziGuncelle() {
        // Matematiksel denge (100 - 100 = 0 derece)
        let fark = kralGucu - baronGucu; // Başlangıç: 100 - 20 = 80
        let aci = fark / 3.2; // 80 / 3.2 = 25 derece sola yatık
        
        document.getElementById('teraziCubuk').style.transform = `rotate(${-aci}deg)`;
        document.getElementById('kefe_kral').style.transform = `rotate(${aci}deg)`;
        document.getElementById('kefe_baron').style.transform = `rotate(${aci}deg)`;
    }

    window.MADDE_ONAYLA = function(mid) {
        if (yerlesenKartlar.includes(mid)) return;

        const madde = maddeler.find(m => m.id === mid);
        
        if (madde.tip === "tuzak") {
            // Hata Modalı
            document.getElementById('modalIkon').className = "fa-solid fa-triangle-exclamation";
            document.getElementById('modalIkon').style.color = "#c0392b";
            document.getElementById('modalBaslik').innerText = madde.hataBaslik;
            document.getElementById('modalBaslik').style.color = "#c0392b";
            document.getElementById('modalMetin').innerHTML = madde.hataMetin;
            document.getElementById('modalPanel').style.display = 'flex';
            
            // Ceza: Kral güçlenir
            kralGucu += 5; 
            teraziGuncelle();
            
            // Kartı hafif kızartıp geri eski haline getir (Tıklandığını anlasın ama yok olmasın)
            const kart = document.getElementById(`kart_${mid}`);
            kart.style.borderColor = "#c0392b";
            setTimeout(() => kart.style.borderColor = "#a1887f", 1000);

        } else {
            // Doğru Madde
            baronGucu += 20; // 4 doğrudan sonra 20+80 = 100.
            yerlesenKartlar.push(mid);
            teraziGuncelle();

            // Kefeye ikon ekle
            document.getElementById('baronIcerik').innerHTML += `<div style="background:#f1c40f; padding:4px; border-radius:4px;"><i class="fa-solid ${madde.ikon}" style="color:#2c3e50; font-size:12px;"></i></div>`;

            // Kartı yok et (Silikleştir)
            const kart = document.getElementById(`kart_${mid}`);
            kart.style.opacity = "0.2";
            kart.style.pointerEvents = "none";
            kart.style.background = "#bdc3c7";

            // Bilgi Modalı
            document.getElementById('modalIkon').className = "fa-solid fa-check-double";
            document.getElementById('modalIkon').style.color = "#27ae60";
            document.getElementById('modalBaslik').innerText = "DOĞRU HAMLE: " + madde.baslik;
            document.getElementById('modalBaslik').style.color = "#27ae60";
            document.getElementById('modalMetin').innerHTML = madde.aciklama;
            document.getElementById('modalPanel').style.display = 'flex';

            dogruSayisi++;

            if (dogruSayisi === 4) {
                setTimeout(() => {
                    document.getElementById('modalPanel').style.display = 'none';
                    document.getElementById('finalPanel').style.display = 'flex';
                }, 3000);
            }
        }
    };
};
// 32. ARAÇ: İPEK YOLU TİCARET SİMÜLASYONU (İLERİ SEVİYE LİSE MODÜLÜ)
// ID: ticaret_u3_yollar_v3_lise
window.HARITA_MOTORU["ticaret_duraklari"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #d35400; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-gem"></i> İpek Yolu: Kervanbaşı Simülatörü</h4>
            <div id="ticaretDurum" style="font-size: 12px; font-weight: bold; color: #fff; background: #2c3e50; padding: 5px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; padding: 5px 15px;">
                <span><i class="fa-solid fa-map-location-dot"></i> Hedef: Ticaret Ağını Tamamla</span>
                <span id="sermayeEkran" style="color: #f1c40f; font-size: 14px;"><i class="fa-solid fa-coins"></i> 1000 Altın</span>
            </div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #d35400; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-feather-pointed"></i>Modül: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    const styleObj = document.createElement('style');
    styleObj.innerHTML = `
        @keyframes pulseAlert { 0% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(241, 196, 15, 0); } 100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); } }
        .aktif-durak { animation: pulseAlert 1.5s infinite; background: #f1c40f !important; border-color: #2c3e50 !important; transform: translate(-50%, -50%) scale(1.1); z-index: 15 !important; }
        .durak-isim { position: absolute; top: 25px; width: 100px; text-align: center; font-size: 10px; font-weight: 900; color: #2c3e50; background: rgba(255,255,255,0.8); border-radius: 3px; padding: 2px; }
    `;
    document.head.appendChild(styleObj);

    let sermaye = 1000;
    
    // LİSE SEVİYESİ 6 KİLİT MEKAN
    const duraklar = [
        { 
            id: "sinir", isim: "Karahanlı Sınırı", pos: [20, 15],
            soru: "Maveraünnehir sınırındasın. Önceden sadece askeri amaçlı bir sınır karakolu olan bu yapı, sınırların genişlemesiyle güvenli bir ticaret ve konaklama merkezine dönüştürülmüş. İlk molanı nerede vereceksin?",
            secenekler: [{id: "kervansaray", ad: "Kervansaray"}, {id: "ribat", ad: "Ribat"}, {id: "han", ad: "Şehir Hanı"}],
            dogruCevap: "ribat",
            hataMesaji: "Kervansaray doğru bir tahmin gibi dursa da, İLK dönem Türk-İslam devletlerinde (Karahanlılar) sınır karakolundan ticarethaneye dönüşen özel yapıların bir adı vardır!",
            bilgi: "<b>Ribat:</b> İlk Türk-İslam devletlerinde (örneğin Karahanlılar) başlangıçta sınır güvenliği için yapılan, sonradan ticari konaklama merkezlerine dönüşen yapılardır."
        },
        { 
            id: "yol_uzeri", isim: "Issız Bozkır", pos: [35, 35],
            soru: "Sınırı geçtin ve ıssız bozkırda günlerdir ilerliyorsun. Hayvanların yoruldu, eşkıya korkusu başladı. Vakıf sistemiyle kurulan ve sana 3 gün ücretsiz yeme-içme-barınma sağlayacak o meşhur menzil yapısına sığınmalısın.",
            secenekler: [{id: "kervansaray", ad: "Kervansaray"}, {id: "arasta", ad: "Arasta"}, {id: "bedesten", ad: "Bedesten"}],
            dogruCevap: "kervansaray",
            hataMesaji: "Bozkırın ortasında Arasta veya Bedesten gibi şehir içi çarşılar bulunmaz. Yolcuları koruyan kale gibi bir yapı aramalısın.",
            bilgi: "<b>Kervansaray:</b> Ana ticaret yolları üzerinde, bir kervanın günlük yürüyüş mesafesinde (menzil) kurulan ve 3 gün ücretsiz hizmet veren devasa konaklama ve güvenlik yapılarıdır."
        },
        { 
            id: "toptanci", isim: "Bursa Girişi", pos: [55, 50],
            soru: "Büyük bir Osmanlı şehrine (Bursa'ya) ulaştın! Develerindeki tonlarca unu ve pamuğu şehre sokmadan önce 'toptan' olarak tarttırman, vergisini ödemen ve toptancılara satman gerekiyor. Nereye gitmelisin?",
            secenekler: [{id: "bedesten", ad: "Bedesten"}, {id: "kapan", ad: "Kapan Hanı"}, {id: "imaret", ad: "İmaret"}],
            dogruCevap: "kapan",
            hataMesaji: "Bedesten kıymetli mallar içindir, İmaret ise aşevidir. Şehre giren tek cins (örneğin sadece un) toptan malların tartıldığı ve fiyatının belirlendiği yeri bulmalısın.",
            bilgi: "<b>Kapan (Kapan Hanı):</b> Şehre dışarıdan gelen malların toptan olarak tartıldığı (Kabban=Büyük Terazi), vergilendirildiği ve perakendecilere dağıtıldığı hallerdir (Örn: Un Kapanı, Yağ Kapanı)."
        },
        { 
            id: "kiymetli", isim: "Şehir Merkezi", pos: [40, 70],
            soru: "Toptan malları sattın ama heybende Şam çeliği kılıçlar, mücevherler ve değerli ipekler kaldı. Bunları satmak ve elde ettiğin altınları güvenle saklamak için şehrin en korunaklı, banka gibi çalışan kapalı çarşısına girmelisin.",
            secenekler: [{id: "arasta", ad: "Arasta"}, {id: "bedesten", ad: "Bedesten"}, {id: "kapan", ad: "Kapan"}],
            dogruCevap: "bedesten",
            hataMesaji: "Arasta sıradan esnaf sokağıdır, altın ve mücevher orada korunamaz. Şehrin ticari kalbi olan kalın duvarlı, kilitli yapıya ihtiyacın var.",
            bilgi: "<b>Bedesten:</b> Şehir merkezinde değerli eşyaların (mücevher, ipek, silah) satıldığı, aynı zamanda tüccarların parasını sakladığı (banka işlevi gören) çok korunaklı kapalı çarşılardır."
        },
        { 
            id: "perakende", isim: "Esnaf Sokağı", pos: [65, 85],
            soru: "Son durak! Elinde kalan standart ayakkabıları ve kumaşları doğrudan halka (perakende) satacaksın. Sadece senin gibi aynı işi yapan esnafın (ayakkabıcıların) karşılıklı dükkanlarının dizildiği o özel sokağa girmelisin.",
            secenekler: [{id: "imaret", ad: "İmaret"}, {id: "kervansaray", ad: "Kervansaray"}, {id: "arasta", ad: "Arasta"}],
            dogruCevap: "arasta",
            hataMesaji: "Halka perakende satış yapmak için aynı meslek grubunun bir arada bulunduğu üstü açık veya kapalı çarşı sokaklarına girmelisin.",
            bilgi: "<b>Arasta:</b> Şehirlerde aynı işi yapan esnaf grubunun (Örn: Bakırcılar, Ayakkabıcılar) yan yana dizildiği perakende alışveriş sokaklarıdır."
        }
    ];

    let aktifDurak = 0;

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #fdf5e6; font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
            
            <div style="flex: 1; position: relative; background: url('https://www.transparenttextures.com/patterns/old-map.png'); border-bottom: 5px solid #d35400;">
                
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
                    <path d="M 15 20 L 35 35 L 50 55 L 70 40 L 85 65" fill="transparent" stroke="#5d4037" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.8"/>
                </svg>

                ${duraklar.map((d, i) => `
                    <div id="nokta_${i}" onclick="window.DURAK_AC(${i})" class="${i === 0 ? 'aktif-durak' : ''}" style="position: absolute; top: ${d.pos[1]}%; left: ${d.pos[0]}%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background: #bdc3c7; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; z-index: 10;">
                        <i id="ikon_${i}" class="fa-solid fa-location-dot" style="color: #2c3e50; font-size: 18px;"></i>
                        <div class="durak-isim">${d.isim}</div>
                    </div>
                `).join('')}

                <div id="kervan" style="position: absolute; top: 15%; left: 15%; transform: translate(-50%, -50%); width: 50px; height: 50px; background: #5d4037; border-radius: 50%; border: 2px solid #f1c40f; color: #f1c40f; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 1.5s ease-in-out; z-index: 20; box-shadow: 0 5px 15px rgba(0,0,0,0.5); pointer-events: none;">
                    <i class="fa-solid fa-camel"></i>
                </div>
            </div>

            <div id="kararPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
                <div style="width: 100%; max-width: 500px; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.8); text-align: center; border-top: 5px solid #d35400;">
                    <div style="margin-bottom: 15px;">
                        <span id="pKonum" style="background: #d35400; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase;"></span>
                    </div>
                    <p id="pSoru" style="font-size: 15px; color: #333; line-height: 1.6; font-weight: 500; margin-bottom: 25px; text-align: left; background: #fdf5e6; padding: 15px; border-radius: 8px; border-left: 4px solid #d35400;"></p>
                    
                    <div id="btnKapsayici" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
                        </div>
                </div>
            </div>

            <div id="bilgiPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 150; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                <div style="max-width: 450px; border: 2px solid #27ae60; background: #1a1a1a; padding: 30px; border-radius: 12px;">
                    <i class="fa-solid fa-check-double" style="font-size: 50px; color: #27ae60; margin-bottom: 15px;"></i>
                    <h3 style="color: #27ae60; margin: 0 0 15px 0;">STRATEJİK BAŞARI!</h3>
                    <p id="bMetin" style="color: #fff; line-height: 1.6; font-size: 14px; text-align: left; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;"></p>
                    <button onclick="window.SONRAKI_DURAK()" style="margin-top: 20px; background: #27ae60; color: #fff; border: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 14px;">Menzile Devam Et</button>
                </div>
            </div>

            <div id="hataPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 200; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                <div style="max-width: 400px; background: #c0392b; padding: 25px; border-radius: 12px; color: white;">
                    <i class="fa-solid fa-sack-xmark" style="font-size: 50px; color: #f1c40f; margin-bottom: 15px;"></i>
                    <h3 style="margin: 0 0 10px 0;">TİCARİ ZARAR! (-200 Altın)</h3>
                    <p id="hMetin" style="font-size: 14px; line-height: 1.5; margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 5px; text-align: left;"></p>
                    <button onclick="document.getElementById('hataPanel').style.display='none'" style="background: white; color: #c0392b; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer;">Zararı Kabullen ve Dön</button>
                </div>
            </div>

            <div id="finalPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(44, 62, 80, 0.95); z-index: 250; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                <div style="max-width: 480px; color: white;">
                    <i class="fa-solid fa-chess-knight" style="font-size: 70px; color: #f1c40f; margin-bottom: 20px;"></i>
                    <h2 style="color: #f1c40f; margin-top: 0; text-transform: uppercase;">İpek Yolu Efsanesi!</h2>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 5px solid #f1c40f; text-align: left; line-height: 1.6; font-size: 14px;">
                        Tebrikler! Kervanını batırmadan İpek Yolu güzergahını tamamladın.<br><br>
                        Bu zorlu yolculukta <b>Ribat, Kervansaray, Kapan, Bedesten ve Arasta</b> arasındaki o ince farkları yaşayarak öğrendin. Kalan Sermayen: <span id="finalSermaye" style="color: #f1c40f; font-weight: bold;"></span>
                    </div>
                    <button onclick="window.HARITA_MOTORU['ticaret_duraklari']()" style="margin-top: 25px; padding: 12px 30px; background: #f1c40f; color: #2c3e50; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Yeni Sefere Çık</button>
                    <div style="margin-top: 30px; font-size: 11px; opacity: 0.5;">İleri Düzey Tarih Laboratuvarı - Murat Mutlu</div>
                </div>
            </div>
        </div>
    `;

    function sermayeGuncelle() {
        document.getElementById('sermayeEkran').innerHTML = `<i class="fa-solid fa-coins"></i> ${sermaye} Altın`;
        if(sermaye <= 0) {
            document.getElementById('sermayeEkran').style.color = "#c0392b";
            alert("İFLAS ETTİNİZ! Yanlış kararlar kervanın tüm sermayesini tüketti.");
            window.HARITA_MOTORU["ticaret_duraklari"](); // Oyunu sıfırla
        }
    }

    window.DURAK_AC = function(index) {
        if (index !== aktifDurak) {
            document.getElementById('hMetin').innerText = "Kervanınız henüz bu durağa ulaşmadı! Yolculuğa sırayla devam etmelisiniz.";
            document.getElementById('hataPanel').style.display = 'flex';
            return;
        }
        
        const durak = duraklar[index];
        document.getElementById('pKonum').innerText = durak.isim;
        document.getElementById('pSoru').innerText = durak.soru;
        
        // Butonları dinamik oluştur
        const btnAlan = document.getElementById('btnKapsayici');
        btnAlan.innerHTML = "";
        durak.secenekler.forEach(sec => {
            btnAlan.innerHTML += `<button onclick="window.CEVAPLA('${sec.id}')" style="background: #5d4037; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.2s;">${sec.ad}</button>`;
        });

        document.getElementById('kararPanel').style.display = 'flex';
    };

    window.CEVAPLA = function(cevap) {
        const durak = duraklar[aktifDurak];
        if (cevap !== durak.dogruCevap) {
            sermaye -= 200; // Zarar!
            sermayeGuncelle();
            document.getElementById('hMetin').innerText = durak.hataMesaji;
            document.getElementById('hataPanel').style.display = 'flex';
            return;
        }
        
        document.getElementById('kararPanel').style.display = 'none';
        document.getElementById('bMetin').innerHTML = durak.bilgi;
        document.getElementById('bilgiPanel').style.display = 'flex';
    };

    window.SONRAKI_DURAK = function() {
        document.getElementById('bilgiPanel').style.display = 'none';
        
        const bitenDurak = document.getElementById(`nokta_${aktifDurak}`);
        bitenDurak.classList.remove('aktif-durak');
        bitenDurak.style.background = "#27ae60";
        document.getElementById(`ikon_${aktifDurak}`).className = "fa-solid fa-check";
        document.getElementById(`ikon_${aktifDurak}`).style.color = "#fff";

        aktifDurak++;

        if (aktifDurak < duraklar.length) {
            const hedef = duraklar[aktifDurak];
            const kervan = document.getElementById('kervan');
            
            kervan.style.left = hedef.pos[0] + "%";
            kervan.style.top = hedef.pos[1] + "%";

            const yeniDurak = document.getElementById(`nokta_${aktifDurak}`);
            yeniDurak.classList.add('aktif-durak');
        } else {
            setTimeout(() => {
                document.getElementById('finalSermaye').innerText = sermaye + " Altın";
                document.getElementById('finalPanel').style.display = 'flex';
            }, 800);
        }
    };
};
// 33. ARAÇ: KÜRESEL VEBA SALGINI (AFRO-AVRASYA VE SİSTEMLERİN ÇÖKÜŞÜ)
// ID: sosyal_u3_veba_v2_kuresel
window.HARITA_MOTORU["veba_salgini"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-earth-africa"></i> Kara Ölüm: Küresel Yıkım</h4>
            <div id="vebaDurum" style="font-size: 11px; font-weight: bold; color: #fff; background: #c0392b; padding: 4px; border-radius: 4px;">Hedef: Vebanın Afro-Avrasya'ya yayılımını ve sistemleri nasıl yıktığını analiz et.</div>
            <div style="margin-top: 10px;">
                <button id="btnSalginiBaslat" onclick="window.SALGINI_BASLAT()" style="background: #2c3e50; color: #fff; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-biohazard"></i> 1330'lar: Salgını Asya'da Başlat</button>
            </div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #2c3e50; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-feather-pointed"></i> İleri Düzey Analiz: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    const styleObj = document.createElement('style');
    styleObj.innerHTML = `
        @keyframes pulseBubble { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.7); } 50% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(192, 57, 43, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(192, 57, 43, 0); } }
        .veba-balon { animation: pulseBubble 2s infinite; cursor: pointer; transition: 0.3s; z-index: 20; }
        .veba-balon:hover { transform: scale(1.2) !important; }
        .karanlik-bolge { background: rgba(0,0,0,0.7); border-radius: 50%; filter: blur(18px); transition: all 2.5s ease-in-out; position: absolute; z-index: 5; pointer-events: none; }
    `;
    document.head.appendChild(styleObj);

    // KÜRESEL YAYILIM AŞAMALARI
    const bölgeler = [
        { 
            id: "asya", ad: "Orta Asya (1330'lar)", pos: [40, 80], r: 130, 
            ikon: "fa-camel", 
            baslik: "Pax Mongolica'nın Bedeli",
            zincir: "Moğol Barışı Kuruldu <i class='fa-solid fa-arrow-right'></i> İpek Yolu Canlandı <i class='fa-solid fa-arrow-right'></i> Hastalık Küreselleşti",
            aciklama: "Veba yerel bir hastalıktı. Ancak Moğol İmparatorluğu'nun kurduğu güvenli ticaret ağı (Pax Mongolica) sayesinde tüccarlar ve pireler hızla batıya doğru hareket etti. <b>Sonuç:</b> Ticaret yolları ölüm yollarına dönüştü."
        },
        { 
            id: "kefe", ad: "Kırım / Kefe (1347)", pos: [35, 55], r: 100, 
            ikon: "fa-skull-crossbones", 
            baslik: "Tarihin İlk Biyolojik Savaşı",
            zincir: "Altın Orda Kuşattı <i class='fa-solid fa-arrow-right'></i> Vebalı Cesetler Atıldı <i class='fa-solid fa-arrow-right'></i> Cenevizliler Kaçtı",
            aciklama: "Altın Orda ordusu, Ceneviz ticaret kolonisi Kefe'yi kuşattığında vebalı askerlerinin cesetlerini mancınıkla surlardan içeri attı. <b>Sonuç:</b> Hastalıktan kaçan İtalyan gemileri vebayı Avrupa ve Akdeniz'e taşıdı."
        },
        { 
            id: "ortadogu", ad: "Kuzey Afrika ve Ortadoğu (1348)", pos: [65, 50], r: 140, 
            ikon: "fa-wheat-awn-circle-exclamation", 
            baslik: "İslam Dünyasında Çöküş",
            zincir: "İskenderiye'ye Ulaştı <i class='fa-solid fa-arrow-right'></i> Tarım Nüfusu Öldü <i class='fa-solid fa-arrow-right'></i> İkta Sistemi Sarsıldı",
            aciklama: "Veba, Avrupa'dan önce İslam dünyasının kalbi Mısır ve Şam'a vurdu. Tarlayı ekecek çiftçi kalmadığı için Memlüklerin bel kemiği olan 'İkta' (Tarım ve Askeri) sistemi ağır yara aldı. <b>Sonuç:</b> Ortadoğu ekonomisi durma noktasına geldi."
        },
        { 
            id: "avrupa", ad: "Avrupa (1348-1350)", pos: [40, 25], r: 160, 
            ikon: "fa-chess-rook", 
            baslik: "Feodalitenin Yıkılışı",
            zincir: "İş Gücü Azaldı <i class='fa-solid fa-arrow-right'></i> Köylü Ücret Talep Etti <i class='fa-solid fa-arrow-right'></i> Derebeyleri Zayıfladı",
            aciklama: "Avrupa nüfusunun üçte biri yok oldu. İşçi kıtlığı yaşanınca, köle konumundaki Serfler güçlendi ve isyanlar çıkardı. <b>Sonuç:</b> Ücretsiz emeğe dayalı Feodalite (Derebeylik) çatırdadı ve Merkezi Krallıklar güçlenmeye başladı."
        }
    ];

    let patlayanBalon = 0;
    let yayilimSirasi = 0;

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #e0d6c8; font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
            
            <div style="flex: 1; position: relative; background: url('https://www.transparenttextures.com/patterns/old-map.png'); background-color: #d1ccbd;">
                
                <div style="position: absolute; top: 85%; left: 10%; font-weight: 900; color: #7f8c8d; opacity: 0.4; font-size: 14px;">KUZEY AFRİKA</div>
                <div style="position: absolute; top: 60%; left: 55%; font-weight: 900; color: #7f8c8d; opacity: 0.4; font-size: 14px;">ORTADOĞU</div>
                <div style="position: absolute; top: 30%; left: 55%; font-weight: 900; color: #2980b9; opacity: 0.4; font-size: 12px; transform: rotate(-15deg);">KARADENİZ</div>
                <div style="position: absolute; top: 35%; left: 20%; font-weight: 900; color: #7f8c8d; opacity: 0.4; font-size: 16px;">AVRUPA</div>
                <div style="position: absolute; top: 35%; left: 80%; font-weight: 900; color: #7f8c8d; opacity: 0.4; font-size: 16px;">ORTA ASYA</div>

                ${bölgeler.map(b => `
                    <div id="karanlik_${b.id}" class="karanlik-bolge" style="top: ${b.pos[0]}%; left: ${b.pos[1]}%; width: 0px; height: 0px; transform: translate(-50%, -50%); opacity: 0;"></div>
                `).join('')}

                ${bölgeler.map(b => `
                    <div id="balon_${b.id}" onclick="window.BALON_PATLAT('${b.id}')" class="veba-balon" style="display: none; position: absolute; top: ${b.pos[0]}%; left: ${b.pos[1]}%; transform: translate(-50%, -50%); width: 55px; height: 55px; background: #c0392b; border: 3px solid #fff; border-radius: 50%; color: #fff; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                        <i class="fa-solid ${b.ikon}"></i>
                        <div style="position: absolute; top: -25px; width: 140px; text-align: center; font-size: 10px; font-weight: 900; color: #c0392b; background: rgba(255,255,255,0.9); padding: 3px; border-radius: 4px; border: 1px solid #c0392b;">${b.ad}</div>
                    </div>
                `).join('')}
            </div>

            <div id="analizPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
                <div style="width: 100%; max-width: 550px; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.8); text-align: center; border-top: 6px solid #c0392b;">
                    <i id="aIkon" class="fa-solid" style="font-size: 45px; color: #c0392b; margin-bottom: 15px;"></i>
                    <h3 id="aBaslik" style="margin: 0 0 15px 0; color: #2c3e50; font-size: 22px;"></h3>
                    
                    <div id="aZincir" style="background: #2c3e50; color: #f1c40f; padding: 15px; border-radius: 8px; font-size: 14px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;"></div>
                    
                    <p id="aMetin" style="font-size: 15px; color: #333; line-height: 1.6; text-align: left; background: #fdf5e6; padding: 15px; border-radius: 8px; border-left: 4px solid #c0392b;"></p>
                    
                    <button onclick="document.getElementById('analizPanel').style.display='none'; window.SIRADAKI_YAYILIM();" style="margin-top: 20px; background: #c0392b; color: #fff; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer;">Tarihi Analizi Kaydet ve Devam Et</button>
                </div>
            </div>

            <div id="finalPanel" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(44, 62, 80, 0.95); z-index: 200; align-items: center; justify-content: center; padding: 20px; text-align: center;">
                <div style="max-width: 500px; color: white;">
                    <i class="fa-solid fa-earth-africa" style="font-size: 70px; color: #e74c3c; margin-bottom: 20px;"></i>
                    <h2 style="color: #e74c3c; margin-top: 0; text-transform: uppercase;">Dünya Düzeni Değişti!</h2>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 5px solid #e74c3c; text-align: left; line-height: 1.6; font-size: 14px;">
                        Tebrikler! Kara Ölüm'ün sadece Avrupa'yı değil, tüm Eski Dünya'yı nasıl dönüştürdüğünü kanıtladın.<br><br>
                        <b>Evrensel Çıkarım:</b> Veba; Moğol ticaret ağlarıyla Asya'da doğmuş, Kırım'da biyolojik silaha dönüşmüş, Ortadoğu'da İslam ekonomisini çökertmiş ve Avrupa'da Feodaliteyi yıkmıştır. Küreselleşmenin ilk acı meyvesidir.
                    </div>
                    <button onclick="window.HARITA_MOTORU['veba_salgini']()" style="margin-top: 25px; padding: 12px 30px; background: #e74c3c; color: #fff; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Tarihi Baştan Yaz</button>
                    <div style="margin-top: 30px; font-size: 11px; opacity: 0.5;">İleri Seviye Tarih Laboratuvarı - Murat Mutlu</div>
                </div>
            </div>
        </div>
    `;

    window.SALGINI_BASLAT = function() {
        document.getElementById('btnSalginiBaslat').style.display = 'none';
        document.getElementById('vebaDurum').innerText = "Kıtalararası yayılım başladı... Kırmızı balonlara dokunarak sosyal sistemlerin çöküşünü analiz et!";
        window.SIRADAKI_YAYILIM();
    };

    window.SIRADAKI_YAYILIM = function() {
        if (yayilimSirasi < bölgeler.length) {
            const bolge = bölgeler[yayilimSirasi];
            const leke = document.getElementById(`karanlik_${bolge.id}`);
            const balon = document.getElementById(`balon_${bolge.id}`);
            
            // Karanlık Leke Animasyonu
            leke.style.opacity = "1";
            leke.style.width = bolge.r + "px";
            leke.style.height = bolge.r + "px";

            // Biraz bekleyip balonu çıkart
            setTimeout(() => {
                balon.style.display = "flex";
            }, 1200);
            
            yayilimSirasi++;
        } else if (patlayanBalon === 4) {
            // Hepsi bittiyse finali göster
            setTimeout(() => {
                document.getElementById('finalPanel').style.display = 'flex';
            }, 1000);
        }
    };

    window.BALON_PATLAT = function(bid) {
        const bolge = bölgeler.find(b => b.id === bid);
        const balon = document.getElementById(`balon_${bid}`);
        
        // Balonu patlat
        balon.style.background = "#7f8c8d";
        balon.style.borderColor = "#bdc3c7";
        balon.style.animation = "none";
        balon.style.pointerEvents = "none";
        balon.innerHTML = `<i class="fa-solid fa-check-double"></i>`;

        // Analiz Panelini Doldur
        document.getElementById('aIkon').className = `fa-solid ${bolge.ikon}`;
        document.getElementById('aBaslik').innerText = bolge.baslik;
        document.getElementById('aZincir').innerHTML = bolge.zincir;
        document.getElementById('aMetin').innerHTML = bolge.aciklama;
        
        document.getElementById('analizPanel').style.display = 'flex';
        patlayanBalon++;
    };
	
};
// 34. ARAÇ: TAKVİM ÇEVİRME MOTORU
// ID: klasik_u1_takvim_1
window.HARITA_MOTORU["klasik_u1_takvim_1"] = function() {
    const controlsContainer = document.getElementById('mapControlsContainer');
    const mapCanvas = document.getElementById('mapCanvas');

    controlsContainer.style.display = 'block';
    controlsContainer.style.padding = '10px';
    controlsContainer.innerHTML = `
        <div style="text-align: center; position: relative;">
            <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 18px; font-weight: 800;"><i class="fa-solid fa-calendar-days"></i> Tarih Çevirme Kılavuzu</h4>
            <div id="takvimDurum" style="font-size: 11px; font-weight: bold; color: #fff; background: #e67e22; padding: 4px; border-radius: 4px;">Miladi, Hicri ve Rumi takvimler arası matematiksel çeviri.</div>
            <div style="position: absolute; right: 0; top: 0; font-size: 10px; font-style: italic; color: #2c3e50; opacity: 0.7; font-weight: bold;">
                <i class="fa-solid fa-feather-pointed"></i> Çeviri Motoru: Murat Mutlu
            </div>
        </div>
    `;

    window.currentMapInstance = { remove: function() { mapCanvas.innerHTML = ''; mapCanvas.style.display = 'block'; } };

    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #fdf5e6; font-family: 'Segoe UI', sans-serif; position: relative; overflow-y: auto;">
            
            <div style="background: #2c3e50; padding: 25px 20px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                <h3 style="color: #f1c40f; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase;"><i class="fa-solid fa-calculator"></i> Çevrilecek Tarihi Girin</h3>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; max-width: 500px; margin: 0 auto;">
                    <div style="flex: 1; min-width: 120px;">
                        <label style="color: #bdc3c7; font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">Hangi Takvimden?</label>
                        <select id="kaynakTakvim" style="width: 100%; padding: 12px; border-radius: 6px; border: none; background: #fff; font-weight: bold; color: #2c3e50; font-size: 14px; cursor: pointer;">
                            <option value="miladi">Miladi Takvim</option>
                            <option value="hicri">Hicri Takvim</option>
                            <option value="rumi">Rumi Takvim</option>
                        </select>
                    </div>

                    <div style="flex: 1; min-width: 120px;">
                        <label style="color: #bdc3c7; font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">Yıl Giriniz</label>
                        <input type="number" id="girilenYil" placeholder="Örn: 1453" style="width: 100%; padding: 12px; border-radius: 6px; border: none; background: #fff; font-weight: bold; color: #2c3e50; font-size: 14px; text-align: center; box-sizing: border-box;">
                    </div>
                </div>

                <button onclick="window.TAKVIM_CEVIR()" style="margin-top: 20px; background: #e67e22; color: #fff; border: none; padding: 12px 40px; border-radius: 25px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(230, 126, 34, 0.4);"><i class="fa-solid fa-arrows-rotate"></i> Çeviriyi Başlat</button>
            </div>

            <div id="sonucAlani" style="display: none; padding: 20px; max-width: 600px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                <h3 style="color: #2c3e50; text-align: center; margin-top: 0; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">Çeviri Sonuçları ve Sınav Formülleri</h3>
                
                <div id="hedef1Kutu" style="background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 15px; border-left: 5px solid #27ae60;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span id="hedef1Baslik" style="font-weight: 900; color: #27ae60; font-size: 16px;"></span>
                        <span id="hedef1Sonuc" style="background: #27ae60; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 18px;"></span>
                    </div>
                    <div id="hedef1Formul" style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #333; line-height: 1.6;"></div>
                </div>

                <div id="hedef2Kutu" style="background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 5px solid #2980b9;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span id="hedef2Baslik" style="font-weight: 900; color: #2980b9; font-size: 16px;"></span>
                        <span id="hedef2Sonuc" style="background: #2980b9; color: #fff; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 18px;"></span>
                    </div>
                    <div id="hedef2Formul" style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #333; line-height: 1.6;"></div>
                </div>
                
                <div style="margin-top: 20px; font-size: 12px; color: #7f8c8d; text-align: center; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 5px;">
                    <i class="fa-solid fa-circle-info" style="color: #e67e22;"></i> <b>Not:</b> Hicri takvim Ay yılını (354 gün), Miladi ve Rumi takvimler Güneş yılını (365 gün) esas aldığı için aralarında her 33 yılda 1 yıllık fark oluşur (Hicri takvim daha hızlı ilerler). Yukarıdaki işlemler TTK hesaplama yaklaşımına göre (+/- 1 yıl hata payıyla) tam yıl hesaplamasıdır.
                </div>
            </div>

        </div>
    `;

    window.TAKVIM_CEVIR = function() {
        const kaynak = document.getElementById('kaynakTakvim').value;
        const yilInput = document.getElementById('girilenYil').value;

        if (!yilInput || isNaN(yilInput)) {
            alert("Lütfen geçerli bir yıl giriniz!");
            return;
        }

        const yil = parseInt(yilInput);

        if (yil <= 0) {
            alert("Sıfır veya negatif yıllar için (Milattan Önce) takvimler arası doğrudan formül uygulanamaz.");
            return;
        }

        if (kaynak === "miladi" && yil < 622) {
            alert("Miladi 622 yılından (Hicret) öncesi için Hicri takvim hesaplanamaz!");
            return;
        }

        document.getElementById('sonucAlani').style.display = 'block';

        const h1Baslik = document.getElementById('hedef1Baslik');
        const h1Sonuc = document.getElementById('hedef1Sonuc');
        const h1Formul = document.getElementById('hedef1Formul');

        const h2Baslik = document.getElementById('hedef2Baslik');
        const h2Sonuc = document.getElementById('hedef2Sonuc');
        const h2Formul = document.getElementById('hedef2Formul');

        if (kaynak === "miladi") {
            let mEksi622 = yil - 622;
            let pay = Math.floor(mEksi622 / 33);
            let hicriYil = mEksi622 + pay;

            h1Baslik.innerHTML = "<i class='fa-solid fa-moon'></i> Hicri Karşılığı";
            h1Sonuc.innerText = hicriYil;
            h1Formul.innerHTML = `
                <b>MEB Çözüm Adımları (Miladi -> Hicri):</b><br>
                1. Miladi yıldan Hicret yılı çıkarılır: ${yil} - 622 = <span style="color:#c0392b; font-weight:bold;">${mEksi622}</span><br>
                2. Kalan sayı 33'e bölünerek aradaki fark bulunur: ${mEksi622} / 33 ≅ <span style="color:#2980b9; font-weight:bold;">${pay}</span><br>
                3. İlk sayı ile fark toplanır: ${mEksi622} + ${pay} = <span style="color:#27ae60; font-weight:bold;">${hicriYil}</span>
            `;

            let rumiYil = yil - 584;
            h2Baslik.innerHTML = "<i class='fa-solid fa-sun'></i> Rumi Karşılığı";
            h2Sonuc.innerText = rumiYil;
            h2Formul.innerHTML = `
                <b>Çözüm Adımları (Miladi -> Rumi):</b><br>
                1. Rumi takvim, Hicret'i başlangıç alır ama Güneş yılını kullanır. Bu yüzden Miladi takvim ile arasında daima <b>584 yıl</b> fark vardır.<br>
                2. İşlem: ${yil} - 584 = <span style="color:#2980b9; font-weight:bold;">${rumiYil}</span>
            `;
        } 
        else if (kaynak === "hicri") {
            let pay = Math.floor(yil / 33);
            let hEksiPay = yil - pay;
            let miladiYil = hEksiPay + 622;

            h1Baslik.innerHTML = "<i class='fa-solid fa-calendar'></i> Miladi Karşılığı";
            h1Sonuc.innerText = miladiYil;
            h1Formul.innerHTML = `
                <b>Çözüm Adımları (Hicri -> Miladi):</b><br>
                1. Hicri yıl 33'e bölünerek zaman farkı bulunur: ${yil} / 33 ≅ <span style="color:#2980b9; font-weight:bold;">${pay}</span><br>
                2. Bulunan fark Hicri yıldan çıkarılır: ${yil} - ${pay} = <span style="color:#c0392b; font-weight:bold;">${hEksiPay}</span><br>
                3. Çıkan sonuca Hicret yılı eklenir: ${hEksiPay} + 622 = <span style="color:#27ae60; font-weight:bold;">${miladiYil}</span>
            `;

            let rumiYil = miladiYil - 584;
            h2Baslik.innerHTML = "<i class='fa-solid fa-sun'></i> Rumi Karşılığı";
            h2Sonuc.innerText = rumiYil;
            h2Formul.innerHTML = `
                <b>Çözüm Adımları (Hicri -> Rumi):</b><br>
                1. Hicri yılı önce Miladi'ye çeviririz: Bulunan değer <span style="color:#27ae60; font-weight:bold;">${miladiYil}</span>.<br>
                2. Miladi yıldan Rumi farkı çıkarılır: ${miladiYil} - 584 = <span style="color:#2980b9; font-weight:bold;">${rumiYil}</span>
            `;
        }
        else if (kaynak === "rumi") {
            let miladiYil = yil + 584;

            h1Baslik.innerHTML = "<i class='fa-solid fa-calendar'></i> Miladi Karşılığı";
            h1Sonuc.innerText = miladiYil;
            h1Formul.innerHTML = `
                <b>Çözüm Adımları (Rumi -> Miladi):</b><br>
                1. Rumi takvim ile Miladi takvim arasındaki sabit Güneş yılı farkı (584) eklenir.<br>
                2. İşlem: ${yil} + 584 = <span style="color:#27ae60; font-weight:bold;">${miladiYil}</span>
            `;

            let mEksi622 = miladiYil - 622;
            let pay = Math.floor(mEksi622 / 33);
            let hicriYil = mEksi622 + pay;

            h2Baslik.innerHTML = "<i class='fa-solid fa-moon'></i> Hicri Karşılığı";
            h2Sonuc.innerText = hicriYil;
            h2Formul.innerHTML = `
                <b>Çözüm Adımları (Rumi -> Hicri):</b><br>
                1. Rumi yıl önce Miladi'ye çevrilir: <span style="color:#27ae60; font-weight:bold;">${miladiYil}</span>.<br>
                2. Miladi yıldan Hicret çıkarılır: ${miladiYil} - 622 = <span style="color:#c0392b; font-weight:bold;">${mEksi622}</span><br>
                3. 33'e bölünerek Ay-Güneş farkı bulunur: ${mEksi622} / 33 ≅ <span style="color:#2980b9; font-weight:bold;">${pay}</span><br>
                4. Fark eklenir: ${mEksi622} + ${pay} = <span style="color:#27ae60; font-weight:bold;">${hicriYil}</span>
            `;
        }
        
        document.getElementById('sonucAlani').scrollIntoView({ behavior: 'smooth' });
    };
};