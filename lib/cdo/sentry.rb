# frozen_string_literal: true

require 'sentry-ruby'

# Sentry for processes that do not boot Rails: bin/ scripts and lib/ code.
# Rails processes get Sentry from the observability engine instead.
module Sentry
  # Reports one cron run as Cron Monitor check-ins; the block returns the command's [stdout, stderr, status].
  def self.monitor_cronjob(command, slug:, schedule:)
    return yield unless slug && schedule && CDO.enable_sentry && !CDO.unit_test

    init do |config|
      config.dsn = CDO.cronjobs_sentry_dsn
      config.send_default_pii = false
    end

    monitor_config = Cron::MonitorConfig.from_crontab(schedule)
    check_in_id = capture_check_in(slug, :in_progress, monitor_config: monitor_config)
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    stdout, stderr, status = yield
    duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started

    # A "Script already running" abort exits 1, so it fails the monitor too: the previous run overran into this tick.
    capture_check_in(slug, status.success? ? :ok : :error, check_in_id: check_in_id, duration: duration, monitor_config: monitor_config)
    unless status.success?
      message = "cronjob #{command} returned #{status.exitstatus}"
      # Sentry would otherwise group every failure by the wrapper's own stack trace.
      capture_message(message, fingerprint: [message], extra: {stdout: stdout, stderr: stderr})
    end

    [stdout, stderr, status]
  end
end
