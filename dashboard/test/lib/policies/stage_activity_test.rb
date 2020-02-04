require 'test_helper'

class Policies::StageActivityTest < ActiveSupport::TestCase
  setup_all do
    @user = create :user
    @script = create :script
    @stage = create :stage
    @script_level = create(
      :script_level,
      script: @script,
      stage: @stage,
      levels: [
        create(:maze, name: 'ScriptActivity test level 1')
      ]
    )
    @script_level_2 = create(
      :script_level,
      script: @script,
      stage: @stage,
      levels: [
        create(:maze, name: 'ScriptActivity test level 2')
      ]
    )
    @script_level_3 = create(
      :script_level,
      script: @script,
      stage: @stage,
      levels: [
        create(:maze, name: 'ScriptActivity test level 3')
      ]
    )
  end

  test 'stage is incomplete for a user if no levels within stage are complete' do
    refute Policies::StageActivity.completed_by_user?(@user, @stage)
  end

  test 'stage is incomplete for a user if less than 60% of levels within stage are complete' do
    UserLevel.create(
      user: @user,
      level: @script_level.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    refute Policies::StageActivity.completed_by_user?(@user, @stage)
  end

  test 'stage is complete for a user if more than 60% of levels within stage are complete' do
    UserLevel.create(
      user: @user,
      level: @script_level.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    UserLevel.create(
      user: @user,
      level: @script_level_2.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    assert Policies::StageActivity.completed_by_user?(@user, @stage)
  end
end
