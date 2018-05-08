require 'test_helper'

class EmailPreferenceTest < ActiveSupport::TestCase
  test "create email preference with valid attributes creates email preference" do
    assert_creates EmailPreference do
      create :email_preference,
        email: 'test_valid@example.net',
        opt_in: true,
        ip_address: '1.1.1.1',
        source: 'user registration',
        form_kind: nil
    end
  end

  test "create email preference with invalid attributes does not create" do
    email_preference = EmailPreference.new
    assert_does_not_create EmailPreference do
      email_preference.update(email: 'amidala@naboo')
    end
    assert_includes email_preference.errors.full_messages, "Email does not appear to be a valid e-mail address"
    assert_includes email_preference.errors.full_messages, "Opt in is not included in the list"
    assert_includes email_preference.errors.full_messages, "Source is required"
    assert_includes email_preference.errors.full_messages, "Ip address is required"
  end
end
