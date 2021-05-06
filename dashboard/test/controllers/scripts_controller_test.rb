require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:user)
    @platformization_partner = create(:platformization_partner)
    @levelbuilder = create(:levelbuilder)
    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_script = create :script, pilot_experiment: 'my-experiment'
    @pilot_section = create :section, user: @pilot_teacher, script: @pilot_script
    @pilot_student = create(:follower, section: @pilot_section).student_user
    @no_progress_or_assignment_student = create :student

    @coursez_2017 = create :script, name: 'coursez-2017', family_name: 'coursez', version_year: '2017', is_stable: true
    @coursez_2018 = create :script, name: 'coursez-2018', family_name: 'coursez', version_year: '2018', is_stable: true
    @coursez_2019 = create :script, name: 'coursez-2019', family_name: 'coursez', version_year: '2019'
    @partner_script = create :script, editor_experiment: 'platformization-partners'

    @student_coursez_2017 = create :student
    @section_coursez_2017 = create :section, script: @coursez_2017
    @section_coursez_2017.add_student(@student_coursez_2017)

    @migrated_script = create :script, is_migrated: true
    @unmigrated_script = create :script

    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

  test "should get index" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    sign_in(@levelbuilder)
    get :index
    assert_response :success
    assert_not_nil assigns(:scripts)
    assert_equal Script.all, assigns(:scripts)
  end

  test "should redirect when script has a redirect_to property" do
    script = create :script
    new_script = create :script
    script.update(redirect_to: new_script.name)

    get :show, params: {id: script.name}
    assert_redirected_to "/s/#{new_script.name}"
  end

  test "should not get index if not signed in" do
    get :index

    assert_redirected_to_sign_in
  end

  test "should not get index if not levelbuilder" do
    [@admin, @not_admin].each do |user|
      sign_in user

      get :index

      assert_response :forbidden
    end
  end

  test "should get show of hoc" do
    get :show, params: {id: Script::HOC_NAME}
    assert_response :success
  end

  test "should get show of k-8" do
    get :show, params: {id: Script::TWENTY_HOUR_NAME}
    assert_response :success
  end

  test "should get show of custom script" do
    get :show, params: {id: 'course1'}
    assert_response :success
  end

  test "should get show of ECSPD if signed in" do
    sign_in @not_admin
    get :show, params: {id: 'ECSPD'}
    assert_response :success
  end

  test "should get show of ECSPD if not signed in" do
    get :show, params: {id: 'ECSPD'}
    assert_response :success
  end

  test "should not show link to Overview of Courses 1, 2, and 3 if logged in as a student" do
    sign_in create(:student)

    get :show, params: {id: 'course1'}
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3', count: 0
  end

  test "should not show link to Overview of Courses 1, 2, and 3 if not logged in" do
    get :show, params: {id: 'course1'}
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3', count: 0
  end

  test "should show link to Overview of Courses 1, 2, and 3 if logged in as a teacher" do
    sign_in create(:teacher)

    get :show, params: {id: 'course1'}
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3'
  end

  test "should redirect to /s/course1" do
    get :show, params: {id: Script.find_by_name("course1").id}
    assert_redirected_to "/s/course1"
  end

  test "show of hourofcode redirects to hoc" do
    get :show, params: {id: 'hourofcode'}
    assert_response :success
  end

  test "show of hourofcode by id should redirect to hoc" do
    get :show, params: {id: Script.find_by_name('hourofcode').id}
    assert_redirected_to '/s/hourofcode'
  end

  test "should get show if not signed in" do
    get :show, params: {id: Script::FLAPPY_NAME}
    assert_response :success
  end

  test "should get show if not admin" do
    sign_in @not_admin
    get :show, params: {id: Script::FLAPPY_NAME}
    assert_response :success
  end

  test 'should not get show if admin' do
    sign_in @admin
    get :show, params: {id: Script::FLAPPY_NAME}
    assert_response :forbidden
  end

  test "should use script name as param where script name is words but looks like a number" do
    script = create(:script, name: '15-16')
    get :show, params: {id: "15-16"}

    assert_response :success
    assert_equal script, assigns(:script)
  end

  test "should use script name as param where script name is words" do
    script = create(:script, name: 'Heure de Code', skip_name_format_validation: true)
    get :show, params: {id: "Heure de Code"}

    assert_response :success
    assert_equal script, assigns(:script)
  end

  test "renders 404 when id is an invalid id" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 232323}
    end
  end

  test "renders 404 when id is an invalid string" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'Hat'}
    end
  end

  test "show: do not redirect to latest stable version if no_redirect query param is supplied" do
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"

    get :show, params: {id: @coursez_2017.name, no_redirect: "true"}
    assert_response :ok

    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect when showing latest stable version in family for student" do
    sign_in @no_progress_or_assignment_student
    get :show, params: {id: @coursez_2018.name}
    assert_response :success
  end

  test "show: redirect from older version to latest stable version in family for student" do
    sign_in @no_progress_or_assignment_student
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from older version to latest stable version in family for logged out user" do
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to latest stable version in family for student" do
    sign_in @no_progress_or_assignment_student
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to latest stable version in family for logged out user" do
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to assigned version for student" do
    sign_in @student_coursez_2017
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2017.name}?redirect_warning=true"
  end

  # There are tests on can_view_version? in script_test.rb which verify that it returns true if a student is assigned
  # or has made progress in a different version from the latest stable version. This test verifies that ultimately
  # the student is not redirected if true is returned.
  test "show: do not redirect student to latest stable version in family if they can view the script version" do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    sign_in @no_progress_or_assignment_student
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in family" do
    sign_in create(:teacher)
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "should not get edit on production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder
    get :edit, params: {id: 'course1'}
    assert_response :forbidden
  end

  test "should get edit on levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    get :edit, params: {id: 'course1'}
    assert_response :ok
  end

  test "should not be able to edit on levelbuilder in locale besides en-US" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    with_default_locale(:de) do
      get :edit, params: {id: 'course1'}
    end
    assert_redirected_to "/"
  end

  test "should get edit on test" do
    CDO.stubs(:rack_env).returns(:test)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder
    get :edit, params: {id: 'course1'}
    assert_response :ok
  end

  test "should not get edit on staging" do
    CDO.stubs(:rack_env).returns(:staging)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder
    get :edit, params: {id: 'course1'}
    assert_response :forbidden
  end

  test "should not get edit if not signed in" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    get :edit, params: {id: 'course1'}

    assert_redirected_to_sign_in
  end

  test "should not get edit if not levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    [@not_admin, @admin].each do |user|
      sign_in user
      get :edit, params: {id: 'course1'}

      assert_response :forbidden
    end
  end

  test "edit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    script = Script.find_by_name('course1')
    get :edit, params: {id: script.name}

    assert_equal script, assigns(:script)
  end

  test 'platformization partner cannot create script' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    post :create, params: {
      script: {name: 'test-script-create'},
      script_text: ''
    }
    assert_response :forbidden
  end

  test "platformization partner cannot edit our scripts" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    get :edit, params: {id: @coursez_2019.id}
    assert_response :forbidden
  end

  test "platformization partner can edit their scripts" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    get :edit, params: {id: @partner_script.id}
    assert_response :success
  end

  test "platformization partner cannot update our scripts" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    patch :update, params: {
      id: @coursez_2019.id,
      script: {name: @coursez_2019.name},
      script_text: '',
    }
    assert_response :forbidden
  end

  test "platformization partner can update their scripts" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    stub_file_writes(@partner_script.name)

    sign_in @platformization_partner
    patch :update, params: {
      id: @partner_script.id,
      script: {name: @partner_script.name},
      script_text: '',
    }
    assert_response :success
  end

  # These two tests are the only remaining dependency on script seed order.  Check that /s/1 redirects to /s/20-hour in
  # production. On a fresh db the only guarantee that '20-hour.script' has id:1 is by manually specifying ID in the DSL.

  test "should redirect old k-8" do
    get :show, params: {id: 1}
    assert_redirected_to script_path(Script.twenty_hour_script)
  end

  test "show should redirect to flappy" do
    get :show, params: {id: 6}
    assert_redirected_to "/s/flappy"
  end

  test 'create' do
    script_name = 'test-script-create'
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with("#{Rails.root}/config/scripts/#{script_name}.script", "is_migrated true\n").once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{script_name}.script_json" && JSON.parse(contents)['script']['name'] == script_name
    end
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    post :create, params: {
      script: {name: script_name},
      is_migrated: true
    }
    assert_redirected_to edit_script_path id: script_name

    script = Script.find_by_name(script_name)
    assert_equal script_name, script.name
    assert script.is_migrated
  end

  test 'destroy raises exception for evil filenames' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    # Note that these script names (intentionally) fail model validation.
    [
      '~/evil_script_name',
      '../evil_script_name',
      'subdir/../../../evil_script_name'
    ].each do |name|
      evil_script = Script.new(name: name)
      evil_script.save(validate: false)
      assert_raise ArgumentError do
        delete :destroy, params: {id: evil_script.id}
      end
    end
  end

  test "cannot update on production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    script = create :script, hidden: true
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      hidden: false
    }
    assert_response :forbidden
    script.reload
    assert script.hidden
  end

  test "can update on levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    script = create :script, hidden: true
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{script.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{script.name}.script_json" && JSON.parse(contents)['script']['name'] == script.name
    end
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      hidden: false
    }
    assert_response :success
    script.reload
    refute script.hidden
    assert_equal false, JSON.parse(@response.body)['hidden']
  end

  test "can update on test without modifying filesystem" do
    CDO.stubs(:rack_env).returns(:test)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    script = create :script, hidden: true
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      hidden: false
    }
    assert_response :success
    script.reload
    refute script.hidden
  end

  test "cannot update on staging" do
    CDO.stubs(:rack_env).returns(:staging)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    script = create :script, hidden: true
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      hidden: false
    }
    assert_response :forbidden
    script.reload
    assert script.hidden
  end

  test 'cannot update if changes have been made to the database which are not reflected in the current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    error = assert_raises RuntimeError do
      post :update, params: {
        id: script.id,
        script: {name: script.name},
        script_text: '',
        old_script_text: 'different'
      }
    end

    assert_includes error.message, 'Could not update the script because the contents of one of its lessons or levels has changed outside of this editor. Reload the page and try saving again.'
  end

  test 'can update if database matches starting content for current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    create(
      :script_level,
      script: script,
      lesson: lesson,
      levels: [create(:maze)]
    )
    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      old_script_text: ScriptDSL.serialize_lesson_groups(script)
    }

    assert_response :success
  end

  test 'can update migrated script containing migrated script levels' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script, name: 'migrated', is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    activity = create :lesson_activity, lesson: lesson
    section = create :activity_section, lesson_activity: activity

    # A migrated script level is one with an activity section.
    create(
      :script_level,
      script: script,
      lesson: lesson,
      activity_section: section,
      activity_section_position: 1,
      levels: [create(:applab)]
    )

    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      is_migrated: true,
      script_text: ScriptDSL.serialize_lesson_groups(script),
    }
    assert_response :success
    assert script.is_migrated
    assert script.script_levels.any?
  end

  test 'cannot update migrated script containing legacy script levels' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script, name: 'migrated', is_migrated: true
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group, name: 'problem lesson'

    # A legacy script level is one without an activity section.
    create(
      :script_level,
      script: script,
      lesson: lesson,
      levels: [create(:applab)]
    )

    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      is_migrated: true,
      script_text: ScriptDSL.serialize_lesson_groups(script),
    }

    assert_response :not_acceptable
    msg = 'Legacy script levels are not allowed in migrated scripts. Problem lessons: [\"problem lesson\"]'
    assert_includes response.body, msg
    assert script.is_migrated
    assert script.script_levels.any?
  end

  test 'updates teacher resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      resourceTypes: ['curriculum', 'vocabulary', ''],
      resourceLinks: ['/link/to/curriculum', '/link/to/vocab', '']
    }
    assert_equal [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']], Script.find_by_name(script.name).teacher_resources
  end

  test 'updates migrated teacher resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script, hidden: true, is_migrated: true
    stub_file_writes(script.name)

    course_version = create :course_version, content_root: script
    teacher_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      resourceIds: teacher_resources.map(&:id),
      is_migrated: true
    }
    assert_equal teacher_resources.map(&:key), Script.find_by_name(script.name).resources.map {|r| r[:key]}
  end

  test 'updates migrated student resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script, hidden: true, is_migrated: true
    stub_file_writes(script.name)

    course_version = create :course_version, content_root: script
    student_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      studentResourceIds: student_resources.map(&:id),
      is_migrated: true
    }
    assert_equal student_resources.map(&:key), Script.find_by_name(script.name).student_resources.map {|r| r[:key]}
  end

  test 'updates pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      pilot_experiment: 'pilot-experiment',
      hidden: false
    }

    assert_response :success

    assert_equal 'pilot-experiment', Script.find_by_name(script.name).pilot_experiment
    # pilot scripts are always marked hidden
    assert Script.find_by_name(script.name).hidden
  end

  test 'does not hide script with blank pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      pilot_experiment: '',
      hidden: false
    }

    assert_response :success

    assert_nil Script.find_by_name(script.name).pilot_experiment
    # blank pilot_experiment does not cause script to be hidden
    refute Script.find_by_name(script.name).hidden
  end

  test 'update: can update general_params' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    assert_nil script.project_sharing
    assert_nil script.curriculum_umbrella
    assert_nil script.family_name
    assert_nil script.version_year

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      project_sharing: 'on',
      curriculum_umbrella: 'CSF',
      family_name: 'my-fam',
      version_year: '2017'
    }
    script.reload

    assert script.project_sharing
    assert_equal 'CSF', script.curriculum_umbrella
    assert_equal 'my-fam', script.family_name
    assert_equal '2017', script.version_year
  end

  test 'set_and_unset_teacher_resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    # Test doing this twice because teacher_resources in particular is set via its own code path in update_teacher_resources,
    # which can cause incorrect behavior if it is removed during the Script.add_script while being added via the
    # update_teacher_resources during the same call to Script.update_text
    2.times do
      post :update, params: {
        id: script.id,
        script: {name: script.name},
        script_text: '',
        resourceTypes: ['curriculum', 'something_else'],
        resourceLinks: ['/link/to/curriculum', 'link/to/something_else']
      }
      assert_response :success
      script.reload

      assert_equal [['curriculum', '/link/to/curriculum'], ['something_else', 'link/to/something_else']], script.teacher_resources
    end

    # Unset the properties.
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      resourceTypes: [''],
      resourceLinks: ['']
    }
    assert_response :success
    script.reload

    assert_nil script.teacher_resources
  end

  test 'set and unset all general_params' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    stub_file_writes(script.name)

    # Set most of the properties.
    # omitted: professional_learning_course, announcements because
    # using fake values doesn't seem to work for them.
    general_params = {
      hideable_lessons: 'on',
      project_widget_visible: 'on',
      student_detail_progress_view: 'on',
      lesson_extras_available: 'on',
      has_verified_resources: 'on',
      is_stable: 'on',
      tts: 'on',
      project_sharing: 'on',
      is_course: 'on',
      peer_reviews_to_complete: 1,
      curriculum_path: 'fake_curriculum_path',
      family_name: 'coursea',
      version_year: '2020',
      pilot_experiment: 'fake-pilot-experiment',
      editor_experiment: 'fake-editor-experiment',
      curriculum_umbrella: 'CSF',
      supported_locales: ['fake-locale'],
      project_widget_types: ['gamelab', 'weblab'],
      background: 'fake-background',
    }

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
    }.merge(general_params)
    assert_response :success
    script.reload

    general_params.each do |k, v|
      if v == 'on'
        assert_equal !!v, !!script.send(k), "Property didn't update: #{k}"
      else
        assert_equal v, script.send(k), "Property didn't update: #{k}"
      end
    end

    # Unset the properties.
    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      curriculum_path: '',
      version_year: '',
      pilot_experiment: '',
      editor_experiment: '',
      curriculum_umbrella: '',
      supported_locales: [],
      project_widget_types: [],
      background: ''
    }
    assert_response :success
    script.reload

    assert_equal({}, script.properties)
  end

  test 'add lesson to script' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    level = create :level
    script = create :script
    stub_file_writes(script.name)

    assert_empty script.lessons

    script_text = <<~SCRIPT_TEXT
      lesson 'stage 1', display_name: 'stage 1'
      level '#{level.name}'
    SCRIPT_TEXT

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: script_text,
    }
    script.reload

    assert_response :success
    assert_equal level, script.lessons.first.script_levels.first.level
    assert_equal 'stage 1', JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['name']
    assert_not_nil JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['id']
  end

  no_access_msg = "You don&#39;t have access to this unit."

  test_user_gets_response_for :show, response: :redirect, user: nil,
    params: -> {{id: @pilot_script.name}},
    name: 'signed out user cannot view pilot script'

  test_user_gets_response_for(:show, response: :success, user: :student,
    params: -> {{id: @pilot_script.name}}, name: 'student cannot view pilot script'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
    params: -> {{id: @pilot_script.name}},
    name: 'teacher without pilot access cannot view pilot script'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_teacher},
    params: -> {{id: @pilot_script.name, section_id: @pilot_section.id}},
    name: 'pilot teacher can view pilot script'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_student},
    params: -> {{id: @pilot_script.name}}, name: 'pilot student can view pilot script'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
    params: -> {{id: @pilot_script.name}}, name: 'levelbuilder can view pilot script'
  ) do
    refute response.body.include? no_access_msg
  end

  test 'should redirect to latest stable version in script family for student without progress or assignment' do
    sign_in create(:student)

    dogs1 = create :script, name: 'dogs1', family_name: 'ui-test-versioned-script', version_year: '1901'

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'ui-test-versioned-script'}
    end

    dogs1.update!(is_stable: true)
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs1"

    create :script, name: 'dogs2', family_name: 'ui-test-versioned-script', version_year: '1902', is_stable: true
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs2"

    create :script, name: 'dogs3', family_name: 'ui-test-versioned-script', version_year: '1899', is_stable: true
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs2"
  end

  test "levelbuilder does not see visible after warning if stage does not have visible_after property" do
    sign_in @levelbuilder

    get :show, params: {id: 'course1'}
    assert_response :success
    refute response.body.include? 'visible after'
  end

  test "levelbuilder does not see visible after warning if stage has visible_after property that is in the past" do
    Timecop.freeze(Time.new(2020, 4, 2))
    sign_in @levelbuilder

    create(:level, name: "Level 1")
    script_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([script_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test "levelbuilder sees visible after warning if stage has visible_after property that is in the future" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in @levelbuilder

    create(:level, name: "Level 1")
    script_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([script_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    assert response.body.include? 'The lesson lesson 1 will be visible after'
    Timecop.return
  end

  test "student does not see visible after warning if stage has visible_after property" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in create(:student)

    create(:level, name: "Level 1")
    script_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([script_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test "teacher does not see visible after warning if stage has visible_after property" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in create(:teacher)

    create(:level, name: "Level 1")
    script_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([script_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test_user_gets_response_for :vocab, response: :success, user: :teacher, params: -> {{id: @migrated_script.name}}
  test_user_gets_response_for :vocab, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_script.name}}

  test_user_gets_response_for :resources, response: :success, user: :teacher, params: -> {{id: @migrated_script.name}}
  test_user_gets_response_for :resources, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_script.name}}

  test_user_gets_response_for :standards, response: :success, user: :teacher, params: -> {{id: @migrated_script.name}}
  test_user_gets_response_for :standards, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_script.name}}

  test_user_gets_response_for :code, response: :success, user: :teacher, params: -> {{id: @migrated_script.name}}
  test_user_gets_response_for :code, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_script.name}}

  test "view all instructions page for migrated script" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    get :instructions, params: {id: @migrated_script.name}
    assert_response :success
  end

  test "view all instructions page for unmigrated script" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    get :instructions, params: {id: @unmigrated_script.name}
    assert_response :success
  end

  test "get_rollup_resources return rollups for a script with code, resources, standards, and vocab" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @migrated_script
    lesson_group = create :lesson_group, script: @migrated_script
    lesson = create :lesson, lesson_group: lesson_group
    lesson.programming_expressions = [create(:programming_expression)]
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]
    lesson.vocabularies = [create(:vocabulary, course_version_id: course_version.id)]

    get :get_rollup_resources, params: {id: @migrated_script.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 4, response_body.length
    assert_equal ['All Code', 'All Resources', 'All Standards', 'All Vocabulary'], response_body.map {|r| r['name']}
  end

  test "get_rollup_resources doesn't return rollups if no lesson in a script has the associated object" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @migrated_script
    lesson_group = create :lesson_group, script: @migrated_script
    lesson = create :lesson, lesson_group: lesson_group
    # Only add resources and standards, not programming expressions and vocab
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]

    get :get_rollup_resources, params: {id: @migrated_script.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 2, response_body.length
    assert_equal ['All Resources', 'All Standards'], response_body.map {|r| r['name']}
  end

  def stub_file_writes(script_name)
    filenames_to_stub = ["#{Rails.root}/config/scripts/#{script_name}.script", "#{Rails.root}/config/scripts_json/#{script_name}.script_json"]
    File.stubs(:write).with do |filename, _|
      filenames_to_stub.include?(filename) || filename.end_with?('scripts.en.yml')
    end
  end
end
