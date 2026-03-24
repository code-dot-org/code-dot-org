This directory holds the code-dot-org side of the OCI release capsule flow.

`bin/build-context` creates a generated `release-capsule-build/git-<full-commit-sha>/`
tree with this stable layout:

```text
release-capsule-build/
  git-<full-commit-sha>/
    release.yaml
    package/
      helm/...
    metadata/
      provenance.json
      sbom.json
```

The generated directory is the payload pushed to
`ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>`.
