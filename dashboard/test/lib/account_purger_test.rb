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
end
