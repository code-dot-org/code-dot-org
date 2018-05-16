require_relative '../helper_modules/dashboard'
require_relative './test_helper'
require_relative '../helpers/email_preference_helpers'
require 'timecop'

class EmailPreferenceHelperTest < Minitest::Test
  def test_upsert_new_email_preference_with_valid_attributes_creates_email_preference
    row_id = EmailPreferenceHelper.upsert!(
      email: 'test_valid@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
    assert row_id > 0
    email_preferences = Dashboard.db[:email_preferences].where(id: row_id)
    assert_equal 1, email_preferences.count

    email_preference = email_preferences.first
    assert_equal 'test_valid@example.net', email_preference[:email]
    assert_equal true, email_preference[:opt_in]
    assert_equal '1.1.1.1', email_preference[:ip_address]
    assert_equal EmailPreferenceHelper::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  def test_upsert_email_preference_with_invalid_email_does_not_create_email_preference
    begin
      row_id = EmailPreferenceHelper.upsert!(
        email: 'amidala@naboo',
        opt_in: true,
        ip_address: '1.1.1.1',
        source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
        form_kind: nil
      )
    rescue StandardError => error
      assert_equal 'Email does not appear to be a valid e-mail address', error.message
      assert_nil row_id
    else
      assert false, "Expected an email validation error."
    end
  end

  def test_upsert_email_preference_without_opt_in_does_not_create_email_preference
    begin
      row_id = EmailPreferenceHelper.upsert!(
        email: 'test_valid@example.net',
        opt_in: nil,
        ip_address: '1.1.1.1',
        source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
        form_kind: nil
      )
    rescue StandardError => error
      assert_equal 'Opt In is required', error.message
      assert_nil row_id
    else
      assert false, "Expected an Opt In validation error."
    end
  end

  def test_upsert_email_preference_with_invalid_source_does_not_create_email_preference
    begin
      row_id = EmailPreferenceHelper.upsert!(
        email: 'test_valid@example.net',
        opt_in: true,
        ip_address: '1.1.1.1',
        source: 'Where have all the cowboys gone?',
        form_kind: nil
      )
    rescue StandardError => error
      assert_equal 'Source is not included in the list', error.message
      assert_nil row_id
    else
      fail 'Expected a source validation error.'
    end
  end

  def test_upsert_email_preference_without_ip_address_does_not_create_email_preference
    begin
      row_id = EmailPreferenceHelper.upsert!(
        email: 'test_valid@example.net',
        opt_in: true,
        ip_address: nil,
        source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
        form_kind: nil
      )
    rescue StandardError => error
      assert_equal 'IP Address is required', error.message
      assert_nil row_id
    else
      fail 'Expected an IP Address error.'
    end
  end

  def test_upsert_existing_email_preference_changes_existing_email_preference
    Timecop.freeze

    existing_row_id = EmailPreferenceHelper.upsert!(
      email: 'existing@example.net',
      opt_in: false,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )

    # Move clock forward so that the row is updated_at a different time from when it was created_at.
    Timecop.travel 1

    updated_row_id = EmailPreferenceHelper.upsert!(
      email: 'existing@example.net',
      opt_in: true,
      ip_address: '2.2.2.2',
      source: EmailPreferenceHelper::FORM_ACCESS_REPORT,
      form_kind: "0"
    )
    updated_email_preference = Dashboard.db[:email_preferences].where(id: updated_row_id).first

    assert_equal updated_row_id, existing_row_id
    assert_equal true, updated_email_preference[:opt_in]
    assert_equal '2.2.2.2', updated_email_preference[:ip_address]
    assert_equal EmailPreferenceHelper::FORM_ACCESS_REPORT, updated_email_preference[:source]
    assert_equal "0", updated_email_preference[:form_kind]
    refute_equal updated_email_preference[:updated_at], updated_email_preference[:created_at]

    Timecop.return
  end

  def test_upsert_email_preference_that_is_already_opted_in_does_not_opt_out
    EmailPreferenceHelper.upsert!(
      email: 'opt_in@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )

    still_opted_in_row_id = EmailPreferenceHelper.upsert!(
      email: 'opt_in@example.net',
      opt_in: false,
      ip_address: '2.2.2.2',
      source: EmailPreferenceHelper::FORM_ACCESS_REPORT,
      form_kind: "0"
    )

    updated_email_preference = Dashboard.db[:email_preferences].where(id: still_opted_in_row_id).first
    assert updated_email_preference[:opt_in]
  end
end
