require 'test_helper'

class Plc::UserCourseEnrollmentTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @course = create :plc_course
    @course_unit1 = create(:plc_course_unit, plc_course: @course)
    @course_unit2 = create(:plc_course_unit, plc_course: @course)
  end

  test 'Enrolling user in a task creates unit enrollments' do
    enrollment = Plc::UserCourseEnrollment.create(user: @user, plc_course: @course)

    assert_equal [@course_unit1, @course_unit2], enrollment.plc_unit_assignments.map(&:plc_course_unit)
    assert_equal [Plc::EnrollmentUnitAssignment::START_BLOCKED], enrollment.plc_unit_assignments.map(&:status).uniq
  end
end
