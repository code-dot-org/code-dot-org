require 'test_helper'

class DeviseMailerTest < ActionMailer::TestCase
  def assert_no_http_urls(string)
    matchdata = URI.regexp('http').match(string)
    assert matchdata.nil?, "Expected no http urls, found #{matchdata.try(:[], 0)}"
  end

  test "confirmation instructions" do
    user = create :user

    mail = Devise::Mailer.confirmation_instructions(user, 'faketoken')

    assert_equal "Code.org confirmation instructions", mail.subject
    assert_equal [user.email], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match 'https://test-studio.code.org/users/confirmation?confirmation_token=faketoken', mail.body.encoded

    assert_no_http_urls mail.body.encoded
  end

  test "invitation instructions" do
    user = create :user

    mail = Devise::Mailer.invitation_instructions(user, 'faketoken')

    assert_equal "Invitation instructions", mail.subject
    assert_equal [user.email], mail.to
    assert_equal ["noreply@code.org"], mail.from
    assert_match 'https://test-studio.code.org/users/invitation/accept?invitation_token=faketoken', mail.body.encoded

    assert_no_http_urls mail.body.encoded
  end

  test "reset password instructions" do
    user = create :user

    mail = Devise::Mailer.reset_password_instructions(user, 'faketoken')

    assert_equal "Code.org reset password instructions", mail.subject
    assert_equal [user.email], mail.to
    assert_equal ["noreply@code.org"], mail.from

    assert_match 'https://test-studio.code.org/users/password/edit?reset_password_token=faketoken', mail.body.encoded
    assert_no_http_urls mail.body.encoded
  end
end
