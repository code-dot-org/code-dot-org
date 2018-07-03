require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative '../../lib/cdo/github'
require_relative '../../lib/cdo/infra_test_topic'
require_relative '../../lib/cdo/metrics_helper'
require_relative 'fixtures/mock_pegasus'

BUILD_STARTED_PATH = deploy_dir('build-started').freeze
FAKE_SLACK_SLASH_TOKEN = 'fake-start-build-token'.freeze
FAKE_GITHUB_WEBHOOK_SECRET = 'fake-github-secret'.freeze

class DevRoutesTest < Minitest::Test
  describe '/api/dev/ routes' do
    DEFAULT_PARAMS = {
      token: FAKE_SLACK_SLASH_TOKEN,
      user_name: 'Dave'
    }.freeze

    def make_test_pegasus
      mock_session = Rack::MockSession.new(MockPegasus.new, 'studio.code.org')
      Rack::Test::Session.new(mock_session)
    end

    def in_rack_env(env)
      original_rack_env = CDO.rack_env
      CDO.rack_env = env
      yield
    ensure
      CDO.rack_env = original_rack_env
    end

    describe '/api/dev/start-build' do
      def assert_forbidden_on_rack_env(forbidden_env)
        in_rack_env(forbidden_env) do
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/start-build', DEFAULT_PARAMS
          assert_equal 403, pegasus.last_response.status
          refute File.file? BUILD_STARTED_PATH
        end
      end

      def assert_allowed_on_rack_env(allowed_env)
        in_rack_env(allowed_env) do
          pegasus = make_test_pegasus
          begin
            pegasus.post '/api/dev/start-build', DEFAULT_PARAMS
            assert_equal 200, pegasus.last_response.status
          ensure
            system "rm -f #{BUILD_STARTED_PATH}"
          end
        end
      end

      before do
        $log.level = Logger::ERROR

        # Fake slack token for tests
        CDO.slack_start_build_token = FAKE_SLACK_SLASH_TOKEN

        # Should have no build-started file at the beginning of tests
        system "rm -f #{BUILD_STARTED_PATH}"
        refute File.file?(BUILD_STARTED_PATH),
          'Precondition failure: File start-build should not exist.'
      end

      it 'is forbidden on production environments' do
        assert_forbidden_on_rack_env :production
      end

      it 'is forbidden on development environments' do
        assert_forbidden_on_rack_env :development
      end

      it 'is allowed on staging' do
        assert_allowed_on_rack_env(:staging)
      end

      it 'is allowed on test' do
        assert_allowed_on_rack_env(:test)
      end

      it 'is allowed on adhoc' do
        assert_allowed_on_rack_env(:adhoc)
      end

      it 'is allowed on levelbuilder' do
        assert_allowed_on_rack_env(:levelbuilder)
      end

      it 'is forbidden with a missing token' do
        in_rack_env(:staging) do
          pegasus = make_test_pegasus
          pegasus.post(
            '/api/dev/start-build',
            {user_name: 'Dave'}
          )
          assert_equal 403, pegasus.last_response.status
        end
      end

      it 'is forbidden with an incorrect token' do
        in_rack_env(:staging) do
          pegasus = make_test_pegasus
          pegasus.post(
            '/api/dev/start-build',
            {
              token: 'incorrect-token',
              user_name: 'Dave'
            }
          )
          assert_equal 403, pegasus.last_response.status
        end
      end

      it 'generates a start_build file if none exists' do
        in_rack_env(:test) do
          pegasus = make_test_pegasus
          begin
            refute File.file? BUILD_STARTED_PATH
            pegasus.post '/api/dev/start-build', DEFAULT_PARAMS
            assert File.file? BUILD_STARTED_PATH

            # Check appropriate response to whole room, too
            assert_equal 200, pegasus.last_response.status
            response_body = JSON.parse(pegasus.last_response.body)
            assert_equal 'Test build restarted by Dave', response_body['text']
            assert_equal 'in_channel', response_body['response_type']
          ensure
            system "rm -f #{BUILD_STARTED_PATH}"
          end
        end
      end

      it 'succeeds without action if start_build exists' do
        in_rack_env(:test) do
          pegasus = make_test_pegasus
          begin
            system "touch #{BUILD_STARTED_PATH}"
            assert File.file? BUILD_STARTED_PATH
            original_modify_time = File.mtime(BUILD_STARTED_PATH)

            pegasus.post '/api/dev/start-build', DEFAULT_PARAMS
            assert File.file? BUILD_STARTED_PATH
            assert_equal original_modify_time, File.mtime(BUILD_STARTED_PATH)

            # Check response to requester
            assert_equal 200, pegasus.last_response.status
            assert_equal(
              "I can't do that Dave - a build is already queued",
              pegasus.last_response.body
            )
          ensure
            system "rm -f #{BUILD_STARTED_PATH}"
          end
        end
      end
    end

    describe 'api/dev/set-last-dtt-green' do
      before do
        $log.level = Logger::ERROR

        CDO.slack_set_last_dtt_green_token = FAKE_SLACK_SLASH_TOKEN
      end

      it 'is forbidden on non-test environments' do
        [:development, :staging, :adhoc, :levelbuilder, :production].each do |env|
          in_rack_env(env) do
            pegasus = make_test_pegasus
            pegasus.post '/api/dev/set-last-dtt-green', DEFAULT_PARAMS
            assert_equal 403, pegasus.last_response.status
          end
        end
      end

      it 'succeeds on test environment' do
        in_rack_env(:test) do
          fake_sha = 'abcdef'
          GitHub.expects(:sha).returns(fake_sha)
          DevelopersTopic.expects(:set_dtt).with('yes')
          InfraTestTopic.expects(:set_green_commit).with(fake_sha)
          Metrics.expects(:write_metric).with('dtt_green', fake_sha, Metrics::MANUAL)
          pegasus = make_test_pegasus
          pegasus.post '/api/dev/set-last-dtt-green', DEFAULT_PARAMS
          assert_equal 200, pegasus.last_response.status
        end
      end
    end

    describe 'api/dev/check-dts' do
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
      before do
        $log.level = Logger::ERROR
        CDO.github_webhook_secret = FAKE_GITHUB_WEBHOOK_SECRET
      end

      it 'is forbidden on non-staging environments' do
        [:test, :adhoc, :levelbuilder, :production].each do |env|
          in_rack_env(env) do
            pegasus = make_test_pegasus
            pegasus.post '/api/dev/check-dts', GITHUB_PARAMS
            assert_equal 403, pegasus.last_response.status
          end
        end
      end

      it 'ignores actions we dont care about' do
        in_rack_env(:staging) do
          Rack::Utils.expects(:secure_compare).returns(true)
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/check-dts', {
            payload: GITHUB_PAYLOAD.merge({'action' => 'other action'}).to_json,
          }, 'X-GitHub-Event' => 'pull_request'
          assert_equal 202, pegasus.last_response.status
        end
      end

      it 'ignores events we dont care about' do
        in_rack_env(:staging) do
          Rack::Utils.expects(:secure_compare).returns(true)
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/check-dts', GITHUB_PARAMS,
            'HTTP_X_GITHUB_EVENT' => 'other_event'
          assert_equal 202, pegasus.last_response.status
        end
      end

      it 'ignores PRs against branches we dont care about' do
        in_rack_env(:staging) do
          Rack::Utils.expects(:secure_compare).returns(true)
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/check-dts', {
            payload: {
              action: 'opened',
              pull_request: {
                base: {
                  ref: 'test',
                },
              },
            }.to_json,
          }
          assert_equal 202, pegasus.last_response.status
        end
      end

      it 'Sets the dts check to pass if DTS is yes' do
        in_rack_env(:staging) do
          Rack::Utils.expects(:secure_compare).returns(true)
          GitHub.expects(:configure_octokit)
          DevelopersTopic.expects(:dts?).returns(true)
          GitHub.expects(:set_dts_check_pass)
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/check-dts', GITHUB_PARAMS,
            'HTTP_X_GITHUB_EVENT' => 'pull_request'

          assert_equal 200, pegasus.last_response.status
        end
      end

      it 'Sets the dts check to fail if DTS is no' do
        in_rack_env(:staging) do
          Rack::Utils.expects(:secure_compare).returns(true)
          GitHub.expects(:configure_octokit)
          DevelopersTopic.expects(:dts?).returns(false)
          GitHub.expects(:set_dts_check_fail)
          pegasus = make_test_pegasus

          pegasus.post '/api/dev/check-dts', GITHUB_PARAMS,
            'HTTP_X_GITHUB_EVENT' => 'pull_request'

          assert_equal 200, pegasus.last_response.status
        end
      end
    end
  end
end
