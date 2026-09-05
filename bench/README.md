# Unit-suite benchmark

`bench-cdo-tests.sh` times the four unit suites (apps/jest, dashboard, lib,
shared) and records enough machine context to compare results across hosts.
Per-host output lives in a sibling directory named for the instance family:
`t4g/`, `m8g/`, and so on.

## Running

    REPO=/path/to/code-dot-org OUT=/path/to/bench/<family> bench/bench-cdo-tests.sh

The script needs a working development environment — see `t4g/NOTES.md` for
the setup deviations an arm64 host requires. It stops nothing on its own;
shut down `dashboard-server` and any other load first, or the timings are
noise.

Expect roughly 90 minutes.

## Output

| file | contents |
|---|---|
| `profile.txt` | host, kernel, CPU, memory, instance type, toolchain versions, git sha |
| `results.tsv` | one row per suite: files, tests, assertions, failures, errors, skips, wall seconds |
| `calibration.tsv` | a fixed 12M-iteration Ruby loop timed at four points in the run |
| `steal.tsv` | CPU steal percentage, sampled every 30s |
| `dash-*.log`, `apps.log`, `jest.json` | raw suite output |

## Reading the results

Compare `results.tsv` wall seconds per suite. Two columns decide whether the
comparison means anything:

- **`calibration.tsv`** — the same work, timed four times. Flat means the host
  held its clock for the whole run. Rising means it did not, and the later
  suites are slower for reasons that have nothing to do with the code.
- **`steal.tsv`** — time the hypervisor took away. A burstable instance that
  has spent its CPU credits shows up here, and its suite times stop being a
  property of the hardware.

Both exist because `t4g` is burstable and `m8g` is not. A t4g number gathered
while throttled is a lower bound on that machine, not a measurement of it.

Each suite pays about 42 seconds of Rails or Node boot per invocation. The
dashboard suite runs once per test directory, so it pays that cost twelve
times — roughly 8 minutes of the dashboard total is boot, not testing.

## Why the dashboard suite runs per directory

`RAILS_ENV=test bundle exec rails test`, the command TESTING.md gives, does
not finish on this checkout. It completed 64 tests in 63 minutes and then
stopped making progress entirely — no output across a two-minute sample while
holding a core busy. The same tests pass in about 69 minutes when the runner
is invoked once per directory under `dashboard/test`. Loading all 698 test
files into one process is what breaks; the tests themselves are fine.
