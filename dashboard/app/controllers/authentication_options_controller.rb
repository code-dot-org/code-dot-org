class AuthenticationOptionsController < ApplicationController
  # GET /users/auth/:provider/connect
  def connect
    return head(:bad_request) unless current_user&.migrated? && AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(params[:provider])

    session[:connect_provider] = 2.minutes.from_now
    redirect_to omniauth_authorize_path(current_user, params[:provider])
  end
end
