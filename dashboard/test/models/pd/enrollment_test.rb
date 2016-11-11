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
      'First name is required',
      'Last name is required',
      'Email is required',
      'School is required',
      'School info is required'
    ], enrollment.errors.full_messages

    enrollment.first_name = 'FirstName'
    enrollment.last_name = 'LastName'
    enrollment.email = 'teacher@example.net'
    enrollment.school = 'test school'
    enrollment.school_info = create(:school_info_without_country)
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
    teacher = create :teacher, name: enrollment.full_name, email: enrollment.email
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

  test 'for_school_district' do
    school_district = create :school_district
    school_info = create :school_info_without_country, school_district: school_district
    enrollment_in_district = create :pd_enrollment, school_info: school_info
    _enrollment_out_of_district = create :pd_enrollment

    assert_equal [enrollment_in_district], Pd::Enrollment.for_school_district(school_district)
  end

  test 'send_exit_survey does not send mail when there is no user' do
    enrollment = create :pd_enrollment
    Pd::WorkshopMailer.expects(:exit_survey).never

    enrollment.send_exit_survey
  end

  test 'send_exit_survey does not send mail when the survey was already sent' do
    enrollment = create :pd_enrollment, user: create(:teacher), survey_sent_at: Time.now
    Pd::WorkshopMailer.expects(:exit_survey).never

    enrollment.send_exit_survey
  end

  test 'send_exit_survey sends email and updates survey_sent_at' do
    enrollment = create :pd_enrollment, user: create(:teacher)

    mock_mail = stub(deliver_now: nil)
    Pd::WorkshopMailer.expects(:exit_survey).once.returns(mock_mail)

    enrollment.send_exit_survey
    assert_not_nil enrollment.reload.survey_sent_at
  end

  test 'name is deprecated and calls through to full_name' do
    enrollment = create :pd_enrollment
    enrollment.expects(:full_name)
    assert_deprecated 'name is deprecated. Use first_name & last_name instead.' do
      enrollment.name
    end

    enrollment.expects('full_name=' => 'First Last')
    assert_deprecated 'name is deprecated. Use first_name & last_name instead.' do
      enrollment.name = 'First Last'
    end
  end

  test 'old enrollments with no last name are still valid' do
    old_enrollment = create :pd_enrollment
    old_enrollment.update!(created_at: '2016-11-09', last_name: '')
    assert old_enrollment.valid?
  end

  test 'last name is required on new enrollments, create and update' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_enrollment, last_name: ''
    end
    assert e.message.include? 'Validation failed: Last name is required'

    enrollment = create :pd_enrollment
    refute enrollment.update(last_name: '')
  end

  test 'full_name' do
    enrollment = create :pd_enrollment
    enrollment.full_name = 'SplitFirst SplitLast'
    assert_equal 'SplitFirst', enrollment.first_name
    assert_equal 'SplitLast', enrollment.last_name

    enrollment.full_name = 'FirstOnly'
    assert_equal 'FirstOnly', enrollment.first_name
    assert_equal '', enrollment.last_name

    enrollment.full_name = 'SplitFirst SplitSecond SplitThird'
    assert_equal 'SplitFirst', enrollment.first_name
    assert_equal 'SplitSecond SplitThird', enrollment.last_name

    enrollment.first_name = 'SeparateFirst'
    enrollment.last_name = 'SeparateLast'
    assert_equal 'SeparateFirst SeparateLast', enrollment.full_name
  end
end
