class ScriptsController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: [:show, :vocab, :resources, :code, :standards, :edit, :update, :new, :create]
  before_action :require_levelbuilder_mode_or_test_env, only: [:edit, :update, :new, :create]
  before_action :authenticate_user!, except: [:show, :vocab, :resources, :code, :standards]
  check_authorization
  before_action :set_unit, only: [:show, :vocab, :resources, :code, :standards, :edit, :update, :destroy]
  before_action :render_no_access, only: [:show]
  before_action :set_redirect_override, only: [:show]
  authorize_resource

  use_reader_connection_for_route(:show)

  def show
    if @script.redirect_to?
      redirect_path = script_path(Script.get_from_cache(@script.redirect_to))
      redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
      redirect_to "#{redirect_path}#{redirect_query_string}"
      return
    end

    if request.path != (canonical_path = script_path(@script))
      # return a temporary redirect rather than a permanent one, to avoid ever
      # serving a permanent redirect from a unit's new location to its old
      # location during the unit renaming process.
      redirect_to canonical_path
      return
    end

    if !params[:section_id] && current_user&.last_section_id
      redirect_to request.query_parameters.merge({"section_id" => current_user&.last_section_id})
      return
    end

    # Attempt to redirect user if we think they ended up on the wrong unit overview page.
    override_redirect = VersionRedirectOverrider.override_unit_redirect?(session, @script)
    if !override_redirect && redirect_unit = redirect_unit(@script, request.locale)
      redirect_to script_path(redirect_unit) + "?redirect_warning=true"
      return
    end

    # Lastly, if user is assigned to newer version of this unit, we will
    # ask if they want to be redirected to the newer version.
    @redirect_unit_url = @script.redirect_to_unit_url(current_user, locale: request.locale)

    @show_redirect_warning = params[:redirect_warning] == 'true'
    unless current_user&.student?
      @section = current_user&.sections&.all&.find {|s| s.id.to_s == params[:section_id]}&.summarize
      sections = current_user.try {|u| u.sections.all.reject(&:hidden).map(&:summarize)}
      @sections_with_assigned_info = sections&.map {|section| section.merge!({"isAssigned" => section[:script_id] == @script.id})}
    end

    @show_unversioned_redirect_warning = !!session[:show_unversioned_redirect_warning] && !@script.is_course
    session[:show_unversioned_redirect_warning] = false

    additional_script_data = {
      course_name: @script.unit_group&.name,
      course_id: @script.unit_group&.id,
      show_redirect_warning: @show_redirect_warning,
      redirect_script_url: @redirect_unit_url,
      show_unversioned_redirect_warning: !!@show_unversioned_redirect_warning,
      section: @section,
      user_type: current_user&.user_type,
      user_id: current_user&.id,
      user_providers: current_user&.providers,
      is_verified_instructor: current_user&.verified_instructor?,
      locale: Script.locale_english_name_map[request.locale],
      locale_code: request.locale,
      course_link: @script.course_link(params[:section_id]),
      course_title: @script.course_title || I18n.t('view_all_units'),
      sections: @sections_with_assigned_info
    }

    @script_data = @script.summarize(true, current_user, false, request.locale).merge(additional_script_data)

    if @script.old_professional_learning_course? && current_user && Plc::UserCourseEnrollment.exists?(user: current_user, plc_course: @script.plc_course_unit.plc_course)
      @plc_breadcrumb = {unit_name: @script.plc_course_unit.unit_name, course_view_path: course_path(@script.plc_course_unit.plc_course.unit_group)}
    end
  end

  def index
    authorize! :manage, Script
    rake if params[:rake] == '1'
    # Show all the units that a user has created.
    @scripts = Script.all
  end

  def new
  end

  def create
    return head :bad_request unless general_params[:is_migrated]

    # These fields should be set unless a unit is in a unit group
    # and are required to be set if is_course is true. When creating
    # a unit it is not yet in a unit group so we set default values here
    #
    # Setting default values for the columns would not work because those
    # are not used when you call new() just when you call create
    updated_unit_params = unit_params.merge(
      {
        published_state: SharedCourseConstants::PUBLISHED_STATE.in_development,
        instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
        participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
        instruction_type: SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
      }
    )

    updated_general_params = general_params.merge(
      {
        published_state: SharedCourseConstants::PUBLISHED_STATE.in_development,
        instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
        participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
        instruction_type: SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
      }
    )

    @script = Script.new(updated_unit_params)
    if @script.save && @script.update_text(unit_params, i18n_params, updated_general_params)
      redirect_to edit_script_url(@script), notice: I18n.t('crud.created', model: Script.model_name.human)
    else
      render json: @script.errors
    end
  end

  def destroy
    # Though @script.name is prevented from starting with a dot or tilde or
    # containing a slash, we do this (security) check anyways to prevent
    # directory traversal as validation can be manually bypassed.
    if (@script.name.start_with? '.') ||
      (@script.name.start_with? '~') ||
      (@script.name.include? '/')
      raise ArgumentError, "evil unit name (#{@script.name})"
    end

    @script.destroy
    if Rails.application.config.levelbuilder_mode
      filename = "config/scripts/#{@script.name}.script"
      File.delete(filename) if File.exist?(filename)
      filename = "config/scripts_json/#{@script.name}.script_json"
      File.delete(filename) if File.exist?(filename)
    end
    redirect_to scripts_path, notice: I18n.t('crud.destroyed', model: Script.model_name.human)
  end

  def edit
    raise "The new unit editor does not support level variants with experiments" if @script.is_migrated && @script.script_levels.any?(&:has_experiment?)
    @show_all_instructions = params[:show_all_instructions]
    @script_data = {
      script: @script ? @script.summarize_for_unit_edit : {},
      has_course: @script&.unit_groups&.any?,
      i18n: @script ? @script.summarize_i18n_for_edit : {},
      locales: options_for_locale_select,
      script_families: Script.family_names,
      version_year_options: Script.get_version_year_options,
      is_levelbuilder: current_user.levelbuilder?
    }
  end

  def update
    return head :bad_request, json: {message: 'cannot update unmigrated unit'} unless @script.is_migrated
    return head :bad_request, json: {message: 'is_migrated must be true'} unless general_params[:is_migrated]

    if params[:last_updated_at] && params[:last_updated_at] != @script.updated_at.to_s
      msg = "Could not update the unit because it has been modified more recently outside of this editor. Please save a copy your work, reload the page, and try saving again."
      raise msg
    end

    raise 'Must provide family and version year for course' if params[:isCourse] && (!params[:family_name] || !params[:version_year])

    if @script.update_text(unit_params, i18n_params, general_params)
      @script.reload
      render json: @script.summarize_for_unit_edit
    else
      render(status: :not_acceptable, json: @script.errors)
    end
  end

  def instructions
    require_levelbuilder_mode

    unit = Script.get_from_cache(params[:id])

    render 'levels/instructions', locals: {lessons: unit.lessons}
  end

  def vocab
    @unit_summary = @script.summarize_for_rollup(current_user)
  end

  def resources
    @unit_summary = @script.summarize_for_rollup(current_user)
  end

  def code
    @unit_summary = @script.summarize_for_rollup(current_user)
  end

  def standards
    @unit_summary = @script.summarize_for_rollup(current_user)
  end

  def get_rollup_resources
    unit = Script.get_from_cache(params[:id])
    course_version = unit.get_course_version
    return render status: 400, json: {error: 'Script does not have course version'} unless course_version
    rollup_pages = []
    if unit.lessons.any? {|l| !l.programming_expressions.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Code', url: code_script_path(unit), course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.resources.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Resources', url: resources_script_path(unit), course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.standards.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Standards', url: standards_script_path(unit), course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.vocabularies.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Vocabulary', url: vocab_script_path(unit), course_version_id: course_version.id))
    end
    rollup_pages.each do |r|
      r.is_rollup = true
      r.save! if r.changed?
    end
    render json: rollup_pages.map(&:summarize_for_lesson_edit).to_json
  end

  private

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

  def get_unit
    unit_id = params[:id]

    script =
      params[:action] == "edit" ?
      Script.get_without_cache(unit_id, with_associated_models: true) :
      Script.get_from_cache(unit_id, raise_exceptions: false)
    return script if script

    if Script.family_names.include?(unit_id)
      script = Script.get_unit_family_redirect_for_user(unit_id, user: current_user, locale: request.locale)
      session[:show_unversioned_redirect_warning] = true
      Script.log_redirect(unit_id, script.redirect_to, request, 'unversioned-script-redirect', current_user&.user_type) if script.present?
      return script
    end

    return nil
  end

  def set_unit
    @script = get_unit
    raise ActiveRecord::RecordNotFound unless @script
  end

  def render_no_access
    if current_user && !current_user.admin? && !can?(:read, @script)
      render :no_access
    end
  end

  def unit_params
    params.require(:script).permit(:name)
  end

  def general_params
    h = params.permit(
      :published_state,
      :instruction_type,
      :instructor_audience,
      :participant_audience,
      :deprecated,
      :curriculum_umbrella,
      :family_name,
      :version_year,
      :is_maker_unit,
      :project_sharing,
      :login_required,
      :hideable_lessons,
      :curriculum_path,
      :professional_learning_course,
      :only_instructor_review_required,
      :peer_reviews_to_complete,
      :wrapup_video,
      :student_detail_progress_view,
      :project_widget_visible,
      :lesson_extras_available,
      :has_verified_resources,
      :tts,
      :is_course,
      :show_calendar,
      :weekly_instructional_minutes,
      :is_migrated,
      :announcements,
      :pilot_experiment,
      :editor_experiment,
      :include_student_lesson_plans,
      :use_legacy_lesson_plans,
      :lesson_groups,
      resourceTypes: [],
      resourceLinks: [],
      resourceIds: [],
      studentResourceIds: [],
      project_widget_types: [],
      supported_locales: [],
    ).to_h
    h[:peer_reviews_to_complete] = h[:peer_reviews_to_complete].to_i > 0 ? h[:peer_reviews_to_complete].to_i : nil
    h[:announcements] = JSON.parse(h[:announcements]) if h[:announcements]
    h[:lesson_groups] = JSON.parse(h[:lesson_groups]).map {|lg| lg.transform_keys(&:underscore)} if h[:lesson_groups]

    h
  end

  def i18n_params
    params.permit(
      :name,
      :title,
      :description_audience,
      :description_short,
      :description,
      :student_description,
      :stage_descriptions
    ).to_h
  end

  def set_redirect_override
    if params[:id] && params[:no_redirect]
      VersionRedirectOverrider.set_unit_redirect_override(session, params[:id])
    end
  end

  def redirect_unit(unit, locale)
    # Return nil if unit is nil or we know the user can view the version requested.
    return nil if !unit || unit.can_view_version?(current_user, locale: locale)

    # Redirect the user to the latest assigned unit in this family, or to the latest stable unit in this family if
    # none are assigned.
    redirect_unit = Script.latest_assigned_version(unit.family_name, current_user)
    redirect_unit ||= Script.latest_stable_version(unit.family_name, locale: locale)

    # Do not redirect if we are already on the correct unit.
    return nil if redirect_unit == unit

    redirect_unit
  end
end
