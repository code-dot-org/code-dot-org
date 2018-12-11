class ScriptsController < ApplicationController
  before_action :require_levelbuilder_mode, except: :show
  before_action :authenticate_user!, except: :show
  check_authorization
  before_action :set_script, only: [:show, :edit, :update, :destroy]
  authorize_resource
  before_action :set_script_file, only: [:edit, :update]

  def show
    if @script.redirect_to?
      redirect_path = script_path(Script.get_from_cache(@script.redirect_to))
      redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
      redirect_to "#{redirect_path}#{redirect_query_string}"
      return
    end

    if request.path != (canonical_path = script_path(@script))
      # return a temporary redirect rather than a permanent one, to avoid ever
      # serving a permanent redirect from a script's new location to its old
      # location during the script renaming process.
      redirect_to canonical_path
      return
    end

    if !params[:section_id] && current_user&.last_section_id
      redirect_to "#{request.path}?section_id=#{current_user.last_section_id}"
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
    # Though @script.name is prevented from starting with a dot or tilde or
    # containing a slash, we do this (security) check anyways to prevent
    # directory traversal as validation can be manually bypassed.
    if (@script.name.start_with? '.') ||
      (@script.name.start_with? '~') ||
      (@script.name.include? '/')
      raise ArgumentError, "evil script name (#{@script.name})"
    end

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

    render 'levels/instructions', locals: {stages: script.stages}
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
      :visible_to_teachers,
      :login_required,
      :hideable_stages,
      :professional_learning_course,
      :peer_reviews_to_complete,
      :wrapup_video,
      :student_detail_progress_view,
      :project_widget_visible,
      :exclude_csf_column_in_legend,
      :stage_extras_available,
      :has_verified_resources,
      :has_lesson_plan,
      :script_announcements,
      resourceTypes: [],
      resourceLinks: [],
      project_widget_types: [],
      supported_locales: [],
    ).to_h
    h[:peer_reviews_to_complete] = h[:peer_reviews_to_complete].to_i
    h[:hidden] = !h[:visible_to_teachers]
    h[:script_announcements] = JSON.parse(h[:script_announcements]) if h[:script_announcements]
    h.delete(:visible_to_teachers)
    h
  end

  def i18n_params
    params.permit(
      :name,
      :title,
      :description_audience,
      :description_short,
      :description,
      :stage_descriptions
    ).to_h
  end
end
