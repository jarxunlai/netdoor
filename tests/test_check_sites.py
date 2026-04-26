import json
import tempfile
import unittest
from pathlib import Path

from scripts.check_sites import (
    validate_posts_file,
    validate_profile_file,
    validate_sites_file,
)


class ValidateSitesFileTests(unittest.TestCase):
    def write_sites(self, payload):
        tmpdir = tempfile.TemporaryDirectory()
        path = Path(tmpdir.name) / "sites.json"
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        self.addCleanup(tmpdir.cleanup)
        return path

    def test_accepts_valid_site_registry(self):
        path = self.write_sites(
            [
                {
                    "id": "bca",
                    "name": "BCA",
                    "url": "https://bca.jadelai.top",
                    "description": "生信分析站点",
                }
            ]
        )

        sites = validate_sites_file(path)

        self.assertEqual(sites[0]["id"], "bca")

    def test_rejects_missing_required_field(self):
        path = self.write_sites(
            [
                {
                    "id": "doc",
                    "name": "DOC",
                    "url": "https://doc.jadelai.top",
                }
            ]
        )

        with self.assertRaisesRegex(ValueError, "description"):
            validate_sites_file(path)

    def test_rejects_invalid_url(self):
        path = self.write_sites(
            [
                {
                    "id": "animal",
                    "name": "ANIMAL",
                    "url": "animal.jadelai.top",
                    "description": "动物数据页",
                }
            ]
        )

        with self.assertRaisesRegex(ValueError, "url"):
            validate_sites_file(path)


class ValidateProfileFileTests(unittest.TestCase):
    def write_profile(self, payload, files=None):
        tmpdir = tempfile.TemporaryDirectory()
        root = Path(tmpdir.name)
        path = root / "data" / "profile.json"
        path.parent.mkdir()
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        for relative_path, content in (files or {}).items():
            file_path = root / relative_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            if isinstance(content, bytes):
                file_path.write_bytes(content)
            else:
                file_path.write_text(content, encoding="utf-8")
        self.addCleanup(tmpdir.cleanup)
        return path

    def test_accepts_valid_profile(self):
        path = self.write_profile(
            {
                "name": "jarxuanlai",
                "role": "临床医学在研研究生",
                "bio": "关注科研、代码、生信与工具开发。",
                "avatar": "image/avatar.jpg",
                "github": {
                    "url": "https://github.com/jarxunlai",
                    "label": "GitHub",
                },
                "education": [
                    {
                        "period": "现在",
                        "title": "临床医学在研研究生",
                        "description": "在医学训练中探索科研问题。",
                    }
                ],
                "projects": [
                    {
                        "name": "netdoor",
                        "url": "https://github.com/jarxunlai/netdoor",
                        "description": "个人主页和工具入口。",
                    }
                ],
            },
            {"image/avatar.jpg": b"fake image bytes"},
        )

        profile = validate_profile_file(path)

        self.assertEqual(profile["name"], "jarxuanlai")
        self.assertEqual(profile["avatar"], "image/avatar.jpg")

    def test_rejects_missing_avatar_file(self):
        path = self.write_profile(
            {
                "name": "jarxuanlai",
                "role": "临床医学在研研究生",
                "bio": "关注科研、代码、生信与工具开发。",
                "avatar": "image/avatar.jpg",
                "github": {
                    "url": "https://github.com/jarxunlai",
                    "label": "GitHub",
                },
                "education": [],
                "projects": [],
            }
        )

        with self.assertRaisesRegex(ValueError, "avatar file does not exist"):
            validate_profile_file(path)

    def test_rejects_invalid_github_url(self):
        path = self.write_profile(
            {
                "name": "jarxuanlai",
                "role": "临床医学在研研究生",
                "bio": "关注科研、代码、生信与工具开发。",
                "github": {"url": "github.com/jarxunlai", "label": "GitHub"},
                "education": [],
                "projects": [],
            }
        )

        with self.assertRaisesRegex(ValueError, "github.url"):
            validate_profile_file(path)


class ValidatePostsFileTests(unittest.TestCase):
    def write_posts(self, payload, files=None):
        tmpdir = tempfile.TemporaryDirectory()
        root = Path(tmpdir.name)
        path = root / "data" / "posts.json"
        path.parent.mkdir()
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        for relative_path, content in (files or {}).items():
            file_path = root / relative_path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content, encoding="utf-8")
        self.addCleanup(tmpdir.cleanup)
        return path

    def test_accepts_posts_when_markdown_files_exist(self):
        path = self.write_posts(
            [
                {
                    "id": "hello-blog",
                    "title": "新的个人主页",
                    "date": "2026-04-26",
                    "summary": "记录这个站点的开始。",
                    "tags": ["blog", "科研"],
                    "file": "content/posts/hello-blog.md",
                }
            ],
            {"content/posts/hello-blog.md": "# 新的个人主页\n"},
        )

        posts = validate_posts_file(path)

        self.assertEqual(posts[0]["id"], "hello-blog")

    def test_rejects_missing_markdown_file(self):
        path = self.write_posts(
            [
                {
                    "id": "hello-blog",
                    "title": "新的个人主页",
                    "date": "2026-04-26",
                    "summary": "记录这个站点的开始。",
                    "tags": [],
                    "file": "content/posts/hello-blog.md",
                }
            ]
        )

        with self.assertRaisesRegex(ValueError, "file does not exist"):
            validate_posts_file(path)
