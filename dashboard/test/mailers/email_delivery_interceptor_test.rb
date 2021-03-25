require 'test_helper'
require 'testing/includes_metrics'

class EmailDeliveryInterceptorTest < ActiveSupport::TestCase
  test 'push a metric when an email is going to be sent' do
    ActionMailer::Base.register_interceptor EmailDeliveryInterceptor

    Cdo::Metrics.expects(:push).once.with(
      'ActionMailer', includes_metrics(EmailToSend: 1)
    )

    # TODO: remove this unrelated expectation
    Cdo::Metrics.expects(:push).with(
      'ActionMailer', includes_metrics(EmailSent: 1)
    )

    teacher = build :teacher, email: 'teacher@gmail.com'
    TeacherMailer.new_teacher_email(teacher).deliver_now
  end
end
