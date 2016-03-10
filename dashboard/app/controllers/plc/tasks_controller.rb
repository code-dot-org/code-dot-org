class Plc::TasksController < ApplicationController
  load_and_authorize_resource

  # GET /plc/tasks
  # GET /plc/tasks.json
  def index
  end

  # GET /plc/tasks/1
  # GET /plc/tasks/1.json
  def show
  end

  # GET /plc/tasks/new
  def new
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
    if @task.update(editable_task_params)
      redirect_to plc_task_url(@task), notice: 'Task was successfully updated.'
    else
      redirect_to action: :edit
    end
  end

  # DELETE /plc/tasks/1
  # DELETE /plc/tasks/1.json
  def destroy
    @task.destroy
    redirect_to action: :index
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def task_params
    #Rails forms use the full name of the class including the module they are in, so we'll do the same
    if params[:plc_learning_resource_task]
      params.require(:plc_learning_resource_task).permit(:name, :plc_learning_module_id, :type, :resource_url)
    elsif params[:plc_script_completion_task]
      params.require(:plc_script_completion_task).permit(:name, :plc_learning_module_id, :type, :script_id)
    elsif params[:plc_written_assignment_task]
      params.require(:plc_written_assignment_task).permit(:name, :plc_learning_module_id, :type, :assignment_description)
    elsif params[:plc_task]
      params.require(:plc_task).permit(:name, :plc_learning_module_id, :type)
    end
  end

  #Type should not be editable, so drop any parameter that is trying to edit it
  def editable_task_params
    editable_params = task_params.dup
    editable_params.extract!(:type)
    editable_params
  end
end
