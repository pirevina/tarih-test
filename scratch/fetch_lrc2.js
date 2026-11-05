const https = require('https');

const queries = [
  "I Remember Damien Rice",
  "Diggy Diggy Hole The Yogscast",
  "Every Breath You Take Sting",
  "Father and Son Cat Stevens",
  "Flowers In The Window Travis",
  "The Turtle and the Monkey Half Moon Run"
];

function fetchLrc(query) {
  return new Promise((resolve) => {
    const url = 'https://lrclib.net/api/search?q=' + encodeURIComponent(query);
    https.get(url, { headers: { 'User-Agent': 'TarihPortalLrcFetcher/1.0' } }, (res) => {
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
  }
  const fs = require('fs');
  fs.writeFileSync('c:/Users/belok/Desktop/tarih-portal/scratch/lrc_batch2.json', JSON.stringify(results, null, 2));
  console.log("Saved to scratch/lrc_batch2.json");
}
run();
