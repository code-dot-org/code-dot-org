require 'test_helper'

class SurveyResultsHelperTest < ActionView::TestCase
  include SurveyResultsHelper

  test 'teacher account existed 14 days' do
    @teacher = create(:teacher, created_at: 3.weeks.ago)
    stubs(:current_user).returns(@teacher)

    assert teacher?
    assert account_existed_14_days?
  end

  test 'teacher account newer than 14 days' do
    @teacher = create(:teacher, created_at: 1.week.ago)
    stubs(:current_user).returns(@teacher)

    assert teacher?
    assert_equal account_existed_14_days?, false
  end

  test 'teacher account has students' do
    @teacher = create(:teacher)
    @student = create(:student)
    script = Script.find_by_name(Script::COURSE4_NAME)
    @section = create(:section, user: @teacher, script: script)
    create(:follower, section: @section, student_user: @student)
    stubs(:current_user).returns(@teacher)

    assert has_any_students?
  end

  test 'teacher account no students' do
    @teacher = create(:teacher)
    stubs(:current_user).returns(@teacher)

    assert_equal has_any_students?, false
  end

  test 'teacher account has no student under 13' do
    @teacher = create(:teacher)
    @student = create(:student)
    script = Script.find_by_name(Script::COURSE4_NAME)
    @section = create(:section, user: @teacher, script: script)
    create(:follower, section: @section, student_user: @student)
    stubs(:current_user).returns(@teacher)

    assert has_any_students?
    assert_equal has_any_student_under_13?, false
  end

  test 'teacher account has student under 13' do
    @teacher = create(:teacher)
    @student = create(:young_student)
    script = Script.find_by_name(Script::COURSE4_NAME)
    @section = create(:section, user: @teacher, script: script)
    create(:follower, section: @section, student_user: @student)
    stubs(:current_user).returns(@teacher)

    assert has_any_students?
    assert has_any_student_under_13?
  end
end
