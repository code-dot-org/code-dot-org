require 'test_helper'

class UserLevelTest < ActiveSupport::TestCase
  setup do
    @user = create(:user)
    @level = create(:level)
  end

  test "best? perfect? finished? and passing? should be able to handle ScriptLevels that have nil as best_result" do
    # these exist in production. example:
    # #<UserLevel id: 28907915, user_id: 852686, level_id: 5,
    # attempts: 0, created_at: "2014-03-10 21:57:19", updated_at:
    # "2014-03-10 21:57:19", best_result: nil>

    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: nil)

    assert !ul.best?
    assert !ul.perfect?
    assert !ul.finished?
    assert !ul.passing?
  end

  test "best? perfect? finished? and passing? for best result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::BEST_PASS_RESULT)

    assert ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely optimal result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MAXIMUM_NONOPTIMAL_RESULT + 1)

    assert !ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely passing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_PASS_RESULT)

    assert !ul.best?
    assert !ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely finishing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_FINISHED_RESULT)

    assert !ul.best?
    assert !ul.perfect?
    assert ul.finished?
    assert !ul.passing?
  end

  test "best? perfect? finished? and passing? for not finishing result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_FINISHED_RESULT - 5)

    assert !ul.best?
    assert !ul.perfect?
    assert !ul.finished?
    assert !ul.passing?
  end

  test "best? perfect? finished? and passing? for free play result" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::FREE_PLAY_RESULT)

    assert !ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "attempted, passed, and perfected scopes for nil result" do
    UserLevel.create(user: @user, level: @level, attempts: 0, best_result: nil)

    assert_equal 1, UserLevel.count
    assert_equal 0, UserLevel.attempted.count
    assert_equal 0, UserLevel.passing.count
    assert_equal 0, UserLevel.perfect.count
  end

  test "attempted, passed, and perfected scopes for attempted result" do
    UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_FINISHED_RESULT)

    assert_equal 1, UserLevel.count
    assert_equal 1, UserLevel.attempted.count
    assert_equal 0, UserLevel.passing.count
    assert_equal 0, UserLevel.perfect.count
  end

  test "attempted, passed, and perfected scopes for passed result" do
    UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MINIMUM_PASS_RESULT)

    assert_equal 1, UserLevel.count
    assert_equal 1, UserLevel.attempted.count
    assert_equal 1, UserLevel.passing.count
    assert_equal 0, UserLevel.perfect.count
  end

  test "attempted, passed, and perfected scopes for perfected result" do
    UserLevel.create(user: @user, level: @level, attempts: 0, best_result: Activity::MAXIMUM_NONOPTIMAL_RESULT + 1)

    assert_equal 1, UserLevel.count
    assert_equal 1, UserLevel.attempted.count
    assert_equal 1, UserLevel.passing.count
    assert_equal 1, UserLevel.perfect.count
  end

  test "unsubmitting should set best result back to attempted" do
    ul = UserLevel.create(user: @user, level: @level, attempts: 0, submitted: true, best_result: Activity::REVIEW_REJECTED_RESULT)
    ul.update! submitted: false
    assert_equal Activity::UNSUBMITTED_RESULT, ul.best_result
  end

  test "driver and navigator user levels" do
    student1 = create :student
    student2 = create :student

    level = create :level
    script  = create :script
    driver = create :user_level, user: student1, level: level, script: script
    navigator = create :user_level, user: student2, level: level, script: script

    driver.navigator_user_levels << navigator

    driver.reload
    navigator.reload

    assert_equal [navigator], driver.navigator_user_levels
    assert_equal [driver], navigator.driver_user_levels
  end
end
