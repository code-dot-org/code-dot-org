require 'test_helper'
require 'testing/includes_metrics'
require 'account_purger'
require 'expired_deleted_account_purger'

class ExpiredDeletedAccountPurgerTest < ActiveSupport::TestCase
  freeze_time

  def setup
    # Force tests to fail unless they explicitly expect every call to Cdo::Metrics.push
    Cdo::Metrics.expects(:push).never

    # Disable other logging
    @@original_hip_chat_logging = CDO.hip_chat_logging
    CDO.stubs(hip_chat_logging: false)
    @@original_slack_endpoint = CDO.slack_endpoint
    CDO.stubs(slack_endpoint: nil)

    # No uploads
    ExpiredDeletedAccountPurger.any_instance.stubs :upload_activity_log
    PurgedAccountLog.any_instance.stubs :upload

    # Fake deletion behavior
    DeleteAccountsHelper.any_instance.stubs(:purge_user).with do |account|
      account.update!(purged_at: Time.now); true
    end
  end

  def teardown
    CDO.unstub(:hip_chat_logging)
    CDO.unstub(:slack_endpoint)
  end

  test 'can construct with no arguments - all defaults' do
    edap = ExpiredDeletedAccountPurger.new
    assert_equal false, edap.dry_run?
    assert_equal Time.parse('2018-07-31 4:18pm PDT'), edap.deleted_after
    assert_equal 28.days.ago, edap.deleted_before
    assert_equal 200, edap.max_teachers_to_purge
    assert_equal 4000, edap.max_accounts_to_purge
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

  test 'raises ArgumentError unless max_teachers_to_purge is an Integer' do
    ExpiredDeletedAccountPurger.new max_teachers_to_purge: 50
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new max_teachers_to_purge: '50'
    end
    assert_raises ArgumentError do
      ExpiredDeletedAccountPurger.new max_teachers_to_purge: 2.5
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
    ).send :expired_soft_deleted_accounts

    assert_includes picked_users, soft_deleted_account
    refute_includes picked_users, active_account
  end

  test 'does not locate accounts that have already been purged' do
    purged_account = create :student, deleted_at: 29.days.ago, purged_at: 1.day.ago
    unpurged_account = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_soft_deleted_accounts

    assert_includes picked_users, unpurged_account
    refute_includes picked_users, purged_account
  end

  test 'does not locate accounts deleted before the start date' do
    account_deleted_before_cutoff = create :student, deleted_at: 31.days.ago
    account_deleted_after_cutoff = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_soft_deleted_accounts

    assert_includes picked_users, account_deleted_after_cutoff
    refute_includes picked_users, account_deleted_before_cutoff
  end

  test 'does not locate accounts deleted less than 28 days ago' do
    account_deleted_too_recently = create :student, deleted_at: 27.days.ago
    account_deleted_long_enough = create :student, deleted_at: 29.days.ago

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 30.days.ago,
      deleted_before: 28.days.ago
    ).send :expired_soft_deleted_accounts

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
    ).send :expired_soft_deleted_accounts

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
    ).send :expired_soft_deleted_accounts

    refute_includes picked_users, deleted_10_days_ago
    refute_includes picked_users, deleted_20_days_ago
    refute_includes picked_users, deleted_30_days_ago
  end

  test 'does not locate accounts already queued for manual review' do
    autodeleteable = create :student, deleted_at: 3.days.ago
    needs_manual_review = create :student, deleted_at: 3.days.ago
    create :queued_account_purge, user: needs_manual_review

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago
    ).send :expired_soft_deleted_accounts

    assert_includes picked_users, autodeleteable
    refute_includes picked_users, needs_manual_review
  end

  test 'does locate accounts that are queued but also auto-retryable' do
    autodeleteable = create :student, deleted_at: 3.days.ago
    autoretryable = create :student, deleted_at: 3.days.ago
    create :queued_account_purge, :autoretryable, user: autoretryable

    picked_users = ExpiredDeletedAccountPurger.new(
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago
    ).send :expired_soft_deleted_accounts

    assert_includes picked_users, autodeleteable
    assert_includes picked_users, autoretryable
  end

  #
  # Tests over full behavior
  #

  test 'with two eligible and two ineligible accounts' do
    student_a = create :student, deleted_at: 1.day.ago
    student_b = create :student, deleted_at: 3.days.ago
    student_c = create :student, deleted_at: 3.days.ago
    student_d = create :student, deleted_at: 5.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago

    Cdo::Metrics.expects(:push).with(
      'DeletedAccountPurger',
      includes_metrics(
        AccountsPurged: 2,
        AccountsQueued: 0,
        ManualReviewQueueDepth: is_a(Integer)
      )
    )

    edap.purge_expired_deleted_accounts!

    purged = User.with_deleted.where.not(purged_at: nil)
    refute_includes purged, student_a
    assert_includes purged, student_b
    assert_includes purged, student_c
    refute_includes purged, student_d

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{4.days.ago}
      deleted_before: #{2.days.ago}
      max_teachers_to_purge: #{edap.max_teachers_to_purge}
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      Purging user_id #{student_b.id}
      Done purging user_id #{student_b.id}
      Purging user_id #{student_c.id}
      Done purging user_id #{student_c.id}
      AccountsPurged: 2
      AccountsQueued: 0
      ManualReviewQueueDepth: #{QueuedAccountPurge.count}
      Purged 2 account(s).
      🕐 00:00:00
    LOG
  end

  test 'moves account to queue when purge fails' do
    student_a = create :student, deleted_at: 3.days.ago
    student_b = create :student, deleted_at: 3.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago

    DeleteAccountsHelper.any_instance.stubs(:purge_user).with do |account|
      raise 'Intentional failure' if account == student_b
      account.update!(purged_at: Time.now); true
    end

    Cdo::Metrics.expects(:push).with(
      'DeletedAccountPurger',
      includes_metrics(
        AccountsPurged: 1,
        AccountsQueued: 1,
        ManualReviewQueueDepth: is_a(Integer)
      )
    )

    assert_creates QueuedAccountPurge do
      edap.purge_expired_deleted_accounts!
    end

    purged = User.with_deleted.where.not(purged_at: nil)
    assert_includes purged, student_a
    refute_includes purged, student_b

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{4.days.ago}
      deleted_before: #{2.days.ago}
      max_teachers_to_purge: #{edap.max_teachers_to_purge}
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      Purging user_id #{student_a.id}
      Done purging user_id #{student_a.id}
      Purging user_id #{student_b.id}
      AccountsPurged: 1
      AccountsQueued: 1
      ManualReviewQueueDepth: #{QueuedAccountPurge.count}
      Purged 1 account(s).
      Queued 1 account(s) for manual review.
      1 account(s) require review.
      🕐 00:00:00
    LOG
  end

  test 'dry-run behavior' do
    create :student, deleted_at: 1.day.ago
    student_b = create :student, deleted_at: 3.days.ago
    student_c = create :student, deleted_at: 3.days.ago
    create :student, deleted_at: 5.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago,
      dry_run: true

    edap.purge_expired_deleted_accounts!

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{4.days.ago}
      deleted_before: #{2.days.ago}
      max_teachers_to_purge: #{edap.max_teachers_to_purge}
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      (dry-run)
      Purging user_id #{student_b.id} (dry-run)
      Done purging user_id #{student_b.id} (dry-run)
      Purging user_id #{student_c.id} (dry-run)
      Done purging user_id #{student_c.id} (dry-run)
      AccountsPurged: 2
      AccountsQueued: 0
      ManualReviewQueueDepth: #{QueuedAccountPurge.all.count}
      Would have purged 2 account(s).
      🕐 00:00:00
    LOG
  end

  test 'does not queue accounts when dry-run is true' do
    student_a = create :student, deleted_at: 3.days.ago
    student_b = create :student, deleted_at: 3.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 4.days.ago,
      deleted_before: 2.days.ago,
      dry_run: true

    AccountPurger.any_instance.stubs(:purge_data_for_account).with do |account|
      edap.log.puts "Purging user_id #{account.id} (dry-run)"
      raise 'Intentional failure' if account.id == student_b.id; true
    end

    refute_creates QueuedAccountPurge do
      edap.purge_expired_deleted_accounts!
    end

    purged = User.with_deleted.where.not(purged_at: nil)
    refute_includes purged, student_a
    refute_includes purged, student_b

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{4.days.ago}
      deleted_before: #{2.days.ago}
      max_teachers_to_purge: #{edap.max_teachers_to_purge}
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      (dry-run)
      Purging user_id #{student_a.id} (dry-run)
      Purging user_id #{student_b.id} (dry-run)
      AccountsPurged: 1
      AccountsQueued: 1
      ManualReviewQueueDepth: #{QueuedAccountPurge.count}
      Would have purged 1 account(s).
      Would have queued 1 account(s) for manual review.
      🕐 00:00:00
    LOG
  end

  test 'when number of teachers to delete exceeds safety constraint' do
    create_list :teacher, 6, deleted_at: 20.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 25.days.ago,
      deleted_before: 15.days.ago,
      max_teachers_to_purge: 5

    # Does not purge any accounts
    AccountPurger.expects(:new).never

    # Still sends metrics
    Cdo::Metrics.expects(:push).with(
      'DeletedAccountPurger',
      includes_metrics(
        AccountsPurged: 0,
        AccountsQueued: 0,
        ManualReviewQueueDepth: is_a(Integer),
      )
    )

    raised = assert_raises ExpiredDeletedAccountPurger::SafetyConstraintViolation do
      edap.purge_expired_deleted_accounts!
    end
    assert_equal \
      "Found 6 teachers to purge, which exceeds the configured limit of 5. Abandoning run.",
      raised.message

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{25.days.ago}
      deleted_before: #{15.days.ago}
      max_teachers_to_purge: 5
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      Found 6 teachers to purge, which exceeds the configured limit of 5. Abandoning run.
      AccountsPurged: 0
      AccountsQueued: 0
      ManualReviewQueueDepth: #{QueuedAccountPurge.all.count}
      Purged 0 account(s).
      🕐 00:00:00
    LOG
  end

  test 'max teachers safety constraint does not limit number of students' do
    students = create_list :student, 6, deleted_at: 20.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 25.days.ago,
      deleted_before: 15.days.ago,
      max_teachers_to_purge: 5

    Cdo::Metrics.expects(:push).with(
      'DeletedAccountPurger',
      includes_metrics(
        AccountsPurged: 6,
        AccountsQueued: 0,
        ManualReviewQueueDepth: is_a(Integer),
      )
    )

    edap.purge_expired_deleted_accounts!

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{25.days.ago}
      deleted_before: #{15.days.ago}
      max_teachers_to_purge: 5
      max_accounts_to_purge: #{edap.max_accounts_to_purge}
      Purging user_id #{students[0].id}
      Done purging user_id #{students[0].id}
      Purging user_id #{students[1].id}
      Done purging user_id #{students[1].id}
      Purging user_id #{students[2].id}
      Done purging user_id #{students[2].id}
      Purging user_id #{students[3].id}
      Done purging user_id #{students[3].id}
      Purging user_id #{students[4].id}
      Done purging user_id #{students[4].id}
      Purging user_id #{students[5].id}
      Done purging user_id #{students[5].id}
      AccountsPurged: 6
      AccountsQueued: 0
      ManualReviewQueueDepth: #{QueuedAccountPurge.all.count}
      Purged 6 account(s).
      🕐 00:00:00
    LOG
  end

  test 'when number of accounts to delete exceeds safety constraint' do
    create_list :student, 6, deleted_at: 20.days.ago

    edap = ExpiredDeletedAccountPurger.new \
      deleted_after: 25.days.ago,
      deleted_before: 15.days.ago,
      max_accounts_to_purge: 5

    # Does not purge any accounts
    AccountPurger.expects(:new).never

    # Still sends metrics
    Cdo::Metrics.expects(:push).with(
      'DeletedAccountPurger',
      includes_metrics(
        AccountsPurged: 0,
        AccountsQueued: 0,
        ManualReviewQueueDepth: is_a(Integer),
      )
    )

    raised = assert_raises ExpiredDeletedAccountPurger::SafetyConstraintViolation do
      edap.purge_expired_deleted_accounts!
    end
    assert_equal \
      "Found 6 accounts to purge, which exceeds the configured limit of 5. Abandoning run.",
      raised.message

    assert_equal <<~LOG, edap.log.string
      Starting purge_expired_deleted_accounts!
      deleted_after: #{25.days.ago}
      deleted_before: #{15.days.ago}
      max_teachers_to_purge: #{edap.max_teachers_to_purge}
      max_accounts_to_purge: 5
      Found 6 accounts to purge, which exceeds the configured limit of 5. Abandoning run.
      AccountsPurged: 0
      AccountsQueued: 0
      ManualReviewQueueDepth: #{QueuedAccountPurge.all.count}
      Purged 0 account(s).
      🕐 00:00:00
    LOG
  end
end
