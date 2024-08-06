# Controller actions used only to facilitate UI tests.
class TestController < ApplicationController
  include Pd::Application::ActiveApplicationModels
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

  def authorized_teacher_access
    return unless (user = current_user)
    user.permission = UserPermission::AUTHORIZED_TEACHER
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

  def program_manager_access
    return unless (user = current_user)
    user.permission = UserPermission::PROGRAM_MANAGER
    user.save!
    head :ok
  end

  def workshop_admin_access
    return unless (user = current_user)
    user.permission = UserPermission::WORKSHOP_ADMIN
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
    script = Unit.find_by_name(params.require(:script_name))

    Section.create!(name: "New Section", user: user, script: script, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    head :ok
  end

  def create_student_section_with_name
    return unless (user = current_user)
    Section.create!(name: params[:section_name], user: user, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    head :ok
  end

  def assign_course_and_unit_as_student
    return unless (user = current_user)
    script = Unit.find_by_name(params.require(:script_name))
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
    script = Unit.find_by_name(params.require(:script_name))

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
      Unit.create!(name: script_name, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development)
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
    Unit.remove_from_cache(params[:script_name])
    head :ok
  end

  def destroy_script
    script = Unit.find_by!(name: params[:script_name])
    script.destroy
    head :ok
  end

  def destroy_level
    level = Level.find(params[:id])
    level.destroy
    head :ok
  end

  # Use the same data from pd_teacher_application_hash_common
  # We can't use the factory directly because FactoryBot is not available on prod
  def teacher_form_data
    {
      school: School.first.id,
      country: 'United States',
      first_name: 'First',
      last_name: 'Last',
      alternate_email: 'ilovepotions@gmail.com',
      phone: '5558675309',
      gender_identity: 'Male',
      race: ['Other'],
      street_address: '333 Hogwarts Place',
      city: 'Magic City',
      state: 'Washington',
      zip_code: '98101',
      principal_role: 'Headmaster',
      principal_first_name: 'Albus',
      principal_last_name: 'Dumbledore',
      principal_title: 'Dr.',
      principal_email: 'socks@hogwarts.edu',
      principal_confirm_email: 'socks@hogwarts.edu',
      principal_phone_number: '5555882300',
      current_role: 'Teacher',
      committed: 'Yes',
      willing_to_travel: 'Up to 50 miles',
      agree: 'Yes',
      completing_on_behalf_of_someone_else: 'No',
      previous_yearlong_cdo_pd: ['CS in Science'],
      enough_course_hours: Pd::Application::TeacherApplication.options[:enough_course_hours].first,
      program: 'csp',
      will_teach: 'Yes',
      csp_which_grades: ['11', '12'],
      csp_how_offer: 'As an AP course',
      csd_which_grades: ['6', '7'],
      csa_which_grades: ['11', '12'],
      csa_how_offer: 'As an AP course',
      csa_phone_screen: 'Yes',
      csa_already_know: 'Yes',
      pay_fee: 'Yes, my school/district would be able to pay the full program fee.'
    }
  end

  def create_teacher_application
    return unless (user = current_user)
    regional_partner = RegionalPartner.create!(name: "regional-partner#{Time.now.to_i}-#{rand(1_000_000)}", is_active: true)

    RegionalPartnerProgramManager.create!(program_manager_id: user.id, regional_partner_id: regional_partner.id)

    teacher_name = "teacher#{Time.now.to_i}-#{rand(1_000_000)}"
    teacher_email = "teacher#{Time.now.to_i}-#{rand(1_000_000)}@test.xx"
    password = teacher_name + "password"
    attributes = {
      name: teacher_name,
      email: teacher_email,
      password: password,
      user_type: "teacher",
      age: "21+"
    }
    teacher = User.create!(attributes)

    form_data = teacher_form_data.merge(
      first_name: teacher_name,
      last_name: 'Test',
      regional_partner_id: regional_partner.id,
      program: Pd::Application::TeacherApplication::PROGRAMS[:csp]
    ).to_json
    application = Pd::Application::TeacherApplication.create!(
      user: teacher,
      form_data: form_data,
      status: 'unreviewed'
    )

    render json: {rp_id: regional_partner.id, teacher_id: teacher.id, application_id: application.id}
  end

  def create_applications
    %w(csd csp csa).each do |course|
      (Pd::Application::TeacherApplication.statuses).each do |status|
        teacher_email = "#{course}_#{status}@code.org"
        teacher = User.find_or_create_teacher(
          {name: "#{course} #{status}", email: teacher_email}, nil, nil
        )
        next if Pd::Application::TeacherApplication.find_by(
          application_year: Pd::Application::ActiveApplicationModels::APPLICATION_CURRENT_YEAR,
          user_id: teacher.id
        )

        form_data = teacher_form_data.merge(
          first_name: course,
          last_name: status,
          program: Pd::Application::TeacherApplication::PROGRAMS[course.to_sym]
        ).to_json

        if status == 'incomplete'
          Pd::Application::TeacherApplication.create!(
            form_data: form_data,
            user: teacher,
            course: course,
            status: 'incomplete'
          )
        else
          application = Pd::Application::TeacherApplication.create!(
            form_data: form_data,
            user: teacher,
            course: course,
            status: 'unreviewed'
          )
          application.update!(status: status)
        end
      end
    end
    head :ok
  end

  def delete_rp_pm_teacher_application
    RegionalPartner.find(params[:rp_id].to_i).destroy
    Pd::Application::TeacherApplication.find(params[:application_id].to_i).destroy
    User.find(params[:teacher_id].to_i).destroy
    User.find_by(name: params[:pm_name]).destroy
    head :ok
  end

  def delete_workshop
    Pd::Workshop.find_by_id(params[:workshop_id]).destroy
    head :ok
  end

  def create_pilot
    name = params.require(:pilot_name)
    Pilot.create_with(allow_joining_via_url: true, display_name: name).find_or_create_by(name: name)
    head :ok
  end

  def set_single_user_experiment
    SingleUserExperiment.find_or_create_by!(
      min_user_id: current_user.id,
      name: params[:experiment_name]
    )
    head :ok
  end

  def set_single_section_experiment
    SingleSectionExperiment.find_or_create_by!(
      name: params[:experiment_name],
      section: current_user.sections.first,
      script: Unit.find_by(name: params[:script_name])
    )
    head :ok
  end

  def get_validate_rubric_ai_config
    AiRubricConfig.validate_ai_config
    render plain: 'OK'
  end

  def complete_unit
    unit_name = params.require(:unit_name)
    unit = Unit.find_by!(name: unit_name)
    UserScript.create!(user: current_user, script: unit, completed_at: Time.now)
    head :ok
  end

  # Creates the user and signs them in.
  def create_user
    user_opts = params.require(:user).permit(
      :user_type,
      :email,
      :password,
      :password_confirmation,
      :name,
      :age,
      :username,
      :terms_of_service_version,
      :sign_in_count,
      :parent_email_preference_opt_in_required,
      :parent_email_preference_opt_in,
      :parent_email_preference_email,
      :parent_email_preference_request_ip,
      :parent_email_preference_source,
      :provider,
      :email_preference_opt_in,
      :email_preference_form_kind,
      :email_preference_request_ip,
      :email_preference_source,
      :created_at,
      :country_code,
      :us_state,
      :user_provided_us_state,
      :data_transfer_agreement_accepted,
      :data_transfer_agreement_request_ip,
      :data_transfer_agreement_kind,
      :data_transfer_agreement_source,
      :data_transfer_agreement_at,
    )
    if params[:sso]
      user = User.new(**user_opts)
      User.initialize_new_oauth_user(user, OmniAuth::AuthHash.new({provider: params[:sso], uid: params[:uid], info: {name: params[:name]}}))
    else
      user = User.create!(**user_opts)
    end
    sign_in user
    head :ok
  end

  # Accepts a parental request that was submitted by the current user
  def accept_parental_request
    permission_request = ParentalPermissionRequest.find_by(user: current_user)
    Services::ChildAccount.grant_permission_request!(permission_request)
    head :ok
  end
end
