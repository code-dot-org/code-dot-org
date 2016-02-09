class UserProfessionalLearningCourseEnrollmentsController < ApplicationController
  before_action :set_user_professional_learning_course_enrollment, only: [:show, :edit, :update, :destroy]

  # GET /user_professional_learning_course_enrollments
  # GET /user_professional_learning_course_enrollments.json
  def index
    @user_professional_learning_course_enrollments = UserProfessionalLearningCourseEnrollment.all
  end

  # GET /user_professional_learning_course_enrollments/1
  # GET /user_professional_learning_course_enrollments/1.json
  def show
  end

  # GET /user_professional_learning_course_enrollments/new
  def new
    @user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.new
  end

  # GET /user_professional_learning_course_enrollments/1/edit
  def edit
  end

  # POST /user_professional_learning_course_enrollments
  # POST /user_professional_learning_course_enrollments.json
  def create
    #ugh, why is empty being passed in
    learning_module_ids = user_professional_learning_course_enrollment_params[:professional_learning_module_ids].drop 1

    user = User.find_by(id: user_professional_learning_course_enrollment_params[:user_id])
    course = ProfessionalLearningCourse.find_by(id: user_professional_learning_course_enrollment_params[:professional_learning_course_id])
    learning_modules = ProfessionalLearningModule.where(id: learning_module_ids)

    @user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.enroll_user_in_course_with_learning_modules(user, course, learning_modules)

    respond_to do |format|
      if @user_professional_learning_course_enrollment.save
        format.html { redirect_to @user_professional_learning_course_enrollment, notice: 'User course enrollment was successfully created.' }
        format.json { render action: 'show', status: :created, location: @user_professional_learning_course_enrollment }
      else
        format.html { render action: 'new' }
        format.json { render json: @user_professional_learning_course_enrollment.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /user_professional_learning_course_enrollments/1
  # PATCH/PUT /user_professional_learning_course_enrollments/1.json
  def update
    respond_to do |format|
      if @user_professional_learning_course_enrollment.update(user_professional_learning_course_enrollment_params)
        format.html { redirect_to @user_professional_learning_course_enrollment, notice: 'User course enrollment was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @user_professional_learning_course_enrollment.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /user_professional_learning_course_enrollments/1
  # DELETE /user_professional_learning_course_enrollments/1.json
  def destroy
    @user_professional_learning_course_enrollment.destroy
    respond_to do |format|
      format.html { redirect_to user_professional_learning_course_enrollments_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_user_professional_learning_course_enrollment
    @user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def user_professional_learning_course_enrollment_params
    params.required(:user_professional_learning_course_enrollment).permit(:user_id, :professional_learning_course_id, :professional_learning_module_ids => [])
  end
end
