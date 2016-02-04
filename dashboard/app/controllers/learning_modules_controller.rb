class LearningModulesController < ApplicationController
  before_action :set_learning_module, only: [:show, :edit, :update, :destroy]

  # GET /learning_modules
  # GET /learning_modules.json
  def index
    @learning_modules = LearningModule.all
  end

  # GET /learning_modules/1
  # GET /learning_modules/1.json
  def show
  end

  # GET /learning_modules/new
  def new
    @learning_module = LearningModule.new
  end

  # GET /learning_modules/1/edit
  def edit
  end

  # POST /learning_modules
  # POST /learning_modules.json
  def create
    @learning_module = LearningModule.new(learning_module_params)

    respond_to do |format|
      if @learning_module.save
        format.html { redirect_to @learning_module, notice: 'Learning module was successfully created.' }
        format.json { render action: 'show', status: :created, location: @learning_module }
      else
        format.html { render action: 'new' }
        format.json { render json: @learning_module.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /learning_modules/1
  # PATCH/PUT /learning_modules/1.json
  def update
    respond_to do |format|
      if @learning_module.update(learning_module_params)
        format.html { redirect_to @learning_module, notice: 'Learning module was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @learning_module.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /learning_modules/1
  # DELETE /learning_modules/1.json
  def destroy
    @learning_module.destroy
    respond_to do |format|
      format.html { redirect_to learning_modules_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_learning_module
      @learning_module = LearningModule.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def learning_module_params
      params.require(:learning_module).permit(:name, :learning_module_type)
    end
end
