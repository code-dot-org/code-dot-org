require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative '../../lib/cdo/github'
require_relative '../../lib/cdo/infra_test_topic'
require_relative 'fixtures/mock_pegasus'

FAKE_SLACK_SLASH_TOKEN = 'fake-start-build-token'.freeze

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

    describe 'api/dev/set-last-dtt-green' do
      before do
        $log.level = Logger::ERROR

        CDO.stubs(slack_set_last_dtt_green_token: FAKE_SLACK_SLASH_TOKEN)
      end

      it 'is forbidden on non-test environments' do
        [:development, :staging, :adhoc, :levelbuilder, :production].each do |env|
          with_rack_env(env) do
            pegasus = make_test_pegasus
            pegasus.post '/api/dev/set-last-dtt-green', DEFAULT_PARAMS
            assert_equal 403, pegasus.last_response.status
          end
        end
      end

      it 'succeeds on test environment' do
        with_rack_env(:test) do
          fake_sha = 'abcdef'
          GitHub.expects(:sha).returns(fake_sha)
          DevelopersTopic.expects(:set_dtt).with('yes')
          InfraTestTopic.expects(:set_green_commit).with(fake_sha)
          pegasus = make_test_pegasus
          pegasus.post '/api/dev/set-last-dtt-green', DEFAULT_PARAMS
          assert_equal 200, pegasus.last_response.status
        end
      end
    end
  end
end
