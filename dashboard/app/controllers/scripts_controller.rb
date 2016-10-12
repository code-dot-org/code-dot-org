class ScriptsController < ApplicationController
  before_action :require_levelbuilder_mode, except: :show
  before_action :authenticate_user!, except: :show
  check_authorization
  before_action :set_script, only: [:show, :edit, :update, :destroy]
  authorize_resource
  before_action :set_script_file, only: [:edit, :update]

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
  end

  def new
  end

  def create
    @script = Script.new(script_params)
    if @script.save && @script.update_text(script_params, params[:script_text], i18n_params, general_params)
      redirect_to @script, notice: I18n.t('crud.created', model: Script.model_name.human)
    else
      render 'new'
    end
  end

  def destroy
    @script.destroy
    filename = "config/scripts/#{@script.name}.script"
    File.delete(filename) if File.exist?(filename)
    redirect_to scripts_path, notice: I18n.t('crud.destroyed', model: Script.model_name.human)
  end

  def edit
    @show_all_instructions = params[:show_all_instructions]
  end

  def update
    script_text = params[:script_text]
    if @script.update_text(script_params, script_text, i18n_params, general_params)
      redirect_to @script, notice: I18n.t('crud.updated', model: Script.model_name.human)
    else
      render action: 'edit'
    end
  end

  def instructions
    require_levelbuilder_mode

    script = Script.get_from_cache(params[:script_id])

    render 'levels/instructions', locals: { stages: script.stages }
  end

  private

  def set_script_file
    @script_file = ScriptDSL.serialize_stages(@script)
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

  def general_params
    h = params.permit(
      :hidden,
      :login_required,
      :hideable_stages,
      :professional_learning_course,
      :peer_reviews_to_complete,
      :wrapup_video,
    ).to_h
    h[:peer_reviews_to_complete] = h[:peer_reviews_to_complete].to_i
    h
  end

  def i18n_params
    params.permit(
      :name,
      :title,
      :description_audience,
      :description_short,
      :description,
    ).to_h
  end
end
