class ProfessionalLearningTasksController < ApplicationController
  load_and_authorize_resource
  before_action :set_professional_learning_task, only: [:show, :edit, :update, :destroy]

  # GET /professional_learning_tasks
  # GET /professional_learning_tasks.json
  def index
    @professional_learning_tasks = ProfessionalLearningTask.all
  end

  # GET /professional_learning_tasks/1
  # GET /professional_learning_tasks/1.json
  def show
  end

  # GET /professional_learning_tasks/new
  def new
    @professional_learning_task = ProfessionalLearningTask.new
  end

  # GET /professional_learning_tasks/1/edit
  def edit
  end

  # POST /professional_learning_tasks
  # POST /professional_learning_tasks.json
  def create
    @professional_learning_task = ProfessionalLearningTask.new(professional_learning_task_params)

    respond_to do |format|
      if @professional_learning_task.save
        format.html { redirect_to @professional_learning_task, notice: 'ProfessionalLearningTask was successfully created.' }
        format.json { render action: 'show', status: :created, location: @professional_learning_task }
      else
        format.html { render action: 'new' }
        format.json { render json: @professional_learning_task.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /professional_learning_tasks/1
  # PATCH/PUT /professional_learning_tasks/1.json
  def update
    respond_to do |format|
      if @professional_learning_task.update(professional_learning_task_params)
        format.html { redirect_to @professional_learning_task, notice: 'ProfessionalLearningTask was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @professional_learning_task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /professional_learning_tasks/1
  # DELETE /professional_learning_tasks/1.json
  def destroy
    @professional_learning_task.destroy
    respond_to do |format|
      format.html { redirect_to professional_learning_tasks_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_professional_learning_task
    @professional_learning_task = ProfessionalLearningTask.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def professional_learning_task_params
    params.require(:professional_learning_task).permit(:name, :description, :professional_learning_module_id)
  end
end
