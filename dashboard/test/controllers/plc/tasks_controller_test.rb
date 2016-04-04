require 'test_helper'

class Plc::TasksControllerTest < ActionController::TestCase
  def setup
    @user = create :admin
    sign_in(@user)
    @learning_module = create :plc_learning_module
    @learning_resource_task = create(:plc_learning_resource_task, name: 'task', type: 'Plc::LearningResourceTask', plc_learning_module: @learning_module)
  end

  test 'should get new' do
    get :new, plc_learning_module_id: @learning_module.id
    assert_response :success
  end

  test 'should create new tasks for all task types' do
    [
        [Plc::LearningResourceTask, {resource_url: 'Some url', icon: 'Some icon class'}],
        [Plc::ScriptCompletionTask, {script_id: '1'}],
        [Plc::WrittenAssignmentTask, {assignment_description: 'Tell me how you really feel'}]

    ].each do |task_type, task_params|
      @controller = Plc::TasksController.new

      task_name = SecureRandom.hex
      initial_task_params = {}
      initial_task_params[:name] = task_name
      initial_task_params[:plc_learning_module_id] = @learning_module.id
      initial_task_params[:type] = task_type.name

      assert_creates(task_type) do
        post :create, plc_task: initial_task_params
        assert_redirected_to edit_plc_task_path(assigns(:task))
        created_task = task_type.find_by(name: task_name)
        patch :update, id: created_task, ('plc_' + created_task.class.underscored_task_type).to_sym => task_params
      end

      created_task = task_type.find_by(name: task_name)

      task_params.merge(initial_task_params).each do |k, v|
        assert_equal v, created_task.send(k)
      end
    end
  end

  test 'should not allow plain PLC tasks to be created' do
    assert_raises(RuntimeError) do
      post :create, plc_task: {name: 'Some name', type: 'Plc::Task', plc_learning_module_id: @learning_module_id}
    end
  end

  test 'tasks are updatable but task type is not' do
    assert_equal 'task', @learning_resource_task.name
    patch :update, id: @learning_resource_task, plc_learning_resource_task: {name: 'New name', type: 'Plc::ScriptCompletionTask', plc_learning_module_id: @learning_module.id}
    @learning_resource_task.reload
    assert_equal 'New name', @learning_resource_task.name
    assert_equal Plc::LearningResourceTask, @learning_resource_task.class
  end

  test 'should show task' do
    get :show, id: @learning_resource_task
    assert_response :success
  end

  test 'should get edit' do
    get :edit, id: @learning_resource_task
  end

  test 'should destroy task' do
    assert_difference('Plc::Task.count', -1) do
      delete :destroy, id: @learning_resource_task
    end

    assert_redirected_to plc_learning_module_path(@learning_module)
  end
end
