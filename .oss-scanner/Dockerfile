# OSS Scanner image for code-dot-org/code-dot-org.
#
# Build context: a fresh clone of this repository (including .git). The
# scanner builds this with network access, then runs the audit OFFLINE on a
# 2 CPU / 8 GB machine, so everything the audit may need is fetched here.
# See .oss-scanner/threat_model.md for what is installed and how to use it.
#
# No secrets are needed or baked in: locals.yml is a copy of the committed
# locals.yml.default and config/test.yml.erb stubs every secret in RAILS_ENV=test.

# Exact Ruby from .ruby-version, taken from the official image. Its binaries
# are built on Debian bookworm and run on Ubuntu 24.04 (newer glibc, same
# library sonames).
FROM docker.io/library/ruby:3.3.12-slim-bookworm@sha256:74f681701c1e7e862d5f143e4a70bdb8b3ed08b2150c6209f54d5972feef517d AS ruby

# Ubuntu 24.04 rather than Debian: it ships MySQL 8.0 (what the app targets),
# and matches the Ubuntu base of docker/ci/Dockerfile.
FROM docker.io/library/ubuntu:24.04@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

ARG NODE_VERSION=20.20.2
ARG NODE_KEYS_REF=b28073028e6d6855cfb53bf7fa0137599c01f967
ARG BUNDLER_VERSION=2.5.17
ARG YARN_VERSION=4.12.0
# Same uv version as docker/build/Dockerfile, from the GitHub release with a
# pinned sha256.
ARG UV_VERSION=0.5.18
ARG UV_SHA256_X86_64=1dbaeffc5cfac769f99700c0fc8c4ef4494a339720c6bf8b79367b1acd701b46
ARG UV_SHA256_AARCH64=a511f609236b9bfc9dedfcb9867ef1d0f1dc23cc2012f9e4e38e0c184657fd31

# COREPACK_NPM_REGISTRY: corepack fetches yarn from the npm registry (where
# the JS deps come from anyway) instead of repo.yarnpkg.com.
# APPS_BUILD_MAX_MEMORY: the Node heap CI gives `yarn build:dist`
# (docker/ci/scripts/prepare_ci_env.sh).
ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    TZ=Etc/UTC \
    RAILS_ENV=test \
    RACK_ENV=test \
    DISABLE_SPRING=1 \
    GEM_HOME=/usr/local/bundle \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_APP_CONFIG=/usr/local/bundle \
    BUNDLE_SILENCE_ROOT_WARNING=1 \
    BUNDLE_JOBS=16 \
    PATH=/usr/local/bundle/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    COREPACK_HOME=/opt/corepack \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    COREPACK_NPM_REGISTRY=https://registry.npmjs.org \
    UV_PYTHON_PREFERENCE=only-system \
    UV_CACHE_DIR=/opt/uv/cache \
    UV_LINK_MODE=copy \
    TURBO_TELEMETRY_DISABLED=1 \
    STORYBOOK_DISABLE_TELEMETRY=1 \
    PUPPETEER_SKIP_DOWNLOAD=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright \
    CYPRESS_INSTALL_BINARY=0 \
    APPS_BUILD_MAX_MEMORY=16384

# System packages:
# - runtime libraries of the copied Ruby (ssl, yaml, ffi, gmp, readline)
# - mysql2 / rmagick build deps; git for git-sourced gems; compilers for
#   native gems and node-gyp
# - python3.12 for fetch-lfs.py and the uv venv (Python Lab package tests)
# - mysql-server-8.0 and redis-server for the optional local services
#   (.oss-scanner/start-services.sh)
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg git git-lfs build-essential pkg-config xz-utils \
      libssl-dev libyaml-dev libffi-dev libgmp-dev libreadline-dev zlib1g-dev \
      libxml2-dev libxslt1-dev \
      libmysqlclient-dev mysql-client mysql-server-8.0 redis-server \
      imagemagick libmagickwand-dev libjemalloc2 \
      python3 python3.12 python3.12-dev libpython3.12 \
      procps locales tzdata unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ruby /usr/local /usr/local
RUN ruby --version && ruby -ropenssl -ryaml -rfiddle -e 'puts OpenSSL::OPENSSL_LIBRARY_VERSION' \
    && gem install bundler -v "${BUNDLER_VERSION}" --no-document

# Node from nodejs.org, GPG-verified exactly as in docker/build/Dockerfile.
RUN set -eux; \
    case "$(dpkg --print-architecture)" in amd64) a=x64;; arm64) a=arm64;; *) exit 1;; esac; \
    t="node-v${NODE_VERSION}-linux-${a}.tar.gz"; cd /tmp; \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${t}"; \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt.asc"; \
    curl -fsSLo nodejs-keyring.kbx "https://raw.githubusercontent.com/nodejs/release-keys/${NODE_KEYS_REF}/gpg/pubring.kbx"; \
    gpgv --keyring ./nodejs-keyring.kbx --output SHASUMS256.txt SHASUMS256.txt.asc; \
    grep " ${t}\$" SHASUMS256.txt | sha256sum -c -; \
    tar -xzf "${t}" -C /usr/local --strip-components=1 --no-same-owner; \
    rm -f "${t}" SHASUMS256.txt SHASUMS256.txt.asc nodejs-keyring.kbx; \
    corepack enable; node --version

RUN set -eux; \
    case "$(dpkg --print-architecture)" in \
      amd64) a=x86_64; sum="${UV_SHA256_X86_64}";; \
      arm64) a=aarch64; sum="${UV_SHA256_AARCH64}";; *) exit 1;; esac; \
    t="uv-${a}-unknown-linux-gnu.tar.gz"; cd /tmp; \
    curl -fsSLO "https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/${t}"; \
    echo "${sum}  ${t}" | sha256sum -c -; \
    tar -xzf "${t}" --strip-components=1 -C /usr/local/bin; rm -f "${t}"; uv --version

# Yarn for frontend/ (apps/ vendors its own copy in apps/.yarn/releases),
# cached by corepack so `yarn` works offline.
RUN corepack install --global "yarn@${YARN_VERSION}" && yarn --version

# Scanner contract: the checkout lives at /src.
COPY . /src
WORKDIR /src

# Local config. Assets are built as for CI's UI tests and production
# (optimize_*_assets default to true): minified webpack bundles, and Rails
# assets precompiled below. With them off, as in CI's unit-test job, Rails
# compiles each dev bundle through Sprockets on first request, which takes
# minutes per page on the audit machine. The queue adapter is the unit-test
# job's, so rake tasks start no job workers. The session cookie is otherwise
# Secure, which a browser never returns over the image's plain HTTP, so every
# sign-in would fail its CSRF check. Studio links otherwise point at
# https://test-studio.code.org, the managed test server; the host is an IP
# because cookie code parses it with PublicSuffix, which rejects "localhost". S3 goes to the
# emulator start-services.sh runs; project code, files and assets live there.
RUN cp locals.yml.default locals.yml \
    && printf '%s\n' '' '# oss-scanner: built assets, as in CI UI tests; queue adapter from CI_JOB=unit_tests' \
         'optimize_rails_assets: true' 'optimize_webpack_assets: true' 'active_job_queue_adapter: :test' \
         '# oss-scanner: plain HTTP on 127.0.0.1:3000' 'no_https_store: true' \
         "override_dashboard: '127.0.0.1:3000'" "default_scheme: 'http:'" \
         '# oss-scanner: local S3 emulator (moto), as docker/developers does with MinIO' \
         'aws_s3_emulated: true' 'aws_s3_endpoint: http://127.0.0.1:9000' \
         'aws_s3_access_key_id: local-development' 'aws_s3_secret_access_key: allstudents' \
         >> locals.yml

# Git LFS. The scanner's clone has LFS *pointer files*, not content: about
# 1.5 GB across locales, test fixtures, images, and the JSON and media that the
# labs load (apps/static). The webpack build and a realistic frontend need all
# of it, so fetch every LFS file from GitHub's public LFS media endpoint at this
# commit, each verified against its pointer's sha256 (.oss-scanner/fetch-lfs.py).
# Then `git lfs install --local`, re-read those index entries from HEAD (which
# drops their recorded pointer-file sizes) and refresh: git runs the LFS clean
# filter, which turns each file back into its identical pointer, so
# `git status` stays clean. No objects are written. (Not `git add`: it would
# touch the 3 GB pack file's mtime and so copy it into a new image layer. The
# clean filter copies every file into .git/lfs/objects; that duplicate is
# deleted.)
# Non-fatal (WARNING) because the step after it keeps Rails bootable without
# them; without them, though, most Ruby tests and the apps/ build fail.
ARG LFS_PATHS="."
RUN python3 .oss-scanner/fetch-lfs.py ${LFS_PATHS} \
    || echo "WARNING: fetch-lfs failed for some files; they stay LFS pointer files"; \
    git lfs install --local \
    && git rm -q -r --cached -- ${LFS_PATHS} && git reset -q -- ${LFS_PATHS} \
    && git update-index -q --refresh \
    && test -z "$(git status --porcelain --untracked-files=no)" \
    || echo "WARNING: git sees LFS-fetched files as changed"; \
    rm -rf .git/lfs/objects

# Any locale file that is still an LFS pointer (only if the fetch above
# failed) would stop Rails from booting: I18n loads every file under
# dashboard/config/locales and a pointer is not a hash. Replace those with an
# empty hash (they then show as modified in `git status`).
RUN grep -rlZ --include='*.yml' --include='*.yaml' --include='*.json' \
      '^version https://git-lfs.github.com/spec/v1' dashboard/config/locales \
    | xargs -0 -r sh -c 'for f; do echo "{}" > "$f"; done; echo "WARNING: stubbed $# LFS pointer locale files"' sh

# Ruby gems, all groups (staging/levelbuilder/adhoc/production add no gems of
# their own; development+test are needed for tests). The full tree is
# present, so the path-gem engines under dashboard/engines/* resolve.
RUN bundle install && bundle check

# Python venv with the dev group (pytest etc.), as `rake install` does for test.
RUN uv sync --frozen --dev && uv run --no-sync python -c 'import neighborhood; print("venv ok")'

# S3 emulator, in its own venv so it cannot disturb the repository's. The
# MinIO image docker/developers uses is no longer on Docker Hub; moto speaks
# the same API, versioning included, and keeps its data in memory.
RUN uv venv /opt/s3-emulator \
    && uv pip install --python /opt/s3-emulator/bin/python 'moto[server]==5.2.5' \
    && /opt/s3-emulator/bin/python -c 'import moto, boto3; print("moto", moto.__version__)'

# JS dependencies. apps/ links frontend/packages/* via portal: and its jest
# tests import their built dist/ output, which the repo's own script builds
# (it also runs `yarn install` in frontend/). Both projects use the
# node-modules linker, so the yarn zip caches (apps/.yarn/cache and the global
# ~/.yarn/berry/cache) are not needed to run anything; dropping them in the
# same layer saves several GB. Re-installing offline is therefore not possible.
RUN cd /src/apps && yarn install --immutable && yarn cache clean --all \
    && ./script/frontend-dependencies.sh \
    && (cd /src/frontend && yarn cache clean --all) \
    && rm -rf /root/.yarn/berry/cache /root/.cache/node-gyp /tmp/*

# Headless Chrome, so the audit can load Studio pages and run lab code the way
# a student's browser does. The version is the Chrome for Testing build that
# the repo's pinned Playwright expects (frontend/node_modules/playwright-core/
# browsers.json), laid out where Playwright looks for its own browser. It is
# fetched from Google's Chrome for Testing bucket rather than by
# `playwright install`, whose CDN is one more host to depend on.
# CHROME_BIN is what apps/ Karma tests use.
RUN set -eux; \
    cd /src/frontend; \
    info=$(node -e "const b=JSON.parse(require('fs').readFileSync('node_modules/playwright-core/browsers.json')).browsers; \
      const c=b.find(x=>x.name==='chromium'), h=b.find(x=>x.name==='chromium-headless-shell'); \
      console.log(c.browserVersion, c.revision, h.revision)"); \
    set -- $info; v=$1; rev=$2; hrev=$3; \
    base="https://storage.googleapis.com/chrome-for-testing-public/$v/linux64"; \
    mkdir -p "$PLAYWRIGHT_BROWSERS_PATH/chromium-$rev" "$PLAYWRIGHT_BROWSERS_PATH/chromium_headless_shell-$hrev"; \
    curl -fsSLo /tmp/chrome.zip "$base/chrome-linux64.zip"; \
    unzip -q /tmp/chrome.zip -d "$PLAYWRIGHT_BROWSERS_PATH/chromium-$rev"; \
    curl -fsSLo /tmp/shell.zip "$base/chrome-headless-shell-linux64.zip"; \
    unzip -q /tmp/shell.zip -d "$PLAYWRIGHT_BROWSERS_PATH/chromium_headless_shell-$hrev"; \
    rm -f /tmp/chrome.zip /tmp/shell.zip; \
    for d in "$PLAYWRIGHT_BROWSERS_PATH/chromium-$rev" "$PLAYWRIGHT_BROWSERS_PATH/chromium_headless_shell-$hrev"; do \
      touch "$d/INSTALLATION_COMPLETE" "$d/DEPENDENCIES_VALIDATED"; done; \
    node node_modules/playwright-core/cli.js install-deps chromium; rm -rf /var/lib/apt/lists/*; \
    ln -sf "$PLAYWRIGHT_BROWSERS_PATH/chromium-$rev/chrome-linux64/chrome" /usr/local/bin/chrome; \
    chrome --headless=new --no-sandbox --disable-gpu --dump-dom 'data:text/html,<p id=ok>chrome ok</p>' | grep -q 'chrome ok'
ENV CHROME_BIN=/usr/local/bin/chrome

# From here on the image is used offline.
ENV UV_OFFLINE=1 \
    UV_FROZEN=1

# Local MySQL 8 + Redis, with dashboard_test prepared the way CI does it
# (schema + fixtures + `seed:test`) and pegasus_test migrated, baked into the
# image so the audit starts fast. Rails needs the DB even to boot, and so do
# parts of the apps/ build (generated routes and region configs), so the
# frontend is built here too, as `rake build` does for CI's UI tests:
# - apps/: `yarn build:dist`, the minified production webpack build, with
#   one worker per CPU. Rails serves it through the dashboard/public/blockly
#   symlink and finds each bundle by apps/build/package/js/manifest.json.
# - frontend/: the Studio app (`rake build:studio`), served through
#   dashboard/public/frontend-studio.
# - dashboard/: `rake assets:precompile` into dashboard/public/assets.
# Then curriculum, about 4 minutes, into dashboard_test_app (TEST_ENV_NUMBER=_app;
# the tests keep a clean dashboard_test): `seed:ui_test` (the UI-test units CI
# seeds, and the shared data units need: games, blocks, standards), the AI
# Foundations course, whose units include Python Lab, and the demo teacher,
# student and section from seed-demo.rb. All of production would take hours.
# If the apps/ build fails, .oss-scanner/Gruntfile.prebuild.js still
# generates what the Jest tests need, but Rails pages will not render.
# Services are stopped at the end; start-services.sh restarts them during
# the audit. The symlinks are those `rake package:apps:symlink` and
# `package:studio:symlink` create for local builds.
RUN ln -sfn ../../apps/build/package dashboard/public/blockly \
    && ln -sfn ../../frontend/apps/studio/dist/frontend-studio dashboard/public/frontend-studio \
    && .oss-scanner/start-services.sh \
    && { (cd apps && APPS_BUILD_WORKERS=$(nproc) yarn build:dist) \
         || { echo "WARNING: apps yarn build:dist failed; falling back to the Jest/CSS prebuild only"; \
              (cd apps && node -e "require('grunt').tasks(['oss-scanner-prebuild'], \
                 {gruntfile: '../.oss-scanner/Gruntfile.prebuild.js', base: '.'})"); }; } \
    && { (cd frontend && yarn build --filter @code-dot-org/studio) \
         || echo "WARNING: Studio frontend build failed; /frontend-studio pages will not load"; } \
    && { (cd dashboard && bundle exec rake assets:precompile) \
         || echo "WARNING: rails assets:precompile failed; Rails pages will not render"; } \
    && { (cd dashboard && export TEST_ENV_NUMBER=_app SKIP_SCRIPT_PRELOAD=1 \
          && bundle exec rake seed:ui_test \
          && bin/rails runner ../.oss-scanner/seed-units.rb ai-foundations-exploring-ai-and-cs-2026 \
          && bin/rails runner ../.oss-scanner/seed-demo.rb ai-foundations-exploring-ai-and-cs-2026 foundations-of-ai-programming-2026) \
         || echo "WARNING: curriculum seed failed; course pages and the demo accounts may be missing"; } \
    ; rc=$?; mysqladmin -uroot shutdown || true; redis-cli -h 127.0.0.1 shutdown nosave || true; \
    pkill -f moto_server || true; \
    rm -rf /tmp/* /root/.cache/*; \
    test $rc = 0 || echo "WARNING: services/frontend build failed (exit $rc): Ruby and JS tests may not run"

RUN bundle exec ruby -e 'puts :ruby_ok' \
    && { test -f apps/build/package/js/manifest.json || echo "WARNING: no webpack manifest; Rails pages will not render"; } \
    && uv run --no-sync python -c 'import neighborhood; print("py_ok")' \
    && node --version && (cd /src/apps && yarn --version) && (cd /src/frontend && yarn --version)
