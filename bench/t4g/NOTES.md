# t4g.2xlarge

Notes from bringing up a development environment on a `t4g.2xlarge` and
running the unit suites on it. Most of what follows applies to any arm64
host, `m8g` included; the parts that are specific to burstable instances are
called out.

    t4g.2xlarge   Neoverse-N1, 8 cores, 30Gi RAM, 96G gp3 root
    Ubuntu 26.04 LTS (resolute), kernel 7.0.0-1006-aws, aarch64
    ruby 3.2.11, node v20.20.2, yarn 4.12.0, ImageMagick 7.1.2-18
    MySQL 8.0.46 and Redis in containers, per docker/developers

## Setup deviations

SETUP.md targets Ubuntu 20.04 on x86. Six things need doing differently.
The first four apply to any arm64 host.

**1. Use `ports.ubuntu.com`, not the EC2 mirror.** On this instance
`us-east-1.ec2.archive.ubuntu.com` served arm64 packages at about 2 KB/s and
stalled outright on anything large; a package install sat for twelve minutes
without finishing a download. `ports.ubuntu.com` is the arm64 archive and ran
at 8.5 MB/s, which took the same install down to 59 seconds. Rewrite both
URIs — the archive and the security suite — in
`/etc/apt/sources.list.d/ubuntu.sources`.

**2. Override the MySQL image.** `docker/developers/docker-compose.mysql.yml`
pins `mysql/mysql-server:8.0`, an Oracle-published image whose manifest is
amd64 only. It cannot run here. `docker-compose.override.arm64.yml` in the
parent directory substitutes the multi-arch official `mysql:8.0`, which takes
the same `MYSQL_*` environment but ships no `HEALTHCHECK` — and
`dashboard-services` waits on `condition: service_healthy` — so the override
supplies one, and binds both containers to loopback instead of `0.0.0.0`.
Copy it to the repository root as `docker-compose.override.yml`.

The MinIO image the compose file pins is amd64 only as well. Its service also
wants host port 9000, which is the webpack dev server's port
(`apps/bundlerBase.js`), so the two cannot run at once. Bring up
`dashboard-services` (MySQL and Redis) rather than `all-services` unless you
need S3 emulation.

**3. Relax the compiler for two gems.** GCC 14 promoted several warnings to
errors, and Ubuntu 26.04 ships GCC 15. `xxhash` fails on
`-Wincompatible-pointer-types`; `bootsnap` forces `-std=c99`, where `bool`
needs `<stdbool.h>` that C23 would have provided. Setting `CFLAGS` in the
environment does nothing, because gem extconfs overwrite it. A shim on `PATH`
ahead of `/usr/bin` works:

    #!/bin/sh
    exec /usr/bin/gcc "$@" \
      -include stdbool.h \
      -Wno-error=incompatible-pointer-types \
      -Wno-error=implicit-function-declaration \
      -Wno-error=int-conversion \
      -Wno-error=return-mismatch \
      -Wno-error=declaration-missing-parameter-type

with the same file for `g++` minus the `-include` (C++ has a builtin `bool`).
This is the general form of the `thin` workaround SETUP.md already documents.

**4. Fix the endpoint keys `docker/developers` prints.**
`docker-compose.dashboard.yml` tells you to write
`db_endpoint_writer: 127.0.0.1:3306` into `locals.yml`, but
`config/development.yml.erb` defines `db_endpoint_writer` and
`db_endpoint_writer_port` as separate keys. The combined form aborts
`rake build` with

    URI::InvalidComponentError: bad component(expected host component): [127.0.0.1:3306]

Drop the port from the four `db_endpoint_*` values. The `all-services` block
in the root `docker-compose.yml` already emits them correctly, so the two
files disagree with each other.

**5. Add swap.** The image has none, and the webpack build was killed partway
through. 16G of swapfile is enough; the build then finished in 4 minutes.

**6. Chrome exists for arm64.** `chromium-browser` on 26.04 is a snap shim,
but Google publishes `google-chrome-stable_current_arm64.deb`. Install that
and point `CHROME_BIN` at it.

Two smaller notes. SETUP.md's version table is stale — it says ruby 3.1.7 and
node v20.18.3, while the repository pins 3.2.11 and 20. And `libyaml-dev` is
missing from the apt list; Ruby 3.2 will not build psych without it.

## Results

Methodology and output format are described in `../README.md`. Numbers are in
`results.tsv`; `profile.txt`, `calibration.tsv` and `steal.tsv` record the
conditions they were gathered under.

### Interpreting a t4g number

`t4g` is burstable. A ninety-minute saturating run can spend the instance's
CPU credits, after which the hypervisor throttles to baseline — 40% of 8
vCPUs — and the suite times measure the credit balance rather than the
machine. `m8g` has no such mechanism, so a t4g-versus-m8g comparison is only
sound if the t4g run was not throttled.

`calibration.tsv` and `steal.tsv` are how you tell. Flat calibration and
steal near zero mean the run was clean and the numbers are the machine's.
Rising calibration, or steal climbing into the double digits, means the t4g
figure is a lower bound and nothing more.

## Known failures

These are environmental, not defects in the code under test. Expect them on
any host set up this way, and do not read them as regressions.

**`ImageLibTest`, 3 failures** — `test/lib/image_lib_test.rb:98` compares
images by shelling out to `compare -metric ae` and testing the output for
string equality with `'0'`. ImageMagick 7 prints `0 (0)` where ImageMagick 6
printed `0`, so identical images compare as different. Reproduce directly:

    compare -metric ae a.png a.png null:

Ubuntu dropped ImageMagick 6 after 24.04, so 26.04 hosts hit this. rmagick
itself is fine on ImageMagick 7 — it builds, writes PNGs, and has PANGO —
despite 4.2.5 predating IM7 support.

**`lib/cdo/rack/test_optimize.rb`, 2 failures** — asserts exact optimized
byte sizes. Every `image_optim` helper binary is absent (`optipng`,
`pngcrush`, `gifsicle`, `jpegoptim`, `advpng`, `svgo`), so images pass
through unoptimized and come out several times larger than expected. None of
these are in SETUP.md's apt list.

**`shared/test_aws_s3_integration.rb`, 1 failure and 6 errors** —
`VCR::Errors::UnhandledHTTPRequestError` and
`uninitialized constant Cdo::LocalDevelopment`, on a host with no AWS
credentials.

**`RubricsControllerTest`, 3 failures — undiagnosed.** The tests expect an
AI-config validation to reject a create, so that no `.script_json` is
written. Mocha reports the S3 stubs as "not yet invoked", so the validation
path was skipped and the record was written. Plausibly a local config or
flag difference, but that is a guess and has not been confirmed. The same
writes leave `dashboard/config/course_offerings/bogus-course-*.json` behind
in the working tree; delete them after a run.

`HomeControllerTest` produced one further error,
`Mysql2::Error: Lost connection to MySQL server during query`, which did not
reproduce.

## Suites that do not run

`pegasus/test` contains only `test_helper.rb` — there are no pegasus tests.
TESTING.md's "~20 seconds" for them, and its warning about `PDFMergerTest`,
are both stale.

`dashboard/test/testing` (2 files) cannot be loaded on its own; it fails with
`undefined method 'env' for Rails:Module` out of `rails/test_help.rb`. That
is an artifact of running the suite one directory at a time, so those two
files go unverified under this harness.
