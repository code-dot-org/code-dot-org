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
    workshop = create :pd_workshop, facilitators: [facilitator]
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
    workshop = create :pd_workshop, facilitators: [facilitator]
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Workshop.any_instance.expects(:suppress_reminders?).returns(true).times(3)

    assert_emails 0 do
      Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment).deliver_now
      Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
    end
  end

  test 'exit survey emails are sent for workshops with exit surveys' do
    workshop = create :pd_ended_workshop
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Enrollment.any_instance.expects(:exit_survey_url).returns('a url')

    assert_emails 1 do
      Pd::WorkshopMailer.exit_survey(enrollment).deliver_now
    end
  end

  test 'exit survey emails are skipped for workshops without exit surveys' do
    workshop = create :pd_ended_workshop
    enrollment = create :pd_enrollment, workshop: workshop
    Pd::Enrollment.any_instance.expects(:exit_survey_url).returns(nil)

    assert_emails 0 do
      Pd::WorkshopMailer.exit_survey(enrollment).deliver_now
    end
  end

  test 'organizer should close workshop reminder email link is not relative path' do
    workshop = create :pd_workshop, num_sessions: 1
    email = Pd::WorkshopMailer.organizer_should_close_reminder(workshop)

    assert links_are_complete_urls?(email)
  end

  test 'organizer cancel receipt email link is not relative path' do
    workshop = create :pd_workshop, num_sessions: 1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.organizer_cancel_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'detail change notification admin email links are not relative paths' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ADMIN
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.detail_change_notification(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'detail change notification csf email links are not relative paths' do
    workshop = create :pd_workshop, num_sessions: 1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.detail_change_notification(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'exit survey csd 1 email links are complete urls' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_UNITS_2_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.exit_survey(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'exit survey csd teacher con email links are complete urls' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.exit_survey(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'exit survey csp 1 email links are complete urls' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.exit_survey(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'exit survey csp summer workshop email links are complete urls' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.exit_survey(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'exit survey general email links are complete urls' do
    workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.exit_survey(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'facilitator detail change notification csf email links are complete urls' do
    facilitator = create :facilitator
    workshop = create :pd_workshop, facilitators: [facilitator], course: Pd::Workshop::COURSE_CSF, subject: nil
    email = Pd::WorkshopMailer.facilitator_detail_change_notification(facilitator, workshop)

    assert links_are_complete_urls?(email, allowed_urls: ['#'])
  end

  test 'facilitator enrollment reminder email links are complete urls' do
    facilitator = create :facilitator
    workshop = create :pd_ended_workshop, facilitators: [facilitator], course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    email = Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop)

    assert links_are_complete_urls?(email, allowed_urls: ['#'])
  end

  test 'organizer cancel receipt email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.organizer_cancel_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'organizer detail change notification csf email links are complete urls' do
    workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSF, subject: nil
    email = Pd::WorkshopMailer.organizer_detail_change_notification(workshop)

    assert links_are_complete_urls?(email, allowed_urls: ['#'])
  end

  test 'organizer enrollment receipt email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.organizer_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'organizer enrollment reminder email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    email = Pd::WorkshopMailer.organizer_enrollment_reminder(workshop)

    assert links_are_complete_urls?(email, allowed_urls: ['#'])
  end

  test 'organizer should close reminder email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    email = Pd::WorkshopMailer.organizer_should_close_reminder(workshop)

    assert links_are_complete_urls?(email)
  end

  test 'teacher cancel receipt csf email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSF, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_cancel_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher cancel receipt general email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_cancel_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt admin email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ADMIN, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt counselor email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_COUNSELOR, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt cs in a phase 3 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt cs in s phase 3 semester 1 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt cs in s phase 3 semester 2 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt csf email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSF, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt csp 1 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt csp summer workshop email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt ecs phase 4 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_4
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt ecs unit 3 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt ecs unit 4 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_4
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt ecs unit 5 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_5
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt ecs unit 6 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_UNIT_6
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment receipt csd 1 email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_UNITS_2_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder admin email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ADMIN, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder counselor email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_COUNSELOR, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csf email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSF, subject: nil
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csp 1 10 day email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: 10)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csp 1 3 day email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: 3)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csp summer workshop' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csd 1 10 day email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_UNITS_2_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: 10)

    assert links_are_complete_urls?(email)
  end

  test 'teacher enrollment reminder csd 1 3 day email links are complete urls' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_UNITS_2_3
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: 3)

    assert links_are_complete_urls?(email)
  end
end
