require 'test_helper'

class WorkshopMailerTest < ActionMailer::TestCase
  test 'enrollment notification is created' do
    enrollment = create(:pd_enrollment)

    assert_creates Pd::EnrollmentNotification do
      Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now
    end

    notification = Pd::EnrollmentNotification.last
    assert_equal enrollment.id, notification.pd_enrollment_id
    assert_equal 'teacher_enrollment_receipt', notification.name
  end

  test 'previewing mail with a transient enrollment succeeds and does not create an enrollment notification' do
    transient_enrollment = build(:pd_enrollment)

    assert_does_not_create Pd::EnrollmentNotification do
      Pd::WorkshopMailer.teacher_enrollment_receipt(transient_enrollment).deliver_now
    end
  end

  test 'reminder emails are sent for workshops without suppress_reminders?' do
    facilitator = create(:facilitator)
    workshop = create(:workshop, facilitators: [facilitator])
    create(:pd_enrollment, workshop: workshop)
    Pd::Workshop.any_instance.expects(:suppress_reminders?).returns(false).times(2)

    assert_emails 2 do
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'reminder emails are skipped for workshops with suppress_reminders?' do
    facilitator = create(:facilitator)
    workshop = create(:workshop, facilitators: [facilitator])
    create(:pd_enrollment, workshop: workshop)
    Pd::Workshop.any_instance.expects(:suppress_reminders?).returns(true).times(2)

    assert_emails 0 do
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'reminders are not sent for workshops with suppress_email attribute' do
    workshop = create(:csp_summer_workshop, suppress_email: true)
    facilitator = workshop.facilitators.first
    create(:pd_enrollment, workshop: workshop)

    assert_no_emails do
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'specific emails that should be sent for workshops with suppress_email attribute' do
    workshop = create(:csp_summer_workshop, suppress_email: true)
    enrollment = create(:pd_enrollment, workshop: workshop)

    assert_emails 4 do
      Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now

      # Still send cancellation receipt and exit survey to teachers
      Pd::WorkshopMailer.teacher_cancel_receipt(enrollment).deliver_now

      # Organizers want to stay informed of who has enrolled, even if
      # email is suppressed
      Pd::WorkshopMailer.organizer_cancel_receipt(enrollment).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_receipt(enrollment).deliver_now
    end
  end

  test 'facilitator and organizer email links are complete urls' do
    csf_workshop = build(:csf_intro_workshop)
    csf_workshop.facilitators << create(:facilitator)
    csf_workshop.save(validate: false)
    csf_enrollment = create(:pd_enrollment, workshop: csf_workshop)
    mails = []

    mails << Pd::WorkshopMailer.organizer_cancel_receipt(csf_enrollment)
    mails << Pd::WorkshopMailer.organizer_should_close_reminder(csf_workshop)
    mails << Pd::WorkshopMailer.facilitator_detail_change_notification(csf_workshop.facilitators.first, csf_workshop)
    mails << Pd::WorkshopMailer.organizer_detail_change_notification(csf_workshop)

    mails.each {|mail| assert links_are_complete_urls?(mail, allowed_urls: ['#'])}
  end

  test 'teacher cancel receipt links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1},
    ]

    test_cases.each do |test_case|
      workshop = create(:workshop, course: test_case[:course], subject: test_case[:subject])
      enrollment = create(:pd_enrollment, workshop: workshop)
      mail = Pd::WorkshopMailer.teacher_cancel_receipt(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'teacher enrollment receipt links are complete urls' do
    test_cases = [
      {course: Pd::Workshop::COURSE_ADMIN_COUNSELOR, subject: Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_SLP_INTRO},
      {course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_CSA_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_CSA_SUMMER_WORKSHOP},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1},
      {course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP},
    ]

    test_cases.each do |test_case|
      workshop = if Pd::Workshop::ACADEMIC_YEAR_WORKSHOP_SUBJECTS.include?(test_case[:subject])
                   create :academic_year_workshop, course: test_case[:course], subject: test_case[:subject]
                 else
                   suppress_email = Pd::Workshop::MUST_SUPPRESS_EMAIL_SUBJECTS.include?(test_case[:subject])
                   create(:workshop, course: test_case[:course], subject: test_case[:subject], suppress_email: suppress_email)
                 end

      enrollment = create(:pd_enrollment, workshop: workshop)
      mail = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

      assert links_are_complete_urls?(mail)
    end
  end

  test 'default bcc' do
    enrollment = create(:pd_enrollment)

    mail = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert_equal MailerConstants::PLC_EMAIL_LOG, mail.bcc.first
  end
end
