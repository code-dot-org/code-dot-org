# m8g.2xlarge

Notes from bringing up a development environment on an `m8g.2xlarge` and
running the unit suites on it. The arm64 setup deviations in
[`../t4g/NOTES.md`](../t4g/NOTES.md) apply here too and are not repeated;
this file records what differed and what the numbers say.

    m8g.2xlarge   Neoverse-V2, 8 cores, 30Gi RAM, 96G gp3 root
    Ubuntu 26.04 LTS (resolute), kernel 7.0.0-1006-aws, aarch64
    ruby 3.2.11 built under gcc-13, node v20.20.2, yarn 4.12.0
    ImageMagick 7.1.2-18
    MySQL 8.0.32 and Redis in containers, per docker/developers

## Setup

Followed `t4g/NOTES.md` with three differences.

**Upstream's MySQL and MinIO images, unmodified.** `mysql/mysql-server:8.0`
and `minio/minio:RELEASE.2021-07-30T00-02-00Z` both publish arm64 and run
natively on Graviton; `docker exec` reports `aarch64` and MySQL 8.0.32. No
image override was needed. The volume here was seeded by Oracle's image from
the start, so the data-dictionary conflict that motivates the swap in
`docker-compose.override.arm64.yml` does not arise.

**`archive.ubuntu.com` rather than `ports.ubuntu.com`.** Measured on the same
42 MB `.deb`: EC2 mirror 136 KB/s, `archive.ubuntu.com` 31 MB/s. Either
alternative beats the default by two orders of magnitude; the specific choice
does not matter.

**gcc-13 Ruby, no compiler shim.** `CC=gcc-13 CXX=g++-13 rbenv install 3.2.11`,
then all gems built with stock `/usr/bin/gcc` and
`CONFIGURE_ARGS="--with-cflags=-Wno-incompatible-pointer-types"` for `xxhash`.
This is now the setup the harness assumes for both hosts.

One host-specific detail: config.h here ends up with **both** `HAVE__BOOL` and
`HAVE_STDBOOL_H`, so `ruby/internal/stdbool.h` takes its
`#include <stdbool.h>` branch. On the t4g host the same gcc-13 build produces
neither macro and the `#define bool _Bool` fallback fires instead. Both
outcomes compile `-std=c99` and `-std=c11` against `ruby.h`, which is the
property that matters, but the fix should not be described as "makes
`HAVE_STDBOOL_H` appear" — that is one of two branches, and which one you get
appears to vary by host.

16 G of swap was added, matching t4g. The image ships none.

## Preparing the test database

Exactly TESTING.md, and nothing more:

    RAILS_ENV=test bundle exec rake assets:precompile
    RAILS_ENV=test bundle exec rake db:reset db:test:prepare

`dashboard_test` afterwards reads `levels 0`, `scripts 0`,
`secret_pictures 22`, `secret_words 9`.

This is worth stating explicitly because getting it wrong is expensive and the
failure modes do not point at the cause. `db:test:prepare` is enhanced in
`dashboard/lib/tasks/seed_in_test.rake` to run `db:fixtures:load` and then
`seed:test`, and `seed:test` (`seed.rake:615`) seeds videos, games, concepts,
secret words and pictures, school districts, schools, standards and foorms —
deliberately no scripts or levels. Substituting
`db:drop db:create db:schema:load` skips that hook entirely: `Level` lookups
then return nil and the suite raises `there are no SecretPictures!`.

Seeding the test database with `rake seed:all` is the other failure. It adds
100k levels, so the database-bound suites slow by up to 10×, and it creates a
script named `hourofcode` that collides with
`create_hourofcode_unit_and_levels` (`test/test_helper.rb:195`) for several
hundred `Name has already been taken` errors. An earlier run of this harness
was invalidated that way; see git history if the numbers are ever needed.

## Results

Warm run, `bench/m8g/results.tsv`. 2855 s total, 47.6 minutes.

| suite | tests | fail | err | m8g | t4g run 2 | ratio |
|---|---:|---:|---:|---:|---:|---:|
| `apps` | 10793 | 0 | 0 | 166 s | 339 s | 2.04× |
| `dashboard/models` | 3409 | 0 | 0 | 330 s | 637 s | 1.93× |
| `dashboard/controllers` | 4307 | 3 | 0 | 1444 s | 2423 s | 1.68× |
| `dashboard/lib` | 1490 | 3 | 0 | 160 s | 302 s | 1.89× |
| `dashboard/helpers` | 703 | 0 | 0 | 91 s | 171 s | 1.88× |
| `dashboard/jobs` | 161 | 0 | 0 | 43 s | 77 s | 1.79× |
| `dashboard/mailers` | 46 | 0 | 0 | 34 s | 51 s | 1.50× |
| `dashboard/serializers` | 33 | 0 | 0 | 33 s | 49 s | 1.48× |
| `dashboard/config` | 28 | 0 | 0 | 29 s | 42 s | 1.45× |
| `dashboard/dsl` | 15 | 0 | 0 | 31 s | 46 s | 1.48× |
| `dashboard/app` | 0 | 0 | 0 | 31 s | 42 s | 1.35× |
| `dashboard/testing` | NA | NA | NA | 0 s | 2 s | — |
| `dashboard/integration` | 436 | 0 | 0 | 104 s | 177 s | 1.70× |
| `lib` | 792 | 2 | 0 | 294 s | 511 s | 1.74× |
| `shared` | 112 | 1 | 6 | 65 s | 113 s | 1.74× |
| **total** | **22,325** | **9** | **6** | **2855 s** | **4982 s** | **1.74×** |

Test and assertion counts agree with the t4g run across every suite —
`controllers`, `dashboard/lib`, `helpers`, `integration` and `lib` match
exactly, `models` differs by one assertion — and both hosts report the same
nine failures and six errors. The comparison is like-for-like.

These figures are from tree `faf0f7ad3b9` and predate the fixes on this branch.
The `lib` row will read 799 tests and 2527 assertions on any later run: the
regression test added with the `cdo/local_development` fix accounts for 2 tests
and 11 assertions, and renaming `test/cdo/aws/s3.rb` so that it runs accounts
for 5 and 12. Failure counts are unchanged by both.

### The run was clean

    calib start 0.96s   mid 0.96s   mid2 0.96s   end 0.96s
    CPU steal peak 0.35%

Flat to the hundredth across roughly 48 minutes of load. m8g is not burstable,
so the credit caveat that governs a t4g figure does not apply, but the
calibration is worth recording either way.

### What the ratio means

Single-core, from calibration on the same gcc-13 Ruby: 2.01 s on t4g against
0.96 s here, so **2.09×**. The suites as a whole come in at 1.74×, and the
small directories at 1.35–1.50×.

The gap is startup. `dashboard/app` runs zero tests in 31 s and
`dashboard/config` runs 28 in 29 s; that is Rails boot, which is dominated by
file I/O and does not scale with core speed. The suites that do real work land
closer to the calibration figure — `apps` at 2.04×, `models` at 1.93× — and
the twelve per-directory invocations pay boot twelve times. So Neoverse-V2 is
about twice Neoverse-N1 on this workload's actual computation, and the
end-to-end number is diluted by roughly six minutes of boot the hardware
cannot help with.

## Known failures

The same nine failures and six errors as t4g, and for the same reasons:
`ImageLibTest` ×3 (ImageMagick 7 `compare -metric ae` output format),
`RubricsControllerTest` ×3 (deterministic, undiagnosed),
`lib/cdo/rack/test_optimize.rb` ×2 (no `image_optim` helper binaries), and
`shared/test_aws_s3_integration.rb` ×1 failure and ×6 errors. See
`../t4g/NOTES.md` for the detail.

The `test_aws_s3_integration.rb` failures are two causes, not one. The VCR
cassette misses are the absent AWS credentials. The
`uninitialized constant Cdo::LocalDevelopment` errors are a defect in the
repository, described below.

`ProgrammingExpressionAutocompleteTest`, which failed four times on the
invalidated `seed:all` run, does not appear here. It was an artifact of the
populated database.

Two housekeeping items after any run: `RubricsControllerTest` leaves
`dashboard/config/course_offerings/bogus-course-*.json` behind, and
`test/models/block_test.rb` together with
`app/models/concerns/multi_file_seeded.rb` churns
`dashboard/config/blocks/**` — 439 tracked files showed as deleted mid-run
here. `git checkout -- dashboard/config/blocks` restores them. Neither should
be committed.

## Running the harness

Copy `bench-cdo-tests.sh` outside the working tree before starting. A
coordinating push that rewrites the script while it is executing can misalign
bash, which reads scripts by byte offset. It was harmless here only because
the file is 5779 bytes and fits inside bash's 8 KB read-ahead.

## Defects found

Confirmed on this host. The first is reproducible in isolation; the rest cost
setup time here and are recorded so the next person does not rediscover them.

**`lib/cdo/aws/s3.rb` never requires `cdo/local_development`.** *Fixed.* Line 96
called `Cdo::LocalDevelopment.populate_local_s3_bucket` when
`CDO.aws_s3_emulated` was set, but the requires at lines 1-6 did not load that
file, so the constant was undefined:

    $ ruby -e 'require "./deployment"; require "cdo/aws/s3"; Cdo::LocalDevelopment'
    NameError: uninitialized constant Cdo::LocalDevelopment

`aws_s3_emulated: true` is the configuration `docker/developers` recommends, so
any non-Rails caller using the MinIO setup hit this on a `download_from_bucket`
that had to populate a bucket. Rails autoloads the constant, which is why
`dashboard/legacy/middleware/sound_library_api.rb:34` makes the same call
without a require and is *not* affected.

The require went inside the `aws_s3_emulated` guard rather than at the top of
the file. `cdo/local_development` requires `cdo/aws/s3` back by way of
`s3_emulation/populator`, so a top-level require introduces a load cycle — it
resolves today only because every cross-reference sits in a method body — and
`populator` pulls in `httparty`, which no production process touching S3 needs.
`lib/cdo/app_server_hooks.rb` already requires `cdo/aws/metrics` and
`cdo/aws/ec2` this way.

This accounts for the non-VCR portion of
`shared/test/test_aws_s3_integration.rb`, but does not change that file's pass
count: the affected test now proceeds far enough to hit a request VCR has no
cassette for. After the fix its errors are uniformly
`VCR::Errors::UnhandledHTTPRequestError`, so the "no AWS credentials"
explanation is now true of all of them, which it was not before.

**`lib/test/cdo/aws/s3.rb` never ran.** *Fixed by renaming to `test_s3.rb`.*
`lib/Rakefile:8` builds its list from `FileList["test/**/test_*.rb"]`, and that
filename matched neither that pattern nor the `*_test.rb` convention, so the
file had never run under `rake test`, in CI or locally. Its five tests pass and
cover `cached_exists_in_bucket?` and the cache invalidation in
`upload_to_bucket` and `delete_from_bucket` — behaviour with no other coverage
in the repository.

It was the only one. `lib`, `shared` and `dashboard` were scanned for files
under `test/` defining test cases that match neither glob: the five other
non-matching files in `lib` and `shared` are helpers, and the two in
`dashboard` are Cucumber runner code with methods merely named `test_*`. The
gap is closed and bounded to this file. Note that the benchmark harness globs
the same two patterns, so `lib` read 792 on both hosts — the missing file was
invisible to the measurement as well as to CI.

**`docker-compose.dashboard.yml` prints endpoint keys the code cannot parse.**
It tells you to write `db_endpoint_writer: 127.0.0.1:3306` into `locals.yml`,
but `config/development.yml.erb:8-15` and `config.yml.erb:561-568` define the
host and the port as separate keys. On t4g the combined form aborted
`rake build` with `URI::InvalidComponentError: bad component(expected host
component)`. Here it produced a silently wrong `bin/mysql-client-admin`, which
reads `db_endpoint_writer` and `db_endpoint_writer_port` independently. Drop
the port from the four `db_endpoint_*` values.

**`RakeUtils.install_npm` will downgrade a developer's node.**
`lib/cdo/rake_utils.rb:244` early-returns only if `which npm` succeeds; its own
comment calls that "a temporary workaround to play nice with nvm". With nvm
absent from `PATH` — a cron job, an IDE terminal, CI — `rake install` runs
`sudo apt-get install -y nodejs npm`, force-symlinks `/usr/bin/node`, and then
`npm install -g npm@2.9.1`. Caught here mid-apt; distro node never landed.
Source nvm in the same shell as `rake install`, and check `which npm` prints a
path before starting.

**`rails test` over the whole tree does not finish.** TESTING.md's headline
command wedged on both hosts: 64 tests in 63 minutes then no progress on t4g,
and no output at all after 90 minutes here. Running the runner once per
directory completes normally, which is what `bench-cdo-tests.sh` does. Cause
unknown; loading all 698 test files into one process is the trigger but not an
explanation. Bisecting the directory list is the cheap first experiment.

**SETUP.md is stale for arm64 and for Ubuntu 26.04.** The version table says
ruby 3.1.7 and node v20.18.3 where the repository pins 3.2.11 and 20;
`libyaml-dev` is missing from the apt list and Ruby 3.2 will not build psych
without it; `pdftk` has no arm64 candidate and its snap is amd64-only;
`chromium-browser` is a snap shim, though Google publishes an arm64
`.deb`. See `../t4g/NOTES.md` for the rest.

## Checked and found not to be defects

Recorded because an earlier revision of these notes, and a defect list derived
from them, claimed all five. They are wrong. Each was withdrawn after running
the command that settles it.

**`all-services` exists.** `docker-compose.yml:19`, repository root, which
`include:`s the four `docker/developers` fragments and defines `all-services`,
`dashboard-services` and `s3-services` on top of them. A search scoped to
`docker/` does not reach it.

**`docker/developers` needs no `-f`.** Compose v2 walks up to find the project
file. `docker compose config --services` from that directory resolves against
the root file and exits 0. The README not saying which directory to run from is
a missing line, not a broken stack.

**Colon-style `.env` parses.** Compose 2.40.3 reads `FOO: 1234` as `1234`, and
`docker compose run --rm --no-deps dashboard-services` prints
`redis_url: redis://localhost:6379/0` with the port present. The format is
non-standard and worth tidying; it changes nothing on this version.

**The S3 populator exists.** `lib/cdo/local_development/s3_emulation/`, reached
through `populate_local_s3_bucket`. Only the path in
`docker/developers/README.md` and the comment at `install-s3.sh:30`, both of
which point at `docker/developers/utils/s3`, are wrong.

**`pdftk` does not fail a pegasus test.** `pegasus/test` contains only
`test_helper.rb`; `rake test` there runs 0 tests in 4 seconds. TESTING.md's
"~20 seconds" for the pegasus suite and its warning about `PDFMergerTest` are
both stale, but nothing fails for want of `pdftk`.

All five came from the same error: a search or an inference recorded as a fact
about the repository without running the command that would have contradicted
it. Where this file states a defect above, it states the command that shows it.
