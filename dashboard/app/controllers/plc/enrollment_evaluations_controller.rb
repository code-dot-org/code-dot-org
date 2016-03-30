class Plc::EnrollmentEvaluationsController < ApplicationController
  def perform_evaluation
    authorize! :read, Plc::Course
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
    @questions = plc_unit_assignment.plc_course_unit.plc_evaluation_questions
    @course_unit = plc_unit_assignment.plc_course_unit
  end

  def submit_evaluation
    authorize! :read, Plc::Course
    question_responses = params[:answerModuleList].split(',')
    user_professional_learning_course_enrollment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    modules_to_enroll_in = Plc::LearningModule.where(id: question_responses)

    user_professional_learning_course_enrollment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
    redirect_to controller: :user_course_enrollments, action: :show, id: user_professional_learning_course_enrollment.plc_user_course_enrollment.id
  end
end
