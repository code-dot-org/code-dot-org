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
    script = Script.find_by_name('dance')
    stage = create :stage, script: script, relative_position: 1
    create :script_level, script: script, stage: stage
    create :script_level, script: script, stage: stage, position: 12
    create :script_level, script: script, stage: stage, position: 13

    get '/s/dance/stage/1/puzzle/1'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/s/dance/stage/1/puzzle/12'
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
    assert_nil cookies['_learn_session_test']

    get '/s/dance/stage/1/puzzle/13'
    assert_caching_disabled response.headers['Cache-Control']
    assert_not_nil cookies['_learn_session_test']
  end
end
