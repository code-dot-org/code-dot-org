# Tests for the routes in v2_user_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'

class V2UserRoutesTest < Minitest::Test
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
        assert_equal({
                         'id' => FakeDashboard::STUDENT[:id],
                         'admin' => FakeDashboard::STUDENT[:admin],
                         'name' => FakeDashboard::STUDENT[:name],
                         'owned_sections' => []
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns JSON when signed in as teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => FakeDashboard::TEACHER[:id],
                         'admin' => FakeDashboard::TEACHER[:admin],
                         'name' => FakeDashboard::TEACHER[:name],
                         'owned_sections' => [
                             {'id' => FakeDashboard::TEACHER_SECTIONS[0][:id]},
                             {'id' => FakeDashboard::TEACHER_SECTIONS[1][:id]}
                         ]
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns JSON when signed in as admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => FakeDashboard::ADMIN[:id],
                         'admin' => FakeDashboard::ADMIN[:admin],
                         'name' => FakeDashboard::ADMIN[:name],
                         'owned_sections' => []
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

    end

    # Keys included in each student object returned by the /v2/students endpoint
    V2_STUDENTS_KEY_LIST = [:id, :name, :username, :email, :hashed_email, :gender,
                            :birthday, :prize_earned, :total_lines, :secret_words,
                            :total_lines]
    def expected_v2_students_hash_for(user)
      {}.tap do |expect|
        V2_STUDENTS_KEY_LIST.each do |key|
          expect[key.to_s] = user.has_key?(key) ? user[key] : nil
        end
      end
    end

    describe 'GET /v2/students' do
      it 'returns empty array when not signed in' do
        with_role nil
        @pegasus.get '/v2/students'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end

      it 'returns empty array when signed in as student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get '/v2/students'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end

      it 'returns array of students when signed in as teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get '/v2/students'
        assert_equal 200, @pegasus.last_response.status
        assert_equal([expected_v2_students_hash_for(FakeDashboard::STUDENT)],
                     JSON.parse(@pegasus.last_response.body))
      end
    end

    V2_STUDENTS_ID_KEY_LIST = V2_STUDENTS_KEY_LIST.dup.concat [:secret_picture_name,
                                                               :secret_picture_path,
                                                               :age]
    def expected_v2_students_id_hash_for(user)
      {}.tap do |expect|
        V2_STUDENTS_ID_KEY_LIST.each do |key|
          expect[key.to_s] = user.has_key?(key) ? user[key] : nil
        end
      end
    end

    describe 'GET /v2/students/:id' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get "/v2/students/#{FakeDashboard::STUDENT[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as student' do
        with_role FakeDashboard::STUDENT
        @pegasus.get "/v2/students/#{FakeDashboard::STUDENT[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns student info when signed in as correct teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.get "/v2/students/#{FakeDashboard::STUDENT[:id]}"
        assert_equal 200, @pegasus.last_response.status
        assert_equal(expected_v2_students_id_hash_for(FakeDashboard::STUDENT),
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns student info when signed in as admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.get "/v2/students/#{FakeDashboard::STUDENT[:id]}"
        assert_equal 200, @pegasus.last_response.status
        assert_equal(expected_v2_students_id_hash_for(FakeDashboard::STUDENT),
                     JSON.parse(@pegasus.last_response.body))
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given (see roles defined at the top of this file, e.g. FakeDashboard::STUDENT or
    # FakeDashboard::TEACHER).  The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
    end

  end
end
