# Chromedriver Timing Optimization Plan

Optimize UI test suite runtime in CI by logging test duration and pass/fail status, then using that data to run the slowest tests first.

## Overview

Currently, test prioritization uses SauceLabs API data (via `test_flakiness.rb`). For Chromedriver runs in CI, we don't have this API, so we'll build our own timing data by:
1. Logging first-run results (duration, pass/fail) for each test
2. Maintaining a rolling average over the last ~50 runs
3. Using this data to prioritize tests (longest first)

## Algorithm: Rolling Average with Cap

For each test, we store three values: `avg_run_time`, `avg_fail_rate`, `num_runs`.

**Before MAX_RUNS (50)**: Standard weighted average
```ruby
new_avg = (old_avg * num_runs + new_value) / (num_runs + 1)
num_runs += 1
```

**At MAX_RUNS (50)**: Use 51 in denominator, keep count at 50
```ruby
new_avg = (old_avg * 50 + new_value) / 51
num_runs stays at 50
```

This keeps the average responsive to recent changes while bounding storage.

---

## Stage 1: Local CSV File (for local testing)

### Files to Create/Modify

#### Create: `lib/cdo/chromedriver_timing.rb`

New module to handle timing data persistence and retrieval:

- **Local file**: `dashboard/test/ui/chromedriver-feature-timing.csv`
- **Key format**: `{Browser}_{feature_name}[_eyes]`
  - Example: `LocalBrowser_teacher_tools_documentation_landing_page`
  - Example: `LocalBrowser_teacher_tools_documentation_landing_page_eyes`

**Methods**:
- `load_from_file` - read and parse local CSV, return `{}` if missing/corrupt
- `save_to_file` - serialize and write local CSV
- `update_timing(key, run_time, failed)` - update single test's rolling average
- `estimate_for_test(key)` - return estimated duration (avg_run_time * expected_reruns)

#### Modify: `dashboard/test/ui/runner.rb`

- Track first-run results (duration, passed) for each test
- Load timing data at suite start
- Save updated timing data at suite end
- Use chromedriver timing in `estimate_for_test` for local chromedriver runs

### CSV Format

```csv
key,avg_run_time,avg_fail_rate,num_runs
LocalBrowser_teacher_tools_documentation_landing_page,60.5,0.04,50
LocalBrowser_teacher_tools_documentation_landing_page_eyes,45.2,0.0,12
Chrome_login_feature,30.1,0.02,25
```

### Testing Locally

1. Run UI tests locally with chromedriver
2. Verify CSV file is created/updated with timing data
3. Run again and verify tests are prioritized by estimated duration

---

## Stage 2: Deploy to CI with S3

### S3 Configuration

- **Bucket**: `cdo-drone`
- **Key**: `ui-test-timing/chromedriver-feature-timing.csv`
- **Full path**: `s3://cdo-drone/ui-test-timing/chromedriver-feature-timing.csv`

### CI Conditions

**Write data when**:
- Running in Drone UI pipeline
- `ENV['DRONE_TARGET_BRANCH'] == 'test'`

**Read data when**:
- Running in Drone UI pipeline
- Target branch is NOT `test`

### Additional Methods

- `load_from_s3` - download and parse CSV from S3
- `save_to_s3` - upload CSV to S3
- `should_write_data?` - check CI conditions for write mode

### Error Handling

- If CSV doesn't exist in S3: start fresh with empty data, log warning
- If CSV is corrupted: start fresh with empty data, log warning
- If S3 credentials fail: log error, continue without timing data

### Drone Pipeline Integration

The existing `ui` pipeline in `.drone.yml` already has:
- AWS credentials via secrets
- S3 access (uses `cdo-drone` bucket for cache)
- Environment variables for target/source branches

No changes to `.drone.yml` are needed for Stage 2.

---

## Notes

- Only first-run results are logged (subsequent retries may use SauceLabs due to `--first-run-local` flag)
- The key format matches existing identifier generation in `runner.rb`
- The CSV file should be added to `.gitignore` for local development
