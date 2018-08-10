require 'test_helper'
require 'account_purger'
require 'cdo/delete_accounts_helper'

class AccountPurgerTest < ActiveSupport::TestCase
  NULL_STREAM = File.open File::NULL, 'w'

  setup do
    # Don't actually call in to inner logic in any test
    DeleteAccountsHelper.stubs(:purge_user)
    # Never actually upload logs to S3
    PurgedAccountLog.any_instance.stubs(:upload)

    # Example accounts
    @student = create :student
  end

  test 'can construct with no arguments - all defaults' do
    ap = AccountPurger.new
    assert_equal false, ap.dry_run?
  end

  test 'raises ArgumentError unless dry_run is boolean' do
    AccountPurger.new dry_run: false
    AccountPurger.new dry_run: true
    assert_raises ArgumentError do
      AccountPurger.new dry_run: 1
    end
  end

  test 'raises ArgumentError unless log is a stream-like' do
    AccountPurger.new log: STDOUT
    AccountPurger.new log: STDERR
    AccountPurger.new log: StringIO.new
    assert_raises ArgumentError do
      AccountPurger.new log: ''
    end
  end

  test 'purge_data_for_account uses DeleteAccountsHelper to purge the user' do
    DeleteAccountsHelper.expects(:purge_user).once.with {|account| account.id == @student.id}
    AccountPurger.new(log: NULL_STREAM).
      purge_data_for_account @student
  end

  test 'purge_data_for_account does not call DeleteAccountsHelper when dry-run is enabled' do
    DeleteAccountsHelper.expects(:purge_user).never
    AccountPurger.new(log: NULL_STREAM, dry_run: true).
      purge_data_for_account @student
  end

  test 'purge_data_for_account uploads a log' do
    PurgedAccountLog.any_instance.expects(:upload).once
    AccountPurger.new(log: NULL_STREAM).
      purge_data_for_account @student
  end

  test 'purge_data_for_account does not upload a log when dry-run is enabled' do
    PurgedAccountLog.any_instance.expects(:upload).never
    AccountPurger.new(log: NULL_STREAM, dry_run: true).
      purge_data_for_account @student
  end

  test 'purge_data_for_account logs activity' do
    log = StringIO.new
    AccountPurger.new(log: log).
      purge_data_for_account @student
    assert_equal <<~LOG, log.string
      Purging user_id #{@student.id}
    LOG
  end

  test 'purge_data_for_account logs activity when dry-run is enabled' do
    log = StringIO.new
    AccountPurger.new(log: log, dry_run: true).
      purge_data_for_account @student
    assert_equal <<~LOG, log.string
      Purging user_id #{@student.id} (dry-run)
    LOG
  end
end
