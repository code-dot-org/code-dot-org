class Plc::LearningModulesController < ApplicationController
  load_and_authorize_resource

  # GET /plc/learning_modules/1
  # GET /plc/learning_modules/1.json
  def show
    resource_tasks, other_tasks = @learning_module.plc_tasks.partition {|task| task.is_a? Plc::LearningResourceTask}

    @task_groupings = [{
      tasks: resource_tasks,
      name: 'Learning Resources',
      new_link_text: 'Add a resource',
      new_link_destination: new_learning_resource_for_module_path(@learning_module)
    }, {
      tasks: other_tasks,
      name: 'Tasks',
      new_link_text: 'Add a task',
      new_link_destination: new_plc_task_path(plc_learning_module_id: @learning_module.id)
    }]
  end

  # GET /plc/learning_modules/new
  def new
  end

  def new_learning_resource_for_module
  end

  # GET /plc/learning_modules/1/edit
  def edit
  end

  # POST /plc/learning_modules
  # POST /plc/learning_modules.json
  def create
    if @learning_module.save
      redirect_to @learning_module, notice: 'Learning module was successfully created.'
    else
      redirect_to action: :new
    end
  end

  # PATCH/PUT /plc/learning_modules/1
  # PATCH/PUT /plc/learning_modules/1.json
  def update
    if @learning_module.update(learning_module_params)
      redirect_to @learning_module, notice: 'Learning module was successfully updated.'
    else
      redirect_to action: :edit
    end
  end

  # DELETE /plc/learning_modules/1
  # DELETE /plc/learning_modules/1.json
  def destroy
    @learning_module.destroy
    redirect_to plc_content_creator_show_courses_and_modules_path
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def learning_module_params
    params.require(:plc_learning_module).permit(:name, :learning_module_type, :plc_course_unit_id, :module_type)
  end
end
