require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    @script = create(
      :script,
      name: 'unit-1'
    )

    @lesson = create(
      :lesson,
      script_id: @script.id,
      name: 'lesson display name',
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
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

  test 'show lesson' do
    # a bit weird, but this is what happens when there is only one lesson.
    assert_equal @script_title, @lesson.localized_name

    get :show, params: {
      id: @lesson.id
    }
    assert_response :ok
    assert(@response.body.include?(@script_title))
    assert(@response.body.include?(@lesson.overview))
    assert(@response.body.include?(@script.link))
    assert(@response.body.include?(@script_title))
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
end
