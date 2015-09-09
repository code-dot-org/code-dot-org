# Tests for the routes in v2_user_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative '../router'

#
# TEST ROLES
#

STUDENT = {id: 14, name: 'Sally Student', admin: false, hidden: '0'}

TEACHER = {id: 15, name: 'Terry Teacher', admin: false, hidden: '0'}
TEACHER_SECTIONS = [
    {
        id: 150001,
        location: '/v2/sections/150001',
        name: 'Fake Section A',
        login_type: 'word',
        grade: 'K',
        code: 'DOQWKH',
        course: {id: 17, name: 'course1'},
        teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
    },
    {
        id: 150002,
        location: '/v2/sections/150002',
        name: 'Fake Section B',
        login_type: 'word',
        grade: 'K',
        code: 'ABCXYZ',
        course: {id: 17, name: 'course1'},
        teachers: [{id: TEACHER[:id], location: "/v2/users/#{TEACHER[:id]}"}]
    }]

ADMIN = {id: 16, name: 'Alice Admin', admin: true, hidden: '0'}


# Use a mock database, pre-filled with the data we need
# see http://www.rubydoc.info/github/jeremyevans/sequel/Sequel/Mock/Database
require 'sequel'
DASHBOARD_DB = Sequel.connect "mock://mysql"
DASHBOARD_DB.server_version = 50616
FAKE_DATABASE_FOR_USER_ROUTES = Proc.new do |query|
  case query
    when /SELECT \* FROM `users` WHERE \(`id` = #{STUDENT[:id]}\)/ then STUDENT
    when /SELECT \* FROM `users` WHERE \(`id` = #{TEACHER[:id]}\)/ then TEACHER
    when /SELECT \* FROM `users` WHERE \(`id` = #{ADMIN[:id]}\)/ then ADMIN
    when /SELECT `id` FROM `sections` WHERE \(`user_id` = #{TEACHER[:id]}\)/ then
      TEACHER_SECTIONS.map do |section| section.slice(:id) end
    else nil
  end
end

class V2UserRoutesTest < Minitest::Test
  describe 'get /v2/user' do
    def setup
      DASHBOARD_DB.fetch = FAKE_DATABASE_FOR_USER_ROUTES
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    it 'returns 403 "Forbidden" when not signed in' do
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
end

# Stubs the user ID for the duration of the test to match the ID of the
# user hash given (see roles defined at the top of this file, e.g. STUDENT or
# TEACHER).  The result should be pulled in through the mock database.
# @param [Hash] role
def with_role(role)
  Sinatra::Request.any_instance.stubs(:user_id).returns(role[:id])
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
