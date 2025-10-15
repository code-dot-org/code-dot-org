# ActiveJob Background Workers

This document provides technical details about the ActiveJob implementation at Code.org, including worker infrastructure, job architecture, deployment procedures, and monitoring.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Backend: delayed_job](#backend-delayed_job)
- [Worker Infrastructure](#worker-infrastructure)
- [Job Class Hierarchy](#job-class-hierarchy)
- [Queue Configuration](#queue-configuration)
- [Development Workflow](#development-workflow)
- [Deployment & Rolling Restarts](#deployment--rolling-restarts)
- [Monitoring & Metrics](#monitoring--metrics)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Code.org uses **Rails ActiveJob** as the abstraction layer for background job processing, with **delayed_job** (via `delayed_job_active_record`) as the queue adapter backend. Jobs are stored in a MySQL `delayed_jobs` table and processed by worker processes running on dedicated daemon servers.

### Key Components

- **Queue Adapter**: `delayed_job_active_record` (~> 4.1)
- **Queue Backend**: MySQL `delayed_jobs` table
- **Workers**: Separate daemon processes managed by `bin/restart-active-job-workers`
- **Worker Host**: `production-daemon` server
- **Monitoring**: CloudWatch metrics via `ActiveJobMetrics` concern
- **Error Reporting**: Honeybadger via `ActiveJobReporting` concern

---

## Backend: delayed_job

### Configuration

**Gemfile:**
```ruby
gem "delayed_job_active_record", "~> 4.1"
```

**Rails Configuration** (`dashboard/config/application.rb:247`):
```ruby
config.active_job.queue_adapter = CDO.active_job_queue_adapter
```

**Environment-Specific:**
- **Production/Staging/Test**: `:delayed_job` (config.yml.erb:674)
- **Development**: `:async` (runs immediately, no workers needed) (config/development.yml.erb:87)

### Database Schema

The `delayed_jobs` table (created in migration `20230927182433_create_delayed_jobs.rb`) stores:

| Column | Type | Purpose |
|--------|------|---------|
| `priority` | integer | Job priority (lower = higher priority) |
| `attempts` | integer | Number of execution attempts |
| `handler` | text | YAML-encoded job object |
| `last_error` | text | Error message from last failure |
| `run_at` | datetime | When to execute the job |
| `locked_at` | datetime | When a worker claimed the job |
| `failed_at` | datetime | When all retries exhausted |
| `locked_by` | string | Worker ID holding the lock |
| `queue` | string | Named queue (default, mailers, mailjet) |

**Index:** `(priority, run_at)` for efficient job fetching.

---

## Worker Infrastructure

### Worker Location

Workers run exclusively on the **production-daemon** server, determined by:

```ruby
# config.yml.erb:496
daemon: <%=name == 'production-daemon'%>
```

The PostgreSQL gem is conditionally installed on daemon servers:
```ruby
# Gemfile:337-345
require_pg = lambda do
  require 'socket'
  %w[production-daemon production-console i18n-dev].include?(Socket.gethostname)
end
```

### Worker Configuration

**Default Settings** (config.yml.erb):
```yaml
active_job_backend_n_workers_to_start: 10
active_job_backend_rolling_restart_in_n_batches: 2
```

Override in `locals.yml`:
```yaml
active_job_backend_n_workers_to_start: 20
active_job_backend_rolling_restart_in_n_batches: 4
```

### Worker Process Details

- **PID Files**: `dashboard/tmp/pids/delayed_job.N.pid`
- **Log Files**: `dashboard/log/delayed_job.N.log`
- **Process Names**: `delayed_job.0`, `delayed_job.1`, etc.

Workers are managed by a custom `Cdo::ActiveJobBackend::Command` class (subclass of `Delayed::Command`) that allows specifying worker indices for batch operations.

### Starting/Restarting Workers

**Manual Restart:**
```bash
bin/restart-active-job-workers
```

**Automatic Restart** (during deployment):
```bash
cd dashboard
bundle exec rake build:dashboard
# Workers restart automatically on daemon servers
```

**Development** (no workers needed with `:async` adapter):
```ruby
# Jobs execute immediately in the current process
SampleJob.perform_later('test')
```

---

## Job Class Hierarchy

### Base Classes

```
ActiveJob::Base
└── ApplicationJob (dashboard/app/jobs/application_job.rb)
    ├── include ActiveJobMetrics      # CloudWatch metrics
    ├── include ActiveJobReporting    # Honeybadger error reporting
    └── [All application jobs inherit from this]
```

**ApplicationJob** (`dashboard/app/jobs/application_job.rb`):
```ruby
class ApplicationJob < ActiveJob::Base
  include ActiveJobMetrics
  include ActiveJobReporting

  # Uncomment to enable automatic retries:
  # retry_on ActiveRecord::Deadlocked

  # Uncomment to discard jobs with missing records:
  # discard_on ActiveJob::DeserializationError
end
```

### Production Job Classes

#### AI/Chat Jobs

**`AichatRequestChatCompletionJob`** (`dashboard/app/jobs/aichat_request_chat_completion_job.rb`):
- **Queue**: `:default`
- **Purpose**: Process AI chat completions (OpenAI/Gemini) with safety filtering
- **Callbacks**: `before_enqueue`, `before_perform`, `after_perform`
- **Error Handling**: Catches all exceptions, updates request status
- **Safety Checks**: Toxicity detection, PII filtering for user input and model output
- **Metrics**: Custom CloudWatch metrics in `SharedConstants::AICHAT_METRICS_NAMESPACE`

**`EvaluateRubricJob`** (`dashboard/app/jobs/evaluate_rubric_job.rb`):
- **Queue**: `:default`
- **Purpose**: AI-powered rubric evaluation for student code
- **Includes**: `AiRubricMetrics`, `AiRubricConfig`
- **Retry Logic**:
  - `TooManyRequestsError` (429): 3 attempts, exponential backoff
  - `Timeout::Error`, `Net::ReadTimeout`: 2 attempts, 10s wait
  - `ServiceUnavailableError` (503): 3 attempts, exponential backoff
  - `GatewayTimeoutError` (504): 3 attempts, exponential backoff
- **Error Handling**: Custom exceptions for request size, rate limits, student/teacher limits
- **Safety**: PII and profanity filtering with specific status codes

#### Email Jobs

**`MailDeliveryJob`** (`dashboard/app/jobs/mail_delivery_job.rb`):
```ruby
class MailDeliveryJob < ActionMailer::MailDeliveryJob
  include ActiveJobMetrics
  include ActiveJobReporting

  rescue_from StandardError, with: :report_exception
end
```
- **Queue**: `:mailers` (configured globally for all mailers)
- **Purpose**: Deliver emails via ActionMailer
- **Usage**: Automatically used when calling `.deliver_later` on any mailer

**`MailjetDeliveryJob`**:
- **Queue**: `:mailjet`
- **Purpose**: Mailjet-specific email delivery

#### User Management Jobs

**`User::PiiScrubberJob`** (`dashboard/app/jobs/user/pii_scrubber_job.rb`):
- **Purpose**: Scrub PII from soft-deleted accounts after 28 days
- **Gated**: Only runs when `DCDO.get('pii-scrub-enabled', false)` is true
- **Delegates to**: `ExpiredDeletedAccountPiiScrubber` service

**`User::InactiveTeacherDeletionWarningJob`**:
- **Purpose**: Send warnings to inactive teachers before account deletion

**`User::InactiveUserDeletionJob`**:
- **Purpose**: Delete inactive user accounts after warning period

#### Child Account Policy Jobs

**`CAP::LockoutJob`** (`dashboard/app/jobs/cap/lockout_job.rb`):
- **Purpose**: Lock out child accounts based on state CAP requirements
- **Scheduling**: Uses `wait_until` to schedule future execution
- **Rescheduling**: Automatically reschedules if lockout date changes (max 1 retry)
- **Error Handling**: `rescue_from StandardError, with: :report_exception`

**`CAP::TeacherSectionsWarningJob`**:
- **Purpose**: Warn teachers about students approaching CAP lockout

#### Development/Testing Jobs

**`SampleJob`** (`dashboard/app/jobs/sample_job.rb`):
- **Purpose**: Example job for testing the queue
- **Usage**: `SampleJob.perform_later('world')` from `dashboard-console`
- **Features**: Demonstrates all callback hooks (before/after/around enqueue/perform)

---

## Queue Configuration

### Named Queues

Configured in `config.yml.erb:668-671`:

```yaml
active_job_queues:
  :default: :default
  :mailers: :mailers
  :mailjet: :mailjet
```

### Queue Assignment

**In Job Classes:**
```ruby
class MyJob < ApplicationJob
  queue_as :default  # or :mailers, :mailjet
end
```

**Global Mailer Queue** (`dashboard/config/application.rb:219`):
```ruby
config.action_mailer.deliver_later_queue_name = CDO.active_job_queues[:mailers]
```

### Queue Priority

Jobs are processed by priority (lower number = higher priority), then by `run_at` time. The default priority is `0`. To set priority:

```ruby
MyJob.set(priority: 10).perform_later(args)
```

---

## Development Workflow

### Local Development Setup

By default, development uses the `:async` adapter which runs jobs immediately:

```ruby
# config/development.yml.erb:87
active_job_queue_adapter: :async
```

**No workers needed** - jobs execute synchronously in the current process.

### Testing with delayed_job Locally

To test the actual queue behavior:

1. **Enable delayed_job** in `locals.yml`:
   ```yaml
   active_job_queue_adapter: :delayed_job
   ```

2. **Start workers manually**:
   ```bash
   bin/restart-active-job-workers
   ```

3. **Enqueue jobs** from `dashboard-console`:
   ```ruby
   SampleJob.perform_later('test message')
   ```

4. **Monitor queue**:
   ```ruby
   Delayed::Job.all
   Delayed::Job.where(queue: 'default').count
   ```

5. **Check logs**:
   ```bash
   tail -f dashboard/log/delayed_job.0.log
   ```

### Creating a New Job

1. **Generate the job**:
   ```bash
   cd dashboard
   bundle exec rails generate job MyNewJob
   ```

2. **Implement the job**:
   ```ruby
   class MyNewJob < ApplicationJob
     queue_as :default

     def perform(user_id:, data:)
       user = User.find(user_id)
       # Do work here
     end
   end
   ```

3. **Add error handling** (optional):
   ```ruby
   class MyNewJob < ApplicationJob
     retry_on SomeRetriableError, wait: :exponentially_longer, attempts: 3
     discard_on SomeUnrecoverableError

     rescue_from StandardError do |exception|
       report_exception(exception)  # From ActiveJobReporting
     end
   end
   ```

4. **Test the job**:
   ```ruby
   # spec/jobs/my_new_job_spec.rb
   require 'rails_helper'

   RSpec.describe MyNewJob, type: :job do
     it 'processes the data' do
       MyNewJob.perform_now(user_id: 1, data: 'test')
       # Assertions...
     end
   end
   ```

### Enqueuing Jobs

**Immediate execution (async adapter or .perform_now)**:
```ruby
MyJob.perform_now(arg1, arg2)
```

**Enqueue for background processing**:
```ruby
MyJob.perform_later(arg1, arg2)
```

**Enqueue with options**:
```ruby
# Delay execution
MyJob.set(wait: 1.hour).perform_later(arg1, arg2)

# Schedule for specific time
MyJob.set(wait_until: Date.tomorrow.noon).perform_later(arg1, arg2)

# Set priority
MyJob.set(priority: 5).perform_later(arg1, arg2)

# Set queue
MyJob.set(queue: :default).perform_later(arg1, arg2)
```

---

## Deployment & Rolling Restarts

### Deployment Sequence

During `rake build:dashboard` on daemon servers (`lib/rake/build.rake:116-132`):

1. **Database migrations** run first
2. **Database seeding** updates
3. **Active Job workers restart** (rolling, zero-downtime)
4. **Web server restarts** last

**Why this order?** Workers restart before web servers to ensure:
- Job code is backward compatible with any enqueued jobs
- New web server code can safely enqueue jobs for updated workers
- No jobs fail due to incompatible serialization

### Rolling Restart Process

The rolling restart (`lib/cdo/active_job_backend.rb`) prevents downtime:

#### Phase 1: Pre-fork Optimization
```ruby
Cdo::ActiveJobBackend.before_worker_fork
# Loads Rails environment into memory once
# All workers share this memory via copy-on-write
```

#### Phase 2: Rolling Restart in Batches
```ruby
# With 10 workers and 2 batches:
# Batch 1: Stop workers 0-4, start 5 new workers
# Batch 2: Stop workers 5-9, start 5 new workers
```

#### Phase 3: Graceful Shutdown
```ruby
# Send TERM signal to workers
# Wait 60 seconds for jobs to complete
# Send KILL signal if still running
# Remove PID files
```

#### Phase 4: Verification
```ruby
# Ensure no workers older than restart time
# Verify correct number of workers running
# Acceptable failure rate: 2% (e.g., 1 failed worker out of 50)
```

### Manual Worker Management

**Restart all workers**:
```bash
bin/restart-active-job-workers
```

**Stop workers** (not recommended - use restart):
```bash
# Find worker PIDs
ps aux | grep delayed_job

# Gracefully stop a worker
kill -TERM <pid>

# Force stop a worker (last resort)
kill -KILL <pid>
```

**Check worker status**:
```bash
# View running workers
ps aux | grep delayed_job

# Check PID files
ls -la dashboard/tmp/pids/delayed_job.*.pid

# View worker logs
tail -f dashboard/log/delayed_job.0.log
```

### PID File Management

The restart process handles a delayed_job bug where `delayed_job.22.pid` can be mistaken for `delayed_job.2.pid`. The workaround:

1. Delete all PID files before restart
2. Track PIDs in memory
3. Stop processes by PID (not by PID file)
4. Recreate PID files after workers start

---

## Monitoring & Metrics

### CloudWatch Metrics (ActiveJobMetrics)

All jobs inheriting from `ApplicationJob` automatically report metrics to CloudWatch namespace: `code-dot-org/ActiveJob`

#### Job-Level Metrics

**Queue Depth Metrics** (reported after enqueue):
- `QueuedJobCount`: Total jobs in queue (includes scheduled, running, waiting)
- `PendingJobCount`: Jobs ready to run (run_at <= now)
- `WaitingToStartJobCount`: Pending jobs not yet locked by a worker
- `FailedJobCount`: Jobs that have failed at least once
- `OldestPendingJobAge`: Seconds since oldest pending job created
- `OldestWaitingToStartJobAge`: Seconds since oldest waiting job created

**Timing Metrics** (reported during/after perform):
- `WaitTime`: Time between enqueue and start of execution (seconds)
- `ExecutionTime`: Time to execute the job (seconds)
- `TotalTime`: Total time from enqueue to completion (seconds)

#### Dimensions

All metrics include dimensions:
- `Environment`: rack_env (production, staging, test, etc.)
- `JobName`: Name of the job class (e.g., `EvaluateRubricJob`)

#### Overall Queue Metrics

The `ActiveJobMetrics.report_overall_queue_metrics` method reports aggregate metrics across all job types (no `JobName` dimension).

### Custom Job Metrics

Jobs can report custom metrics:

```ruby
class MyJob < ApplicationJob
  def perform
    Cdo::Metrics.push('MyApp/CustomMetrics', [
      {
        metric_name: 'ItemsProcessed',
        value: items.count,
        unit: 'Count',
        timestamp: Time.now,
        dimensions: [
          {name: 'Environment', value: CDO.rack_env},
          {name: 'JobType', value: self.class.name},
        ]
      }
    ])
  end
end
```

### Error Reporting (ActiveJobReporting)

All unhandled exceptions are automatically reported to Honeybadger with job context:

```ruby
# Automatic via ActiveJobReporting concern
rescue_from StandardError, with: :report_exception
```

Manual error reporting:
```ruby
Honeybadger.notify(
  exception,
  context: {
    user_id: user.id,
    custom_data: 'value'
  }
)
```

### Monitoring Queries

**Check queue depth** (from Rails console):
```ruby
# Overall
Delayed::Job.count

# By queue
Delayed::Job.where(queue: 'default').count

# Pending jobs (ready to run)
Delayed::Job.where('run_at <= ?', Time.now).count

# Failed jobs
Delayed::Job.where.not(failed_at: nil).count

# Locked jobs (currently running)
Delayed::Job.where.not(locked_at: nil).count

# Jobs waiting for a worker
Delayed::Job.where('run_at <= ?', Time.now).where(locked_at: nil).count
```

**Check oldest jobs**:
```ruby
# Oldest pending job
Delayed::Job.where('run_at <= ?', Time.now).order(:created_at).first

# How long has it been waiting?
oldest = Delayed::Job.where('run_at <= ?', Time.now).order(:created_at).first
Time.now - oldest.created_at if oldest
```

**Job-specific queries**:
```ruby
# Using ActiveJobMetrics helpers
EvaluateRubricJob.new.queued_jobs.count
EvaluateRubricJob.new.pending_jobs.count
EvaluateRubricJob.new.oldest_pending_job_age_s
```

### Logs

**Worker logs**:
```bash
# All workers
tail -f dashboard/log/delayed_job.*.log

# Specific worker
tail -f dashboard/log/delayed_job.0.log

# Search for errors
grep ERROR dashboard/log/delayed_job.*.log

# Search for specific job
grep "EvaluateRubricJob" dashboard/log/delayed_job.*.log
```

**Rails logs**:
```bash
# Job enqueueing
grep "Enqueued" dashboard/log/development.log

# Job execution (async adapter)
grep "Performed" dashboard/log/development.log
```

---

## Troubleshooting

### Workers Not Processing Jobs

**Symptoms**: Jobs stuck in queue, `locked_at` is NULL

**Diagnosis**:
```bash
# Check if workers are running
ps aux | grep delayed_job

# Check queue adapter configuration
cd dashboard
bundle exec rails runner "puts Rails.application.config.active_job.queue_adapter"

# Check PID files
ls dashboard/tmp/pids/delayed_job.*.pid

# Check worker logs for errors
tail -100 dashboard/log/delayed_job.0.log
```

**Solutions**:

1. **Workers not running** - Start them:
   ```bash
   bin/restart-active-job-workers
   ```

2. **Wrong adapter** - Check `locals.yml` or environment config

3. **Workers crashed** - Check logs, restart:
   ```bash
   bin/restart-active-job-workers
   ```

### Jobs Failing Repeatedly

**Symptoms**: High `FailedJobCount`, jobs have `failed_at` set

**Diagnosis**:
```ruby
# From Rails console
failed_jobs = Delayed::Job.where.not(failed_at: nil)
failed_jobs.pluck(:id, :attempts, :last_error)

# Examine a specific job
job = Delayed::Job.find(123)
puts job.last_error
```

**Solutions**:

1. **Check error messages** in `last_error` column
2. **Review Honeybadger** for exception details
3. **Fix underlying issue** and retry:
   ```ruby
   job = Delayed::Job.find(123)
   job.update!(failed_at: nil, attempts: 0, locked_at: nil, locked_by: nil)
   ```
4. **Delete unfixable jobs**:
   ```ruby
   Delayed::Job.where(id: 123).delete_all
   ```

### Jobs Taking Too Long

**Symptoms**: High `ExecutionTime`, `WaitTime`, or `TotalTime` metrics

**Diagnosis**:
```ruby
# Check locked jobs (currently running)
Delayed::Job.where.not(locked_at: nil).pluck(:id, :locked_at, :locked_by, :handler)

# Check how long they've been running
locked_jobs = Delayed::Job.where.not(locked_at: nil)
locked_jobs.each do |job|
  runtime = Time.now - job.locked_at
  puts "Job #{job.id} running for #{runtime}s"
end
```

**Solutions**:

1. **Optimize job code** - Profile and reduce work per job
2. **Break into smaller jobs** - Process in batches
3. **Increase worker count** - If CPU/memory allows:
   ```yaml
   # locals.yml
   active_job_backend_n_workers_to_start: 20
   ```
4. **Add timeouts** for external API calls
5. **Kill stuck jobs** (last resort):
   ```ruby
   # Find the worker PID from locked_by
   job = Delayed::Job.find(123)
   # locked_by format: "delayed_job.0 host:production-daemon pid:12345"
   # Kill the process, then clear the lock
   job.update!(locked_at: nil, locked_by: nil)
   ```

### Queue Backlog Growing

**Symptoms**: `WaitingToStartJobCount` increasing, `OldestWaitingToStartJobAge` high

**Diagnosis**:
```ruby
# Check job arrival rate vs processing rate
waiting = Delayed::Job.where('run_at <= ?', Time.now).where(locked_at: nil).count
running = Delayed::Job.where.not(locked_at: nil).count

puts "Waiting: #{waiting}, Running: #{running}"

# Check jobs per queue
Delayed::Job.group(:queue).count
```

**Solutions**:

1. **Increase worker count**:
   ```yaml
   # locals.yml
   active_job_backend_n_workers_to_start: 20
   ```
   Then restart: `bin/restart-active-job-workers`

2. **Optimize hot jobs** - Profile jobs with highest count

3. **Add priority** to important jobs:
   ```ruby
   CriticalJob.set(priority: 0).perform_later(args)
   ```

4. **Defer non-critical jobs**:
   ```ruby
   NonCriticalJob.set(wait: 1.hour).perform_later(args)
   ```

5. **Pause job creation** temporarily (if possible)

### Worker Memory Issues

**Symptoms**: Workers killed by OOM, slow performance, swap usage

**Diagnosis**:
```bash
# Check worker memory usage
ps aux | grep delayed_job | awk '{print $6, $11}'

# Check system memory
free -h

# Monitor over time
watch -n 5 'ps aux | grep delayed_job'
```

**Solutions**:

1. **Reduce worker count**:
   ```yaml
   active_job_backend_n_workers_to_start: 5
   ```

2. **Fix memory leaks** in job code - Profile with memory_profiler gem

3. **Restart workers periodically** (if chronic leak):
   ```bash
   # Add to cron (not ideal, but temporary fix)
   0 2 * * * /path/to/bin/restart-active-job-workers
   ```

4. **Increase server memory** (infrastructure change)

### Database Connection Issues

**Symptoms**: "Too many connections", "Lost connection to MySQL server"

**Diagnosis**:
```ruby
# Check connection pool size
ActiveRecord::Base.connection_pool.size

# Check active connections
ActiveRecord::Base.connection_pool.connections.count
```

**Solutions**:

1. **Ensure connections are released** in job code:
   ```ruby
   def perform
     ActiveRecord::Base.connection_pool.with_connection do
       # Do work here
     end
   end
   ```

2. **Increase connection pool** (if needed):
   ```yaml
   # database.yml
   pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 20 } %>
   ```

3. **Reduce worker count** if pool exhaustion occurs

### Deployment Issues

**Symptoms**: Workers fail to restart, old workers remain running

**Diagnosis**:
```bash
# Check for old workers
ps aux | grep delayed_job | awk '{print $2, $9, $11}'

# Check PID files
ls -la dashboard/tmp/pids/delayed_job.*.pid

# Check deployment logs
tail -100 dashboard/log/production.log
```

**Solutions**:

1. **Manual cleanup**:
   ```bash
   # Kill all workers
   pkill -f delayed_job

   # Remove PID files
   rm dashboard/tmp/pids/delayed_job.*.pid

   # Restart workers
   bin/restart-active-job-workers
   ```

2. **Check for stuck jobs** preventing graceful shutdown:
   ```ruby
   # Jobs running > 5 minutes
   Delayed::Job.where('locked_at < ?', 5.minutes.ago)
   ```

3. **Review timeout settings** in `active_job_backend.rb`

### Serialization Errors

**Symptoms**: "Job failed to execute", "couldn't find record"

**Diagnosis**:
```ruby
# Check job arguments
job = Delayed::Job.find(123)
YAML.load(job.handler)
```

**Solutions**:

1. **Pass IDs, not objects**:
   ```ruby
   # Good
   MyJob.perform_later(user_id: user.id)

   # Bad (can fail if user deleted)
   MyJob.perform_later(user: user)
   ```

2. **Enable automatic discard**:
   ```ruby
   class ApplicationJob < ActiveJob::Base
     discard_on ActiveJob::DeserializationError
   end
   ```

3. **Add nil checks** in job code:
   ```ruby
   def perform(user_id:)
     user = User.find_by(id: user_id)
     return unless user
     # Do work
   end
   ```

---

## Best Practices

### Job Design

1. **Keep jobs idempotent** - Safe to run multiple times
2. **Keep jobs small** - <5 minutes execution time
3. **Fail fast** - Don't retry permanently failed jobs
4. **Pass IDs, not objects** - Avoid serialization issues
5. **Handle missing records gracefully** - Records may be deleted
6. **Use transactions sparingly** - They can cause deadlocks

### Error Handling

1. **Use retry_on for transient errors**:
   ```ruby
   retry_on Net::ReadTimeout, wait: 10.seconds, attempts: 3
   ```

2. **Use discard_on for permanent errors**:
   ```ruby
   discard_on ActiveJob::DeserializationError
   ```

3. **Log context before raising**:
   ```ruby
   rescue_from StandardError do |exception|
     Rails.logger.error("Job failed: #{exception.message}, user_id=#{@user_id}")
     raise exception
   end
   ```

### Performance

1. **Batch similar jobs** together
2. **Use bulk operations** (e.g., `User.where(id: ids).update_all(...)`)
3. **Eager load associations** to avoid N+1 queries
4. **Set appropriate priority** for time-sensitive jobs
5. **Monitor CloudWatch metrics** to detect performance degradation

### Testing

1. **Test with .perform_now** for speed
2. **Test retry logic** by mocking failures
3. **Test error handling** for edge cases
4. **Use test adapter** for integration tests:
   ```ruby
   # config/environments/test.rb
   config.active_job.queue_adapter = :test
   ```

5. **Check job enqueueing**:
   ```ruby
   expect {
     MyJob.perform_later(arg)
   }.to have_enqueued_job(MyJob).with(arg)
   ```

---

## Additional Resources

- **Rails ActiveJob Guide**: https://guides.rubyonrails.org/active_job_basics.html
- **delayed_job GitHub**: https://github.com/collectiveidea/delayed_job
- **delayed_job_active_record**: https://github.com/collectiveidea/delayed_job_active_record
- **Code Files**:
  - Worker management: `lib/cdo/active_job_backend.rb`
  - Restart script: `bin/restart-active-job-workers`
  - Base job: `dashboard/app/jobs/application_job.rb`
  - Metrics concern: `dashboard/app/jobs/concerns/active_job_metrics.rb`
  - Build configuration: `lib/rake/build.rake`
  - Configuration: `config.yml.erb`, `dashboard/config/application.rb`
