require 'test_helper'

FAKE_GITHUB_WEBHOOK_SECRET = 'fake-github-secret'.freeze
GITHUB_PAYLOAD = {
  action: 'opened',
  pull_request: {
    base: {
      ref: 'staging',
    },
  },
}.freeze
GITHUB_PARAMS = {
  payload: GITHUB_PAYLOAD.to_json,
}.freeze

class DevControllerTest < ActionDispatch::IntegrationTest
  setup do
    CDO.stubs(github_webhook_secret: FAKE_GITHUB_WEBHOOK_SECRET)
  end

  test 'check-dts is forbidden on non-staging environments' do
    [:test, :adhoc, :levelbuilder, :production].each do |env|
      with_rack_env(env) do
        post '/api/dev/check-dts', params: GITHUB_PARAMS
        assert_response :forbidden
      end
    end
  end

  test 'check-dts ignores actions we dont care about' do
    with_rack_env(:staging) do
      ActiveSupport::SecurityUtils.expects(:secure_compare).returns(true)

      post '/api/dev/check-dts', params: {
        payload: GITHUB_PAYLOAD.merge({'action' => 'other action'}).to_json,
      }, headers: {HTTP_X_GITHUB_EVENT: 'pull_request'}
      assert_response :accepted
    end
  end

  test 'check-dts ignores events we dont care about' do
    with_rack_env(:staging) do
      ActiveSupport::SecurityUtils.expects(:secure_compare).returns(true)

      post '/api/dev/check-dts', params: GITHUB_PARAMS, headers: {HTTP_X_GITHUB_EVENT: 'other_event'}
      assert_response :accepted
    end
  end

  test 'check-dts ignores PRs against branches we dont care about' do
    with_rack_env(:staging) do
      ActiveSupport::SecurityUtils.expects(:secure_compare).returns(true)

      post '/api/dev/check-dts', params: {
        payload: {
          action: 'opened',
          pull_request: {
            base: {
              ref: 'test',
            },
          },
        }.to_json,
      }
      assert_response :accepted
    end
  end

  test 'check-dts Sets the dts check to pass if DTS is yes' do
    with_rack_env(:staging) do
      ActiveSupport::SecurityUtils.expects(:secure_compare).returns(true)
      GitHub.expects(:configure_octokit)
      DevelopersTopic.expects(:dts?).returns(true)
      GitHub.expects(:set_dts_check_pass)

      post '/api/dev/check-dts', params: GITHUB_PARAMS, headers: {HTTP_X_GITHUB_EVENT: 'pull_request'}
      assert_response :success
    end
  end

  test 'check-dts Sets the dts check to fail if DTS is no' do
    with_rack_env(:staging) do
      ActiveSupport::SecurityUtils.expects(:secure_compare).returns(true)
      GitHub.expects(:configure_octokit)
      DevelopersTopic.expects(:dts?).returns(false)
      GitHub.expects(:set_dts_check_fail)

      post '/api/dev/check-dts', params: GITHUB_PARAMS, headers: {HTTP_X_GITHUB_EVENT: 'pull_request'}
      assert_response :success
    end
  end
end
