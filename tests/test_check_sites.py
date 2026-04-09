import json
import tempfile
import unittest
from pathlib import Path

from scripts.check_sites import validate_sites_file


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
