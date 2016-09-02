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

  test 'required field validations' do
    enrollment = Pd::Enrollment.new
    refute enrollment.valid?
    assert_equal [
      'Name is required',
      'Email is required',
      'School is required',
      'School info is required'
    ], enrollment.errors.full_messages

    enrollment.name = 'name'
    enrollment.email = 'teacher@example.net'
    enrollment.school = 'test school'
    enrollment.school_info = create(:school_info)
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

  test 'skip_school_validation' do
    enrollment = create :pd_enrollment

    enrollment.school = nil
    enrollment.school_info = nil
    refute enrollment.valid?
    assert 2, enrollment.errors.count

    enrollment.skip_school_validation = true
    assert enrollment.valid?
  end

  test 'soft delete' do
    enrollment = create :pd_enrollment
    enrollment.destroy!

    assert enrollment.reload.deleted?
    refute Pd::Enrollment.exists? enrollment.attributes
    assert Pd::Enrollment.with_deleted.exists? enrollment.attributes
  end
end
