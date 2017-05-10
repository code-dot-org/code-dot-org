class CoursesController < ApplicationController
  def show
    course = Course.find_by_name(params[:course_name])
    unless course
      # PLC courses have different ways of getting to name. ideally this goes
      # away eventually
      course_name = params[:course_name].tr('-', '_').titleize
      course = Course.find_by_name!(course_name)
      # only support this alternative course name for plc courses
      raise ActiveRecord::RecordNotFound unless course.plc_course
    end

    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    render 'course_overview', locals: {course: course}
  end

  def new
    render 'new'
  end

  # TODO: basic tests
  def create
    course = Course.new(course_params)
    if course.save
      redirect_to action: :edit, course_name: course.name
    else
      render 'new', locals: {error_messages: course.errors.full_messages}
    end
  end

  def edit
    course = Course.find_by_name(params[:course_name])

    # We don't support an edit experience for plc courses
    raise ActiveRecord::ReadOnlyRecord if course.plc_course
    render 'course_editor', locals: {course: course}
  end

  def course_params
    params.require(:course).permit(:name)
  end
end
