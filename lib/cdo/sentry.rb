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

      dsn = ::Sentry::DSN.new(CDO.dashboard_sentry_dsn)
      sentry_releases_endpoint = "https://sentry.io/api/0/organizations/#{dsn.org_id}/releases/"
      post(sentry_releases_endpoint, version: revision, projects: [dsn.project_id], refs: [{repository: GitHub::REPO, commit: revision}])
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
