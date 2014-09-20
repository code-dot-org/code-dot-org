require 'test_helper'

class ReportsHelperTest < ActionView::TestCase

  setup do
    @user = create(:user)
    @level = create(:level)
  end

  test "level_passed should return true if userlevel best result is above the minimum pass result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT + 5)
  
    assert level_passed(user: @user, user_level: ul)
  end

  test "level_passed should return true if userlevel best result is equal to the minimum pass result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
  
    assert level_passed(user: @user, user_level: ul)
  end

  test "level_passed should return false if userlevel best result is less than the minimum pass result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT - 5)
  
    assert !level_passed(user: @user, user_level: ul)
  end

  test "level_passed should return true if session progress is above the minimum pass result" do
    level_id = 5
    @request.session[:progress] = {level_id => Activity::MINIMUM_PASS_RESULT + 5}
  
    assert level_passed(level_id: level_id)
  end

  test "level_passed should return true if session progress is equal to the minimum pass result" do
    level_id = 5
    @request.session[:progress] = {level_id => Activity::MINIMUM_PASS_RESULT}
  
    assert level_passed(level_id: level_id)
  end

  test "level_passed should return false if session progress is less than the minimum pass result" do
    level_id = 5
    @request.session[:progress] = {level_id => Activity::MINIMUM_PASS_RESULT - 5}
  
    assert !level_passed(level_id: level_id)
  end

  test "level_passed should return false if session progress does not include given level" do
    level_id = 5
    @request.session[:progress] = {level_id => Activity::MINIMUM_PASS_RESULT + 5}
  
    assert !level_passed(level_id: 100)
  end

  test "level_passed should be able to handle ScriptLevels that have nil as best_result" do
    # these exist in production. example:
    # #<UserLevel id: 28907915, user_id: 852686, level_id: 5,
    # attempts: 0, created_at: "2014-03-10 21:57:19", updated_at:
    # "2014-03-10 21:57:19", best_result: nil>

    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: nil)
  
    assert !level_passed(user: @user, user_level: ul)
  end

  test "level_passed should be able to handle nil ScriptLevels" do
    assert !level_passed(user: @user, user_level: nil)
  end

end
