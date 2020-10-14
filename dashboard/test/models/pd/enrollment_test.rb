require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants

  test 'code' do
    enrollment1 = create :pd_enrollment
    enrollment2 = create :pd_enrollment

    refute_nil enrollment1.code
    refute_nil enrollment2.code
    refute_equal enrollment1.code, enrollment2.code
  end

  test 'enrollment.for_user' do
    user = create :teacher
    enrollment1 = create :pd_enrollment, user_id: nil, email: user.email, workshop: (create :workshop, course: COURSE_CSD)
    enrollment2 = create :pd_enrollment, user_id: user.id, email: 'someoneelse@example.com', workshop: (create :workshop, course: COURSE_CSF)

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

  test 'required field validations with country' do
    enrollment = Pd::Enrollment.new
    enrollment.first_name = 'FirstName'
    enrollment.last_name = 'LastName'
    enrollment.email = 'teacher@example.net'
    enrollment.school_info = build :school_info
    assert enrollment.valid?
  end

  test 'emails are stored in lowercase and stripped' do
    enrollment = build :pd_enrollment, email: ' MixedCase@Example.net '
    assert_equal 'mixedcase@example.net', enrollment.email

    # Also accepts nil
    enrollment.email = nil
    assert_nil enrollment.email
  end

  test 'soft delete' do
    enrollment = create :pd_enrollment
    enrollment.destroy!

    assert enrollment.reload.deleted?
    refute Pd::Enrollment.exists? enrollment.id
    assert Pd::Enrollment.with_deleted.exists? enrollment.id
  end

  test 'for_school_district' do
    school_info = create :school_info
    enrollment_in_district = create :pd_enrollment, school_info: school_info
    _enrollment_out_of_district = create :pd_enrollment

    assert_equal [enrollment_in_district], Pd::Enrollment.for_school_district(school_info.school_district)
  end

  test 'pre_workshop_survey_url' do
    csp_summer_workshop = build :csp_summer_workshop
    csp_summer_workshop_enrollment = build :pd_enrollment, workshop: csp_summer_workshop

    csp_academic_year_workshop = build :csp_academic_year_workshop
    csp_academic_year_workshop_enrollment = build :pd_enrollment, workshop: csp_academic_year_workshop

    csf_deep_dive_workshop = build :csf_deep_dive_workshop
    csf_201_workshop_enrollment = build :pd_enrollment, workshop: csf_deep_dive_workshop

    csf_intro_workshop = build :csf_intro_workshop
    csf_intro_workshop_enrollment = build :pd_enrollment, workshop: csf_intro_workshop

    assert_equal "/pd/workshop_pre_survey?enrollmentCode=#{csp_summer_workshop_enrollment.code}",
      URI(csp_summer_workshop_enrollment.pre_workshop_survey_url).path + '?' + URI(csp_summer_workshop_enrollment.pre_workshop_survey_url).query
    assert_nil csp_academic_year_workshop_enrollment.pre_workshop_survey_url
    assert_equal '/pd/workshop_survey/csf/pre201', URI(csf_201_workshop_enrollment.pre_workshop_survey_url).path
    assert_nil csf_intro_workshop_enrollment.pre_workshop_survey_url
  end

  test 'exit_survey_url' do
    csf_workshop = create :csf_workshop, :ended, sessions_from: Date.new(2020, 5, 8)
    csf_enrollment = create :pd_enrollment, workshop: csf_workshop

    csp_workshop = create :workshop, :ended, course: Pd::Workshop::COURSE_CSP
    csp_enrollment = create :pd_enrollment, workshop: csp_workshop

    counselor_workshop = create :counselor_workshop, :ended
    counselor_enrollment = create :pd_enrollment, workshop: counselor_workshop

    admin_workshop = create :admin_workshop, :ended
    admin_enrollment = create :pd_enrollment, workshop: admin_workshop

    local_summer_workshop = create :csp_summer_workshop, :ended
    local_summer_enrollment = create :pd_enrollment, workshop: local_summer_workshop

    csp_wfrt = create :csp_wfrt, :ended
    csp_wfrt_enrollment = create :pd_enrollment, workshop: csp_wfrt

    code_org_url = ->(path) {CDO.code_org_url(path, CDO.default_scheme)}
    assert_equal code_org_url["/pd-workshop-survey/counselor-admin/#{counselor_enrollment.code}"], counselor_enrollment.exit_survey_url
    assert_equal code_org_url["/pd-workshop-survey/counselor-admin/#{admin_enrollment.code}"], admin_enrollment.exit_survey_url

    studio_url = ->(path) {CDO.studio_url(path, CDO.default_scheme)}
    assert_equal studio_url["/pd/workshop_survey/csf/post101/#{csf_enrollment.code}"], csf_enrollment.exit_survey_url
    assert_equal studio_url["/pd/workshop_post_survey?enrollmentCode=#{local_summer_enrollment.code}"], local_summer_enrollment.exit_survey_url
    assert_equal studio_url["/pd/workshop_post_survey?enrollmentCode=#{csp_enrollment.code}"], csp_enrollment.exit_survey_url
    assert_equal studio_url["/pd/workshop_post_survey?enrollmentCode=#{csp_wfrt_enrollment.code}"], csp_wfrt_enrollment.exit_survey_url
  end

  test 'should_send_exit_survey' do
    normal_workshop = create :workshop, :ended
    normal_enrollment = create :pd_enrollment, workshop: normal_workshop

    assert normal_enrollment.should_send_exit_survey?

    fit_workshop = create :fit_workshop, :ended
    fit_enrollment = create :pd_enrollment, user: create(:teacher), workshop: fit_workshop

    refute fit_enrollment.should_send_exit_survey?
  end

  test 'send_exit_survey does not send mail when the survey was already sent' do
    enrollment = create :pd_enrollment, user: create(:teacher), survey_sent_at: Time.now
    Pd::WorkshopMailer.expects(:exit_survey).never

    enrollment.send_exit_survey
  end

  test 'send_exit_survey does not send mail for FIT Weekend workshops' do
    workshop = create :fit_workshop, :ended
    enrollment = create :pd_enrollment, user: create(:teacher), workshop: workshop
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
      enrollment_with_processed_survey = create(:pd_enrollment, :from_user)
    ]

    existing_survey = create :csf_intro_post_foorm_submission,
      :answers_high,
      form_name: "surveys/pd/workshop_csf_intro_post"

    create :csf_intro_post_workshop_submission,
      foorm_submission: existing_survey,
      user: enrollment_with_processed_survey.user,
      pd_workshop_id: enrollment_with_processed_survey.workshop.id

    with_surveys = [enrollment_with_processed_survey]
    without_surveys = [enrollment_no_survey]

    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments)
    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, true)
    assert_equal without_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, false)
  end

  test 'local summer survey filter' do
    workshop = create :summer_workshop
    teacher = create :teacher
    enrollment = create :pd_enrollment, :from_user, user: teacher, workshop: workshop

    assert_equal [enrollment], Pd::Enrollment.filter_for_survey_completion([enrollment], false)

    # complete survey
    existing_survey = create :daily_workshop_day_5_foorm_submission,
      :answers_high,
      form_name: "surveys/pd/summer_workshop_post_survey"

    create :day_5_workshop_foorm_submission,
      foorm_submission: existing_survey,
      user: enrollment.user,
      pd_workshop_id: enrollment.workshop.id
    assert_equal [], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'academic year survey filter' do
    workshop = create :csp_academic_year_workshop
    teacher = create :teacher
    enrollment = create :pd_enrollment, :from_user, user: teacher, workshop: workshop

    # academic year surveys should always return [] since we do not show post-surveys in the dashboard
    assert_equal [], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'enrolling in class automatically enrolls in online learning' do
    Pd::Workshop::WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING.each do |course, plc_course_name|
      workshop = create :workshop, course: course, subject: Pd::Workshop::SUBJECTS[course].first
      plc_course = create :plc_course, name: plc_course_name
      teacher = create :teacher
      create :pd_enrollment, user: teacher, workshop: workshop

      assert_equal 1, Plc::UserCourseEnrollment.where(user: teacher, plc_course: plc_course).size
    end

    workshop = create :workshop, course: 'Counselor'
    teacher = create :teacher
    assert_no_difference('Plc::UserCourseEnrollment.count') do
      create :pd_enrollment, user: teacher, workshop: workshop
    end
  end

  test 'enrolling in class, and then later having the user field updated enrolls in online learning' do
    teacher = create :teacher
    create :plc_course, name: 'ECS Support'
    workshop = create :workshop, course: Pd::Workshop::COURSE_ECS
    enrollment = create :pd_enrollment, user: nil, workshop: workshop

    assert_creates Plc::UserCourseEnrollment do
      enrollment.update(user: teacher)
    end
    assert_equal 'ECS Support', Plc::UserCourseEnrollment.find_by(user: teacher).plc_course.name
  end

  test 'enrolling in class while not logged in still associates the user' do
    teacher = create :teacher
    create :plc_course, name: 'ECS Support'
    workshop = create :workshop, course: Pd::Workshop::COURSE_ECS

    assert_creates Plc::UserCourseEnrollment do
      create :pd_enrollment, user: nil, workshop: workshop, email: teacher.email
    end

    assert_equal 'ECS Support', Plc::UserCourseEnrollment.find_by(user: teacher).plc_course.name
  end

  test 'enrolling in class without an account creates enrollment when the user is created' do
    create :plc_course, name: 'ECS Support'
    workshop = create :workshop, course: Pd::Workshop::COURSE_ECS
    user_email = "#{SecureRandom.hex}@code.org"
    create :pd_enrollment, user: nil, email: user_email, workshop: workshop

    teacher = assert_creates Plc::UserCourseEnrollment do
      create(:teacher, email: user_email)
    end

    assert_equal 'ECS Support', Plc::UserCourseEnrollment.find_by(user: teacher).plc_course.name
  end

  test 'attendance scopes' do
    workshop = create :workshop, num_sessions: 2
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
    enrollment_ended = create :pd_enrollment, workshop: create(:workshop, :ended)

    assert_equal [enrollment_ended], Pd::Enrollment.for_ended_workshops
  end

  test 'with_surveys scope' do
    # Ended workshop with attendance
    # (ONLY this one should show up in the scope at the end of the test)
    ended_workshop = create :workshop, :ended
    expected_enrollment = create :pd_enrollment, workshop: ended_workshop
    create :pd_attendance, session: ended_workshop.sessions.first, enrollment: expected_enrollment

    # Ended FiT workshop, with attendance
    # (Checks a special case: FiT workshops don't have exit surveys)
    fit_workshop = create :fit_workshop, :ended
    fit_enrollment = create :pd_enrollment, workshop: fit_workshop
    create :pd_attendance, session: fit_workshop.sessions.first, enrollment: fit_enrollment

    # Ended Facilitator workshop, with attendance
    # (Checks a special case: Facilitator workshops don't have exit surveys)
    facilitator_workshop = create :facilitator_workshop, :ended
    facilitator_enrollment = create :pd_enrollment, workshop: facilitator_workshop
    create :pd_attendance, session: facilitator_workshop.sessions.first, enrollment: facilitator_enrollment

    # Non-ended workshop, no attendance
    # (No surveys because not ended)
    non_ended_workshop = create :workshop
    create :pd_enrollment, workshop: non_ended_workshop

    # Non-ended workshop, with attendance
    # (No surveys because not ended)
    create :pd_enrollment, workshop: non_ended_workshop
    create :pd_attendance, session: non_ended_workshop.sessions.first

    # Ended workshop, no attendance
    # (No surveys because no attendance)
    create :pd_enrollment, workshop: ended_workshop

    assert_equal [expected_enrollment], Pd::Enrollment.with_surveys
  end

  test 'with_surveys scope includes workshops with no subject' do
    # Cover a regression introduced in https://github.com/code-dot-org/code-dot-org/pull/29511
    # where pending exit surveys for a workshop with no subject would not show up on the
    # professional learning landing page.
    # Root cause: WHERE subject != 'xyz' implicitly excludes rows where subject IS NULL too.

    # Ended Admin workshop with attendance; Admin workshops have no subject.
    admin_workshop = create :admin_workshop, :ended
    expected_enrollment = create :pd_enrollment, workshop: admin_workshop
    create :pd_attendance, session: admin_workshop.sessions.first, enrollment: expected_enrollment

    assert_equal [expected_enrollment], Pd::Enrollment.with_surveys
  end

  test 'name fields are auto-stripped' do
    enrollment = build :pd_enrollment, first_name: ' First  ', last_name: '  Last '
    enrollment.validate
    assert_equal 'First', enrollment.first_name
    assert_equal 'Last', enrollment.last_name
  end

  test 'get safe names' do
    enrollments = create_list :pd_enrollment, 5
    safe_names = Pd::Enrollment.where(id: enrollments.pluck(:id)).order(:id).get_safe_names
    assert_equal 5, safe_names.length

    # each safe name is a tuple of the full name and the enrollment itself
    expected = enrollments.map {|e| [e.full_name, e]}
    assert_equal expected, safe_names
  end

  test 'school is deprecated' do
    enrollment = build :pd_enrollment, school: 'a school'
    returned_school = assert_deprecated 'School is deprecated. Use school_info or school_name instead.' do
      enrollment.school
    end
    assert_equal 'a school', returned_school
  end

  test 'school_name calls school_info.effective_school_name' do
    enrollment = build :pd_enrollment
    enrollment.school_info.expects(:effective_school_name).returns('effective school name')
    assert_equal 'effective school name', enrollment.school_name
  end

  test 'school_name falls back to school if no school info' do
    enrollment = build :pd_enrollment, school_info: nil, school: 'old format school'
    assert_equal 'old format school', enrollment.school_name
  end

  test 'school_district calls school_info.effective_school_district_name' do
    enrollment = build :pd_enrollment
    enrollment.school_info.expects(:effective_school_district_name).returns('effective school district name')
    assert_equal 'effective school district name', enrollment.school_district_name
  end

  test 'school is forbidden' do
    enrollment = build :pd_enrollment, school: 'a school'
    refute enrollment.valid?
    assert_equal ['School is forbidden'], enrollment.errors.full_messages
  end

  test 'old enrollments with school are grandfathered in' do
    old_enrollment = build :pd_enrollment, school: 'a school'
    old_enrollment.save(validate: false)
    assert old_enrollment.valid?

    # but they can't be changed
    old_enrollment.school = 'another school'
    refute old_enrollment.valid?
  end

  test 'school info country required on create' do
    enrollment = build :pd_enrollment, school_info: create(:school_info_without_country)
    refute enrollment.valid?
    assert enrollment.errors.full_messages.include? 'School info must have a country'
  end

  test 'old enrollments with no school info country are grandfathered in' do
    old_enrollment = build :pd_enrollment, school_info: create(:school_info_without_country)
    old_enrollment.save(validate: false)
    assert old_enrollment.valid?
  end

  test 'enrollment is deleted after clear_data for deleted owner' do
    enrollment = create :pd_enrollment, :from_user
    enrollment.user.destroy!

    enrollment.clear_data
    enrollment.reload

    assert enrollment.deleted?
  end

  test 'enrollment is valid after clear_data for deleted owner' do
    enrollment = create :pd_enrollment, :from_user
    enrollment.user.destroy!

    enrollment.clear_data

    assert_nil enrollment.read_attribute :name
    assert_equal '', enrollment.name
    assert_nil enrollment.first_name
    assert_nil enrollment.last_name
    assert_equal '', enrollment.email
    assert_nil enrollment.user_id
    assert_nil enrollment.school
    assert_nil enrollment.school_info_id
    assert enrollment.reload.valid?, enrollment.errors.messages
  end

  test 'Enrolling user in CSD course makes them an authorized teacher' do
    teacher = create :teacher
    assert_empty teacher.permissions

    workshop = create :workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD
    create :pd_enrollment, workshop: workshop, user: teacher

    assert teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'Enrolling user in CSF course does not make them authorized teacher' do
    teacher = create :teacher
    assert_empty teacher.permissions

    workshop = create :workshop, course: Pd::SharedWorkshopConstants::COURSE_CSF
    create :pd_enrollment, workshop: workshop, user: teacher

    refute teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'Updating existing enrollment sets permission' do
    workshop = create :workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD
    enrollment = create :pd_enrollment, workshop: workshop, user: nil

    teacher = create :teacher

    refute teacher.permission? UserPermission::AUTHORIZED_TEACHER

    enrollment.update(user: teacher)

    assert teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'update scholarship status for local summer workshop' do
    workshop = create :summer_workshop
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    # no scholarship info initially
    assert_nil enrollment.scholarship_status

    # updating status should create scholarship info
    enrollment.update_scholarship_status(Pd::ScholarshipInfoConstants::NO)
    assert_equal Pd::ScholarshipInfoConstants::NO, enrollment.scholarship_status

    # updating to invalid status should fail
    refute enrollment.update_scholarship_status 'invalid status'
    assert_equal Pd::ScholarshipInfoConstants::NO, enrollment.scholarship_status

    # updating to a valid status should work
    enrollment.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_OTHER)
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, enrollment.scholarship_status
  end

  test 'update scholarship status for csf workshop' do
    workshop = create :workshop, sessions_from: Date.current + 3.months, course: Pd::SharedWorkshopConstants::COURSE_CSF
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    # initially creates scholarship info with YES_CDO status
    assert_equal enrollment.scholarship_status, Pd::ScholarshipInfoConstants::YES_CDO

    # updating to invalid status should fail
    refute enrollment.update_scholarship_status 'invalid status'
    assert_equal enrollment.scholarship_status, Pd::ScholarshipInfoConstants::YES_CDO

    # updating to a valid status should work
    enrollment.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_OTHER)
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, enrollment.scholarship_status
  end

  test 'scholarship info automatically created when enrolling in csf workshop' do
    workshop = create :workshop, sessions_from: Date.current + 3.months, course: Pd::SharedWorkshopConstants::COURSE_CSF
    enrollment = create :pd_enrollment, :from_user, workshop: workshop

    # initially creates scholarship info with YES_CDO status
    assert_equal enrollment.scholarship_status, Pd::ScholarshipInfoConstants::YES_CDO
  end

  test 'find matching application for an enrollment' do
    workshop = create :workshop
    teacher = create :teacher
    enrollment = create :pd_enrollment, user: teacher, workshop: workshop
    application = create :pd_teacher2021_application, user: teacher

    assert_nil enrollment.application_id

    application.update(pd_workshop_id: workshop.id)

    # Can only link an enrollment to an application when the application is assigned to the same workshop
    assert_equal application.id, enrollment.application_id
  end
end
