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

  describe '.cap_affected' do
    subject(:cap_affected_students) {described_class.cap_affected}

    let!(:student) {create(:student, cap_status: nil)}

    it 'does not return students not affected by CAP' do
      _cap_affected_students.wont_include student
    end

    context 'when student with parental permission granted' do
      let!(:student) {create(:student, :with_parent_permission)}

      it 'does not return student' do
        _cap_affected_students.wont_include student
      end
    end

    SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.to_h.except(:PERMISSION_GRANTED).each do |key, value|
      context %Q[when student CAP status is "#{key}"] do
        let!(:student) {create(:student, cap_status: value)}

        it 'returns student' do
          _cap_affected_students.must_include student
        end

        context 'and is not in users scope' do
          subject(:cap_affected_students) {described_class.cap_affected(scope: User.where.not(id: student.id))}

          it 'does not return student' do
            _cap_affected_students.wont_include student
          end
        end
      end
    end
  end
end
