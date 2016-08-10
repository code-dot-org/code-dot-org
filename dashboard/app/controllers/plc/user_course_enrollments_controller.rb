class Plc::UserCourseEnrollmentsController < ApplicationController
  load_and_authorize_resource except: :create
  authorize_resource only: :create

  def index
    if user_course_enrollment_params[:course]
      course_name = user_course_enrollment_params[:course].gsub('-', '_').titleize
      @user_course_enrollments = [@user_course_enrollments.find_by(user: current_user, plc_course: Plc::Course.find_by(name: course_name))]
    else
      @user_course_enrollments = @user_course_enrollments.where(user: current_user) if @user_course_enrollments
    end
  end

  def group_view
    # This is a method to view many different people's course enrollments
    @courses = Plc::Course.all

    if current_user.admin?
      # This should be okay with a thousand enrollments but it's really just a placeholder while we develop this
      @user_course_enrollments = Plc::UserCourseEnrollment.all.limit(1000)
    elsif current_user.district_contact?
      @user_course_enrollments = Plc::UserCourseEnrollment.where(user: District.where(contact: current_user).map(&:users).flatten)
    end
  end

  def manager_view
  end

  # GET /plc/user_course_enrollments/new
  def new
  end

  # POST /plc/user_course_enrollments
  # POST /plc/user_course_enrollments.json
  def create
    user_emails = user_course_enrollment_params[:user_emails].split

    enrolled_users, nonexistant_users, nonteacher_users, other_failure_users, other_failure_reasons =
      Plc::UserCourseEnrollment.enroll_users(user_emails, user_course_enrollment_params[:plc_course_id])

    notice_string = enrolled_users.empty? ? '' : "Enrollments created for #{listify(enrolled_users)}<br/>"
    notice_string += "The following users did not exist #{listify(nonexistant_users)}<br/>" unless nonexistant_users.empty?
    notice_string += "The following users were not teachers #{listify(nonteacher_users)}<br/>" unless nonteacher_users.empty?
    notice_string += "The following users failed for other reasons #{listify(other_failure_users)}<br/>" unless other_failure_users.empty?
    notice_string += "The failures were because of reasons #{listify(other_failure_reasons)}" unless other_failure_reasons.empty?

    redirect_to action: :new, notice: notice_string
  end

  private

  def listify(user_list)
    user_list.map {|user| "<li>#{user}</li>"}.join ''
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:user_emails, :plc_course_id, :course)
  end
end
