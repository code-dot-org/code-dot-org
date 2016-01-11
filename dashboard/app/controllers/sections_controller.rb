class SectionsController < ApplicationController
  def show
    load_section

    @secret_pictures = SecretPicture.all.shuffle
  end

  def log_in
    load_section

    # TODO: redirect to home page if you're already logged in

    user = User.find(params[:user_id])

    if @section.login_type == Section::LOGIN_TYPE_PICTURE &&
        user.secret_picture_id.present? &&
        user.secret_picture_id == params[:secret_picture_id].to_i
      sign_in user, :bypass => true
      user.update_tracked_fields!(request)
      redirect_to_section_script and return
    end

    if @section.login_type == Section::LOGIN_TYPE_WORD &&
        user.secret_words.present? &&
        user.secret_words == params[:secret_words]
      sign_in user, :bypass => true
      user.update_tracked_fields!(request)
      redirect_to_section_script and return
    end

    flash[:alert] = 'Invalid login, please try again'
    redirect_to section_path(id: @section.code)
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
