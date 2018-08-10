require 'test_helper'
require 'account_purger'

class AccountPurgerTest < ActiveSupport::TestCase
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

  test 'raises ArgumentError unless log is a stream' do
    AccountPurger.new log: STDOUT
    AccountPurger.new log: STDERR
    AccountPurger.new log: StringIO.new
    assert_raises ArgumentError do
      AccountPurger.new log: ''
    end
  end

  test 'purge_data_for_account does not upload a log when dry-run is enabled' do
    student = create :student
    ap = AccountPurger.new dry_run: true, log: StringIO.new

    PurgedAccountLog.any_instance.expects(:upload).never
    ap.purge_data_for_account student
  end

  test 'purge_data_for_account logs activity when dry-run is enabled' do
    student = create :student
    log = StringIO.new
    ap = AccountPurger.new dry_run: true, log: log

    ap.purge_data_for_account student

    assert_equal <<~LOG, log.string
      Purging user_id #{student.id} (dry-run)
    LOG
  end
end
