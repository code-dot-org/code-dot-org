class Plc::LearningModulesController < ApplicationController
  load_and_authorize_resource
  before_action :set_plc_learning_module, only: [:show, :edit, :update, :destroy]

  # GET /plc/learning_modules
  # GET /plc/learning_modules.json
  def index
    @plc_learning_modules = Plc::LearningModule.all
  end

  # GET /plc/learning_modules/1
  # GET /plc/learning_modules/1.json
  def show
  end

  # GET /plc/learning_modules/new
  def new
    @plc_learning_module = Plc::LearningModule.new
  end

  # GET /plc/learning_modules/1/edit
  def edit
  end

  # POST /plc/learning_modules
  # POST /plc/learning_modules.json
  def create
    @plc_learning_module = Plc::LearningModule.new(plc_learning_module_params)

    respond_to do |format|
      if @plc_learning_module.save
        format.html { redirect_to @plc_learning_module, notice: 'Learning module was successfully created.' }
      else
        format.html { render action: 'new' }
      end
    end
  end

  # PATCH/PUT /plc/learning_modules/1
  # PATCH/PUT /plc/learning_modules/1.json
  def update
    respond_to do |format|
      if @plc_learning_module.update(plc_learning_module_params)
        format.html { redirect_to @plc_learning_module, notice: 'Learning module was successfully updated.' }
      else
        format.html { render action: 'edit' }
      end
    end
  end

  # DELETE /plc/learning_modules/1
  # DELETE /plc/learning_modules/1.json
  def destroy
    @plc_learning_module.destroy
    redirect_to action: :index
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_learning_module
    @plc_learning_module = Plc::LearningModule.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_learning_module_params
    params.require(:plc_learning_module).permit(:name, :learning_module_type)
  end
end
