require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @admin = create(:admin)
    @not_admin = create(:user)
  end

  test "should get index" do
    sign_in(@admin)
    get :index
    assert_response :success
    assert_not_nil assigns(:scripts)
    assert_equal Script.all, assigns(:scripts)
  end

  test "should not get index if not signed in" do
    get :index

    assert_redirected_to_sign_in
  end

  test "should not get index if not admin" do
    sign_in @not_admin

    get :index

    assert_response :forbidden
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

  test "should use script name as param where script name is words but looks like a number" do
    script = create(:script, name: '15-16')
    get :show, id: "15-16"

    assert_response :success
    assert_equal script, assigns(:script)
  end

  test "should use script name as param where script name is words" do
    script = create(:script, name: 'Heure de Code')
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

  test "should not get edit if not signed in" do
    get :edit, id: 'course1'

    assert_redirected_to_sign_in
  end

  test "should not get edit if not admin" do
    sign_in @not_admin
    get :edit, id: 'course1'

    assert_response :forbidden
  end

  test "edit" do
    sign_in @admin
    script = Script.find_by_name('course1')
    get :edit, id: script.name

    assert_equal script, assigns(:script)
    assert assigns(:script_file)
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
end
