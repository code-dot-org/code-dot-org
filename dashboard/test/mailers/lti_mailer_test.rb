require 'test_helper'

class LtiMailerTest < ActionMailer::TestCase
  test 'lti integration confirmation' do
    admin_email = 'admin@test.com'
    mail = LtiMailer.lti_integration_confirmation(admin_email)

    assert_equal I18n.t('lti.integration.mailer_confirmation_subject'), mail.subject
    assert_equal [admin_email], mail.to
    assert_equal ['noreply@code.org'], mail.from
  end
end
