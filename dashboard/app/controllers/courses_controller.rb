class CoursesController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: [:index, :show, :vocab, :resources, :code, :standards]
  before_action :authenticate_user!, except: [:index, :show, :vocab, :resources, :code, :standards]
  check_authorization except: [:index]
  before_action :set_unit_group, only: [:show, :vocab, :resources, :code, :standards, :edit, :update, :get_rollup_resources]
  before_action :check_plc_enrollment, only: [:show]
  before_action :render_no_access, only: [:show]
  before_action :set_redirect_override, only: [:show]
  # specifying instance_name and id_param tells CanCan to use the value of @unit_group set in set_unit_group
  # when authorizing actions like vocab and resources. for more details, see
  # https://github.com/ryanb/cancan/blob/705b5d6f0d8a78d9436eb90eda14e771309f155e/lib/cancan/controller_resource.rb#L161-L162
  # https://github.com/ryanb/cancan/blob/705b5d6f0d8a78d9436eb90eda14e771309f155e/lib/cancan/controller_resource.rb#L137-L139

  authorize_resource class: 'UnitGroup', except: [:index], instance_name: 'unit_group', id_param: :course_name

  def new
    @versioned_course_families = []
    @course_families_course_types = []
    UnitGroup.family_names.map do |cf|
      co = CourseOffering.find_by(key: cf)
      first_cv = co.course_versions.first
      ug = first_cv.content_root
      @versioned_course_families << cf unless first_cv.key == 'unversioned'
      @course_families_course_types << [cf, {instruction_type: ug.instruction_type, instructor_audience: ug.instructor_audience, participant_audience: ug.participant_audience}]
    end

    @course_families_course_types = @course_families_course_types.to_h
  end

  def show
    if !params[:section_id] && current_user&.last_section_id
      redirect_to "#{request.path}?section_id=#{current_user.last_section_id}"
      return
    end

    # Attempt to redirect user if we think they ended up on the wrong course overview page.
    override_redirect = VersionRedirectOverrider.override_course_redirect?(session, @unit_group)
    if !override_redirect && redirect_unit_group = redirect_unit_group(@unit_group)
      redirect_to "#{course_path(redirect_unit_group)}/?redirect_warning=true"
      return
    end

    @sections = current_user.try {|u| u.sections_instructed.all.reject(&:hidden).map(&:summarize)}

    @locale_code = request.locale

    render 'show', locals: {unit_group: @unit_group, redirect_warning: params[:redirect_warning] == 'true'}
  end

  def create
    @unit_group = UnitGroup.new(
      name: params.require(:course).require(:name),
      family_name: params.require(:family_name),
      version_year: params.require(:version_year),
      instruction_type: params[:instruction_type] ? params[:instruction_type] : Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led,
      instructor_audience: params[:instructor_audience] ? params[:instructor_audience] : Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
      participant_audience: params[:participant_audience] ? params[:participant_audience] : Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
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
    CourseOffering.add_course_offering(@unit_group)
    @unit_group.reload

    if @unit_group.has_migrated_unit? && @unit_group.course_version
      @unit_group.resources = params[:resourceIds].map {|id| Resource.find(id)} if params.key?(:resourceIds)
      @unit_group.student_resources = params[:studentResourceIds].map {|id| Resource.find(id)} if params.key?(:studentResourceIds)
    end

    @unit_group.reload
    @unit_group.write_serialization
    render json: @unit_group.summarize
  end

  def edit
    # We don't support an edit experience for plc courses
    raise ActiveRecord::ReadOnlyRecord if @unit_group.try(:plc_course)
    @unit_group_data = {
      course_summary: @unit_group.summarize(@current_user, for_edit: true),
      script_names: Unit.all.select {|unit| unit.is_course? == false && !unit.unit_groups.any?}.map(&:name),
      course_families: UnitGroup.family_names,
      version_year_options: UnitGroup.get_version_year_options,
      missing_required_device_compatibilities: @unit_group&.course_version&.course_offering&.missing_required_device_compatibility?
    }
    render 'edit', locals: {unit_group: @unit_group}
  end

  def vocab
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def resources
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def code
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def standards
    @course_summary = @unit_group.summarize_for_rollup(@current_user)
  end

  def get_rollup_resources
    course_version = @unit_group.course_version
    return render status: :bad_request, json: {error: 'Course does not have course version'} unless course_version
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

  private def get_unit_group
    course_name = params[:course_name]

    unit_group = UnitGroup.get_from_cache(course_name)
    return unit_group if unit_group

    # When the url of a course family is requested, redirect to a specific course version.
    if UnitGroup.family_names.include?(params[:course_name])
      unit_group = UnitGroup.latest_stable_version(params[:course_name])
      if unit_group
        redirect_path = url_for(action: params[:action], course_name: unit_group.name)
        redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
        redirect_to "#{redirect_path}#{redirect_query_string}"
      end
    end

    unit_group
  end

  private def set_unit_group
    @unit_group = get_unit_group
    raise ActiveRecord::RecordNotFound unless @unit_group
  end

  private def check_plc_enrollment
    if @unit_group.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      @summarized_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: @unit_group.plc_course)&.summarize]
      render 'plc/user_course_enrollments/index', locals: {summarized_course_enrollments: @summarized_course_enrollments}
      return
    end
  end

  private def render_no_access
    if current_user && !current_user.admin? && !can?(:read, @unit_group)
      render :no_access
    end
  end

  private def course_params
    cp = params.permit(:version_year, :family_name, :has_verified_resources, :has_numbered_units, :pilot_experiment, :published_state, :instruction_type, :instructor_audience, :participant_audience, :announcements).to_h
    cp[:announcements] = JSON.parse(cp[:announcements]) if cp[:announcements]
    cp[:published_state] = Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development unless cp[:published_state]

    cp
  end

  private def set_redirect_override
    if params[:course_name] && params[:no_redirect]
      VersionRedirectOverrider.set_course_redirect_override(session, params[:course_name])
    end
  end

  private def redirect_unit_group(unit_group)
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
