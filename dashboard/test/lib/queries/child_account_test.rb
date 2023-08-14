require 'test_helper'

class Queries::ChildAccountTest < ActiveSupport::TestCase
  freeze_time

  test 'expired_accounts' do
    expired_accounts = Array.new(3) {|_| create :locked_out_child, :expired}
    locked_account = create :locked_out_child
    u13_colorado_account = create :student, :U13, :in_colorado
    student_account = create :student
    users = [locked_account, u13_colorado_account, student_account,
             *expired_accounts]
    user_ids = users.map(&:id)

    actual_expired_accounts = Queries::ChildAccount.expired_accounts(scope: User.where(id: user_ids))

    expired_accounts.each do |expected_user|
      assert_includes(actual_expired_accounts, expected_user)
    end
    assert_equal expired_accounts.count, actual_expired_accounts.count
  end
end
