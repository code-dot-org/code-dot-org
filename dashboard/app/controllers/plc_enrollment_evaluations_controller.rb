class PlcEnrollmentEvaluationsController < ApplicationController
  # Get /plc_enrollment_evaluations/:enrollment_id/perform_evaluation/
  def perform_evaluation
    @user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.find(params[:enrollment_id])
    @questions = @user_professional_learning_course_enrollment.professional_learning_course.plc_evaluation_question
    @user = @user_professional_learning_course_enrollment.user
    @course = @user_professional_learning_course_enrollment.professional_learning_course
  end

  def submit_evaluation
    question_responses = params[:answerTaskList].split(',')
    user_professional_learning_course_enrollment = UserProfessionalLearningCourseEnrollment.find(params[:enrollment_id])
    modules_to_enroll_in = []

    ProfessionalLearningTask.where(id: question_responses).each do |task|
      modules_to_enroll_in << task.professional_learning_module
    end

    user_professional_learning_course_enrollment.enroll_user_in_course_with_learning_modules(modules_to_enroll_in)
    redirect_to '/user_professional_learning_course_enrollments/' + params[:enrollment_id]
  end
end
