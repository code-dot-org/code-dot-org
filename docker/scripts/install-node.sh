#!/bin/sh
# Install Node from the official nodejs.org tarball, GPG-verified against
# the release team's keyring. The one copy of this recipe: cdo-build and
# cdo-dev both run it, and the version pins live here.
#
# nodejs/release-keys has no tags, so it is pinned by commit. gpgv warns
# "not a detached signature" on the clearsigned file; the Good-signature
# line and the exit status are the check.
set -eux

NODE_VERSION=20.20.2
NODE_KEYS_REF=b28073028e6d6855cfb53bf7fa0137599c01f967

case "$(dpkg --print-architecture)" in
  amd64) node_arch=x64 ;;
  arm64) node_arch=arm64 ;;
  *) echo "unsupported architecture" >&2; exit 1 ;;
esac
tarball="node-v${NODE_VERSION}-linux-${node_arch}.tar.gz"
cd /tmp
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${tarball}"
curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt.asc"
curl -fsSLo nodejs-keyring.kbx \
  "https://github.com/nodejs/release-keys/raw/${NODE_KEYS_REF}/gpg/pubring.kbx"
gpgv --keyring ./nodejs-keyring.kbx --output SHASUMS256.txt SHASUMS256.txt.asc
grep " ${tarball}\$" SHASUMS256.txt | sha256sum -c -
tar -xzf "${tarball}" -C /usr/local --strip-components=1 --no-same-owner
rm -f "${tarball}" SHASUMS256.txt SHASUMS256.txt.asc nodejs-keyring.kbx
corepack enable
node --version
npm --version
