import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAMES_DIR = ROOT / "data" / "games"
OUTPUT = ROOT / "data" / "games.json"

items = []
for path in sorted(GAMES_DIR.glob("*.json")):
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("id") and data.get("title"):
            items.append(data)
    except Exception as exc:
        print(f"Skipping {path}: {exc}")

items.sort(key=lambda g: g.get("added", ""), reverse=True)
OUTPUT.write_text(json.dumps({"games": items}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Indexed {len(items)} games.")
