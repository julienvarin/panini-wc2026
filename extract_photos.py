#!/usr/bin/env python3
"""Extract player photos from Google Doc HTML export."""
import re
import base64
import json
from pathlib import Path

HTML_FILE = "/tmp/panini_doc.html"
OUT_DIR = Path(__file__).parent / "images" / "players"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Build player name -> ID mapping from data.js
# We'll match by combining firstName + lastName
PLAYERS = {
    # Brazil (1-26)
    "Alisson": 1, "Ederson": 2, "Weverton": 3,
    "Gabriel Magalhães": 4, "Gabriel": 4, "Bremer": 5, "Marquinhos": 6,
    "Ibañez": 7, "Roger Ibañez": 7, "Léo Pereira": 8, "Leo Pereira": 8,
    "Wesley": 10, "Douglas Santos": 11, "Alex Sandro": 12,
    "Bruno Guimarães": 13, "Bruno Guimaraes": 13, "Casemiro": 14,
    "Fabinho": 16, "Lucas Paquetá": 17, "Lucas Paqueta": 17,
    "Neymar": 18, "Vinícius Jr": 19, "Vinicius Junior": 19, "Vinicius Jr": 19, "Vinícius Júnior": 19, "Vinícius Jr.": 19,
    "Raphinha": 20, "Gabriel Martinelli": 21,
    "Luiz Henrique": 23, "Matheus Cunha": 24,
    "Igor Thiago": 25, "Endrick": 26,

    # Argentina (27-52)
    "Emiliano Martínez": 27, "Emiliano Martinez": 27, "Dibu Martinez": 27,
    "Gerónimo Rulli": 28, "Geronimo Rulli": 28,
    "Juan Musso": 29, "Cristian Romero": 30,
    "Marcos Senesi": 31, "Tomás Palacios": 32, "Tomas Palacios": 32,
    "Nahuel Molina": 33, "Agustín Giay": 34, "Agustin Giay": 34,
    "Nicolás Tagliafico": 35, "Nicolas Tagliafico": 35,
    "Gabriel Rojas": 36, "Máximo Perrone": 37, "Maximo Perrone": 37,
    "Leandro Paredes": 38, "Enzo Fernández": 39, "Enzo Fernandez": 39,
    "Alexis Mac Allister": 40, "Valentín Barco": 41, "Valentin Barco": 41,
    "Exequiel Palacios": 42, "Rodrigo De Paul": 43,
    "Nico Paz": 44, "Thiago Almada": 45,
    "Nicolás González": 46, "Nicolas Gonzalez": 46, "Nico González": 46,
    "Franco Mastantuono": 47, "Giuliano Simeone": 48,
    "Lionel Messi": 49, "Gianluca Prestianni": 50,
    "Julián Álvarez": 51, "Julian Alvarez": 51,
    "José Manuel López": 52, "Jose Manuel Lopez": 52,

    # France (53-78)
    "Mike Maignan": 53, "Robin Risser": 54, "Brice Samba": 55,
    "William Saliba": 56, "Dayot Upamecano": 57,
    "Ibrahima Konaté": 58, "Ibrahima Konate": 58,
    "Maxence Lacroix": 59, "Jules Koundé": 60, "Jules Kounde": 60,
    "Malo Gusto": 61, "Theo Hernández": 62, "Theo Hernandez": 62,
    "Lucas Hernández": 63, "Lucas Hernandez": 63, "Lucas Digne": 64,
    "Aurélien Tchouaméni": 65, "Aurelien Tchouameni": 65,
    "N'Golo Kanté": 66, "N'Golo Kante": 66, "Ngolo Kante": 66,
    "Warren Zaïre-Emery": 67, "Warren Zaire-Emery": 67,
    "Manu Koné": 68, "Manu Kone": 68, "Adrien Rabiot": 69,
    "Rayan Cherki": 70, "Bradley Barcola": 71,
    "Michael Olise": 72, "Désiré Doué": 73, "Desire Doue": 73,
    "Maghnes Akliouche": 74, "Kylian Mbappé": 75, "Kylian Mbappe": 75,
    "Ousmane Dembélé": 76, "Ousmane Dembele": 76,
    "Marcus Thuram": 77, "Jean-Philippe Mateta": 78,

    # England (79-104)
    "Dean Henderson": 79, "James Trafford": 80, "Jordan Pickford": 81,
    "Marc Guéhi": 82, "Marc Guehi": 82, "Jarell Quansah": 83,
    "Ezri Konsa": 84, "John Stones": 85, "Dan Burn": 86,
    "Reece James": 87, "Tino Livramento": 88,
    "Nico O'Reilly": 89, "Djed Spence": 90,
    "Declan Rice": 91, "Kobbie Mainoo": 92,
    "Jordan Henderson": 93, "Elliot Anderson": 94,
    "Jude Bellingham": 95, "Morgan Rogers": 96, "Eberechi Eze": 97,
    "Anthony Gordon": 98, "Marcus Rashford": 99,
    "Bukayo Saka": 100, "Noni Madueke": 101,
    "Harry Kane": 102, "Ollie Watkins": 103, "Ivan Toney": 104,

    # Spain (105-130)
    "Joan García": 105, "Joan Garcia": 105,
    "David Raya": 106, "Unai Simón": 107, "Unai Simon": 107,
    "Pau Cubarsí": 108, "Pau Cubarsi": 108,
    "Dean Huijsen": 109, "Cristhian Mosquera": 110,
    "Aymeric Laporte": 111, "Pedro Porro": 112,
    "Marcos Llorente": 113, "Marc Cucurella": 114,
    "Álex Grimaldo": 115, "Alex Grimaldo": 115,
    "Martín Zubimendi": 116, "Martin Zubimendi": 116,
    "Rodri": 117, "Pedri": 118,
    "Carlos Soler": 119, "Pablo Fornals": 120,
    "Fermín López": 121, "Fermin Lopez": 121,
    "Dani Olmo": 122, "Álex Baena": 123, "Alex Baena": 123,
    "Víctor Muñoz": 124, "Victor Munoz": 124, "Victor Muñoz": 124,
    "Ander Barrenetxea": 125, "Lamine Yamal": 126,
    "Yéremy Pino": 127, "Yeremy Pino": 127,
    "Ferran Torres": 128, "Mikel Oyarzabal": 129,
    "Borja Iglesias": 130,

    # Germany (131-156)
    "Alexander Nübel": 131, "Alexander Nubel": 131,
    "Manuel Neuer": 132, "Oliver Baumann": 133,
    "Nico Schlotterbeck": 134, "Malick Thiaw": 135,
    "Jonathan Tah": 136, "Waldemar Anton": 137,
    "Antonio Rüdiger": 138, "Antonio Rudiger": 138,
    "Nathaniel Brown": 139, "David Raum": 140,
    "Joshua Kimmich": 141, "Aleksandar Pavlović": 142, "Aleksandar Pavlovic": 142,
    "Angelo Stiller": 143, "Felix Nmecha": 144,
    "Nadiem Amiri": 145, "Leon Goretzka": 146,
    "Pascal Groß": 147, "Pascal Gross": 147,
    "Jamal Musiala": 148, "Florian Wirtz": 149,
    "Lennart Karl": 150, "Jamie Leweling": 151,
    "Leroy Sané": 152, "Leroy Sane": 152,
    "Nick Woltemade": 153, "Kai Havertz": 154,
    "Maximilian Beier": 155, "Deniz Undav": 156,

    # Portugal (157-182)
    "Diogo Costa": 157, "Rui Silva": 158, "José Sá": 159, "Jose Sa": 159,
    "Rúben Dias": 160, "Ruben Dias": 160,
    "Gonçalo Inácio": 161, "Goncalo Inacio": 161,
    "Tomás Araújo": 162, "Tomas Araujo": 162,
    "Renato Veiga": 163, "Nuno Mendes": 164,
    "Diogo Dalot": 165, "Matheus Nunes": 166,
    "João Cancelo": 167, "Joao Cancelo": 167,
    "Nélson Semedo": 168, "Nelson Semedo": 168,
    "Vitinha": 169, "Rúben Neves": 170, "Ruben Neves": 170,
    "Samú Costa": 171, "Samu Costa": 171,
    "João Neves": 172, "Joao Neves": 172,
    "Bruno Fernandes": 173, "Francisco Trincão": 174, "Francisco Trincao": 174,
    "Bernardo Silva": 175, "Rafael Leão": 176, "Rafael Leao": 176,
    "Gonçalo Guedes": 177, "Goncalo Guedes": 177,
    "Pedro Neto": 178, "Francisco Conceição": 179, "Francisco Conceicao": 179,
    "João Félix": 180, "Joao Felix": 180,
    "Gonçalo Ramos": 181, "Goncalo Ramos": 181,
    "Cristiano Ronaldo": 182,

    # Netherlands (183-208)
    "Bart Verbruggen": 183, "Mark Flekken": 184, "Justin Bijlow": 185,
    "Micky van de Ven": 186, "Jan Paul van Hecke": 187,
    "Virgil van Dijk": 188, "Nathan Aké": 189, "Nathan Ake": 189,
    "Stefan de Vrij": 190, "Jorrel Hato": 191,
    "Jeremie Frimpong": 192, "Denzel Dumfries": 193,
    "Lutsharel Geertruida": 194, "Ryan Gravenberch": 195,
    "Jerdy Schouten": 196, "Teun Koopmeiners": 197,
    "Tijjani Reijnders": 198, "Kees Smit": 199,
    "Quinten Timber": 200, "Luciano Valente": 201,
    "Xavi Simons": 202, "Cody Gakpo": 203,
    "Noa Lang": 204, "Donyell Malen": 205,
    "Brian Brobbey": 206, "Wout Weghorst": 207,
    "Memphis Depay": 208,
}

# Also handle Brazil Danilo (id 9) vs Argentina Danilo Santos (id 15)
# and Rayan for Brazil (id 22)

with open(HTML_FILE, "r", errors="replace") as f:
    html = f.read()

# Find all img tags with alt text and base64 src
pattern = r'<img\s+alt="([^"]*?)"\s+src="data:image/(jpeg|png);base64,([A-Za-z0-9+/=]+)"'
matches = re.findall(pattern, html)

print(f"Found {len(matches)} images with alt text")

# Track which IDs we've saved
saved = set()
skipped = []
# Track player images vs club badges by size
for alt, fmt, b64data in matches:
    alt_clean = alt.strip()
    data = base64.b64decode(b64data)
    size = len(data)

    # Skip very small images (likely club badges/icons, typically < 5KB)
    if size < 5000:
        continue

    # Try to match alt text to player
    player_id = PLAYERS.get(alt_clean)
    if player_id is None:
        # Try partial matching
        for name, pid in PLAYERS.items():
            if alt_clean.lower() == name.lower():
                player_id = pid
                break
    if player_id is None:
        # Try if alt text contains the player name
        for name, pid in PLAYERS.items():
            if len(name) > 3 and name in alt_clean:
                player_id = pid
                break

    if player_id and player_id not in saved:
        ext = "jpg" if fmt == "jpeg" else "png"
        dest = OUT_DIR / f"{player_id}.jpg"
        with open(dest, "wb") as f:
            f.write(data)
        saved.add(player_id)
        print(f"  OK {player_id:>3} {alt_clean} ({size // 1024}KB)")
    elif player_id is None:
        skipped.append((alt_clean, size))

print(f"\nSaved: {len(saved)} / 208")
if skipped:
    print(f"Unmatched images (>5KB): {len(skipped)}")
    for name, size in skipped[:20]:
        print(f"  ? {name} ({size // 1024}KB)")

# Show missing IDs
missing = set(range(1, 209)) - saved
if missing:
    print(f"\nMissing IDs ({len(missing)}): {sorted(missing)}")
