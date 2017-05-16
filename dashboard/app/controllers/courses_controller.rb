class CoursesController < ApplicationController
  def index
    @recent_courses = current_user.try(:recent_courses)
    @is_teacher = !!(current_user && current_user.teacher?)
    @is_english = request.language == 'en'

    render 'index'
  end

  def show
    course_name = params[:course_name].tr('-', '_').titleize
    course = Course.find_by_name(course_name)
    raise ActiveRecord::RecordNotFound unless course
    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    render 'show', locals: {course: course}
  end

  def new
    render 'new'
  end

  def create
    render text: 'Not yet implemented'
  end
end
