#!/usr/bin/env node
// Downloads player photos from theSportsDB (free, no auth)
// Usage: node download_photos.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'images', 'players');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// All players: [playerId, firstName, lastName, teamName]
const PLAYERS = [
  // BRAZIL
  [1,'Alisson','Becker','Brazil'],
  [2,'Ederson','Moraes','Brazil'],
  [3,'Weverton','','Brazil'],
  [4,'Eder','Militao','Brazil'],
  [5,'Marquinhos','','Brazil'],
  [6,'Gabriel','Magalhaes','Brazil'],
  [7,'Danilo','','Brazil'],
  [8,'Alex','Telles','Brazil'],
  [9,'Renan','Lodi','Brazil'],
  [10,'Casemiro','','Brazil'],
  [11,'Bruno','Guimaraes','Brazil'],
  [12,'Lucas','Paqueta','Brazil'],
  [13,'Gerson','','Brazil'],
  [14,'Vinicius','Junior','Brazil'],
  [15,'Rodrygo','','Brazil'],
  [16,'Raphinha','','Brazil'],
  [17,'Gabriel','Martinelli','Brazil'],
  [18,'Endrick','','Brazil'],
  [19,'Gabriel','Jesus','Brazil'],
  [20,'Richarlison','','Brazil'],
  [21,'Andreas','Pereira','Brazil'],
  [22,'Savinho','','Brazil'],
  // ARGENTINA
  [23,'Emiliano','Martinez','Argentina'],
  [24,'Geronimo','Rulli','Argentina'],
  [25,'Franco','Armani','Argentina'],
  [26,'Cristian','Romero','Argentina'],
  [27,'Lisandro','Martinez','Argentina'],
  [28,'Nicolas','Otamendi','Argentina'],
  [29,'Nahuel','Molina','Argentina'],
  [30,'Marcos','Acuna','Argentina'],
  [31,'Nicolas','Tagliafico','Argentina'],
  [32,'Lionel','Messi','Argentina'],
  [33,'Angel','Di Maria','Argentina'],
  [34,'Rodrigo','De Paul','Argentina'],
  [35,'Leandro','Paredes','Argentina'],
  [36,'Enzo','Fernandez','Argentina'],
  [37,'Exequiel','Palacios','Argentina'],
  [38,'Lautaro','Martinez','Argentina'],
  [39,'Julian','Alvarez','Argentina'],
  [40,'Paulo','Dybala','Argentina'],
  [41,'Alejandro','Garnacho','Argentina'],
  [42,'Thiago','Almada','Argentina'],
  [43,'Giovani','Lo Celso','Argentina'],
  [44,'Valentin','Carboni','Argentina'],
  // FRANCE
  [45,'Mike','Maignan','France'],
  [46,'Alphonse','Areola','France'],
  [47,'Brice','Samba','France'],
  [48,'William','Saliba','France'],
  [49,'Dayot','Upamecano','France'],
  [50,'Ibrahima','Konate','France'],
  [51,'Jules','Kounde','France'],
  [52,'Benjamin','Pavard','France'],
  [53,'Theo','Hernandez','France'],
  [54,'Lucas','Hernandez','France'],
  [55,'Aurelien','Tchouameni','France'],
  [56,'Adrien','Rabiot','France'],
  [57,'Eduardo','Camavinga','France'],
  [58,'Antoine','Griezmann','France'],
  [59,'Warren','Zaire-Emery','France'],
  [60,'Kylian','Mbappe','France'],
  [61,'Ousmane','Dembele','France'],
  [62,'Marcus','Thuram','France'],
  [63,'Kingsley','Coman','France'],
  [64,'Bradley','Barcola','France'],
  [65,'Randal','Kolo Muani','France'],
  [66,'Matteo','Guendouzi','France'],
  // ENGLAND
  [67,'Jordan','Pickford','England'],
  [68,'Aaron','Ramsdale','England'],
  [69,'Nick','Pope','England'],
  [70,'John','Stones','England'],
  [71,'Harry','Maguire','England'],
  [72,'Marc','Guehi','England'],
  [73,'Trent','Alexander-Arnold','England'],
  [74,'Reece','James','England'],
  [75,'Luke','Shaw','England'],
  [76,'Declan','Rice','England'],
  [77,'Jude','Bellingham','England'],
  [78,'Phil','Foden','England'],
  [79,'Kobbie','Mainoo','England'],
  [80,'Conor','Gallagher','England'],
  [81,'Harry','Kane','England'],
  [82,'Bukayo','Saka','England'],
  [83,'Marcus','Rashford','England'],
  [84,'Ollie','Watkins','England'],
  [85,'Jarrod','Bowen','England'],
  [86,'Cole','Palmer','England'],
  [87,'Anthony','Gordon','England'],
  [88,'Levi','Colwill','England'],
  // SPAIN
  [89,'Unai','Simon','Spain'],
  [90,'David','Raya','Spain'],
  [91,'Robert','Sanchez','Spain'],
  [92,'Aymeric','Laporte','Spain'],
  [93,'Robin','Le Normand','Spain'],
  [94,'Pau','Cubarsi','Spain'],
  [95,'Dani','Carvajal','Spain'],
  [96,'Pedro','Porro','Spain'],
  [97,'Alejandro','Balde','Spain'],
  [98,'Rodri','','Spain'],
  [99,'Pedri','','Spain'],
  [100,'Gavi','','Spain'],
  [101,'Fabian','Ruiz','Spain'],
  [102,'Martin','Zubimendi','Spain'],
  [103,'Lamine','Yamal','Spain'],
  [104,'Nico','Williams','Spain'],
  [105,'Alvaro','Morata','Spain'],
  [106,'Mikel','Oyarzabal','Spain'],
  [107,'Ferran','Torres','Spain'],
  [108,'Dani','Olmo','Spain'],
  [109,'Joselu','','Spain'],
  [110,'Bryan','Gil','Spain'],
  // GERMANY
  [111,'Manuel','Neuer','Germany'],
  [112,'Marc','ter Stegen','Germany'],
  [113,'Oliver','Baumann','Germany'],
  [114,'Antonio','Rudiger','Germany'],
  [115,'Nico','Schlotterbeck','Germany'],
  [116,'Jonathan','Tah','Germany'],
  [117,'Joshua','Kimmich','Germany'],
  [118,'David','Raum','Germany'],
  [119,'Maximilian','Mittelstadt','Germany'],
  [120,'Ilkay','Gundogan','Germany'],
  [121,'Florian','Wirtz','Germany'],
  [122,'Jamal','Musiala','Germany'],
  [123,'Leon','Goretzka','Germany'],
  [124,'Leroy','Sane','Germany'],
  [125,'Thomas','Muller','Germany'],
  [126,'Kai','Havertz','Germany'],
  [127,'Serge','Gnabry','Germany'],
  [128,'Niclas','Fullkrug','Germany'],
  [129,'Deniz','Undav','Germany'],
  [130,'Angelo','Stiller','Germany'],
  [131,'Aleksandar','Pavlovic','Germany'],
  [132,'Karim','Adeyemi','Germany'],
  // PORTUGAL
  [133,'Diogo','Costa','Portugal'],
  [134,'Rui','Patricio','Portugal'],
  [135,'Jose','Sa','Portugal'],
  [136,'Ruben','Dias','Portugal'],
  [137,'Pepe','','Portugal'],
  [138,'Antonio','Silva','Portugal'],
  [139,'Joao','Cancelo','Portugal'],
  [140,'Nuno','Mendes','Portugal'],
  [141,'Cristiano','Ronaldo','Portugal'],
  [142,'Bernardo','Silva','Portugal'],
  [143,'Bruno','Fernandes','Portugal'],
  [144,'Vitinha','','Portugal'],
  [145,'Joao','Palhinha','Portugal'],
  [146,'Ruben','Neves','Portugal'],
  [147,'Diogo','Jota','Portugal'],
  [148,'Rafael','Leao','Portugal'],
  [149,'Pedro','Neto','Portugal'],
  [150,'Goncalo','Ramos','Portugal'],
  [151,'Joao','Felix','Portugal'],
  [152,'Francisco','Conceicao','Portugal'],
  [153,'Mateus','Fernandes','Portugal'],
  [154,'Nelson','Semedo','Portugal'],
  // NETHERLANDS
  [155,'Bart','Verbruggen','Netherlands'],
  [156,'Mark','Flekken','Netherlands'],
  [157,'Nick','Olij','Netherlands'],
  [158,'Virgil','van Dijk','Netherlands'],
  [159,'Stefan','de Vrij','Netherlands'],
  [160,'Nathan','Ake','Netherlands'],
  [161,'Denzel','Dumfries','Netherlands'],
  [162,'Jurrien','Timber','Netherlands'],
  [163,'Matthijs','de Ligt','Netherlands'],
  [164,'Frenkie','de Jong','Netherlands'],
  [165,'Tijjani','Reijnders','Netherlands'],
  [166,'Teun','Koopmeiners','Netherlands'],
  [167,'Xavi','Simons','Netherlands'],
  [168,'Ryan','Gravenberch','Netherlands'],
  [169,'Cody','Gakpo','Netherlands'],
  [170,'Donyell','Malen','Netherlands'],
  [171,'Steven','Bergwijn','Netherlands'],
  [172,'Wout','Weghorst','Netherlands'],
  [173,'Memphis','Depay','Netherlands'],
  [174,'Brian','Brobbey','Netherlands'],
  [175,'Quinten','Timber','Netherlands'],
  [176,'Ian','Maatsen','Netherlands'],
];

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function download(url, dest) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(dest); return resolve(false); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { file.close(); resolve(false); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchPlayer(firstName, lastName, teamName) {
  const query = lastName ? `${firstName} ${lastName}` : firstName;
  try {
    const raw = await get(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`);
    const data = JSON.parse(raw);
    if (!data.player) return null;
    // Find best match - prefer same team or exact name
    const exact = data.player.find(p =>
      p.strPlayer?.toLowerCase().includes(lastName?.toLowerCase() || firstName.toLowerCase()) &&
      p.strSport === 'Soccer' && p.strThumb
    );
    const any = data.player.find(p => p.strSport === 'Soccer' && p.strThumb);
    return (exact || any)?.strThumb || null;
  } catch { return null; }
}

async function main() {
  let ok = 0, fail = 0;
  for (const [id, first, last, team] of PLAYERS) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    if (fs.existsSync(dest)) { console.log(`  SKIP ${id} ${first} ${last} (exists)`); ok++; continue; }

    process.stdout.write(`  Fetching ${id} ${first} ${last} (${team})... `);
    const thumbUrl = await searchPlayer(first, last, team);
    if (!thumbUrl) { console.log('no result'); fail++; await sleep(300); continue; }

    const success = await download(thumbUrl, dest);
    if (success) {
      // Verify it's actually an image (>5KB)
      const size = fs.statSync(dest).size;
      if (size < 2000) { fs.unlinkSync(dest); console.log(`tiny file (${size}b)`); fail++; }
      else { console.log(`OK (${Math.round(size/1024)}KB)`); ok++; }
    } else { console.log('download failed'); fail++; }
    await sleep(250); // be polite to the API
  }
  console.log(`\nDone: ${ok} downloaded, ${fail} missing`);
}

main();
