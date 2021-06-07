require 'test_helper'

class EmailDeliveryInterceptorTest < ActiveSupport::TestCase
  setup do
    ActionMailer::Base.register_interceptor EmailDeliveryInterceptor
  end

  test 'push a metric when an email is going to be sent' do
    expected_metric = [
      {
        metric_name: :EmailToSend,
        dimensions: [
          {name: "Environment", value: CDO.rack_env}
        ],
        value: 1
      }
    ]
    Cdo::Metrics.expects(:push).with('ActionMailer', expected_metric)

    # Ignores other ActionMailer metrics.
    #
    # We use EmailDeliveryInterceptor and EmailDeliveryObserver to intercept the email delivery
    # process. When an email is delivered, both the interceptor and observer are triggered,
    # pushing their metrics to CloudWatch.
    # To isolate this test to just the interceptor, we have to ignore any metrics pushed by
    # the observer.
    # @see Observing and Intercepting Mails https://apidock.com/rails/ActionMailer/Base
    Cdo::Metrics.stubs(:push).with('ActionMailer', Not(equals(expected_metric)))

    teacher = build :teacher, email: 'teacher@gmail.com'
    TeacherMailer.new_teacher_email(teacher).deliver_now
  end
end
