require 'test_helper'

class LearningModulesControllerTest < ActionController::TestCase
  setup do
    @learning_module = learning_modules(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:learning_modules)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create learning_module" do
    assert_difference('LearningModule.count') do
      post :create, learning_module: {  }
    end

    assert_redirected_to learning_module_path(assigns(:learning_module))
  end

  test "should show learning_module" do
    get :show, id: @learning_module
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @learning_module
    assert_response :success
  end

  test "should update learning_module" do
    patch :update, id: @learning_module, learning_module: {  }
    assert_redirected_to learning_module_path(assigns(:learning_module))
  end

  test "should destroy learning_module" do
    assert_difference('LearningModule.count', -1) do
      delete :destroy, id: @learning_module
    end

    assert_redirected_to learning_modules_path
  end
end
