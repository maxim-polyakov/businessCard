import unittest
from unittest.mock import patch

import canban
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


if __name__ == "__main__":
    unittest.main()
