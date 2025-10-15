# SolidQueue Migration Plan: Incremental Job-by-Job Migration

This document outlines a strategy for incrementally migrating Code.org's ActiveJob implementation from `delayed_job` to `solid_queue`, one job class at a time.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Why Migrate to SolidQueue?](#why-migrate-to-solidqueue)
- [Current State Analysis](#current-state-analysis)
- [Migration Strategy Overview](#migration-strategy-overview)
- [Prerequisites & Compatibility](#prerequisites--compatibility)
- [Phase-by-Phase Implementation](#phase-by-phase-implementation)
- [Technical Implementation Details](#technical-implementation-details)
- [Monitoring & Validation](#monitoring--validation)
- [Rollback Strategy](#rollback-strategy)
- [Risk Assessment](#risk-assessment)
- [Timeline Estimate](#timeline-estimate)

---

## Executive Summary

**Goal**: Migrate from `delayed_job_active_record` to `solid_queue` incrementally, one job class at a time, with zero downtime and minimal risk.

**Approach**: Per-job queue adapter configuration allowing both backends to run simultaneously during migration.

**Duration**: 6-8 weeks for full migration (assuming 1-2 jobs per week + 2 weeks setup/buffer)

**Key Benefit**: Modern, Rails-native background job system with better performance, built-in recurring jobs, and no Redis dependency.

---

## Why Migrate to SolidQueue?

### Advantages of SolidQueue

1. **Database-Native**: Uses your existing MySQL database—no additional infrastructure (Redis, etc.)
2. **Rails 8 Default**: Future-proof as the official Rails background job solution
3. **Better Performance**: Optimized with `FOR UPDATE SKIP LOCKED` for efficient job polling
4. **Built-in Features**:
   - Recurring jobs (no need for separate cron jobs)
   - Concurrency controls at the job level
   - Better monitoring with Mission Control UI
   - Graceful shutdown and supervision
5. **Simpler Operations**: Fewer moving parts, easier to debug
6. **Active Development**: Regular updates from Rails core team

### Disadvantages of Current delayed_job Setup

1. **Legacy Gem**: Limited active development
2. **Old Architecture**: Polling-based with less efficient locking
3. **Manual Scaling**: Complex custom worker management (`lib/cdo/active_job_backend.rb`)
4. **No Built-in Recurring Jobs**: Requires separate cron infrastructure
5. **Limited Monitoring**: Custom CloudWatch metrics required

---

## Current State Analysis

### Current Infrastructure

- **Rails Version**: 6.1
- **Ruby Version**: 3.0-3.4
- **Queue Adapter**: `delayed_job_active_record` (~> 4.1)
- **Database**: MySQL 8+
- **Workers**: 10 workers (default) on `production-daemon` server
- **Job Count**: ~15 job classes
- **Named Queues**: 3 (`:default`, `:mailers`, `:mailjet`)

### Job Classes Inventory

| Job Class | Queue | Complexity | Dependencies | Migration Priority |
|-----------|-------|------------|--------------|-------------------|
| `SampleJob` | :default | Low | None | Phase 1 (Test) |
| `User::PiiScrubberJob` | :default | Medium | DCDO flag | Phase 2 |
| `MailDeliveryJob` | :mailers | High | ActionMailer | Phase 4 |
| `MailjetDeliveryJob` | :mailjet | High | Mailjet API | Phase 4 |
| `AichatRequestChatCompletionJob` | :default | High | OpenAI/Gemini APIs | Phase 3 |
| `EvaluateRubricJob` | :default | Very High | Complex retry logic | Phase 5 |
| `CAP::LockoutJob` | :default | Medium | Scheduling logic | Phase 3 |
| `CAP::TeacherSectionsWarningJob` | :default | Low | None | Phase 2 |
| `User::InactiveTeacherDeletionWarningJob` | :default | Low | None | Phase 2 |
| `User::InactiveUserDeletionJob` | :default | Medium | User deletion | Phase 3 |

### Current Metrics Infrastructure

- **CloudWatch Integration**: `ActiveJobMetrics` concern
- **Error Reporting**: `ActiveJobReporting` concern with Honeybadger
- **Custom Metrics**: Job-specific metrics (e.g., `AiRubricMetrics`)

---

## Migration Strategy Overview

### Core Principle: Dual-Backend Coexistence

**Key Insight**: Rails ActiveJob supports per-job queue adapter configuration:

```ruby
class MyJob < ApplicationJob
  self.queue_adapter = :solid_queue  # Override application default
end
```

This allows running both `delayed_job` and `solid_queue` simultaneously during migration.

### Migration Phases

1. **Phase 0**: Setup & Infrastructure
2. **Phase 1**: Test Job Migration
3. **Phase 2**: Low-Risk Jobs
4. **Phase 3**: Medium-Risk Jobs
5. **Phase 4**: Email Jobs
6. **Phase 5**: High-Complexity Jobs
7. **Phase 6**: Cleanup & Decommission

### Success Criteria Per Job

- ✅ Job enqueues successfully to SolidQueue
- ✅ Job executes with same behavior as delayed_job
- ✅ Retry logic works as expected
- ✅ Error handling and reporting intact
- ✅ CloudWatch metrics continue reporting
- ✅ No performance degradation
- ✅ Runs successfully in production for 3+ days

---

## Prerequisites & Compatibility

### Rails Version Requirement

- **Prerequisite**: Rails 7.1 or higher.
- **Current Version**: 6.1 (❌ Incompatible)
- **Note**: The `solid_queue` gem requires `activerecord >= 7.1`, which is a core component of Rails 7.1+. This migration is blocked until the application is upgraded to Rails 7.1 or a compatible version. See [INF-970](https://codedotorg.atlassian.net/browse/INF-970) for the Rails upgrade task.

### Database Requirements

- **MySQL**: 8.0+ (✅ Compatible with existing Aurora MySQL)
- **Features Used**: `FOR UPDATE SKIP LOCKED` (MySQL 8.0+)
- **Connection Pool**: May need to increase pool size

### Ruby Compatibility

- **Minimum**: Ruby 3.0 (✅ Current version)
- **Recommended**: Ruby 3.1.6+

### Infrastructure Considerations

1. **Database Connections**: SolidQueue workers need database connections
   - Each worker = 1+ connection
   - May need to increase connection pool size
2. **Worker Processes**: SolidQueue uses thread pools (fewer processes needed)
3. **Monitoring**: Mission Control - Jobs UI (separate gem)

---

## Phase-by-Phase Implementation

### Phase 0: Setup & Infrastructure

**Goals**:
- Install SolidQueue gem
- Configure database
- Set up monitoring
- Create base job class for SolidQueue jobs

**Implementation Steps**:

#### Step 1: Add SolidQueue Gem

```bash
# Gemfile
gem "solid_queue", "~> 1.0"
gem "mission_control-jobs", "~> 0.1.0"  # Optional: UI for monitoring
```

```bash
bundle install
```

#### Step 2: Install SolidQueue

```bash
cd dashboard
bin/rails generate solid_queue:install
```

This creates:
- `config/solid_queue.yml` - Worker/dispatcher configuration
- `db/queue_schema.rb` - Database schema for queue tables

#### Step 3: Run Migrations

**Option A: Single Database (Recommended for Code.org)**

Since Code.org already uses MySQL, use the primary database:

```bash
# Edit config/database.yml to NOT use separate queue database
# Comment out the queue: section

cd dashboard
bin/rails db:migrate
```

This adds tables to the primary database:
- `solid_queue_jobs`
- `solid_queue_ready_executions`
- `solid_queue_scheduled_executions`
- `solid_queue_claimed_executions`
- `solid_queue_blocked_executions`
- `solid_queue_failed_executions`
- `solid_queue_pauses`
- `solid_queue_processes`
- `solid_queue_recurring_executions`
- `solid_queue_recurring_tasks`
- `solid_queue_semaphores`

**Option B: Separate Database (Advanced)**

If you want isolation, configure a separate database:

```yaml
# config/database.yml
queue:
  <<: *mysql_defaults
  database: dashboard_queue_<%= Rails.env %>
  migrations_paths: db/queue_migrate
```

#### Step 4: Configure SolidQueue

Edit `config/solid_queue.yml`:

```yaml
production:
  dispatchers:
    - polling_interval: 1
      batch_size: 500
      concurrency_maintenance_interval: 300
      recurring_schedule_interval: 60

  workers:
    - queues: default
      threads: 5
      processes: 3
      polling_interval: 0.1

    - queues: mailers
      threads: 3
      processes: 2
      polling_interval: 0.1

    - queues: mailjet
      threads: 2
      processes: 1
      polling_interval: 0.1

development:
  dispatchers:
    - polling_interval: 1
      batch_size: 100

  workers:
    - queues: "*"
      threads: 3
      processes: 1
      polling_interval: 1

test:
  # In test, use :test adapter instead
```

**Key Configuration Notes**:
- `dispatchers`: Move scheduled jobs to ready state
- `workers`: Process jobs from queues
- `threads`: Jobs processed concurrently per process
- `processes`: Worker processes (auto-forking)
- `polling_interval`: How often to check for jobs (seconds)

#### Step 5: Create Base Job Class for SolidQueue

```ruby
# dashboard/app/jobs/solid_queue_job.rb
class SolidQueueJob < ApplicationJob
  self.queue_adapter = :solid_queue

  # Inherit all the concerns from ApplicationJob
  # (already included via inheritance)
end
```

#### Step 6: Configure Environment

```ruby
# dashboard/config/application.rb

# Keep delayed_job as default for now
config.active_job.queue_adapter = CDO.active_job_queue_adapter  # :delayed_job

# Add SolidQueue configuration
config.solid_queue.connects_to = {database: {writing: :primary}}
```

#### Step 7: Start SolidQueue Workers (Development Only)

```bash
# In a separate terminal
cd dashboard
bin/rails solid_queue:start
```

For production, we'll integrate this into the deployment (see Phase 6).

#### Step 8: Set Up Mission Control (Optional)

```ruby
# config/routes.rb
Rails.application.routes.draw do
  if Rails.env.production?
    # Add authentication
    authenticate :user, ->(user) { user.admin? } do
      mount MissionControl::Jobs::Engine, at: "/jobs"
    end
  else
    mount MissionControl::Jobs::Engine, at: "/jobs"
  end

  # ... rest of routes
end
```

Visit `/jobs` to see the dashboard.

#### Step 9: Update Monitoring

Create a new concern for SolidQueue metrics:

```ruby
# dashboard/app/jobs/concerns/solid_queue_metrics.rb
module SolidQueueMetrics
  extend ActiveSupport::Concern

  included do
    # SolidQueue has built-in monitoring, but we may want custom CloudWatch metrics
    after_perform :report_solid_queue_metrics
  end

  private

  def report_solid_queue_metrics
    # Report to CloudWatch similar to ActiveJobMetrics
    # Can query SolidQueue::Job.count, etc.
  end
end
```

**Validation**:
- ✅ SolidQueue gem installed and configured
- ✅ Database migrations successful
- ✅ Workers start without errors
- ✅ Mission Control accessible
- ✅ Both `delayed_job` and `solid_queue` workers running

---

### Phase 1: Test Job Migration

**Goal**: Migrate `SampleJob` to validate the dual-backend approach.

**Why SampleJob?**:
- Simple job with no external dependencies
- Only used for testing
- Low risk if something goes wrong

**Implementation**:

#### Step 1: Update SampleJob

```ruby
# dashboard/app/jobs/sample_job.rb
class SampleJob < SolidQueueJob  # Change parent class
  # All existing code stays the same

  def perform(*message)
    puts "In #{self.class.name} - perform"
    sleep(rand(1..5))
    puts "Hello, #{message}"
  end
end
```

#### Step 2: Test in Development

```ruby
# From dashboard-console
SampleJob.perform_later('SolidQueue Test')

# Check Mission Control at /jobs
# Or query directly:
SolidQueue::Job.where(class_name: 'SampleJob')
```

#### Step 3: Test Scheduling

```ruby
# Delayed execution
SampleJob.set(wait: 1.minute).perform_later('Delayed Test')

# Scheduled execution
SampleJob.set(wait_until: 1.hour.from_now).perform_later('Scheduled Test')
```

#### Step 4: Test Callbacks

Verify all callbacks still fire:
- `before_enqueue`, `after_enqueue`, `around_enqueue`
- `before_perform`, `after_perform`, `around_perform`

#### Step 5: Deploy to Staging

```bash
# Deploy code changes
# SolidQueue workers should already be running from Phase 0
```

#### Step 6: Smoke Test in Staging

```ruby
# SSH to staging-daemon (or equivalent)
cd dashboard
bundle exec rails runner "SampleJob.perform_later('Staging Test')"

# Monitor Mission Control
# Check CloudWatch for metrics
# Check logs: dashboard/log/solid_queue.log
```

#### Step 7: Deploy to Production

After 2-3 days of successful staging operation:

1. Deploy code
2. Monitor Mission Control
3. Watch CloudWatch metrics
4. Check error rates in Honeybadger
5. Keep running for 3-5 days

**Validation**:
- ✅ Job enqueues to SolidQueue
- ✅ Job executes successfully
- ✅ Callbacks fire correctly
- ✅ Metrics reported to CloudWatch
- ✅ No errors in Honeybadger
- ✅ delayed_job still processing other jobs

---

### Phase 2: Low-Risk Jobs

**Goals**: Migrate simple jobs with minimal dependencies.

**Jobs to Migrate**:
1. `User::PiiScrubberJob`
2. `CAP::TeacherSectionsWarningJob`
3. `User::InactiveTeacherDeletionWarningJob`

**Per-Job Process**:

#### Step 1: Update Job Class

```ruby
# Example: dashboard/app/jobs/user/pii_scrubber_job.rb
class User::PiiScrubberJob < SolidQueueJob  # Change parent
  # Existing code unchanged

  def perform(dry_run: false, deleted_since: nil, limit: nil)
    return unless DCDO.get('pii-scrub-enabled', false)
    ExpiredDeletedAccountPiiScrubber.new(dry_run:, deleted_since:, limit:).call
  end
end
```

#### Step 2: Test Locally

```ruby
# Development console
User::PiiScrubberJob.perform_later(dry_run: true)

# Verify execution
SolidQueue::Job.where(class_name: 'User::PiiScrubberJob')
```

#### Step 3: Test in Staging

- Deploy to staging
- Manually trigger job
- Monitor for 2-3 days
- Check logs and metrics

#### Step 4: Deploy to Production

- Deploy code
- Monitor carefully
- Let run for 5-7 days before next migration

**Repeat for each job in this phase.**

**Validation Per Job**:
- ✅ Job behavior identical to delayed_job version
- ✅ Error handling works correctly
- ✅ No increase in error rates
- ✅ CloudWatch metrics accurate

---

### Phase 3: Medium-Risk Jobs

**Goals**: Migrate jobs with external API dependencies and scheduling.

**Jobs to Migrate**:
1. `CAP::LockoutJob` (has `.set(wait_until:)` logic)
2. `AichatRequestChatCompletionJob` (OpenAI/Gemini APIs)
3. `User::InactiveUserDeletionJob` (user deletion logic)

**Special Considerations**:

#### CAP::LockoutJob Scheduling

This job uses `wait_until` for future scheduling:

```ruby
# Current code
CAP::LockoutJob.set(wait_until: scheduled_lockout_date).perform_later(user_id: user.id, reschedules: reschedules)
```

**Verify**: SolidQueue handles scheduled jobs via the dispatcher. Test thoroughly:

```ruby
# Test scheduling
future_time = 2.hours.from_now
CAP::LockoutJob.set(wait_until: future_time).perform_later(user_id: 1, reschedules: 1)

# Check scheduled jobs
SolidQueue::ScheduledExecution.where(class_name: 'CAP::LockoutJob')
```

#### AichatRequestChatCompletionJob External APIs

This job has extensive error handling and callbacks. Key testing:

1. **Enqueue Callback**: Verify request status updates to `QUEUED`
2. **Perform Callback**: Verify status updates to `RUNNING`
3. **Error Handling**: Verify all `rescue_from` clauses work
4. **API Timeouts**: Test OpenAI/Gemini timeout behavior
5. **Safety Checks**: Verify toxicity and PII filtering

**Testing Strategy**:

```ruby
# Create test request in staging
request = AichatRequest.create!(...)

# Enqueue job
AichatRequestChatCompletionJob.perform_later(request: request, locale: 'en')

# Monitor throughout lifecycle
# Check request.execution_status changes
# Verify Honeybadger notifications on error
```

**Validation**:
- ✅ All retry logic preserved
- ✅ API calls succeed
- ✅ Error handling identical
- ✅ Metrics match delayed_job performance

---

### Phase 4: Email Jobs

**Goals**: Migrate email delivery jobs.

**Jobs to Migrate**:
1. `MailDeliveryJob` (high volume!)
2. `MailjetDeliveryJob`

**Special Considerations**:

#### MailDeliveryJob Inheritance

This job inherits from `ActionMailer::MailDeliveryJob`, not `ApplicationJob`:

```ruby
# Current
class MailDeliveryJob < ActionMailer::MailDeliveryJob
  include ActiveJobMetrics
  include ActiveJobReporting
  rescue_from StandardError, with: :report_exception
end
```

**Challenge**: We need to override the queue adapter without changing the parent class.

**Solution**:

```ruby
# dashboard/app/jobs/mail_delivery_job.rb
class MailDeliveryJob < ActionMailer::MailDeliveryJob
  self.queue_adapter = :solid_queue  # Override adapter

  include ActiveJobMetrics
  include ActiveJobReporting

  rescue_from StandardError, with: :report_exception
end
```

#### Testing Strategy

**Critical**: Email jobs are high-volume. Test extensively before production.

1. **Staging Testing**:
   ```ruby
   # Send test email
   Notifier.welcome(User.first).deliver_later

   # Monitor queue
   SolidQueue::Job.where(queue_name: 'mailers').count

   # Check logs for delivery
   tail -f dashboard/log/solid_queue.log | grep MailDeliveryJob
   ```

2. **Production Rollout**:
   - Deploy during low-traffic period
   - Monitor email delivery rates
   - Watch for bounce/error rates in Mailgun/Mailjet
   - Check CloudWatch email metrics

3. **Rollback Plan**:
   ```ruby
   # Quick rollback if issues
   class MailDeliveryJob < ActionMailer::MailDeliveryJob
     self.queue_adapter = :delayed_job  # Revert
     # ...
   end
   ```

**Validation**:
- ✅ Email delivery rate matches baseline
- ✅ No increase in bounces/errors
- ✅ Latency acceptable (check `deliver_later` timing)
- ✅ ActionMailer integration intact
- ✅ Both mailers and mailjet queues processing

---

### Phase 5: High-Complexity Jobs

**Goals**: Migrate the most complex job with extensive retry logic.

**Job to Migrate**:
1. `EvaluateRubricJob` (very complex retry logic)

**Special Considerations**:

#### Complex Retry Logic

`EvaluateRubricJob` has multiple `retry_on` declarations:

```ruby
retry_on TooManyRequestsError, wait: :exponentially_longer, attempts: 3 do |job, error|
  AiRubricMetrics.log_metric(metric_name: :RateLimit)
  AiRubricMetrics.log_to_firehose(job: job, error: error, event_name: 'rate-limit')
end

retry_on Net::ReadTimeout, Timeout::Error, wait: 10.seconds, attempts: 2 do |job, error|
  # ...
end

retry_on ServiceUnavailableError, wait: :exponentially_longer, attempts: 3 do |job, error|
  # ...
end

retry_on GatewayTimeoutError, wait: :exponentially_longer, attempts: 3 do |job, error|
  # ...
end
```

**SolidQueue Compatibility**: ActiveJob retry logic is framework-agnostic and should work identically.

**Testing Strategy**:

1. **Test Each Retry Scenario**:
   ```ruby
   # Mock errors to test retry logic
   EvaluateRubricJob.any_instance.stubs(:get_openai_evaluations).raises(EvaluateRubricJob::TooManyRequestsError)

   EvaluateRubricJob.perform_later(user_id: 1, requester_id: 2, script_level_id: 3)

   # Check failed executions
   SolidQueue::FailedExecution.where(job_class: 'EvaluateRubricJob')
   ```

2. **Test Concurrency Limits** (if implemented):
   ```ruby
   # SolidQueue allows setting concurrency limits
   class EvaluateRubricJob < SolidQueueJob
     limits_concurrency to: 10, key: ->(user_id:, **) { "rubric_eval_#{user_id}" }
   end
   ```

3. **Test Custom Error Handling**:
   - `StudentLimitError`
   - `TeacherLimitError`
   - `RequestTooLargeError`
   - `ProfanityFilterException`
   - `PIIFilterException`

4. **Staging Soak Test**: Run for 7+ days in staging with real traffic

**Validation**:
- ✅ All retry scenarios work
- ✅ Error callbacks fire correctly
- ✅ Metrics identical to delayed_job
- ✅ AI API calls succeed
- ✅ Database transactions commit correctly
- ✅ No data corruption

---

### Phase 6: Cleanup & Decommission

**Goals**:
- Remove delayed_job infrastructure
- Update documentation
- Clean up legacy code

**Implementation**:

#### Step 1: Verify All Jobs Migrated

```ruby
# Check for any remaining delayed_job usage
grep -r "< ApplicationJob" dashboard/app/jobs/ | grep -v SolidQueueJob

# Ensure all jobs inherit from SolidQueueJob
```

#### Step 2: Update ApplicationJob

```ruby
# dashboard/app/jobs/application_job.rb
class ApplicationJob < ActiveJob::Base
  self.queue_adapter = :solid_queue  # Change default

  include ActiveJobMetrics
  include ActiveJobReporting
end

# Can now delete SolidQueueJob base class
```

#### Step 3: Update Configuration

```ruby
# dashboard/config/application.rb
config.active_job.queue_adapter = :solid_queue  # Update default

# config.yml.erb
active_job_queue_adapter: :solid_queue  # Update
```

#### Step 4: Remove delayed_job Gem

```ruby
# Gemfile
# gem "delayed_job_active_record", "~> 4.1"  # Remove

bundle install
```

#### Step 5: Remove delayed_job Tables

```bash
# Create migration to drop tables
cd dashboard
bin/rails generate migration DropDelayedJobTables

# Edit migration
class DropDelayedJobTables < ActiveRecord::Migration[6.1]
  def up
    drop_table :delayed_jobs
  end

  def down
    # Recreate table if rollback needed (from old migration)
    create_table :delayed_jobs do |table|
      # ... schema from original migration
    end
  end
end

bin/rails db:migrate
```

#### Step 6: Update Worker Management

Replace `bin/restart-active-job-workers` with SolidQueue-specific script:

```bash
# bin/restart-solid-queue-workers
#!/usr/bin/env ruby
require_relative '../deployment'

# SolidQueue has built-in supervision and graceful restart
# Send TERM signal, workers will finish current jobs and exit
system('pkill -TERM -f solid_queue')

# Start new workers
system('bin/rails solid_queue:start')
```

Update `lib/rake/build.rake` to call new script:

```ruby
# lib/rake/build.rake
unless rack_env?(:development)
  ChatClient.log 'Restarting <b>dashboard</b> SolidQueue workers.'
  RakeUtils.system_stream_output 'bundle', 'exec', bin_dir('restart-solid-queue-workers')
end
```

#### Step 7: Update Daemon Server Configuration

Update systemd service or equivalent to manage SolidQueue:

```ini
# /etc/systemd/system/solid-queue.service
[Unit]
Description=SolidQueue Workers
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/path/to/dashboard
ExecStart=/usr/local/bin/bundle exec rails solid_queue:start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Step 8: Remove Legacy Code

```bash
# Remove custom delayed_job management
rm lib/cdo/active_job_backend.rb
rm bin/restart-active-job-workers

# Update tests that reference delayed_job
grep -r "Delayed::Job" dashboard/test/
grep -r "delayed_job" dashboard/test/

# Remove old specs/tests
```

#### Step 9: Update Documentation

- Update `docs/active-job-background-workers.md`
- Remove references to delayed_job
- Add SolidQueue sections
- Update troubleshooting guides

#### Step 10: Final Validation

- ✅ All jobs running on SolidQueue
- ✅ No delayed_job processes running
- ✅ No delayed_job tables in database
- ✅ Metrics dashboard showing SolidQueue data
- ✅ Documentation updated
- ✅ Team trained on new system

---

## Technical Implementation Details

### Per-Job Adapter Configuration

Rails 5+ supports per-job queue adapters:

```ruby
class MyJob < ApplicationJob
  self.queue_adapter = :solid_queue
end
```

This is the **key** to incremental migration. Both backends can run simultaneously.

### Database Schema Comparison

#### delayed_job Tables
- `delayed_jobs` (single table for all states)

#### SolidQueue Tables
- `solid_queue_jobs` - All jobs
- `solid_queue_ready_executions` - Ready to run
- `solid_queue_scheduled_executions` - Scheduled for future
- `solid_queue_claimed_executions` - Currently running
- `solid_queue_blocked_executions` - Blocked by concurrency limits
- `solid_queue_failed_executions` - Failed jobs
- `solid_queue_pauses` - Queue pause states
- `solid_queue_processes` - Worker process tracking
- `solid_queue_recurring_executions` - Recurring job state
- `solid_queue_recurring_tasks` - Recurring job definitions
- `solid_queue_semaphores` - Concurrency control

**Storage Impact**: ~10-12 tables vs 1 table. More normalization, better performance.

### Worker Architecture Comparison

#### delayed_job
- Separate daemon processes
- Each process polls `delayed_jobs` table
- Uses `locked_by` and `locked_at` for coordination
- Custom process management required

#### SolidQueue
- Supervisor process with forked workers
- Workers use thread pools for concurrency
- Dispatcher moves scheduled jobs to ready state
- Built-in process supervision and graceful shutdown
- Uses `FOR UPDATE SKIP LOCKED` for efficient polling

### Connection Pool Considerations

**delayed_job**: 1 connection per worker process

**SolidQueue**: 1 connection per thread + dispatcher

**Example**:
- 10 delayed_job workers = 10 connections
- 3 SolidQueue worker processes × 5 threads = 15 connections + 1 dispatcher = 16 connections

**Action**: May need to increase `pool:` in `database.yml`:

```yaml
production:
  primary:
    pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 20 } %>  # Increase if needed
```

### Monitoring Integration

#### CloudWatch Metrics

Update `ActiveJobMetrics` to work with both adapters:

```ruby
# dashboard/app/jobs/concerns/active_job_metrics.rb
module ActiveJobMetrics
  # ...

  def self.queued_jobs
    case Rails.configuration.active_job.queue_adapter
    when :delayed_job
      Delayed::Job.where(failed_at: nil)
    when :solid_queue
      SolidQueue::Job.where(finished_at: nil)
    end
  end

  # Similar updates for other methods
end
```

#### Mission Control

SolidQueue comes with Mission Control - Jobs dashboard:

- View all jobs (queued, running, finished, failed)
- Retry failed jobs
- Pause/resume queues
- View job arguments and execution details

**Access**: Mount at `/jobs` (see Phase 0, Step 8)

### Recurring Jobs (Future Enhancement)

SolidQueue has built-in recurring jobs, eliminating some cron jobs:

```yaml
# config/solid_queue.yml
production:
  recurring_tasks:
    - class: User::PiiScrubberJob
      args: [{dry_run: false}]
      schedule: "0 2 * * *"  # Daily at 2 AM
```

This could replace cron jobs in `bin/cron/`.

---

## Monitoring & Validation

### Pre-Migration Baseline

Capture metrics before migration for comparison:

1. **Job Throughput**:
   ```ruby
   # Jobs processed per hour
   Delayed::Job.where('created_at > ?', 1.hour.ago).count
   ```

2. **Error Rates**:
   ```ruby
   # Failed jobs per hour
   Delayed::Job.where('failed_at > ?', 1.hour.ago).count
   ```

3. **Latency**:
   ```ruby
   # Average wait time (created_at to locked_at)
   Delayed::Job.where.not(locked_at: nil)
     .pluck('TIMESTAMPDIFF(SECOND, created_at, locked_at)')
     .sum / count
   ```

### During Migration Validation

For each job class migrated:

1. **Enqueue Test**:
   ```ruby
   MyJob.perform_later(args)

   # Verify in correct backend
   SolidQueue::Job.find_by(class_name: 'MyJob')
   ```

2. **Execution Test**: Monitor logs and metrics

3. **Error Handling Test**: Trigger errors, verify retries

4. **Performance Test**: Compare latency and throughput

### Post-Migration Validation

After all jobs migrated:

1. **No delayed_job Jobs**:
   ```ruby
   Delayed::Job.count  # Should be 0
   ```

2. **All SolidQueue Jobs**:
   ```ruby
   SolidQueue::Job.group(:class_name).count
   ```

3. **Metrics Parity**: Compare CloudWatch metrics before/after

4. **Error Rate**: Should be same or lower

5. **Latency**: Should be same or better

### Continuous Monitoring

**CloudWatch Dashboards**: Update to include SolidQueue metrics

**Alarms**: Set up alarms for:
- High queue depth
- Failed job count
- Old pending jobs
- Worker health

**Weekly Reviews**: First 4 weeks after full migration, review:
- Job success rates
- Latency trends
- Error patterns
- Resource utilization

---

## Rollback Strategy

### Per-Job Rollback

If a job has issues on SolidQueue:

```ruby
# Change parent class back
class ProblematicJob < ApplicationJob  # Back to delayed_job
  # OR explicitly set adapter
  self.queue_adapter = :delayed_job

  # Rest of code unchanged
end
```

Deploy immediately. Job will revert to delayed_job.

### Full Rollback (Emergency)

**NOTE:** Rollback plan drafted by Claude Code, consider as speculative advice only.

If systemic issues arise:

#### Step 1: Revert Configuration

```ruby
# dashboard/config/application.rb
config.active_job.queue_adapter = :delayed_job  # Revert

# config.yml.erb
active_job_queue_adapter: :delayed_job  # Revert
```

#### Step 2: Revert Job Classes

```ruby
# Find all jobs using SolidQueue
grep -r "< SolidQueueJob" dashboard/app/jobs/

# Change back to ApplicationJob
class MyJob < ApplicationJob
  # ...
end
```

#### Step 3: Stop SolidQueue Workers

```bash
pkill -9 -f solid_queue
```

#### Step 4: Restart delayed_job Workers

```bash
bin/restart-active-job-workers
```

#### Step 5: Clear SolidQueue Jobs (Optional)

```ruby
# If jobs are stuck in SolidQueue, migrate them back
SolidQueue::Job.find_each do |job|
  # Re-enqueue to delayed_job
  job_class = job.class_name.constantize
  job_class.perform_later(*job.arguments)
end

# Clear SolidQueue
SolidQueue::Job.delete_all
```

### Rollback Testing

Before Phase 1, test rollback procedure in development:

1. Migrate SampleJob to SolidQueue
2. Enqueue some jobs
3. Revert SampleJob to delayed_job
4. Verify jobs still process correctly

---

## Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Job loss during migration | Low | High | Dual-backend approach, thorough testing |
| Performance degradation | Low | Medium | Baseline metrics, gradual rollout |
| Email delivery issues | Medium | High | Extensive testing, off-peak deployment |
| Database connection exhaustion | Medium | Medium | Monitor connections, increase pool if needed |
| Retry logic breaks | Low | Medium | Test all error scenarios |
| Worker process crashes | Low | Medium | SolidQueue supervision, monitoring |
| Failed rollback | Very Low | High | Test rollback procedures |

### High-Risk Jobs

1. **MailDeliveryJob**: High volume, critical functionality
   - Mitigation: Extensive staging testing, off-peak deployment, gradual rollout

2. **EvaluateRubricJob**: Complex logic, external APIs
   - Mitigation: Comprehensive testing, longer staging period

3. **AichatRequestChatCompletionJob**: External APIs, user-facing
   - Mitigation: API mocking tests, thorough error handling validation

### Risk Mitigation Strategies

1. **Incremental Rollout**: One job at a time, with monitoring
2. **Staging Testing**: Minimum 2-3 days per job in staging
3. **Production Soak**: 3-5 days minimum before next migration
4. **Off-Peak Deployments**: Critical jobs deployed during low traffic
5. **Rollback Plan**: Tested and documented for quick reversion
6. **Monitoring**: Comprehensive CloudWatch metrics and alerts
7. **Communication**: Team notified before each deployment

---

## Success Metrics

### Technical Metrics

- ✅ All jobs migrated to SolidQueue
- ✅ Zero data loss
- ✅ Error rates ≤ baseline
- ✅ Latency ≤ baseline
- ✅ No delayed_job processes running
- ✅ All tests passing

### Operational Metrics

- ✅ Simplified worker management (no custom scripts)
- ✅ Better monitoring (Mission Control)
- ✅ Reduced infrastructure (no Redis/separate queue server)
- ✅ Team trained on new system
- ✅ Documentation updated

### Business Metrics

- ✅ No user-facing issues
- ✅ No increase in support tickets
- ✅ No degradation in email delivery
- ✅ No impact on AI features

---

## Appendix

### Useful Commands

#### SolidQueue Management

```bash
# Start workers
bin/rails solid_queue:start

# Stop workers gracefully
pkill -TERM -f solid_queue

# Check worker status
ps aux | grep solid_queue

# Monitor logs
tail -f log/solid_queue.log
```

#### Job Inspection

```ruby
# All jobs
SolidQueue::Job.all

# By status
SolidQueue::ReadyExecution.all       # Ready to run
SolidQueue::ScheduledExecution.all   # Scheduled
SolidQueue::ClaimedExecution.all     # Running
SolidQueue::FailedExecution.all      # Failed

# By job class
SolidQueue::Job.where(class_name: 'MyJob')

# Retry failed job
failed_job = SolidQueue::FailedExecution.first
failed_job.retry
```

#### Metrics Queries

```ruby
# Queue depth
SolidQueue::Job.where(finished_at: nil).count

# Jobs by queue
SolidQueue::Job.group(:queue_name).count

# Failed jobs last hour
SolidQueue::FailedExecution.where('failed_at > ?', 1.hour.ago).count

# Average latency
jobs = SolidQueue::Job.where.not(finished_at: nil).limit(100)
jobs.pluck('TIMESTAMPDIFF(SECOND, created_at, ready_at)').sum / jobs.count
```

### Further Reading

- **SolidQueue GitHub**: https://github.com/rails/solid_queue
- **ActiveJob Guides**: https://guides.rubyonrails.org/active_job_basics.html
- **Mission Control**: https://github.com/rails/mission_control-jobs
- **BigBinary Migration**: https://www.bigbinary.com/blog/migrating-to-solid-queue-from-sidekiq
- **AppSignal Guide**: https://blog.appsignal.com/2025/05/07/an-introduction-to-solid-queue-for-ruby-on-rails.html

### Contact & Support

- **Technical Lead**: [Name]
- **Infrastructure Team**: [Slack channel]
- **On-Call**: [PagerDuty schedule]

---

**Document Version**: 1.0
**Last Updated**: 2025-10-15
**Author**: Claude Code (with engineer review)
**Status**: Draft - Awaiting Review
