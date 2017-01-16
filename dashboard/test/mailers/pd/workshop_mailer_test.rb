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
end
