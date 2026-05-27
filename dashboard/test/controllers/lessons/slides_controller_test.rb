require 'test_helper'

class Lessons::SlidesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    # Don't touch the filesystem; #update writes slides.json.
    File.stubs(:write)

    @script = create(:script, name: 'slides-unit-1', is_migrated: true)
    @course = create(:single_unit_course, unit: @script)
    lesson_group = create(:lesson_group, script: @script)
    @lesson = create(
      :lesson,
      lesson_group: lesson_group,
      name: 'slides lesson',
      key: 'slides-lesson',
      has_lesson_plan: true,
    )

    @levelbuilder = create(:levelbuilder)
    @teacher = create(:teacher)
  end

  # ---- access control: every action is levelbuilder-only ----

  test 'generate is forbidden for a non-levelbuilder' do
    sign_in @teacher
    get :generate, params: {id: @lesson.id}
    assert_response :forbidden
  end

  test 'show is forbidden for a non-levelbuilder' do
    sign_in @teacher
    get :show, params: {id: @lesson.id}
    assert_response :forbidden
  end

  test 'edit is forbidden for a non-levelbuilder' do
    sign_in @teacher
    get :edit, params: {id: @lesson.id}
    assert_response :forbidden
  end

  test 'update is forbidden for a non-levelbuilder' do
    sign_in @teacher
    put :update, params: {id: @lesson.id, slides: []}
    assert_response :forbidden
  end

  # (We can't assert the "server not in levelbuilder mode" denial here:
  # the ability grant — like require_levelbuilder_mode_or_test_env —
  # carves out rack_env?(:test), so a levelbuilder is always permitted
  # under test regardless of the levelbuilder_mode flag.)

  # ---- happy path (levelbuilder) ----

  test 'generate renders for a levelbuilder and builds the page payload' do
    sign_in @levelbuilder
    get :generate, params: {id: @lesson.id}
    assert_response :success
    assert_equal @lesson.id, assigns(:lesson_data)[:id]
    assert_includes assigns(:lesson_data).keys, :slidesUrl
    assert_includes assigns(:lesson_data).keys, :editLessonUrl
  end

  test 'show renders the viewer payload' do
    sign_in @levelbuilder
    get :show, params: {id: @lesson.id}
    assert_response :success
    assert_equal @lesson.id, assigns(:slides_data)[:lessonId]
    assert_equal [], assigns(:slides_data)[:slides]
  end

  test 'show suppresses the site footer' do
    sign_in @levelbuilder
    get :show, params: {id: @lesson.id}
    assert @controller.view_options[:no_footer]
  end

  test 'edit renders the editor payload' do
    sign_in @levelbuilder
    get :edit, params: {id: @lesson.id}
    assert_response :success
    assert_equal @lesson.id, assigns(:slides_data)[:lessonId]
  end

  test 'update writes the deck and persists the outline prompt' do
    sign_in @levelbuilder
    slides = [{'key' => 'a', 'description' => 'intro', 'panel' => nil}]
    # Assert the write goes through the lesson's Slides deck.
    Lesson.any_instance.expects(:slides).at_least_once.returns(
      stub(write: nil, read: {'slides' => []}, relative_path: 'config/slides/x')
    )
    put :update, params: {
      id: @lesson.id,
      slides: slides,
      generateSlidesOutline: 'a deck about HTML',
    }
    assert_response :success
    assert_equal 'a deck about HTML', @lesson.reload.generate_slides_outline
  end

  test 'update rejects a missing slides param' do
    sign_in @levelbuilder
    put :update, params: {id: @lesson.id}
    assert_response :bad_request
  end

  # ---- position-based resolution (the /s/:script/lessons/:position twin) ----

  test 'generate resolves the lesson by script + position' do
    sign_in @levelbuilder
    get :generate, params: {
      script_id: @script.name,
      lesson_position: @lesson.relative_position,
    }
    assert_response :success
    assert_equal @lesson.id, assigns(:lesson_data)[:id]
  end
end
