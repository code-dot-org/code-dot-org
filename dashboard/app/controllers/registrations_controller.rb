class RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def new
    @already_hoc_registered = params[:already_hoc_registered]
    super
  end

  def update
    @user = User.find(current_user.id)
    params.permit!

    # If email has changed for a non-teacher: clear confirmed_at but don't send notification email
    if params[:user][:email].present? && !@user.confirmation_required?
      @user.skip_reconfirmation!
      @user.confirmed_at = nil
    end

    successfully_updated =
      if forbidden_change?(@user, params)
        false
      elsif needs_password?(@user, params)
        @user.update_with_password(params[:user])
      else
        # remove the virtual current_password attribute update_without_password
        # doesn't know how to ignore it
        params[:user].delete(:current_password)
        @user.update_without_password(params[:user])
      end

    respond_to do |format|
      if successfully_updated
        set_locale_cookie(@user.locale)
        # Sign in the user bypassing validation in case his password changed
        bypass_sign_in @user

        format.html do
          set_flash_message :notice, @user.pending_reconfirmation? ? :update_needs_confirmation : :updated
          begin
            redirect_back fallback_location: after_update_path_for(@user)
          rescue ActionController::RedirectBackError
            redirect_to after_update_path_for(@user)
          end
        end
        format.any { head :no_content }
      else
        format.html { render "edit", formats: [:html] }
        format.any { head :unprocessable_entity }
      end
    end
  end

  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      super
    end
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
end
