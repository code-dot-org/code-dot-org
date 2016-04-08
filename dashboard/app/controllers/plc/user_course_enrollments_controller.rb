class Plc::UserCourseEnrollmentsController < ApplicationController
  load_and_authorize_resource except: [:create, :enrollments_for_user]
  authorize_resource only: [:create, :enrollments_for_user]

  def index
    @user_course_enrollments = @user_course_enrollments.where(user: current_user.admin? ? params[:user] || current_user : current_user)
    @enable_links = (current_user.id.to_s == params[:user]) || params[:user].nil?
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

  def group_view
    @courses = Plc::Course.all
    @user_course_enrollment = Plc::UserCourseEnrollment.all
  end

  private
  # Never trust parameters from the scary internet, only allow the white list through.
  def user_course_enrollment_params
    params.permit(:user_email, :plc_course_id)
  end

  def view_user_enrollment_params
    params.permit(:user)
  end
end
