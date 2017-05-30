class CoursesController < ApplicationController
  before_action :require_levelbuilder_mode, except: [:index, :show]
  before_action :authenticate_user!, except: [:index, :show]
  authorize_resource

  def index
    @recent_courses = current_user.try(:recent_courses_and_scripts)
    @is_teacher = !!(current_user && current_user.teacher?)
    @is_english = request.language == 'en'
    @is_signed_out = current_user.nil?
  end

  def show
    course = Course.find_by_name(params[:course_name])
    unless course
      # PLC courses have different ways of getting to name. ideally this goes
      # away eventually
      course_name = params[:course_name].tr('-', '_').titleize
      course = Course.find_by_name(course_name)
      # only support this alternative course name for plc courses
      raise ActiveRecord::RecordNotFound unless course.try(:plc_course)
    end

    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    render 'show', locals: {course: course}
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
    course.persist_strings_and_scripts_changes(params[:scripts], i18n_params)
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
end
