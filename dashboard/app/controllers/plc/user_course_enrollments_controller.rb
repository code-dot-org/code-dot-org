class Plc::UserCourseEnrollmentsController < ApplicationController
  load_and_authorize_resource except: :create
  authorize_resource only: :create

  def index
    @user_course_enrollments = @user_course_enrollments.where(user: current_user) if @user_course_enrollments
  end

  def group_view
    # This is a method to view many different people's course enrollments
    @courses = Plc::Course.all

    if current_user.admin?
      # This should be okay with Thousands of enrollments, but we still may want to kill the view for safety sake
      @user_course_enrollments = Plc::UserCourseEnrollment.all
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
    user = User.find_by_email_or_hashed_email(user_course_enrollment_params[:user_email])
    redirect_to action: :new if user.nil?

    @user_course_enrollment = Plc::UserCourseEnrollment.find_or_create_by(user: user,
                                                                     plc_course_id: user_course_enrollment_params[:plc_course_id])

    if @user_course_enrollment.valid?
      redirect_to action: :index
    else
      redirect_to action: :new
    end
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:user_email, :plc_course_id)
  end
end
