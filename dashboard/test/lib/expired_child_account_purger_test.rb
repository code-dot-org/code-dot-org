require 'test_helper'
require 'testing/includes_metrics'
require 'account_purger'
require 'expired_deleted_account_purger'

class ExpiredChildAccountPurgerTest < ActiveSupport::TestCase
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
    ExpiredChildAccountPurger.any_instance.stubs :upload_activity_log
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
    purger = ExpiredChildAccountPurger.new
    assert_equal false, purger.dry_run?
    assert_equal 7.days.ago, purger.lock_out_date
    assert_equal 200, purger.max_accounts_to_purge
  end

  test 'raises ArgumentError unless dry_run is boolean' do
    ExpiredChildAccountPurger.new dry_run: false
    ExpiredChildAccountPurger.new dry_run: true
    assert_raises ArgumentError do
      ExpiredChildAccountPurger.new dry_run: 1
    end
  end

  test 'raises ArgumentError unless lock_out_date is a Time' do
    ExpiredChildAccountPurger.new lock_out_date: 30.days.ago
    ExpiredChildAccountPurger.new lock_out_date: Time.parse('2018-07-30 4:18pm PDT')
    assert_raises ArgumentError do
      ExpiredChildAccountPurger.new lock_out_date: '2018-07-31'
    end
    assert_raises ArgumentError do
      ExpiredChildAccountPurger.new lock_out_date: '7'
    end
  end

  test 'raises ArgumentError unless max_accounts_to_purge is an Integer' do
    ExpiredChildAccountPurger.new max_accounts_to_purge: 50
    assert_raises ArgumentError do
      ExpiredChildAccountPurger.new max_accounts_to_purge: '50'
    end
    assert_raises ArgumentError do
      ExpiredChildAccountPurger.new max_accounts_to_purge: 2.5
    end
  end

  test 'only expired child accounts are purged' do
    expired_accounts = Array.new(3) {|_| create :locked_out_child, :expired}
    locked_account = create :locked_out_child
    u13_colorado_account = create :student, :U13, :in_colorado
    student_account = create :student

    expired_accounts.each do |user|
      Services::ChildAccount::EventLogger.expects(:log_account_purging).with(user).once
    end

    purger = ExpiredChildAccountPurger.new
    purger.purge_expired_child_accounts!(skip_report: true)

    expired_accounts.each {|user| assert_equal true, purged?(user.reload)}
    assert_equal false, purged?(locked_account.reload)
    assert_equal false, purged?(u13_colorado_account.reload)
    assert_equal false, purged?(student_account.reload)
  end

  test 'expired child accounts are reported in metrics' do
    expired_accounts = Array.new(3) {|_| create :locked_out_child, :expired}
    Cdo::Metrics.expects(:push).with(
      'ExpiredChildAccountPurger',
      includes_metrics(
        PurgeSizeLimitExceeded: 0,
        AccountsPurged: expired_accounts.count,
        AccountsQueued: 0,
        ReviewQueueDepth: is_a(Integer),
        ManualReviewQueueDepth: is_a(Integer)
      )
    )

    purger = ExpiredChildAccountPurger.new
    purger.purge_expired_child_accounts!
  end

  private def purged?(user)
    user.purged_at.present?
  end
end
