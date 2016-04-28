require 'test_helper'

class Plc::LearningModulesControllerTest < ActionController::TestCase
  setup do
    @course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module = create(:plc_learning_module, plc_course_unit: @course_unit)
    @user = create :admin
    sign_in(@user)
  end

  test 'should get new' do
    get :new
    assert_response :success
  end

  test 'should create new learning module' do
    module_name = SecureRandom.hex
    assert_difference('Plc::LearningModule.count') do
      post :create, plc_learning_module: {plc_learning_module: @learning_module, name: module_name, plc_course_unit_id: @course_unit.id, module_type: Plc::LearningModule::PRACTICE_MODULE}
    end
    assert_equal module_name, Plc::LearningModule.find_by(name: module_name).name
    assert_redirected_to plc_learning_module_path(assigns(:learning_module))
  end

  test 'should show learning module' do
    get :show, id: @learning_module
    assert_response :success
  end

  test 'should get edit' do
    get :edit, id: @learning_module
    assert_response :success
  end

  test 'should destroy plc learning module' do
    assert_difference('Plc::LearningModule.count', -1) do
      delete :destroy, id: @learning_module
    end

    assert_redirected_to plc_content_creator_show_courses_and_modules_path
  end
end
