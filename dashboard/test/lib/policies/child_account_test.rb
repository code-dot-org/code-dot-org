require 'test_helper'

class Policies::ChildAccountTest < ActiveSupport::TestCase
  class ComplianceStateTest < ActiveSupport::TestCase
    setup do
      @student = build(:student)
    end

    test 'locked_out?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.locked_out?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT
      end
    end

    test 'request_sent?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.request_sent?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::REQUEST_SENT
      end
    end

    test 'permission_granted?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.permission_granted?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      end
    end
  end

  test 'compliant?' do
    # [User traits, Expected result from compliant?]
    test_matrix = [
      [[:student], true],
      [[:locked_out_child], false],
      [[:locked_out_child, :with_parent_permission], true],
      [[:non_compliant_child], false],
      [[:non_compliant_child, :unknown_us_region], true],
      [[:non_compliant_child, :not_U13], true],
      [[:non_compliant_child, :migrated_imported_from_clever], true],
      [[:non_compliant_child, :with_lti_auth], true],
      [[:non_compliant_child, :with_pending_parent_permission, {created_at: '2023-06-30T23:59:59Z'}], true],
      [[:non_compliant_child, :with_pending_parent_permission, {created_at: '2023-07-01T00:00:00Z'}], false],
    ]
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.compliant?(user)
      failure_msg = "Expected compliant?(#{traits}) to be #{compliance} but it was #{actual}"
      assert_equal compliance, actual, failure_msg
    end
  end
end
