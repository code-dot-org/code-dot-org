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
    html = Nokogiri::HTML(email.body.to_s)
    links = html.css('a')

    assert_equal 1, links.length
    assert links[0]['href'].include?(CDO.studio_url)
  end

  test 'organizer cancel receipt email link is not relative path' do
    workshop = create :pd_workshop, num_sessions: 1
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.organizer_cancel_receipt(enrollment)
    html = Nokogiri::HTML(email.body.to_s)
    links = html.css('a')

    assert_equal 1, links.length
    assert links[0]['href'].include?(CDO.studio_url)
  end

  test 'detail change notification admin email links are not relative paths' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_ADMIN
    enrollment = create :pd_enrollment, workshop: workshop
    email = Pd::WorkshopMailer.detail_change_notification(enrollment)

    assert links_are_complete_urls?(email)
  end
end
