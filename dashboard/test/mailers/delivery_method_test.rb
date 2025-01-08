require 'test_helper'

class FakeMailer < ApplicationMailer
  def basic_test
    mail(
      to: 'test@example.com',
      from: 'noreply@code.org', # required by DeliveryMethod
      body: 'just a test',
      content_type: 'text/html', # required by DeliveryMethod
      subject: 'test',
    )
  end
end

class DeliveryMethodTest < ActionMailer::TestCase
  # The test environment normally uses a test-specific delivery method which
  # doesn't actually send emails. We would like to verify that our actual
  # delivery method can be correctly initialized, but we still don't want it to
  # actually send emails; so, we stub in the real delivery method and stub out
  # the 'send_message' functionality which it internally uses.
  test 'can use custom delivery method' do
    Poste2.stubs(:send_message)
    ActionMailer::Base.stubs(:delivery_method).returns(Poste2::DeliveryMethod)

    FakeMailer.basic_test.deliver_now

    ActionMailer::Base.unstub(:delivery_method)
    Poste2.unstub(:send_message)
  end
end
