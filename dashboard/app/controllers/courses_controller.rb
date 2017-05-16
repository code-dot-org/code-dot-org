class CoursesController < ApplicationController
  def index
    course_name = params[:course].tr('-', '_').titleize
    course = Course.find_by_name(course_name)
    raise ActiveRecord::RecordNotFound unless course
    if course.plc_course
      authorize! :show, Plc::UserCourseEnrollment
      user_course_enrollments = [Plc::UserCourseEnrollment.find_by(user: current_user, plc_course: course.plc_course)]
      render 'plc/user_course_enrollments/index', locals: {user_course_enrollments: user_course_enrollments}
      return
    end

    render 'index', locals: {course: course}
  end
end
