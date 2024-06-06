require 'test_helper'

class ActionMailerMetricsTest < ActionMailer::TestCase
  class TestActionMailer < ApplicationMailer
    include ActionMailerMetrics
    def testing_email
      mail to: "test@example.com", subject: "the subject", body: "Hello"
    end
  end

  test "should have metric values in message" do
    message = TestActionMailer.testing_email
    action = ActionMailerMetrics.get_message_action(message)
    mailer_class = ActionMailerMetrics.get_message_class(message)
    assert_equal "testing_email", action
    assert_equal TestActionMailer.name, mailer_class
  end
end
