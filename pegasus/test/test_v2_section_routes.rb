# Tests for the routes in v2_section_routes.rb

require_relative 'sequel_test_case'
require 'mocha/mini_test'
require 'rack/test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'

class V2SectionRoutesTest < SequelTestCase
  describe 'Section Routes' do
    before do
      FakeDashboard.use_fake_database
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'GET /v2/sections' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get '/v2/sections'
        assert_equal 403, @pegasus.last_response.status
      end

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
        assert_equal [
          {
            "id"=>150001,
            "location"=>"/v2/sections/150001",
            "name"=>"Fake Section A",
            "login_type"=>"email",
            "grade"=>nil,
            "code"=>nil,
            "course"=>nil,
            "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
            "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
          },
          {
            "id"=>150002,
            "location"=>"/v2/sections/150002",
            "name"=>"Fake Section B",
            "login_type"=>"email",
            "grade"=>nil,
            "code"=>nil,
            "course"=>nil,
            "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
            "students"=>[]
          }],
          JSON.parse(@pegasus.last_response.body)
      end

      it 'ignores deleted sections' do
        with_role FakeDashboard::TEACHER_WITH_DELETED
        @pegasus.get '/v2/sections'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [
          {
            "id"=>150004,
           "location"=>"/v2/sections/150004",
           "name"=>"Fake Section D",
           "login_type"=>"email",
           "grade"=>nil,
           "code"=>nil,
           "course"=>nil,
           "teachers"=>[{"id"=>7, "location"=>"/v2/users/7"}],
           "students"=>[{"student_user_id"=>5, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
          }],
          JSON.parse(@pegasus.last_response.body)
      end
    end

    describe 'POST /v2/sections' do
      # TODO(asher).
    end

    describe 'GET /v2/sections/membership' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get '/v2/sections/membership'
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns sections for student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/sections/membership'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [
          {
            "id"=>150001,
            "location"=>"/v2/sections/150001",
            "name"=>"Fake Section A",
            "login_type"=>"email",
            "grade"=>nil,
            "code"=>nil
          }],
          JSON.parse(@pegasus.last_response.body)
      end

      it 'ignores deleted sections' do
        # TODO(asher).
      end

      it 'ignores deleted follower memberships' do
        with_role FakeDashboard::SELF_STUDENT
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
        assert_equal ({
            "id"=>150001,
            "location"=>"/v2/sections/150001",
            "name"=>"Fake Section A",
            "login_type"=>"email",
            "grade"=>nil,
            "code"=>nil,
            "course"=>nil,
            "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
            "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
          }),
          JSON.parse(@pegasus.last_response.body)
      end

      it 'returns section for admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get '/v2/sections/150001'
        assert_equal 200, @pegasus.last_response.status
        assert_equal ({
            "id"=>150001,
            "location"=>"/v2/sections/150001",
            "name"=>"Fake Section A",
            "login_type"=>"email",
            "grade"=>nil,
            "code"=>nil,
            "course"=>nil,
            "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
            "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
          }),
          JSON.parse(@pegasus.last_response.body)
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

      it 'ignores deleted sections' do
        # TODO(asher).
      end
    end

    describe 'POST /v2/sections/:id/delete' do
      # TODO(asher).
    end

    describe 'POST /v2/sections/:id/update' do
      # TODO(asher).
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
