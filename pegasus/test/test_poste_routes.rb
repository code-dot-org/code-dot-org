require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'

class PosteRoutesTest < Minitest::Test
  describe 'Poste Routes' do
    before do
      FakeDashboard.use_fake_database
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'POST /v2/poste/send-message' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as a student' do
        with_role FakeDashboard::STUDENT
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as a teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'succeeds when signed in as an admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.post "/v2/poste/send-message"
        assert_equal 200, @pegasus.last_response.status
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given (e.g. FakeDashboard::STUDENT or FakeDashboard::TEACHER).
    # The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
    end
  end
end
