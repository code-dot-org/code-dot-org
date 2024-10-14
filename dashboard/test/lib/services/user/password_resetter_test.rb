require 'test_helper'
class Services::User::PasswordResetterTest < ActiveSupport::TestCase
  test 'do not send password reset to accounts without email authentication' do
    # Clear out any deliveries
    ActionMailer::Base.deliveries.clear

    # User with LTI only does not get email
    lti_user = create(:teacher, :with_lti_auth)
    assert Services::User::PasswordResetter.call(email: lti_user.email)
    assert ActionMailer::Base.deliveries.empty?

    # User with LTI and email auth gets email
    lti_user.authentication_options.append(create(:authentication_option))
    assert Services::User::PasswordResetter.call(email: lti_user.email)
    mail = ActionMailer::Base.deliveries.first
    assert_equal [lti_user.email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject

    # User with Google and email auth gets email
    google_user = create(:teacher, :with_google_authentication_option)
    assert Services::User::PasswordResetter.call(email: google_user.email)
    mail = ActionMailer::Base.deliveries.first
    assert_equal [lti_user.email], mail.to
    assert_equal 'Code.org reset password instructions', mail.subject

    # Clear out any deliveries
    ActionMailer::Base.deliveries.clear

    # User with Google only does not get email
    google_user.authentication_options.find_by(credential_type: "email").destroy
    assert Services::User::PasswordResetter.call(email: google_user.email)
    assert ActionMailer::Base.deliveries.empty?
  end
end
