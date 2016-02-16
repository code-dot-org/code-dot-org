class ProfessionalLearningModulesController < ApplicationController
  load_and_authorize_resource
  before_action :set_professional_learning_module, only: [:show, :edit, :update, :destroy]

  # GET /professional_learning_modules
  # GET /professional_learning_modules.json
  def index
    @professional_learning_modules = ProfessionalLearningModule.all
  end

  # GET /professional_learning_modules/1
  # GET /professional_learning_modules/1.json
  def show
  end

  # GET /professional_learning_modules/new
  def new
    @professional_learning_module = ProfessionalLearningModule.new
  end

  # GET /professional_learning_modules/1/edit
  def edit
  end

  # POST /professional_learning_modules
  # POST /professional_learning_modules.json
  def create
    @professional_learning_module = ProfessionalLearningModule.new(professional_learning_module_params)

    respond_to do |format|
      if @professional_learning_module.save
        format.html { redirect_to @professional_learning_module, notice: 'Learning module was successfully created.' }
        format.json { render action: 'show', status: :created, location: @professional_learning_module }
      else
        format.html { render action: 'new' }
        format.json { render json: @professional_learning_module.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /professional_learning_modules/1
  # PATCH/PUT /professional_learning_modules/1.json
  def update
    respond_to do |format|
      if @professional_learning_module.update(professional_learning_module_params)
        format.html { redirect_to @professional_learning_module, notice: 'Learning module was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @professional_learning_module.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /professional_learning_modules/1
  # DELETE /professional_learning_modules/1.json
  def destroy
    @professional_learning_module.destroy
    respond_to do |format|
      format.html { redirect_to professional_learning_modules_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_professional_learning_module
    @professional_learning_module = ProfessionalLearningModule.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def professional_learning_module_params
    params.require(:professional_learning_module).permit(:name, :learning_module_type)
  end
end
