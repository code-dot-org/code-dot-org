require 'test_helper'
require 'ostruct'

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
      [[:non_compliant_child, :with_pending_parent_permission, {created_at: '2023-06-30T23:59:59MST'}], true],
      [[:non_compliant_child, :with_pending_parent_permission, {created_at: '2023-07-01T00:00:00MST'}], true],
      [[:non_compliant_child, :with_pending_parent_permission, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :with_pending_parent_permission, :p20_937_exception_date], false],
      [[:non_compliant_child, :skip_validation, {birthday: nil}], true],
      [[:non_compliant_child, :with_interpolated_co], true],
      [[:non_compliant_child, :with_interpolated_colorado], true],
      [[:non_compliant_child, :with_interpolated_wa], true],
    ]
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.compliant?(user)
      failure_msg = "Expected compliant?(#{traits}) to be #{compliance} but it was #{actual}"
      assert_equal compliance, actual, failure_msg
    end
  end

  test 'show_cap_state_modal?' do
    test_matrix = [
      {rollout: 10, user_id: 9, expected: true},
      {rollout: 10, user_id: 101, expected: true},
      {rollout: 10, user_id: 109, expected: true},
      {rollout: 10, user_id: 110, expected: false},
      {rollout: 10, user_id: 199, expected: false},
      {rollout: 20, user_id: 119, expected: true},
      {rollout: 99, user_id: 198, expected: true},
      {rollout: 99, user_id: 199, expected: false},
      {rollout: 100, user_id: 99, expected: true},
      {rollout: 100, user_id: 1099, expected: true},
    ]
    test_matrix.each do |test_case|
      user = OpenStruct.new({id: test_case[:user_id]})
      DCDO.stubs(:get).with('cap-state-modal-rollout', 0).returns(test_case[:rollout])
      actual = Policies::ChildAccount.show_cap_state_modal? user
      assert_equal test_case[:expected], actual, "Testcase #{test_case} failed"
    end
  end

  test 'user_predates_policy?' do
    # [User traits, Expected result from compliant?]
    test_matrix = [
      [[:student], false],
      [[:student, :U13], false],
      [[:student, :U13, :unknown_us_region], false],
      [[:non_compliant_child, {created_at: '2023-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, {created_at: '2024-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, {created_at: '2024-07-01T00:00:00MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_clever, {created_at: '2023-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_clever, {created_at: '2024-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_google_classroom, {created_at: '2023-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, :migrated_imported_from_google_classroom, {created_at: '2024-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, :with_google_authentication_option, {created_at: '2024-06-29T23:59:59MST'}], true],
      # The following test cases address P20-937
      [[:non_compliant_child, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :microsoft_v2_sso_provider, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :facebook_sso_provider, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :p20_937_exception_date], false],
      [[:non_compliant_child, :microsoft_v2_sso_provider, :p20_937_exception_date], false],
      [[:non_compliant_child, :facebook_sso_provider, :p20_937_exception_date], false],
    ]
    failures = []
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.user_predates_policy?(user)
      failure_msg = "Expected user_predates_policy?(#{traits}) to be #{compliance} but it was #{actual}"
      failures << failure_msg if actual != compliance
    end
    assert failures.empty?, failures.join("\n")
  end
end
