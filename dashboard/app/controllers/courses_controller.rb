require 'cdo/honeybadger'

class CoursesController < ApplicationController
  include VersionRedirectOverrider

  before_action :require_levelbuilder_mode, except: [:index, :show]
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_redirect_override, only: [:show]
  authorize_resource except: [:index]

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
        courses = Course.valid_courses(user: current_user)
        render json: courses
      end
    end
  end

  def show
    # csp and csd are each "course families", each containing multiple "course versions".
    # When the url of a course family is requested, redirect to a specific course version.
    #
    # For now, Hard-code the redirection logic because there are only two course
    # families to worry about. In the future we will want to make this redirect
    # happen based on the data in the DB so it can be configured via levelbuilder.
    redirect_query_string = request.query_string.empty? ? '' : "?#{request.query_string}"
    case params[:course_name]
    when 'csd'
      redirect_to "/courses/csd-2019#{redirect_query_string}"
      return
    when 'csp'
      redirect_to "/courses/csp-2019#{redirect_query_string}"
      return
    end

    if !params[:section_id] && current_user&.last_section_id
      redirect_to "#{request.path}?section_id=#{current_user.last_section_id}"
      return
    end

    course = Course.get_from_cache(params[:course_name])
    unless course
      # PLC courses have different ways of getting to name. ideally this goes
      # away eventually
      course_name = params[:course_name].tr('-', '_').titleize
      course = Course.get_from_cache(course_name)
      # only support this alternative course name for plc courses
      raise ActiveRecord::RecordNotFound unless course.try(:plc_course)
      Honeybadger.notify "Deprecated PLC course name logic used for course #{course_name}"
    end

    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    # Attempt to redirect user if we think they ended up on the wrong course overview page.
    override_redirect = VersionRedirectOverrider.override_course_redirect?(session, course)
    if !override_redirect && redirect_course = redirect_course(course)
      redirect_to "/courses/#{redirect_course.name}/?redirect_warning=true"
      return
    end

    render 'show', locals: {course: course, redirect_warning: params[:redirect_warning] == 'true'}
  end

  def new
  end

  def create
    course = Course.new(name: params.require(:course).require(:name))
    if course.save
      redirect_to action: :edit, course_name: course.name
    else
      render 'new', locals: {course: course}
    end
  end

  def update
    course = Course.find_by_name!(params[:course_name])
    course.persist_strings_and_scripts_changes(params[:scripts], params[:alternate_scripts], i18n_params)
    course.update_teacher_resources(params[:resourceTypes], params[:resourceLinks])
    # Convert has_verified_resources from a string ("on") to a boolean.
    params[:has_verified_resources] = !!params[:has_verified_resources]
    course.update(course_params)
    redirect_to course
  end

  def edit
    course = Course.find_by_name!(params[:course_name])

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
    params.permit(:version_year, :family_name, :has_verified_resources).to_h
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
    redirect_course = Course.latest_assigned_version(course.family_name, current_user)
    redirect_course ||= Course.latest_stable_version(course.family_name)

    # Do not redirect if we are already on the correct course.
    return nil if redirect_course == course

    redirect_course
  end
end
