require 'test_helper'
require 'purged_account_log'

class PurgedAccountLogTest < ActiveSupport::TestCase
  test 'records reason for account purge' do
    log_obj = PurgedAccountLog.new create(:user),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = YAML.load log_obj.to_yaml
    assert_equal PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO, log[:reason]

    log_obj = PurgedAccountLog.new create(:user),
      reason: PurgedAccountLog::REQUESTED_BY_USER
    log = YAML.load log_obj.to_yaml
    assert_equal PurgedAccountLog::REQUESTED_BY_USER, log[:reason]
  end

  test 'raises ArgumentError when given invalid reason' do
    assert_raises ArgumentError do
      PurgedAccountLog.new create(:user)
    end
    assert_raises ArgumentError do
      PurgedAccountLog.new create(:user),
        reason: 'Some other reason'
    end
  end

  test 'records user id' do
    user = create :student
    log_obj = PurgedAccountLog.new user,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = YAML.load log_obj.to_yaml
    assert_equal user.id, log[:id]
  end

  test 'records hashed email' do
    user = create :student
    refute_nil user.hashed_email
    log_obj = PurgedAccountLog.new user,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = YAML.load log_obj.to_yaml
    assert_equal user.hashed_email, log[:hashed_email]
  end

  # TODO: Does not retain hashed email if maually requested by user
  # TODO: Multi-auth handle multiple hashed emails

  test 'records Pardot ids' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log_obj.pardot_ids = [1, 2, 3]
    log = YAML.load log_obj.to_yaml
    assert_equal [1, 2, 3], log[:pardot_ids]
  end

  test 'records Poste ids' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log_obj.poste_contact_ids = [1, 2, 3]
    log = YAML.load log_obj.to_yaml
    assert_equal [1, 2, 3], log[:poste_contact_ids]
  end

  test 'records purged_at date' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    purge_time = Time.now
    log_obj.purged_at = purge_time
    log = YAML.load log_obj.to_yaml
    assert_equal purge_time, log[:purged_at]
  end

  test 'records confirmed_at date' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    confirm_time = Time.now
    log_obj.confirmed_at = confirm_time
    log = YAML.load log_obj.to_yaml
    assert_equal confirm_time, log[:confirmed_at]
  end
end
