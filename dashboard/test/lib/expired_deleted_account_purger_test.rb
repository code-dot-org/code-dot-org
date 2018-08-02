require 'test_helper'
require 'expired_deleted_account_purger'

class ExpiredDeletedAccountPurgerTest < ActiveSupport::TestCase
  freeze_time

  test 'can construct with no arguments - all defaults' do
    edap = ExpiredDeletedAccountPurger.new
    assert_equal false, edap.dry_run?
    assert_equal Time.parse('2018-07-31 4:18pm PDT'), edap.deleted_after
    assert_equal 28.days.ago, edap.deleted_before
    assert_equal 100, edap.max_accounts_to_purge
  end

  test 'raises ArgumentError unless dry_run is boolean' do
    ExpiredDeletedAccountPurger.new dry_run: false
    ExpiredDeletedAccountPurger.new dry_run: true
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new dry_run: 1
    end
  end

  test 'raises ArgumentError unless deleted_after is a Time' do
    ExpiredDeletedAccountPurger.new deleted_after: 30.days.ago
    ExpiredDeletedAccountPurger.new deleted_after: Time.parse('2018-07-30 4:18pm PDT')
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new deleted_after: '2018-07-31'
    end
  end

  test 'raises ArgumentError unless deleted_before is a Time' do
    ExpiredDeletedAccountPurger.new deleted_before: 30.days.ago
    ExpiredDeletedAccountPurger.new deleted_before: Time.parse('2018-07-30 4:18pm PDT')
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new deleted_before: '2018-07-31'
    end
  end

  test 'raises ArgumentError unless max_accounts_to_purge is an Integer' do
    ExpiredDeletedAccountPurger.new max_accounts_to_purge: 50
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new max_accounts_to_purge: '50'
    end
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new max_accounts_to_purge: 2.5
    end
  end

  test 'correctly identifies soft-deleted accounts' do
    active_account = create :student
    soft_deleted_account = create :student, deleted_at: 1.day.ago
    hard_deleted_account = create :student, deleted_at: 1.day.ago, purged_at: 1.day.ago

    found_accounts = ExpiredDeletedAccountPurger.new.soft_deleted_accounts

    assert_includes found_accounts, soft_deleted_account
    refute_includes found_accounts, active_account
    refute_includes found_accounts, hard_deleted_account
  end

  test 'does not locate accounts that have not been soft-deleted' do
    active_account = create :student
    soft_deleted_account = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).expired_deleted_accounts

    assert_includes picked_users, soft_deleted_account
    refute_includes picked_users, active_account
  end

  test 'does not locate accounts that have already been purged' do
    purged_account = create :student, deleted_at: 29.days.ago, purged_at: 1.day.ago
    unpurged_account = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).expired_deleted_accounts

    assert_includes picked_users, unpurged_account
    refute_includes picked_users, purged_account
  end

  test 'does not locate accounts deleted before the start date' do
    account_deleted_before_cutoff = create :student, deleted_at: 31.days.ago
    account_deleted_after_cutoff = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).expired_deleted_accounts

    assert_includes picked_users, account_deleted_after_cutoff
    refute_includes picked_users, account_deleted_before_cutoff
  end

  test 'does not locate accounts deleted less than 28 days ago' do
    account_deleted_too_recently = create :student, deleted_at: 27.days.ago
    account_deleted_long_enough = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).expired_deleted_accounts

    assert_includes picked_users, account_deleted_long_enough
    refute_includes picked_users, account_deleted_too_recently
  end

  test 'locates only accounts within custom window' do
    deleted_10_days_ago = create :student, deleted_at: 10.days.ago
    deleted_20_days_ago = create :student, deleted_at: 20.days.ago
    deleted_30_days_ago = create :student, deleted_at: 30.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 25.days.ago,
      deleted_before: 15.days.ago
    ).expired_deleted_accounts

    refute_includes picked_users, deleted_10_days_ago
    assert_includes picked_users, deleted_20_days_ago
    refute_includes picked_users, deleted_30_days_ago
  end

  test 'does not locate any accounts when window is negative' do
    deleted_10_days_ago = create :student, deleted_at: 10.days.ago
    deleted_20_days_ago = create :student, deleted_at: 20.days.ago
    deleted_30_days_ago = create :student, deleted_at: 30.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 15.days.ago,
      deleted_before: 25.days.ago
    ).expired_deleted_accounts

    refute_includes picked_users, deleted_10_days_ago
    refute_includes picked_users, deleted_20_days_ago
    refute_includes picked_users, deleted_30_days_ago
  end
end
