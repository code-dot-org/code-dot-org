class Plc::LearningModulesController < ApplicationController
  load_and_authorize_resource

  def show
    resource_tasks, other_tasks = @learning_module.plc_tasks.partition {|task| task.is_a? Plc::LearningResourceTask}

    @task_groupings = [{
      tasks: resource_tasks,
      name: 'Learning Resources'
    }, {
      tasks: other_tasks,
      name: 'Tasks'
    }]
  end
end
