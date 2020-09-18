# Controller actions used only to facilitate UI tests.
class TestController < ApplicationController
  layout false

  def hidden_script_access
    return unless (user = current_user)
    user.permission = UserPermission::HIDDEN_SCRIPT_ACCESS
    user.save!
    head :ok
  end

  def levelbuilder_access
    return unless (user = current_user)
    user.permission = UserPermission::LEVELBUILDER
    user.save!
    head :ok
  end

  def enroll_in_plc_course
    return unless (user = current_user)
    unit_group = UnitGroup.find_by(name: 'All The PLC Things')
    enrollment = Plc::UserCourseEnrollment.create(user: user, plc_course: unit_group.plc_course)
    enrollment.plc_unit_assignments.update_all(status: Plc::EnrollmentUnitAssignment::IN_PROGRESS)
    head :ok
  end

  def fake_completion_assessment
    return unless (user = current_user)
    unit_assignment = Plc::EnrollmentUnitAssignment.find_by(user: user)
    unit_assignment.enroll_user_in_unit_with_learning_modules(
      [
        unit_assignment.plc_course_unit.plc_learning_modules.find_by(module_type: Plc::LearningModule::CONTENT_MODULE),
        unit_assignment.plc_course_unit.plc_learning_modules.find_by(module_type: Plc::LearningModule::PRACTICE_MODULE)
      ]
    )
  end

  def assign_script_as_student
    return unless (user = current_user)
    script = Script.find_by_name(params.require(:script_name))

    name = "Fake User"
    email = "user#{Time.now.to_i}_#{rand(1_000_000)}@test.xx"
    password = name + "password"
    attributes = {
      name: name,
      email: email,
      password: password,
      user_type: "teacher",
      age: "21+"
    }
    fake_user = User.create!(attributes)

    section = Section.create(name: "New Section", user: fake_user, script: script)
    section.students << user
    section.save!
    head :ok
  end

  def get_i18n_t
    locale = params[:locale] || request.env['cdo.locale']
    render plain: I18n.t(params.require(:key), locale: locale)
  end

  def create_script
    script = Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      script_name = "temp-script-#{Time.now.to_i}-#{rand(1_000_000)}"
      Script.create!(name: script_name)
    end
    render json: {script_name: script.name}
  end

  def destroy_script
    script = Script.find_by!(name: params[:script_name])
    script.destroy
    head :ok
  end
end
