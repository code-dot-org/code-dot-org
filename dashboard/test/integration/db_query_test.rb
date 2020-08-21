require 'test_helper'

# Prevent regressions in the number of database queries on high-traffic routes.
class DBQueryTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test 'course overview page' do
    student = create :student

    unit_group = create :unit_group, name: 'my-unit-group', properties: {has_numbered_units: true}
    script = create :script, name: 'my-unit'
    create :unit_group_unit, unit_group: unit_group, script: script, position: 1

    unit_group = UnitGroup.get_from_cache(unit_group.name)

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'course' => {
          'name' => {
            'my-unit-group' => {
              'title' => 'My Unit Group',
            }
          }
        },
        'script' => {
          'name' => {
            'my-unit' => {
              'title' => 'My Unit'
            }
          }
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    summary = nil
    assert_cached_queries(0) do
      summary = unit_group.summarize
    end
    assert_equal 'Unit 1 - My Unit', summary[:scripts].first[:title]

    assert_cached_queries(5) do
      unit_group.summarize(student)
    end

    sign_in student
    assert_cached_queries(11) do
      get course_path(unit_group)
    end
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
      get script_stage_script_level_path(
        script_id: script.name,
        stage_position: 1,
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
      stage_position: 1,
      level_position: 1,
      level: level.id
    )

    assert_cached_queries(7) do
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

    assert_cached_queries(6) do
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

    assert_cached_queries(6) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end
end
