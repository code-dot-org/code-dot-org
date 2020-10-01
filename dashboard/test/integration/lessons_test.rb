require 'test_helper'

class LessonsTest < ActionDispatch::IntegrationTest
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

    @activity = create(
      :lesson_activity,
      lesson: @lesson,
      name: 'my activity',
      duration: 57
    )

    assert_equal @activity, @lesson.lesson_activities.first

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
    activities_data = editable_data['activities']
    assert_equal 1, activities_data.count
    assert_equal 'my activity', activities_data.first['name']
    assert_equal 57, activities_data.first['duration']
  end

  test 'update lesson using data from edit page' do
    sign_in @levelbuilder
    get edit_lesson_path(id: @lesson.id)
    assert_response :success
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    editable_data = lesson_data['editableData']
    editable_data['studentOverview'] = 'new student overview'
    activity_data = editable_data['activities'].first
    activity_data['name'] = 'new activity name'
    activity_data['duration'] = 58

    # This part of the edit/update API is not symmetric, because the update
    # API expects the activities field to be JSON-encoded.
    #
    # We don't want the update API to expect these without JSON-encoding, because
    # we would lose the type information on nested integer values, which would be
    # converted into strings by ActionController::Parameters. For example, see:
    # https://stackoverflow.com/questions/59124523/actioncontrollerparameters-converts-integer-to-string
    #
    # To attain symmetry, the edit API could send JSON-encoded activities, but
    # then the client would still have to JSON.parse before making any edits and
    # then re-encoding them with JSON.stringify, which doesn't seem good either.
    editable_data['activities'] = editable_data['activities'].to_json

    # Make sure the update api accepts the data in the same format as
    # the data in the edit response.
    patch lesson_path(id: @lesson.id, as: :json, params: editable_data)
    assert_response :redirect
    @lesson.reload
    assert_equal 'lesson overview', @lesson.overview
    assert_equal 'new student overview', @lesson.student_overview
    @activity.reload
    assert_equal 'new activity name', @activity.name
    assert_equal 58, @activity.duration
  end
end
