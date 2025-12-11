require 'test_helper'

class StudentSnapshotsControllerTest < ActionController::TestCase
  setup do
    sign_in(create(:teacher))
    @unit = create(:unit, name: 'test-unit')
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson1 = create(:lesson,
      script: @unit,
      lesson_group: @lesson_group,
      name: 'Test Lesson 1',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 1
    )
    @lesson2 = create(:lesson,
      script: @unit,
      lesson_group: @lesson_group,
      name: 'Test Lesson 2',
      has_lesson_plan: false,
      lockable: true,
      relative_position: 2
    )
  end

  test "lessons endpoint returns correct format with unit_id" do
    get :lessons, params: {unit_id: @unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    lessons_data = response_data['lessons']
    assert_equal 2, lessons_data.length

    lesson_data = lessons_data.first
    assert_equal @lesson1.id, lesson_data['id'].to_i
    assert_equal 'Test Lesson 1', lesson_data['name']
    assert_equal true, lesson_data['hasLessonPlan']
    assert_equal false, lesson_data['isLockable']
    assert_equal 1, lesson_data['position']
  end

  test "lessons endpoint returns error for invalid unit_id" do
    get :lessons, params: {unit_id: 99999}

    assert_response :bad_request

    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Unit id=99999"
  end

  test "lessons endpoint returns empty array for unit with no lessons" do
    empty_unit = create(:unit, name: 'empty-unit')
    get :lessons, params: {unit_id: empty_unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    assert_equal [], response_data['lessons']
    assert_equal false, response_data['hasUnnumberedLessons']
  end

  test "cfu_levels endpoint returns CFU levels from lesson" do
    # Create levels
    cfu_level = create(:level, name: 'CFU Level 1', type: 'Multi')
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')

    # Create script levels with progression attribute
    cfu_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding')
    cfu_script_level.levels << cfu_level
    regular_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice')
    regular_script_level.levels << regular_level

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 1, cfu_levels.length
    cfu_data = cfu_levels.first
    assert_equal cfu_level.id, cfu_data['id']
    assert_equal 'CFU Level 1', cfu_data['name']
    assert_equal 'CFU Level 1', cfu_data['display_name']
    assert_equal 'Multi', cfu_data['type']
    assert_equal cfu_script_level.id, cfu_data['script_level_id']
    assert_equal 'Check Your Understanding', cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
  end

  test "cfu_levels endpoint matches both Check Your Understanding and Check For Understanding" do
    # Test both progression variants
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    script_level1 = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding')
    script_level1.levels << cfu_level1
    script_level2 = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check For Understanding')
    script_level2.levels << cfu_level2

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint returns empty array when no CFU levels exist" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice')
    script_level.levels << regular_level

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns empty array when script_level has no progression" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: nil)
    script_level.levels << regular_level

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns error for invalid lesson_id" do
    get :cfu_levels, params: {lesson_id: 99999}

    assert_response :bad_request
    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Lesson id=99999"
  end

  test "cfu_levels endpoint handles multiple levels in a script_level" do
    # Create multiple levels for the same script_level
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding')
    script_level.levels << cfu_level1
    script_level.levels << cfu_level2

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint includes all required fields" do
    cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: 'CFU Display Name')
    script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding')
    script_level.levels << cfu_level

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    refute_nil cfu_data['id']
    refute_nil cfu_data['name']
    refute_nil cfu_data['display_name']
    refute_nil cfu_data['type']
    refute_nil cfu_data['script_level_id']
    refute_nil cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
    assert_equal 'CFU Display Name', cfu_data['display_name']
  end

  test "cfu_levels endpoint uses level name as display_name when display_name is nil" do
    cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: nil)
    script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding')
    script_level.levels << cfu_level

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    assert_equal 'CFU Level', cfu_data['display_name']
  end
end
