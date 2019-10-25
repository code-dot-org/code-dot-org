require 'test_helper'

class UserLevelInfoTest < ActiveSupport::TestCase
  test "can create user_level_info" do
    user_level_info = create :user_level_info
    assert_equal user_level_info.user_level_id, 1
    assert_equal user_level_info.time_spent, 10
  end
end
