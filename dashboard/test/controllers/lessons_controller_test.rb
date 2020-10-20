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
      seeding_key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'My Activity Section',
      position: 1,
      seeding_key: 'activity-section-key'
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
  test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :redirect

  test 'update lesson' do
    sign_in @levelbuilder

    put :update, params: @update_params

    assert_redirected_to "/lessons/#{@lesson.id}"
    @lesson.reload
    assert_equal 'new overview', @lesson.overview
    assert_equal 'new student overview', @lesson.student_overview
    assert_equal 0, @lesson.lesson_activities.count
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

    assert_redirected_to "/lessons/#{@lesson.id}"
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
      seeding_key: 'key_a'
    ).id
    @lesson.lesson_activities.create(
      name: 'activity B',
      position: 2,
      seeding_key: 'key_b'
    ).id
    id_c = @lesson.lesson_activities.create(
      name: 'activity C',
      position: 3,
      seeding_key: 'key_c'
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
    assert_redirected_to "/lessons/#{@lesson.id}"

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
      seeding_key: 'activity-key'
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

    assert_redirected_to "/lessons/#{@lesson.id}"
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
      seeding_key: 'activity-key'
    )
    activity.activity_sections.create(
      name: 'section A',
      position: 1,
      seeding_key: 'key_a'
    ).id
    id_b = activity.activity_sections.create(
      name: 'section B',
      position: 2,
      seeding_key: 'key_b'
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
    assert_redirected_to "/lessons/#{@lesson.id}"

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
    resource_to_keep = create :resource
    resource_to_add = create :resource
    resource_to_remove = create :resource

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

  test 'add script level via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      seeding_key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'section name',
      position: 1,
      seeding_key: 'section-key'
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

    assert_redirected_to "/lessons/#{@lesson.id}"
    @lesson.reload

    assert_equal activity, @lesson.lesson_activities.first
    assert_equal section, activity.activity_sections.first

    assert_equal 1, section.script_levels.count
    script_level = section.script_levels.first
    assert script_level.assessment
    refute script_level.bonus
    assert_equal ['level-to-add'], script_level.levels.map(&:name)
  end

  test 'remove script level via lesson update' do
    sign_in @levelbuilder

    activity = @lesson.lesson_activities.create(
      name: 'activity name',
      position: 1,
      seeding_key: 'activity-key'
    )
    section = activity.activity_sections.create(
      name: 'section name',
      position: 1,
      seeding_key: 'section-key'
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

    script_levels_data = section.script_levels.map(&:summarize_for_edit)
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
    assert_redirected_to "/lessons/#{@lesson.id}"

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
