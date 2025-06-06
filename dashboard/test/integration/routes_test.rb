require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  # Ensure view-only wildcard routes are generated correctly.
  def test_dance_session_cookie_and_cache_headers
    script = create :script, name: 'dance-ai-2023'
    unit_group = create(:unit_group, name: 'dance-ai-2023', published_state: 'stable')
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1
    CourseOffering.add_course_offering(unit_group)

    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, relative_position: 1, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson
    create :script_level, script: script, lesson: lesson, position: 9
    create :script_level, script: script, lesson: lesson, position: 10

    get '/courses/dance-ai-2023/units/1/lessons/1/levels/1'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/courses/dance-ai-2023/units/1/lessons/1/levels/9'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/courses/dance-ai-2023/units/1/lessons/1/levels/10'
    assert_caching_disabled response.headers['Cache-Control']
    refute_nil cookies['_learn_session_test']
  end

  def test_level_starter_assets_handles_periods
    assert_generates('level_starter_assets/level_name.with.periods', {controller: 'level_starter_assets', action: 'show', level_name: 'level_name.with.periods'})
    assert_generates('level_starter_assets/level_name_no_periods', {controller: 'level_starter_assets', action: 'show', level_name: 'level_name_no_periods'})
  end
end
