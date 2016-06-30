require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase

  test 'code' do
    enrollment1 = create :pd_enrollment
    enrollment2 = create :pd_enrollment

    refute_nil enrollment1.code
    refute_nil enrollment2.code
    refute_equal enrollment1.code, enrollment2.code
  end

  test 'find by code' do
    enrollment = create :pd_enrollment

    found_enrollment = Pd::Enrollment.find_by(code: enrollment.code)
    assert_equal enrollment, found_enrollment
  end

  test 'resolve_user' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    enrollment_with_email = create :pd_enrollment, email: teacher1.email
    enrollment_with_user = create :pd_enrollment, user: teacher2
    enrollment_with_no_user = create :pd_enrollment

    assert_nil enrollment_with_email.user
    assert_equal teacher1, enrollment_with_email.resolve_user

    assert_equal teacher2, enrollment_with_user.user
    assert_equal teacher2, enrollment_with_user.resolve_user

    assert_nil enrollment_with_no_user.user
    assert_nil enrollment_with_no_user.resolve_user
  end

  # For enrollment form: user-supplied fields without an account.
  test 'validations without user' do
    enrollment = Pd::Enrollment.new
    refute enrollment.valid?
    assert_equal [
      'Name is required',
      'Email is required',
      'School is required',
      'School type is required'
    ], enrollment.errors.full_messages

    enrollment.name = 'name'
    enrollment.email = 'teacher@example.net'
    enrollment.school = 'school'
    enrollment.school_type = 'school type'
    assert enrollment.valid?
  end

  # For automatic enrollments for unenrolled attendees with a user account.
  test 'validations with user' do
    teacher = create :teacher
    enrollment = Pd::Enrollment.new user: teacher
    refute enrollment.valid?
    assert_equal [
      'Name is required',
      'Email is required'
    ], enrollment.errors.full_messages

    enrollment.name = teacher.name
    enrollment.email = teacher.email
    assert enrollment.valid?
  end

  test 'create_for_unenrolled_attendees' do
    workshop = create :pd_workshop
    workshop.section = create :section

    enrolled_attendee = create :teacher
    enrollment = create :pd_enrollment, workshop: workshop, name: enrolled_attendee.name, email: enrolled_attendee.email
    workshop.section.add_student enrolled_attendee

    unenrolled_attendee = create :teacher
    workshop.section.add_student unenrolled_attendee

    new_enrollments = Pd::Enrollment.create_for_unenrolled_attendees(workshop)
    refute_nil new_enrollments
    assert_equal 1, new_enrollments.length
    assert_equal unenrolled_attendee, new_enrollments.first.user
    assert_equal [enrollment.id, new_enrollments.first.id], workshop.enrollments.all.map(&:id)
  end

  test 'create_for_unenrolled_attendees with no email logs warning' do
    workshop = create :pd_workshop
    workshop.sessions << create(:pd_session)

    unenrolled_attendee_no_email = create :student
    create :pd_attendance, session: workshop.sessions.first, teacher: unenrolled_attendee_no_email

    mock_logger = mock
    mock_logger.expects(:warn).with(
      "Unable to create an enrollment for workshop attendee with no email. User Id: #{unenrolled_attendee_no_email.id}"
    )
    CDO.expects(:log).returns(mock_logger)

    Pd::Enrollment.create_for_unenrolled_attendees(workshop)
  end
end
