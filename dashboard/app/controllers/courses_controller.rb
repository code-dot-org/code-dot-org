class CoursesController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: [:index, :show, :vocab, :resources, :code, :standards]
  before_action :authenticate_user!, except: [:index, :show, :vocab, :resources, :code, :standards]
  check_authorization except: [:index]
  before_action :set_unit_group, only: [:show, :vocab, :resources, :code, :standards, :edit, :update, :get_rollup_resources]
  before_action :render_no_access, only: [:show, :vocab, :resources, :code, :standards]
  before_action :set_redirect_override, only: [:show]
  authorize_resource class: 'UnitGroup', except: [:index]

  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true, has_i18n: true)
    respond_to do |format|
      format.html do
        @is_teacher = (current_user && current_user.teacher?) || params[:view] == 'teacher'
        @is_english = request.language == 'en'
        @is_signed_out = current_user.nil?
        @force_race_interstitial = params[:forceRaceInterstitial]
        @modern_elementary_courses_available = Script.modern_elementary_courses_available?(request.locale)
      end
      format.json do
        course_infos = UnitGroup.valid_course_infos(user: current_user)
        render json: course_infos
      end
    end
  end

  def show
    if !params[:section_id] && current_user&.last_section_id
      redirect_to "#{request.path}?section_id=#{current_user.last_section_id}"
      return
    end

    if @unit_group.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: @unit_group.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    # Attempt to redirect user if we think they ended up on the wrong course overview page.
    override_redirect = VersionRedirectOverrider.override_course_redirect?(session, @unit_group)
    if !override_redirect && redirect_unit_group = redirect_unit_group(@unit_group)
      redirect_to "#{course_path(redirect_unit_group)}/?redirect_warning=true"
      return
    end

    sections = current_user.try {|u| u.sections.where(hidden: false).select(:id, :name, :course_id, :script_id)}
    @sections_with_assigned_info = sections&.map {|section| section.attributes.merge!({"isAssigned" => section[:course_id] == @unit_group.id})}

    render 'show', locals: {unit_group: @unit_group, redirect_warning: params[:redirect_warning] == 'true'}
  end

  def new
  end

  def create
    @unit_group = UnitGroup.new(
      name: params.require(:course).require(:name),
      family_name: params.require(:family_name),
      version_year: params.require(:version_year),
      has_numbered_units: true
    )
    if @unit_group.save
      @unit_group.write_serialization
      redirect_to action: :edit, course_name: @unit_group.name
    else
      render 'new', locals: {unit_group: @unit_group}
    end
  end

  def update
    @unit_group.persist_strings_and_units_changes(params[:scripts], params[:alternate_units], i18n_params)
    @unit_group.update(course_params)
    @unit_group.write_serialization
    CourseOffering.add_course_offering(@unit_group)
    @unit_group.reload

    @unit_group.update_teacher_resources(params[:resourceTypes], params[:resourceLinks]) unless @unit_group.has_migrated_unit?
    if @unit_group.has_migrated_unit? && @unit_group.course_version
      @unit_group.resources = params[:resourceIds].map {|id| Resource.find(id)} if params.key?(:resourceIds)
      @unit_group.student_resources = params[:studentResourceIds].map {|id| Resource.find(id)} if params.key?(:studentResourceIds)
    end

    @unit_group.reload
    render json: @unit_group.summarize
  end

  def edit
    # We don't support an edit experience for plc courses
    raise ActiveRecord::ReadOnlyRecord if @unit_group.try(:plc_course)
    render 'edit', locals: {unit_group: @unit_group}
  end

  def vocab
    return render :forbidden unless can?(:vocab, @unit_group)
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def resources
    return render :forbidden unless can?(:resources, @unit_group)
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def code
    return render :forbidden unless can?(:code, @unit_group)
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def standards
    return render :forbidden unless can?(:standards, @unit_group)
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def get_rollup_resources
    course_version = @unit_group.course_version
    return render status: 400, json: {error: 'Course does not have course version'} unless course_version
    rollup_pages = []
    if @unit_group.default_units.any? {|s| s.lessons.any? {|l| !l.programming_expressions.empty?}}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Code', url: code_course_path(@unit_group), course_version_id: course_version.id))
    end
    if @unit_group.default_units.any? {|s| s.lessons.any? {|l| !l.resources.empty?}}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Resources', url: resources_course_path(@unit_group), course_version_id: course_version.id))
    end
    if @unit_group.default_units.any? {|s| s.lessons.any? {|l| !l.standards.empty?}}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Standards', url: standards_course_path(@unit_group), course_version_id: course_version.id))
    end
    if @unit_group.default_units.any? {|s| s.lessons.any? {|l| !l.vocabularies.empty?}}
      rollup_pages.append(Resource.find_or_create_by!(name: 'All Vocabulary', url: vocab_course_path(@unit_group), course_version_id: course_version.id))
    end
    rollup_pages.each do |r|
      r.is_rollup = true
      r.save! if r.changed?
    end
    render json: rollup_pages.map(&:summarize_for_lesson_edit).to_json
  end

  def i18n_params
    params.permit(
      :title,
      :description_short,
      :description_student,
      :description_teacher,
      :version_title
    ).to_h
  end

  private

  def get_unit_group
    course_name = params[:course_name]

    unit_group =
      params[:action] == "edit" ?
        UnitGroup.get_without_cache(course_name) :
        UnitGroup.get_from_cache(course_name)

    return unit_group if unit_group

    # When the url of a course family is requested, redirect to a specific course version.
    if UnitGroup.family_names.include?(params[:course_name])
      unit_group = UnitGroup.latest_stable_version(params[:course_name])
      redirect_to action: params[:action], course_name: unit_group.name
    end

    unit_group
  end

  def set_unit_group
    @unit_group = get_unit_group
    raise ActiveRecord::RecordNotFound unless @unit_group
  end

  def render_no_access
    if @unit_group.pilot?
      authenticate_user!
      unless @unit_group.has_pilot_access?(current_user)
        return render :no_access
      end
    end

    if @unit_group.in_development?
      authenticate_user!
      unless current_user.permission?(UserPermission::LEVELBUILDER)
        return render :no_access
      end
    end
  end

  def course_params
    cp = params.permit(:version_year, :family_name, :has_verified_resources, :has_numbered_units, :pilot_experiment, :published_state, :instruction_type, :instructor_audience, :participant_audience, :announcements).to_h
    cp[:announcements] = JSON.parse(cp[:announcements]) if cp[:announcements]
    cp[:published_state] = SharedCourseConstants::PUBLISHED_STATE.in_development unless cp[:published_state]

    cp
  end

  def set_redirect_override
    if params[:course_name] && params[:no_redirect]
      VersionRedirectOverrider.set_course_redirect_override(session, params[:course_name])
    end
  end

  def redirect_unit_group(unit_group)
    # Return nil if unit_group is nil or we know the user can view the version requested.
    return nil if !unit_group || unit_group.can_view_version?(current_user)

    # Redirect the user to the latest assigned unit_group in this family, or to the latest unit_group in this family if none
    # are assigned.
    redirect_unit_group = UnitGroup.latest_assigned_version(unit_group.family_name, current_user)
    redirect_unit_group ||= UnitGroup.latest_stable_version(unit_group.family_name)

    # Do not redirect if we are already on the correct unit_group.
    return nil if redirect_unit_group == unit_group

    redirect_unit_group
  end
end
