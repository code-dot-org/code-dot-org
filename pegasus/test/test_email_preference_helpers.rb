require_relative '../helper_modules/dashboard'
require_relative './test_helper'
require 'cdo/email_preference_constants'
require_relative '../helpers/email_preference_helpers'

class EmailPreferenceHelperTest < Minitest::Test
  def test_create_email_preference_with_valid_attributes_creates_email_preference
    row_id = EmailPreferenceHelper.upsert(
      email: 'test_valid@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceConstants::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
    assert row_id > 0
    email_preferences = Dashboard.db[:email_preferences].where(id: row_id)
    assert_equal 1, email_preferences.count

    email_preference = email_preferences.first
    assert_equal 'test_valid@example.net', email_preference[:email]
    assert_equal true, email_preference[:opt_in]
    assert_equal '1.1.1.1', email_preference[:ip_address]
    assert_equal EmailPreferenceConstants::ACCOUNT_SIGN_UP, email_preference[:source]
  end
end
