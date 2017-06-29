class RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def new
    session[:user_return_to] ||= params[:user_return_to]
    @already_hoc_registered = params[:already_hoc_registered]
    super
  end

  def update
    return head(:bad_request) if params[:user].nil?
    @user = User.find(current_user.id)

    successfully_updated =
      if forbidden_change?(@user, params)
        false
      elsif needs_password?(@user, params)
        @user.update_with_password(update_params(params))
      else
        # remove the virtual current_password attribute update_without_password
        # doesn't know how to ignore it
        params[:user].delete(:current_password)
        @user.update_without_password(update_params(params))
      end

    account_update_response(successfully_updated, @user)
  end

  def account_update_response(successfully_updated, user)
    respond_to do |format|
      if successfully_updated
        set_locale_cookie(user.locale)
        # Sign in the user bypassing validation in case his password changed
        bypass_sign_in user

        format.html do
          set_flash_message :notice, :updated
          begin
            redirect_back fallback_location: after_update_path_for(user)
          rescue ActionController::RedirectBackError
            redirect_to after_update_path_for(user)
          end
        end
        format.any {head :no_content}
      else
        format.html {render "edit", formats: [:html]}
        format.any {head :unprocessable_entity}
      end
    end
  end

  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      super
    end
  end

  def upgrade
    return head(:bad_request) if params[:user].nil?
    @user = User.find(current_user.id)
    user_params = params[:user]

    successfully_updated =
      if @user.teacher_managed_account?
        if @user.secret_word_account?
          secret_words_match = user_params[:secret_words] == @user.secret_words
          error_string = user_params[:secret_words].blank? ? :blank_plural : :invalid_plural
          @user.errors.add(:secret_words, error_string) unless secret_words_match
          secret_words_match
        else
          true
        end
      else
        false
      end

    account_update_response(successfully_updated, @user)
  end

  private

  # Reject certain changes for certain users outright
  def forbidden_change?(user, params)
    return true if params[:user][:password].present? && !user.can_edit_password?
    return true if params[:user][:email].present? && !user.can_edit_email?
    return true if params[:user][:hashed_email].present? && !user.can_edit_email?
    false
  end

  # check if we need password to update user data
  # ie if password or email was changed
  # extend this as needed
  def needs_password?(user, params)
    params[:user][:email].present? && user.email != params[:user][:email] ||
        params[:user][:hashed_email].present? && user.hashed_email != params[:user][:hashed_email] ||
        params[:user][:password].present?
  end

  # Accept only whitelisted params for update.
  def update_params(params)
    params.require(:user).permit(
      :email,
      :hashed_email,
      :password,
      :encrypted_password,
      :current_password,
      :password_confirmation,
      :gender,
      :name,
      :locale,
      :age,
      :birthday,
      :user_type,
      :school,
      :full_address,
      :terms_of_service_version,
      school_info_attributes: [
        :country,
        :school_type,
        :state, :school_state,
        :zip, :school_zip,
        :school_district_id,
        :school_district_other,
        :school_district_name,
        :school_id,
        :school_other,
        :school_name,
        :full_address
      ],
      races: []
    )
  end
end
