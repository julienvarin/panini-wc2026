#!/usr/bin/env node
// Supplement download: Wikipedia API for missing players
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'images', 'players');

// Only players without photos yet — with Wikipedia article name guesses
const MISSING = [
  // Argentina (31-44)
  [31,'Nicolas_Tagliafico'],[32,'Lionel_Messi'],[33,'Ángel_Di_María'],[34,'Rodrigo_De_Paul'],
  [35,'Leandro_Paredes'],[36,'Enzo_Fernández_(footballer)'],[37,'Exequiel_Palacios'],
  [38,'Lautaro_Martínez'],[39,'Julián_Álvarez'],[40,'Paulo_Dybala'],[41,'Alejandro_Garnacho'],
  [42,'Thiago_Almada'],[43,'Giovani_Lo_Celso'],[44,'Valentín_Carboni'],
  // France (45-66)
  [45,'Mike_Maignan'],[46,'Alphonse_Aréola'],[47,'Brice_Samba'],[48,'William_Saliba'],
  [49,'Dayot_Upamecano'],[50,'Ibrahima_Konaté_(footballer)'],[51,'Jules_Koundé'],
  [52,'Benjamin_Pavard'],[53,'Theo_Hernández'],[54,'Lucas_Hernández_(footballer)'],
  [55,'Aurélien_Tchouaméni'],[56,'Adrien_Rabiot'],[57,'Eduardo_Camavinga'],
  [58,'Antoine_Griezmann'],[59,'Warren_Zaïre-Emery'],[60,'Kylian_Mbappé'],
  [61,'Ousmane_Dembélé'],[62,'Marcus_Thuram'],[63,'Kingsley_Coman'],[64,'Bradley_Barcola'],
  [65,'Randal_Kolo_Muani'],[66,'Matteo_Guendouzi'],
  // England (67-88)
  [67,'Jordan_Pickford'],[68,'Aaron_Ramsdale'],[69,'Nick_Pope_(footballer)'],
  [70,'John_Stones'],[71,'Harry_Maguire'],[72,'Marc_Guéhi'],
  [73,'Trent_Alexander-Arnold'],[74,'Reece_James_(footballer)'],[75,'Luke_Shaw'],
  [76,'Declan_Rice'],[77,'Jude_Bellingham'],[78,'Phil_Foden'],[79,'Kobbie_Mainoo'],
  [80,'Conor_Gallagher_(footballer)'],[81,'Harry_Kane'],[82,'Bukayo_Saka'],
  [83,'Marcus_Rashford'],[84,'Ollie_Watkins'],[85,'Jarrod_Bowen'],
  [86,'Cole_Palmer_(footballer)'],[87,'Anthony_Gordon_(footballer)'],[88,'Levi_Colwill'],
  // Spain (89-110)
  [89,'Unai_Simón'],[90,'David_Raya'],[91,'Robert_Sánchez_(footballer,_born_1997)'],
  [92,'Aymeric_Laporte'],[93,'Robin_Le_Normand'],[94,'Pau_Cubarsí'],
  [95,'Dani_Carvajal'],[96,'Pedro_Porro'],[97,'Alejandro_Balde'],
  [98,'Rodri_(footballer)'],[99,'Pedri'],[100,'Gavi_(footballer)'],
  [101,'Fabián_Ruiz'],[102,'Martín_Zubimendi'],[103,'Lamine_Yamal'],
  [104,'Nico_Williams'],[105,'Álvaro_Morata'],[106,'Mikel_Oyarzabal'],
  [107,'Ferran_Torres'],[108,'Dani_Olmo'],[109,'Joselu'],[110,'Bryan_Gil'],
  // Germany (111-132)
  [111,'Manuel_Neuer'],[112,'Marc-André_ter_Stegen'],[113,'Oliver_Baumann'],
  [114,'Antonio_Rüdiger'],[115,'Nico_Schlotterbeck'],[116,'Jonathan_Tah'],
  [117,'Joshua_Kimmich'],[118,'David_Raum'],[119,'Maximilian_Mittelstädt'],
  [120,'İlkay_Gündoğan'],[121,'Florian_Wirtz'],[122,'Jamal_Musiala'],
  [123,'Leon_Goretzka'],[124,'Leroy_Sané'],[125,'Thomas_Müller'],
  [126,'Kai_Havertz'],[127,'Serge_Gnabry'],[128,'Niclas_Füllkrug'],
  [129,'Deniz_Undav'],[130,'Angelo_Stiller'],[131,'Aleksandar_Pavlović_(footballer)'],
  [132,'Karim_Adeyemi'],
  // Portugal (133-154)
  [133,'Diogo_Costa_(goalkeeper)'],[134,'Rui_Patrício'],[135,'José_Sá'],
  [136,'Rúben_Dias'],[137,'Pepe_(footballer)'],[138,'António_Silva_(footballer,_born_2003)'],
  [139,'João_Cancelo'],[140,'Nuno_Mendes_(footballer,_born_2002)'],[141,'Cristiano_Ronaldo'],
  [142,'Bernardo_Silva'],[143,'Bruno_Fernandes_(midfielder)'],[144,'Vitinha_(footballer)'],
  [145,'João_Palhinha'],[146,'Rúben_Neves'],[147,'Diogo_Jota'],
  [148,'Rafael_Leão'],[149,'Pedro_Neto'],[150,'Gonçalo_Ramos'],
  [151,'João_Félix'],[152,'Francisco_Conceição_(footballer)'],[153,'Mateus_Fernandes_(footballer)'],
  [154,'Nelson_Semedo'],
  // Netherlands (155-176)
  [155,'Bart_Verbruggen'],[156,'Mark_Flekken'],[157,'Nick_Olij'],
  [158,'Virgil_van_Dijk'],[159,'Stefan_de_Vrij'],[160,'Nathan_Aké'],
  [161,'Denzel_Dumfries'],[162,'Jurriën_Timber'],[163,'Matthijs_de_Ligt'],
  [164,'Frenkie_de_Jong'],[165,'Tijjani_Reijnders'],[166,'Teun_Koopmeiners'],
  [167,'Xavi_Simons'],[168,'Ryan_Gravenberch'],[169,'Cody_Gakpo'],
  [170,'Donyell_Malen'],[171,'Steven_Bergwijn'],[172,'Wout_Weghorst'],
  [173,'Memphis_Depay'],[174,'Brian_Brobbey'],[175,'Quinten_Timber'],
  [176,'Ian_Maatsen'],
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PaniniApp/1.0 (educational project)' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(get(res.headers.location));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'PaniniApp/1.0' } }, res => {
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch{} return resolve(false); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { file.close(); try { fs.unlinkSync(dest); } catch{}; resolve(false); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getWikiPhoto(articleName) {
  try {
    const raw = await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleName)}`);
    const d = JSON.parse(raw);
    return d?.thumbnail?.source || null;
  } catch { return null; }
}

async function main() {
  let ok = 0, fail = 0;
  for (const [id, article] of MISSING) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    if (fs.existsSync(dest)) { ok++; continue; }

    process.stdout.write(`  Wiki ${id} ${article}... `);
    const url = await getWikiPhoto(article);
    if (!url) { console.log('no result'); fail++; await sleep(200); continue; }

    // Make it bigger: replace /280px- or similar with /400px-
    const bigUrl = url.replace(/\/\d+px-/, '/400px-');
    const success = await download(bigUrl, dest);
    if (success) {
      const size = fs.statSync(dest).size;
      if (size < 3000) { fs.unlinkSync(dest); console.log(`tiny (${size}b)`); fail++; }
      else { console.log(`OK (${Math.round(size/1024)}KB)`); ok++; }
    } else {
      // try original url
      const s2 = await download(url, dest);
      if (s2) { console.log(`OK fallback`); ok++; }
      else { console.log('failed'); fail++; }
    }
    await sleep(180);
  }
  console.log(`\nWiki done: ${ok} ok, ${fail} missing`);
}

main();
