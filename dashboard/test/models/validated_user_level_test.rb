require 'test_helper'

class ValidatedUserLevelTest < ActiveSupport::TestCase
  test "can create validated_user_level" do
    validated_user_level = create :validated_user_level
    assert_equal validated_user_level.user_level_id, 1
    assert_equal validated_user_level.time_spent, 10
  end
end
