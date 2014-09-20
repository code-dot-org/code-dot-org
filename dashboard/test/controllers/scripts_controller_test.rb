require 'test_helper'

class ScriptsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:scripts)
    assert_equal Script.all, assigns(:scripts)
  end

  test "should not get index if not signed in" do
    sign_out @admin
    get :index

    assert_redirected_to_sign_in
  end

  test "should not get index if not admin" do
    sign_in @not_admin

    get :index

    assert_response :forbidden
  end

  test "should get show" do
    sign_in @admin
    get :show, id: Script::FLAPPY_ID
    assert_response :success
  end

  test "should get show of hoc" do
    get :show, id: Script::HOC_ID
    assert_response :success
  end

  test "should get show of k-8" do
    get :show, id: Script::TWENTY_HOUR_ID
    assert_response :success
  end

  test "should get show of custom script" do
    get :show, id: Script.find_by_name("course1")
    assert_response :success
  end

  test "should get show if not signed in" do
    sign_out @admin
    get :show, id: Script::FLAPPY_ID
    assert_response :success
  end

  test "should get show if not admin" do
    sign_in @not_admin
    get :show, id: Script::FLAPPY_ID
    assert_response :success
  end

  test "should not see edit level links if not admin" do
    sign_in @not_admin
    get :show, id: Script::FLAPPY_ID
    assert_response :success

    assert_select 'a', text: 'Edit', count: 0
  end

  test "should see edit level links for custom levels if admin" do
    sign_in @admin
    get :show, id: Script.find_by_name('course1').id
    assert_response :success

    assert_select 'a', text: 'Edit', minimum: 1
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
    sign_out @admin
    get :edit, id: 'course1'

    assert_redirected_to_sign_in
  end

  test "should not get edit if not admin" do
    sign_in @not_admin

    get :edit, id: 'course1'

    assert_response :forbidden
  end

  test "edit" do
    script = Script.find_by_name('course1')
    get :edit, id: script.name

    assert_equal script, assigns(:script)
    assert assigns(:script_file)
  end
end
