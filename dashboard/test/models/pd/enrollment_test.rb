require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase
  include DistrictDropdownConstants

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

  # charter + zip  --  success
  test 'district by type charter and zip, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_CHARTER, school_zip: 98144, school_state: nil, school_district_id: nil
    assert enrollment.valid?
  end

  # private + zip  --  success
  test 'district by type private and zip, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PRIVATE, school_zip: 98144, school_state: nil, school_district_id: nil
    assert enrollment.valid?
  end

  # public + state "other"  --  success
  test 'district by type public and state other, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PUBLIC, school_state: SCHOOL_STATE_OTHER, school_district_id: nil
    assert enrollment.valid?
  end

  # public + state + district  --  success
  test 'district by type public and state and district, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: create(:school_district).id
    assert enrollment.valid?
  end

  # public + state + district "other"  --  success
  test 'district by type public and state and district other, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_other: true, school_district_id: nil
    assert enrollment.valid?
  end

  # other + state "other"  --  success
  test 'district by type other and state other, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_OTHER, school_state: SCHOOL_STATE_OTHER, school_district_id: nil
    assert enrollment.valid?
  end

  # other + state + district  --  success
  test 'district by type other and state and district, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: create(:school_district).id
    assert enrollment.valid?
  end

  # other + state + district "other"  --  success
  test 'district by type other and state and district other, validation succeeds' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_OTHER, school_state: "WA", school_district_other: true, school_district_id: nil
    assert enrollment.valid?
  end

  # charter + no zip  --  fail
  test 'district by type charter and no zip, validation fails' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_CHARTER, school_zip: nil, school_district_id: nil, school_district_other: nil, school_state: nil
    refute enrollment.valid?  # Run the validations and set errors
  end

  # private + no zip  --  fail
  test 'district by type private and no zip, validation fails' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PRIVATE, school_zip: nil, school_state: nil, school_district_id: nil
    refute enrollment.valid?  # Run the validations and set errors
  end

  # public + state "not other" + no district + no district "other"  --  fail
  test 'district by type public and state but no district, validation fails' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_PUBLIC, school_state: "WA", school_district_id: nil, school_district_other: false
    refute enrollment.valid?  # Run the validations and set errors
  end

  # other + state "not other" + no district + no district "other"  --  fail
  test 'district by type other and state but no district, validation fails' do
    enrollment = build :pd_enrollment, school_type: SCHOOL_TYPE_OTHER, school_state: "WA", school_district_id: nil, school_district_other: false
    refute enrollment.valid?  # Run the validations and set errors
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
      'School district is required',
      'School is required'
    ], enrollment.errors.full_messages

    enrollment.name = 'name'
    enrollment.email = 'teacher@example.net'
    enrollment.school = 'school'
    enrollment.school_type = DistrictDropdownConstants::SCHOOL_TYPE_CHARTER
    enrollment.school_zip = 98144
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
    workshop.sessions << create(:pd_session)

    enrolled_attendee = create :teacher
    enrollment = create :pd_enrollment, workshop: workshop, name: enrolled_attendee.name, email: enrolled_attendee.email
    create :pd_attendance, session: workshop.sessions.first, teacher: enrolled_attendee

    unenrolled_attendee = create :teacher
    create :pd_attendance, session: workshop.sessions.first, teacher: unenrolled_attendee

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
    mock_logger.expects(:warning).with(
      "Unable to create an enrollment for workshop attendee with no email. User Id: #{unenrolled_attendee_no_email.id}"
    )
    CDO.expects(:log).returns(mock_logger)

    Pd::Enrollment.create_for_unenrolled_attendees(workshop)
  end
end
