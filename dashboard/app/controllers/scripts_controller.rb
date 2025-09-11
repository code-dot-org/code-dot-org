require 'cdo/i18n'

class ScriptsController < ApplicationController
  include VersionRedirectOverrider
  include TeacherDashboardUtils

  before_action :require_levelbuilder_mode, except: [:show, :vocab, :resources, :code, :standards, :edit, :update, :new, :create]
  before_action :require_levelbuilder_mode_or_test_env, only: [:edit, :update, :new, :create]
  before_action :authenticate_user!, except: [:show, :vocab, :resources, :code, :standards]
  check_authorization
  before_action :set_unit, only: [:show, :vocab, :resources, :code, :get_rollup_resources, :standards, :edit, :destroy]
  before_action :render_no_access, only: [:show]
  before_action :set_redirect_override, only: [:show]
  before_action :redirect_to_canonical_path, only: [:show, :vocab, :resources, :code, :standards]
  before_action :authorize_script, except: [:update]
  load_and_authorize_resource class: 'Unit', only: [:update]

  use_reader_connection_for_route(:show)

  def show
    if @script.is_deprecated
      @deprecated_course_name = @script.name
      return render 'errors/deprecated_course'
    end
    #TODO: TEACH-2050 Modularity support redirect to property. Currently this redirects to the script path, which
    # will redirect to the redirect script's original unit group
    if @script.redirect_to?
      redirect_path = script_path(Unit.get_from_cache(@script.redirect_to))
      redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
      redirect_to "#{redirect_path}#{redirect_query_string}"
      return
    end

    if TeacherDashboardUtils.can_redirect_to_teacher_dashboard?(current_user)
      if request.query_parameters.include? "user_id"
        redirect_query_string = request.query_string.sub("user_id=#{request.query_parameters[:user_id]}", "").sub("&&", "&")
        if redirect_query_string.empty?
          redirect_to script_path(@script)
        else
          redirect_to "#{script_path(@script)}?#{redirect_query_string}"
        end
        return
      end
      if current_user&.user_type == "teacher" && current_user.sections_instructed.any? {|s| s.script_id == @script.id || s.unit_group&.id == @course&.id}
        most_recent_section = current_user.sections_instructed.select {|s| s.script_id == @script.id || s.unit_group&.id == @course.id}.last
        section_id = params[:section_id]
        section_id ||= most_recent_section&.id
        if section_id
          teacher_dashboard_section_path = "/teacher_dashboard/sections/#{section_id}/unit/#{@script.name}"
          if Policies::Courses.modularity_enabled? && @course && @unit_position
            teacher_dashboard_section_path = "/teacher_dashboard/sections/#{section_id}/courses/#{@course.name}/units/#{@unit_position}"
          end
          redirect_to teacher_dashboard_section_path
          return
        end
      end
    end

    canonical_path = script_path(@script)
    if Policies::Courses.modularity_enabled? && @course && @unit_position
      canonical_path = course_unit_path(@course, @unit_position)
    end
    if request.path != canonical_path
      # return a temporary redirect rather than a permanent one, to avoid ever
      # serving a permanent redirect from a unit's new location to its old
      # location during the unit renaming process.
      redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
      redirect_to "#{canonical_path}#{redirect_query_string}"
      return
    end

    if !params[:section_id] && current_user&.last_section_id
      redirect_to request.query_parameters.merge({"section_id" => current_user&.last_section_id})
      return
    end

    # Attempt to redirect user if we think they ended up on the wrong unit overview page.
    override_redirect = VersionRedirectOverrider.override_unit_redirect?(session, @script)
    if !override_redirect && redirect_info = get_redirect_info(@script, request.locale, @course)
      if redirect_info[:redirect_ugu]
        redirect_to course_unit_path(redirect_info[:redirect_ugu].unit_group, redirect_info[:redirect_ugu].position) + "?redirect_warning=true"
        return
      elsif redirect_info[:redirect_unit]
        redirect_to script_path(redirect_info[:redirect_unit]) + "?redirect_warning=true"
        return
      end
    end

    # Lastly, if user is assigned to newer version of this unit, we will
    # ask if they want to be redirected to the newer version.
    @redirect_unit_url = @script.redirect_to_unit_url(current_user, locale: request.locale)

    @show_redirect_warning = params[:redirect_warning] == 'true'
    unless current_user&.student?
      @section = current_user&.sections_instructed&.all&.find {|s| s.id.to_s == params[:section_id]}&.summarize
      @sections = current_user.try {|u| u.sections_instructed.all.reject(&:hidden).map(&:summarize)}
    end

    additional_script_data = {
      course_name: @course&.name,
      course_id: @course&.id,
      show_redirect_warning: @show_redirect_warning,
      redirect_script_url: @redirect_unit_url,
      section: @section,
      user_type: current_user&.user_type,
      user_id: current_user&.id,
      user_providers: current_user&.providers,
      is_instructor: @script.can_be_instructor?(current_user),
      is_verified_instructor: current_user&.verified_instructor?,
      locale: Unit.locale_english_name_map[request.locale],
      locale_code: request.locale,
      course_link: @course&.link(section_id: params[:section_id]),
      course_title: @course&.localized_title || I18n.t('view_all_units'),
      is_single_unit_course: @course&.single_unit_course?,
      sections: @sections
    }

    @script_data = @script.summarize(true, current_user, false, request.locale, unit_group_unit: @unit_group_unit).merge(additional_script_data)

    @page_title = "Unit: #{@script.localized_title}"
    @page_description = @script.localized_description.truncate(200, separator: '.', omission: '.')

    if @script.get_original_unit_group&.single_unit_course?
      canonical_ug = UnitGroup.latest_stable_version(@course.family_name)&.name
      @canonical_url = CDO.studio_url("/courses/#{canonical_ug}/units/1") if canonical_ug
    end

    if @script.old_professional_learning_course? && current_user && Plc::UserCourseEnrollment.exists?(user: current_user, plc_course: @script.plc_course_unit.plc_course)
      @plc_breadcrumb = {unit_name: @script.plc_course_unit.unit_name, course_view_path: course_path(@script.plc_course_unit.plc_course.unit_group)}
    end
  end

  def index
    authorize! :manage, Unit
    rake if params[:rake] == '1'
    # Show all the units that a user has created.
    @scripts = Unit.all
  end

  def new
    @versioned_unit_families = []
    @unit_families_course_types = []
    Unit.family_names.map do |cf|
      co = CourseOffering.find_by(key: cf)

      # There are some old family names for connecting between units in a course which will not be a course offering
      next unless co
      first_cv = co.course_versions.first
      next unless first_cv
      @versioned_unit_families << cf unless first_cv.key == 'unversioned'

      unit = first_cv.content_root
      next unless unit
      @unit_families_course_types << [cf]
    end

    @unit_families_course_types = @unit_families_course_types.compact
  end

  def create
    return head :bad_request unless general_params[:is_migrated]
    @script = Unit.new(unit_params)
    if @script.save && @script.update_text(unit_params, i18n_params, general_params)
      redirect_to edit_script_url(@script), notice: I18n.t('crud.created', model: Unit.model_name.human)
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
      FileUtils.rm_f(filename)
      filename = "config/scripts_json/#{@script.name}.script_json"
      FileUtils.rm_f(filename)
    end
    redirect_to scripts_path, notice: I18n.t('crud.destroyed', model: Unit.model_name.human)
  end

  def edit
    # Deprecated scripts should not be edited.
    if @script.is_deprecated
      @deprecated_course_name = @script.name
      return render 'errors/deprecated_course'
    end
    raise "The new unit editor does not support level variants with experiments" if @script.is_migrated && @script.script_levels.any?(&:has_experiment?)
    @script_data = {
      script: @script ? @script.summarize_for_unit_edit : {},
      has_course: @script&.unit_groups&.any?,
      i18n: @script ? @script.summarize_i18n_for_edit : {},
      locales: Cdo::I18n.locale_options,
      script_families: Unit.family_names,
      version_year_options: Unit.get_version_year_options,
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

    unit = Unit.get_from_cache(params[:id])

    render 'levels/instructions', locals: {lessons: unit.lessons}
  end

  def vocab
    @unit_summary = @script.summarize_for_rollup(current_user, unit_group_unit: @unit_group_unit)
  end

  def resources
    @unit_summary = @script.summarize_for_rollup(current_user, unit_group_unit: @unit_group_unit)
  end

  def code
    @unit_summary = @script.summarize_for_rollup(current_user, unit_group_unit: @unit_group_unit)
  end

  def standards
    @unit_summary = @script.summarize_for_rollup(current_user, unit_group_unit: @unit_group_unit)
  end

  def get_rollup_resources
    unit = @script
    course_version = unit.get_course_version
    if @unit_group_unit
      course_version = @unit_group_unit.unit_group.course_version
    end
    return render status: :bad_request, json: {error: 'Unit does not have course version'} unless course_version
    code_path = code_script_path(unit)
    resources_path = resources_script_path(unit)
    standards_path = standards_script_path(unit)
    vocab_path = vocab_script_path(unit)
    if Policies::Courses.modularity_enabled? && @unit_group_unit
      course = @unit_group_unit.unit_group
      unit_position = @unit_group_unit.position
      code_path = code_course_unit_path(course, unit_position)
      resources_path = resources_course_unit_path(course, unit_position)
      standards_path = standards_course_unit_path(course, unit_position)
      vocab_path = vocab_course_unit_path(course, unit_position)
    end
    rollup_pages = []
    if unit.lessons.any? {|l| !l.programming_expressions.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Code', url: code_path, course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.resources.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Resources', url: resources_path, course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.standards.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Standards', url: standards_path, course_version_id: course_version.id))
    end
    if unit.lessons.any? {|l| !l.vocabularies.empty?}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Vocabulary', url: vocab_path, course_version_id: course_version.id))
    end
    rollup_pages.each do |r|
      r.is_rollup = true
      r.save! if r.changed?
    end
    render json: rollup_pages.map(&:summarize_for_lesson_edit).to_json
  end

  private def rake
    @errors = []
    begin
      Unit.rake
      redirect_to scripts_path, notice: 'Updated.'
    rescue StandardError => exception
      @errors << exception.to_s
      render action: 'index'
    end
  end

  private def get_unit_by_name
    # Unfortunately, scripts routes sometimes pass the name and sometimes pass
    # the id, making params[:id] a misnomer when passing the name.
    unit_name = params[:id]

    # Showing scripts by id is no longer supported. Other codepaths still need
    # get_without_cache and get_from_cache to support lookup by id, so we filter
    # out numerical ids here rather than removing support for them from those
    # methods.
    is_id = unit_name.to_i.to_s == unit_name.to_s
    raise ActiveRecord::RecordNotFound if is_id

    script = params[:action] == "edit" ?
      Unit.get_without_cache(unit_name, with_associated_models: true) :
      Unit.get_from_cache(unit_name, raise_exceptions: false)

    return {script: script} if script

    # Redirect to the latest version or the assigned version of a single-unit course
    if UnitGroup.family_names.include?(unit_name)
      unit_group = UnitGroup.latest_stable_version(unit_name, locale: request.locale) ||
        UnitGroup.latest_stable_version(unit_name)
      if unit_group&.can_be_participant?(current_user)
        unit_group = UnitGroup.latest_assigned_version(unit_name, current_user) || unit_group
      end
      if unit_group&.single_unit_course?
        script = unit_group.units_for_user(current_user).first
        return {script: script, unit_group: unit_group}
      end
    end

    nil
  end

  private def set_unit
    course_name = params[:course_course_name]
    @unit_position = params[:position]
    if course_name && @unit_position
      context = Queries::Courses.get_unit_context(course_name, @unit_position)
      if context
        @course = context[:unit_group]
        @unit_group_unit = context[:unit_group_unit]
        @script = context[:unit]
      end
    else
      result = get_unit_by_name
      raise ActiveRecord::RecordNotFound unless result && result[:script]
      @script = result[:script]
      # Use the unit_group from the result if it's a single unit course, otherwise fall back to original logic
      @course = result[:unit_group] || @script.original_unit_group
      @unit_group_unit = @script.unit_group_units.find {|ugu| ugu.unit_group == @course}
      @unit_position = @unit_group_unit&.position
    end
    raise ActiveRecord::RecordNotFound unless @script
  end

  private def render_no_access
    if current_user && !current_user.admin? && !can?(:read, @script, @course)
      render :no_access
    end
  end

  private def unit_params
    params.require(:script).permit(:name)
  end

  private def general_params
    h = params.permit(
      :hide_within_course,
      :deprecated,
      :curriculum_umbrella,
      :family_name,
      :version_year,
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
      :has_unnumbered_lessons,
      :has_verified_resources,
      :tts,
      :show_calendar,
      :weekly_instructional_minutes,
      :is_migrated,
      :announcements,
      :editor_experiment,
      :include_student_lesson_plans,
      :use_legacy_lesson_plans,
      :lesson_groups,
      :content_area,
      :enable_blockly_keyboard_navigation,
      resourceIds: [],
      studentResourceIds: [],
      project_widget_types: [],
      supported_locales: [],
      topic_tags: [],
    ).to_h
    h[:peer_reviews_to_complete] = h[:peer_reviews_to_complete].to_i > 0 ? h[:peer_reviews_to_complete].to_i : nil
    h[:announcements] = JSON.parse(h[:announcements]) if h[:announcements]
    h[:lesson_groups] = JSON.parse(h[:lesson_groups]).map {|lg| lg.transform_keys(&:underscore)} if h[:lesson_groups]

    h
  end

  private def i18n_params
    params.permit(
      :name,
      :title,
      :description_audience,
      :description_short,
      :description,
      :student_description,
    ).to_h
  end

  private def set_redirect_override
    if @script && params[:no_redirect]
      VersionRedirectOverrider.set_unit_redirect_override(session, @script.name)
    end
  end

  private def get_redirect_info(unit, locale, course)
    # Return nil if unit is nil or we know the user can view the version requested.
    return nil if !unit || unit.can_view_version?(current_user, locale: locale, unit_group: course)

    # Redirect the user to the latest assigned unit in this family, or to the latest stable unit in this family if
    # none are assigned.
    redirect_unit = Unit.latest_assigned_version(unit.family_name, current_user)
    redirect_unit ||= Unit.latest_stable_version(unit.family_name, locale: locale)

    if course&.single_unit_course?
      redirect_unit_group = UnitGroup.latest_assigned_version(course.family_name, current_user)
      redirect_unit_group ||= UnitGroup.latest_stable_version(course.family_name, locale: locale)
      redirect_unit = redirect_unit_group.units_for_user(current_user).first if redirect_unit_group&.single_unit_course?
    end

    # Do not redirect if we are already on the correct unit.
    return nil if redirect_unit == unit

    ugu = Queries::Courses.unit_group_unit(redirect_unit, redirect_unit_group)
    {redirect_unit: redirect_unit, redirect_ugu: ugu}
  end

  # Redirect /s/... to /courses/.../units/...
  private def redirect_to_canonical_path
    unit_name_or_id = params[:script_id] || params[:id]
    canonical_path = Services::Courses.canonical_path(request.fullpath, unit_name_or_id)
    redirect_to canonical_path unless canonical_path == request.fullpath
  end

  # Authorize in a separate before_action rather than using CanCan's authorize_resource
  # After the URL restructuring from /s/... to /courses/.../units/... the selected unit
  # was no longer being authorized, and instead the Unit model was being authorized, leading
  # some users to have access to certain courses they shouldn't have access to (see
  # TEACH-1975 for more details).This solves the issue by explicitly calling authorize!
  # on the @script if it is set.
  private def authorize_script
    authorize! params[:action].to_sym, @script || Unit, @course
  end
end
