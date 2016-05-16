class SectionsController < ApplicationController
  def show
    load_section

    @secret_pictures = SecretPicture.all.shuffle
  end

  def log_in
    load_section

    # TODO: redirect to home page if you're already logged in

    if user = User.authenticate_with_section(section: @section, params: params)
      sign_in user, bypass: true
      user.update_tracked_fields!(request)
      redirect_to_section_script
    else
      flash[:alert] = 'Invalid login, please try again'
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

  def load_section
    @section = Section.find_by!(code: params[:id],
                                login_type: [Section::LOGIN_TYPE_PICTURE,
                                             Section::LOGIN_TYPE_WORD])
  end
end
