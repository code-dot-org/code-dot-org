require 'test_helper'
require 'policies/lti'

class LtiV1IntegrationEarlyAccessTemplateTest < ActionView::TestCase
  setup do
    @form_data = {lms_platforms: [name: 'expected_lms_platform_name', platform: 'expected_lms_platform']}
  end

  test 'renders the integration form' do
    Policies::Lti.expects(:early_access_closed?).returns(false)

    render template: 'lti/v1/integrations/early_access'

    refute_includes rendered, 'Sorry, all Early Access slots for Code.org Learning Management System Integrations have been claimed.'
    refute_includes rendered, 'Please <a href="https://docs.google.com/forms/d/e/1FAIpQLScjfVR4CZs8Utf5vI4mz3e1q8vdH6RNIgTUWygZXN0oovBSQg/viewform">sign-up here</a> to join the Early Access waitlist and get updates about LMS Integration releases.'

    assert_includes rendered, 'Register your LMS for Integration Early Access'
    assert_includes rendered, 'Please use this form to register your Learning Management System (LMS) with Code.org.'
    assert_includes rendered, 'This will allow Early Access to install our LTI integration on your LMS.'
    assert_includes rendered, 'Full guides for obtaining your LMS Client ID, using LMS/LTI integrations, and our list of supported Learning Management Systems <a href="https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System">can be found here</a>.'
    assert_includes rendered, 'Your privacy is of utmost importance to us. Your personal information will not be used for any marketing purposes. Please see our <a href="https://code.org/privacy">Privacy Policy here</a> for more information.'

    assert document_root_element.at('form[action="/lti/v1/integrations"]')
  end

  test 'does not render the integration form when early access is closed' do
    Policies::Lti.expects(:early_access_closed?).returns(true)

    render template: 'lti/v1/integrations/early_access'

    assert_includes rendered, 'Register your LMS for Integration Early Access'
    assert_includes rendered, 'Sorry, all Early Access slots for Code.org Learning Management System Integrations have been claimed.'
    assert_includes rendered, 'Please <a href="https://docs.google.com/forms/d/e/1FAIpQLScjfVR4CZs8Utf5vI4mz3e1q8vdH6RNIgTUWygZXN0oovBSQg/viewform">sign-up here</a> to join the Early Access waitlist and get updates about LMS Integration releases.'

    refute_includes rendered, 'Please use this form to register your Learning Management System (LMS) with Code.org.'
    refute_includes rendered, 'This will allow Early Access to install our LTI integration on your LMS.'
    refute_includes rendered, 'Full guides for obtaining your LMS Client ID, using LMS/LTI integrations, and our list of supported Learning Management Systems <a href="https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System">can be found here</a>.'
    refute_includes rendered, 'Your privacy is of utmost importance to us. Your personal information will not be used for any marketing purposes. Please see our <a href="https://code.org/privacy">Privacy Policy here</a> for more information.'

    refute document_root_element.at('form[action="/lti/v1/integrations"]')
  end
end
