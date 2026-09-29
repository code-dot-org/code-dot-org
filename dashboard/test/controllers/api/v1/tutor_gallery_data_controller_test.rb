require 'test_helper'

class Api::V1::TutorGalleryDataControllerTest < ActionController::TestCase
  setup do
    # Script#lesson_tutor_available? requires an AIF/AID marketing initiative.
    @ai_script = create(:script, name: 'ai-unit-1')
    @ai_course = create(:single_unit_course, :with_course_offering, unit: @ai_script)
    @ai_course.course_version.course_offering.update!(marketing_initiative: 'AIF')
    lesson_group = create(:lesson_group, script: @ai_script)
    @ai_lesson = create(:lesson, lesson_group: lesson_group, name: 'ai lesson display name', has_lesson_plan: true)

    @non_ai_script = create(:script, name: 'unit-1')
    @non_ai_course = create(:single_unit_course, unit: @non_ai_script)
    non_ai_lesson_group = create(:lesson_group, script: @non_ai_script)
    @non_ai_lesson = create(:lesson, lesson_group: non_ai_lesson_group, name: 'lesson display name', has_lesson_plan: true)

    @teacher = create(:teacher)
    @section = create(:section, user: @teacher, script: @ai_script)
  end

  test 'signed out user is redirected to sign in' do
    get :show, params: {script_id: @ai_script.name, lesson_position: @ai_lesson.relative_position}
    assert_response :redirect
  end

  test 'unknown script returns 404' do
    sign_in @teacher
    get :show, params: {script_id: 'no-such-script', lesson_position: 1}
    assert_response :not_found
  end

  test 'lesson without tutor gallery available returns 404' do
    sign_in @teacher
    get :show, params: {script_id: @non_ai_script.name, lesson_position: @non_ai_lesson.relative_position}
    assert_response :not_found
  end

  test 'unknown lesson position returns 404' do
    sign_in @teacher
    get :show, params: {script_id: @ai_script.name, lesson_position: 999}
    assert_response :not_found
  end

  test 'returns the tutor gallery bootstrap payload for a teacher with sections' do
    sign_in @teacher
    get :show, params: {script_id: @ai_script.name, lesson_position: @ai_lesson.relative_position}
    assert_response :success

    assert_equal(
      {
        'currentUnitId' => @ai_script.id,
        'units' => [
          {'id' => @ai_script.id, 'name' => @ai_script.localized_title, 'position' => 1, 'link' => @ai_script.link},
        ],
        'sections' => [{'id' => @section.id, 'name' => @section.name}],
      },
      json_response
    )
  end

  test 'sections reflect the signed-in user, not other teachers' do
    other_teacher = create(:teacher)
    create(:section, user: other_teacher, script: @ai_script)

    sign_in @teacher
    get :show, params: {script_id: @ai_script.name, lesson_position: @ai_lesson.relative_position}

    assert_equal [{'id' => @section.id, 'name' => @section.name}], json_response['sections']
  end
end
