require 'test_helper'
require 'expired_deleted_account_purger'

class ExpiredDeletedAccountPurgerTest < ActiveSupport::TestCase
  freeze_time

  setup_all do
    # No soft-deleted users and no purged users, to begin with.
    assert_empty User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil)
    assert_empty User.with_deleted.where.not(purged_at: nil)
  end

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

    found_accounts = ExpiredDeletedAccountPurger.new.send :soft_deleted_accounts

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
    ).send :expired_deleted_accounts

    assert_includes picked_users, soft_deleted_account
    refute_includes picked_users, active_account
  end

  test 'does not locate accounts that have already been purged' do
    purged_account = create :student, deleted_at: 29.days.ago, purged_at: 1.day.ago
    unpurged_account = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_deleted_accounts

    assert_includes picked_users, unpurged_account
    refute_includes picked_users, purged_account
  end

  test 'does not locate accounts deleted before the start date' do
    account_deleted_before_cutoff = create :student, deleted_at: 31.days.ago
    account_deleted_after_cutoff = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_deleted_accounts

    assert_includes picked_users, account_deleted_after_cutoff
    refute_includes picked_users, account_deleted_before_cutoff
  end

  test 'does not locate accounts deleted less than 28 days ago' do
    account_deleted_too_recently = create :student, deleted_at: 27.days.ago
    account_deleted_long_enough = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_deleted_accounts

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
    ).send :expired_deleted_accounts

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
    ).send :expired_deleted_accounts

    refute_includes picked_users, deleted_10_days_ago
    refute_includes picked_users, deleted_20_days_ago
    refute_includes picked_users, deleted_30_days_ago
  end

  test 'with two eligible and two ineligible accounts' do
    create :student, deleted_at: 1.day.ago
    create :student, deleted_at: 3.days.ago
    create :student, deleted_at: 3.days.ago
    create :student, deleted_at: 5.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago

    AccountPurger.stubs(:new).returns(FakeAccountPurger.new)

    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/SoftDeletedAccounts", 2)
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/AccountsPurged", 2)
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/ManualReviewQueueDepth", 0)

    edap.purge_expired_deleted_accounts!

    assert_equal 2, User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil).count
    assert_equal 2, User.with_deleted.where.not(purged_at: nil).count
  end

  test 'moves account to queue when purge fails' do
    create :student, deleted_at: 3.days.ago
    error_student = create :student, deleted_at: 3.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago

    AccountPurger.stubs(:new).returns(FakeAccountPurger.new(fails_on: error_student))

    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/SoftDeletedAccounts", 1)
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/AccountsPurged", 1)
    # TODO: Test moved to manual review queue
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/ManualReviewQueueDepth", 0)

    edap.purge_expired_deleted_accounts!

    assert_equal 1, User.with_deleted.where(purged_at: nil).where.not(deleted_at: nil).count
    assert_equal 1, User.with_deleted.where.not(purged_at: nil).count
    # TODO: Test manual review queue
  end

  test 'dry-run behavior' do
    create :student, deleted_at: 1.day.ago
    create :student, deleted_at: 3.days.ago
    create :student, deleted_at: 3.days.ago
    create :student, deleted_at: 5.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago,
      dry_run: true

    dry_run_account_purger = FakeAccountPurger.new(dry_run: true)
    AccountPurger.stubs(:new).with(dry_run: true).returns(dry_run_account_purger)
    dry_run_account_purger.expects(:purge_data_for_account).twice

    NewRelic::Agent.expects(:record_metric).never

    edap.purge_expired_deleted_accounts!
  end

  test 'when number of accounts to delete exceeds safety constraint' do
    6.times do
      create :student, deleted_at: 20.days.ago
    end

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 25.days.ago,
      deleted_before: 15.days.ago,
      max_accounts_to_purge: 5

    # Does not purge any accounts
    AccountPurger.expects(:new).never

    # Still sends metrics to New Relic
    # Finds 6 soft-deleted accounts since we didn't delete any
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/SoftDeletedAccounts", 6)
    # Records no purged accounts
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/AccountsPurged", 0)
    # Nothing moved to manual review queue
    NewRelic::Agent.stubs(:record_metric).
      once.with("Custom/DeletedAccountPurger/ManualReviewQueueDepth", 0)

    raised = assert_raises ExpiredDeletedAccountPurger::SafetyConstraintViolation do
      edap.purge_expired_deleted_accounts!
    end
    assert_equal \
      "Found 6 accounts to purge, which exceeds the configured limit of 5. Abandoning run.",
      raised.message
  end
end

class FakeAccountPurger
  def initialize(options = {})
    @dry_run = options[:dry_run].nil? ? false : options[:dry_run]
    @fails_on = options[:fails_on]
  end

  # Purge information for an individual user account.
  def purge_data_for_account(user)
    raise 'Fake failure' if user == @fails_on
    user.update!(purged_at: Time.now) unless @dry_run
  end
end
