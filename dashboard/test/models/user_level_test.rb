require 'test_helper'

class UserLevelTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @user = create(:user)
    @level = create(:level)

    @driver = create :student, name: 'DriverName'
    @navigator = create :student
    @driver_user_level = create :user_level, user: @driver, level: @level
    @navigator_user_level = create :user_level, user: @navigator, level: @level
    @driver_user_level.navigator_user_levels << @navigator_user_level
  end

  test "best? perfect? finished? and passing? should be able to handle ScriptLevels that have nil as best_result" do
    # these exist in production. example:
    # #<UserLevel id: 28907915, user_id: 852686, level_id: 5,
    # attempts: 0, created_at: "2014-03-10 21:57:19", updated_at:
    # "2014-03-10 21:57:19", best_result: nil>

    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: nil
    )

    refute ul.best?
    refute ul.perfect?
    refute ul.finished?
    refute ul.passing?
  end

  test "best? perfect? finished? and passing? for best result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::BEST_PASS_RESULT
    )

    assert ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely optimal result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MAXIMUM_NONOPTIMAL_RESULT + 1
    )

    refute ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely passing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    refute ul.best?
    refute ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "best? perfect? finished? and passing? for barely finishing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_FINISHED_RESULT
    )

    refute ul.best?
    refute ul.perfect?
    assert ul.finished?
    refute ul.passing?
  end

  test "best? perfect? finished? and passing? for not finishing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_FINISHED_RESULT - 5
    )

    refute ul.best?
    refute ul.perfect?
    refute ul.finished?
    refute ul.passing?
  end

  test "best? perfect? finished? and passing? for free play result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::FREE_PLAY_RESULT
    )

    refute ul.best?
    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "attempted, passed, and perfected scopes for nil result" do
    assert_difference 'UserLevel.count' do
      assert_no_difference 'UserLevel.attempted.count' do
        assert_no_difference 'UserLevel.passing.count' do
          assert_no_difference 'UserLevel.perfect.count' do
            UserLevel.create(
              user: @user,
              level: @level,
              attempts: 0,
              best_result: nil
            )
          end
        end
      end
    end
  end

  test "attempted, passed, and perfected scopes for attempted result" do
    assert_difference 'UserLevel.count' do
      assert_difference 'UserLevel.attempted.count' do
        assert_no_difference 'UserLevel.passing.count' do
          assert_no_difference 'UserLevel.perfect.count' do
            UserLevel.create(
              user: @user,
              level: @level,
              attempts: 0,
              best_result: Activity::MINIMUM_FINISHED_RESULT
            )
          end
        end
      end
    end
  end

  test "attempted, passed, and perfected scopes for passed result" do
    assert_difference 'UserLevel.count' do
      assert_difference 'UserLevel.attempted.count' do
        assert_difference 'UserLevel.passing.count' do
          assert_no_difference 'UserLevel.perfect.count' do
            UserLevel.create(
              user: @user,
              level: @level,
              attempts: 0,
              best_result: Activity::MINIMUM_PASS_RESULT
            )
          end
        end
      end
    end
  end

  test "attempted, passed, and perfected scopes for perfected result" do
    assert_difference 'UserLevel.count' do
      assert_difference 'UserLevel.attempted.count' do
        assert_difference 'UserLevel.passing.count' do
          assert_difference 'UserLevel.perfect.count' do
            UserLevel.create(
              user: @user,
              level: @level,
              attempts: 0,
              best_result: Activity::MAXIMUM_NONOPTIMAL_RESULT + 1
            )
          end
        end
      end
    end
  end

  test "unsubmitting should set best result back to attempted" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      submitted: true,
      best_result: Activity::REVIEW_REJECTED_RESULT
    )
    ul.update! submitted: false
    assert_equal Activity::UNSUBMITTED_RESULT, ul.best_result
  end

  test "driver and navigator user levels" do
    assert_equal [@navigator_user_level],
      @driver_user_level.navigator_user_levels
    assert_equal [@driver_user_level], @navigator_user_level.driver_user_levels
  end

  test "authorized_teacher cant become locked" do
    teacher = create :teacher
    cohort = create :cohort
    teacher.cohorts << cohort

    stage = create(:stage, lockable: true)

    script_level = create :script_level, levels: [@level], stage: stage

    ul_student = UserLevel.create(user: @user, level: @level, submitted: true)
    ul_teacher = UserLevel.create(user: teacher, level: @level, submitted: true)

    assert_equal true, @user.user_level_locked?(script_level, @level)
    assert_equal false, teacher.user_level_locked?(script_level, @level)

    assert_equal true, ul_student.locked?(stage)
    assert_equal false, ul_teacher.locked?(stage)
  end

  test 'most_recent_driver returns nil if no pair programming' do
    UserLevel.create(user: @user, level: @level)
    assert_nil UserLevel.most_recent_driver(nil, @level, @user)
  end

  test 'most_recent_driver returns deleted user if driver is deleted' do
    @driver.destroy
    assert_equal 'deleted user',
      UserLevel.most_recent_driver(nil, @level, @navigator).first
  end

  test 'most_recent_driver returns driver name' do
    assert_equal 'DriverName',
      UserLevel.most_recent_driver(nil, @level, @navigator).first
  end
end
