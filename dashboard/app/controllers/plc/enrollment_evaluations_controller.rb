class Plc::EnrollmentEvaluationsController < ApplicationController
  before_action :load_and_authorize_for_this_unit

  def preview_assignments
    if @enrollment_unit_assignment.module_assignment_for_type(Plc::LearningModule::CONTENT_MODULE).nil? && @enrollment_unit_assignment.module_assignment_for_type(Plc::LearningModule::PRACTICE_MODULE).nil?
      modules_to_enroll_in = @enrollment_unit_assignment.plc_course_unit.determine_preferred_learning_modules(current_user)
      @enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
    end

    @content_learning_modules = @enrollment_unit_assignment.plc_course_unit.plc_learning_modules.content
    @practice_learning_modules = @enrollment_unit_assignment.plc_course_unit.plc_learning_modules.practice
  end

  def confirm_assignments
    if params[:content_module].nil? || params[:practice_module].nil?
      redirect_to script_preview_assignments_path
      return
    end

    modules_to_enroll_in = Plc::LearningModule.find([params[:content_module], params[:practice_module]])

    if modules_to_enroll_in.pluck(:module_type).sort == [Plc::LearningModule::CONTENT_MODULE, Plc::LearningModule::PRACTICE_MODULE]
      @enrollment_unit_assignment.enroll_user_in_unit_with_learning_modules(modules_to_enroll_in)
      # Redirect to script view
      redirect_to script_path(@enrollment_unit_assignment.plc_course_unit.script)
    else
      redirect_to script_preview_assignments_path
    end
  end

  private

  def load_and_authorize_for_this_unit
    script = Script.get_from_cache(params[:script_id])
    if script.plc_course_unit
      @enrollment_unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: current_user, plc_course_unit: script.plc_course_unit)
      if @enrollment_unit_assignment.nil?
        redirect_to script_path(script)
      else
        authorize! :read, @enrollment_unit_assignment.plc_user_course_enrollment
      end
    else
      redirect_to script_path(script)
    end
  end
end
