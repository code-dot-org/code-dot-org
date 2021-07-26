require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:user)
    @platformization_partner = create(:platformization_partner)
    @levelbuilder = create(:levelbuilder)

    @in_development_unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.in_development

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit = create :script, pilot_experiment: 'my-experiment', published_state: SharedConstants::PUBLISHED_STATE.pilot
    @pilot_section = create :section, user: @pilot_teacher, script: @pilot_unit
    @pilot_student = create(:follower, section: @pilot_section).student_user

    @no_progress_or_assignment_student = create :student

    @coursez_2017 = create :script, name: 'coursez-2017', family_name: 'coursez', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    @coursez_2018 = create :script, name: 'coursez-2018', family_name: 'coursez', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable
    @coursez_2019 = create :script, name: 'coursez-2019', family_name: 'coursez', version_year: '2019', published_state: SharedConstants::PUBLISHED_STATE.beta
    @partner_unit = create :script, editor_experiment: 'platformization-partners', published_state: SharedConstants::PUBLISHED_STATE.beta

    @student_coursez_2017 = create :student
    @section_coursez_2017 = create :section, script: @coursez_2017
    @section_coursez_2017.add_student(@student_coursez_2017)

    @migrated_unit = create :script, is_migrated: true
    @unmigrated_unit = create :script

    Rails.application.config.stubs(:levelbuilder_mode).returns false
    File.stubs(:write)
  end

  test "should get index" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    sign_in(@levelbuilder)
    get :index
    assert_response :success
    assert_not_nil assigns(:scripts)
    assert_equal Script.all, assigns(:scripts)
  end

  test "should redirect when unit has a redirect_to property" do
    unit = create :script
    new_unit = create :script
    unit.update(redirect_to: new_unit.name)

    get :show, params: {id: unit.name}
    assert_redirected_to "/s/#{new_unit.name}"
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

  test "should get show of custom unit" do
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

  test "should use unit name as param where unit name is words but looks like a number" do
    unit = create(:script, name: '15-16')
    get :show, params: {id: "15-16"}

    assert_response :success
    assert_equal unit, assigns(:script)
  end

  test "should use unit name as param where unit name is words" do
    unit = create(:script, name: 'Heure de Code', skip_name_format_validation: true)
    get :show, params: {id: "Heure de Code"}

    assert_response :success
    assert_equal unit, assigns(:script)
  end

  test "show get show if family name matches script name" do
    unit = create(:script, name: 'hoc-script', family_name: 'hoc-script', version_year: 'unversioned', is_course: true)
    CourseOffering.add_course_offering(unit)
    get :show, params: {id: 'hoc-script'}

    assert_response :success
    assert_equal unit, assigns(:script)
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
  test "show: do not redirect student to latest stable version in family if they can view the unit version" do
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
    unit = Script.find_by_name('course1')
    get :edit, params: {id: unit.name}

    assert_equal unit, assigns(:script)
  end

  test 'platformization partner cannot create unit' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    post :create, params: {
      script: {name: 'test-unit-create'},
      script_text: '',
      is_migrated: true
    }
    assert_response :forbidden
  end

  test "platformization partner cannot edit our units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    get :edit, params: {id: @coursez_2019.id}
    assert_response :forbidden
  end

  test "platformization partner can edit their units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    get :edit, params: {id: @partner_unit.id}
    assert_response :success
  end

  test "platformization partner cannot update our units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @platformization_partner
    patch :update, params: {
      id: @coursez_2019.id,
      script: {name: @coursez_2019.name},
      script_text: '',
    }
    assert_response :forbidden
  end

  test "platformization partner can update their units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    stub_file_writes(@partner_unit.name)

    sign_in @platformization_partner
    patch :update, params: {
      id: @partner_unit.id,
      script: {name: @partner_unit.name},
      script_text: '',
    }
    assert_response :success
  end

  # These two tests are the only remaining dependency on script seed order.  Check that /s/1 redirects to /s/20-hour in
  # production. On a fresh db the only guarantee that '20-hour.script' has id:1 is by manually specifying ID in the DSL.

  test "should redirect old k-8" do
    get :show, params: {id: 1}
    assert_redirected_to script_path(Script.twenty_hour_unit)
  end

  test "show should redirect to flappy" do
    get :show, params: {id: 6}
    assert_redirected_to "/s/flappy"
  end

  test 'create' do
    unit_name = 'test-unit-create'
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with("#{Rails.root}/config/scripts/#{unit_name}.script", "is_migrated true\n").once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit_name}.script_json" && JSON.parse(contents)['script']['name'] == unit_name
    end
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    post :create, params: {
      script: {name: unit_name},
      is_migrated: true
    }
    assert_redirected_to edit_script_path id: unit_name

    unit = Script.find_by_name(unit_name)
    assert_equal unit_name, unit.name
    assert unit.is_migrated
  end

  test 'cannot create legacy unit' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit_name = 'legacy'
    post :create, params: {
      script: {name: unit_name},
    }

    assert_response :bad_request
    refute Script.find_by_name(unit_name)
  end

  test 'destroy raises exception for evil filenames' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    # Note that these unit names (intentionally) fail model validation.
    [
      '~/evil_unit_name',
      '../evil_unit_name',
      'subdir/../../../evil_unit_name'
    ].each do |name|
      evil_unit = Script.new(name: name)
      evil_unit.save(validate: false)
      assert_raise ArgumentError do
        delete :destroy, params: {id: evil_unit.id}
      end
    end
  end

  test "cannot update on production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    assert_response :forbidden
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.beta
  end

  test "can update on levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.preview
  end

  test "update published state to in_development" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.in_development
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.in_development
  end

  test "update published state to pilot" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.preview
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.pilot,
      pilot_experiment: 'my-pilot'
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.pilot
  end

  test "update published state to beta" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.preview
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.beta
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.beta
  end

  test "update published state to preview" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.preview
  end

  test "update published state to stable" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with {|filename, _| filename == "#{Rails.root}/config/scripts/#{unit.name}.script"}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.stable
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.stable
  end

  test "can update on test without modifying filesystem" do
    CDO.stubs(:rack_env).returns(:test)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.preview
  end

  test "cannot update on staging" do
    CDO.stubs(:rack_env).returns(:staging)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }
    assert_response :forbidden
    unit.reload
    assert_equal unit.get_published_state, SharedConstants::PUBLISHED_STATE.beta
  end

  test 'cannot update if changes have been made to the database which are not reflected in the current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    error = assert_raises RuntimeError do
      post :update, params: {
        id: unit.id,
        script: {name: unit.name},
        script_text: '',
        old_unit_text: 'different'
      }
    end

    assert_includes error.message, 'Could not update the unit because the contents of one of its lessons or levels has changed outside of this editor. Reload the page and try saving again.'
  end

  test 'can update if database matches starting content for current edit page' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    create(
      :script_level,
      script: unit,
      lesson: lesson,
      levels: [create(:maze)]
    )
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      old_unit_text: ScriptDSL.serialize_lesson_groups(unit)
    }

    assert_response :success
  end

  test 'can update migrated unit containing migrated script levels' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, name: 'migrated', is_migrated: true
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    activity = create :lesson_activity, lesson: lesson
    section = create :activity_section, lesson_activity: activity

    # A migrated script level is one with an activity section.
    create(
      :script_level,
      script: unit,
      lesson: lesson,
      activity_section: section,
      activity_section_position: 1,
      levels: [create(:applab)]
    )

    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      script_text: ScriptDSL.serialize_lesson_groups(unit),
    }
    assert_response :success
    assert unit.is_migrated
    assert unit.script_levels.any?
  end

  test 'cannot update migrated unit containing legacy script levels' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, name: 'migrated', is_migrated: true
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group, name: 'problem lesson'

    # A legacy script level is one without an activity section.
    create(
      :script_level,
      script: unit,
      lesson: lesson,
      levels: [create(:applab)]
    )

    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      script_text: ScriptDSL.serialize_lesson_groups(unit),
    }

    assert_response :not_acceptable
    msg = 'Legacy script levels are not allowed in migrated units. Problem lessons: [\"problem lesson\"]'
    assert_includes response.body, msg
    assert unit.is_migrated
    assert unit.script_levels.any?
  end

  test 'updates teacher resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      resourceTypes: ['curriculum', 'vocabulary', ''],
      resourceLinks: ['/link/to/curriculum', '/link/to/vocab', '']
    }
    assert_equal [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']], Script.find_by_name(unit.name).teacher_resources
  end

  test 'updates migrated teacher resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta, is_migrated: true
    stub_file_writes(unit.name)

    course_version = create :course_version, content_root: unit
    teacher_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      resourceIds: teacher_resources.map(&:id),
      is_migrated: true
    }
    assert_equal teacher_resources.map(&:key), Script.find_by_name(unit.name).resources.map {|r| r[:key]}
  end

  test 'updates migrated student resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, published_state: SharedConstants::PUBLISHED_STATE.beta, is_migrated: true
    stub_file_writes(unit.name)

    course_version = create :course_version, content_root: unit
    student_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      studentResourceIds: student_resources.map(&:id),
      is_migrated: true
    }
    assert_equal student_resources.map(&:key), Script.find_by_name(unit.name).student_resources.map {|r| r[:key]}
  end

  test 'updates pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      pilot_experiment: 'pilot-experiment',
      published_state: SharedConstants::PUBLISHED_STATE.pilot
    }

    assert_response :success

    assert_equal 'pilot-experiment', Script.find_by_name(unit.name).pilot_experiment
    # pilot units are always marked with the pilot published state
    assert_equal Script.find_by_name(unit.name).get_published_state, SharedConstants::PUBLISHED_STATE.pilot
  end

  test 'does not hide unit with blank pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      pilot_experiment: '',
      published_state: SharedConstants::PUBLISHED_STATE.preview
    }

    assert_response :success

    assert_nil Script.find_by_name(unit.name).pilot_experiment
    # blank pilot_experiment does not cause unit to have published_state of pilot
    assert_equal Script.find_by_name(unit.name).get_published_state, SharedConstants::PUBLISHED_STATE.preview
  end

  test 'update: can update general_params' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    assert_nil unit.project_sharing
    assert_nil unit.curriculum_umbrella
    assert_nil unit.family_name
    assert_nil unit.version_year

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      project_sharing: 'on',
      curriculum_umbrella: 'CSF',
      family_name: 'my-fam',
      version_year: '2017',
      is_maker_unit: 'on'
    }
    unit.reload

    assert unit.project_sharing
    assert_equal 'CSF', unit.curriculum_umbrella
    assert_equal 'my-fam', unit.family_name
    assert_equal '2017', unit.version_year
    assert unit.is_maker_unit
  end

  test 'set_and_unset_teacher_resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    # Test doing this twice because teacher_resources in particular is set via its own code path in update_teacher_resources,
    # which can cause incorrect behavior if it is removed during the Script.add_unit while being added via the
    # update_teacher_resources during the same call to Script.update_text
    2.times do
      post :update, params: {
        id: unit.id,
        script: {name: unit.name},
        script_text: '',
        resourceTypes: ['curriculum', 'something_else'],
        resourceLinks: ['/link/to/curriculum', 'link/to/something_else']
      }
      assert_response :success
      unit.reload

      assert_equal [['curriculum', '/link/to/curriculum'], ['something_else', 'link/to/something_else']], unit.teacher_resources
    end

    # Unset the properties.
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      resourceTypes: [''],
      resourceLinks: ['']
    }
    assert_response :success
    unit.reload

    assert_nil unit.teacher_resources
  end

  test 'set and unset all general_params' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    # Set most of the properties.
    # omitted: professional_learning_course, announcements because
    # using fake values doesn't seem to work for them.
    general_params = {
      hideable_lessons: 'on',
      project_widget_visible: 'on',
      student_detail_progress_view: 'on',
      lesson_extras_available: 'on',
      has_verified_resources: 'on',
      published_state: SharedConstants::PUBLISHED_STATE.pilot,
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
    }

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
    }.merge(general_params)
    assert_response :success
    unit.reload

    general_params.each do |k, v|
      if v == 'on'
        assert_equal !!v, !!unit.send(k), "Property didn't update: #{k}"
      else
        assert_equal v, unit.send(k), "Property didn't update: #{k}"
      end
    end

    # Unset the properties.
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: '',
      curriculum_path: '',
      version_year: '',
      published_state: SharedConstants::PUBLISHED_STATE.beta,
      pilot_experiment: '',
      editor_experiment: '',
      curriculum_umbrella: '',
      supported_locales: [],
      project_widget_types: [],
    }
    assert_response :success
    unit.reload

    assert_equal({}, unit.properties)
  end

  test 'add lesson to unit' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    level = create :level
    unit = create :script
    stub_file_writes(unit.name)

    assert_empty unit.lessons

    unit_text = <<~UNIT_TEXT
      lesson 'lesson 1', display_name: 'lesson 1'
      level '#{level.name}'
    UNIT_TEXT

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      script_text: unit_text,
    }
    unit.reload

    assert_response :success
    assert_equal level, unit.lessons.first.script_levels.first.level
    assert_equal 'lesson 1', JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['name']
    assert_not_nil JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['id']
  end

  no_access_msg = "You don&#39;t have access to this unit."

  test_user_gets_response_for :show, response: :redirect, user: nil,
    params: -> {{id: @pilot_unit.name}},
    name: 'signed out user cannot view pilot unit'

  test_user_gets_response_for(:show, response: :success, user: :student,
    params: -> {{id: @pilot_unit.name}}, name: 'student cannot view pilot unit'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
    params: -> {{id: @pilot_unit.name}},
    name: 'teacher without pilot access cannot view pilot unit'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_teacher},
    params: -> {{id: @pilot_unit.name, section_id: @pilot_section.id}},
    name: 'pilot teacher can view pilot unit'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: -> {@pilot_student},
    params: -> {{id: @pilot_unit.name}}, name: 'pilot student can view pilot unit'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
    params: -> {{id: @pilot_unit.name}}, name: 'levelbuilder can view pilot unit'
  ) do
    refute response.body.include? no_access_msg
  end

  test_user_gets_response_for :show, response: :redirect, user: nil,
                              params: -> {{id: @in_development_unit.name}},
                              name: 'signed out user cannot view in-development unit'

  test_user_gets_response_for(:show, response: :success, user: :student,
                              params: -> {{id: @in_development_unit.name}}, name: 'student cannot view in-development unit'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :teacher,
                              params: -> {{id: @in_development_unit.name}},
                              name: 'teacher cannot view in-development unit'
  ) do
    assert response.body.include? no_access_msg
  end

  test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
                              params: -> {{id: @in_development_unit.name}}, name: 'levelbuilder can view in-development unit'
  ) do
    refute response.body.include? no_access_msg
  end

  test 'should redirect to latest stable version in unit family for student without progress or assignment' do
    sign_in create(:student)

    dogs1 = create :script, name: 'dogs1', family_name: 'ui-test-versioned-script', version_year: '1901', is_course: true
    CourseOffering.add_course_offering(dogs1)

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'ui-test-versioned-script'}
    end

    dogs1.update!(published_state: SharedConstants::PUBLISHED_STATE.stable)
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs1"

    create :script, name: 'dogs2', family_name: 'ui-test-versioned-script', version_year: '1902', published_state: SharedConstants::PUBLISHED_STATE.stable
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs2"

    create :script, name: 'dogs3', family_name: 'ui-test-versioned-script', version_year: '1899', published_state: SharedConstants::PUBLISHED_STATE.stable
    get :show, params: {id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/dogs2"
  end

  test "levelbuilder does not see visible after warning if lesson does not have visible_after property" do
    sign_in @levelbuilder

    get :show, params: {id: 'course1'}
    assert_response :success
    refute response.body.include? 'visible after'
  end

  test "levelbuilder does not see visible after warning if lesson has visible_after property that is in the past" do
    Timecop.freeze(Time.new(2020, 4, 2))
    sign_in @levelbuilder

    create(:level, name: "Level 1")
    unit_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([unit_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test "levelbuilder sees visible after warning if lesson has visible_after property that is in the future" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in @levelbuilder

    create(:level, name: "Level 1")
    unit_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([unit_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    assert response.body.include? 'The lesson lesson 1 will be visible after'
    Timecop.return
  end

  test "student does not see visible after warning if lesson has visible_after property" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in create(:student)

    create(:level, name: "Level 1")
    unit_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([unit_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test "teacher does not see visible after warning if lesson has visible_after property" do
    Timecop.freeze(Time.new(2020, 3, 27))
    sign_in create(:teacher)

    create(:level, name: "Level 1")
    unit_file = File.join(self.class.fixture_path, "test-fixture-visible-after.script")
    Script.setup([unit_file])

    get :show, params: {id: 'test-fixture-visible-after'}
    assert_response :success
    refute response.body.include? 'visible after'
    Timecop.return
  end

  test_user_gets_response_for :vocab, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}
  test_user_gets_response_for :vocab, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for :resources, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}
  test_user_gets_response_for :resources, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for :standards, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}
  test_user_gets_response_for :standards, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for :code, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}
  test_user_gets_response_for :code, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test "view all instructions page for migrated unit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    get :instructions, params: {id: @migrated_unit.name}
    assert_response :success
  end

  test "view all instructions page for unmigrated unit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    get :instructions, params: {id: @unmigrated_unit.name}
    assert_response :success
  end

  test "get_rollup_resources return rollups for a unit with code, resources, standards, and vocab" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @migrated_unit
    lesson_group = create :lesson_group, script: @migrated_unit
    lesson = create :lesson, lesson_group: lesson_group
    lesson.programming_expressions = [create(:programming_expression)]
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]
    lesson.vocabularies = [create(:vocabulary, course_version_id: course_version.id)]

    get :get_rollup_resources, params: {id: @migrated_unit.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 4, response_body.length
    assert_equal ['All Code', 'All Resources', 'All Standards', 'All Vocabulary'], response_body.map {|r| r['name']}
  end

  test "get_rollup_resources doesn't return rollups if no lesson in a unit has the associated object" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    course_version = create :course_version, content_root: @migrated_unit
    lesson_group = create :lesson_group, script: @migrated_unit
    lesson = create :lesson, lesson_group: lesson_group
    # Only add resources and standards, not programming expressions and vocab
    lesson.resources = [create(:resource, course_version_id: course_version.id)]
    lesson.standards = [create(:standard)]

    get :get_rollup_resources, params: {id: @migrated_unit.name}
    assert_response :success
    response_body = JSON.parse(@response.body)
    assert_equal 2, response_body.length
    assert_equal ['All Resources', 'All Standards'], response_body.map {|r| r['name']}
  end

  test "get_unit bypasses cache for edit route" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(@levelbuilder)

    Script.expects(:get_from_cache).never
    Script.expects(:get_without_cache).with(@migrated_unit.name, with_associated_models: true).returns(@migrated_unit).once
    get :edit, params: {id: @migrated_unit.name}

    Script.expects(:get_from_cache).with(@migrated_unit.name, raise_exceptions: false).returns(@migrated_unit).once
    Script.expects(:get_without_cache).never
    get :show, params: {id: @migrated_unit.name}
  end

  def stub_file_writes(unit_name)
    filenames_to_stub = ["#{Rails.root}/config/scripts/#{unit_name}.script", "#{Rails.root}/config/scripts_json/#{unit_name}.script_json"]
    File.stubs(:write).with do |filename, _|
      filenames_to_stub.include?(filename) || filename.end_with?('scripts.en.yml')
    end
  end
end
