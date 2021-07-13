require 'test_helper'

class ApiControllerQueriesTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test "section_level_progress" do
    section = create(:section)
    students = (1..50).map {create :student}
    students.each {|s| section.students << s}
    script = Script.find_by_name('algebra')
    script.script_levels.each do |script_level|
      students.each do |student|
        create :user_level, user: student, level: script_level.level, script: script
      end
    end

    sign_in_as section.teacher

    assert_queries 9 do
      get '/dashboardapi/section_level_progress', params: {
        section_id: section.id,
        script_id: script.id
      }
    end
    assert_response :success
  end

  private

  def sign_in_as(user)
    sign_in user
    # Required become some queries are triggered on the first IntegrationTest
    # request after a user signs in, and we don't want them to be counted in
    # our tests.
    get '/home'
  end
end
