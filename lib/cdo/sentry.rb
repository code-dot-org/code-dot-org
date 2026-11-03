# frozen_string_literal: true

require 'httparty'
require 'sentry/dsn'
require_relative 'github'

module Cdo
  # Records a deploy in Sentry as a release plus a deploy.
  module Sentry
    UNTRACKED_ENVIRONMENTS = Set[:adhoc, :development]

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
