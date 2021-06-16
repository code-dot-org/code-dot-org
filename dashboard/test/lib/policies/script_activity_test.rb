require 'test_helper'

class Policies::ScriptActivityTest < ActiveSupport::TestCase
  setup_all do
    @user = create :user
    @unit = create :script
    @lesson_group = create :lesson_group, script: @script
    @lesson = create :lesson, script: @script, lesson_group: @lesson_group
    @script_level = create(
      :script_level,
      script: @script,
      lesson: @lesson,
      levels: [
        create(:maze, name: 'ScriptActivity test level 1'),
        create(:maze, name: 'ScriptActivity test level 2')
      ],
      properties: {'ScriptActivity test level 2': {'active': false}}
    )
    create :user_script, user: @user, script: @script
  end

  test 'script with inactive level completed is completed' do
    UserLevel.create(
      user: @user,
      level: @script_level.levels[1],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert Policies::ScriptActivity.completed?(@user, @script)
  end

  test 'script with active level completed is completed' do
    UserLevel.create(
      user: @user,
      level: @script_level.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    assert Policies::ScriptActivity.completed?(@user, @script)
  end

  test 'user has completed script' do
    user_script = create :user_script,
      user: @user,
      started_at: (Time.now - 10.days),
      completed_at: (Time.now - 4.days)

    assert Policies::ScriptActivity.completed?(@user, user_script.script)
  end

  test 'user has completed script but no completed_at' do
    # We have some users in our system who have completed all levels but don't
    # have completed_at set. This test exercises this case by not setting
    # completed_at, but because the script has no levels there is no next level
    # for the user to go to, and so completed? succeeds using a fallback code
    # path.
    user_script = create :user_script,
      user: @user,
      started_at: (Time.now - 10.days),
      last_progress_at: (Time.now - 4.days)

    assert user_script.completed_at.nil?
    assert Policies::ScriptActivity.completed?(@user, user_script.script)
  end

  test 'completed is false when user has no progress' do
    refute Policies::ScriptActivity.completed?(@user, @script)
  end
end
