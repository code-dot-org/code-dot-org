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
          {name: "Environment", value: CDO.rack_env},
          {name: "Action", value: 'new_teacher_email'},
          {name: "Class", value: 'TeacherMailer'},
        ],
        value: 1
      }
    ]
    Cdo::Metrics.expects(:push).with('ActionMailer', expected_metric)

    teacher = build :teacher, email: 'teacher@gmail.com'
    TeacherMailer.new_teacher_email(teacher).deliver_now
  end
end
