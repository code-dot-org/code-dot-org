# Tests for the routes in v2_section_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'
require_relative 'sequel_test_case'

class V2SectionRoutesTest < SequelTestCase
  describe 'Section Routes' do
    before do
      DashboardSection.clear_caches
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

      # NOTE: These tests currently fail as the result of sqlite not supporting
      # the `.distinct(:student_user_id)` syntax used in the `students()` method
      # within `DashboardSection`.
      # TODO(asher): Fix and reenable these tests.
      #it 'returns sections when teacher' do
      #  with_role FakeDashboard::TEACHER
      #  @pegasus.get '/v2/sections'
      #  assert_equal 200, @pegasus.last_response.status
      #  assert_equal [
      #    {
      #      "id"=>150001,
      #      "location"=>"/v2/sections/150001",
      #      "name"=>"Fake Section A",
      #      "login_type"=>"email",
      #      "grade"=>nil,
      #      "code"=>nil,
      #      "course"=>nil,
      #      "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
      #      "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
      #    },
      #    {
      #      "id"=>150002,
      #      "location"=>"/v2/sections/150002",
      #      "name"=>"Fake Section B",
      #      "login_type"=>"email",
      #      "grade"=>nil,
      #      "code"=>nil,
      #      "course"=>nil,
      #      "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
      #      "students"=>[]
      #    }],
      #    JSON.parse(@pegasus.last_response.body)
      #end

      #it 'ignores deleted sections' do
      #  with_role FakeDashboard::TEACHER_WITH_DELETED
      #  @pegasus.get '/v2/sections'
      #  assert_equal 200, @pegasus.last_response.status
      #  assert_equal [
      #    {
      #      "id"=>150004,
      #     "location"=>"/v2/sections/150004",
      #     "name"=>"Fake Section D",
      #     "login_type"=>"email",
      #     "grade"=>nil,
      #     "code"=>nil,
      #     "course"=>nil,
      #     "teachers"=>[{"id"=>7, "location"=>"/v2/users/7"}],
      #     "students"=>[{"student_user_id"=>5, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
      #    }],
      #    JSON.parse(@pegasus.last_response.body)
      #end
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
        assert_equal(
          [
            {
              "id" => 150001,
              "location" => "/v2/sections/150001",
              "name" => "Fake Section A",
              "login_type" => "email",
              "grade" => nil,
              "code" => nil,
              "stage_extras" => false,
              "pairing_allowed" => true,
              "hidden" => false,
            }
          ],
          JSON.parse(@pegasus.last_response.body)
        )
      end

      it 'ignores deleted sections' do
        # TODO(asher).
      end

      it 'ignores deleted follower memberships' do
        with_role FakeDashboard::STUDENT_DELETED_FOLLOWER
        @pegasus.get '/v2/sections/membership'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end
    end

    describe 'GET /v2/sections/:id' do
      # NOTE: These tests currently fail as the result of sqlite not supporting
      # the `.distinct(:student_user_id)` syntax used in the `students()` method
      # within `DashboardSection`.
      # TODO(asher): Fix and reenable these tests.
      #it 'returns section for teacher' do
      #  with_role FakeDashboard::TEACHER
      #  @pegasus.get "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}"
      #  assert_equal 200, @pegasus.last_response.status
      #  assert_equal ({
      #      "id"=>150001,
      #      "location"=>"/v2/sections/150001",
      #      "name"=>"Fake Section A",
      #      "login_type"=>"email",
      #      "grade"=>nil,
      #      "code"=>nil,
      #      "course"=>nil,
      #      "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
      #      "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
      #    }),
      #    JSON.parse(@pegasus.last_response.body)
      #end

      #it 'returns section for admin' do
      #  with_role FakeDashboard::ADMIN
      #  @pegasus.get "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}"
      #  assert_equal 200, @pegasus.last_response.status
      #  assert_equal ({
      #      "id"=>150001,
      #      "location"=>"/v2/sections/150001",
      #      "name"=>"Fake Section A",
      #      "login_type"=>"email",
      #      "grade"=>nil,
      #      "code"=>nil,
      #      "course"=>nil,
      #      "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
      #      "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
      #    }),
      #    JSON.parse(@pegasus.last_response.body)
      #end

      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" for unconnected teacher' do
        with_role FakeDashboard::TEACHER_SELF
        @pegasus.get "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'ignores deleted sections' do
        # TODO(asher).
      end
    end

    describe 'POST /v2/sections/:id/delete' do
      it 'soft-deletes a section and all followers' do
        with_role FakeDashboard::TEACHER
        Dashboard.db.transaction(rollback: :always) do
          @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/delete"
          assert_equal 204, @pegasus.last_response.status
          assert Dashboard.db[:sections].
            where(id: FakeDashboard::SECTION_NORMAL[:id]).
            exclude(deleted_at: nil).
            any?
          assert_equal 1, Dashboard.db[:followers].
            where(section_id: FakeDashboard::SECTION_NORMAL[:id]).
            exclude(deleted_at: nil).
            count
        end
      end

      it 'does not update already deleted followers' do
        with_role FakeDashboard::TEACHER_DELETED_FOLLOWER
        Dashboard.db.transaction(rollback: :always) do
          before_timestamp = Dashboard.db[:followers].
            where(
              section_id: FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
              student_user_id: FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]
            ).
            select_map(:deleted_at)
          @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_DELETED_FOLLOWER[:id]}/delete"
          assert_equal 204, @pegasus.last_response.status
          after_timestamp = Dashboard.db[:followers].
            where(
              section_id: FakeDashboard::SECTION_DELETED_FOLLOWER[:id],
              student_user_id: FakeDashboard::STUDENT_DELETED_FOLLOWER[:id]
            ).
            select_map(:deleted_at)
          assert_equal before_timestamp, after_timestamp
        end
      end

      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/delete"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when deleting another teachers section' do
        with_role FakeDashboard::TEACHER_SELF
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/delete"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when deleting a deleted section' do
        with_role FakeDashboard::TEACHER_DELETED_SECTION
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_DELETED[:id]}/delete"
        assert_equal 403, @pegasus.last_response.status
      end
    end

    describe 'POST /v2/sections/:id/update' do
      NEW_NAME = 'Updated Section'

      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/update",
          {name: NEW_NAME}.to_json,
          'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" as admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/update",
          {name: NEW_NAME}.to_json,
          'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 403, @pegasus.last_response.status
      end

      # NOTE: These tests currently fail as the result of sqlite not supporting
      # the `.distinct(:student_user_id)` syntax used in the `students()` method
      # within `DashboardSection`.
      # TODO(asher): Fix and reenable these tests.
      #it 'updates' do
      #  with_role FakeDashboard::TEACHER
      #  Dashboard.db.transaction(rollback: :always) do
      #    @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_NORMAL[:id]}/update",
      #       {name: NEW_NAME}.to_json,
      #       'CONTENT_TYPE' => 'application/json;charset=utf-8'
      #    assert_equal 200, @pegasus.last_response.status
      #    assert_equal ({
      #        "id"=>150001,
      #        "location"=>"/v2/sections/150001",
      #        "name"=>NEW_NAME,
      #        "login_type"=>"email",
      #        "grade"=>nil,
      #        "code"=>nil,
      #        "course"=>nil,
      #        "teachers"=>[{"id"=>2, "location"=>"/v2/users/2"}],
      #        "students"=>[{"student_user_id"=>1, "location"=>"/v2/users/", "age"=>nil, "completed_levels_count"=>0}]
      #      }),
      #      JSON.parse(@pegasus.last_response.body)
      #  end
      #end

      it 'returns 403 "Forbidden" when updating deleted section' do
        with_role FakeDashboard::TEACHER_DELETED_SECTION
        @pegasus.post "/v2/sections/#{FakeDashboard::SECTION_DELETED[:id]}/update",
          {name: NEW_NAME}.to_json,
          'CONTENT_TYPE' => 'application/json;charset=utf-8'
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

    describe 'GET /v2/sections/valid_scripts' do
      before do
        @nonadmin_valid_scripts = [
          {
            "id" => 1,
            "name" => "Foo",
            "script_name" => "Foo",
            "category" => "other",
            "position" => nil,
            "category_priority" => 15
          },
          {
            "id" => 3,
            "name" => "Bar",
            "script_name" => "Bar",
            "category" => "other",
            "position" => nil,
            "category_priority" => 15
          },
          {
            "id" => 4,
            "name" => "Minecraft Adventurer",
            "script_name" => "mc",
            "category" => "Hour of Code",
            "position" => 2,
            "category_priority" => 2
          },
          {
            "id" => 5,
            "name" => "Classic Maze",
            "script_name" => "hourofcode",
            "category" => "Hour of Code",
            "position" => 19,
            "category_priority" => 2
          },
          {
            "id" => 6,
            "name" => "Minecraft Designer",
            "script_name" => "minecraft",
            "category" => "Hour of Code",
            "position" => 3,
            "category_priority" => 2
          },
          {
            "id" => 10,
            "name" => "Make a Flappy game",
            "script_name" => "flappy",
            "category" => "Hour of Code",
            "position" => 7,
            "category_priority" => 2
          },
          {
            "id" => 31,
            "name" => "Unit 1: The Internet",
            "script_name" => "csp1",
            "category" => "CS Principles",
            "position" => 0,
            "category_priority" => 9
          },
          {
            "id" => 32,
            "name" => "Unit 2: Digital Information",
            "script_name" => "csp2",
            "category" => "CS Principles",
            "position" => 1,
            "category_priority" => 9
          },
          {
            "id" => 34,
            "name" => "Unit 3: Algorithms and Programming",
            "script_name" => "csp3",
            "category" => "CS Principles",
            "position" => 2,
            "category_priority" => 9
          },
        ]
      end

      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get '/v2/sections/valid_scripts'
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns script list when signed in as a student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/sections/valid_scripts'
        assert_equal 200, @pegasus.last_response.status
        assert_equal @nonadmin_valid_scripts, JSON.parse(@pegasus.last_response.body)
      end

      it 'returns script list when signed in as a teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/sections/valid_scripts'
        assert_equal 200, @pegasus.last_response.status
        assert_equal @nonadmin_valid_scripts, JSON.parse(@pegasus.last_response.body)
      end

      it 'returns script list with hidden scripts when signed in as an admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get '/v2/sections/valid_scripts'
        assert_equal 200, @pegasus.last_response.status
        assert_equal(
          @nonadmin_valid_scripts << {
            'id' => 45,
            'name' => 'allthehiddenthings *',
            'script_name' => 'allthehiddenthings',
            'category' => 'other',
            'position' => nil,
            'category_priority' => 15
          } << {
            "id" => 53,
            "name" => "csp2-alt *",
            "script_name" => "csp2-alt",
            "category" => "other",
            "position" => nil,
            "category_priority" => 15
          },
          JSON.parse(@pegasus.last_response.body)
        )
      end
    end
  end
end
