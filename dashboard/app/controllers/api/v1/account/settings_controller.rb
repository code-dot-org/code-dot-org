class Api::V1::Account::SettingsController < Api::V1::JSONApiController
  # `force_json` before `authenticate_user!` so a signed-out request gets 401
  # JSON, not a navigational 302 to sign-in (Devise treats `Accept: */*` as
  # navigational). Do NOT add a CSRF-token skip or `allow_cdo_cors` in this
  # namespace.
  before_action :force_json
  before_action :authenticate_user!
  before_action :prevent_caching

  # GET /api/v1/account/settings. Singular resource (no user id, reads only
  # current_user), so a cross-user (IDOR) read is impossible by route shape.
  def show
    render json: ::Account::SettingsSerializer.new(current_user).as_json
  end
end
