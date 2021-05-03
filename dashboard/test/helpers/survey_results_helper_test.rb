require 'test_helper'

class SurveyResultsHelperTest < ActionView::TestCase
  include SurveyResultsHelper

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
  end

  setup do
    @teacher = create(:teacher, created_at: 3.weeks.ago)
    sign_in @teacher
  end

  test 'teacher account existed 14 days' do
    assert account_existed_14_days?
  end

  test 'teacher account newer than 14 days' do
    @teacher.update!(created_at: 1.week.ago)
    refute account_existed_14_days?
  end

  test 'teacher account has students' do
    create :follower, user: @teacher
    assert has_any_students?
  end

  test 'teacher account no students' do
    refute has_any_students?
  end

  test 'teacher account has no student under 13' do
    create :follower, user: @teacher, student_user: (create :old_student)
    assert has_any_students?
    refute has_any_student_under_13?
  end

  test 'teacher account has student under 13' do
    create :follower, user: @teacher, student_user: (create :young_student)
    assert has_any_students?
    assert has_any_student_under_13?
  end

  test 'show diversity survey' do
    stubs(:language).returns "en"
    stubs(:request).returns(stub(location: stub(try: "RD")))
    follower = create :follower, user: @teacher
    follower.student_user.update(age: 10)
    refute show_diversity_survey? SurveyResult::DIVERSITY_2021
  end
end
