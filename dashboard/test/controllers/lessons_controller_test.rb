require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    @script = create :script, name: 'unit-1'
    lesson_group = create :lesson_group, script: @script
    @lesson = create(
      :lesson,
      script_id: @script.id,
      lesson_group: lesson_group,
      name: 'lesson display name',
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )

    @lesson2 = create(
      :lesson,
      script_id: @script.id,
      lesson_group: lesson_group,
      name: 'second lesson'
    )

    @script_title = 'Script Display Name'
    @lesson_name = 'Lesson Display Name'

    custom_i18n = {
      'data' => {
        'script' => {
          'name' => {
            @script.name => {
              'title' => @script_title,
              'lessons' => {
                @lesson.name => {
                  'name' => @lesson_name
                }
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations 'en-US', custom_i18n
    assert_equal @script_title, @lesson.script.localized_title

    @update_params = {
      id: @lesson.id,
      overview: 'new overview',
      studentOverview: 'new student overview',
    }

    @levelbuilder = create :levelbuilder
  end

  # anyone can show lesson
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :levelbuilder, response: :success

  test 'show lesson when lesson is the only lesson in script' do
    @solo_lesson_in_script = create(
      :lesson,
      name: 'lesson display name',
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )

    custom_i18n = {
      'data' => {
        'script' => {
          'name' => {
            @solo_lesson_in_script.script.name => {
              'title' => @script_title,
              'lessons' => {
                @lesson.name => {
                  'name' => @lesson_name
                }
              }
            }
          }
        }
      }
    }

    I18n.backend.store_translations 'en-US', custom_i18n
    assert_equal @script_title, @solo_lesson_in_script.script.localized_title

    # a bit weird, but this is what happens when there is only one lesson.
    assert_equal @script_title, @solo_lesson_in_script.localized_name

    get :show, params: {
      id: @solo_lesson_in_script.id
    }
    assert_response :ok
    assert(@response.body.include?(@script_title))
    assert(@response.body.include?(@solo_lesson_in_script.overview))
    assert(@response.body.include?(lesson_path(id: @solo_lesson_in_script.id)))
  end

  test 'show lesson when script has multiple lessons' do
    get :show, params: {
      id: @lesson.id
    }
    assert_response :ok
    assert(@response.body.include?(@script_title))
    assert(@response.body.include?(@lesson.overview))
    assert(@response.body.include?(@script.link))
    assert(@response.body.include?(lesson_path(id: @lesson.id)))
    assert(@response.body.include?(lesson_path(id: @lesson2.id)))
  end

  test 'show lesson with activities' do
    activity = @lesson.lesson_activities.create(
      name: 'My Activity',
      position: 1,
      key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'My Activity Section',
      position: 1,
      key: 'activity-section-key'
    )

    get :show, params: {
      id: @lesson.id
    }
    assert_response :ok

    assert_includes @response.body, activity.name
    assert_includes @response.body, section.name
  end

  # only levelbuilders can edit
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :levelbuilder, response: :success

  test 'edit lesson' do
    sign_in @levelbuilder

    get :edit, params: {
      id: @lesson.id
    }
    assert_response :ok

    # verify the lesson fields appear in camelCase in the DOM.
    lesson_data = JSON.parse(css_select('script[data-lesson]').first.attribute('data-lesson').to_s)
    assert_equal 'lesson overview', lesson_data['overview']
    assert_equal 'student overview', lesson_data['studentOverview']
  end

  test 'cannot edit lesson with legacy script levels' do
    # legacy script level, not owned by an activity section
    create :script_level, lesson: @lesson, script: @lesson.script

    sign_in @levelbuilder

    get :edit, params: {
      id: @lesson.id
    }
    assert_response :forbidden
  end

  # only levelbuilders can update
  test_user_gets_response_for :update, params: -> {{id: @lesson.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
  test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success

  test 'update lesson returns summary of updated lesson' do
    sign_in @levelbuilder

    put :update, params: @update_params

    assert_equal 'new overview', JSON.parse(@response.body)['overview']
    assert_equal 'new student overview', JSON.parse(@response.body)['studentOverview']
  end

  test 'cannot update if changes have been made to the database which are not reflected in the current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    error = assert_raises RuntimeError do
      post :update, params: {
        id: lesson.id,
        lesson: {name: lesson.name},
        originalLessonData: {"name": "Not the name"}
      }
    end

    assert_includes error.message, "Could not update the lesson because the contents of the lesson has changed outside of this editor. Reload the page and try saving again."
  end

  test 'can update if database matches starting content for current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    post :update, params: {
      id: lesson.id,
      lesson: {name: lesson.name},
      originalLessonData: JSON.generate(lesson.summarize_for_lesson_edit.except(:updatedAt))
    }

    assert_response :success
  end

  test 'cannot update lesson with legacy script levels' do
    # legacy script level, not owned by an activity section
    create :script_level, lesson: @lesson, script: @lesson.script

    sign_in @levelbuilder

    @update_params['activities'] = [
      {
        name: 'activity name',
        position: 1
      }
    ].to_json
    put :update, params: @update_params
    assert_response :forbidden
  end

  test 'add activity via lesson update' do
    sign_in @levelbuilder

    @update_params['activities'] = [
      {
        name: 'activity name',
        position: 1
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload
    assert_equal 'new overview', @lesson.overview
    assert_equal 'new student overview', @lesson.student_overview
    assert_equal 1, @lesson.lesson_activities.count
    activity = @lesson.lesson_activities.first
    assert_equal 'activity name', activity.name
    assert_equal 1, activity.position
  end

  test 'remove activity via lesson update' do
    sign_in @levelbuilder

    id_a = @lesson.lesson_activities.create(
      name: 'activity A',
      position: 1,
      key: 'key_a'
    ).id
    @lesson.lesson_activities.create(
      name: 'activity B',
      position: 2,
      key: 'key_b'
    ).id
    id_c = @lesson.lesson_activities.create(
      name: 'activity C',
      position: 3,
      key: 'key_c'
    ).id

    @update_params['activities'] = [
      {
        id: id_a,
        name: 'activity A',
        position: 1
      },
      {
        id: id_c,
        name: 'activity C',
        position: 2
      },
    ].to_json

    put :update, params: @update_params

    @lesson.reload
    assert_equal 2, @lesson.lesson_activities.count
    activities = @lesson.lesson_activities

    assert_equal 'activity A', activities.first.name
    assert_equal 1, activities.first.position
    assert_equal id_a, activities.first.id

    assert_equal 'activity C', activities.last.name
    assert_equal 2, activities.last.position
    assert_equal id_c, activities.last.id
  end

  test 'add activity section via lesson update' do
    sign_in @levelbuilder

    old_activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      key: 'activity-key'
    )

    @update_params['activities'] = [
      {
        id: old_activity.id,
        name: 'activity name',
        position: 1,
        activitySections: [
          {
            name: 'section name',
            position: 1
          }
        ]
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload

    assert_equal 1, @lesson.lesson_activities.count
    new_activity = @lesson.lesson_activities.first
    assert_equal 'activity name', new_activity.name
    assert_equal 1, new_activity.position
    assert_equal old_activity.id, new_activity.id

    assert_equal 1, new_activity.activity_sections.count
    section = new_activity.activity_sections.first
    assert_equal 'section name', section.name
    assert_equal 1, section.position
  end

  test 'remove activity section via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      key: 'activity-key'
    )
    activity.activity_sections.create(
      name: 'section A',
      position: 1,
      key: 'key_a'
    ).id
    id_b = activity.activity_sections.create(
      name: 'section B',
      position: 2,
      key: 'key_b'
    ).id

    @update_params['activities'] = [
      {
        id: activity.id,
        name: 'activity name',
        position: 1,
        activitySections: [
          {
            id: id_b,
            name: 'section B',
            position: 1
          }
        ]
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload
    assert_equal 1, @lesson.lesson_activities.count
    activity = @lesson.lesson_activities.first
    assert_equal 1, activity.activity_sections.count
    section = activity.activity_sections.first

    assert_equal 'section B', section.name
    assert_equal 1, section.position
    assert_equal id_b, section.id
  end

  test 'update lesson with new resources' do
    resource = create :resource

    sign_in @levelbuilder
    new_update_params = @update_params.merge({resources: [resource.key].to_json})
    put :update, params: new_update_params
    @lesson.reload
    assert_equal 1, @lesson.resources.count
  end

  test 'update lesson removing and adding resources' do
    course_version = create :course_version
    resource_to_keep = create :resource, course_version: course_version
    resource_to_add = create :resource, course_version: course_version
    resource_to_remove = create :resource, course_version: course_version
    @lesson.script.course_version = course_version

    @lesson.resources << resource_to_keep
    @lesson.resources << resource_to_remove

    sign_in @levelbuilder
    new_update_params = @update_params.merge({resources: [resource_to_keep.key, resource_to_add.key].to_json})
    put :update, params: new_update_params
    @lesson.reload
    assert_equal 2, @lesson.resources.count
    assert @lesson.resources.include?(resource_to_keep)
    assert @lesson.resources.include?(resource_to_add)
    refute @lesson.resources.include?(resource_to_remove)
  end

  test 'lesson is not partially updated if any data is bad' do
    resource = create :resource

    sign_in @levelbuilder

    new_update_params = @update_params.merge({resources: [resource.key].to_json})
    new_update_params['activities'] = [{id: 'bogus'}].to_json

    put :update, params: new_update_params
    assert_response :not_acceptable

    @lesson.reload
    assert_equal 0, @lesson.resources.count
    assert_equal 'lesson overview', @lesson.overview
  end

  test 'update lesson with new objectives' do
    sign_in @levelbuilder
    new_update_params = @update_params.merge({objectives: [{id: nil, description: 'description'}].to_json})
    put :update, params: new_update_params
    @lesson.reload
    assert_equal 1, @lesson.objectives.count
  end

  test 'update lesson by removing objectives' do
    sign_in @levelbuilder
    objective_to_keep = create :objective, description: 'to keep', lesson: @lesson
    objective_to_remove = create :objective, description: 'to remove', lesson: @lesson
    assert_equal 2, @lesson.objectives.count

    new_update_params = @update_params.merge({objectives: [objective_to_keep.summarize_for_edit].to_json})
    put :update, params: new_update_params
    @lesson.reload

    assert_equal 1, @lesson.objectives.count
    assert_nil Objective.find_by_id(objective_to_remove.id)
    assert_not_nil objective_to_keep.reload
  end

  test 'editing an objective updates the objective' do
    sign_in @levelbuilder
    objective = create :objective, description: 'to edit', lesson: @lesson

    new_update_params = @update_params.merge({objectives: [{id: objective.id, description: 'edited description'}].to_json})
    put :update, params: new_update_params
    @lesson.reload
    objective.reload

    assert_equal 1, @lesson.objectives.count
    assert_equal 'edited description', objective.description
  end

  test 'add script level via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'section name',
      position: 1,
      key: 'section-key'
    )

    level_to_add = create :maze, name: 'level-to-add'

    @update_params['activities'] = [
      {
        id: activity.id,
        name: 'activity name',
        position: 1,
        activitySections: [
          {
            id: section.id,
            name: 'section name',
            position: 1,
            scriptLevels: [
              activitySectionPosition: 1,
              activeId: level_to_add.id,
              assessment: true,
              levels: [
                {
                  id: level_to_add.id,
                  name: level_to_add.name
                }
              ]
            ]
          }
        ]
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload

    assert_equal activity, @lesson.lesson_activities.first
    assert_equal section, activity.activity_sections.first

    assert_equal 1, section.script_levels.count
    script_level = section.script_levels.first
    assert script_level.assessment
    refute script_level.bonus
    assert_equal 'section name', script_level.progression
    assert_equal ['level-to-add'], script_level.levels.map(&:name)
  end

  test 'add anonymous survey level via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'section name',
      position: 1,
      key: 'section-key'
    )

    existing_survey = create :level_group, name: 'existing-survey'
    existing_survey.update!(properties: {anonymous: "true"})

    existing_script_level = section.script_levels.create(
      position: 1,
      activity_section_position: 1,
      lesson: @lesson,
      script: @lesson.script,
      levels: [existing_survey],
      assessment: true
    )

    existing_summary = existing_script_level.summarize_for_lesson_edit
    assert_equal 1, existing_summary[:activitySectionPosition]
    assert_equal existing_survey.id, existing_summary[:activeId]
    existing_summary[:assessment] = false

    survey_to_add = create :level_group, name: 'survey-to-add'
    survey_to_add.update!(properties: {anonymous: "true"})

    @update_params['activities'] = [
      {
        id: activity.id,
        name: 'activity name',
        position: 1,
        activitySections: [
          {
            id: section.id,
            name: 'section name',
            position: 1,
            scriptLevels: [
              existing_summary,
              {
                activitySectionPosition: 2,
                activeId: survey_to_add.id,
                levels: [
                  {
                    id: survey_to_add.id,
                    name: survey_to_add.name
                  }
                ]
              }
            ]
          }
        ]
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload

    assert_equal activity, @lesson.lesson_activities.first
    assert_equal section, activity.activity_sections.first
    assert_equal 2, section.script_levels.count

    # when the user marks an existing anonymous survey as not an assessment,
    # the update method marks it as an assessment so that we pass validations.
    script_level = section.script_levels.first
    assert_equal ['existing-survey'], script_level.levels.map(&:name)
    assert script_level.anonymous?
    assert script_level.assessment

    # when the user adds a new anonymous survey to an activity section, the
    # update method marks it as an assessment so that we pass validations.
    script_level = section.script_levels.last
    assert_equal ['survey-to-add'], script_level.levels.map(&:name)
    assert script_level.anonymous?
    assert script_level.assessment
  end

  test 'move script level to previous activity' do
    sign_in @levelbuilder

    # create the following structure:
    # activity 1
    #   section 1
    #     sl 1
    # activity 2
    #   section 2
    #     sl 2
    [1, 2].each do |i|
      activity = @lesson.lesson_activities.create(
        name: 'activity name',
        position: i,
        key: "activity-key-#{i}"
      )
      section = activity.activity_sections.create(
        name: 'section name',
        position: 1,
        key: "section-key-#{i}"
      )
      section.script_levels.create(
        position: i,
        activity_section_position: 1,
        lesson: @lesson,
        script: @lesson.script,
        levels: [create(:level, name: "my-level-#{i}")]
      )
    end

    # update the structure to:
    # activity 1
    #   section 1
    #     sl 1
    #     sl 2
    # activity 2
    #   section 2
    activities_data = @lesson.lesson_activities.map(&:summarize_for_lesson_edit)
    assert_equal 2, activities_data.count
    script_level_data = activities_data.last[:activitySections].first[:scriptLevels].pop
    script_level_data[:activitySectionPosition] = 2
    activities_data.first[:activitySections].first[:scriptLevels].push(script_level_data)

    @update_params['activities'] = activities_data.to_json

    put :update, params: @update_params

    @lesson.reload
    script_levels = @lesson.lesson_activities.first.activity_sections.first.script_levels
    assert_equal 2, script_levels.count
    assert_equal ['my-level-1', 'my-level-2'], script_levels.map(&:levels).map(&:first).map(&:name)
    script_levels = @lesson.lesson_activities.last.activity_sections.first.script_levels
    assert_equal 0, script_levels.count
  end

  test 'move script level to next activity' do
    sign_in @levelbuilder

    # create the following structure:
    # activity 1
    #   section 1
    #     sl 1
    # activity 2
    #   section 2
    #     sl 2
    [1, 2].each do |i|
      activity = @lesson.lesson_activities.create(
        name: 'activity name',
        position: i,
        key: "activity-key-#{i}"
      )
      section = activity.activity_sections.create(
        name: 'section name',
        position: 1,
        key: "section-key-#{i}"
      )
      section.script_levels.create(
        position: i,
        activity_section_position: 1,
        lesson: @lesson,
        script: @lesson.script,
        levels: [create(:level, name: "my-level-#{i}")]
      )
    end

    # update the structure to:
    # activity 1
    #   section 1
    # activity 2
    #   section 2
    #     sl 2
    #     sl 1
    activities_data = @lesson.lesson_activities.map(&:summarize_for_lesson_edit)
    assert_equal 2, activities_data.count
    script_level_data = activities_data.first[:activitySections].first[:scriptLevels].pop
    script_level_data[:activitySectionPosition] = 2
    activities_data.last[:activitySections].first[:scriptLevels].push(script_level_data)

    @update_params['activities'] = activities_data.to_json

    put :update, params: @update_params

    @lesson.reload
    script_levels = @lesson.lesson_activities.first.activity_sections.first.script_levels
    assert_equal 0, script_levels.count
    script_levels = @lesson.lesson_activities.last.activity_sections.first.script_levels
    assert_equal 2, script_levels.count
    assert_equal ['my-level-2', 'my-level-1'], script_levels.map(&:levels).map(&:first).map(&:name)
  end

  test 'remove script level via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'section name',
      position: 1,
      key: 'section-key'
    )
    [1, 2, 3].each do |i|
      section.script_levels.create(
        position: i,
        activity_section_position: i,
        lesson: @lesson,
        script: @lesson.script,
        levels: [create(:level, name: "my-level-#{i}")]
      )
    end
    sl_ids = section.script_levels.map(&:id)

    script_levels_data = section.script_levels.map(&:summarize_for_lesson_edit)
    assert_equal 3, script_levels_data.count

    @update_params['activities'] = [
      {
        id: activity.id,
        name: 'activity name',
        position: 1,
        activitySections: [
          {
            id: section.id,
            name: 'section name',
            position: 1,
            scriptLevels: [
              script_levels_data[0],
              script_levels_data[2]
            ]
          }
        ]
      }
    ].to_json

    put :update, params: @update_params

    @lesson.reload
    assert_equal activity, @lesson.lesson_activities.first
    assert_equal section, activity.activity_sections.first

    section.reload
    assert_equal 2, section.script_levels.count
    assert_equal [sl_ids[0], sl_ids[2]], section.script_levels.map(&:id)
    assert_equal ['my-level-1'], section.script_levels.first.levels.map(&:name)
    assert_equal ['my-level-3'], section.script_levels.last.levels.map(&:name)

    # sanity check that chapter and position values have been updated
    assert_equal [1, 2], section.script_levels.map(&:chapter)
    assert_equal [1, 2], section.script_levels.map(&:position)
  end
end
