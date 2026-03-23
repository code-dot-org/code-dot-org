#!/usr/bin/env python3

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))

import codeai_release_verify


def payload(**overrides):
    base = {
        "image": {
            "repoURL": "ghcr.io/code-dot-org/code-dot-org",
            "tag": "git-0123456789abcdef0123456789abcdef01234567",
            "digest": "sha256:" + "1" * 64,
        },
        "capsule": {
            "repoURL": "ghcr.io/code-dot-org/codeai-release-capsule",
            "tag": "git-0123456789abcdef0123456789abcdef01234567",
        },
        "release": {
            "gitCommit": "0123456789abcdef0123456789abcdef01234567",
            "imageTag": "git-0123456789abcdef0123456789abcdef01234567",
            "imageDigest": "sha256:" + "1" * 64,
            "packageKind": "kustomize",
            "packagePath": "package/kustomize",
            "packageDigest": "sha256:" + "2" * 64,
        },
    }
    base.update(overrides)
    return base


class ValidateTest(unittest.TestCase):
    def test_accepts_matching_release(self):
        result = codeai_release_verify.validate(payload())
        self.assertTrue(result["ok"])
        self.assertEqual("sha256:" + "2" * 64, result["release"]["packageDigest"])

    def test_rejects_invalid_package_digest(self):
        result = codeai_release_verify.validate(
            payload(release={**payload()["release"], "packageDigest": "not-a-digest"})
        )
        self.assertFalse(result["ok"])
        self.assertEqual("package digest must be a sha256 digest", result["reason"])

    def test_rejects_when_approved_metadata_changes_package_digest(self):
        result = codeai_release_verify.validate(
            payload(
                approved={
                    "gitCommit": "0123456789abcdef0123456789abcdef01234567",
                    "imageDigest": "sha256:" + "1" * 64,
                    "packageKind": "kustomize",
                    "packagePath": "package/kustomize",
                    "packageDigest": "sha256:" + "3" * 64,
                }
            )
        )
        self.assertFalse(result["ok"])
        self.assertEqual(
            "package digest mismatch between approved release metadata and capsule release.yaml",
            result["reason"],
        )


if __name__ == "__main__":
    unittest.main()
