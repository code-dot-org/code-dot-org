class SectionsController < ApplicationController
  before_action :load_section_by_code, except: :update

  def show
    @secret_pictures = SecretPicture.all.shuffle
  end

  # Allows you to update a section's course_id. Clears any assigned script_id
  # in the process
  def update
    section = Section.find(params[:id])
    authorize! :manage, section

    section.update!(course_id: params[:course_id], script_id: nil)
    render json: {}
  end

  def log_in
    if user = User.authenticate_with_section(section: @section, params: params)
      bypass_sign_in user
      user.update_tracked_fields!(request)
      session[:show_pairing_dialog] = true if params[:show_pairing_dialog]
      redirect_to_section_script
    else
      flash[:alert] = I18n.t('signinsection.invalid_login')
      redirect_to section_path(id: @section.code)
    end
  end

  private

  def redirect_to_section_script
    if @section.script
      redirect_to @section.script
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
