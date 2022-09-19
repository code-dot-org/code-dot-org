# Controller actions used only to facilitate UI tests.
class TestController < ApplicationController
  layout false

  def levelbuilder_access
    return unless (user = current_user)
    user.permission = UserPermission::LEVELBUILDER
    user.save!
    head :ok
  end

  def universal_instructor_access
    return unless (user = current_user)
    user.permission = UserPermission::UNIVERSAL_INSTRUCTOR
    user.save!
    head :ok
  end

  def plc_reviewer_access
    return unless (user = current_user)
    user.permission = UserPermission::PLC_REVIEWER
    user.save!
    head :ok
  end

  def facilitator_access
    return unless (user = current_user)
    user.permission = UserPermission::FACILITATOR
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

  def create_student_section_assigned_to_script
    return unless (user = current_user)
    script = Script.find_by_name(params.require(:script_name))

    Section.create!(name: "New Section", user: user, script: script, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    head :ok
  end

  def assign_course_and_unit_as_student
    return unless (user = current_user)
    script = Script.find_by_name(params.require(:script_name))
    course = UnitGroup.find_by_name(params.require(:course_name))

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

    section = Section.create(name: "New Section", user: fake_user, script_id: script.id, course_id: course.id, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    section.students << user
    section.save!
    head :ok
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

    section = Section.create(name: "New Section", user: fake_user, script: script, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    section.students << user
    section.save!
    head :ok
  end

  def get_i18n_t
    locale = params[:locale] || request.env['cdo.locale']
    render plain: I18n.t(params.require(:key), locale: locale)
  end

  # Create a script containing a single lesson group, lesson and script level that has the is_migrated setting
  def create_migrated_script
    script = Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
      script_name = "temp-script-#{Time.now.to_i}-#{rand(1_000_000)}"
      Script.create!(name: script_name, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development)
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
      name: 'Temp Lesson With Lesson Plan',
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

  def create_temp_program_manager
    # rp_name = "regional-partner-#{Time.now.to_i}-#{rand(1_000_000)}"
    # regional_partner = RegionalPartner.create!(name: rp_name)
    #
    # program_manager = Retryable.retryable(on: ActiveRecord::RecordNotUnique) do
    #   unique_string = "#{Time.now.to_i}-#{rand(1_000_000)}"
    #   name = "user-#{unique_string}"
    #   email = "user#{unique_string}@test.xx"
    #   password = name + "password"
    #   attributes = {
    #     name: name,
    #     email: email,
    #     password: password,
    #     user_type: "teacher",
    #     age: "21+"
    #   }
    #   User.create!(attributes)
    # end
    # program_manager = User.create!(name: 'meg', email: 'meg+test@code.org', password: 'megpassword', user_type: 'teacher', age: '21+')
    # program_manager.permission = UserPermission::WORKSHOP_ADMIN
    # program_manager.save!

    # RegionalPartnerProgramManager.create!(regional_partner_id: regional_partner.id, program_manager_id: program_manager.id)
    #
    head :ok
    # render json: {rp_name: 'an rp name'}
    # render json: {rp_name: regional_partner.name, pm_name: program_manager.name, pm_email: program_manager.email}
    # render json: {pm_name: program_manager.name}
  end

  def create_temp_csp_application
    rp_name = "regional-partner-#{Time.now.to_i}-#{rand(1_000_000)}"
    regional_partner = RegionalPartner.create!(name: rp_name)

    teacher_name = "teacher#{Time.now.to_i}#{rand(1_000_000)}"
    teacher_email = "teacher-#{Time.now.to_i}-#{rand(1_000_000)}"
    password = teacher_name + "password"
    attributes = {
      name: teacher_name,
      email: teacher_email,
      password: password,
      user_type: "teacher",
      age: "21+"
    }
    teacher = User.create!(attributes)

    form_data_hash = FactoryGirl.build(:pd_teacher_application_hash_common, 'csp'.to_sym, first_name: teacher_name, last_name: 'teacher')
    FactoryGirl.create(
      :pd_teacher_application,
      form_data_hash: form_data_hash,
      user: teacher,
      status: 'unreviewed',
      regional_partner_id: regional_partner.id
    )

    render json: {rp_name: regional_partner.name}
  end

  def delete_rp_pm_teacher
    application = Pd::Application::TeacherApplication.find_by(email: params[:teacher_email])
    application.destroy

    csp_teacher = User.find_by(email: params[:teacher_email])
    csp_teacher.destroy

    regional_partner = RegionalPartner.find_by(name: params[:rp_name])
    regional_partner.destroy

    program_manager = User.find_by(email: params[:pm_email])
    program_manager.destroy

    head :ok
  end
end
