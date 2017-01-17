require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

BUILD_STARTED_PATH = deploy_dir('build-started')
FAKE_START_BUILD_TOKEN = 'fake-start-build-token'

class DevRoutesTest < Minitest::Test
  describe '/api/dev/start-build' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise

      # Fake slack token for tests
      CDO.slack_start_build_token = FAKE_START_BUILD_TOKEN

      # Should have no build-started file at the beginning of tests
      system "rm -f #{BUILD_STARTED_PATH}"
      refute File.file?(BUILD_STARTED_PATH), 'Precondition failure: File start-build should not exist.'
    end

    it 'is forbidden on production environments' do
      assert_forbidden_on_rack_env :production
    end

    it 'is forbidden on development environments' do
      assert_forbidden_on_rack_env :development
    end

    def assert_forbidden_on_rack_env(forbidden_env)
      in_rack_env(forbidden_env) do
        pegasus = make_test_pegasus

        pegasus.post('/api/dev/start-build', {
          token: FAKE_START_BUILD_TOKEN,
          user_name: 'Dave'
        })
        assert_equal 403, pegasus.last_response.status
        refute File.file? BUILD_STARTED_PATH
      end
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

    def assert_allowed_on_rack_env(allowed_env)
      in_rack_env(allowed_env) do
        pegasus = make_test_pegasus
        begin
          pegasus.post('/api/dev/start-build', {
              token: FAKE_START_BUILD_TOKEN,
              user_name: 'Dave'
          })
          assert_equal 200, pegasus.last_response.status
        ensure
          system "rm -f #{BUILD_STARTED_PATH}"
        end
      end
    end

    it 'is forbidden with a missing token' do
      in_rack_env(:staging) do
        pegasus = make_test_pegasus
        pegasus.post('/api/dev/start-build', {
            user_name: 'Dave'
        })
        assert_equal 403, pegasus.last_response.status
      end
    end

    it 'is forbidden with an incorrect token' do
      in_rack_env(:staging) do
        pegasus = make_test_pegasus
        pegasus.post('/api/dev/start-build', {
            token: 'incorrect-token',
            user_name: 'Dave'
        })
        assert_equal 403, pegasus.last_response.status
      end
    end

    it 'generates a start_build file if none exists' do
      in_rack_env(:test) do
        pegasus = make_test_pegasus
        begin
          refute File.file? BUILD_STARTED_PATH
          pegasus.post('/api/dev/start-build', {
              token: FAKE_START_BUILD_TOKEN,
              user_name: 'Dave'
          })
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

          pegasus.post('/api/dev/start-build', {
              token: FAKE_START_BUILD_TOKEN,
              user_name: 'Dave'
          })
          assert File.file? BUILD_STARTED_PATH
          assert_equal original_modify_time, File.mtime(BUILD_STARTED_PATH)

          # Check response to requester
          assert_equal 200, pegasus.last_response.status
          assert_equal "I can't do that Dave - a build is already queued", pegasus.last_response.body
        ensure
          system "rm -f #{BUILD_STARTED_PATH}"
        end
      end
    end

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
  end
end
