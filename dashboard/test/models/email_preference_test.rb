require 'test_helper'

class EmailPreferenceTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  test "create email preference with valid attributes creates email preference" do
    assert_creates EmailPreference do
      create :email_preference,
        email: 'test_valid@example.net',
        opt_in: true,
        ip_address: '1.1.1.1',
        source: EmailPreference::ACCOUNT_SIGN_UP,
        form_kind: nil
    end
  end

  test "create email preference with invalid attributes does not create" do
    email_preference = EmailPreference.new
    assert_does_not_create EmailPreference do
      email_preference.update(email: 'amidala@naboo', source: 'This is not a love song.')
    end
    assert_includes email_preference.errors.full_messages, "Email does not appear to be a valid e-mail address"
    assert_includes email_preference.errors.full_messages, "Opt in is not included in the list"
    assert_includes email_preference.errors.full_messages, "Source is not included in the list"
    assert_includes email_preference.errors.full_messages, "Ip address is required"
  end

  test "upsert email preference changes existing email preference" do
    email_preference = create :email_preference
    EmailPreference.upsert!(
      email: email_preference.email,
      opt_in: true,
      ip_address: '192.168.1.1',
      source: EmailPreference::FORM_HOUR_OF_CODE,
      form_kind: 'form text version 2.71828'
    )
    email_preference.reload
    assert email_preference.opt_in
    assert_equal '192.168.1.1', email_preference.ip_address
    assert_equal EmailPreference::FORM_HOUR_OF_CODE, email_preference.source
    assert_equal 'form text version 2.71828', email_preference.form_kind
  end

  test "upsert email preference with opt out that is already opted in does not update" do
    email_preference = create :email_preference, opt_in: true
    original_attributes = email_preference.attributes
    EmailPreference.upsert!(
      email: email_preference.email,
      opt_in: false,
      ip_address: '172.16.6.1',
      source: EmailPreference::ACCOUNT_SIGN_UP,
      form_kind: 'form text version 3.14159'
    )
    email_preference.reload
    # opt_in is still true.
    assert email_preference.opt_in
    # No update carried out.  All attributes, including updated_at, are unchanged.
    assert_equal original_attributes, email_preference.attributes
  end
end
