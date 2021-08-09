require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  # Ensure view-only wildcard routes are generated correctly.
  def test_api_routes
    assert_recognizes({controller: 'api', action: 'hoc_courses'}, '/api/hoc_courses')
  end

  def test_section_student_script_ids_routes
    assert_recognizes({controller: 'api/v1/sections', action: 'student_script_ids', id: '3'}, '/dashboardapi/sections/3/student_script_ids')
  end

  def test_dance_session_cookie_and_cache_headers
    script = create :script, name: 'dance'
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, relative_position: 1, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson
    create :script_level, script: script, lesson: lesson, position: 12
    create :script_level, script: script, lesson: lesson, position: 13

    get '/s/dance/lessons/1/levels/1'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/s/dance/lessons/1/levels/12'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/s/dance/lessons/1/levels/13'
    assert_caching_disabled response.headers['Cache-Control']
    assert_not_nil cookies['_learn_session_test']
  end

  def test_level_starter_assets_handles_periods
    assert_generates('level_starter_assets/level_name.with.periods', {controller: 'level_starter_assets', action: 'show', level_name: 'level_name.with.periods'})
    assert_generates('level_starter_assets/level_name_no_periods', {controller: 'level_starter_assets', action: 'show', level_name: 'level_name_no_periods'})
  end
end
