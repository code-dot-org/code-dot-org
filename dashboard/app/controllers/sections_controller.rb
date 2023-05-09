class SectionsController < ApplicationController
  include UsersHelper
  before_action :load_section_by_code, only: [:log_in, :show]
  load_and_authorize_resource :section, only: [:edit]
  authorize_resource :section, only: [:new]

  def new
    return head :forbidden unless current_user.admin

    redirect_to '/home' unless params[:loginType] && params[:participantType]

    @is_users_first_section = current_user.sections.empty?
  end

  def edit
    return head :forbidden unless current_user&.admin

    existing_section = Section.find_by(
      id: params[:id]
    )

    @section = existing_section.attributes

    @section['course'] = {
      course_offering_id: existing_section.unit_group ? existing_section.unit_group&.course_version&.course_offering&.id : existing_section.script&.course_version&.course_offering&.id,
      version_id: existing_section.unit_group ? existing_section.unit_group&.course_version&.id : existing_section.script&.course_version&.id,
      unit_id: existing_section.unit_group ? existing_section.script_id : nil
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
