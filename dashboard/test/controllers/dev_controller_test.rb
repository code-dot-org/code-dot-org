require 'test_helper'

FAKE_GITHUB_WEBHOOK_SECRET = 'fake-github-secret'.freeze
FAKE_SLACK_SLASH_TOKEN = 'fake-start-build-token'.freeze
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
SLACK_PARAMS = {
  token: FAKE_SLACK_SLASH_TOKEN,
  user_name: 'Dave'
}.freeze

class DevControllerTest < ActionDispatch::IntegrationTest
  setup do
    CDO.stubs(github_webhook_secret: FAKE_GITHUB_WEBHOOK_SECRET)
    CDO.stubs(slack_start_build_token: FAKE_SLACK_SLASH_TOKEN)
    # File.stubs(:file?).with(DevController::BUILD_STARTED_PATH).returns(false)
    FileUtils.stubs(:touch).with(DevController::BUILD_STARTED_PATH)
  end

  test 'start-build is forbidden on production and development' do
    [:production, :development].each do |forbidden_env|
      with_rack_env(forbidden_env) do
        FileUtils.expects(:touch).never
        post '/api/dev/start-build', params: SLACK_PARAMS
        assert_response :forbidden
      end
    end
  end

  test 'start-build is allowed on most environments' do
    [:staging, :test, :adhoc, :levelbuilder].each do |allowed_env|
      with_rack_env(allowed_env) do
        FileUtils.expects(:touch).once
        post '/api/dev/start-build', params: SLACK_PARAMS
        assert_response :success
      end
    end
  end

  test 'start-build is forbidden with a missing or incorrect token' do
    with_rack_env(:staging) do
      post('/api/dev/start-build', params: {user_name: 'Dave'})
      assert_response :forbidden

      post(
        '/api/dev/start-build',
        params: {
          token: 'incorrect-token',
          user_name: 'Dave'
        }
      )
      assert_response :forbidden
    end
  end

  test 'start-build generates a start_build file if none exists' do
    with_rack_env(:test) do
      FileUtils.expects(:touch).once
      post '/api/dev/start-build', params: SLACK_PARAMS

      # Check appropriate response to whole room, too
      assert_response :success
      response_body = JSON.parse(response.body)
      assert_equal 'Test build restarted by Dave', response_body['text']
      assert_equal 'in_channel', response_body['response_type']
    end
  end

  test 'start-build succeeds without action if start_build exists' do
    with_rack_env(:test) do
      File.stubs(:file?).with(DevController::BUILD_STARTED_PATH).returns(true)
      FileUtils.expects(:touch).never
      post '/api/dev/start-build', params: SLACK_PARAMS

      # Check response to requester
      assert_response :success
      assert_equal(
        "I can't do that Dave - a build is already queued",
        response.body
      )
    end
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
