require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

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
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )

    @lesson2 = create(
      :lesson,
      script_id: @script.id,
      lesson_group: lesson_group,
      name: 'second lesson',
      has_lesson_plan: false,
      lockable: false,
      absolute_position: 2,
      relative_position: 2
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

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_script = create :script, name: 'pilot-script', pilot_experiment: 'my-experiment', is_migrated: true, include_student_lesson_plans: true
    pilot_lesson_group = create :lesson_group, script: @pilot_script
    @pilot_lesson = create(
      :lesson,
      script_id: @pilot_script.id,
      lesson_group: pilot_lesson_group,
      name: 'Pilot Lesson 1',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )
    @pilot_section = create :section, user: @pilot_teacher, script: @pilot_script
    @pilot_student = create(:follower, section: @pilot_section).student_user

    @login_req_script = create :script, name: 'signed-in-script', is_migrated: true, include_student_lesson_plans: true, login_required: true
    login_req_lesson_group = create :lesson_group, script: @login_req_script
    @login_req_lesson = create(
      :lesson,
      script_id: @login_req_script.id,
      lesson_group: login_req_lesson_group,
      name: 'Lesson 1 In Login Required Script',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )
  end

  # anyone can show lesson with lesson plan
  test_user_gets_response_for :show, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :levelbuilder, response: :success

  # anyone can show lesson in a script that has login required
  test_user_gets_response_for :show, params: -> {{script_id: @login_req_script.name, position: @login_req_lesson.relative_position}}, user: nil, response: :success, name: 'signed out user can view lesson on script where login is required'
  test_user_gets_response_for :show, params: -> {{script_id: @login_req_script.name, position: @login_req_lesson.relative_position}}, user: :student, response: :success, name: 'student can view lesson on script where login is required'
  test_user_gets_response_for :show, params: -> {{script_id: @login_req_script.name, position: @login_req_lesson.relative_position}}, user: :teacher, response: :success, name: 'teacher can view lesson on script where login is required'
  test_user_gets_response_for :show, params: -> {{script_id: @login_req_script.name, position: @login_req_lesson.relative_position}}, user: :levelbuilder, response: :success, name: 'levelbuilder can view lesson on script where login is required'

  # anyone can show student lesson plan in a script that has login required
  test_user_gets_response_for :student_lesson_plan, params: -> {{script_id: @login_req_script.name, lesson_position: @login_req_lesson.relative_position}}, user: nil, response: :success, name: 'signed out user can view student lesson plan on script where login is required'
  test_user_gets_response_for :student_lesson_plan, params: -> {{script_id: @login_req_script.name, lesson_position: @login_req_lesson.relative_position}}, user: :student, response: :success, name: 'student can view student lesson plan on script where login is required'
  test_user_gets_response_for :student_lesson_plan, params: -> {{script_id: @login_req_script.name, lesson_position: @login_req_lesson.relative_position}}, user: :teacher, response: :success, name: 'teacher can view student lesson plan on script where login is required'
  test_user_gets_response_for :student_lesson_plan, params: -> {{script_id: @login_req_script.name, lesson_position: @login_req_lesson.relative_position}}, user: :levelbuilder, response: :success, name: 'levelbuilder can view student lesson plan on script where login is required'

  # limit access to lesson plans in pilots
  test_user_gets_response_for :show, response: :not_found, user: nil,
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position}},
                              name: 'signed out user cannot view pilot lesson'

  test_user_gets_response_for :show, response: :not_found, user: :student,
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position}}, name: 'student cannot view pilot lesson'

  test_user_gets_response_for :show, response: :not_found, user: :teacher,
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position}},
                              name: 'teacher without pilot access cannot view pilot lesson'

  test_user_gets_response_for :show, response: :success, user: -> {@pilot_teacher},
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position, section_id: @pilot_section.id}},
                              name: 'pilot teacher can view pilot lesson'

  test_user_gets_response_for :show, response: :success, user: -> {@pilot_student},
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position}}, name: 'pilot student can view pilot lesson'

  test_user_gets_response_for :show, response: :success, user: :levelbuilder,
                              params: -> {{script_id: @pilot_script.name, position: @pilot_lesson.relative_position}}, name: 'levelbuilder can view pilot lesson'

  # limit access to student lesson plans in pilots
  test_user_gets_response_for :student_lesson_plan, response: :not_found, user: nil,
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position}},
                              name: 'signed out user cannot view pilot student lesson plan'

  test_user_gets_response_for :student_lesson_plan, response: :not_found, user: :student,
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position}}, name: 'student cannot view pilot student lesson plan'

  test_user_gets_response_for :student_lesson_plan, response: :not_found, user: :teacher,
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position}},
                              name: 'teacher without pilot access cannot view pilot student lesson plan'

  test_user_gets_response_for :student_lesson_plan, response: :success, user: -> {@pilot_teacher},
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position, section_id: @pilot_section.id}},
                              name: 'pilot teacher can view pilot student lesson plan'

  test_user_gets_response_for :student_lesson_plan, response: :success, user: -> {@pilot_student},
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position}}, name: 'pilot student can view pilot student lesson plan'

  test_user_gets_response_for :student_lesson_plan, response: :success, user: :levelbuilder,
                              params: -> {{script_id: @pilot_script.name, lesson_position: @pilot_lesson.relative_position}}, name: 'levelbuilder can view pilot student lesson plan'

  test 'can not show lesson when has_lesson_plan is false' do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {
        script_id: @script.name,
        position: @lesson2.relative_position
      }
    end
  end

  test 'can not show lesson when lesson is in a non-migrated script' do
    sign_in @levelbuilder
    script2 = create :script, name: 'unmigrated-course'
    lesson_group2 = create :lesson_group, script: script2
    unmigrated_lesson = create(
      :lesson,
      script_id: script2.id,
      lesson_group: lesson_group2,
      name: 'unmigrated lesson',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
    )

    get :show, params: {
      script_id: script2.name,
      position: unmigrated_lesson.relative_position
    }
    assert_response 404
  end

  test 'show lesson when lesson is the only lesson in script' do
    script = create :script, name: 'one-lesson-script', is_migrated: true
    lesson_group = create :lesson_group, script: script
    @solo_lesson_in_script = create(
      :lesson,
      name: 'lesson display name',
      script_id: script.id,
      lesson_group_id: lesson_group.id,
      has_lesson_plan: true,
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
      script_id: script.name,
      position: @solo_lesson_in_script.relative_position
    }
    assert_response :ok
    assert(@response.body.include?(@script_title))
    assert(@response.body.include?(@solo_lesson_in_script.overview))
    assert(@response.body.include?(script_lesson_path(@solo_lesson_in_script.script, @solo_lesson_in_script)))
  end

  test 'show lesson when script has multiple lessons' do
    get :show, params: {
      script_id: @script.name,
      position: @lesson.relative_position
    }
    assert_response :ok
    assert(@response.body.include?(@script_title))
    assert(@response.body.include?(@lesson.overview))
    assert(@response.body.include?(@script.link))
    assert(@response.body.include?(script_lesson_path(@lesson.script, @lesson)))
    refute(@response.body.include?(script_lesson_path(@lesson2.script, @lesson2)))
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
      script_id: @script.name,
      position: @lesson.relative_position
    }
    assert_response :ok

    assert_includes @response.body, activity.name
    assert_includes @response.body, section.name
  end

  test 'can not show student lesson plan when lesson is in a non-migrated script' do
    sign_in @levelbuilder
    script2 = create :script, name: 'unmigrated-course'
    lesson_group2 = create :lesson_group, script: script2
    unmigrated_lesson = create(
      :lesson,
      script_id: script2.id,
      lesson_group: lesson_group2,
      name: 'unmigrated lesson',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
    )

    get :student_lesson_plan, params: {
      script_id: script2.name,
      lesson_position: unmigrated_lesson.relative_position
    }
    assert_response 404
  end

  test 'can not show student lesson plan when lesson is in a script without student lesson plans' do
    sign_in @levelbuilder
    script2 = create :script, name: 'course', is_migrated: true, include_student_lesson_plans: false
    lesson_group2 = create :lesson_group, script: script2
    unmigrated_lesson = create(
      :lesson,
      script_id: script2.id,
      lesson_group: lesson_group2,
      name: 'course',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
    )

    get :student_lesson_plan, params: {
      script_id: script2.name,
      lesson_position: unmigrated_lesson.relative_position
    }
    assert_response 404
  end

  test 'show student lesson plan' do
    sign_in @levelbuilder
    script2 = create :script, name: 'course', is_migrated: true, include_student_lesson_plans: true
    lesson_group2 = create :lesson_group, script: script2
    unmigrated_lesson = create(
      :lesson,
      script_id: script2.id,
      lesson_group: lesson_group2,
      name: 'course',
      absolute_position: 1,
      relative_position: 1,
      has_lesson_plan: true,
      lockable: false,
    )

    get :student_lesson_plan, params: {
      script_id: script2.name,
      lesson_position: unmigrated_lesson.relative_position
    }
    assert_response :ok
    assert_includes @response.body, script2.name
  end

  # only levelbuilders can edit with lesson id in url
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :levelbuilder, response: :success

  # only levelbuilders can edit with lesson position in url
  test_user_gets_response_for :edit, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{script_id: @script.name, position: @lesson.relative_position}}, user: :levelbuilder, response: :success

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
    assert_response 404
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

  test 'cannot update lockable if last level is not a levelgroup and an assessment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: script,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: lesson,
      levels: [create(:maze)]
    )

    error = assert_raises RuntimeError do
      post :update, params: {
        id: lesson.id,
        name: lesson.name,
        lockable: true
      }
    end

    assert_includes error.message, "The last level in a lockable lesson must be a LevelGroup and an assessment."
  end

  test 'can update lockable if last level is levelgroup and assessment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: script,
      assessment: true,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: lesson,
      levels: [create(:level_group, name: 'levelgroup 1')]
    )

    post :update, params: {
      id: lesson.id,
      name: lesson.name,
      lockable: true
    }

    assert_response :success
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
        originalLessonData: JSON.generate({"name": "Not the name"})
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
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: script,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: lesson,
      levels: [create(:maze)]
    )

    post :update, params: {
      id: lesson.id,
      lesson: {name: lesson.name},
      originalLessonData: JSON.generate(lesson.summarize_for_lesson_edit.except(:updatedAt))
    }

    assert_response :success
  end

  test 'can update if vocabulary content changes' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: script,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: lesson,
      levels: [create(:maze)]
    )
    vocabulary = create :vocabulary, definition: 'original definition', lessons: [lesson]
    original_lesson_data = JSON.generate(lesson.summarize_for_lesson_edit.except(:updatedAt))
    vocabulary.definition = 'updated definition'

    post :update, params: {
      id: lesson.id,
      lesson: {name: lesson.name},
      originalLessonData: original_lesson_data
    }

    assert_response :success
  end

  test 'can update if resource content changes' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: script,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: lesson,
      levels: [create(:maze)]
    )
    resource = create :resource, url: 'original.url', lessons: [lesson]
    original_lesson_data = JSON.generate(lesson.summarize_for_lesson_edit.except(:updatedAt))
    resource.url = 'updated.url'

    post :update, params: {
      id: lesson.id,
      lesson: {name: lesson.name},
      originalLessonData: original_lesson_data
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
    assert_response 404
  end

  test 'updates lesson positions on lesson update' do
    sign_in @levelbuilder

    # Make sure the last level in @lesson is an assessment and levelgroup
    lesson_activity = create :lesson_activity, lesson: @lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    create(
      :script_level,
      script: @script,
      assessment: true,
      activity_section: activity_section,
      activity_section_position: 1,
      lesson: @lesson,
      levels: [create(:level_group, name: 'levelgroup 1')]
    )

    assert_equal 1, @lesson.relative_position
    assert_equal 1, @lesson.absolute_position
    assert_equal 2, @lesson2.relative_position
    assert_equal 2, @lesson2.absolute_position

    @update_params['lockable'] = true
    @update_params['has_lesson_plan'] = false

    put :update, params: @update_params

    @lesson.reload
    @lesson2.reload
    assert_equal 1, @lesson.relative_position
    assert_equal 1, @lesson.absolute_position
    assert_equal 1, @lesson2.relative_position
    assert_equal 2, @lesson2.absolute_position
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

  test 'update writes lesson name to i18n and script_json in levelbuilder mode' do
    @update_params[:name] = "New Lesson Display Name #{SecureRandom.uuid}"

    # Just make sure the new lesson name appears somewhere in the new file contents.
    File.stubs(:write).with do |filename, data|
      filename.end_with?('scripts.en.yml') && data.include?(@update_params[:name])
    end.once

    # Just make sure the new lesson name appears somewhere in the new file contents.
    File.stubs(:write).with do |filename, data|
      filename.end_with?('.script_json') && data.include?(@update_params[:name])
    end.once

    sign_in @levelbuilder
    put :update, params: @update_params
  end

  test 'update does not write lesson name without levelbuilder mode' do
    @update_params[:name] = "New Lesson Display Name #{SecureRandom.uuid}"
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    File.stubs(:write).raises('must not modify filesystem')
    sign_in @levelbuilder
    put :update, params: @update_params
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
    course_version = create :course_version
    resource = create :resource, course_version: course_version
    @lesson.script.course_version = course_version

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

  test 'update lesson by removing and adding vocabularies' do
    course_version = create :course_version
    vocab_to_keep = create :vocabulary, course_version: course_version
    vocab_to_remove = create :vocabulary, course_version: course_version
    vocab_to_add = create :vocabulary, course_version: course_version
    @lesson.script.course_version = course_version
    @lesson.vocabularies = [vocab_to_keep, vocab_to_remove]

    sign_in @levelbuilder
    new_update_params = @update_params.merge({vocabularies: [vocab_to_keep.key, vocab_to_add.key].to_json})
    put :update, params: new_update_params
    @lesson.reload

    assert_equal 2, @lesson.vocabularies.count
    assert @lesson.vocabularies.include?(vocab_to_keep)
    assert @lesson.vocabularies.include?(vocab_to_add)
    refute @lesson.vocabularies.include?(vocab_to_remove)
  end

  test 'update lesson by removing and adding programming expressions' do
    expression_to_keep = create :programming_expression
    expression_to_remove = create :programming_expression
    expression_to_add = create :programming_expression
    @lesson.programming_expressions = [expression_to_keep, expression_to_remove]

    sign_in @levelbuilder
    new_update_params = @update_params.merge({programming_expressions: [expression_to_keep.summarize_for_lesson_edit, expression_to_add.summarize_for_lesson_edit].to_json})
    put :update, params: new_update_params
    @lesson.reload

    assert_equal 2, @lesson.programming_expressions.count
    assert @lesson.programming_expressions.include?(expression_to_keep)
    assert @lesson.programming_expressions.include?(expression_to_add)
    refute @lesson.programming_expressions.include?(expression_to_remove)
  end

  test 'update lesson removing and adding standards' do
    standard_to_keep = create :standard
    standard_to_add = create :standard
    standard_to_remove = create :standard

    @lesson.standards << standard_to_keep
    @lesson.standards << standard_to_remove

    sign_in @levelbuilder
    new_standards_data = [standard_to_add, standard_to_keep].map(&:summarize_for_lesson_edit).to_json
    new_update_params = @update_params.merge({standards: new_standards_data})
    put :update, params: new_update_params
    @lesson.reload
    assert_equal 2, @lesson.standards.count
    assert @lesson.standards.include?(standard_to_add)
    assert @lesson.standards.include?(standard_to_keep)
    refute @lesson.standards.include?(standard_to_remove)
  end

  test 'update lesson removing and adding opportunity standards' do
    standard_to_keep = create :standard
    standard_to_add = create :standard
    standard_to_remove = create :standard

    @lesson.opportunity_standards << standard_to_keep
    @lesson.opportunity_standards << standard_to_remove

    sign_in @levelbuilder
    new_standards_data = [standard_to_add, standard_to_keep].map(&:summarize_for_lesson_edit).to_json
    new_update_params = @update_params.merge({opportunityStandards: new_standards_data})
    put :update, params: new_update_params
    @lesson.reload
    assert_equal 2, @lesson.opportunity_standards.count
    assert @lesson.opportunity_standards.include?(standard_to_add)
    assert @lesson.opportunity_standards.include?(standard_to_keep)
    refute @lesson.opportunity_standards.include?(standard_to_remove)
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
    activity = create :lesson_activity, lesson: @lesson
    section = create :activity_section, lesson_activity: activity
    level_to_add = create :maze, name: 'level-to-add'

    @lesson.reload
    activities_data = @lesson.summarize_for_lesson_edit[:activities]
    section_data = activities_data.first[:activitySections].first
    section_data[:progressionName] = 'progression name'
    section_data[:scriptLevels].push(
      activitySectionPosition: 1,
      activeId: level_to_add.id,
      assessment: true,
      levels: [{id: level_to_add.id, name: level_to_add.name}]
    )

    @update_params['activities'] = activities_data.to_json
    put :update, params: @update_params
    assert_response :success
    @lesson.reload

    assert_equal activity, @lesson.lesson_activities.first
    assert_equal section, activity.activity_sections.first

    assert_equal 1, section.script_levels.count
    script_level = section.script_levels.first
    assert script_level.assessment
    refute script_level.bonus
    assert_equal 'progression name', script_level.progression
    assert_equal ['level-to-add'], script_level.levels.map(&:name)
  end

  test 'cannot add duplicate level via lesson update' do
    sign_in @levelbuilder
    activity = create :lesson_activity, lesson: @lesson
    create :activity_section, lesson_activity: activity

    activity2 = create :lesson_activity, lesson: @lesson2
    section2 = create :activity_section, lesson_activity: activity2
    existing_level = create :maze, name: 'existing-level'
    create :script_level, activity_section: section2, activity_section_position: 1, lesson: @lesson2, script: @script, levels: [existing_level]

    @lesson.reload
    activities_data = @lesson.summarize_for_lesson_edit[:activities]
    activities_data.first[:activitySections].first[:scriptLevels].push(
      activitySectionPosition: 1,
      activeId: existing_level.id,
      assessment: true,
      levels: [{id: existing_level.id, name: existing_level.name}]
    )

    @update_params['activities'] = activities_data.to_json

    error = assert_raises do
      put :update, params: @update_params
    end
    assert_includes error.message, 'duplicate levels detected'
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
    assert_equal existing_survey.id.to_s, existing_summary[:activeId]
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

  test 'lesson clone fails if script cannot be found' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    lesson = create :lesson
    put :clone, params: {id: lesson.id, 'destinationUnitName': 'fake-script'}
    assert_response :not_acceptable
    assert @response.body.include?('error')
  end

  test 'lesson clone returns script and lesson urls if successful' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    create :course_version, content_root: script, key: '2021'
    original_script = create :script
    lesson = create :lesson, script: original_script
    create :course_version, content_root: original_script, key: '2021'
    cloned_lesson = create :lesson, script: script
    Lesson.any_instance.stubs(:copy_to_script).returns(cloned_lesson)
    put :clone, params: {id: lesson.id, 'destinationUnitName': script.name}

    assert_response 200
    assert @response.body.include?('editLessonUrl')
    assert @response.body.include?('editScriptUrl')
  end
end
