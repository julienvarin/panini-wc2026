#!/usr/bin/env python3
"""Download missing player photos using the MediaWiki pageimages API (more reliable)."""
import os, time, requests, urllib.parse

OUT = os.path.join(os.path.dirname(__file__), "images/players")
os.makedirs(OUT, exist_ok=True)

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA})

def fetch(player_id, article):
    dest = os.path.join(OUT, f"{player_id}.jpg")
    if os.path.exists(dest):
        print(f"SKIP {player_id}")
        return

    # MediaWiki API — pageimages is more reliable than REST summary
    params = {
        "action": "query",
        "titles": article,
        "prop": "pageimages",
        "format": "json",
        "pithumbsize": 400,
        "pilicense": "any",
    }
    try:
        r = SESSION.get("https://en.wikipedia.org/w/api.php", params=params, timeout=15)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        img_url = None
        for page in pages.values():
            thumb = page.get("thumbnail", {})
            if thumb.get("source"):
                img_url = thumb["source"]
                break

        if not img_url:
            # Fallback: try REST summary endpoint
            encoded = urllib.parse.quote(article.replace("_", " "), safe="")
            r2 = SESSION.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}", timeout=15)
            d2 = r2.json()
            t = d2.get("thumbnail", {})
            img_url = t.get("source", "")
            if img_url:
                for size in ["/280px-", "/220px-", "/300px-", "/150px-", "/200px-"]:
                    img_url = img_url.replace(size, "/400px-")

        if not img_url:
            print(f"NO_URL {player_id} {article}")
            return

        r3 = SESSION.get(img_url, timeout=20)
        if len(r3.content) < 3000:
            print(f"TINY {player_id} ({len(r3.content)} bytes)")
            return

        with open(dest, "wb") as f:
            f.write(r3.content)
        print(f"OK {player_id} {article} ({len(r3.content)} bytes)")
        time.sleep(0.15)

    except Exception as e:
        print(f"ERROR {player_id} {article}: {e}")

# Only fetch the IDs that are still missing
MISSING = [
    # England
    (80,  "Dean Henderson (footballer)"),
    (81,  "James Trafford (goalkeeper)"),
    (84,  "Reece James (footballer)"),
    (85,  "Ezri Konsa"),
    (88,  "Djed Spence"),
    (89,  "Tino Livramento"),
    (93,  "Eberechi Eze"),
    (94,  "Elliot Anderson (footballer)"),
    (95,  "Jordan Henderson (footballer)"),
    (96,  "Morgan Rogers (footballer)"),
    (102, "Anthony Gordon (footballer)"),
    (103, "Ivan Toney"),
    (104, "Noni Madueke"),
    # Spain
    (105, "Joan García (goalkeeper)"),
    (107, "Unai Simón"),
    (108, "Àlex Remiro"),
    (109, "Pau Cubarsí"),
    (110, "Dean Huijsen"),
    (111, "Cristhian Mosquera"),
    (113, "Marc Cucurella"),
    (114, "Alejandro Grimaldo"),
    (115, "Pedro Porro"),
    (116, "Marcos Llorente"),
    (117, "Martín Zubimendi"),
    (120, "Carlos Soler (footballer)"),
    (121, "Pablo Fornals"),
    (122, "Fermín López"),
    (124, "Àlex Baena"),
    (125, "Víctor Muñoz (Spanish footballer)"),
    (126, "Ander Barrenetxea"),
    (127, "Lamine Yamal"),
    (128, "Yéremy Pino"),
    # Portugal
    (160, "Rúben Dias"),
    (161, "Gonçalo Inácio"),
    (164, "Diogo Dalot"),
    (166, "Tomás Araújo (footballer)"),
    (167, "Renato Veiga (footballer)"),
    (168, "Vitinha (footballer)"),
    (169, "João Neves (footballer)"),
    (170, "Bruno Fernandes (midfielder)"),
    (171, "Rúben Neves"),
    (172, "Matheus Nunes (footballer)"),
    (173, "Samú Costa (footballer)"),
    (174, "Bernardo Silva"),
    (176, "Francisco Trincão"),
    (178, "Gonçalo Ramos"),
    (179, "Pedro Neto (footballer)"),
    (182, "Gonçalo Guedes"),
    # Netherlands
    (185, "Robin Roefs"),
    (190, "Micky van de Ven"),
    (194, "Jan Paul van Hecke"),
    (196, "Tijjani Reijnders"),
    (198, "Ryan Gravenberch"),
    (201, "Jerdy Schouten"),
    (208, "Noa Lang (footballer)"),
]

print(f"Downloading {len(MISSING)} missing photos...")
for pid, article in MISSING:
    fetch(pid, article)

total = len([f for f in os.listdir(OUT) if f.endswith(".jpg")])
print(f"\nTotal photos: {total} / 208")
