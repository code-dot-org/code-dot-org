class Plc::EnrollmentEvaluationsController < ApplicationController
  def perform_evaluation
    authorize! :read, Plc::Course
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    if plc_unit_assignment.status != Plc::EnrollmentUnitAssignment::PENDING_EVALUATION
      raise "Cannot perform evaluation - unit assignment is in state #{plc_unit_assignment.status}"
    end

    @questions = plc_unit_assignment.plc_course_unit.plc_evaluation_questions
    @course_unit = plc_unit_assignment.plc_course_unit
  end

  def submit_evaluation
    authorize! :read, Plc::Course
    question_responses = params[:answerModuleList].split(',')
    enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    modules_to_enroll_in = Plc::LearningModule.where(id: question_responses)

    enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
    enrollment_unit_assignment.update(status: Plc::EnrollmentUnitAssignment::IN_PROGRESS)
    redirect_to controller: :user_course_enrollments, action: :show, id: enrollment_unit_assignment.plc_user_course_enrollment.id
  end
end
