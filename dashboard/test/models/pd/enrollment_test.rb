require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase
  test 'code' do
    enrollment1 = create :pd_enrollment
    enrollment2 = create :pd_enrollment

    refute_nil enrollment1.code
    refute_nil enrollment2.code
    refute_equal enrollment1.code, enrollment2.code
  end

  test 'enrollment.for_user' do
    user = create :teacher
    enrollment1 = create :pd_enrollment, user_id: nil, email: user.email
    enrollment2 = create :pd_enrollment, user_id: user.id, email: 'someoneelse@example.com'

    enrollments = Pd::Enrollment.for_user(user).to_a
    assert_equal Set.new([enrollment1, enrollment2]), Set.new(enrollments)
  end

  test 'find by code' do
    enrollment = create :pd_enrollment

    found_enrollment = Pd::Enrollment.find_by(code: enrollment.code)
    assert_equal enrollment, found_enrollment
  end

  test 'resolve_user' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    enrollment_with_email = build :pd_enrollment, email: teacher1.email
    enrollment_with_user = build :pd_enrollment, user: teacher2
    enrollment_with_no_user = build :pd_enrollment

    assert_nil enrollment_with_email.user
    assert_equal teacher1, enrollment_with_email.resolve_user

    assert_equal teacher2, enrollment_with_user.user
    assert_equal teacher2, enrollment_with_user.resolve_user

    assert_nil enrollment_with_no_user.user
    assert_nil enrollment_with_no_user.resolve_user
  end

  test 'autoupdate_user_field called on validation' do
    teacher = create :teacher
    enrollment = build :pd_enrollment, email: teacher.email

    enrollment.valid?

    assert_equal teacher, enrollment.user
  end

  test 'required field validations without country' do
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

  test 'required field validations with country' do
    enrollment = Pd::Enrollment.new
    enrollment.first_name = 'FirstName'
    enrollment.last_name = 'LastName'
    enrollment.email = 'teacher@example.net'
    enrollment.school_info = build :school_info_us_public, :with_district, :with_school
    assert enrollment.valid?

    enrollment.school = 'test school'
    refute enrollment.valid?
    assert_equal ['School is forbidden'], enrollment.errors.full_messages
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

  test 'exit_survey_url' do
    normal_workshop = create :pd_ended_workshop
    normal_enrollment = create :pd_enrollment, workshop: normal_workshop

    counselor_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_COUNSELOR
    counselor_enrollment = create :pd_enrollment, workshop: counselor_workshop

    admin_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_ADMIN
    admin_enrollment = create :pd_enrollment, workshop: admin_workshop

    base_url = "https://#{CDO.pegasus_hostname}"
    assert_equal "#{base_url}/pd-workshop-survey/#{normal_enrollment.code}", normal_enrollment.exit_survey_url
    assert_equal "#{base_url}/pd-workshop-survey/counselor-admin/#{counselor_enrollment.code}", counselor_enrollment.exit_survey_url
    assert_equal "#{base_url}/pd-workshop-survey/counselor-admin/#{admin_enrollment.code}", admin_enrollment.exit_survey_url
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

  test 'old enrollments with no school info are still valid' do
    old_enrollment = create :pd_enrollment
    old_enrollment.update!(created_at: '2016-08-29', school_info: nil)
    assert old_enrollment.valid?
  end

  test 'school info is required on new enrollments, create and update' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_enrollment, school_info: nil
    end
    assert e.message.include? 'Validation failed: School info is required'

    enrollment = create :pd_enrollment
    refute enrollment.update(school_info: nil)
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

  test 'email format validation' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create :pd_enrollment, email: 'invalid@ example.net'
    end
    assert_equal 'Validation failed: Email does not appear to be a valid e-mail address', e.message

    assert create :pd_enrollment, email: 'valid@example.net'
  end

  test 'completed_survey?' do
    # no survey
    PEGASUS_DB.expects('[]').with(:forms).returns(mock(where: mock(any?: false)))
    enrollment = create :pd_enrollment
    refute enrollment.completed_survey?

    # survey just completed, not yet processed
    PEGASUS_DB.expects('[]').with(:forms).returns(mock(where: mock(any?: true)))
    assert enrollment.completed_survey?

    # survey processed, model up to date. Pegasus should not be contacted.
    PEGASUS_DB.expects('[]').with(:forms).never
    enrollment.update!(completed_survey_id: 1234)
    assert enrollment.completed_survey?
  end

  test 'filter_for_survey_completion argument check' do
    e = assert_raises do
      # not an enumerable
      Pd::Enrollment.filter_for_survey_completion('invalid type')
    end
    assert_equal 'Expected enrollments to be an Enumerable list of Pd::Enrollment objects', e.message

    e = assert_raises do
      # enumerable contains non-enrollments
      Pd::Enrollment.filter_for_survey_completion([create(:pd_enrollment), 'invalid type'])
    end
    assert_equal 'Expected enrollments to be an Enumerable list of Pd::Enrollment objects', e.message

    # valid
    assert Pd::Enrollment.filter_for_survey_completion([create(:pd_enrollment)])
  end

  test 'filter_for_survey_completion' do
    enrollments = [
      enrollment_no_survey = create(:pd_enrollment),
      enrollment_with_unprocessed_survey = create(:pd_enrollment),
      enrollment_with_processed_survey = create(:pd_enrollment, completed_survey_id: 1234)
    ]

    with_surveys = [enrollment_with_unprocessed_survey, enrollment_with_processed_survey]
    without_surveys = [enrollment_no_survey]
    PEGASUS_DB.stubs('[]').with(:forms).returns(stub(where:
        [
          {source_id: enrollment_with_unprocessed_survey.id.to_s},
          {source_id: enrollment_with_processed_survey.id.to_s}
        ]
      )
    )

    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments)
    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, true)
    assert_equal without_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, false)
  end

  test 'enrolling in class automatically enrolls in online learning' do
    Pd::Workshop::WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING.each do |course, plc_course_name|
      workshop = create :pd_workshop, course: course, subject: Pd::Workshop::SUBJECTS[course].first
      plc_course = create :plc_course, name: plc_course_name
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: workshop

      assert_equal 1, Plc::UserCourseEnrollment.where(user: teacher, plc_course: plc_course).size
    end

    workshop = create :pd_workshop, course: 'Counselor'
    teacher = create :teacher
    assert_no_difference('Plc::UserCourseEnrollment.count') do
      create :pd_enrollment, user: teacher, workshop: workshop
    end
  end

  test 'attendance scopes' do
    workshop = create :pd_workshop, num_sessions: 2
    teacher = create :teacher
    enrollment_not_attended = create :pd_enrollment
    enrollment_attended = create :pd_enrollment, workshop: workshop
    workshop.sessions.each do |session|
      create :pd_attendance, session: session, teacher: teacher, enrollment: enrollment_attended
    end

    assert_equal [enrollment_attended], Pd::Enrollment.attended
    assert_equal [enrollment_not_attended], Pd::Enrollment.not_attended
    assert_empty Pd::Enrollment.attended.not_attended
  end

  test 'ended workshop scope' do
    # not ended
    create :pd_enrollment
    enrollment_ended = create :pd_enrollment, workshop: create(:pd_ended_workshop)

    assert_equal [enrollment_ended], Pd::Enrollment.for_ended_workshops
  end

  test 'with_surveys scope' do
    ended_workshop = create :pd_ended_workshop, num_sessions: 1
    expected_enrollment = create :pd_enrollment, workshop: ended_workshop
    create :pd_attendance, session: ended_workshop.sessions.first, enrollment: expected_enrollment

    # Non-ended workshop, no attendance
    non_ended_workshop = create :pd_workshop, num_sessions: 1
    create :pd_enrollment, workshop: non_ended_workshop

    # Non-ended workshop, with attendance
    create :pd_enrollment, workshop: non_ended_workshop
    create :pd_attendance, session: non_ended_workshop.sessions.first

    # Ended workshop, no attendance
    create :pd_enrollment, workshop: ended_workshop

    assert_equal [expected_enrollment], Pd::Enrollment.with_surveys
  end
end
