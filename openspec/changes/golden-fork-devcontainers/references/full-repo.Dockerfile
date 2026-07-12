# syntax=docker/dockerfile:1
#
# cdo-spike-e-full: the "full-repo" ephemeral devcontainer. Extends the
# cdo-spike-c-rails foundation (ruby+gems+mysql server+redis+seeded datadir)
# with: a real `git clone` of the repo (working .git, real LFS content),
# the apps/ webpack build, the frontend/ turbo build, and DB-dependent
# caches (bootsnap, an incremental reseed) warmed against the baked tree.
#
# Node 20 + corepack/yarn 4.12.0 are reused from cdo-spike-d-frontend's
# already-baked toolchain (COPY --from) rather than reinstalled, since that
# image already has NODE_VERSION=20.20.2 matching apps/frontend's
# packageManager pin and a warm /opt/yarn-cache.
#
# Build with (context = this directory, which contains ./repo, a pre-staged
# clean `git clone`):
#   docker buildx build -t cdo-spike-e-full:latest -f Dockerfile .
#
# PITFALL (hit and reverted): an earlier version of this Dockerfile did the
# `git clone` inside a `RUN --mount=type=bind,from=hostrepo` step, bind-mounting
# the live host checkout directly. BuildKit's named `--build-context` eagerly
# fssyncs the ENTIRE directory tree through the client session -- and the host
# checkout has ~30 other git worktrees nested under .claude/worktrees/ (~171GB
# total), none of which .dockerignore covers (there isn't one). That synced
# 8.9GB in 22s before being aborted and was still climbing. Fix: do the `git
# clone --no-hardlinks --no-checkout` + LFS-store-pointed `git checkout` on the
# HOST first (git is git regardless of which side of the Dockerfile it runs
# on), producing a clean, self-contained ~6.2GB directory with nothing but the
# tracked tree at REPO_SHA, THEN treat that as a normal (small, cacheable)
# COPY source. See ./repo -- already staged this way.

FROM cdo-spike-c-rails:latest AS full

ARG UID=1000
ARG GID=1000

SHELL ["/bin/bash", "-euxo", "pipefail", "-c"]

# --- Node 20 + corepack/yarn 4.12.0 (reused from cdo-spike-d-frontend) -----
#
# PITFALL (hit and fixed): `COPY --from=... /usr/local/bin/yarn /usr/local/bin/yarn`
# names a symlink as the COPY source directly -- Docker dereferences that and
# writes the *target's content* as a new plain file at the destination, not a
# symlink. `dist/yarn.js` etc. use `require('./lib/...')` relative to their
# own real location; baked as a dereferenced plain file at /usr/local/bin/yarn,
# that relative require resolves against /usr/local/bin instead and dies with
# MODULE_NOT_FOUND. Fix: copy the real `node` binary and the `node_modules`
# directory (both copy cleanly -- neither COPY source path is itself a
# symlink), then recreate the bin symlinks with `ln`, matching the source
# image's own `ls -la /usr/local/bin` targets exactly.
USER root
COPY --from=cdo-spike-d-frontend:latest /usr/local/bin/node /usr/local/bin/node
COPY --from=cdo-spike-d-frontend:latest /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sfn node /usr/local/bin/nodejs \
 && ln -sfn ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -sfn ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
 && ln -sfn ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
 && ln -sfn ../lib/node_modules/corepack/dist/yarn.js /usr/local/bin/yarn \
 && ln -sfn ../lib/node_modules/corepack/dist/yarnpkg.js /usr/local/bin/yarnpkg \
 && ln -sfn ../lib/node_modules/corepack/dist/pnpm.js /usr/local/bin/pnpm \
 && ln -sfn ../lib/node_modules/corepack/dist/pnpx.js /usr/local/bin/pnpx

COPY --from=cdo-spike-d-frontend:latest --chown=${UID}:${GID} /opt/corepack /opt/corepack
COPY --from=cdo-spike-d-frontend:latest --chown=${UID}:${GID} /opt/yarn-cache /opt/yarn-cache

ENV NODE_VERSION=20.20.2 \
    COREPACK_HOME=/opt/corepack \
    YARN_GLOBAL_FOLDER=/opt/yarn-cache

USER cdo
WORKDIR /code-dot-org

# --- bake the full repo tree: real .git, real LFS content, no worktree pointer
#
# `./repo` (build context) is a standalone `git clone --no-hardlinks
# --no-checkout` of the host repo, checked out at REPO_SHA with `git checkout`
# run under `git config lfs.storage <host .git/lfs>` so LFS blobs smudge from
# the local store (no network fetch) -- done on the host, see Dockerfile
# header. A straight COPY of a *worktree*'s .git would instead copy a pointer
# file (one line, referencing the main repo's .git/worktrees/<name>), broken
# once detached from that main repo -- this is a real, self-contained clone.
COPY --chown=${UID}:${GID} repo/ /code-dot-org/
COPY --chown=${UID}:${GID} locals.yml /code-dot-org/locals.yml

# --- apps/ build (webpack) --------------------------------------------------
RUN cd apps && time CI=true yarn install --immutable
RUN cd apps && time CI=true yarn build

# symlinks `rake build` would otherwise make (k8s/docker/code-dot-org.dockerfile)
RUN ln -sfn /code-dot-org/apps/build/package /code-dot-org/dashboard/public/blockly \
 && ln -sfn /code-dot-org/dashboard/test/ui /code-dot-org/dashboard/public/ui_test

# --- frontend/ build (turbo) -------------------------------------------------
RUN cd frontend && time yarn install
RUN cd frontend && time yarn build

# --- warm DB-dependent caches against the now-baked tree --------------------
# Starts mysqld+redis on the baked (non-volume) datadir, materializes
# bootsnap/tmp caches, reseeds so the DB matches the baked tree's curriculum
# exactly (the datadir was seeded against whatever commit cdo-spike-c-rails
# was built from -- reseed brings it current to REPO_SHA), then shuts both
# down cleanly so the layer closes with no stray sockets/pids.
RUN <<EOF
  mysqld --no-defaults --datadir=/opt/mysql-data --socket=/opt/mysql-data/mysqld.sock \
    --pid-file=/opt/mysql-data/mysqld.pid --log-error=/opt/mysql-data/error.log \
    --port=3306 --bind-address=127.0.0.1 --skip-log-bin --mysqlx=OFF \
    --innodb-flush-log-at-trx-commit=0 --skip-innodb-doublewrite \
    --innodb-buffer-pool-size=256M &
  until mysqladmin --socket=/opt/mysql-data/mysqld.sock -uroot -ppassword ping --silent 2>/dev/null; do sleep 0.2; done

  redis-server --daemonize no --port 6379 --bind 127.0.0.1 &
  until redis-cli -p 6379 ping 2>/dev/null | grep -q PONG; do sleep 0.2; done

  cd /code-dot-org/dashboard
  time bundle exec rails runner 1
  time bundle exec rake seed:default

  mysqladmin --socket=/opt/mysql-data/mysqld.sock -uroot -ppassword shutdown
  until [ ! -S /opt/mysql-data/mysqld.sock ]; do sleep 0.2; done
  redis-cli -p 6379 shutdown nosave || true
EOF

# --- emulated S3 (minio) -----------------------------------------------------
# Without an S3 endpoint answering at aws_s3_endpoint, most seeded level pages
# 500 at render time: layouts/_header lesson summarize ->
# Services::CurriculumPdfs::Utils.pdf_exists_at? -> AWS::S3.exists_in_bucket
# does a live HEAD against the emulated endpoint (Seahorse NetworkingError;
# measured: /hoc/1, /s/dance|artist|mc|course1/... all 500; only pages without
# lesson-plan headers, e.g. /s/allthethings/..., survived). The k8s dev stack
# solves this with a cdo-minio service + a bucket-setup Job
# (k8s/kustomize/components/minio-setup-s3-job/job.yaml); this bakes the same
# thing in-image: minio server on 127.0.0.1:33993 (the port locals.yml already
# points at), root creds matching locals.yml's aws_s3_access_key_id/secret,
# and the Job's bucket list pre-created via the repo's own aws-sdk-s3 gem.
# Divergence from the Job: no object-lock/versioning -- minio's single-disk
# backend doesn't support them, and nothing local depends on them.
USER root
COPY --chmod=755 minio /usr/local/bin/minio
RUN mkdir -p /opt/minio-data && chown ${UID}:${GID} /opt/minio-data
USER cdo

RUN <<EOF
  MINIO_ROOT_USER=local-development MINIO_ROOT_PASSWORD=allstudents \
    minio server /opt/minio-data --address 127.0.0.1:33993 --quiet &
  MINIO_PID=$!
  until curl -sf http://127.0.0.1:33993/minio/health/ready >/dev/null 2>&1; do sleep 0.2; done

  BUNDLE_GEMFILE=/code-dot-org/Gemfile bundle exec ruby -e '
    require "aws-sdk-s3"
    s3 = Aws::S3::Client.new(
      endpoint: "http://127.0.0.1:33993",
      access_key_id: "local-development",
      secret_access_key: "allstudents",
      region: "us-east-1",
      force_path_style: true,
    )
    %w[cdo-ai cdo-animation-library cdo-restricted cdo-sound-library
       cdo-v3-animations cdo-v3-assets cdo-v3-files cdo-v3-libraries
       cdo-v3-sources videos.code.org].each do |bucket|
      s3.create_bucket(bucket: bucket)
      puts "created bucket #{bucket}"
    end
  '

  kill "${MINIO_PID}"
  wait "${MINIO_PID}" || true
EOF

COPY --chown=${UID}:${GID} --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /code-dot-org
