# t4g.2xlarge against m8g.2xlarge

Both hosts ran `bench-cdo-tests.sh` over the same code — every commit on this
branch touches only `bench/`, so the tree under test is `faf0f7ad3b9` on both —
with the same Ruby, node, yarn and ImageMagick, and an empty `dashboard_test`
prepared by TESTING.md's commands. Per-host detail is in
[`t4g/NOTES.md`](t4g/NOTES.md) and [`m8g/NOTES.md`](m8g/NOTES.md).

That last condition carries more weight than it reads. Preparing the test
database any other way produces numbers that look plausible and are wrong: on
the m8g host, seeding it with `seed:all` made `integration` ten times slower
and it still finished, and made `models` slower on the faster machine — a 93
minute run that had to be discarded. Substituting
`db:drop db:create db:schema:load` for `db:test:prepare` is the other trap; it
skips an `enhance` hook that loads fixtures and runs `seed:test`. Both are
written up in [`m8g/NOTES.md`](m8g/NOTES.md#preparing-the-test-database).
Run TESTING.md's commands verbatim and check `levels` and `scripts` read 0
before trusting a comparison.

    t4g.2xlarge   Neoverse-N1, 8 cores, 30Gi   burstable
    m8g.2xlarge   Neoverse-V2, 8 cores, 30Gi   not burstable

## Result

22,325 tests. The t4g column is run 3, taken after both hosts converged on a
Ruby built under gcc-13.

| suite | tests | t4g | m8g | ratio |
|---|---:|---:|---:|---:|
| `apps` (jest) | 10,793 | 331 s | 166 s | 1.99× |
| `dashboard/models` | 3,409 | 647 s | 330 s | 1.96× |
| `dashboard/controllers` | 4,307 | 2492 s | 1444 s | 1.73× |
| `dashboard/lib` | 1,490 | 298 s | 160 s | 1.86× |
| `dashboard/helpers` | 703 | 167 s | 91 s | 1.84× |
| `dashboard/integration` | 436 | 182 s | 104 s | 1.75× |
| `dashboard/jobs` | 161 | 74 s | 43 s | 1.72× |
| `dashboard/mailers` | 46 | 54 s | 34 s | 1.59× |
| `dashboard/serializers` | 33 | 54 s | 33 s | 1.64× |
| `dashboard/config` | 28 | 47 s | 29 s | 1.62× |
| `dashboard/dsl` | 15 | 51 s | 31 s | 1.65× |
| `dashboard/app` | 0 | 46 s | 31 s | 1.48× |
| `lib` | 792 | 514 s | 294 s | 1.75× |
| `shared` | 112 | 117 s | 65 s | 1.80× |
| **total** | **22,325** | **5076 s** | **2855 s** | **1.78×** |

Both hosts reported the same 9 failures and the same 6 errors, suite by suite.

## The core is 2.00×; the suite is 1.78×

Single-core, from the calibration workload on the same Ruby build:

    t4g   2.01  1.91  1.92  1.92 s      steady mean 1.917
    m8g   0.96  0.96  0.96  0.96 s      steady mean 0.960

so **2.00×** per core. The suite returns 1.78× of that. The per-suite ratios
sort by what each suite is bound on, and the order is the whole story:

    apps                 1.99x    CPU, parallel, no Rails
    dashboard/models     1.96x    CPU-bound test bodies
    dashboard/lib        1.86x
    dashboard/controllers 1.73x   database-heavy
    dashboard/app        1.48x    zero tests: Rails boot alone

Rails boot is the floor at 1.48×. It is dominated by opening and parsing
thousands of files, which a faster core barely helps. The harness invokes the
runner once per test directory, so the dashboard suite pays boot eleven times:

    dashboard total          t4g 4114 s   m8g 2330 s   1.77x
    boot (11 x app dir)      t4g  506 s   m8g  341 s   1.48x
    dashboard less boot      t4g 3608 s   m8g 1989 s   1.81x

Boot is 10-12% of the wall clock on either host and drags the dashboard ratio
from 1.81× to 1.77×. Database-bound work accounts for most of the rest:
`controllers` is the largest suite and one of the worst-scaling at 1.73×.

The practical reading, if this is input to an instance-sizing decision: a core
twice as fast buys about 1.78× on this workload, and the missing fifth is
startup and MySQL. Cutting per-directory boot — or fixing whatever makes
whole-tree `rails test` wedge, which would pay boot once instead of eleven
times — is worth more than the remaining headroom between these two parts.

## Which ratio to quote

Four numbers are defensible and they are not interchangeable:

| number | what it is |
|---|---|
| **2.00×** | single core, calibration steady state. Hardware. |
| **1.78×** | whole harness, t4g run 3. What a developer waiting on tests feels. |
| 2.09× | calibration `start` samples. t4g's first sample, 2.01 s, sits above its own series of 1.91/1.92/1.92 — it followed a Ruby swap and a cleared bootsnap cache. Discard `start` as warm-up. |
| 1.74× | the same comparison against t4g **run 2**, built with GCC 15 before the hosts converged. Superseded, and quoted in `m8g/NOTES.md`, which was written before run 3 existed. |

Quote 2.00× for the hardware and 1.78× for the workload.

## Why this comparison is trustworthy

- **Identical code.** Every branch commit touches only `bench/`.
- **Identical toolchain.** Both on Ruby 3.2.11 built under gcc-13, node
  v20.20.2, ImageMagick 7.1.2-18. The t4g was rebuilt specifically to remove
  this confound; doing so moved its total by +1.9%, inside the run-to-run
  spread.
- **Identical behaviour.** Same tests, same failures, same errors, per suite.
  `dashboard/helpers` agreed to within one assertion, 4170 against 4170.
- **Neither host was throttled.** m8g's calibration is flat to the hundredth.
  The t4g is burstable and could in principle have spent its CPU credits over
  85 minutes; it did not — calibration flat within 1%, steal peaking at 1.27%.
- **Warm caches on both.** Cold-to-warm moves `apps` by 23%, which is larger
  than most of the hardware difference being measured, so each host ran the
  harness more than once and the second run is reported.

Weakest link: suites under about 60 seconds carry roughly ±10% of run-to-run
noise, so `mailers` through `app` should be read as a band rather than a
figure. The large suites are stable to within 3% across runs.

## Defects found

The comparison was the goal; these were the by-product. All reproduce on both
hosts unless noted.

| defect | status |
|---|---|
| Whole-tree `RAILS_ENV=test rails test` never finishes — 64 tests in 63 min on t4g, then no progress; over 90 min on m8g | reproduced on both hosts and both instance families. **Cause unknown.** Per-directory invocation is the workaround the harness uses. |
| `ImageLibTest` ×3 | two causes. Two are the output format — IM7's `compare -metric ae` prints `0 (0)` where 6 printed `0`, and `image_lib_test.rb:98` tested `result == '0'`; **fixed**. The third, `test_overlay_image`, is an IM6-to-IM7 rendering difference against a fixture generated under 6 — 1147 of 130,500 pixels, 0.88%, visually identical but not bit-exact. Left open: closing it needs either a regenerated fixture or a tolerance, both maintainer calls. |
| `lib/cdo/rack/test_optimize.rb` ×2 | root-caused. Asserts exact optimized byte sizes; every `image_optim` binary (`optipng`, `pngcrush`, `gifsicle`, `jpegoptim`, `advpng`, `svgo`) is missing and none are in SETUP.md's apt list. |
| `shared/test_aws_s3_integration.rb` 1F/6E | expected without AWS credentials. |
| `RubricsControllerTest` ×3 | **undiagnosed and real.** Reproduces on both hosts, across four runs and two Ruby builds. The tests expect an AI-config validation to reject a create; mocha reports the S3 stubs never invoked, so the validation path is skipped and the record is written. |
| Tests write into `dashboard/config/` | `course_offerings/bogus-course-*.json` appear each `controllers` run; m8g twice saw 439 tracked files under `config/blocks/` deleted mid-run. Neither path is gitignored. |
| `pegasus/test` contains no tests | only `test_helper.rb`. TESTING.md's "~20 seconds" and its `PDFMergerTest` note are stale. |
| `dashboard/test/testing` cannot run in isolation | `undefined method 'env' for Rails:Module`. An artifact of per-directory invocation; those 2 files are unverified under this harness. |

`ProgrammingExpressionAutocompleteTest` appeared on m8g's first run and is not
a defect — it was an artifact of seeding `dashboard_test` with `seed:all`, and
cleared once the database was prepared per TESTING.md.

## Not measured

Karma integration tests (`yarn test:integration`), UI and Eyes Cucumber tests,
and anything requiring real AWS credentials. `yarn run typecheck` passes on
t4g in 18.7 s but is not part of the harness.
