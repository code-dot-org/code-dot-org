require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup do
    @user = create(:user)
    @level = create(:level)
  end

  test "best? finished? and passing? should be able to handle ScriptLevels that have nil as best_result" do
    # these exist in production. example:
    # #<UserLevel id: 28907915, user_id: 852686, level_id: 5,
    # attempts: 0, created_at: "2014-03-10 21:57:19", updated_at:
    # "2014-03-10 21:57:19", best_result: nil>

    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: nil)
  
    assert !ul.best?
    assert !ul.finished?
    assert !ul.passing?
  end

  test "best? finished? and passing? for best result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::BEST_PASS_RESULT)
  
    assert ul.best?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? finished? and passing? for barely passing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_PASS_RESULT)
  
    assert !ul.best?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? finished? and passing? for barely finishing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_FINISHED_RESULT)
  
    assert !ul.best?
    assert ul.finished?
    assert !ul.passing?
  end


  test "best? finished? and passing? for not finishing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_FINISHED_RESULT - 5)
  
    assert !ul.best?
    assert !ul.finished?
    assert !ul.passing?
  end


  test "best? finished? and passing? for free play result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::FREE_PLAY_RESULT)
  
    assert !ul.best?
    assert ul.finished?
    assert ul.passing?
  end
end
