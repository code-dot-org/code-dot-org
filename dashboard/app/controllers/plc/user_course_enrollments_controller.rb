class Plc::UserCourseEnrollmentsController < ApplicationController
  #TODO: Why do I need to have the except here?
  load_and_authorize_resource except: [:create]
  before_action :set_plc_user_course_enrollment, only: [:show, :edit, :update, :destroy]

  # GET /plc/user_course_enrollments
  # GET /plc/user_course_enrollments.json
  def index
    @plc_user_course_enrollments = Plc::UserCourseEnrollment.all
  end

  # GET /plc/user_course_enrollments/1
  # GET /plc/user_course_enrollments/1.json
  def show
  end

  # GET /plc/user_course_enrollments/new
  def new
    @plc_user_course_enrollment = Plc::UserCourseEnrollment.new
  end

  # POST /plc/user_course_enrollments
  # POST /plc/user_course_enrollments.json
  def create
    user = User.find_by_email_or_hashed_email(plc_user_course_enrollment_params[:user_email])

    course = Plc::Course.find_by(id: plc_user_course_enrollment_params[:plc_course_id])

    @plc_user_course_enrollment = Plc::UserCourseEnrollment.new(user: user, plc_course: course)

    respond_to do |format|
      if !user.nil? && @plc_user_course_enrollment.save
        format.html { redirect_to @plc_user_course_enrollment, notice: 'User course enrollment was successfully created.' }
      else
        format.html { render action: 'new' }
      end
    end
  end

  # DELETE /plc/user_course_enrollments/1
  # DELETE /plc/user_course_enrollments/1.json
  def destroy
    @plc_user_course_enrollment.destroy
    respond_to do |format|
      format.html { redirect_to plc_user_course_enrollments_url }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_user_course_enrollment
    @plc_user_course_enrollment = Plc::UserCourseEnrollment.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_user_course_enrollment_params
    params.permit(:user_email, :plc_course_id)
  end
end
