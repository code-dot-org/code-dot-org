require 'test_helper'

class ApiControllerQueriesTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test "section_level_progress" do
    skip "flaky as of 7/17/2023"
    section = create(:section)
    students = (1..50).map {create :student}
    students.each {|s| section.students << s}

    script = create(:script)
    create(:lesson_group, lessons: [create(:script_level, script: script).lesson], script: script)

    refute_empty script.script_levels
    script.script_levels.each do |script_level|
      students.each do |student|
        create :user_level, user: student, level: script_level.level, script: script
      end
      create :teacher_feedback, student: students.first, teacher: section.teacher, level: script_level.level, script: script
    end
    # This test has been flaky due to one fewer query on the teacher_feedbacks table.
    # Without a better theory for why, assert that there are teacher_feedback entries.
    refute_empty section.teacher.teacher_feedbacks

    sign_in_as section.teacher

    assert_queries 10 do
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
