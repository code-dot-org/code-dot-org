require 'test_helper'

class LtiMailerTest < ActionMailer::TestCase
  class IntegrationConfirmationTest < ActionMailer::TestCase
    setup do
      @admin_email = 'admin@test.com'
      @mail = LtiMailer.lti_integration_confirmation(@admin_email)
    end

    test 'lti_integration_confirmation - should have correct subject' do
      assert_equal 'Code.org has completed your LMS registration request', @mail.subject
    end

    test 'lti_integration_confirmation - should have correct recipient' do
      assert_equal [@admin_email], @mail.to
    end

    test 'lti_integration_confirmation - should have correct sender' do
      assert_equal '"Code.org" <noreply@code.org>', @mail[:from].decoded
      assert_equal ['noreply@code.org'], @mail.from
    end

    test 'lti_integration_confirmation - should contain "LMS integration guides" link' do
      expected_link = <<~HTML.strip
        <a href="https://support.code.org/hc/en-us/articles/23120014459405-Learning-Management-System-LMS-and-Single-Sign-On-SSO-Integrations-and-Support-for-Code-org">LMS integration guides</a>
      HTML

      assert_includes @mail.body, expected_link
    end

    test 'lti_integration_confirmation - should contain "course offerings" link' do
      expected_link = <<~HTML.strip
        <a href="//test-studio.code.org/catalog">course offerings</a>
      HTML

      assert_includes @mail.body, expected_link
    end
  end
end
