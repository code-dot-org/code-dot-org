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
      'School district is required'
    ], enrollment.errors.full_messages

    enrollment.name = 'name'
    enrollment.email = 'teacher@example.net'
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

  test 'emails are stored in lowercase and stripped' do
    enrollment = build :pd_enrollment, email: ' MixedCase@Example.net '
    assert_equal 'mixedcase@example.net', enrollment.email

    # Also accepts nil
    enrollment.email = nil
    assert_nil enrollment.email
  end

  test 'in_section?' do
    workshop = create :pd_workshop
    workshop.sessions << create(:pd_session, workshop: workshop)

    # no section, no user: false
    enrollment = create :pd_enrollment, workshop: workshop
    refute enrollment.in_section?

    # section, no user: false
    workshop.start! # Start to create section.
    refute enrollment.in_section?

    # section with disconnected user: false
    teacher = create :teacher, name: enrollment.name, email: enrollment.email
    refute enrollment.in_section?

    # in section: true
    workshop.section.add_student teacher
    assert enrollment.in_section?
  end
end
