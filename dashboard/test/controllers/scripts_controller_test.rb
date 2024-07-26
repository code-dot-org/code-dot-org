require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    seed_deprecated_unit_fixtures
  end

  setup do
    @coursez_2017 = create :script, name: 'coursez-2017', family_name: 'coursez', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    @coursez_2018 = create :script, name: 'coursez-2018', family_name: 'coursez', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    @coursez_2019 = create :script, name: 'coursez-2019', family_name: 'coursez', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    @partner_unit = create :script, editor_experiment: 'platformization-partners', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta

    @pl_coursez_2017 = create :script, name: 'pl-coursez-2017', family_name: 'pl-coursez', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    @pl_coursez_2018 = create :script, name: 'pl-coursez-2018', family_name: 'pl-coursez', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    @pl_coursez_2019 = create :script, name: 'pl-coursez-2019', family_name: 'pl-coursez', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    @migrated_unit = create :script
    @migrated_pl_unit = create :script, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    @unmigrated_unit = create :script, is_migrated: false

    Rails.application.config.stubs(:levelbuilder_mode).returns false
    File.stubs(:write)
  end

  test "should get index" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    sign_in(create(:levelbuilder))
    get :index
    assert_response :success
    refute_nil assigns(:scripts)
    assert_equal Unit.all, assigns(:scripts)
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
    admin = create(:admin)
    not_admin = create(:user)
    [admin, not_admin].each do |user|
      sign_in user

      get :index

      assert_response :forbidden
    end
  end

  test "should get show of hoc" do
    get :show, params: {id: Unit::HOC_NAME}
    assert_response :success
  end

  test "should get show of k-8" do
    get :show, params: {id: Unit::TWENTY_HOUR_NAME}
    assert_response :success
  end

  test "should get show of custom unit" do
    get :show, params: {id: 'course1'}
    assert_response :success
  end

  test "should get show of ECSPD if signed in" do
    not_admin = create(:user)
    sign_in not_admin
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

  test "show of hourofcode redirects to hoc" do
    get :show, params: {id: 'hourofcode'}
    assert_response :success
  end

  test "should get show if not signed in" do
    get :show, params: {id: Unit::FLAPPY_NAME}
    assert_response :success
  end

  test "should get show if not admin" do
    not_admin = create(:user)
    sign_in not_admin
    get :show, params: {id: Unit::FLAPPY_NAME}
    assert_response :success
  end

  test 'should not get show if admin' do
    admin = create(:admin)
    sign_in admin
    get :show, params: {id: Unit::FLAPPY_NAME}
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
    sign_in create(:student)
    get :show, params: {id: @coursez_2018.name}
    assert_response :success
  end

  test "show: do not redirect when showing latest stable version in family for participant" do
    sign_in create(:teacher)
    get :show, params: {id: @pl_coursez_2018.name}
    assert_response :success
  end

  test "show: redirect from older version to latest stable version in family for student" do
    sign_in create(:student)
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: do not redirect from older version to latest stable version in family for someone who can not be participant or instructor" do
    sign_in create(:student)
    get :show, params: {id: @pl_coursez_2017.name}
    assert_response :success
    assert_includes(response.body, "You don&#39;t have access to this unit.")
  end

  test "show: redirect from older version to latest stable version in family for participant" do
    sign_in create(:teacher)
    get :show, params: {id: @pl_coursez_2017.name}
    assert_redirected_to "/s/#{@pl_coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from older version to latest stable version in family for logged out user" do
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to latest stable version in family for student" do
    sign_in create(:student)
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to latest stable version in family for participant" do
    sign_in create(:teacher)
    get :show, params: {id: @pl_coursez_2019.name}
    assert_redirected_to "/s/#{@pl_coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to latest stable version in family for logged out user" do
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to assigned version for student" do
    student_coursez_2017 = create :student
    section_coursez_2017 = create :section, script: @coursez_2017
    section_coursez_2017.add_student(student_coursez_2017)

    sign_in student_coursez_2017
    get :show, params: {id: @coursez_2019.name}
    assert_redirected_to "/s/#{@coursez_2017.name}?redirect_warning=true"
  end

  test "show: redirect from new unstable version to assigned version for participant" do
    participant_pl_coursez_2017 = create :teacher
    section_pl_coursez_2017 = create :section, script: @pl_coursez_2017
    section_pl_coursez_2017.add_student(participant_pl_coursez_2017)

    sign_in participant_pl_coursez_2017
    get :show, params: {id: @pl_coursez_2019.name}
    assert_redirected_to "/s/#{@pl_coursez_2017.name}?redirect_warning=true"
  end

  # There are tests on can_view_version? in script_test.rb which verify that it returns true if a student is assigned
  # or has made progress in a different version from the latest stable version. This test verifies that ultimately
  # the student is not redirected if true is returned.
  test "show: do not redirect student to latest stable version in family if they can view the unit version" do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    sign_in create(:student)
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect participant to latest stable version in family if they can view the unit version" do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    sign_in create(:teacher)
    get :show, params: {id: @pl_coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in family" do
    sign_in create(:teacher)
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect instructor to latest stable version in family" do
    sign_in create(:facilitator)
    get :show, params: {id: @pl_coursez_2017.name}
    assert_response :ok
  end

  test "should not get edit on production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)
    get :edit, params: {id: 'course1'}
    assert_response :forbidden
  end

  test "should get edit on levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)
    get :edit, params: {id: 'course1'}
    assert_response :ok
  end

  test "should not be able to edit on levelbuilder in locale besides en-US" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)
    with_default_locale(:de) do
      get :edit, params: {id: 'course1'}
    end
    assert_redirected_to "/"
  end

  test "should get edit on test" do
    CDO.stubs(:rack_env).returns(:test)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)
    get :edit, params: {id: 'course1'}
    assert_response :ok
  end

  test "should not get edit on staging" do
    CDO.stubs(:rack_env).returns(:staging)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)
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
    admin = create(:admin)
    not_admin = create(:user)
    [not_admin, admin].each do |user|
      sign_in user
      get :edit, params: {id: 'course1'}

      assert_response :forbidden
    end
  end

  test "edit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)
    unit = Unit.find_by_name('course1')
    get :edit, params: {id: unit.name}

    assert_equal unit, assigns(:script)
  end

  test 'platformization partner cannot create unit' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:platformization_partner)
    post :create, params: {
      script: {name: 'test-unit-create'},
      is_migrated: true
    }
    assert_response :forbidden
  end

  test "platformization partner cannot edit our units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:platformization_partner)
    get :edit, params: {id: @coursez_2019.name}
    assert_response :forbidden
  end

  test "platformization partner can edit their units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:platformization_partner)
    get :edit, params: {id: @partner_unit.name}
    assert_response :success
  end

  test "platformization partner cannot update our units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:platformization_partner)
    patch :update, params: {
      id: @coursez_2019.id,
      script: {name: @coursez_2019.name},
      is_migrated: true,
      lesson_groups: '[]',
    }
    assert_response :forbidden
  end

  test "platformization partner can update their units" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    stub_file_writes(@partner_unit.name)

    sign_in create(:platformization_partner)
    patch :update, params: {
      id: @partner_unit.id,
      script: {name: @partner_unit.name},
      is_migrated: true,
      lesson_groups: '[]',
    }
    assert_response :success
  end

  test 'create' do
    unit_name = 'test-unit-create'
    @request.host = CDO.dashboard_hostname
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit_name}.script_json" && JSON.parse(contents)['script']['name'] == unit_name
    end
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    post :create, params: {
      script: {name: unit_name},
      lesson_groups: '[]',
      is_migrated: true
    }
    assert_redirected_to edit_script_path id: unit_name

    unit = Unit.find_by_name(unit_name)
    assert_equal unit_name, unit.name
    assert unit.is_migrated
    assert_equal unit.published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    assert_equal unit.instruction_type, Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
    assert_equal unit.instructor_audience, Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
    assert_equal unit.participant_audience, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
  end

  test 'create: sets course type if provided' do
    unit_name = 'test-pl-unit-create'
    @request.host = CDO.dashboard_hostname
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit_name}.script_json" && JSON.parse(contents)['script']['name'] == unit_name
    end
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    post :create, params: {
      script: {name: unit_name},
      lesson_groups: '[]',
      is_migrated: true,
      instruction_type: 'self_paced',
      instructor_audience: 'universal_instructor',
      participant_audience: 'teacher'
    }
    assert_redirected_to edit_script_path id: unit_name

    unit = Unit.find_by_name(unit_name)
    assert_equal unit_name, unit.name
    assert unit.is_migrated
    assert_equal unit.published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    assert_equal unit.instruction_type, Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced
    assert_equal unit.instructor_audience, Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor
    assert_equal unit.participant_audience, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
  end

  test 'cannot create legacy unit' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit_name = 'legacy'
    post :create, params: {
      script: {name: unit_name},
    }

    assert_response :bad_request
    refute Unit.find_by_name(unit_name)
  end

  test 'destroy raises exception for evil filenames' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    # Note that these unit names (intentionally) fail model validation.
    [
      '~/evil_unit_name',
      '../evil_unit_name',
      'subdir/../../../evil_unit_name'
    ].each do |name|
      evil_unit = Unit.new(name: name)
      evil_unit.save(validate: false)
      assert_raise ArgumentError do
        delete :destroy, params: {id: evil_unit.name}
      end
    end
  end

  test 'destroy successfully deletes the unit' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit_to_delete = create :script
    delete :destroy, params: {id: unit_to_delete.name}

    assert_response :found
    assert_nil Unit.find_by(name: unit_to_delete.name)
  end

  test "cannot update on production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }
    assert_response :forbidden
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
  end

  test "can update on levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
  end

  test "update instruction_type" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_instruction_type, Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced
  end

  test "update published state to in_development" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
  end

  test "update published state to pilot" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot,
      pilot_experiment: 'my-pilot'
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
  end

  test "update published state to beta" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
  end

  test "update published state to preview" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
  end

  test "update published state to stable" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with do |filename, contents|
      filename == "#{Rails.root}/config/scripts_json/#{unit.name}.script_json" && JSON.parse(contents)['script']['name'] == unit.name
    end
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
  end

  test "can update on test without modifying filesystem" do
    CDO.stubs(:rack_env).returns(:test)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }
    assert_response :success
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
  end

  test "cannot update on staging" do
    CDO.stubs(:rack_env).returns(:staging)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in create(:levelbuilder)

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    File.stubs(:write).raises('must not modify filesystem')
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }
    assert_response :forbidden
    unit.reload
    assert_equal unit.get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
  end

  test 'cannot update unmigrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: false
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
    }
    assert_response :bad_request
  end

  test 'updating migrated unit without differences updates timestamp' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    Timecop.freeze do
      unit = create :script, is_migrated: true
      lesson_group = create :lesson_group, script: unit
      create :lesson, script: unit, lesson_group: lesson_group
      stub_file_writes(unit.name)

      unit.reload
      lesson_groups_json = unit.lesson_groups.map(&:summarize_for_unit_edit).to_json
      updated_at = unit.updated_at

      Timecop.travel 1.minute

      post :update, params: {
        id: unit.id,
        script: {name: unit.name},
        is_migrated: true,
        last_updated_at: updated_at.to_s,
        lesson_groups: lesson_groups_json
      }
      assert_response :success
      unit.reload
      refute_equal updated_at, unit.updated_at
    end
  end

  test 'cannot update migrated unit with outdated timestamp' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit
    create :lesson, script: unit, lesson_group: lesson_group
    stub_file_writes(unit.name)

    unit.reload
    timestamp = (unit.updated_at - 1).to_s

    e = assert_raises do
      post :update, params: {
        id: unit.id,
        script: {name: unit.name},
        is_migrated: true,
        lesson_groups: '[]',
        last_updated_at: timestamp
      }
    end
    assert_includes e.message, 'Could not update the unit because it has been modified more recently outside of this editor.'
  end

  test 'can update migrated unit containing migrated script levels' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, :with_levels, name: 'migrated'

    stub_file_writes(unit.name)
    unit.reload
    lesson_groups_json = unit.lesson_groups.map(&:summarize_for_unit_edit).to_json
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s,
    }
    assert_response :success
    assert unit.is_migrated
    assert unit.script_levels.any?
  end

  test 'cannot update migrated unit containing legacy script levels' do
    sign_in create(:levelbuilder)
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
    unit.reload
    lesson_groups_json = unit.lesson_groups.map(&:summarize_for_unit_edit).to_json
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s,
    }

    assert_response :not_acceptable
    msg = 'Legacy script levels are not allowed in migrated units. Problem lessons: [\"problem lesson\"]'
    assert_includes response.body, msg
    assert unit.is_migrated
    assert unit.script_levels.any?
  end

  test 'updates migrated teacher resources' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, is_migrated: true
    stub_file_writes(unit.name)

    course_version = create :course_version, content_root: unit
    teacher_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      lesson_groups: '[]',
      resourceIds: teacher_resources.map(&:id),
      is_migrated: true,
      last_updated_at: unit.updated_at.to_s,
    }
    assert_equal(teacher_resources.map(&:key), Unit.find_by_name(unit.name).resources.map {|r| r[:key]})
  end

  test 'updates migrated student resources' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, is_migrated: true
    stub_file_writes(unit.name)

    course_version = create :course_version, content_root: unit
    student_resources = [
      create(:resource, course_version: course_version),
      create(:resource, course_version: course_version)
    ]

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      lesson_groups: '[]',
      studentResourceIds: student_resources.map(&:id),
      is_migrated: true,
      last_updated_at: unit.updated_at.to_s,
    }
    assert_equal(student_resources.map(&:key), Unit.find_by_name(unit.name).student_resources.map {|r| r[:key]})
  end

  test 'updates pilot_experiment' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      pilot_experiment: 'pilot-experiment',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
    }

    assert_response :success

    assert_equal 'pilot-experiment', Unit.find_by_name(unit.name).pilot_experiment
    # pilot units are always marked with the pilot published state
    assert_equal Unit.find_by_name(unit.name).get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
  end

  test 'does not hide unit with blank pilot_experiment' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      pilot_experiment: '',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    }

    assert_response :success

    assert_nil Unit.find_by_name(unit.name).pilot_experiment
    # blank pilot_experiment does not cause unit to have published_state of pilot
    assert_equal Unit.find_by_name(unit.name).get_published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
  end

  test 'update: can update general_params' do
    sign_in create(:levelbuilder)
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
      is_migrated: true,
      lesson_groups: '[]',
      project_sharing: 'on',
      curriculum_umbrella: 'CSF',
      family_name: 'my-fam',
      version_year: '2017'
    }
    unit.reload

    assert unit.project_sharing
    assert_equal 'CSF', unit.curriculum_umbrella
    assert_equal 'my-fam', unit.family_name
    assert_equal '2017', unit.version_year
  end

  test 'set and unset all general_params' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script
    stub_file_writes(unit.name, family_name: 'fake-family-z')

    # Set most of the properties.
    # omitted: professional_learning_course, announcements because
    # using fake values doesn't seem to work for them.
    general_params = {
      hideable_lessons: 'on',
      project_widget_visible: 'on',
      student_detail_progress_view: 'on',
      lesson_extras_available: 'on',
      has_verified_resources: 'on',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot,
      instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led,
      participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
      instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
      tts: 'on',
      project_sharing: 'on',
      is_course: 'on',
      peer_reviews_to_complete: 1,
      curriculum_path: 'fake_curriculum_path',
      family_name: 'fake-family-z',
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
      is_migrated: true,
      lesson_groups: '[]',
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
      is_migrated: true,
      lesson_groups: '[]',
      curriculum_path: '',
      version_year: '',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta,
      pilot_experiment: '',
      editor_experiment: '',
      curriculum_umbrella: '',
      supported_locales: [],
      project_widget_types: [],
    }
    assert_response :success
    unit.reload

    assert_equal({'is_migrated' => true}, unit.properties)
  end

  test 'setting tts for unit triggers generation of tts for the unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    Unit.any_instance.stubs(:tts_update).once

    unit = create :script
    stub_file_writes(unit.name)

    assert_nil unit.tts

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      tts: true
    }, as: :json
    assert_response :success
    unit.reload

    assert_equal true, unit.tts
  end

  test 'setting tts to false does not trigger generation of tts for the unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    Unit.any_instance.stubs(:tts_update).never

    unit = create :script, tts: true
    stub_file_writes(unit.name)

    assert_equal true, unit.tts

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: '[]',
      tts: false
    }, as: :json
    assert_response :success
    unit.reload

    assert_nil unit.tts
  end

  test 'published_state is set to nil for script within course' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    course = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    unit = create :script, published_state: nil
    create :unit_group_unit, unit_group: course, script: unit, position: 1
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      lesson_groups: '[]',
      is_migrated: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    }
    assert_response :success
    unit.reload

    assert_nil unit.published_state
  end

  test 'published_state is set for script within course when different' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    course = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    unit = create :script, published_state: nil
    create :unit_group_unit, unit_group: course, script: unit, position: 1
    stub_file_writes(unit.name)

    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      lesson_groups: '[]',
      is_migrated: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    }
    assert_response :success
    unit.reload

    refute_nil unit.published_state
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development, unit.published_state
  end

  test 'add lesson to migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    stub_file_writes(unit.name)

    Unit.stubs(:merge_and_write_i18n).with do |i18n, name, _|
      name == unit.name &&
        i18n[unit.name]['lessons']['lesson-1']['name'] == 'lesson 1' &&
        i18n[unit.name]['lesson_groups'].empty?
    end.once

    assert_empty unit.lessons

    lesson_groups_json = [
      {
        key: "",
        display_name: "Content",
        userFacing: false,
        lessons: [
          {
            key: "lesson-1",
            name: "lesson 1",
          }
        ]
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    assert_response :success
    assert_equal 'lesson 1', JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['name']
    refute_nil JSON.parse(@response.body)['lesson_groups'][0]['lessons'][0]['id']

    unit.reload
    assert_equal 'lesson 1', unit.lessons.first.name
  end

  test 'add user facing lesson group to migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    stub_file_writes(unit.name)

    Unit.stubs(:merge_and_write_i18n).with do |i18n, name, _|
      name == unit.name &&
        i18n[unit.name]['lessons'].empty? &&
        i18n[unit.name]['lesson_groups']['lesson-group-1']['display_name'] == 'lesson group 1'
    end.once

    lesson_groups_json = [
      {
        key: "lesson-group-1",
        displayName: "lesson group 1",
        userFacing: true,
        lessons: [],
        description: 'Description',
        bigQuestions: 'Big Questions',
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    assert_response :success
    lesson_group_data = JSON.parse(@response.body)['lesson_groups'][0]
    assert_equal 'lesson group 1', lesson_group_data['display_name']
    assert lesson_group_data['user_facing']
    refute_nil lesson_group_data['id']
    assert_empty lesson_group_data['lessons']
    assert_equal 'Big Questions', lesson_group_data['big_questions']
    assert_equal 'Description', lesson_group_data['description']

    unit.reload
    assert_empty unit.lessons
    lesson_group = unit.lesson_groups.first
    assert_equal 'lesson group 1', lesson_group.display_name
    assert_equal 'Big Questions', lesson_group.big_questions
    assert_equal 'Description', lesson_group.description
  end

  test 'update user facing lesson group in migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson = create :lesson, script: unit, lesson_group: lesson_group, key: 'lesson-1', name: 'lesson 1'
    stub_file_writes(unit.name)

    Unit.stubs(:merge_and_write_i18n).with do |i18n, _, _|
      i18n[unit.name]['lessons'].empty? &&
        i18n[unit.name]['lesson_groups']['lesson-group-1']['display_name'] == 'updated name'
    end.once

    lesson_groups_json = [
      {
        key: 'lesson-group-1',
        displayName: 'updated name',
        userFacing: true,
        lessons: [
          {
            id: lesson.id,
            key: 'lesson-1',
          },
        ],
        description: 'updated description',
        bigQuestions: 'updated questions',
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    assert_response :success
    lesson_group_data = JSON.parse(@response.body)['lesson_groups'][0]
    assert_equal 'updated name', lesson_group_data['display_name']
    assert_equal 'updated questions', lesson_group_data['big_questions']
    assert_equal 'updated description', lesson_group_data['description']
    assert_equal 'lesson 1', lesson_group_data['lessons'][0]['name']

    lesson_group.reload
    assert_equal 'updated name', lesson_group.display_name
    assert_equal 'updated questions', lesson_group.big_questions
    assert_equal 'updated description', lesson_group.description
    assert_equal 'lesson 1', lesson_group.lessons.first.name
  end

  test 'update to migrated unit does not update lesson name' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson = create :lesson, script: unit, lesson_group: lesson_group, key: 'lesson-1', name: 'lesson 1'
    stub_file_writes(unit.name)

    Unit.stubs(:merge_and_write_i18n).with do |i18n, _, _|
      i18n[unit.name]['lessons'].empty? &&
        i18n[unit.name]['lesson_groups']['lesson-group-1']['display_name'] == 'lesson group 1'
    end.once

    lesson_groups_json = [
      {
        key: 'lesson-group-1',
        displayName: 'lesson group 1',
        userFacing: true,
        lessons: [
          {
            id: lesson.id,
            key: 'lesson-1',
            name: 'bogus lesson name'
          },
        ],
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    assert_response :success
    lesson_group_data = JSON.parse(@response.body)['lesson_groups'][0]
    assert_equal 'lesson 1', lesson_group_data['lessons'][0]['name']

    lesson_group.reload
    assert_equal 'lesson 1', lesson_group.lessons.first.name
  end

  test 'can move lesson to earlier lesson group in migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group_1 = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson_1 = create :lesson, script: unit, lesson_group: lesson_group_1, key: 'lesson-1', name: 'lesson 1'
    lesson_group_2 = create :lesson_group, script: unit, key: 'lesson-group-2', display_name: 'lesson group 2', user_facing: true
    lesson_2 = create :lesson, script: unit, lesson_group: lesson_group_2, key: 'lesson-2', name: 'lesson 2'

    stub_file_writes(unit.name)

    lesson_groups_json = [
      {
        key: 'lesson-group-1',
        displayName: 'lesson group 1',
        userFacing: true,
        lessons: [
          {
            id: lesson_1.id,
            key: 'lesson-1',
          },
          {
            id: lesson_2.id,
            key: 'lesson-2',
          },
        ],
      },
      {
        key: 'lesson-group-2',
        displayName: 'lesson group 2',
        userFacing: true,
        lessons: [],
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    unit.reload
    assert_equal ['lesson 1', 'lesson 2'], unit.lesson_groups[0].lessons.map(&:name)
    assert_equal [lesson_1.id, lesson_2.id], unit.lesson_groups[0].lessons.map(&:id)
    assert_empty unit.lesson_groups[1].lessons
  end

  test 'can move lesson to later lesson group in migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group_1 = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson_1 = create :lesson, script: unit, lesson_group: lesson_group_1, key: 'lesson-1', name: 'lesson 1'
    lesson_group_2 = create :lesson_group, script: unit, key: 'lesson-group-2', display_name: 'lesson group 2', user_facing: true
    lesson_2 = create :lesson, script: unit, lesson_group: lesson_group_2, key: 'lesson-2', name: 'lesson 2'

    stub_file_writes(unit.name)

    lesson_groups_json = [
      {
        key: 'lesson-group-1',
        displayName: 'lesson group 1',
        userFacing: true,
        lessons: [],
      },
      {
        key: 'lesson-group-2',
        displayName: 'lesson group 2',
        userFacing: true,
        lessons: [
          {
            id: lesson_2.id,
            key: 'lesson-2',
          },
          {
            id: lesson_1.id,
            key: 'lesson-1',
          },
        ],
      }
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    unit.reload
    assert_empty unit.lesson_groups[0].lessons
    assert_equal ['lesson 2', 'lesson 1'], unit.lesson_groups[1].lessons.map(&:name)
    assert_equal [lesson_2.id, lesson_1.id], unit.lesson_groups[1].lessons.map(&:id)
  end

  test 'can move lesson within lesson group in migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson_1 = create :lesson, script: unit, lesson_group: lesson_group, key: 'lesson-1', name: 'lesson 1'
    lesson_2 = create :lesson, script: unit, lesson_group: lesson_group, key: 'lesson-2', name: 'lesson 2'
    lesson_3 = create :lesson, script: unit, lesson_group: lesson_group, key: 'lesson-3', name: 'lesson 3'
    unit.reload
    assert_equal ['lesson 1', 'lesson 2', 'lesson 3'], unit.lesson_groups[0].lessons.map(&:name)

    stub_file_writes(unit.name)

    lesson_groups_json = [
      {
        key: 'lesson-group-1',
        displayName: 'lesson group 1',
        userFacing: true,
        lessons: [
          {
            id: lesson_2.id,
            key: 'lesson-2',
          },
          {
            id: lesson_1.id,
            key: 'lesson-1',
          },
          {
            id: lesson_3.id,
            key: 'lesson-3',
          },
        ],
      },
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    unit.reload
    assert_equal ['lesson 2', 'lesson 1', 'lesson 3'], unit.lesson_groups[0].lessons.map(&:name)
    assert_equal [lesson_2.id, lesson_1.id, lesson_3.id], unit.lesson_groups[0].lessons.map(&:id)
  end

  test 'can move lesson group within migrated unit' do
    sign_in create(:levelbuilder)
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    unit = create :script, is_migrated: true
    lesson_group_1 = create :lesson_group, script: unit, key: 'lesson-group-1', display_name: 'lesson group 1', user_facing: true
    lesson_1 = create :lesson, script: unit, lesson_group: lesson_group_1, key: 'lesson-1', name: 'lesson 1'
    lesson_group_2 = create :lesson_group, script: unit, key: 'lesson-group-2', display_name: 'lesson group 2', user_facing: true
    lesson_2 = create :lesson, script: unit, lesson_group: lesson_group_2, key: 'lesson-2', name: 'lesson 2'

    stub_file_writes(unit.name)

    lesson_groups_json = [
      {
        key: 'lesson-group-2',
        displayName: 'lesson group 2',
        userFacing: true,
        lessons: [
          {
            id: lesson_2.id,
            key: 'lesson-2',
          },
        ],
      },
      {
        key: 'lesson-group-1',
        displayName: 'lesson group 1',
        userFacing: true,
        lessons: [
          {
            id: lesson_1.id,
            key: 'lesson-1',
          },
        ],
      },
    ].to_json

    unit.reload
    post :update, params: {
      id: unit.id,
      script: {name: unit.name},
      is_migrated: true,
      lesson_groups: lesson_groups_json,
      last_updated_at: unit.updated_at.to_s
    }
    unit.reload
    assert_equal ['lesson group 2', 'lesson group 1'], unit.lesson_groups.map(&:display_name)
    assert_equal [lesson_group_2.id, lesson_group_1.id], unit.lesson_groups.map(&:id)
    assert_equal ['lesson 2'], unit.lesson_groups[0].lessons.map(&:name)
    assert_equal ['lesson 1'], unit.lesson_groups[1].lessons.map(&:name)
  end

  class CoursePilotTests < ActionController::TestCase
    setup do
      @pilot_section_owner = create :teacher, pilot_experiment: 'my-experiment'
      @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
      @pilot_unit = create :script, pilot_experiment: 'my-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
      @pilot_section = create :section, user: @pilot_section_owner, script: @pilot_unit
      create :section_instructor, instructor: @pilot_teacher, section: @pilot_section, status: :active
      @pilot_student = create(:follower, section: @pilot_section).student_user

      @pilot_pl_section_owner = create :teacher, pilot_experiment: 'my-pl-experiment'
      @pilot_instructor = create :facilitator, pilot_experiment: 'my-pl-experiment'
      @pilot_pl_unit = create :script, pilot_experiment: 'my-pl-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
      @pilot_pl_section = create :section, user: @pilot_pl_section_owner, script: @pilot_pl_unit
      create :section_instructor, instructor: @pilot_instructor, section: @pilot_pl_section, status: :active
      @pilot_pl_participant = create :facilitator
      create(:follower, section: @pilot_pl_section, student_user: @pilot_pl_participant)
    end

    no_access_msg = "You don&#39;t have access to this unit."

    test_user_gets_response_for :show, response: :redirect, user: nil,
      params: -> {{id: @pilot_unit.name}},
      name: 'signed out user cannot view pilot unit'

    test_user_gets_response_for :show, response: :redirect, user: nil,
                                params: -> {{id: @pilot_pl_unit.name}},
                                name: 'signed out user cannot view pilot pl unit'

    test_user_gets_response_for(:show, response: :success, user: :student,
      params: -> {{id: @pilot_unit.name}}, name: 'student cannot view pilot unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :teacher,
                                params: -> {{id: @pilot_pl_unit.name}}, name: 'participant user not in pilot section cannot view pilot unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :teacher,
      params: -> {{id: @pilot_unit.name}},
      name: 'teacher without pilot access cannot view pilot unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :facilitator,
                                params: -> {{id: @pilot_pl_unit.name}},
                                name: 'instructor without pilot access cannot view pilot unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: -> {@pilot_teacher},
      params: -> {{id: @pilot_unit.name, section_id: @pilot_section.id}},
      name: 'pilot teacher can view pilot unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: -> {@pilot_instructor},
                                params: -> {{id: @pilot_pl_unit.name, section_id: @pilot_pl_section.id}},
                                name: 'pilot instructor can view pilot unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: -> {@pilot_student},
      params: -> {{id: @pilot_unit.name}}, name: 'pilot student can view pilot unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: -> {@pilot_pl_participant},
                                params: -> {{id: @pilot_pl_unit.name}}, name: 'pilot participant can view pilot unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
      params: -> {{id: @pilot_unit.name}}, name: 'levelbuilder can view pilot unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end
  end

  class CourseInDevelopmentTests < ActionController::TestCase
    setup do
      @in_development_unit = create :script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    end

    no_access_msg = "You don&#39;t have access to this unit."

    test_user_gets_response_for :show, response: :redirect, user: nil,
      params: -> {{id: @in_development_unit.name}},
      name: 'signed out user cannot view in-development unit'

    test_user_gets_response_for(:show, response: :success, user: :student,
      params: -> {{id: @in_development_unit.name}}, name: 'student cannot view in-development unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :teacher,
      params: -> {{id: @in_development_unit.name}},
      name: 'teacher cannot view in-development unit'
    ) do
      assert_includes(response.body, no_access_msg)
    end

    test_user_gets_response_for(:show, response: :success, user: :levelbuilder,
      params: -> {{id: @in_development_unit.name}}, name: 'levelbuilder can view in-development unit'
    ) do
      refute_includes(response.body, no_access_msg)
    end
  end

  test 'should redirect to latest stable version in unit family for student without progress or assignment' do
    sign_in create(:student)

    dogs1 = create :script, name: 'dogs1', family_name: 'dogs', version_year: '1901', is_course: true
    CourseOffering.add_course_offering(dogs1)

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'dogs'}
    end

    dogs1.update!(published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    get :show, params: {id: 'dogs'}
    assert_redirected_to "/s/dogs1"

    dogs2 = create :script, name: 'dogs2', family_name: 'dogs', version_year: '1902', is_course: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(dogs2)
    get :show, params: {id: 'dogs'}
    assert_redirected_to "/s/dogs2"

    dogs3 = create :script, name: 'dogs3', family_name: 'dogs', version_year: '1899', is_course: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(dogs3)
    get :show, params: {id: 'dogs'}
    assert_redirected_to "/s/dogs2"
  end

  test 'should redirect to latest stable version in unit family for participant without progress or assignment' do
    sign_in create(:teacher)

    pl_dogs1 = create :script, name: 'pl-dogs1', family_name: 'ui-test-versioned-pl-script', version_year: '1901', is_course: true, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    CourseOffering.add_course_offering(pl_dogs1)

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'ui-test-versioned-pl-script'}
    end

    pl_dogs1.update!(published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    get :show, params: {id: 'ui-test-versioned-pl-script'}
    assert_redirected_to "/s/pl-dogs1"

    create :script, name: 'pl-dogs2', family_name: 'ui-test-versioned-pl-script', version_year: '1902', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    get :show, params: {id: 'ui-test-versioned-pl-script'}
    assert_redirected_to "/s/pl-dogs2"

    create :script, name: 'pl-dogs3', family_name: 'ui-test-versioned-pl-script', version_year: '1899', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    get :show, params: {id: 'ui-test-versioned-pl-script'}
    assert_redirected_to "/s/pl-dogs2"
  end

  no_access_msg = "You don&#39;t have access to this unit."

  test_user_gets_response_for(:vocab, response: :success, user: :facilitator, params: -> {{id: @migrated_pl_unit.name}}, name: 'instructor can view vocab page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:vocab, response: :forbidden, user: :student, params: -> {{id: @migrated_pl_unit.name}}, name: 'student cant view vocab page for pl course')
  test_user_gets_response_for(:vocab, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}, name: 'teacher can view vocab page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :vocab, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for(:resources, response: :success, user: :facilitator, params: -> {{id: @migrated_pl_unit.name}}, name: 'instructor can view resources page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:resources, response: :forbidden, user: :student, params: -> {{id: @migrated_pl_unit.name}}, name: 'student cant view resources page for pl course')
  test_user_gets_response_for(:resources, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}, name: 'teacher can view resources page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :resources, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for(:standards, response: :success, user: :facilitator, params: -> {{id: @migrated_pl_unit.name}}, name: 'instructor can view standards page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:standards, response: :forbidden, user: :student, params: -> {{id: @migrated_pl_unit.name}}, name: 'student cant view standards page for pl course')
  test_user_gets_response_for(:standards, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}, name: 'teacher can view standards page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :standards, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test_user_gets_response_for(:code, response: :success, user: :facilitator, params: -> {{id: @migrated_pl_unit.name}}, name: 'instructor can view code page for pl course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for(:code, response: :forbidden, user: :student, params: -> {{id: @migrated_pl_unit.name}}, name: 'student cant view code page for pl course')
  test_user_gets_response_for(:code, response: :success, user: :teacher, params: -> {{id: @migrated_unit.name}}, name: 'teacher can view code page for student facing course') do
    refute_includes(response.body, no_access_msg)
  end
  test_user_gets_response_for :code, response: :forbidden, user: :teacher, params: -> {{id: @unmigrated_unit.name}}

  test "view all instructions page for migrated unit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

    get :instructions, params: {id: @migrated_unit.name}
    assert_response :success
  end

  test "view all instructions page for unmigrated unit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

    get :instructions, params: {id: @unmigrated_unit.name}
    assert_response :success
  end

  test "get_rollup_resources return rollups for a unit with code, resources, standards, and vocab" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

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
    assert_equal(['All Code', 'All Resources', 'All Standards', 'All Vocabulary'], response_body.map {|r| r['name']})
  end

  test "get_rollup_resources doesn't return rollups if no lesson in a unit has the associated object" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

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
    assert_equal(['All Resources', 'All Standards'], response_body.map {|r| r['name']})
  end

  test "get_unit bypasses cache for edit route" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

    Unit.expects(:get_from_cache).never
    Unit.expects(:get_without_cache).with(@migrated_unit.name, with_associated_models: true).returns(@migrated_unit).once
    get :edit, params: {id: @migrated_unit.name}

    Unit.expects(:get_from_cache).with(@migrated_unit.name, raise_exceptions: false).returns(@migrated_unit).once
    Unit.expects(:get_without_cache).never
    get :show, params: {id: @migrated_unit.name}
  end

  test "legacy path look up by id fails with not found" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))
    legacy_path_validation_unit = create :script

    assert_raises ActiveRecord::RecordNotFound do
      get :edit, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :standards, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :code, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :vocab, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :resources, params: {id: legacy_path_validation_unit.id}
    end

    assert_raises ActiveRecord::RecordNotFound do
      delete :destroy, params: {id: legacy_path_validation_unit.id}
    end
  end

  def stub_file_writes(unit_name, family_name: nil)
    filenames_to_stub = ["#{Rails.root}/config/scripts/#{unit_name}.script", "#{Rails.root}/config/scripts_json/#{unit_name}.script_json",  "#{Rails.root}/config/course_offerings/#{family_name || unit_name}.json"]
    File.stubs(:write).with do |filename, _|
      filenames_to_stub.include?(filename) || filename.to_s.end_with?('scripts.en.yml')
    end
  end
end
