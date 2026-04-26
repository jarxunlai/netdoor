from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

SITE_REQUIRED_FIELDS = ("id", "name", "url", "description")
PROFILE_REQUIRED_FIELDS = ("name", "role", "bio", "github", "education", "projects")
POST_REQUIRED_FIELDS = ("id", "title", "date", "summary", "tags", "file")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


def read_json(path: str | Path) -> object:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def validate_url(value: object, label: str) -> str:
    parsed = urlparse(str(value))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"{label} has invalid url: {value}")
    return str(value)


def validate_site(site: object, index: int) -> dict[str, str]:
    if not isinstance(site, dict):
        raise ValueError(f"site[{index}] must be an object")

    missing = [field for field in SITE_REQUIRED_FIELDS if not site.get(field)]
    if missing:
        raise ValueError(f"site[{index}] missing required field(s): {', '.join(missing)}")

    validate_url(site["url"], f"site[{index}].url")
    return {field: str(site[field]) for field in SITE_REQUIRED_FIELDS}


def validate_sites_file(path: str | Path) -> list[dict[str, str]]:
    payload = read_json(path)

    if not isinstance(payload, list):
        raise ValueError("sites registry must be a JSON array")

    return [validate_site(site, index) for index, site in enumerate(payload)]


def validate_labeled_link(link: object, label: str) -> dict[str, str]:
    if not isinstance(link, dict):
        raise ValueError(f"{label} must be an object")
    missing = [field for field in ("url", "label") if not link.get(field)]
    if missing:
        raise ValueError(f"{label} missing required field(s): {', '.join(missing)}")
    return {
        "url": validate_url(link["url"], f"{label}.url"),
        "label": str(link["label"]),
    }


def validate_profile_file(path: str | Path) -> dict[str, object]:
    target = Path(path)
    payload = read_json(target)
    if not isinstance(payload, dict):
        raise ValueError("profile must be a JSON object")

    missing = [field for field in PROFILE_REQUIRED_FIELDS if field not in payload]
    if missing:
        raise ValueError(f"profile missing required field(s): {', '.join(missing)}")

    github = validate_labeled_link(payload["github"], "github")

    education = payload["education"]
    if not isinstance(education, list):
        raise ValueError("education must be a JSON array")
    for index, item in enumerate(education):
        validate_text_fields(item, ("period", "title", "description"), f"education[{index}]")

    projects = payload["projects"]
    if not isinstance(projects, list):
        raise ValueError("projects must be a JSON array")
    for index, project in enumerate(projects):
        validate_text_fields(project, ("name", "url", "description"), f"projects[{index}]")
        validate_url(project["url"], f"projects[{index}].url")

    profile: dict[str, object] = {
        "name": str(payload["name"]),
        "role": str(payload["role"]),
        "bio": str(payload["bio"]),
        "github": github,
        "education": education,
        "projects": projects,
    }
    if payload.get("avatar"):
        profile["avatar"] = validate_asset_file(
            payload["avatar"],
            "avatar",
            project_root_for(target),
            IMAGE_SUFFIXES,
        )
    return profile


def project_root_for(path: Path) -> Path:
    return path.parent.parent if path.parent.name == "data" else path.parent


def validate_asset_file(
    value: object,
    label: str,
    root: Path,
    allowed_suffixes: set[str],
) -> str:
    relative_path = Path(str(value))
    if relative_path.is_absolute() or ".." in relative_path.parts:
        raise ValueError(f"{label} must be a safe relative path")
    if relative_path.suffix.lower() not in allowed_suffixes:
        raise ValueError(f"{label} must use one of: {', '.join(sorted(allowed_suffixes))}")
    asset_path = root / relative_path
    if not asset_path.exists():
        raise ValueError(f"{label} file does not exist: {value}")
    return str(value)


def validate_text_fields(item: object, fields: tuple[str, ...], label: str) -> None:
    if not isinstance(item, dict):
        raise ValueError(f"{label} must be an object")
    missing = [field for field in fields if not item.get(field)]
    if missing:
        raise ValueError(f"{label} missing required field(s): {', '.join(missing)}")


def validate_post(post: object, index: int, root: Path) -> dict[str, object]:
    if not isinstance(post, dict):
        raise ValueError(f"post[{index}] must be an object")

    missing = [field for field in POST_REQUIRED_FIELDS if field not in post]
    if missing:
        raise ValueError(f"post[{index}] missing required field(s): {', '.join(missing)}")

    for field in ("id", "title", "date", "summary", "file"):
        if not post.get(field):
            raise ValueError(f"post[{index}] missing required field: {field}")

    if not DATE_PATTERN.match(str(post["date"])):
        raise ValueError(f"post[{index}] has invalid date: {post['date']}")

    tags = post["tags"]
    if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
        raise ValueError(f"post[{index}].tags must be an array of strings")

    relative_file = Path(str(post["file"]))
    if relative_file.is_absolute() or ".." in relative_file.parts:
        raise ValueError(f"post[{index}].file must be a safe relative path")
    markdown_path = root / relative_file
    if not markdown_path.exists():
        raise ValueError(f"post[{index}] file does not exist: {post['file']}")
    if markdown_path.suffix.lower() != ".md":
        raise ValueError(f"post[{index}].file must point to a Markdown file")

    return {
        "id": str(post["id"]),
        "title": str(post["title"]),
        "date": str(post["date"]),
        "summary": str(post["summary"]),
        "tags": tags,
        "file": str(post["file"]),
    }


def validate_posts_file(path: str | Path) -> list[dict[str, object]]:
    target = Path(path)
    payload = read_json(target)
    if not isinstance(payload, list):
        raise ValueError("posts registry must be a JSON array")

    root = target.parent.parent
    posts = [validate_post(post, index, root) for index, post in enumerate(payload)]
    ids = [post["id"] for post in posts]
    duplicate_ids = sorted({post_id for post_id in ids if ids.count(post_id) > 1})
    if duplicate_ids:
        raise ValueError(f"posts contain duplicate id(s): {', '.join(duplicate_ids)}")
    return posts


def main(argv: list[str]) -> int:
    try:
        if len(argv) > 1:
            sites = validate_sites_file(Path(argv[1]))
            print(f"OK: validated {len(sites)} site entries from {argv[1]}")
            return 0

        sites = validate_sites_file(Path("data/sites.json"))
        profile = validate_profile_file(Path("data/profile.json"))
        posts = validate_posts_file(Path("data/posts.json"))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print(
        "OK: validated "
        f"{len(sites)} site entries, "
        f"profile for {profile['name']}, "
        f"and {len(posts)} post entries"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
