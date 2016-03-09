require 'test_helper'

class Plc::TasksControllerTest < ActionController::TestCase
  def setup
    @user = create :admin
    sign_in(@user)
    @learning_module = create :plc_learning_module
    @learning_resource_task = create(:plc_learning_resource_task, name: 'task', type: 'Plc::LearningResourceTask', plc_learning_module: @learning_module)
  end

  test 'get index' do
    get :index
    assert_response :success
  end

  test 'should get new' do
    get :new
    assert_response :success
  end

  test 'should create new tasks for all task types' do
    [
        [Plc::Task, {}],
        [Plc::LearningResourceTask, {resource_url: 'Some url'}],
        [Plc::ScriptCompletionTask, {script_id: '1'}]

    ].each do |task_type, task_params|
      task_name = SecureRandom.hex
      task_params[:name] = task_name
      task_params[:plc_learning_module_id] = @learning_module.id
      task_params[:type] = task_type.name

      assert_creates(task_type) do
        post :create, {('plc_' + task_type.underscored_task_type).to_sym => task_params}
      end

      created_task = task_type.find_by(name: task_name)

      task_params.each do |k, v|
        assert_equal v, created_task.send(k)
      end
    end
  end

  test 'should show task' do
    get :show, id: @learning_resource_task
    assert_response :success
  end

  test 'should get edit' do
    get :edit, id: @learning_resource_task
  end

  test 'should update task' do
    assert 'name', @learning_resource_task.name
    patch :update, id: @learning_resource_task, plc_learning_resource_task: {name: 'New name', type: 'Plc::LearningResourceTask', plc_learning_module: @learning_module}
    assert_redirected_to plc_task_path(assigns(:task))
    assert 'New name', @learning_resource_task.name
  end

  test 'should destroy task' do
    assert_difference('Plc::Task.count', -1) do
      delete :destroy, id: @learning_resource_task
    end

    assert_redirected_to plc_tasks_path
  end
end
