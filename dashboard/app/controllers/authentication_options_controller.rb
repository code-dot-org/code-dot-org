class AuthenticationOptionsController < ApplicationController
  # GET /users/auth/:provider/connect
  def connect
    return head(:bad_request) unless current_user&.migrated? && AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(params[:provider])

    session[:connect_provider] = 2.minutes.from_now
    redirect_to omniauth_authorize_path(current_user, params[:provider])
  end

  # DELETE /users/auth/:id/disconnect
  def disconnect
    return head(:bad_request) unless current_user&.migrated?
    auth_option = current_user.authentication_options.find(params[:id])

    if auth_option.present?
      current_user.transaction do
        auth_option.destroy!

        # Replace primary_contact_info if we just destroyed it
        if current_user.primary_contact_info_id == auth_option.id
          replacement = current_user.authentication_options.find_by hashed_email: auth_option.hashed_email
          replacement ||= email_option_from_deleted_option auth_option
          current_user.update! primary_contact_info: replacement
        end
      end
    end

    head(:no_content)
  end

  private def email_option_from_deleted_option(deleted_option)
    AuthenticationOption.new(
      user: deleted_option.user,
      email: deleted_option.email,
      hashed_email: deleted_option.hashed_email,
      credential_type: AuthenticationOption::EMAIL,
      authentication_id: deleted_option.hashed_email
    )
  end
end
