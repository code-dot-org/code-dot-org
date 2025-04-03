class SectionsController < ApplicationController
  include UsersHelper
  before_action :load_section_by_code, only: [:log_in, :show]
  load_and_authorize_resource :section, only: [:edit]
  authorize_resource :section, only: [:new]

  skip_before_action :verify_authenticity_token, only: [:archive_all]

  def new
    redirect_to home_path unless params[:loginType] && params[:participantType]
    @user_country = helpers.country_code(current_user, request)
    @is_users_first_section = current_user.sections_instructed.empty?
  end

  def edit
    existing_section = Section.find_by(
      id: params[:id]
    )

    if Experiment.enabled?(user: current_user, experiment_name: 'teacher-local-nav-v2') || DCDO.get('teacher-local-nav-v2', false)
      redirect_to "/teacher_dashboard/sections/#{params[:id]}/settings"
      return
    end

    @section = existing_section.attributes

    @section['course'] = {
      course_offering_id: existing_section.unit_group ? existing_section.unit_group&.course_version&.course_offering&.id : existing_section.script&.course_version&.course_offering&.id,
      version_id: existing_section.unit_group ? existing_section.unit_group&.course_version&.id : existing_section.script&.course_version&.id,
      unit_id: existing_section.unit_group ? existing_section.script_id : nil,
      lesson_extras_available: existing_section.script.try(:lesson_extras_available),
      text_to_speech_enabled: existing_section.script.try(:text_to_speech_enabled?),
    }

    @section['sectionInstructors'] = ActiveModelSerializers::SerializableResource.new(existing_section.section_instructors, each_serializer: Api::V1::SectionInstructorInfoSerializer).as_json

    @section['primaryInstructor'] = {
      email: existing_section.teacher.email,
      name: existing_section.teacher.name,
      lti_roster_sync_enabled: existing_section.teacher&.properties&.[]("lti_roster_sync_enabled")
    }

    @section = @section.to_json.camelize
  end

  def show
    @secret_pictures = SecretPicture.all.shuffle
  end

  def log_in
    if user = User.authenticate_with_section(section: @section, params: params)
      bypass_sign_in user
      user.update_tracked_fields!(request)
      session[:show_pairing_dialog] = true if params[:show_pairing_dialog]
      redirect_to_section_script_or_course
    else
      flash[:alert] = I18n.t('signinsection.invalid_login')
      redirect_to section_path(id: @section.code)
    end
  end

  def section_instructors_verified
    new_params = params.transform_keys(&:underscore)
    teachers = User.find_by(id: new_params[:user_id]).teachers

    if teachers.any?(&:verified_teacher?)
      render json: {verified: true}
    else
      render json: {verified: false}
    end
  end

  # POST /api/sections/archive
  # Archive all sections owned by the current user.
  # Note: does not archive co-taught sections created by another user.
  def archive_all
    sections = current_user.sections_instructed

    num_hidden = sections.count {|s| !s.hidden}

    sections.each do |section|
      section.update!(hidden: true)
    end

    render json: {num_hidden: num_hidden}
  end

  def retrieve_lessons_for_dropdown
    section = Section.find(params[:id])
    lessons = []
    if section.script_id
      unit = Unit.find(section.script_id)
      lessons << {text: unit.title_for_display, value: unit.link}
      unit.lesson_groups.each do |lesson_group|
        lessons.concat(lesson_group.lessons.select(&:has_lesson_plan).map {|lesson| {text: lesson.relative_position.to_s + ': ' + lesson.localized_name, value: script_lesson_path(unit, lesson) << '/levels/1'}})
      end
    end
    render json: lessons
  end

  private def redirect_to_section_script_or_course
    if @section.script
      redirect_to script_path(@section.script)
    elsif @section.unit_group
      redirect_to course_path(@section.unit_group)
    else
      redirect_to '/'
    end
  end

  private def load_section_by_code
    @section = Section.find_by!(
      code: params[:id],
      login_type: [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD]
    )
  end
end
