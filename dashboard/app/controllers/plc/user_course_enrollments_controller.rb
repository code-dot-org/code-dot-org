class Plc::UserCourseEnrollmentsController < ApplicationController
  load_and_authorize_resource except: :create
  authorize_resource only: :create

  def index
    if user_course_enrollment_params[:course]
      course_name = user_course_enrollment_params[:course].sub('-', '_').titleize
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
    users = User.where(email: user_emails)
    if users.size != user_emails.size
      redirect_to action: :new, notice: "Unknown users #{(user_emails - users.pluck(:email)).join(', ')}"
      return
    end

    users.each do |user|
      user_course_enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: user,
                                                                     plc_course_id: user_course_enrollment_params[:plc_course_id])

      unless user_course_enrollment.valid?
        throw "Unable to create enrollment for #{user.email} - validation failed"
      end
    end

    redirect_to action: :new, notice: "Enrollments created for #{user_emails.join(', ')}"
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:user_emails, :plc_course_id, :course)
  end
end
