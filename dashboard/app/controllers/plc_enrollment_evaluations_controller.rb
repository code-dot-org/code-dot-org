class PlcEnrollmentEvaluationsController < ApplicationController
  before_action :set_plc_enrollment_evaluation, only: [:show, :edit, :update, :destroy]

  # GET /plc_enrollment_evaluations
  # GET /plc_enrollment_evaluations.json
  def index
    @plc_enrollment_evaluations = PlcEnrollmentEvaluation.all
  end

  # GET /plc_enrollment_evaluations/1
  # GET /plc_enrollment_evaluations/1.json
  def show
  end

  # GET /plc_enrollment_evaluations/new
  def new
    @plc_enrollment_evaluation = PlcEnrollmentEvaluation.new
  end

  # Get /plc_enrollment_evaluations/:enrollment_id/perform_evaluation/
  def perform_evaluation
    puts params
    @user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.find(params[:enrollment_id])
    @questions = @user_professional_learning_course_enrollment.professional_learning_course.plc_evaluation_question
    @user = @user_professional_learning_course_enrollment.user
    @course = @user_professional_learning_course_enrollment.professional_learning_course
    puts @user_professional_learning_course_enrollment.inspect
    puts @questions.inspect
  end

  def submit_evaluation
    question_responses = params.select {|k, v| (k.start_with? 'question_') && v != 'nil'}

    user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.find(params[:enrollment_id])

    modules_to_enroll_in = []

    ProfessionalLearningTask.where(id: question_responses.values).each do |task|
      modules_to_enroll_in << task.professional_learning_module
    end

    puts modules_to_enroll_in.inspect

    user_professional_learning_course_enrollment.enroll_user_in_course_with_learning_modules(modules_to_enroll_in)
    puts user_professional_learning_course_enrollment.user_enrollment_module_assignment.inspect
    puts user_professional_learning_course_enrollment.user_module_task_assignment.inspect

    redirect_to '/user_professional_learning_course_enrollments/' + params[:enrollment_id]
  end

  # GET /plc_enrollment_evaluations/1/edit
  def edit
  end

  # POST /plc_enrollment_evaluations
  # POST /plc_enrollment_evaluations.json
  def create
    @plc_enrollment_evaluation = PlcEnrollmentEvaluation.new(plc_enrollment_evaluation_params)

    respond_to do |format|
      if @plc_enrollment_evaluation.save
        format.html { redirect_to @plc_enrollment_evaluation, notice: 'Plc enrollment evaluation was successfully created.' }
        format.json { render action: 'show', status: :created, location: @plc_enrollment_evaluation }
      else
        format.html { render action: 'new' }
        format.json { render json: @plc_enrollment_evaluation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /plc_enrollment_evaluations/1
  # PATCH/PUT /plc_enrollment_evaluations/1.json
  def update
    respond_to do |format|
      if @plc_enrollment_evaluation.update(plc_enrollment_evaluation_params)
        format.html { redirect_to @plc_enrollment_evaluation, notice: 'Plc enrollment evaluation was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @plc_enrollment_evaluation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plc_enrollment_evaluations/1
  # DELETE /plc_enrollment_evaluations/1.json
  def destroy
    @plc_enrollment_evaluation.destroy
    respond_to do |format|
      format.html { redirect_to plc_enrollment_evaluations_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_plc_enrollment_evaluation
    @plc_enrollment_evaluation = PlcEnrollmentEvaluation.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def plc_enrollment_evaluation_params
    params.require(:plc_enrollment_evaluation).permit(:user_professional_learning_course_enrollment_id, :plc_evaluation_answers)
  end
end
