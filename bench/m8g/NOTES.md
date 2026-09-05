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
`shared/test_aws_s3_integration.rb` ×1 failure and ×6 errors (no AWS
credentials). See `../t4g/NOTES.md` for the detail.

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
