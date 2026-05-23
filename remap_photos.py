#!/usr/bin/env python3
"""
Remap existing player photos from old IDs (176-sticker era) to new IDs (208-sticker era).
Run once after data.js was updated from 22→26 players per team.
"""
import os, shutil

PHOTOS = os.path.join(os.path.dirname(__file__), "images", "players")

# old_id → new_id  (only players who stayed in the squad but changed ID)
REMAP = {
    # BRAZIL (old 1-22 → new 1-26)
    # 1=Alisson→1, 2=Ederson→2, 3=Weverton→3  (no change)
    4:  None,  # Éder Militão – OUT
    5:  4,     # Marquinhos
    6:  5,     # Gabriel Magalhães
    7:  10,    # Danilo
    8:  None,  # Alex Telles – OUT
    9:  None,  # Renan Lodi – OUT
    10: 14,    # Casemiro
    11: 13,    # Bruno Guimarães
    12: 17,    # Lucas Paquetá
    13: None,  # Gerson – OUT
    14: 20,    # Vinícius Jr.
    15: None,  # Rodrygo – OUT
    16: 18,    # Raphinha
    17: 23,    # Gabriel Martinelli
    18: 25,    # Endrick
    19: None,  # Gabriel Jesus – OUT
    20: None,  # Richarlison – OUT
    21: None,  # Andreas Pereira – OUT
    22: None,  # Savinho – OUT

    # ARGENTINA (old 23-44 → new 27-52)
    23: 27,    # Emiliano Martínez
    24: 28,    # Rulli
    25: 29,    # Armani
    26: 30,    # Cristian Romero
    27: 31,    # Lisandro Martínez
    28: 32,    # Otamendi
    29: 34,    # Nahuel Molina
    30: 35,    # Marcos Acuña
    31: 36,    # Tagliafico
    32: 46,    # Messi
    33: None,  # Di María – OUT of squad
    34: 38,    # De Paul
    35: 41,    # Paredes
    36: 39,    # Enzo Fernández
    37: 42,    # Palacios
    38: 47,    # Lautaro Martínez
    39: 48,    # Julián Álvarez
    40: None,  # Dybala – OUT of squad
    41: 49,    # Garnacho
    42: 44,    # Almada
    43: 43,    # Lo Celso
    44: 45,    # Valentín Carboni

    # FRANCE (old 45-66 → new 53-78)
    45: 53,    # Maignan
    46: None,  # Aréola – OUT
    47: 54,    # Samba
    48: 56,    # Saliba
    49: 57,    # Upamecano
    50: 58,    # Konaté
    51: 59,    # Koundé
    52: None,  # Benjamin Pavard – OUT
    53: 61,    # Theo Hernández
    54: 62,    # Lucas Hernández
    55: 65,    # Tchouaméni
    56: 67,    # Rabiot
    57: None,  # Camavinga – OUT
    58: None,  # Griezmann – OUT
    59: 66,    # Zaïre-Emery
    60: 70,    # Mbappé
    61: 71,    # Dembélé
    62: 72,    # Marcus Thuram
    63: None,  # Coman – OUT
    64: 73,    # Barcola
    65: None,  # Kolo Muani – OUT
    66: None,  # Guendouzi – OUT

    # ENGLAND (old 67-88 → new 79-104)
    67: 79,    # Pickford
    68: None,  # Ramsdale – OUT
    69: None,  # Nick Pope – OUT
    70: 82,    # John Stones
    71: None,  # Maguire – OUT
    72: 83,    # Guéhi
    73: None,  # Trent Alexander-Arnold – OUT
    74: 84,    # Reece James
    75: None,  # Luke Shaw – OUT
    76: 90,    # Declan Rice
    77: 91,    # Bellingham
    78: None,  # Foden – OUT
    79: 92,    # Mainoo
    80: None,  # Conor Gallagher – OUT
    81: 98,    # Kane
    82: 99,    # Saka
    83: 100,   # Rashford
    84: 101,   # Watkins
    85: None,  # Bowen – OUT
    86: None,  # Cole Palmer – OUT
    87: 102,   # Gordon
    88: None,  # Levi Colwill – OUT

    # SPAIN (old 89-110 → new 105-130)
    89:  105,  # Unai Simón
    90:  106,  # Raya
    91:  107,  # Robert Sánchez
    92:  110,  # Laporte
    93:  109,  # Le Normand
    94:  108,  # Cubarsí
    95:  None, # Carvajal – OUT
    96:  112,  # Porro
    97:  111,  # Balde
    98:  116,  # Rodri
    99:  117,  # Pedri
    100: 118,  # Gavi
    101: 119,  # Fabián Ruiz
    102: 120,  # Zubimendi
    103: 124,  # Yamal
    104: 125,  # Nico Williams
    105: None, # Morata – OUT
    106: 126,  # Oyarzabal
    107: 127,  # Ferran Torres
    108: 121,  # Dani Olmo
    109: 130,  # Joselu
    110: 128,  # Bryan Gil

    # GERMANY (old 111-132 → new 131-156)
    111: 131,  # Neuer
    112: None, # ter Stegen – OUT (injured)
    113: 133,  # Baumann
    114: 134,  # Rüdiger
    115: 135,  # Schlotterbeck
    116: 136,  # Tah
    117: 140,  # Kimmich
    118: 141,  # Raum
    119: None, # Mittelstädt – OUT
    120: None, # Gündoğan – OUT
    121: 155,  # Wirtz
    122: 147,  # Musiala
    123: 143,  # Goretzka
    124: 153,  # Sané
    125: None, # Thomas Müller – OUT
    126: 152,  # Havertz
    127: None, # Gnabry – OUT
    128: None, # Füllkrug – OUT
    129: 154,  # Undav
    130: 150,  # Stiller
    131: 149,  # Pavlović
    132: None, # Adeyemi – OUT

    # PORTUGAL (old 133-154 → new 157-182)
    133: 157,  # Diogo Costa
    134: None, # Rui Patrício – OUT (retired)
    135: 159,  # José Sá
    136: 160,  # Rúben Dias
    137: None, # Pepe – OUT (retired)
    138: None, # António Silva – OUT
    139: 162,  # Cancelo
    140: 163,  # Nuno Mendes
    141: 175,  # Ronaldo
    142: 174,  # Bernardo Silva
    143: 170,  # Bruno Fernandes
    144: 168,  # Vitinha
    145: None, # Palhinha – OUT
    146: 171,  # Rúben Neves
    147: None, # Diogo Jota – OUT
    148: 181,  # Rafael Leão
    149: 179,  # Pedro Neto
    150: 178,  # Gonçalo Ramos
    151: 177,  # João Félix
    152: 180,  # Francisco Conceição
    153: None, # Mateus Fernandes – OUT
    154: 165,  # Nélson Semedo

    # NETHERLANDS (old 155-176 → new 183-208)
    155: 183,  # Verbruggen
    156: 184,  # Flekken
    157: None, # Nick Olij – OUT (replaced by Roefs)
    158: 186,  # Virgil van Dijk
    159: 187,  # Stefan de Vrij
    160: 188,  # Nathan Aké
    161: 192,  # Dumfries
    162: 191,  # Jurriën Timber
    163: 189,  # Matthijs de Ligt
    164: 195,  # Frenkie de Jong
    165: 196,  # Reijnders
    166: 197,  # Koopmeiners
    167: 199,  # Xavi Simons
    168: 198,  # Gravenberch
    169: 202,  # Gakpo
    170: 203,  # Malen
    171: 204,  # Bergwijn
    172: 205,  # Weghorst
    173: 206,  # Depay
    174: 207,  # Brobbey
    175: 200,  # Quinten Timber
    176: 193,  # Maatsen
}

def remap():
    # Stage 1: copy all remapped files to a temp location
    temp = os.path.join(PHOTOS, "_remap_tmp")
    os.makedirs(temp, exist_ok=True)

    for old_id, new_id in REMAP.items():
        src = os.path.join(PHOTOS, f"{old_id}.jpg")
        if not os.path.exists(src):
            continue
        if new_id is None:
            print(f"  DELETE {old_id}.jpg (player out of squad)")
            os.remove(src)
        else:
            dst_tmp = os.path.join(temp, f"{new_id}.jpg")
            shutil.copy2(src, dst_tmp)
            print(f"  STAGE  {old_id}.jpg → {new_id}.jpg")

    # Stage 2: remove old files that were staged
    for old_id, new_id in REMAP.items():
        if new_id is None:
            continue
        src = os.path.join(PHOTOS, f"{old_id}.jpg")
        if os.path.exists(src):
            os.remove(src)

    # Stage 3: move staged files to final location
    for fname in os.listdir(temp):
        dst = os.path.join(PHOTOS, fname)
        shutil.move(os.path.join(temp, fname), dst)
        print(f"  PLACE  {fname}")

    os.rmdir(temp)
    print(f"\nDone. Photos in {PHOTOS}:")
    photos = sorted(os.listdir(PHOTOS), key=lambda f: int(f.replace('.jpg','')))
    print(f"  {len(photos)} files: {[p.replace('.jpg','') for p in photos]}")

if __name__ == "__main__":
    remap()
