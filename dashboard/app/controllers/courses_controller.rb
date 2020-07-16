class CoursesController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: [:index, :show]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_redirect_override, only: [:show]
  authorize_resource class: 'UnitGroup', except: [:index]

  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)
    respond_to do |format|
      format.html do
        @is_teacher = (current_user && current_user.teacher?) || params[:view] == 'teacher'
        @is_english = request.language == 'en'
        @is_signed_out = current_user.nil?
        @force_race_interstitial = params[:forceRaceInterstitial]
        @header_banner_image_filename = !@is_teacher ? "courses-hero-student" : "courses-hero-teacher"
        @modern_elementary_courses_available = Script.modern_elementary_courses_available?(request.locale)
      end
      format.json do
        course_infos = UnitGroup.valid_course_infos(user: current_user)
        render json: course_infos
      end
    end
  end

  def show
    # csp and csd are each "course families", each containing multiple "course versions".
    # When the url of a course family is requested, redirect to a specific course version.
    #
    # For now, use hard-coded list to determine whether the given course_name is actually a course family name.
    if UnitGroup::FAMILY_NAMES.include?(params[:course_name])
      redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
      redirect_to_course = UnitGroup.all_courses.
          select {|c| c.family_name == params[:course_name] && c.is_stable?}.
          sort_by(&:version_year).
          last
      redirect_to "/courses/#{redirect_to_course.name}#{redirect_query_string}"
      return
    end

    if !params[:section_id] && current_user&.last_section_id
      redirect_to "#{request.path}?section_id=#{current_user.last_section_id}"
      return
    end

    course = UnitGroup.get_from_cache(params[:course_name])
    raise ActiveRecord::RecordNotFound unless course

    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    if course.pilot?
      authenticate_user!
      unless course.has_pilot_access?(current_user)
        render :no_access
        return
      end
    end

    # Attempt to redirect user if we think they ended up on the wrong course overview page.
    override_redirect = VersionRedirectOverrider.override_course_redirect?(session, course)
    if !override_redirect && redirect_course = redirect_course(course)
      redirect_to "/courses/#{redirect_course.name}/?redirect_warning=true"
      return
    end

    sections = current_user.try {|u| u.sections.where(hidden: false).select(:id, :name, :course_id, :script_id)}
    @sections_with_assigned_info = sections&.map {|section| section.attributes.merge!({"isAssigned" => section[:course_id] == course.id})}

    render 'show', locals: {course: course, redirect_warning: params[:redirect_warning] == 'true'}
  end

  def new
  end

  def create
    course = UnitGroup.new(name: params.require(:course).require(:name))
    if course.save
      redirect_to action: :edit, course_name: course.name
    else
      render 'new', locals: {course: course}
    end
  end

  def update
    course = UnitGroup.find_by_name!(params[:course_name])
    course.persist_strings_and_scripts_changes(params[:scripts], params[:alternate_scripts], i18n_params)
    course.update_teacher_resources(params[:resourceTypes], params[:resourceLinks])
    # Convert checkbox values from a string ("on") to a boolean.
    [:has_verified_resources, :visible, :is_stable].each {|key| params[key] = !!params[key]}
    course.update(course_params)
    redirect_to course
  end

  def edit
    course = UnitGroup.find_by_name!(params[:course_name])

    # We don't support an edit experience for plc courses
    raise ActiveRecord::ReadOnlyRecord if course.try(:plc_course)
    render 'edit', locals: {course: course}
  end

  def i18n_params
    params.permit(
      :title,
      :description_short,
      :description_student,
      :description_teacher
    ).to_h
  end

  private

  def course_params
    params.permit(:version_year, :family_name, :has_verified_resources, :pilot_experiment, :visible, :is_stable).to_h
  end

  def set_redirect_override
    if params[:course_name] && params[:no_redirect]
      VersionRedirectOverrider.set_course_redirect_override(session, params[:course_name])
    end
  end

  def redirect_course(course)
    # Return nil if course is nil or we know the user can view the version requested.
    return nil if !course || course.can_view_version?(current_user)

    # Redirect the user to the latest assigned course in this family, or to the latest course in this family if none
    # are assigned.
    redirect_course = UnitGroup.latest_assigned_version(course.family_name, current_user)
    redirect_course ||= UnitGroup.latest_stable_version(course.family_name)

    # Do not redirect if we are already on the correct course.
    return nil if redirect_course == course

    redirect_course
  end
end
