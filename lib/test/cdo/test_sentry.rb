# frozen_string_literal: true

require_relative '../test_helper'
require_relative '../../cdo/sentry'
require 'webmock/minitest'

class SentryTest < Minitest::Test
  REVISION = '45f292e6d70b29ada94da635ca905ca00310b4f7'
  RELEASES = 'https://sentry.io/api/0/organizations/123/releases/'
  DEPLOYS = "#{RELEASES}#{REVISION}/deploys/"

  def setup
    CDO.stubs(
      sentry_releases_token: 'token',
      dashboard_sentry_dsn: 'https://key@o123.ingest.us.sentry.io/456',
      frontend_apps_sentry_dsn: 'https://key@o123.ingest.us.sentry.io/789',
      frontend_studio_sentry_dsn: 'https://key@o123.ingest.us.sentry.io/1011',
      log: stub_everything('log')
    )
  end

  def test_notify_new_release_should_create_the_release_and_its_deploy_under_the_dsn_organization_and_projects
    release = stub_request(:post, RELEASES).
      with(
        headers: {'Authorization' => 'Bearer token', 'Content-Type' => 'application/json'},
        body: {
          version: REVISION,
          projects: %w[456 789 1011],
          refs: [{repository: 'code-dot-org/code-dot-org', commit: REVISION}]
        }.to_json
      ).to_return(status: 201)
    deploy = stub_request(:post, DEPLOYS).
      with(
        headers: {'Authorization' => 'Bearer token', 'Content-Type' => 'application/json'},
        body: {environment: 'production'}.to_json
      ).to_return(status: 201)

    Cdo::Sentry.notify_new_release(:production, REVISION)

    assert_requested release
    assert_requested deploy
  end

  def test_notify_new_release_should_leave_out_projects_whose_dsn_is_not_configured
    CDO.stubs(frontend_studio_sentry_dsn: nil)
    release = stub_request(:post, RELEASES).
      with(body: hash_including('projects' => %w[456 789])).
      to_return(status: 201)
    stub_request(:post, DEPLOYS).to_return(status: 201)

    Cdo::Sentry.notify_new_release(:production, REVISION)

    assert_requested release
  end

  def test_notify_new_release_should_skip_untracked_environments
    Cdo::Sentry.notify_new_release(:adhoc, REVISION)
    Cdo::Sentry.notify_new_release(:development, REVISION)

    assert_not_requested :post, RELEASES
  end

  def test_notify_new_release_should_skip_if_the_token_is_not_configured
    CDO.stubs(sentry_releases_token: nil)

    Cdo::Sentry.notify_new_release(:production, REVISION)

    assert_not_requested :post, RELEASES
  end

  def test_notify_new_release_should_log_and_not_raise_if_sentry_rejects_the_release
    stub_request(:post, RELEASES).to_return(status: 403, body: '{"detail":"forbidden"}')
    CDO.log.expects(:warn).with(regexp_matches(/#{REVISION} not recorded: .*403.*forbidden/o))

    Cdo::Sentry.notify_new_release(:staging, REVISION)

    assert_not_requested :post, DEPLOYS
  end

  def test_notify_new_release_should_log_and_not_raise_if_sentry_is_unreachable
    stub_request(:post, RELEASES).to_raise(SocketError.new('getaddrinfo failed'))
    CDO.log.expects(:warn).with(regexp_matches(/#{REVISION} not recorded: SocketError: getaddrinfo failed/o))

    Cdo::Sentry.notify_new_release(:test, REVISION)
  end
end
