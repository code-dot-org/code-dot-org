require 'test_helper'

# Prevent regressions in the number of database queries on high-traffic routes.
class DBQueryTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test "script level show" do
    student = create :student
    sign_in student

    script = Script.get_from_cache('allthethings')
    stage = script.lessons.first
    level = stage.script_levels.first.levels.first

    create :user_level,
      user: student,
      script: script,
      level: level,
      level_source: create(:level_source, level: level)

    assert_cached_queries(13) do
      get script_lesson_script_level_path(
        script_id: script.name,
        lesson_position: 1,
        id: 1
      )
      assert_response :success
    end
  end

  test "user progress" do
    student = create :student
    sign_in student

    script = Script.hoc_2014_script
    stage = script.lessons.first
    level = stage.script_levels.first.levels.first

    create :user_level,
      user: student,
      script: script,
      level: level,
      level_source: create(:level_source, level: level)

    user_progress_path = user_progress_for_stage_and_level_path(
      script: script.name,
      lesson_position: 1,
      level_position: 1,
      level: level.id
    )

    assert_cached_queries(10) do
      get user_progress_path,
        headers: {'HTTP_USER_AGENT': 'test'}
      assert_response :success
    end
  end

  test "post milestone to course1 passing" do
    student = create :student
    sign_in student

    sl = Script.find_by_name('course1').script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    assert_cached_queries(7) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end

  test "post milestone to course1 not passing" do
    student = create :student
    sign_in student

    sl = Script.find_by_name('course1').script_levels[2]
    params = {program: 'fake program', testResult: 0, result: 'false'}

    assert_cached_queries(7) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end
end
