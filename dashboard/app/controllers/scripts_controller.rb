class ScriptsController < ApplicationController
  before_filter :require_levelbuilder_mode, except: :show
  before_filter :authenticate_user!, except: :show
  check_authorization
  before_action :set_script, only: [:show, :edit, :update, :destroy]
  authorize_resource
  before_action :set_script_file, only: [:edit, :update, :destroy]

  def show
    if request.path != (canonical_path = script_path(@script))
      redirect_to canonical_path, status: :moved_permanently
      return
    end
  end

  def index
    authorize! :manage, Script
    rake if params[:rake] == '1'
    # Show all the scripts that a user has created.
    @scripts = Script.all
    @script_file_exists = {}
  end

  def new
  end

  def create
    @script_text = params[:script_text]
    @script = Script.new(script_params)
    if @script.save
      File.write("config/scripts/#{@script.name}.script", @script_text)
      redirect_to @script
    else
      render 'new'
    end
  end

  def destroy
    @script.destroy
    filename = "config/scripts/#{@script.name}.script"
    File.delete(filename) if File.exist?(filename)
    respond_to do |format|
      format.html { redirect_to scripts_path, notice: I18n.t('crud.destroyed', model: Script.model_name.human) }
    end
  end

  def edit
    @show_all_instructions = params[:show_all_instructions]
  end

  def update
    respond_to do |format|
      script_text = params[:script_text]
      if @script.update_text(script_params, script_text)
        format.html { redirect_to @script, notice: I18n.t('crud.updated', model: Script.model_name.human) }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @script.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_script_file
    Dir.chdir(Rails.root) do
      filename = "config/scripts/#{@script.name}.script"
      @script_file = File.exist?(filename) && File.read(filename)
    end
  end

  def rake
    @errors = []
    begin
      Script.rake
      redirect_to scripts_path, notice: 'Updated.'
    rescue StandardError => e
      @errors << e.to_s
      render action: 'index'
    end
  end

  def set_script
    @script = Script.get_from_cache(params[:id])
  end

  def script_params
    params.require(:script).permit(:name)
  end

end
