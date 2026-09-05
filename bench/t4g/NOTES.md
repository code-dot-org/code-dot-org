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

**2. Keep upstream's images; take the port bindings.** Earlier revisions of
this file claimed `mysql/mysql-server:8.0` and the pinned MinIO release were
amd64-only and could not run on Graviton. That was wrong. Both publish arm64:

    $ docker manifest inspect mysql/mysql-server:8.0 | grep architecture
    amd64  arm64
    $ docker manifest inspect minio/minio:RELEASE.2021-07-30T00-02-00Z
    amd64  arm64  ppc64le  s390x

The m8g host ran upstream's compose file unmodified for nine hours. A fresh
checkout should do the same.

`docker-compose.override.arm64.yml` in the parent directory is therefore not
an architecture workaround, and its name is a misnomer. Two of its three parts
are still worth taking on any host:

- MinIO moved off port 9000, which the apps webpack dev server binds
  (`apps/bundlerBase.js`), so MinIO and `yarn start` cannot coexist.
  `locals.yml`'s `aws_s3_endpoint` must agree with whichever port you pick.
- MySQL and Redis bound to loopback rather than every interface, so a host
  with a permissive security group does not publish root/password to the
  internet.

The third part, swapping in the official `mysql:8.0`, is local history and
should not be copied: this host's volume had already been initialised by
`mysql:8.0` (8.0.46), and Oracle's 8.0.32 refuses to start against a newer
data dictionary. The official image also ships no `HEALTHCHECK`, which
`dashboard-services` needs for `condition: service_healthy`, so the override
supplies one. Start from upstream's image and you need none of that.

**3. Build Ruby under gcc-13.** Ubuntu 26.04 ships GCC 15, whose C23 default
breaks autoconf's `stdbool.h` probe. Ruby 3.2.11 as built by ruby-build then
gets a `config.h` defining `HAVE__BOOL` but not `HAVE_STDBOOL_H`, so
`ruby/internal/stdbool.h` neither includes `<stdbool.h>` nor defines `bool`
itself. `bool` survives only as a C23 keyword, and any gem forcing an older
`-std` fails inside Ruby's own headers. `#include <ruby.h>` and nothing else
reproduces it:

    gcc     default (C23)    OK
    gcc     -std=c99         error: unknown type name 'bool'
    gcc-13  default (gnu17)  error: unknown type name 'bool'

The third line is why compiling gems with an older compiler does not help —
the broken `config.h` is baked into the Ruby installation. Configure Ruby
itself under gcc-13 and the problem goes away, after which `bootsnap`'s
`-std=c99` compiles unmodified, as does `-std=c11`:

    CC=gcc-13 CXX=g++-13 rbenv install 3.2.11

The mechanism is worth stating precisely, because it is not the one you would
guess. `ruby/internal/stdbool.h` ends in a fallback:

    #elif defined(HAVE_STDBOOL_H)
    # include <stdbool.h>
    #elif !defined(HAVE__BOOL)
    # define bool _Bool

Under GCC 15 the probe writes `HAVE__BOOL 1` and no `HAVE_STDBOOL_H`. That is
the worst of both: the `<stdbool.h>` branch is skipped, and defining
`HAVE__BOOL` *suppresses* the fallback that would have defined `bool` — so
nothing defines it, and only C23's keyword saves the default build. Under
gcc-13, config.h contains **neither** macro, the fallback fires, and `bool`
is defined for every `-std`. Verified on this host: `HAVE_STDBOOL_H` does not
appear in either build's config.h.

`xxhash` needs `-Wno-incompatible-pointer-types` separately, since GCC 14
promoted that to an error; pass it via `CONFIGURE_ARGS`, as mkmf ignores
`CFLAGS`.

This supersedes an earlier `gcc` PATH shim that force-included `stdbool.h`
into every gem compile. The shim worked, but treated the symptom, and left
`bench-cdo-tests.sh` silently depending on a `$HOME/.cdo-ccshim` that existed
on only one of the two hosts. Diagnosis is the m8g host's.

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

`ProgrammingExpressionAutocompleteTest` fails on the m8g host but not here.
That host's `dashboard_test` had been seeded with `rake seed:all`; this one
was left empty, per TESTING.md. Treat it as a symptom of a seeded test
database rather than a property of the suite.

## Working-tree churn during a run

Two kinds of debris. Both are the suite writing into `dashboard/config/`
rather than a temp directory, and neither is gitignored.

`dashboard/config/course_offerings/bogus-course-*.json` are new files, four
per full `controllers` run. Delete them afterwards.

`dashboard/config/blocks/**` is worse: `dashboard/test/models/block_test.rb`
and `app/models/concerns/multi_file_seeded.rb` churn it mid-run, and the m8g
host twice found 439 *tracked* files showing as deleted. Restore with

    git checkout -- dashboard/config/blocks

and check `git status` before committing anything after a test run, so the
deletions do not get swept in. (Reported by the m8g host; not independently
seen here.)

## Test database

Prepare it with TESTING.md's commands verbatim and nothing more:

    RAILS_ENV=test bundle exec rake assets:precompile
    RAILS_ENV=test bundle exec rake db:reset db:test:prepare
    cd ../pegasus && RAILS_ENV=test bundle exec rake test:reset_dependencies

The test database is meant to be empty — `levels` and `scripts` both read 0
here — and the factories build what each test needs. Seeding it with
`seed:all` is actively harmful: it makes the DB-bound suites walk a hundred
thousand rows, and its `hourofcode` script collides with
`create_hourofcode_unit_and_levels` at `dashboard/test/test_helper.rb:195`,
which cost the m8g host 373 errors.

On this host `db:reset` populated `secret_pictures` (22) and `secret_words`
(9) on its own; `seed:secret_pictures seed:secret_words` was never run and the
suite never raised `there are no SecretPictures!`. The m8g host needed those
seeds explicitly, but was recovering a damaged schema load at the time, so it
is unclear whether they are genuinely required after a clean `db:reset`.

Skipping `assets:precompile` does not fail cleanly. The suite aborts at load
time with `Sprockets::Rails::Helper::AssetNotFound: "logo-codeai-inverse.svg"`,
which reads like a missing asset rather than a missing setup step, and Spring
keeps serving the stale environment afterwards — so precompiling appears not
to have helped until you `spring stop` or set `DISABLE_SPRING=1`.

## Suites that do not run

`pegasus/test` contains only `test_helper.rb` — there are no pegasus tests.
TESTING.md's "~20 seconds" for them, and its warning about `PDFMergerTest`,
are both stale.

`dashboard/test/testing` (2 files) cannot be loaded on its own; it fails with
`undefined method 'env' for Rails:Module` out of `rails/test_help.rb`. That
is an artifact of running the suite one directory at a time, so those two
files go unverified under this harness.

### Measured

Three runs, same host, same commit. Run 1 was the first execution of each
suite on a freshly built checkout. Run 2 followed an hour later. Run 3 came
after Ruby was rebuilt under gcc-13, and is the run the committed
`results.tsv` holds.

| suite | tests | run 1 | run 2 | run 3 | 3 vs 2 |
|---|---:|---:|---:|---:|---:|
| `apps` | 10793 | 441 s | 339 s | 331 s | -2% |
| `dashboard/models` | 3409 | 613 s | 637 s | 647 s | +2% |
| `dashboard/controllers` | 4307 | 2600 s | 2423 s | 2492 s | +3% |
| `dashboard/lib` | 1490 | 285 s | 302 s | 298 s | -1% |
| `dashboard/helpers` | 703 | 161 s | 171 s | 167 s | -2% |
| `dashboard/jobs` | 161 | 68 s | 77 s | 74 s | -4% |
| `dashboard/mailers` | 46 | 50 s | 51 s | 54 s | +6% |
| `dashboard/serializers` | 33 | 50 s | 49 s | 54 s | +10% |
| `dashboard/config` | 28 | 42 s | 42 s | 47 s | +12% |
| `dashboard/dsl` | 15 | 44 s | 46 s | 51 s | +11% |
| `dashboard/app` | 0 | 42 s | 42 s | 46 s | +10% |
| `dashboard/testing` | NA | 2 s | 2 s | 2 s | +0% |
| `dashboard/integration` | 436 | 177 s | 177 s | 182 s | +3% |
| `lib` | 792 | 507 s | 511 s | 514 s | +1% |
| `shared` | 112 | 111 s | 113 s | 117 s | +4% |
| **total** | **22,325** | **5193 s** | **4982 s** | **5076 s** | **+1.9%** |

Two things to read out of this.

**Cache state, not hardware, is the largest effect here.** `apps` went 441s
cold to 339s warm, a 23% swing on identical work — larger than most of the
hardware difference a cross-host comparison is trying to find. So **run the
harness twice on each host and compare second run to second run.** The Ruby
suites were already warm in run 1 and moved 4% or less.

**Rebuilding Ruby under gcc-13 changed nothing measurable.** Total moved
+1.9%, within the run-to-run spread. The short directories appear to move
~10% — `config` 42s to 47s, `app` 42s to 46s — but they are 45-second
measurements where a few seconds is a large fraction, and a direct check
does not support a real difference:

    Rails boot, gcc-13 build   15.00  13.42  14.02 s   (mean 14.15)
    Rails boot, GCC 15 build   13.52  14.39  13.31 s   (mean 13.74)

The ranges overlap. An earlier reading of these notes claimed a ~10% boot
regression on the gcc-13 build; that was inferred from the short-directory
deltas alone and the direct measurement above does not bear it out. Treat
anything under about 60 seconds in `results.tsv` as having ±10% of noise on
it, and compare the large suites.

`dashboard/controllers` dominates at roughly half the total. `dashboard/app`
and `dashboard/config` are almost entirely Rails boot — 46s each, for 0 and
28 tests.

### The t4g did not throttle

    run 3   calib start 2.01s  mid 1.91s  mid2 1.92s  end 1.92s
            CPU steal  avg 0.45%  peak 1.27%  over 169 samples
    run 2   calib start 1.98s  mid 1.97s  mid2 1.96s  end 1.97s
            CPU steal  avg 0.47%  peak 1.18%  over 166 samples

Identical work timed at four points, spanning about 75 minutes of sustained
load, stayed flat to within 1%; steal never reached 2%. So this run spent no
CPU credits it could not replace, and the numbers above are a property of the
hardware rather than of the credit balance. A t4g-to-m8g comparison against
these figures is sound.

That is a result about this workload, not a general one. The suites spend
much of their time on a single core — `dashboard/config` is 42s of Rails boot
for 28 tests — and never saturate all eight for long. A more parallel
workload could still exhaust credits, so check `calibration.tsv` on every
run rather than assuming this holds.

### Flaky versus deterministic

Runs 2 and 3 each reproduced all nine failures and none of the errors. The
one run-1 error, `HomeControllerTest` hitting
`Mysql2::Error: Lost connection to MySQL server during query`, did not recur
in either and was a flake. The three `RubricsControllerTest` failures reproduced
exactly in all three runs, and survive a change of Ruby build, so they are
deterministic and worth chasing.
