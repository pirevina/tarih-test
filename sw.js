// Önbellek (Cache) adı ve versiyonu. 
// Sitede büyük bir güncelleme yaptığınızda buradaki v1'i v2, v3 olarak değiştirilecek.
const CACHE_NAME = 'bogazici-tarih-v8';

// İnternetsiz çalışması için telefonun hafızasına kaydedilecek dosyalar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './sinif9.html',
  './sinif10.html',
  './sinif11.html',
  './sinif12.html',
  './sosyal_medya.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 1. KURULUM (INSTALL) AŞAMASI
// Service Worker yüklendiğinde belirttiğimiz dosyaları önbelleğe alır.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek başarıyla açıldı ve dosyalar kaydediliyor.');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 2. AKTİVASYON (ACTIVATE) AŞAMASI
// Eski versiyon önbellekleri temizler, hafızayı şişirmez.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eski önbellek siliniyor:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. GETİRME (FETCH) AŞAMASI
// Öğrenci siteye girdiğinde önce internete değil, cihazın hafızasına bakar.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Eğer dosya önbellekte varsa onu ver (İnternetsiz çalışma)
        if (response) {
          return response;
        }
        // Yoksa internetten indirmeye çalış
        return fetch(event.request);
      })
  );
});