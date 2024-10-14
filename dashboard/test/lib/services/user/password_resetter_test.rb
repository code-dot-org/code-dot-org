require 'test_helper'

describe Services::User::PasswordResetter do
  before do
    # Clear out any deliveries before each test
    ActionMailer::Base.deliveries.clear
  end
  before(:all) do
    @lti_user = FactoryBot.create(:teacher, :with_lti_auth)
    @google_user = FactoryBot.create(:teacher, :with_google_authentication_option)
  end

  it 'does not send password reset to lti accounts without email authentication' do
    assert Services::User::PasswordResetter.call(email: @lti_user.email)
    assert_empty ActionMailer::Base.deliveries
  end

  it 'does send password reset to lti accounts with email authentication' do
    @lti_user.authentication_options.append(FactoryBot.create(:authentication_option, email: @lti_user.email))
    assert Services::User::PasswordResetter.call(email: @lti_user.email)
    mail = ActionMailer::Base.deliveries.first
    _(mail.to).must_equal [@lti_user.email]
    _(mail.subject).must_equal 'Code.org reset password instructions'
  end

  it 'does not send password reset to oauth accounts without email authentication' do
    @google_user.authentication_options.find_by(credential_type: "email").destroy
    assert Services::User::PasswordResetter.call(email: @google_user.email)
    assert_empty ActionMailer::Base.deliveries
  end

  it 'does send password reset to oauth accounts with email authentication' do
    assert Services::User::PasswordResetter.call(email: @google_user.email)
    mail = ActionMailer::Base.deliveries.first
    _(mail.to).must_equal [@google_user.email]
    _(mail.subject).must_equal 'Code.org reset password instructions'
  end
end
