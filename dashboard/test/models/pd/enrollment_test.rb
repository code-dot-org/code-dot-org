require 'test_helper'

class Pd::EnrollmentTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants

  test 'code' do
    enrollment1 = create(:pd_enrollment)
    enrollment2 = create(:pd_enrollment)

    refute_nil enrollment1.code
    refute_nil enrollment2.code
    refute_equal enrollment1.code, enrollment2.code
  end

  test 'enrollment.for_user using user email' do
    user = create(:teacher)

    enrollment1 = create(:pd_enrollment, user_id: nil, email: user.email, workshop: (create(:workshop, course: COURSE_CSD)))
    enrollment2 = create(:pd_enrollment, user_id: user.id, email: 'someoneelse@example.com', workshop: (create(:workshop, course: COURSE_CSP)))

    enrollments = Pd::Enrollment.for_user(user).to_a
    assert_equal Set.new([enrollment1, enrollment2]), Set.new(enrollments)
  end

  test 'enrollment.for_user using user alternate email' do
    user = create(:teacher)
    create(:pd_teacher_application, user: user, status: 'accepted')

    enrollment = create(:pd_enrollment, user_id: nil, email: user.alternate_email, workshop: (create(:workshop, course: COURSE_CSD)))

    enrollments_for_user = Pd::Enrollment.for_user(user).to_a
    assert_equal enrollments_for_user.first, enrollment
  end

  test 'find by code' do
    enrollment = create(:pd_enrollment)

    found_enrollment = Pd::Enrollment.find_by(code: enrollment.code)
    assert_equal enrollment, found_enrollment
  end

  test 'resolve_user returns nil for no user' do
    enrollment_with_no_user = build(:pd_enrollment)

    assert_nil enrollment_with_no_user.user
    assert_nil enrollment_with_no_user.resolve_user
  end

  test 'resolve_user returns user using explicitly defined user' do
    teacher = create(:teacher)
    enrollment_with_user = build(:pd_enrollment, user: teacher)

    assert_equal teacher, enrollment_with_user.user
    assert_equal teacher, enrollment_with_user.resolve_user
  end

  test 'resolve_user returns user using user email' do
    teacher = create(:teacher)
    enrollment_with_email = build(:pd_enrollment, email: teacher.email)

    assert_equal enrollment_with_email.email, teacher.email
    assert_nil enrollment_with_email.user
    assert_equal teacher, enrollment_with_email.resolve_user
  end

  test 'autoupdate_user_field called on validation' do
    teacher = create(:teacher)
    enrollment = build(:pd_enrollment, email: teacher.email)

    enrollment.valid?

    assert_equal teacher, enrollment.user
  end

  test 'required field validations with country' do
    enrollment = Pd::Enrollment.new
    enrollment.first_name = 'FirstName'
    enrollment.email = 'teacher@example.net'
    assert enrollment.valid?
  end

  test 'emails are stored in lowercase and stripped' do
    enrollment = build(:pd_enrollment, email: ' MixedCase@Example.net ')
    assert_equal 'mixedcase@example.net', enrollment.email

    # Also accepts nil
    enrollment.email = nil
    assert_nil enrollment.email
  end

  test 'soft delete' do
    enrollment = create(:pd_enrollment)
    enrollment.destroy!

    assert enrollment.reload.deleted?
    refute Pd::Enrollment.exists? enrollment.id
    assert Pd::Enrollment.with_deleted.exists? enrollment.id
  end

  test 'pre_workshop_survey_url' do
    csp_summer_workshop = build(:csp_summer_workshop)
    csp_summer_workshop_enrollment = build(:pd_enrollment, workshop: csp_summer_workshop)

    byo_workshop = build(:byo_workshop)
    byo_workshop_enrollment = build(:pd_enrollment, workshop: byo_workshop)

    assert_equal "/pd/workshop_pre_survey?enrollmentCode=#{csp_summer_workshop_enrollment.code}",
      URI(csp_summer_workshop_enrollment.pre_workshop_survey_url).path + '?' + URI(csp_summer_workshop_enrollment.pre_workshop_survey_url).query
    assert_equal "/pd/workshop_pre_survey?enrollmentCode=#{byo_workshop_enrollment.code}",
      URI(byo_workshop_enrollment.pre_workshop_survey_url).path + '?' + URI(byo_workshop_enrollment.pre_workshop_survey_url).query
  end

  test 'exit_survey_url' do
    csp_workshop = create(:workshop, :ended, course: Pd::Workshop::COURSE_CSP)
    csp_enrollment = create(:pd_enrollment, workshop: csp_workshop)

    local_summer_workshop = create(:csp_summer_workshop, :ended)
    local_summer_enrollment = create(:pd_enrollment, workshop: local_summer_workshop)

    byo_workshop = create(:byo_workshop, :ended)
    byo_enrollment = create(:pd_enrollment, workshop: byo_workshop)

    studio_url = ->(path) {CDO.studio_url(path, CDO.default_scheme)}
    assert_equal studio_url["/pd/workshop_survey/post/#{local_summer_enrollment.code}"], local_summer_enrollment.exit_survey_url
    assert_equal studio_url["/pd/workshop_survey/post/#{csp_enrollment.code}"], csp_enrollment.exit_survey_url
    assert_equal studio_url["/pd/workshop_survey/post/#{byo_enrollment.code}"], byo_enrollment.exit_survey_url
  end

  test 'name is deprecated and calls through to full_name' do
    enrollment = create(:pd_enrollment)
    enrollment.expects(:full_name)
    assert_deprecated 'name is deprecated. Use first_name & last_name instead.' do
      enrollment.name
    end

    enrollment.expects('full_name=' => 'First Last')
    assert_deprecated 'name is deprecated. Use first_name & last_name instead.' do
      enrollment.name = 'First Last'
    end
  end

  test 'enrollments with no last name are still valid' do
    enrollment = create(:pd_enrollment)
    enrollment.update!(last_name: '')
    assert enrollment.valid?
  end

  test 'email must be unique on enrollments within a workshop' do
    enrollment = create(:pd_enrollment)
    duplicate_enrollment = build(:pd_enrollment,
      email: enrollment.email,
      workshop: enrollment.workshop
)

    duplicate_enrollment.save
    assert duplicate_enrollment.errors.added?(:email, 'already enrolled in workshop')

    duplicate_enrollment.email = 'another_email@email.com'
    assert duplicate_enrollment.valid?
  end

  test 'setting full_name' do
    enrollment = create(:pd_enrollment)
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

  test 'getting full_name uses user given_name and family_name if available' do
    user = create(:user, given_name: "", family_name: "")
    enrollment = create(:pd_enrollment, user: user, first_name: "EnrollFirstName", last_name: "EnrollLastName")

    # Uses enrollment name if both user.given_name and user.family_name are not available
    assert_equal enrollment.full_name, 'EnrollFirstName EnrollLastName'

    # Uses enrollment name if one of user.given_name or user.family_name is not available
    user.update!(given_name: "UserFirstName")
    assert_equal enrollment.full_name, 'EnrollFirstName EnrollLastName'
    user.update!(given_name: "", family_name: "UserLastName")
    assert_equal enrollment.full_name, 'EnrollFirstName EnrollLastName'

    # Uses user given_name and family_name if both are available
    user.update!(given_name: "UserFirstName", family_name: "UserLastName")
    assert_equal enrollment.full_name, 'UserFirstName UserLastName'
  end

  test 'email format validation' do
    e = assert_raises ActiveRecord::RecordInvalid do
      create(:pd_enrollment, email: 'invalid@ example.net')
    end
    assert_equal 'Validation failed: Email does not appear to be a valid e-mail address', e.message

    assert create :pd_enrollment, email: 'valid@example.net'
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
    workshop_1 = build(:csf_intro_workshop)
    workshop_1.save(validate: false)
    workshop_2 = build(:csf_intro_workshop)
    workshop_2.save(validate: false)

    enrollment_no_survey = create(:pd_enrollment, workshop: workshop_1)
    enrollment_with_processed_survey = create(:pd_enrollment, :from_user, workshop: workshop_2)
    enrollments = [enrollment_no_survey, enrollment_with_processed_survey]

    existing_survey = create(:csf_intro_post_foorm_submission,
      :answers_high,
      form_name: "surveys/pd/workshop_csf_intro_post"
)

    create(:csf_intro_post_workshop_submission,
      foorm_submission: existing_survey,
      user: enrollment_with_processed_survey.user,
      pd_workshop_id: enrollment_with_processed_survey.workshop.id
)

    with_surveys = [enrollment_with_processed_survey]
    without_surveys = [enrollment_no_survey]

    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments)
    assert_equal with_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, true)
    assert_equal without_surveys, Pd::Enrollment.filter_for_survey_completion(enrollments, false)
  end

  test 'local summer survey filter' do
    workshop = create(:summer_workshop)
    teacher = create(:teacher)
    enrollment = create(:pd_enrollment, :from_user, user: teacher, workshop: workshop)

    assert_equal [enrollment], Pd::Enrollment.filter_for_survey_completion([enrollment], false)

    # complete survey
    existing_survey = create(:daily_workshop_day_5_foorm_submission,
      :answers_high,
      form_name: "surveys/pd/summer_workshop_post_survey"
)

    create(:day_5_workshop_foorm_submission,
      foorm_submission: existing_survey,
      user: enrollment.user,
      pd_workshop_id: enrollment.workshop.id
)
    assert_equal [], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'csd academic year survey not filtered out' do
    workshop = create(:csd_academic_year_workshop)
    teacher = create(:teacher)
    enrollment = create(:pd_enrollment, :from_user, user: teacher, workshop: workshop)

    assert_equal [enrollment], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'csp academic year survey not filtered out' do
    workshop = create(:csp_academic_year_workshop)
    teacher = create(:teacher)
    enrollment = create(:pd_enrollment, :from_user, user: teacher, workshop: workshop)

    assert_equal [enrollment], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'csa academic year survey not filtered out' do
    workshop = create(:csa_academic_year_workshop)
    teacher = create(:teacher)
    enrollment = create(:pd_enrollment, :from_user, user: teacher, workshop: workshop)

    assert_equal [enrollment], Pd::Enrollment.filter_for_survey_completion([enrollment], false)
  end

  test 'attendance scopes' do
    workshop = create(:workshop, num_sessions: 2)
    teacher = create(:teacher)
    enrollment_not_attended = create(:pd_enrollment)
    enrollment_attended = create(:pd_enrollment, workshop: workshop)
    workshop.sessions.each do |session|
      create(:pd_attendance, session: session, teacher: teacher, enrollment: enrollment_attended)
    end

    assert_equal [enrollment_attended], Pd::Enrollment.attended
    assert_equal [enrollment_not_attended], Pd::Enrollment.not_attended
    assert_empty Pd::Enrollment.attended.not_attended
  end

  test 'ended workshop scope' do
    # not ended
    create(:pd_enrollment)
    enrollment_ended = create(:pd_enrollment, workshop: create(:workshop, :ended))

    assert_equal [enrollment_ended], Pd::Enrollment.for_ended_workshops
  end

  test 'with_surveys scope' do
    # Ended workshop with attendance
    # (ONLY this one should show up in the scope at the end of the test)
    ended_workshop = create(:workshop, :ended)
    expected_enrollment = create(:pd_enrollment, workshop: ended_workshop)
    create(:pd_attendance, session: ended_workshop.sessions.first, enrollment: expected_enrollment)

    # Ended FiT workshop, with attendance
    # (Checks a special case: FiT workshops don't have exit surveys)
    fit_workshop = build(:fit_workshop, :ended)
    # workshop subject is deprecated so validation must be skipped
    fit_workshop.save(validate: false)
    fit_enrollment = create(:pd_enrollment, workshop: fit_workshop)
    create(:pd_attendance, session: fit_workshop.sessions.first, enrollment: fit_enrollment)

    # Ended Facilitator workshop, with attendance
    # (Checks a special case: Facilitator workshops don't have exit surveys)
    facilitator_workshop = create(:facilitator_workshop, :ended)
    facilitator_enrollment = create(:pd_enrollment, workshop: facilitator_workshop)
    create(:pd_attendance, session: facilitator_workshop.sessions.first, enrollment: facilitator_enrollment)

    # Non-ended workshop, no attendance
    # (No surveys because not ended)
    non_ended_workshop = create(:workshop)
    create(:pd_enrollment, workshop: non_ended_workshop)

    # Non-ended workshop, with attendance
    # (No surveys because not ended)
    create(:pd_enrollment, workshop: non_ended_workshop)
    create(:pd_attendance, session: non_ended_workshop.sessions.first)

    # Ended workshop, no attendance
    # (No surveys because no attendance)
    create(:pd_enrollment, workshop: ended_workshop)

    assert_equal [expected_enrollment], Pd::Enrollment.with_surveys
  end

  test 'with_surveys scope includes workshops with no subject' do
    # Cover a regression introduced in https://github.com/code-dot-org/code-dot-org/pull/29511
    # where pending exit surveys for a workshop with no subject would not show up on the
    # professional learning landing page.
    # Root cause: WHERE subject != 'xyz' implicitly excludes rows where subject IS NULL too.

    # Ended byo workshop with attendance; byo workshops have no subject.
    byo_workshop = create(:byo_workshop, :ended)
    expected_enrollment = create(:pd_enrollment, workshop: byo_workshop)
    create(:pd_attendance, session: byo_workshop.sessions.first, enrollment: expected_enrollment)

    assert_equal [expected_enrollment], Pd::Enrollment.with_surveys
  end

  test 'name fields are auto-stripped' do
    enrollment = build(:pd_enrollment, first_name: ' First  ', last_name: '  Last ')
    enrollment.validate
    assert_equal 'First', enrollment.first_name
    assert_equal 'Last', enrollment.last_name
  end

  test 'school is deprecated' do
    enrollment = build(:pd_enrollment, school: 'a school')
    returned_school = assert_deprecated 'School is deprecated. Use school_info or school_name instead.' do
      enrollment.school
    end
    assert_equal 'a school', returned_school
  end

  test 'school_name calls school_info.effective_school_name' do
    enrollment = build(:pd_enrollment)
    enrollment.school_info.expects(:effective_school_name).returns('effective school name')
    assert_equal 'effective school name', enrollment.school_name
  end

  test 'school_name falls back to school if no school info' do
    enrollment = build(:pd_enrollment, school_info: nil, school: 'old format school')
    assert_equal 'old format school', enrollment.school_name
  end

  test 'school_district calls school_info.effective_school_district_name' do
    enrollment = build(:pd_enrollment)
    enrollment.school_info.expects(:effective_school_district_name).returns('effective school district name')
    assert_equal 'effective school district name', enrollment.school_district_name
  end

  test 'enrollment is deleted after clear_data for deleted owner' do
    enrollment = create(:pd_enrollment, :from_user)
    enrollment.user.destroy!

    enrollment.clear_data
    enrollment.reload

    assert enrollment.deleted?
  end

  test 'enrollment is valid after clear_data for deleted owner' do
    enrollment = create(:pd_enrollment, :from_user)
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
    teacher = create(:teacher)
    assert_empty teacher.permissions

    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    create(:pd_enrollment, workshop: workshop, user: teacher)

    assert teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'Enrolling user in BYOW course makes them an authorized teacher' do
    teacher = create(:teacher)
    assert_empty teacher.permissions

    workshop = create(:byo_workshop)
    create(:pd_enrollment, workshop: workshop, user: teacher)

    assert teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'Enrolling student user in CSD course does not make them authorized teacher' do
    student = create(:student)
    assert_empty student.permissions

    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    create(:pd_enrollment, workshop: workshop, user: student)

    refute student.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'Updating existing enrollment sets permission' do
    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    enrollment = create(:pd_enrollment, workshop: workshop, user: nil)

    teacher = create(:teacher)

    refute teacher.permission? UserPermission::AUTHORIZED_TEACHER

    enrollment.update(user: teacher)

    assert teacher.permission? UserPermission::AUTHORIZED_TEACHER
  end

  test 'update scholarship status for local summer workshop' do
    workshop = create(:summer_workshop)
    enrollment = create(:pd_enrollment, :from_user, workshop: workshop)
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

  test 'the application id exists when the course from their application matches the workshop course' do
    teacher = create(:teacher)
    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    application = create(:pd_teacher_application, course: 'csd', application_year: workshop.school_year, user: teacher)
    enrollment = create(:pd_enrollment, user: teacher, workshop: workshop)

    assert_equal application.id, enrollment.application_id
  end

  test 'the application id exists when their application has a matching workshop id' do
    teacher = create(:teacher)
    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSD)
    application = create(:pd_teacher_application, course: 'csp', pd_workshop_id: workshop.id,
                         application_year: workshop.school_year, user: teacher
)
    enrollment = create(:pd_enrollment, user: teacher, workshop: workshop)

    assert_equal application.id, enrollment.application_id
  end

  test 'no application id exists when there is no course match nor an id match' do
    teacher = create(:teacher)
    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSP)
    create(:pd_teacher_application, course: 'csd', pd_workshop_id: workshop.id + 1, user: teacher)
    enrollment = create(:pd_enrollment, user: teacher, workshop: workshop)

    assert_nil enrollment.application_id
  end

  test 'no application id exists when there is no application for that user' do
    teacher = create(:teacher)
    workshop = create(:workshop, course: Pd::SharedWorkshopConstants::COURSE_CSP)
    enrollment = create(:pd_enrollment, user: teacher, workshop: workshop)

    assert_nil enrollment.application_id
  end
end
