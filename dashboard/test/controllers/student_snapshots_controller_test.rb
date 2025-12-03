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
end
