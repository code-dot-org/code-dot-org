require 'test_helper'

class WorkshopMailerTest < ActionMailer::TestCase
  test 'enrollment notification is created' do
    enrollment = create :pd_enrollment

    assert_creates Pd::EnrollmentNotification do
      Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now
    end

    notification = Pd::EnrollmentNotification.last
    assert_equal enrollment.id, notification.pd_enrollment_id
    assert_equal 'teacher_enrollment_receipt', notification.name
  end

  test 'previewing mail with a transient enrollment succeeds and does not create an enrollment notification' do
    transient_enrollment = build :pd_enrollment

    assert_does_not_create Pd::EnrollmentNotification do
      Pd::WorkshopMailer.teacher_enrollment_receipt(transient_enrollment).deliver_now
    end
  end

  test 'reminder emails are sent for workshops without suppress_reminders?' do
    facilitator = create :facilitator
    workshop = create :workshop, facilitators: [facilitator]
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Workshop.any_instance.expects(:suppress_reminders?).returns(false).times(3)

    assert_emails 3 do
      Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment).deliver_now
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'reminder emails are skipped for workshops with suppress_reminders?' do
    facilitator = create :facilitator
    workshop = create :workshop, facilitators: [facilitator]
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Workshop.any_instance.expects(:suppress_reminders?).returns(true).times(3)

    assert_emails 0 do
      Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment).deliver_now
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'exit survey emails are sent for workshops with exit surveys' do
    workshop = create :workshop, :ended
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Enrollment.any_instance.expects(:exit_survey_url).returns('a url')

    assert_emails 1 do
      Pd::WorkshopMailer.exit_survey(enrollment).deliver_now
    end
  end

  test 'exit survey emails are skipped for workshops without exit surveys' do
    workshop = create :workshop, :ended
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Enrollment.any_instance.expects(:exit_survey_url).returns(nil)

    assert_emails 0 do
      Pd::WorkshopMailer.exit_survey(enrollment).deliver_now
    end
  end

  test 'emails are not sent for virtual workshops' do
    workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_VIRTUAL_1, num_sessions: 1
    enrollment = create :pd_enrollment, workshop: workshop

    assert_no_emails do
      Pd::WorkshopMailer.organizer_cancel_receipt(enrollment).deliver_now
    end
  end

  test 'detail change notification links are complete urls' do
    courses = [
      Pd::Workshop::COURSE_ADMIN,
      Pd::Workshop::COURSE_CSF
    ]

    courses.each do |course|
      workshop = create :workshop, course: course
      enrollment = create :pd_enrollment, workshop: workshop
      mail = Pd::WorkshopMailer.detail_change_notification(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'exit survey email links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2},
    ]

    test_cases.each do |test_case|
      workshop = create :workshop, :ended, course: test_case[:course], subject: test_case[:subject]
      enrollment = create :pd_enrollment, workshop: workshop
      mail = Pd::WorkshopMailer.exit_survey(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'facilitator and organizer email links are complete urls' do
    csf_workshop = create :csf_intro_workshop
    csf_enrollment = create :pd_enrollment, workshop: csf_workshop
    ecs_workshop = create :workshop, :ended, num_facilitators: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    ecs_enrollment = create :pd_enrollment, workshop: ecs_workshop
    mails = []

    mails << Pd::WorkshopMailer.facilitator_enrollment_reminder(ecs_workshop.facilitators.first, ecs_workshop)
    mails << Pd::WorkshopMailer.organizer_enrollment_reminder(ecs_workshop)
    mails << Pd::WorkshopMailer.organizer_cancel_receipt(ecs_enrollment)
    mails << Pd::WorkshopMailer.organizer_cancel_receipt(csf_enrollment)
    mails << Pd::WorkshopMailer.organizer_enrollment_receipt(ecs_enrollment)
    mails << Pd::WorkshopMailer.organizer_should_close_reminder(ecs_workshop)
    mails << Pd::WorkshopMailer.organizer_should_close_reminder(csf_workshop)
    mails << Pd::WorkshopMailer.facilitator_detail_change_notification(csf_workshop.facilitators.first, csf_workshop)
    mails << Pd::WorkshopMailer.organizer_detail_change_notification(csf_workshop)

    mails.each {|mail| assert links_are_complete_urls?(mail, allowed_urls: ['#'])}
  end

  test 'teacher cancel receipt links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_CSF, subject: Pd::Workshop::SUBJECT_CSF_101},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2}
    ]

    test_cases.each do |test_case|
      workshop = create :workshop, course: test_case[:course], subject: test_case[:subject]
      enrollment = create :pd_enrollment, workshop: workshop
      mail = Pd::WorkshopMailer.teacher_cancel_receipt(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'teacher enrollment receipt links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_ADMIN, subject: nil},
      {course: Pd::Workshop::COURSE_COUNSELOR, subject: nil},
      {course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_3},
      {course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1},
      {course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2},
      {course: Pd::Workshop::COURSE_CSF, subject: Pd::Workshop::SUBJECT_CSF_101},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_4},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_3},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_4},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_5},
      {course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_6},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1},
    ]

    test_cases.each do |test_case|
      workshop = create :workshop, course: test_case[:course], subject: test_case[:subject]
      enrollment = create :pd_enrollment, workshop: workshop
      mail = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'teacher enrollment reminder links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_ADMIN, subject: nil},
      {course: Pd::Workshop::COURSE_COUNSELOR, subject: nil},
      {course: Pd::Workshop::COURSE_CSF, subject: Pd::Workshop::SUBJECT_CSF_101},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1, days_before: 3},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1, days_before: 10},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1, days_before: 3},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1, days_before: 10},
    ]

    test_cases.each do |test_case|
      workshop = create :workshop, course: test_case[:course], subject: test_case[:subject]
      enrollment = create :pd_enrollment, workshop: workshop
      mail = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: test_case[:days_before])

      assert links_are_complete_urls?(mail)
    end
  end

  test 'default bcc' do
    enrollment = create :pd_enrollment

    mail = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert_equal MailerConstants::PLC_EMAIL_LOG, mail.bcc.first
  end
end
