class Plc::TasksController < ApplicationController
  load_and_authorize_resource

  # GET /plc/tasks/1
  # GET /plc/tasks/1.json
  def show
  end

  # GET /plc/tasks/new
  def new
    @task.plc_learning_module_id = params[:plc_learning_module_id]
    @task.type = params[:type]
  end

  # GET /plc/tasks/1/edit
  def edit
  end

  # POST /plc/tasks
  # POST /plc/tasks.json
  def create
    raise 'All tasks must have a distinct type' if @task.type == 'Plc::Task'

    if @task.save
      redirect_to edit_plc_task_url(@task), notice: 'Task was successfully created.'
    else
      redirect_to action: :new
    end
  end

  # PATCH/PUT /plc/tasks/1
  # PATCH/PUT /plc/tasks/1.json
  def update
    if @task.update(task_params)
      redirect_to plc_task_url(@task), notice: 'Task was successfully updated.'
    else
      redirect_to action: :edit
    end
  end

  # DELETE /plc/tasks/1
  # DELETE /plc/tasks/1.json
  def destroy
    learning_module = @task.plc_learning_module
    @task.destroy
    redirect_to plc_learning_module_path(learning_module)
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def task_params
    #Rails forms use the full name of the class including the module they are in, so we'll do the same
    if params[:plc_learning_resource_task]
      params.require(:plc_learning_resource_task).permit(:name, :plc_learning_module_id, :type, :resource_url, :icon)
    elsif params[:plc_script_completion_task]
      params.require(:plc_script_completion_task).permit(:name, :plc_learning_module_id, :type, :script_id)
    elsif params[:plc_written_assignment_task]
      params.require(:plc_written_assignment_task).permit(:name, :plc_learning_module_id, :type, :assignment_description)
    elsif params[:plc_task]
      params.require(:plc_task).permit(:name, :plc_learning_module_id, :type)
    end
  end
end
