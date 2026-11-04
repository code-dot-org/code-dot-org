require 'test_helper'

class UserAdaptiveStepTest < ActiveSupport::TestCase
  setup do
    @user_level = create(:user_level)
  end

  test "requires a step id" do
    refute UserAdaptiveStep.new(user_level: @user_level).valid?
  end

  test "refuses a second row for the same user level and step" do
    UserAdaptiveStep.create!(user_level: @user_level, step_id: 'intro')

    assert_raises(ActiveRecord::RecordNotUnique) do
      UserAdaptiveStep.create!(user_level: @user_level, step_id: 'intro')
    end
  end

  test "user level lists its steps" do
    intro = UserAdaptiveStep.create!(user_level: @user_level, step_id: 'intro', progress: {'startedAt' => '2026-10-08T17:00:00Z'})
    quiz = UserAdaptiveStep.create!(user_level: @user_level, step_id: 'quiz')

    assert_equal [intro, quiz].to_set, @user_level.user_adaptive_steps.to_set
    assert_equal '2026-10-08T17:00:00Z', intro.reload.progress['startedAt']
  end

  test "validation attempts append in order and only the last are kept" do
    row = UserAdaptiveStep.create!(user_level: @user_level, step_id: 'build')
    (UserAdaptiveStep::MAX_VALIDATION_ATTEMPTS + 2).times do |i|
      row.record_validation!({'pass' => false, 'evidenceLevel' => 0, 'reason' => "Try #{i}"})
    end

    history = row.reload.validation_history
    assert_equal UserAdaptiveStep::MAX_VALIDATION_ATTEMPTS, history.length
    assert_equal 'Try 2', history.first['reason']
    assert_equal "Try #{UserAdaptiveStep::MAX_VALIDATION_ATTEMPTS + 1}", history.last['reason']
  end

  test "soft-deleting the user level deletes its steps" do
    UserAdaptiveStep.create!(user_level: @user_level, step_id: 'intro')

    @user_level.destroy

    assert UserLevel.with_deleted.find(@user_level.id).deleted?
    assert_empty UserAdaptiveStep.where(user_level_id: @user_level.id)
  end
end
