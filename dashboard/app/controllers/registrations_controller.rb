class RegistrationsController < Devise::RegistrationsController

  respond_to :json

  def update
    @user = User.find(current_user.id)
    params.permit!

    # If email has changed for a non-teacher: clear confirmed_at but don't send notification email
    @user.skip_reconfirmation! if params[:user][:email].present? && !@user.confirmation_required?
    @user.confirmed_at = nil if params[:user][:email].present? && !@user.confirmation_required?

    successfully_updated =
      if needs_password?(@user, params)
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
        sign_in @user, :bypass => true

        format.html do
          set_flash_message :notice, @user.pending_reconfirmation? ? :update_needs_confirmation : :updated
          begin
            redirect_to :back
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
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      super
    end
  end

  private

  # check if we need password to update user data
  # ie if password or email was changed
  # extend this as needed
  def needs_password?(user, params)
    params[:user][:email].present? && user.email != params[:user][:email] ||
        params[:user][:password].present?
  end
end
