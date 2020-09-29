class Plc::UserCourseEnrollmentsController < ApplicationController
  load_and_authorize_resource except: :create
  authorize_resource only: :create

  def index
    @user_course_enrollments = @user_course_enrollments.where(user: current_user) if @user_course_enrollments
    render 'index', locals: {user_course_enrollments: @user_course_enrollments}
  end

  def group_view
    # This is a method to view many different people's course enrollments
    @plc_courses = Plc::Course.all

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

    enrolled_users, nonexistent_users, nonteacher_users, other_failure_users, other_failure_reasons =
      Plc::UserCourseEnrollment.enroll_users(user_emails, user_course_enrollment_params[:plc_course_id])

    notice_string = enrolled_users.empty? ? '' : "#{enrolled_users.length} enrollment(s) created#{listify_first_ten(enrolled_users)}<br/>"
    notice_string += "#{nonexistent_users.length} user(s) did not exist#{listify_first_ten(nonexistent_users)}<br/>" unless nonexistent_users.empty?
    notice_string += "#{nonteacher_users.length} user(s) were not teachers#{listify_first_ten(nonteacher_users)}<br/>" unless nonteacher_users.empty?
    notice_string += "#{other_failure_users.length} user(s) failed for other reasons#{listify_first_ten(other_failure_users)}<br/>" unless other_failure_users.empty?
    other_failure_message = "The failure(s) were because of reasons: "
    if other_failure_reasons.length > 10
      other_failure_message = "The first 10 failure reasons were: "
      other_failure_reasons = other_failure_reasons[0..9]
    end
    notice_string += "#{other_failure_message} #{listify(other_failure_reasons)}<br/>" unless other_failure_reasons.empty?

    redirect_to action: :new, notice: notice_string
  end

  private

  def listify_first_ten(user_list)
    result = ': '
    if user_list.length > 10
      result = '. The first 10 are: '
      user_list = user_list[0..9]
    end
    result += listify(user_list)
    result
  end

  def listify(user_list)
    user_list.map {|user| "<li>#{user}</li>"}.join ''
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:user_emails, :plc_course_id, :course)
  end
end
