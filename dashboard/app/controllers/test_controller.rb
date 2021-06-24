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

  # Create a script containing a single lesson group, lesson and script level.
  def create_script
    script = Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      script_name = "temp-script-#{Time.now.to_i}-#{rand(1_000_000)}"
      Script.create!(name: script_name)
    end
    lesson_group = script.lesson_groups.create(
      key: '',
      user_facing: false,
      position: 1
    )
    lesson = lesson_group.lessons.create(
      script: script,
      key: 'temp-lesson',
      name: 'Temp Lesson',
      relative_position: 1,
      absolute_position: 1,
      has_lesson_plan: false
    )
    script_level = lesson.script_levels.create(
      script: script,
      chapter: 1,
      position: 1
    )
    level = Level.find_by_name('Applab test')
    script_level.levels.push(level)
    render json: {script_name: script.name, lesson_id: lesson.id}
  end

  # Create a script containing a single lesson group, lesson and script level that has the is_migrated setting
  def create_migrated_script
    script = Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      script_name = "temp-script-#{Time.now.to_i}-#{rand(1_000_000)}"
      Script.create!(name: script_name, published_state: SharedConstants::PUBLISHED_STATE.beta)
    end
    script.is_migrated = true
    script.save!

    lesson_group = script.lesson_groups.create(
      key: '',
      user_facing: false,
      position: 1
    )
    lesson = lesson_group.lessons.create(
      script: script,
      key: 'temp-lesson',
      name: 'Temp Lesson',
      has_lesson_plan: true,
      relative_position: 1,
      absolute_position: 1
    )
    lesson_without_lesson_plan = lesson_group.lessons.create(
      script: script,
      key: 'temp-lesson-2',
      name: 'Temp Lesson Without Lesson Plan',
      has_lesson_plan: false,
      relative_position: 1,
      absolute_position: 2
    )
    activity = lesson.lesson_activities.create(
      position: 1,
      key: SecureRandom.uuid
    )
    section = activity.activity_sections.create(
      position: 1,
      key: SecureRandom.uuid
    )
    script_level = section.script_levels.create(
      script: script,
      lesson: lesson,
      chapter: 1,
      position: 1,
      activity_section_position: 1
    )
    level = Level.find_by_name('Applab test')
    script_level.levels.push(level)
    render json: {script_name: script.name, lesson_id: lesson.id, lesson_without_lesson_plan_id: lesson_without_lesson_plan.id}
  end

  # invalidate the specified script from the script cache, so that it will be
  # reloaded from the DB the next time it is requested.
  def invalidate_script
    Script.remove_from_cache(params[:script_name])
    head :ok
  end

  def destroy_script
    script = Script.find_by!(name: params[:script_name])
    script.destroy
    head :ok
  end

  def destroy_level
    level = Level.find(params[:id])
    level.destroy
    head :ok
  end
end
