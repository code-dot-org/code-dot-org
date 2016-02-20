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
    @task = Plc::Task.new(task_params)

    if @task.save
      redirect_to @task, notice: 'Task was successfully created.'
    else
      redirect_to action: :new
    end
  end

  # PATCH/PUT /plc/tasks/1
  # PATCH/PUT /plc/tasks/1.json
  def update
    if @task.update(task_params)
      redirect_to @task, notice: 'Task was susccessfully updated.'
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
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_task
    @task = Plc::Task.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def task_params
    params.require(:plc_task).permit(:name, :description, :plc_learning_module_id)
  end
end
