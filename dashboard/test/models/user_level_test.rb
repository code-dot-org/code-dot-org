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

  test "by_stage" do
    script = create :script
    stage = create :lesson, script: script
    script_level = create :script_level, script: script, lesson: stage
    level = script_level.levels.first

    stage_user_level = create :user_level, script: script, level: level
    other_user_level = create :user_level

    assert_includes UserLevel.by_stage(stage), stage_user_level
    refute_includes UserLevel.by_stage(stage), other_user_level
  end

  test "by_stage will find all levels for each script_level" do
    script = create :script
    stage = create :lesson, script: script
    first_level = create :level
    second_level = create :level
    create :script_level,
      script: script,
      lesson: stage,
      levels: [
        first_level,
        second_level
      ]

    assert_equal UserLevel.by_stage(stage), []

    first_user_level = create :user_level, script: script, level: first_level

    assert_equal UserLevel.by_stage(stage), [first_user_level]

    second_user_level = create :user_level, script: script, level: second_level

    assert_equal UserLevel.by_stage(stage), [first_user_level, second_user_level]
  end

  test "perfect? finished? and passing? should be able to handle ScriptLevels that have nil as best_result" do
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

    refute ul.perfect?
    refute ul.finished?
    refute ul.passing?
  end

  test "perfect? finished? and passing? for best result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::BEST_PASS_RESULT
    )

    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "perfect? finished? and passing? for barely optimal result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MAXIMUM_NONOPTIMAL_RESULT + 1
    )

    assert ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "perfect? finished? and passing? for barely passing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    refute ul.perfect?
    assert ul.finished?
    assert ul.passing?
  end

  test "perfect? finished? and passing? for barely finishing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_FINISHED_RESULT
    )

    refute ul.perfect?
    assert ul.finished?
    refute ul.passing?
  end

  test "perfect? finished? and passing? for not finishing result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::MINIMUM_FINISHED_RESULT - 5
    )

    refute ul.perfect?
    refute ul.finished?
    refute ul.passing?
  end

  test "perfect? finished? and passing? for free play result" do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      attempts: 0,
      best_result: Activity::FREE_PLAY_RESULT
    )

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

  test 'unsubmitting destroys unclaimed peer reviews' do
    level = create(:free_response, peer_reviewable: true)
    script = create :script
    level_source = create :level_source

    ul = UserLevel.create(
      user: @user,
      level: level,
      script: script,
      level_source: level_source,
      attempts: 0,
      submitted: true,
      best_result: Activity::UNREVIEWED_SUBMISSION_RESULT
    )

    review_1 = create(:peer_review, submitter: @user, reviewer: (create :teacher), level: level, script: script)
    review_2 = create(:peer_review, submitter: @user, reviewer: nil, level: level, script: script)

    ul.update! submitted: false
    assert_equal Activity::UNSUBMITTED_RESULT, ul.best_result

    assert PeerReview.exists?(review_1.id)
    refute PeerReview.exists?(review_2.id)
  end

  test 'other changes do not destroy unclaimed peer reviews' do
    level = create(:free_response, peer_reviewable: true)
    script = create :script
    level_source = create :level_source

    ul = UserLevel.create(
      user: @user,
      level: level,
      script: script,
      level_source: level_source,
      attempts: 0,
      submitted: true,
      best_result: Activity::UNREVIEWED_SUBMISSION_RESULT
    )

    review_1 = create(:peer_review, submitter: @user, reviewer: (create :teacher), level: level, script: script)
    review_2 = create(:peer_review, submitter: @user, reviewer: nil, level: level, script: script)

    ul.update! best_result: Activity::REVIEW_ACCEPTED_RESULT
    assert_equal Activity::REVIEW_ACCEPTED_RESULT, ul.best_result

    assert PeerReview.exists?(review_1.id)
    assert PeerReview.exists?(review_2.id)
  end

  test "driver and navigator user levels" do
    assert_equal [@navigator_user_level],
      @driver_user_level.navigator_user_levels
    assert_equal [@driver_user_level], @navigator_user_level.driver_user_levels
  end

  test "virtual attribute `locked` sets `unlocked_at`" do
    ul = UserLevel.create(user: @user, level: @level, locked: false)
    assert_not_nil ul.send(:unlocked_at)
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

  test 'count passed levels for users' do
    students = (0...3).map do |n|
      create :student, :with_puzzles, num_puzzles: 10 - n
    end

    passing_level_counts = UserLevel.count_passed_levels_for_users(User.where(id: students.map(&:id)))
    assert_equal(
      {
        students[0].id => 10,
        students[1].id => 9,
        students[2].id => 8,
      },
      passing_level_counts
    )
  end

  test 'calculate_total_time_spent returns 0 if no time_spent recorded' do
    ul = UserLevel.create(
      user: @user,
      level: @level
    )

    assert_equal 0, ul.calculate_total_time_spent(nil)
  end

  test 'calculate_total_time_spent returns time_spent additional_time recorded' do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      time_spent: 2000
    )

    assert_equal 2000, ul.calculate_total_time_spent(nil)
  end

  test 'calculate_total_time_spent returns the sum of time_spent and additional_time' do
    ul = UserLevel.create(
      user: @user,
      level: @level,
      time_spent: 2000
    )

    assert_equal 4000, ul.calculate_total_time_spent(2000)
  end
end
