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
    assert_nil lesson_data['levelData']
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

  test "lessons endpoint includes levelData when lesson has Pythonlab level" do
    pythonlab_level = create(:level, type: 'Pythonlab', name: 'Test Pythonlab')
    create(:script_level, script: @unit, lesson: @lesson1, levels: [pythonlab_level])

    get :lessons, params: {unit_id: @unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    lesson_data = response_data['lessons'].first

    refute_nil lesson_data['levelData']
    assert_equal pythonlab_level.id, lesson_data['levelData']['id']
    assert_equal 'Test Pythonlab', lesson_data['levelData']['name']
    assert_equal pythonlab_level.exemplar_sources, lesson_data['levelData']['exemplarSources']
  end

  test "lessons endpoint uses last Pythonlab level when multiple exist" do
    pythonlab_level1 = create(:level, type: 'Pythonlab', name: 'First Pythonlab')
    pythonlab_level2 = create(:level, type: 'Pythonlab', name: 'Last Pythonlab')
    create(:script_level, script: @unit, lesson: @lesson1, levels: [pythonlab_level1])
    create(:script_level, script: @unit, lesson: @lesson1, levels: [pythonlab_level2])

    get :lessons, params: {unit_id: @unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    lesson_data = response_data['lessons'].first

    assert_equal pythonlab_level2.id, lesson_data['levelData']['id']
    assert_equal 'Last Pythonlab', lesson_data['levelData']['name']
  end
end
