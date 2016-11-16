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
end
