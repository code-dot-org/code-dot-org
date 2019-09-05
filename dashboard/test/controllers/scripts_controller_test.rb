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

    @coursez_2017 = create :script, name: 'coursez-2017', family_name: 'coursez', version_year: '2017', is_stable: true
    @coursez_2018 = create :script, name: 'coursez-2018', family_name: 'coursez', version_year: '2018', is_stable: true
    @coursez_2019 = create :script, name: 'coursez-2019', family_name: 'coursez', version_year: '2019'
    @partner_script = create :script, editor_experiment: 'platformization-partners'

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

  test "should not get show of ECSPD if not signed in" do
    get :show, params: {id: 'ECSPD'}
    assert_redirected_to_sign_in
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

  test "show: redirect to latest stable version in family for student" do
    sign_in create(:student)
    get :show, params: {id: @coursez_2017.name}
    assert_redirected_to "/s/#{@coursez_2018.name}?redirect_warning=true"
  end

  test "show: do not redirect student to latest stable version in family if they can view the script version" do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    sign_in create(:student)
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "show: do not redirect teacher to latest stable version in family" do
    sign_in create(:teacher)
    get :show, params: {id: @coursez_2017.name}
    assert_response :ok
  end

  test "should not get edit if not levelbuilder mode" do
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
    File.stubs(:write).with {|filename, _| filename == "config/scripts/#{@partner_script.name}.script" || filename.end_with?('scripts.en.yml')}

    sign_in @platformization_partner
    patch :update, params: {
      id: @partner_script.id,
      script: {name: @partner_script.name},
      script_text: '',
    }
    assert_response :redirect
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

  test "edit forbidden if not on levelbuilder" do
    sign_in @levelbuilder
    get :edit, params: {id: 'course1'}
    assert_response :forbidden
  end

  test 'create' do
    expected_contents = <<-TEXT.strip_heredoc
      hidden false
      login_required true
      hideable_stages true
      wrapup_video 'hoc_wrapup'
      project_sharing true
      curriculum_umbrella 'CSP'

    TEXT
    File.stubs(:write).with {|filename, _| filename.end_with? 'scripts.en.yml'}.once
    File.stubs(:write).with('config/scripts/test-script-create.script', expected_contents).once
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    post :create, params: {
      script: {name: 'test-script-create'},
      script_text: '',
      visible_to_teachers: true,
      login_required: true,
      hideable_stages: true,
      wrapup_video: 'hoc_wrapup',
      project_sharing: 'on',
      curriculum_umbrella: 'CSP'
    }
    assert_redirected_to script_path id: 'test-script-create'

    script = Script.find_by_name('test-script-create')
    assert_equal 'test-script-create', script.name
    refute script.hidden
    assert script.login_required
    assert script.hideable_stages
    assert script.project_sharing
    assert_equal "CSP", script.curriculum_umbrella
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

  test 'updates teacher resources' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    File.stubs(:write).with {|filename, _| filename == "config/scripts/#{script.name}.script" || filename.end_with?('scripts.en.yml')}

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      resourceTypes: ['curriculum', 'vocabulary', ''],
      resourceLinks: ['/link/to/curriculum', '/link/to/vocab', '']
    }
    assert_equal [['curriculum', '/link/to/curriculum'], ['vocabulary', '/link/to/vocab']], Script.find_by_name(script.name).teacher_resources
  end

  test 'updates pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    File.stubs(:write).with {|filename, _| filename == "config/scripts/#{script.name}.script" || filename.end_with?('scripts.en.yml')}

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      pilot_experiment: 'pilot-experiment',
      visible_to_teachers: true,
    }
    assert_equal 'pilot-experiment', Script.find_by_name(script.name).pilot_experiment
    # pilot scripts are always marked hidden
    assert Script.find_by_name(script.name).hidden
  end

  test 'does not hide script with blank pilot_experiment' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    File.stubs(:write).with {|filename, _| filename == "config/scripts/#{script.name}.script" || filename.end_with?('scripts.en.yml')}

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      pilot_experiment: '',
      visible_to_teachers: true,
    }

    assert_nil Script.find_by_name(script.name).pilot_experiment
    # blank pilot_experiment does not cause script to be hidden
    refute Script.find_by_name(script.name).hidden
  end

  test 'update: can update general_params' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    File.stubs(:write).with {|filename, _| filename == "config/scripts/#{script.name}.script" || filename.end_with?('scripts.en.yml')}

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

  test 'can create with has_lesson_plan param' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    File.stubs(:write)

    post :create, params: {
      script: {name: 'test-script-create'},
      script_text: '',
      visible_to_teachers: true,
      has_lesson_plan: true,
    }

    script = Script.find_by_name('test-script-create')
    assert_equal 'test-script-create', script.name
    assert script.has_lesson_plan?
  end

  test 'can update with has_lesson_plan param' do
    sign_in @levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    script = create :script
    refute script.has_lesson_plan?

    File.stubs(:write)

    post :update, params: {
      id: script.id,
      script: {name: script.name},
      script_text: '',
      has_lesson_plan: true,
    }

    # Reload script, expect change
    script = Script.find_by_id(script.id)
    assert script.has_lesson_plan?
  end

  test 'should redirect to latest stable version in script family' do
    dogs1 = create :script, name: 'dogs1', family_name: 'coursea', version_year: '1901'

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {id: 'coursea'}
    end

    dogs1.update!(is_stable: true)
    get :show, params: {id: 'coursea'}
    assert_redirected_to "/s/dogs1"

    create :script, name: 'dogs2', family_name: 'coursea', version_year: '1902', is_stable: true
    get :show, params: {id: 'coursea'}
    assert_redirected_to "/s/dogs2"

    create :script, name: 'dogs3', family_name: 'coursea', version_year: '1899', is_stable: true
    get :show, params: {id: 'coursea'}
    assert_redirected_to "/s/dogs2"
  end
end
