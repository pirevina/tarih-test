const https = require('https');
const fs = require('fs');

const queries = [
  "Learning To Fly Pink Floyd",
  "Hold On Tom Waits",
  "Immigrant Song Led Zeppelin",
  "Señora Chichera Inti Illimani",
  "All Along The Watchtower Bear McCreary",
  "Ariel Rainbow",
  "Black Masquerade Rainbow",
  "End of the World Blackfield",
  "Burning Bridges Mike Curb Congregation",
  "Burning Heart Survivor"
];

function fetchLrc(query) {
  return new Promise((resolve) => {
    const url = 'https://lrclib.net/api/search?q=' + encodeURIComponent(query);
    https.get(url, { headers: { 'User-Agent': 'TarihPortalLrcFetcher/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve(json[0].syncedLyrics || json[0].plainLyrics || "NOT FOUND");
          } else {
            resolve("NOT FOUND");
          }
        } catch (e) {
          resolve("ERROR");
        }
      });
    }).on('error', () => resolve("ERROR"));
  });
}

async function run() {
  const results = {};
  for (let q of queries) {
    const lrc = await fetchLrc(q);
    results[q] = lrc;
    console.log(`Fetched: ${q} (${lrc === 'NOT FOUND' ? 'NOT FOUND' : 'OK'})`);
  }
  fs.writeFileSync('c:/Users/belok/Desktop/tarih-portal/scratch/lrc_batch3.json', JSON.stringify(results, null, 2));
}
run();
