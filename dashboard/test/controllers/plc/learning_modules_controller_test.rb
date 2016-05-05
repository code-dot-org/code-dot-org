require 'test_helper'

class Plc::LearningModulesControllerTest < ActionController::TestCase
  setup do
    @course = create(:plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @course)
    @learning_module = create(:plc_learning_module, plc_course_unit: @course_unit)
    @user = create :admin
    sign_in(@user)
  end

  test 'should show learning module' do
    get :show, id: @learning_module
    assert_response :success
  end
end
