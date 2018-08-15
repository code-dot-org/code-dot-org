require_relative '../helper_modules/dashboard'
require_relative './test_helper'
require_relative '../helpers/email_preference_helpers'
require_relative 'sequel_test_case'
require 'timecop'

class EmailPreferenceHelperTest < SequelTestCase
  def test_upsert_new_email_preference_with_valid_attributes_creates_email_preference
    EmailPreferenceHelper.upsert!(
      email: 'test_valid@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
    email_preferences = Dashboard.db[:email_preferences].where(email: 'test_valid@example.net')
    assert_equal 1, email_preferences.count

    email_preference = email_preferences.first
    assert_equal 'test_valid@example.net', email_preference[:email]
    assert_equal true, email_preference[:opt_in]
    assert_equal '1.1.1.1', email_preference[:ip_address]
    assert_equal EmailPreferenceHelper::ACCOUNT_SIGN_UP, email_preference[:source]
  end

  def test_upsert_email_preference_with_invalid_email_does_not_create_email_preference
    EmailPreferenceHelper.upsert!(
      email: 'amidala@naboo',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
  rescue StandardError => error
    assert_equal 'Email does not appear to be a valid e-mail address', error.message
    assert_nil Dashboard.db[:email_preferences].where(email: 'amidala@naboo').first
  else
    fail "Expected an email validation error."
  end

  def test_upsert_email_preference_without_opt_in_does_not_create_email_preference
    EmailPreferenceHelper.upsert!(
      email: 'test_without_opt_in@example.net',
      opt_in: nil,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
  rescue StandardError => error
    assert_equal 'Opt In is required', error.message
    assert_nil Dashboard.db[:email_preferences].where(email: 'test_without_opt_in@example.net').first
  else
    fail "Expected an Opt In validation error."
  end

  def test_upsert_email_preference_with_invalid_source_does_not_create_email_preference
    EmailPreferenceHelper.upsert!(
      email: 'test_invalid_source@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: 'Where have all the cowboys gone?',
      form_kind: nil
    )
  rescue StandardError => error
    assert_equal 'Source is not included in the list', error.message
    assert_nil Dashboard.db[:email_preferences].where(email: 'test_invalid_source@example.net').first
  else
    fail 'Expected a source validation error.'
  end

  def test_upsert_email_preference_without_ip_address_does_not_create_email_preference
    EmailPreferenceHelper.upsert!(
      email: 'test_without_ip_address@example.net',
      opt_in: true,
      ip_address: nil,
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )
  rescue StandardError => error
    assert_equal 'IP Address is required', error.message
    assert_nil Dashboard.db[:email_preferences].where(email: 'test_without_ip_address@example.net').first
  else
    fail 'Expected an IP Address error.'
  end

  def test_upsert_existing_email_preference_changes_existing_email_preference
    Timecop.freeze

    EmailPreferenceHelper.upsert!(
      email: 'existing@example.net',
      opt_in: false,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )

    existing_email_preference = Dashboard.db[:email_preferences].where(email: 'existing@example.net').first

    # Move clock forward so that the row is updated_at a different time from when it was created_at.
    Timecop.travel 1

    EmailPreferenceHelper.upsert!(
      email: 'existing@example.net',
      opt_in: true,
      ip_address: '2.2.2.2',
      source: EmailPreferenceHelper::FORM_ACCESS_REPORT,
      form_kind: "0"
    )
    updated_email_preference = Dashboard.db[:email_preferences].where(email: 'existing@example.net').first

    assert_equal existing_email_preference[:id], updated_email_preference[:id]
    assert updated_email_preference[:opt_in]
    assert_equal '2.2.2.2', updated_email_preference[:ip_address]
    assert_equal EmailPreferenceHelper::FORM_ACCESS_REPORT, updated_email_preference[:source]
    assert_equal "0", updated_email_preference[:form_kind]
    refute_equal updated_email_preference[:updated_at], updated_email_preference[:created_at]

    Timecop.return
  end

  def test_upsert_email_preference_that_is_already_opted_in_does_not_opt_out
    Timecop.freeze

    EmailPreferenceHelper.upsert!(
      email: 'opt_in@example.net',
      opt_in: true,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )

    existing_email_preference = Dashboard.db[:email_preferences].where(email: 'opt_in@example.net').first

    # Move clock forward so that if the row is updated, updated_at is a different time from when it was created_at.
    Timecop.travel 1

    EmailPreferenceHelper.upsert!(
      email: 'opt_in@example.net',
      opt_in: false,
      ip_address: '2.2.2.2',
      source: EmailPreferenceHelper::FORM_ACCESS_REPORT,
      form_kind: "0"
    )

    not_updated_email_preference = Dashboard.db[:email_preferences].where(email: 'opt_in@example.net').first
    assert not_updated_email_preference[:opt_in]
    assert_equal '1.1.1.1', not_updated_email_preference[:ip_address]
    assert_equal EmailPreferenceHelper::ACCOUNT_SIGN_UP, not_updated_email_preference[:source]
    assert_nil not_updated_email_preference[:form_kind]
    assert_equal existing_email_preference[:updated_at], not_updated_email_preference[:updated_at]

    Timecop.return
  end

  def test_upsert_does_not_update_other_rows
    EmailPreferenceHelper.upsert!(
      email: 'another_row@example.net',
      opt_in: false,
      ip_address: '1.1.1.1',
      source: EmailPreferenceHelper::ACCOUNT_SIGN_UP,
      form_kind: nil
    )

    EmailPreferenceHelper.upsert!(
      email: 'update_me@example.net',
      opt_in: false,
      ip_address: '9.9.9.9',
      source: EmailPreferenceHelper::FORM_PETITION,
      form_kind: nil
    )

    EmailPreferenceHelper.upsert!(
      email: 'update_me@example.net',
      opt_in: true,
      ip_address: '8.8.8.8',
      source: EmailPreferenceHelper::FORM_HOUR_OF_CODE,
      form_kind: '0'
    )

    updated_email_preference = Dashboard.db[:email_preferences].where(email: 'update_me@example.net').first
    another_email_preference = Dashboard.db[:email_preferences].where(email: 'another_row@example.net').first

    refute_equal updated_email_preference[:opt_in], another_email_preference[:opt_in]
    refute_equal updated_email_preference[:ip_address], another_email_preference[:ip_address]
    refute_equal updated_email_preference[:source], another_email_preference[:source]
    refute_equal updated_email_preference[:form_kind], another_email_preference[:form_kind]
  end
end
