# Tests for the routes in v2_section_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'

class V2SectionRoutesTest < Minitest::Test
  describe 'Section Routes' do
    before do
      FakeDashboard.use_fake_database
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'GET /v2/sections' do
      it 'returns empty array when student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/sections'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end

      it 'returns sections when teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/sections'
        assert_equal 200, @pegasus.last_response.status
        # TODO(asher): Fix the array, there should be data.
        # assert_equal [], JSON.parse(@pegasus.last_response.body)
      end
    end

    describe 'GET /v2/sections/membership' do
      it 'returns sections for student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/sections/membership'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end
    end

    describe 'GET /v2/sections/:id' do
      it 'returns section for teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/sections/150001'
        assert_equal 200, @pegasus.last_response.status
        # TODO(asher): Validate @pegasus.last_response.body.
      end

      it 'returns section for admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get '/v2/sections/150001'
        assert_equal 200, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get '/v2/sections/150001'
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" for unconnected teacher' do
        with_role FakeDashboard::TEACHER_WITH_DELETED
        @pegasus.get '/v2/sections/150001'
        assert_equal 403, @pegasus.last_response.status
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given. The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).
        returns(role.nil? ? nil : role[:id])
    end

  end
end
