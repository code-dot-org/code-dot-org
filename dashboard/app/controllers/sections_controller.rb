class SectionsController < ApplicationController
  include UsersHelper
  before_action :load_section_by_code, only: [:log_in, :show]

  def new
    return head :forbidden unless current_user&.admin
  end

  def create
    return head :forbidden unless current_user&.admin

    return head :bad_request unless section_params[:grades]

    section = Section.new(section_params)
    section.user = current_user
    section.save!

    render json: {section: {id: section.id}}
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

  private

  def redirect_to_section_script_or_course
    if @section.script
      redirect_to script_path(@section.script)
    elsif @section.unit_group
      redirect_to course_path(@section.unit_group)
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

  def section_params
    params.require(:section).permit(:name, grades: []) do |section_params|
      section_params.require(:name, :grades)
    end
  end
end
