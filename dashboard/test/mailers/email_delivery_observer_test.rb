require 'test_helper'
require 'testing/includes_metrics'

class EmailDeliveryObserverTest < ActiveSupport::TestCase
  setup do
    ActionMailer::Base.register_observer EmailDeliveryObserver
  end

  test 'push a metric when an email is sent' do
    expected_metric = [
      {
        metric_name: :EmailSent,
        dimensions: [
          {name: "Environment", value: CDO.rack_env}
        ],
        value: 1
      }
    ]
    Cdo::Metrics.expects(:push).with('ActionMailer', expected_metric)

    teacher = build :teacher, email: 'teacher@gmail.com'
    TeacherMailer.new_teacher_email(teacher).deliver_now
  end
end
