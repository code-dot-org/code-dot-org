class Api::V1::Account::SettingsController < Api::V1::JSONApiController
  # `force_json` must run before `authenticate_user!` so a signed-out request
  # gets a 401 JSON response instead of a navigational 302 to the sign-in page
  # (Devise treats an unforced `Accept: */*` request as navigational). The real
  # client sends `Accept: application/json` too; this is the server-side
  # backstop. Do NOT add `skip_before_action :verify_authenticity_token` or
  # `allow_cdo_cors` anywhere in the Account:: namespace.
  before_action :force_json
  before_action :authenticate_user!
  before_action :prevent_caching

  # GET /api/v1/account/settings
  #
  # Serializes the signed-in user's own account settings. Singular resource:
  # it takes no user identifier and only ever reads `current_user`, so a
  # cross-user (IDOR) read is impossible by route shape.
  def show
    render json: ::Account::SettingsSerializer.new(current_user).as_json
  end
end
