class Plc::EnrollmentEvaluationsController < ApplicationController
  def perform_evaluation
    authorize! :read, Plc::Course
    plc_user_course_enrollment = Plc::UserCourseEnrollment.find(params[:enrollment_id])
    @questions = plc_user_course_enrollment.plc_course.plc_evaluation_questions
    @course = plc_user_course_enrollment.plc_course
  end

  def submit_evaluation
    authorize! :read, Plc::Course
    question_responses = params[:answerModuleList].split(',')
    user_professional_learning_course_enrollment = Plc::UserCourseEnrollment.find(params[:enrollment_id])

    modules_to_enroll_in = Plc::LearningModule.where(id: question_responses)

    user_professional_learning_course_enrollment.enroll_user_in_course_with_learning_modules(modules_to_enroll_in)
    redirect_to controller: :user_course_enrollments, action: :show, id: params[:enrollment_id]
  end
end
