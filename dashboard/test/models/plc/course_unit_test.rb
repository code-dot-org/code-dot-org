require 'test_helper'

class CourseUnitTest < ActionView::TestCase
  setup do
    @plc_course = create :plc_course
    @user = create :teacher
  end

  test 'Launching course units works with no created unit assignments' do
    # Simulates a unit that was created after people were enrolled
    @enrollment = Plc::UserCourseEnrollment.create(user: @user, plc_course: @plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course, started: false)

    @course_unit.launch

    course_unit_assertions
  end

  test 'Launching course units with with already created assignments' do
    # Simulates a unit that people were enrolled in but was locked
    @course_unit = create(:plc_course_unit, plc_course: @plc_course, started: false)
    @enrollment = Plc::UserCourseEnrollment.create(user: @user, plc_course: @plc_course)

    @course_unit.launch

    course_unit_assertions
  end

  private

  def course_unit_assertions
    assert @course_unit.started
    assert_equal 1, @course_unit.plc_unit_assignment.size
    assignment = @course_unit.plc_unit_assignment.first
    assert_equal @course_unit, assignment.plc_course_unit
    assert_equal @enrollment, assignment.plc_user_course_enrollment
    assert_equal @user, assignment.user
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS.to_s, assignment.status
  end
end
