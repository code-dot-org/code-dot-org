# frozen_string_literal: true

require 'httparty'
require 'sentry-ruby'
require 'sentry/dsn'
require_relative 'github'

# Sentry for processes that do not boot Rails: bin/ scripts and lib/ code.
# Rails processes get Sentry from the observability engine instead.
module Cdo
  module Sentry
    UNTRACKED_ENVIRONMENTS = Set[:adhoc, :development]

    # Records a deploy in Sentry as a release plus a deploy.
    def self.notify_new_release(environment, revision)
      return if UNTRACKED_ENVIRONMENTS.include?(environment.to_sym)
      if CDO.sentry_releases_token.to_s.empty? || CDO.dashboard_sentry_dsn.to_s.empty?
        CDO.log.warn '[sentry] sentry_releases_token or dashboard_sentry_dsn is not configured; skipping release'
        return
      end

      # apps and studio ship with every dashboard deploy, so the release covers their projects too.
      project_dsns = [CDO.dashboard_sentry_dsn, CDO.frontend_apps_sentry_dsn, CDO.frontend_studio_sentry_dsn]
      projects = project_dsns.reject {|dsn| dsn.to_s.empty?}.map {|dsn| ::Sentry::DSN.new(dsn).project_id}
      organization_id = ::Sentry::DSN.new(CDO.dashboard_sentry_dsn).org_id
      sentry_releases_endpoint = "https://sentry.io/api/0/organizations/#{organization_id}/releases/"
      post(sentry_releases_endpoint, version: revision, projects: projects, refs: [{repository: GitHub::REPO, commit: revision}])
      # https://docs.sentry.io/api/releases/create-a-deploy/
      post("#{sentry_releases_endpoint}#{revision}/deploys/", environment: environment.to_s)
    rescue StandardError => exception
      CDO.log.warn "[sentry] release #{revision} not recorded: #{exception.class}: #{exception.message}"
    end

    # Reports one cron run as Cron Monitor check-ins; the block returns the command's [stdout, stderr, status].
    def self.monitor_cronjob(command, slug:, schedule:)
      return yield unless slug && schedule && CDO.enable_sentry && !CDO.unit_test

      ::Sentry.init do |config|
        config.dsn = CDO.cronjobs_sentry_dsn
        config.send_default_pii = false
      end

      monitor_config = ::Sentry::Cron::MonitorConfig.from_crontab(schedule)
      check_in_id = ::Sentry.capture_check_in(slug, :in_progress, monitor_config: monitor_config)
      started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      stdout, stderr, status = yield
      duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started

      # A "Script already running" abort exits 1, so it fails the monitor too: the previous run overran into this tick.
      ::Sentry.capture_check_in(slug, status.success? ? :ok : :error, check_in_id: check_in_id, duration: duration, monitor_config: monitor_config)
      unless status.success?
        message = "cronjob #{command} returned #{status.exitstatus}"
        # Sentry would otherwise group every failure by the wrapper's own stack trace.
        ::Sentry.capture_message(message, fingerprint: [message], extra: {stdout: stdout, stderr: stderr})
      end

      [stdout, stderr, status]
    end

    private_class_method def self.post(url, body)
      response = HTTParty.post(
        url,
        headers: {'Authorization' => "Bearer #{CDO.sentry_releases_token}", 'Content-Type' => 'application/json'},
        body: body.to_json
      )
      return if response.success?

      raise "#{url} returned #{response.code}: #{response.body}"
    end
  end
end
