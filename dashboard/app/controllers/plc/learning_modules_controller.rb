class Plc::LearningModulesController < ApplicationController
  load_and_authorize_resource
  # GET /plc/learning_modules
  # GET /plc/learning_modules.json
  def index
  end

  # GET /plc/learning_modules/1
  # GET /plc/learning_modules/1.json
  def show
  end

  # GET /plc/learning_modules/new
  def new
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
    redirect_to action: :index
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def learning_module_params
    params.require(:plc_learning_module).permit(:name, :learning_module_type)
  end
end
