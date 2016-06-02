class Plc::EnrollmentEvaluationsController < ApplicationController
  before_action :authorize_for_this_unit

  def perform_evaluation
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    @questions = plc_unit_assignment.plc_course_unit.plc_evaluation_questions
    @course_unit = plc_unit_assignment.plc_course_unit
  end

  def submit_evaluation
    enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])

    modules_with_weights = JSON.parse(params[:answer_module_list])
    modules_with_weights.each {|k, v| modules_with_weights[k] = v.to_i}
    modules_to_enroll_in = enrollment_unit_assignment.plc_course_unit.get_top_modules_of_each_type_from_user_selections(modules_with_weights)
    redirect_to controller: :enrollment_evaluations, action: :preview_assignments, unit_assignment_id: params[:unit_assignment_id], enrolled_modules: modules_to_enroll_in.map(&:id).sort
  end

  def preview_assignments
    @enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
    @content_learning_modules = @enrollment_unit_assignment.plc_course_unit.plc_learning_modules.content
    @practice_learning_modules = @enrollment_unit_assignment.plc_course_unit.plc_learning_modules.practice
  end

  def confirm_assignments
    if params[:content_module].nil? || params[:practice_module].nil?
      redirect_to controller: :enrollment_evaluations, action: :perform_evaluation, unit_assignment_id: params[:unit_assignment_id]
      return
    end

    modules_to_enroll_in = Plc::LearningModule.find([params[:content_module], params[:practice_module]])

    if modules_to_enroll_in.size == 2 && modules_to_enroll_in.map(&:module_type).sort == [Plc::LearningModule::CONTENT_MODULE, Plc::LearningModule::PRACTICE_MODULE]
      enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
      enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
      redirect_to controller: :enrollment_unit_assignments, action: :show, id: enrollment_unit_assignment.id
    else
      redirect_to controller: :enrollment_evaluations, action: :perform_evaluation, unit_assignment_id: params[:unit_assignment_id]
    end
  end

  private
  def authorize_for_this_unit
    plc_unit_assignment = Plc::EnrollmentUnitAssignment.find(params[:unit_assignment_id])
    authorize! :read, plc_unit_assignment.plc_user_course_enrollment
  end
end
