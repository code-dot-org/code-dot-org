# Tests for the routes in v2_user_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'
require_relative 'sequel_test_case'

class V2UserRoutesTest < SequelTestCase
  describe 'User Routes' do
    before do
      FakeDashboard.use_fake_database
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'GET /v2/user' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get '/v2/user'
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns JSON when signed in as student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal(
          {
            'id' => FakeDashboard::STUDENT[:id],
            'admin' => FakeDashboard::STUDENT[:admin],
            'name' => FakeDashboard::STUDENT[:name],
            'owned_sections' => []
          },
          JSON.parse(@pegasus.last_response.body)
        )
      end

      it 'returns JSON when signed in as teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal(
          {
            'id' => FakeDashboard::TEACHER[:id],
            'admin' => FakeDashboard::TEACHER[:admin],
            'name' => FakeDashboard::TEACHER[:name],
            'owned_sections' => [
              {'id' => FakeDashboard::TEACHER_SECTIONS[0][:id]},
              {'id' => FakeDashboard::TEACHER_SECTIONS[1][:id]},
              {'id' => FakeDashboard::TEACHER_SECTIONS[5][:id]}
            ]
          },
          JSON.parse(@pegasus.last_response.body)
        )
      end

      it 'returns JSON when signed in as admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal(
          {
            'id' => FakeDashboard::ADMIN[:id],
            'admin' => FakeDashboard::ADMIN[:admin],
            'name' => FakeDashboard::ADMIN[:name],
            'owned_sections' => []
          },
          JSON.parse(@pegasus.last_response.body)
        )
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given. The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
    end
  end
end
