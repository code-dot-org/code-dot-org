require 'test_helper'

class LessonsTest < ActionDispatch::IntegrationTest
  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @script = create :script, name: 'unit-1', is_migrated: true
    lesson_group = create :lesson_group, script: @script
    @lesson = create(
      :lesson,
      script_id: @script.id,
      lesson_group: lesson_group,
      name: 'lesson display name',
      relative_position: 1,
      absolute_position: 1,
      has_lesson_plan: true,
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )
    standard = create :standard, description: 'Standard Description'
    @lesson.standards = [standard]
    standard = create :standard, description: 'Opportunity Standard Description'
    @lesson.opportunity_standards = [standard]

    @lesson2 = create(
      :lesson,
      script_id: @script.id,
      lesson_group: lesson_group,
      name: 'second lesson',
      relative_position: 2,
      absolute_position: 2,
      has_lesson_plan: true
    )

    @activity = create(
      :lesson_activity,
      lesson: @lesson,
      name: 'my activity',
      duration: 57
    )
    assert_equal @activity, @lesson.lesson_activities.first

    @activity_section = create(
      :activity_section,
      lesson_activity: @activity,
      position: 1,
      name: 'activity section name',
      remarks: false,
      description: 'activity section description',
      tips: []
    )
    assert_equal @activity_section, @activity.activity_sections.first

    @level = create :maze
    @script_level = create(
      :script_level,
      activity_section: @activity_section,
      activity_section_position: 1,
      chapter: 1,
      position: 1,
      lesson: @lesson,
      script: @lesson.script,
      levels: [@level],
      challenge: true
    )
    assert_equal @script_level, @activity_section.script_levels.first

    @levelbuilder = create :levelbuilder
  end

  test 'lesson show page contains expected data' do
    get script_lesson_path(@lesson.script, @lesson)
    assert_response :success
    assert_select 'script[data-lesson]', 1
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    assert_equal 'lesson overview', lesson_data['overview']
    assert_equal '/s/unit-1', lesson_data['unit']['link']
    assert_equal script_lesson_path(@lesson.script, @lesson), lesson_data['unit']['lessonGroups'][0]['lessons'][0]['link']
    assert_equal script_lesson_path(@lesson2.script, @lesson2), lesson_data['unit']['lessonGroups'][0]['lessons'][1]['link']
    assert_equal 'Standard Description', lesson_data['standards'][0]['description']
    assert_equal 'Opportunity Standard Description', lesson_data['opportunityStandards'][0]['description']
  end

  test 'lesson edit page contains expected data' do
    sign_in @levelbuilder
    get edit_lesson_path(id: @lesson.id)
    assert_response :success
    assert_select 'script[data-lesson]', 1
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    assert_equal 'lesson overview', lesson_data['overview']
    assert_equal 'student overview', lesson_data['studentOverview']

    activities_data = lesson_data['activities']
    assert_equal 1, activities_data.count
    activity_data = activities_data.first
    assert_equal 'my activity', activity_data['name']
    assert_equal 57, activity_data['duration']

    assert_equal 1, activity_data['activitySections'].count
    activity_section_data = activity_data['activitySections'].first
    assert_equal 'activity section name', activity_section_data['name']
    # assigning a serialized_attribute to false sets the value to nil
    assert_nil activity_section_data['remarks']

    assert_equal 1, activity_section_data['scriptLevels'].count
    script_level_data = activity_section_data['scriptLevels'].first
    assert script_level_data['challenge']
    refute script_level_data['assessment']
    refute script_level_data['bonus']
    assert_equal @level.id.to_s, script_level_data['activeId']
    assert_equal 1, script_level_data['levels'].count
    level_data = script_level_data['levels'].first
    assert_equal @level.name, level_data['name']
    assert_equal @level.id.to_s, level_data['id']
  end

  test 'update lesson using data from edit page' do
    sign_in @levelbuilder
    get edit_lesson_path(id: @lesson.id)
    assert_response :success
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    lesson_data['name'] = 'new lesson name'
    lesson_data['studentOverview'] = 'new student overview'

    activity_data = lesson_data['activities'].first
    activity_data['name'] = 'new activity name'
    activity_data['duration'] = 58

    activity_section_data = activity_data['activitySections'].first
    activity_section_data['name'] = 'new activity section name'
    activity_section_data['remarks'] = true

    script_level_data = activity_section_data['scriptLevels'].first
    script_level_data['assessment'] = true
    script_level_data['challenge'] = false

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
    lesson_data['activities'] = lesson_data['activities'].to_json

    # Make sure the update api accepts the data in the same format as
    # the data in the edit response.
    patch lesson_path(id: @lesson.id, as: :json, params: lesson_data)
    @lesson.reload
    assert_equal 'new lesson name', @lesson.name
    assert_equal 'lesson overview', @lesson.overview
    assert_equal 'new student overview', @lesson.student_overview

    @activity.reload
    assert_equal 'new activity name', @activity.name
    assert_equal 58, @activity.duration

    @activity_section.reload
    assert_equal 'new activity section name', @activity_section.name
    assert_equal true, @activity_section.remarks
    assert_equal [@script_level], @activity_section.script_levels

    @script_level.reload
    assert @script_level.assessment
    assert_equal nil, @script_level.bonus
    refute @script_level.challenge
    assert_equal 1, @script_level.levels.count
    assert_equal [@level], @script_level.levels.all
  end
end
