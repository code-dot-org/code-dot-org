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

  test 'purge_data_for_account does not upload a log when dry-run is enabled' do
    PurgedAccountLog.any_instance.expects(:upload).never
    ap = AccountPurger.new dry_run: true
    ap.purge_data_for_account create(:student)
  end
end
