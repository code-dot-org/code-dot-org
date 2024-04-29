require 'test_helper'
require 'ostruct'

class Policies::ChildAccountTest < ActiveSupport::TestCase
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
    ]
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.compliant?(user)
      failure_msg = "Expected compliant?(#{traits}) to be #{compliance} but it was #{actual}"
      assert_equal compliance, actual, failure_msg
    end
  end

  test 'show_cap_state_modal??' do
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
end
