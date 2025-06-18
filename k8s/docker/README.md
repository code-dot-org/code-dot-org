# k8s dockerfiles

These dockerfiles are designed for use in our k8s setup, but may have more general applicability too.
The final code-dot-org image is "source included" which means it is 10GB+ and contains all our source
code.

## Building

The easiest way to build the dockerfiles, is to use skaffold, from the root of the repo run:
`skaffold build`

Skaffold is setup to build dependent dockerfiles, and layer them together. If you wish to build
without the skaffold cache, try: `skaffold build --cache-artifacts=false`

If the slow iteration time of our "source included" build is annoying, check out [mimic](../mimic).

# Layers

The dockerfiles are designed in layers, which allows minimal rebuilds when files change:
- code-dot-org: final layer, links all the below layers together AND adds all our source code
- code-dot-org-core: installs core binaries, including ruby and node
- code-dot-org-static: contains many of our large static files, like pngs, jpegs, etc
- code-dot-org-pegasus: contains the pegasus/ directory
- code-dot-org-db-seed: contains level and script files required for seeding the db

