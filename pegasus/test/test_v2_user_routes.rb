# Tests for the routes in v2_user_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require 'sequel'
require_relative '../router'

ENV['RACK_ENV'] = 'test'

class V2UserRoutesTest < Minitest::Test
  # Keys included in each student object returned by the /v2/students endpoint
  V2_STUDENTS_KEY_LIST = [:id, :name, :username, :email, :hashed_email, :gender,
                          :birthday, :prize_earned, :total_lines, :secret_words]

  describe 'User Routes' do
    before do
      use_fake_database
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
        with_role STUDENT
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => STUDENT[:id],
                         'admin' => STUDENT[:admin],
                         'name' => STUDENT[:name],
                         'owned_sections' => []
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns JSON when signed in as teacher' do
        with_role TEACHER
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => TEACHER[:id],
                         'admin' => TEACHER[:admin],
                         'name' => TEACHER[:name],
                         'owned_sections' => [
                             {'id' => TEACHER_SECTIONS[0][:id]},
                             {'id' => TEACHER_SECTIONS[1][:id]}
                         ]
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns JSON when signed in as admin' do
        with_role ADMIN
        @pegasus.get '/v2/user'
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => ADMIN[:id],
                         'admin' => ADMIN[:admin],
                         'name' => ADMIN[:name],
                         'owned_sections' => []
                     },
                     JSON.parse(@pegasus.last_response.body))
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
        with_role STUDENT
        @pegasus.get '/v2/students'
        assert_equal 200, @pegasus.last_response.status
        assert_equal [], JSON.parse(@pegasus.last_response.body)
      end

      it 'returns array of students when signed in as teacher' do
        with_role TEACHER
        @pegasus.get '/v2/students'
        assert_equal 200, @pegasus.last_response.status
        assert_equal([
                         {
                             'id' => STUDENT[:id],
                             'name' => STUDENT[:name]
                         }
                     ],
                     JSON.parse(@pegasus.last_response.body))
      end
    end

    describe 'GET /v2/students/:id' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.get "/v2/students/#{STUDENT[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as student' do
        with_role STUDENT
        @pegasus.get "/v2/students/#{STUDENT[:id]}"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns student info when signed in as correct teacher' do
        with_role TEACHER
        @pegasus.get "/v2/students/#{STUDENT[:id]}"
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => STUDENT[:id],
                         'name' => STUDENT[:name],
                         'age' => nil
                     },
                     JSON.parse(@pegasus.last_response.body))
      end

      it 'returns student info when signed in as admin' do
        with_role ADMIN
        @pegasus.get "/v2/students/#{STUDENT[:id]}"
        assert_equal 200, @pegasus.last_response.status
        assert_equal({
                         'id' => STUDENT[:id],
                         'name' => STUDENT[:name],
                         'age' => nil
                     },
                     JSON.parse(@pegasus.last_response.body))
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given (see roles defined at the top of this file, e.g. STUDENT or
    # TEACHER).  The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:current_user_id).returns(role.nil? ? nil : role[:id])
    end

    # Overrides the current database with a procedure that, given a query,
    # will return results appropriate to our test suite.
    def use_fake_database
      # see http://www.rubydoc.info/github/jeremyevans/sequel/Sequel/Mock/Database
      fake_db = Sequel.connect 'mock://mysql'
      fake_db.server_version = 50616
      fake_db.fetch = Proc.new do |query|
        case query
          when /SELECT \* FROM `users` WHERE \(`id` = (\d+)\)/
            USERS.detect {|x| x[:id] == $1.to_i }

          when /SELECT \* FROM `users` WHERE \(\(`id` = (\d+)\) AND \(`admin` IS TRUE\)\)/
            USERS.detect {|x| x[:id] == $1.to_i and x[:admin] }

          when /SELECT `id` FROM `sections` WHERE \(`user_id` = #{TEACHER[:id]}\)/
            TEACHER_SECTIONS.map { |section| section.slice(:id) }

          when %r{
              SELECT .* FROM.`followers`.
              WHERE.\(\(`student_user_id`.=.'(\d+)'\).
              AND.\(`user_id`.=.(\d+)\)
          }x then
            FOLLOWERS.find_all {|x| x[:student_user_id] == $1.to_i and x[:user_id] == $2.to_i }

          when %r{
              SELECT .* FROM.`users`.
              INNER.JOIN.`followers`.
              ON.\(`followers`.`student_user_id`.=.`users`.`id`\).
              WHERE .* `user_id`.=.(\d+)
          }x
            USERS.find_all do |user|
              FOLLOWERS.any? do |f|
                f[:student_user_id] == user[:id] and f[:user_id] == $1.to_i
              end
            end.map { |x| x.slice(*V2_STUDENTS_KEY_LIST) }

          when %r{
              SELECT .* FROM.`users`.
              LEFT.OUTER.JOIN.`secret_pictures`.
              ON.\(`secret_pictures`.`id`.=.`users`.`secret_picture_id`\).
              WHERE.\(`users`.`id`.=.'(\d+)'\)
          }x
            USERS.find_all {|x| x[:id] == $1.to_i }.
                map {|x| x.slice(*V2_STUDENTS_KEY_LIST) }

          else nil
        end
      end

      Dashboard.stubs(:db).returns(fake_db)
    end

    #
    # Test Role: Student
    #
    STUDENT = {id: 14, name: 'Sally Student', admin: false, hidden: '0'}

    #
    # Test Role: Teacher
    #
    TEACHER = {id: 15, name: 'Terry Teacher', admin: false, hidden: '0'}
    TEACHER_SECTIONS = [
        {
            id: 150001,
            location: '/v2/sections/150001',
            name: 'Fake Section A',
            teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
        },
        {
            id: 150002,
            location: '/v2/sections/150002',
            name: 'Fake Section B',
            teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
        }]

    #
    # Test Role: Admin
    #
    ADMIN = {id: 16, name: 'Alice Admin', admin: true, hidden: '0'}

    #
    # Fake Table: Users
    #
    USERS = [STUDENT, TEACHER, ADMIN]

    #
    # Fake Table: Followers
    #
    FOLLOWERS = [
        {user_id: TEACHER[:id], student_user_id: STUDENT[:id]}
    ]

  end
end

# Wrapper for the Pegasus "Documents" app that sets necessary environment
# variables for this test.
class MockPegasus
  def initialize(app=nil, params={})
    @app = Documents.new(app)
  end

  def call(env)
    # Not sure why, but it seems necessary to set HTTP_HOST for Pegasus to find
    # the appropriate routes.
    env['HTTP_HOST'] = canonical_hostname('code.org') + (CDO.https_development ? '' : ":#{CDO.pegasus_port}")
    @app.call(env)
  end

end
