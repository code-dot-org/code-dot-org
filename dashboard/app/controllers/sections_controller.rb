class SectionsController < ApplicationController
  include UsersHelper

  before_action :load_section_by_code, only: [:log_in, :show]

  def show
    @secret_pictures = SecretPicture.all.shuffle
  end

  # Allows you to update a section. Clears any assigned script_id in the process
  def update
    section = Section.find(params[:id])
    authorize! :manage, section

    course_id = params[:course_id]
    script_id = params[:script_id] || params[:script][:id]

    if script_id
      script = Script.get_from_cache(script_id)
      # If given a course and script, make sure the script is in that course
      return head :bad_request if course_id && course_id != script.course.try(:id)
      # If script has a course and no course_id was provided, use default course
      course_id ||= script.course.try(:id)
    end

    # TODO: (madelynkasula) refactor to use strong params
    fields = {}
    fields[:course_id] = course_id
    fields[:script_id] = script_id
    fields[:name] = params[:name] unless params[:name].nil_or_empty?
    fields[:login_type] = params[:login_type] if Section.valid_login_type?(params[:login_type])
    fields[:grade] = params[:grade] if Section.valid_grade?(params[:grade])
    fields[:stage_extras] = params[:stage_extras] unless params[:stage_extras].nil?
    fields[:pairing_allowed] = params[:pairing_allowed] unless params[:pairing_allowed].nil?
    fields[:hidden] = params[:hidden] unless params[:hidden].nil?

    section.update!(fields)
    if script_id
      section.students.each do |student|
        student.assign_script(script)
      end
    end
    render json: section.summarize
  end

  def log_in
    if user = User.authenticate_with_section(section: @section, params: params)
      bypass_sign_in user
      user.update_tracked_fields!(request)
      session[:show_pairing_dialog] = true if params[:show_pairing_dialog]
      check_and_apply_oauth_takeover(user)
      redirect_to_section_script_or_course
    else
      flash[:alert] = I18n.t('signinsection.invalid_login')
      redirect_to section_path(id: @section.code)
    end
  end

  private

  def redirect_to_section_script_or_course
    if @section.script
      redirect_to @section.script
    elsif @section.course
      redirect_to @section.course
    else
      redirect_to '/'
    end
  end

  def load_section_by_code
    @section = Section.find_by!(
      code: params[:id],
      login_type: [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD]
    )
  end
end
