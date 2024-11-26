require 'test_helper'

class RubricsTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  setup do
    @teacher = create :authorized_teacher
    sign_in @teacher

    @unit = create :script, :with_levels, lessons_count: 4, name: 'test-unit'
    @first_script_level = @unit.script_levels.first
    @rubric = create :rubric, :with_learning_goals, lesson: @first_script_level.lesson, level: @first_script_level.levels.first
    @last_script_level = @unit.script_levels.last
    create :rubric, lesson: @last_script_level.lesson, level: @last_script_level.levels.first
  end

  test 'canShowTaScoresAlert is true by default' do
    get build_script_level_path(@first_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']
  end

  test 'canShowTaScoresAlert is false after teacher submits feedback' do
    learning_goal = create :learning_goal_teacher_evaluation, learning_goal: @rubric.learning_goals.first, teacher: @teacher, understanding: nil

    # ignore learning goal without understanding
    get build_script_level_path(@last_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']

    learning_goal.update!(understanding: 1)

    # can show alert after understanding is set
    get build_script_level_path(@last_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']
  end

  test 'set_seen_ta_scores sets canShowTaScoresAlert to false' do
    get build_script_level_path(@first_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']

    post '/api/v1/users/set_seen_ta_scores', params: {lesson_id: @first_script_level.lesson.id}
    assert_response :success

    # can no longer show alert for this lesson
    get build_script_level_path(@first_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']

    # can still show alert for other lessons
    refute_equal @last_script_level.lesson, @first_script_level.lesson
    get build_script_level_path(@last_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    assert rubric_data['canShowTaScoresAlert']
  end

  test 'canShowTaScoresAlert is always false once seen max times' do
    (1..3).each do |i|
      post '/api/v1/users/set_seen_ta_scores', params: {lesson_id: @unit.lessons[i].id}
      assert_response :success
    end

    # cannot show alert for other lessons in same unit
    get build_script_level_path(@last_script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']

    # cannot show alert for lessons in other unit
    unit = create :script, :with_levels, name: 'test-unit-2'
    script_level = unit.script_levels.first
    create :rubric, lesson: script_level.lesson, level: script_level.levels.first
    get build_script_level_path(script_level)
    assert_response :success
    rubric_data = JSON.parse(css_select('script[data-rubricdata]').first.attribute('data-rubricdata').to_s)
    refute rubric_data['canShowTaScoresAlert']
  end
end
