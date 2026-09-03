require 'test_helper'

class Lessons::TutorGalleryDataControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # The lesson tutor (and its gallery) is scoped to AIF/AID student
    # courses, same restriction as LessonsController#tutor_gallery.
    @ai_script = create(:script, name: 'gallery-data-ai-unit-1')
    @ai_course = create(:single_unit_course, :with_course_offering, unit: @ai_script)
    @ai_course.course_version.course_offering.update!(marketing_initiative: 'AIF')
    ai_lesson_group = create(:lesson_group, script: @ai_script)
    @ai_lesson = create(:lesson, lesson_group: ai_lesson_group, has_lesson_plan: true)

    @script = create(:script, name: 'gallery-data-unit-1')
    @course = create(:single_unit_course, unit: @script)
    lesson_group = create(:lesson_group, script: @script)
    @lesson = create(:lesson, lesson_group: lesson_group, has_lesson_plan: true)

    @teacher = create(:teacher)
    create(:section, user: @teacher, script: @ai_script)
  end

  test 'signed out user is redirected to sign in' do
    get :show, params: {
      course_course_name: @ai_course.name,
      unit_position: 1,
      lesson_position: @ai_lesson.relative_position,
    }
    assert_response :redirect
  end

  test 'signed in teacher gets the gallery bootstrap payload as JSON' do
    sign_in @teacher
    get :show, params: {
      course_course_name: @ai_course.name,
      unit_position: 1,
      lesson_position: @ai_lesson.relative_position,
    }
    assert_response :success

    payload = JSON.parse(response.body)
    assert_equal %w[currentUnitId units sections], payload.keys
    assert_equal @ai_script.id, payload['currentUnitId']
    assert(payload['units'].all? {|unit| unit.key?('link')})
  end

  test 'resolves the lesson by script + position, the /s/ URL twin' do
    sign_in @teacher
    get :show, params: {
      script_id: @ai_script.name,
      lesson_position: @ai_lesson.relative_position,
    }
    assert_response :success
    assert_equal @ai_script.id, JSON.parse(response.body)['currentUnitId']
  end

  test 'lesson outside an AIF/AID course is not found' do
    sign_in @teacher
    get :show, params: {
      course_course_name: @course.name,
      unit_position: 1,
      lesson_position: @lesson.relative_position,
    }
    assert_response :not_found
  end
end
