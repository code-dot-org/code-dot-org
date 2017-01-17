require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:user)
    @levelbuilder = create(:levelbuilder)

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
    get :show, id: Script::HOC_NAME
    assert_response :success
  end

  test "should get show of k-8" do
    get :show, id: Script::TWENTY_HOUR_NAME
    assert_response :success
  end

  test "should get show of custom script" do
    get :show, id: 'course1'
    assert_response :success
  end

  test "should get show of ECSPD if signed in" do
    sign_in @not_admin
    get :show, id: 'ECSPD'
    assert_response :success
  end

  test "should not get show of ECSPD if not signed in" do
    get :show, id: 'ECSPD'
    assert_redirected_to_sign_in
  end

  test "should not show link to lesson plans if logged in as a student" do
    sign_in create(:student)

    get :show, id: 'cspunit1'
    assert_response :success
    assert_select 'a', text: 'Lesson plans', count: 0
  end

  test "should show link to lesson plans if logged in as a teacher" do
    sign_in create(:teacher)

    get :show, id: 'cspunit1'
    assert_response :success
    assert_select 'a', text: 'Lesson plans'
  end

  test "should not show link to Overview of Courses 1, 2, and 3 if logged in as a student" do
    sign_in create(:student)

    get :show, id: 'course1'
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3', count: 0
  end

  test "should not show link to Overview of Courses 1, 2, and 3 if not logged in" do
    get :show, id: 'course1'
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3', count: 0
  end

  test "should show link to Overview of Courses 1, 2, and 3 if logged in as a teacher" do
    sign_in create(:teacher)

    get :show, id: 'course1'
    assert_response :success
    assert_select 'a', text: 'Overview of Courses 1, 2, and 3'
  end

  test "should redirect to /s/course1" do
    get :show, id: Script.find_by_name("course1").id
    assert_redirected_to "/s/course1"
  end

  test "show of hourofcode redirects to hoc" do
    get :show, id: 'hourofcode'
    assert_response :success
  end

  test "show of hourofcode by id should redirect to hoc" do
    get :show, id: Script.find_by_name('hourofcode').id
    assert_redirected_to '/s/hourofcode'
  end

  test "should get show if not signed in" do
    get :show, id: Script::FLAPPY_NAME
    assert_response :success
  end

  test "should get show if not admin" do
    sign_in @not_admin
    get :show, id: Script::FLAPPY_NAME
    assert_response :success
  end

  test 'should not get show if admin' do
    sign_in @admin
    get :show, id: Script::FLAPPY_NAME
    assert_response :forbidden
  end

  test "should use script name as param where script name is words but looks like a number" do
    script = create(:script, name: '15-16')
    get :show, id: "15-16"

    assert_response :success
    assert_equal script, assigns(:script)
  end

  test "should use script name as param where script name is words" do
    script = create(:script, name: 'Heure de Code', skip_name_format_validation: true)
    get :show, id: "Heure de Code"

    assert_response :success
    assert_equal script, assigns(:script)
  end

  test "renders 404 when id is an invalid id" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, id: 232323
    end
  end

  test "renders 404 when id is an invalid string" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, id: 'Hat'
    end
  end

  test "should not get edit if not levelbuilder mode" do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    sign_in @levelbuilder
    get :edit, id: 'course1'

    assert_response :forbidden
  end

  test "should not get edit if not signed in" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    get :edit, id: 'course1'

    assert_redirected_to_sign_in
  end

  test "should not get edit if not levelbuilder" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    [@not_admin, @admin].each do |user|
      sign_in user
      get :edit, id: 'course1'

      assert_response :forbidden
    end
  end

  test "edit" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    script = Script.find_by_name('course1')
    get :edit, id: script.name

    assert_equal script, assigns(:script)
  end

  # These two tests are the only remaining dependency on script seed order.  Check that /s/1 redirects to /s/20-hour in
  # production. On a fresh db the only guarantee that '20-hour.script' has id:1 is by manually specifying ID in the DSL.

  test "should redirect old k-8" do
    get :show, id: 1
    assert_redirected_to script_path(Script.twenty_hour_script)
  end

  test "show should redirect to flappy" do
    get :show, id: 6
    assert_redirected_to "/s/flappy"
  end

  test "edit forbidden if not on levelbuilder" do
    sign_in @levelbuilder
    get :edit, id: 'course1'
    assert_response :forbidden
  end

  test 'create' do
    expected_contents = <<-TEXT.strip_heredoc
      hidden false
      login_required true
      hideable_stages true
      wrapup_video 'hoc_wrapup'

    TEXT
    File.stubs(:write).with{ |filename, _| filename.end_with? 'scripts.en.yml' }.once
    File.stubs(:write).with('config/scripts/test-script-create.script', expected_contents).once
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder

    post :create,
      script: {name: 'test-script-create'},
      script_text: '',
      visible_to_teachers: true,
      login_required: true,
      hideable_stages: true,
      wrapup_video: 'hoc_wrapup'
    assert_redirected_to script_path id: 'test-script-create'

    script = Script.find_by_name('test-script-create')
    assert_equal 'test-script-create', script.name
    refute script.hidden
    assert script.login_required
    assert script.hideable_stages

    File.unstub(:write)
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
        delete :destroy, id: evil_script.id
      end
    end
  end
end
