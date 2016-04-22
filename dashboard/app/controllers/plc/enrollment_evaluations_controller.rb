class Plc::EnrollmentEvaluationsController < ApplicationController
  before_action :authorize_for_this_unit

  def perform_evaluation
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    @questions = plc_unit_assignment.plc_course_unit.plc_evaluation_questions
    @course_unit = plc_unit_assignment.plc_course_unit
  end

  def submit_evaluation
    # Eventually, the logic for more complex module assignments will go here. For now since we are naively assigning modules, just go to preview
    redirect_to controller: :enrollment_evaluations, action: :preview_assignments, unit_assignment_id: params[:unit_assignment_id], enrolled_modules: params[:answer_module_list]
  end

  def preview_assignments
    @enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
    @enrolled_modules = Plc::LearningModule.where(id: params[:enrolled_modules].split(','))
  end

  def confirm_assignments
    modules_to_enroll_in = Plc::LearningModule.where(id: params[:learning_module_ids])
    enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
    redirect_to controller: :enrollment_unit_assignments, action: :show, id: enrollment_unit_assignment.id
  end

  private
  def authorize_for_this_unit
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
    authorize! :read, plc_unit_assignment.plc_user_course_enrollment

    #Eventually, logic for only allowing evaluations for units that haven't been started go here
  end
end
