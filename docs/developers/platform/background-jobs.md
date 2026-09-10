---
title: Background jobs
description: ActiveJob with delayed_job, the k8s worker deployment, the Chef crontab, and how to add a new job.
type: concept
---

Background work in CodeAI runs through two mechanisms: ActiveJob for on-demand async tasks and a Chef-rendered crontab for scheduled work.

## ActiveJob and delayed_job

The queue adapter is configured per environment via `CDO.active_job_queue_adapter`:

| Environment | Adapter | Behavior |
|---|---|---|
| production, staging | `:delayed_job` | Jobs are written to a MySQL `delayed_jobs` table and executed by a separate worker process. |
| development | `:async` | Jobs run in-process in a thread pool. No worker needed. |
| test | `:test` | Jobs are queued in memory for assertion. |

To use delayed_job locally, uncomment `active_job_queue_adapter: :delayed_job` in `locals.yml` and run `bin/restart-active-job-workers`.

### Worker deployment

The delayed_job worker runs as a Kubernetes Deployment (`cdo-active-job-worker`) defined in `k8s/kustomize/components/backend/active-job-worker-deployment.yaml`. Its command is `cd dashboard && bundle exec bin/delayed_job run`. This was the first piece of the app to move to Kubernetes.

The delayed_job config in `dashboard/config/initializers/delayed_job_config.rb` sets `max_attempts` to 1 and `destroy_failed_jobs` to false. Failed jobs are archived and reported to CloudWatch by `dashboard/lib/delayed_job_manager.rb`. Per-queue priority is loaded from `CDO.active_job_queues`.

### Job files

Job classes live in `dashboard/app/jobs/`. There are currently 16 job files (excluding `application_job.rb` and concerns), covering AI chat completion, rubric evaluation, lesson summary podcasts, mail delivery, roster sync, project storage cleanup, and account inactivity purges.

Python-based jobs under `python/` are invoked from ActiveJob via a shell-out pattern. See `python/README.md` for setup.

## Scheduled work (Chef crontab)

There is no `whenever` gem and no Kubernetes CronJob resources. All scheduled work is defined in a single Chef template: `cookbooks/cdo-apps/templates/default/crontab.erb`, rendered by `cookbooks/cdo-apps/recipes/crontab.rb` and installed via `crontab -`.

Jobs are scoped by server role. The full list:

### Staging daemon

| Job | Schedule (UTC) |
|---|---|
| `update_dotd` | `0 14,15 * * *` |
| `update_dts` | `*/1 * * * *` |
| `commit_trusted_proxies` | `0 17 * * *` |
| `merge_lb_to_staging` | `35 7 * * 1-5` |
| `deploy_to_levelbuilder` | `20 9 * * 1-5` |

### Test daemon

| Job | Schedule (UTC) |
|---|---|
| `deploy_to_test` | `*/2 * * * *` |
| `snapshot` | `*/5 * * * *` |
| `monitor_mysql_to_redshift_zeroetl_integration` | `30 * * * *` |

### Levelbuilder

| Job | Schedule (UTC) |
|---|---|
| `commit_content` | `30 7 * * 1-5` and `18 9 * * 1-5` |

### Production daemon

| Job | Schedule (UTC) |
|---|---|
| `scheduled_pd_workshop_emails` | `30 14 * * *` |
| `scheduled_pd_application_emails` | `0 16 * * *` |
| `process_pd_workshop_ends` | `*/4 * * * *` |
| `fill_jotform_placeholders` | `*/5 * * * *` |
| `process_foorm_data` | `0 6 * * *` |
| `delete_twilio_data` | `*/10 * * * *` |
| `confirm_usage` | `* * * * *` |
| `teacher_applications_to_gdrive` | `0 */2 * * *` |
| `summer_workshops_to_gdrive` | `0 5 * * *` |
| `eir_teachers_to_gdrive` | `0 13 * * *` |
| `stop_inactive_adhoc_instances` | `0 7 * * 6` |
| `redshift_rollups` | `0 10 * * *` |
| `cleanup_workshop_attendance_codes` | `1 7 * * 6` |
| `zendesk_slack_report` | `31 16 * * 1-5` |
| `applab_datasets daily_weather` | `5 12 * * *` |
| `applab_datasets viral_50_usa` | `0 12 * * *` |
| `export_mysql_database_to_redshift` | `00 23 * * *` |
| `monitor_mysql_to_redshift_zeroetl_integration` | `30 * * * *` |
| `build_contact_rollups_v2` | `0 0 * * *` |
| `hoc_student_name_cleanup` | `0 2 * * *` |
| `send_permission_email_reminders` | `0 0 * * *` |
| `monitor_projects` | `*/5 * * * *` |

The cron runner scripts live under `bin/cron/`. Cron job failures are reported to a separate Honeybadger project via `CDO.cronjobs_honeybadger_api_key` (see `lib/cdo/honeybadger.rb`).

## Add a new job

### On-demand (ActiveJob)

1. Create a job class in `dashboard/app/jobs/`:

   ```ruby
   class MyNewJob < ApplicationJob
     queue_as :default

     def perform(arg)
       # ...
     end
   end
   ```

2. Enqueue it from a controller or service: `MyNewJob.perform_later(arg)`.

3. In development, it runs immediately in-process. In production, the k8s worker picks it up from the `delayed_jobs` table.

### Scheduled (cron)

1. Write a runner script in `bin/cron/`.
2. Add the cron line to `cookbooks/cdo-apps/templates/default/crontab.erb` under the correct server-role guard.
3. The cron job runs `bin/cron/<your_script>` with `bundle exec` and the Rails environment loaded.

For error reporting from cron jobs, use `Honeybadger.notify_cronjob_error` (defined in `lib/cdo/honeybadger.rb`).
