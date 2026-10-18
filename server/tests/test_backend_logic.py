import unittest
from unittest.mock import patch

import canban
import preview
import storage


class CanbanLogicTests(unittest.TestCase):
    def test_description_contains_contact_details_and_attachment_links(self) -> None:
        description = canban.build_quest_description(
            name="Alice",
            company=None,
            email="alice@example.com",
            phone=None,
            message="Build a prototype",
            attachments=[
                {"original_name": "spec.pdf", "url": "https://files.example/spec.pdf"}
            ],
        )

        self.assertIn("Имя: Alice", description)
        self.assertIn("Компания: -", description)
        self.assertIn("Телефон: -", description)
        self.assertIn("spec.pdf: https://files.example/spec.pdf", description)

    def test_uuid_configuration_list_is_trimmed_and_empty_values_removed(self) -> None:
        self.assertEqual(canban.parse_uuid_list(" first, ,second , "), ["first", "second"])
        self.assertEqual(canban.parse_uuid_list(None), [])


class StorageLogicTests(unittest.TestCase):
    def test_public_url_prefers_configured_public_base(self) -> None:
        with patch.multiple(
            storage,
            S3_PUBLIC_URL_BASE="https://cdn.example/",
            S3_ENDPOINT_URL="https://s3.example",
            S3_BUCKET_NAME="uploads",
            S3_REGION="eu-test-1",
        ):
            self.assertEqual(
                storage.build_public_url("contact/file.pdf"),
                "https://cdn.example/contact/file.pdf",
            )

    def test_public_url_falls_back_to_regional_aws_url(self) -> None:
        with patch.multiple(
            storage,
            S3_PUBLIC_URL_BASE=None,
            S3_ENDPOINT_URL=None,
            S3_BUCKET_NAME="uploads",
            S3_REGION="eu-test-1",
        ):
            self.assertEqual(
                storage.build_public_url("contact/file.pdf"),
                "https://uploads.s3.eu-test-1.amazonaws.com/contact/file.pdf",
            )


class PreviewLogicTests(unittest.TestCase):
    def test_language_resolution_prefers_explicit_candidates(self) -> None:
        previews = {"en": {}, "ru": {}, "de": {}, "zh-TW": {}}
        self.assertEqual(preview.resolve_language(previews, "de-DE", "ru"), "de")
        self.assertEqual(preview.resolve_language(previews, None, "zh-Hant"), "zh-TW")
        self.assertEqual(preview.resolve_language(previews, "unsupported"), "en")

    def test_target_url_is_local_and_keeps_language(self) -> None:
        self.assertEqual(
            preview.target_url("/?project=1", "ru"),
            "https://baxic.ru/?project=1&lang=ru",
        )
        self.assertEqual(
            preview.target_url("https://evil.example", "en"),
            "https://baxic.ru/?lang=en",
        )

    def test_preview_html_escapes_translated_content(self) -> None:
        html = preview.render_preview(
            "ar",
            {"title": 'Baxic "Dev"', "description": "<portfolio>"},
            "https://baxic.ru/?lang=ar",
        )
        self.assertIn('dir="rtl"', html)
        self.assertIn("Baxic &quot;Dev&quot;", html)
        self.assertIn("&lt;portfolio&gt;", html)
        self.assertIn('twitter:card" content="summary_large_image"', html)
        self.assertIn(
            'og:image" content="https://baxic.ru/businesscard-og-preview-v1.jpg"',
            html,
        )
        self.assertIn('og:image:width" content="1024"', html)


if __name__ == "__main__":
    unittest.main()
