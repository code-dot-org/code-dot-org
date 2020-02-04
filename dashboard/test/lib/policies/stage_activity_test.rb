require 'test_helper'

class Policies::StageActivityTest < ActiveSupport::TestCase
  setup_all do
    @user_1 = create :user
    @user_2 = create :user
    @user_3 = create :user
    @user_4 = create :user
    @script = create :script
    @stage = create :stage
    @script_level_1 = create(
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
    @section = create(:section, user: create(:teacher))
    create(:follower, section: @section, student_user: @user_1)
    create(:follower, section: @section, student_user: @user_2)
    create(:follower, section: @section, student_user: @user_3)
    create(:follower, section: @section, student_user: @user_4)
  end

  def complete_stage(student)
    UserLevel.create(
      user: student,
      level: @script_level_1.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    UserLevel.create(
      user: student,
      level: @script_level_2.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
  end

  test 'stage is incomplete for a user if no levels within stage are complete' do
    refute Policies::StageActivity.completed_by_user?(@user_1, @stage)
  end

  test 'stage is incomplete for a user if less than 60% of levels within stage are complete' do
    UserLevel.create(
      user: @user_1,
      level: @script_level_1.levels[0],
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )
    refute Policies::StageActivity.completed_by_user?(@user_1, @stage)
  end

  test 'stage is complete for a user if more than 60% of levels within stage are complete' do
    complete_stage(@user_1)
    assert Policies::StageActivity.completed_by_user?(@user_1, @stage)
  end

  test 'stage is incomplete for a section if none of the students have completed the stage' do
    refute Policies::StageActivity.completed_by_section?(@section, @stage)
  end

  test 'stage is incomplete for a section if less than 80% of students have completed the stage' do
    complete_stage(@user_1)
    complete_stage(@user_2)
    refute Policies::StageActivity.completed_by_section?(@section, @stage)
  end

  test 'stage is complete for a section if at least 80% of students have completed the stage' do
    students = [@user_1, @user_2, @user_3, @user_4]
    students.each do |student|
      complete_stage(student)
    end
    assert Policies::StageActivity.completed_by_section?(@section, @stage)
  end
end
