from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlparse

REQUIRED_FIELDS = ("id", "name", "url", "description")


def validate_site(site: object, index: int) -> dict[str, str]:
    if not isinstance(site, dict):
      raise ValueError(f"site[{index}] must be an object")

    missing = [field for field in REQUIRED_FIELDS if not site.get(field)]
    if missing:
      raise ValueError(f"site[{index}] missing required field(s): {', '.join(missing)}")

    parsed = urlparse(str(site["url"]))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
      raise ValueError(f"site[{index}] has invalid url: {site['url']}")

    return {field: str(site[field]) for field in REQUIRED_FIELDS}


def validate_sites_file(path: str | Path) -> list[dict[str, str]]:
    content = Path(path).read_text(encoding="utf-8")
    payload = json.loads(content)

    if not isinstance(payload, list):
      raise ValueError("sites registry must be a JSON array")

    return [validate_site(site, index) for index, site in enumerate(payload)]


def main(argv: list[str]) -> int:
    target = Path(argv[1]) if len(argv) > 1 else Path("data/sites.json")
    try:
      sites = validate_sites_file(target)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
      print(f"ERROR: {exc}", file=sys.stderr)
      return 1

    print(f"OK: validated {len(sites)} site entries from {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
