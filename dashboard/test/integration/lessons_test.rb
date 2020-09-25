require 'test_helper'

class LessonsTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    @lesson = create(
      :lesson,
      name: 'lesson display name',
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )

    @levelbuilder = create :levelbuilder
  end

  test 'lesson show page contains expected data' do
    get lesson_path(id: @lesson.id)
    assert_response :success
    assert_select 'script[data-lesson]', 1
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    assert_equal 'lesson overview', lesson_data['overview']
  end

  test 'lesson edit page contains expected data' do
    sign_in @levelbuilder
    get edit_lesson_path(id: @lesson.id)
    assert_response :success
    assert_select 'script[data-lesson]', 1
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    editable_data = lesson_data['editableData']
    assert_equal 'lesson overview', editable_data['overview']
    assert_equal 'student overview', editable_data['studentOverview']
  end

  test 'update lesson using data from edit page' do
    sign_in @levelbuilder
    get edit_lesson_path(id: @lesson.id)
    assert_response :success
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    editable_data = lesson_data['editableData']
    editable_data['studentOverview'] = 'new student overview'

    # Make sure the update api accepts the data in the same format as
    # the data in the edit response.
    patch lesson_path(id: @lesson.id, as: :json, params: editable_data)
    @lesson.reload
    assert_equal 'lesson overview', @lesson.overview
    assert_equal 'new student overview', @lesson.student_overview
  end
end
