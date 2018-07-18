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
      auth_option.destroy

      # Replace primary_contact_info if we just destroyed it
      if current_user.primary_contact_info_id == auth_option.id
        current_user.update primary_contact_info:
          current_user.authentication_options.
            find_by(hashed_email: auth_option.hashed_email)
      end
    end

    head(:no_content)
  end
end
