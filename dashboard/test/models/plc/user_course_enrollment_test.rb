require 'test_helper'

class Plc::UserCourseEnrollmentTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @plc_course = create :plc_course
    # Create course units out of order to make sure that unit_order is respected
    @course_unit2 = create(:plc_course_unit, plc_course: @plc_course, unit_order: 2)
    @course_unit1 = create(:plc_course_unit, plc_course: @plc_course, unit_order: 1)
  end

  test 'Enrolling user in a course creates unit enrollments' do
    enrollment = Plc::UserCourseEnrollment.create(user: @teacher, plc_course: @plc_course)

    assert_equal [@course_unit2, @course_unit1], enrollment.plc_unit_assignments.map(&:plc_course_unit)
    assert_equal [Plc::EnrollmentUnitAssignment::START_BLOCKED], enrollment.plc_unit_assignments.map(&:status).uniq
  end

  test 'test bulk enrollments' do
    user_from_id = create :teacher
    student_email = 'some_student@code.org'
    @student = create :student, email: student_email
    nonexistent_email = 'wrong-email@wrong.com'

    created_enrollments, nonexistent_users, nonteacher_users, other_failure_users =
      Plc::UserCourseEnrollment.enroll_users([@teacher.email, user_from_id.id.to_s, nonexistent_email, student_email], @plc_course.id)

    assert_equal created_enrollments, [@teacher.email, user_from_id.email]
    assert_equal nonexistent_users, [nonexistent_email]
    assert_equal nonteacher_users, [student_email]
    assert_empty other_failure_users
  end

  test 'enrolling in a started course creates unit enrollments that are in progress' do
    @course_unit1.update(started: true)

    enrollment = Plc::UserCourseEnrollment.create(user: @teacher, plc_course: @plc_course)

    assert_equal [@course_unit2, @course_unit1], enrollment.plc_unit_assignments.map(&:plc_course_unit)
    assert_equal [Plc::EnrollmentUnitAssignment::START_BLOCKED, Plc::EnrollmentUnitAssignment::IN_PROGRESS], enrollment.plc_unit_assignments.map(&:status)
  end

  test 'summarize works as expected' do
    enrollment = Plc::UserCourseEnrollment.create(user: @teacher, plc_course: @plc_course)
    expected_summary = {
      courseName: @plc_course.name,
      link: Rails.application.routes.url_helpers.course_path(@plc_course.unit_group),
      status: enrollment.status,
      courseUnits: [
        {
          unitName: @course_unit1.unit_name,
          link: "/s/#{@course_unit1.script.name}",
          moduleAssignments: [],
          status: 'start_blocked'
        },
        {
          unitName: @course_unit2.unit_name,
          link: "/s/#{@course_unit2.script.name}",
          moduleAssignments: [],
          status: 'start_blocked'
        }
      ]
    }
    assert_equal expected_summary, enrollment.summarize
  end

  test 'enrolling a non-authorized teacher in a course creates an authorized teacher user permission' do
    refute UserPermission.exists?(user_id: @teacher.id, permission: UserPermission::AUTHORIZED_TEACHER)
    create(:plc_user_course_enrollment, user: @teacher, plc_course: @plc_course)
    assert UserPermission.exists?(user_id: @teacher.id, permission: UserPermission::AUTHORIZED_TEACHER)
  end

  test 'enrolling a student in a course does not create an authorized teacher user permission' do
    student = create :student
    refute UserPermission.exists?(user_id: student.id, permission: UserPermission::AUTHORIZED_TEACHER)
    create(:plc_user_course_enrollment, user: student, plc_course: @plc_course)
    refute UserPermission.exists?(user_id: student.id, permission: UserPermission::AUTHORIZED_TEACHER)
  end
end
