class Plc::TasksController < ApplicationController
  load_and_authorize_resource
  before_action :set_plc_task, only: [:show, :edit, :update, :destroy]

  # GET /plc/tasks
  # GET /plc/tasks.json
  def index
    @plc_tasks = Plc::Task.all
  end

  # GET /plc/tasks/1
  # GET /plc/tasks/1.json
  def show
  end

  # GET /plc/tasks/new
  def new
    @plc_task = Plc::Task.new
  end

  # GET /plc/tasks/1/edit
  def edit
  end

  # POST /plc/tasks
  # POST /plc/tasks.json
  def create
    @plc_task = Plc::Task.new(plc_task_params)

    respond_to do |format|
      if @plc_task.save
        format.html { redirect_to @plc_task, notice: 'Task was successfully created.' }
      else
        format.html { render action: 'new' }
      end
    end
  end

  # PATCH/PUT /plc/tasks/1
  # PATCH/PUT /plc/tasks/1.json
  def update
    respond_to do |format|
      if @plc_task.update(plc_task_params)
        format.html { redirect_to @plc_task, notice: 'Task was successfully updated.' }
      else
        format.html { render action: 'edit' }
      end
    end
  end

  # DELETE /plc/tasks/1
  # DELETE /plc/tasks/1.json
  def destroy
    @plc_task.destroy
    respond_to do |format|
      format.html { redirect_to plc_tasks_url }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_task
    @plc_task = Plc::Task.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_task_params
    params.require(:plc_task).permit(:name, :description, :plc_learning_module_id)
  end
end
