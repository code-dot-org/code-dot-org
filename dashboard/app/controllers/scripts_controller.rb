class ScriptsController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: :show
  before_action :authenticate_user!, except: :show
  check_authorization
  before_action :set_script, only: [:show, :edit, :update, :destroy]
  before_action :set_redirect_override, only: [:show]
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

    # Attempt to redirect user if we think they ended up on the wrong script overview page.
    override_redirect = VersionRedirectOverrider.override_script_redirect?(session, @script)
    if !override_redirect && redirect_script = redirect_script(@script, request.locale)
      redirect_to script_path(redirect_script) + "?redirect_warning=true"
      return
    end

    # Lastly, if user is assigned to newer version of this script, we will
    # ask if they want to be redirected to the newer version.
    @redirect_script_url = @script.redirect_to_script_url(current_user, locale: request.locale)

    @show_redirect_warning = params[:redirect_warning] == 'true'
    @section = current_user&.sections&.find_by(id: params[:section_id])&.summarize
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
    script_id = params[:id]
    @script = ScriptConstants::FAMILY_NAMES.include?(script_id) ?
      Script.get_script_family_redirect_for_user(script_id, user: current_user, locale: request.locale) :
      Script.get_from_cache(script_id)
    raise ActiveRecord::RecordNotFound unless @script

    if current_user && @script.pilot? && !@script.has_pilot_access?(current_user)
      render :no_access
    end
  end

  def script_params
    params.require(:script).permit(:name)
  end

  def general_params
    h = params.permit(
      :visible_to_teachers,
      :curriculum_umbrella,
      :family_name,
      :version_year,
      :project_sharing,
      :login_required,
      :hideable_stages,
      :curriculum_path,
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
      :pilot_experiment,
      :editor_experiment,
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

  def set_redirect_override
    if params[:id] && params[:no_redirect]
      VersionRedirectOverrider.set_script_redirect_override(session, params[:id])
    end
  end

  def redirect_script(script, locale)
    # Return nil if script is nil or we know the user can view the version requested.
    return nil if !script || script.can_view_version?(current_user, locale: locale)

    # Redirect the user to the latest assigned script in this family, or to the latest stable script in this family if
    # none are assigned.
    redirect_script = Script.latest_assigned_version(script.family_name, current_user)
    redirect_script ||= Script.latest_stable_version(script.family_name, locale: locale)

    # Do not redirect if we are already on the correct script.
    return nil if redirect_script == script

    redirect_script
  end
end
