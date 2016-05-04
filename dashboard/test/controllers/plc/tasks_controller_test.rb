require 'test_helper'

class Plc::TasksControllerTest < ActionController::TestCase
  def setup
    @user = create :admin
    sign_in(@user)
    @learning_module = create :plc_learning_module
    @learning_resource_task = create(:plc_learning_resource_task, name: 'task', type: 'Plc::LearningResourceTask', plc_learning_modules: [@learning_module])
  end

  test 'should show task' do
    get :show, id: @learning_resource_task
    assert_response :success
  end
end
