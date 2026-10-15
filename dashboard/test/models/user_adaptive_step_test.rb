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
end
