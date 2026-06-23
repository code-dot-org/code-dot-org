class Api::V1::Users::SettingsController < Api::V1::JSONApiController
  # force_json must precede authenticate_user! so a signed-out request gets 401
  # JSON, not Devise's navigational 302 to sign-in. Do not add a CSRF skip or
  # allow_cdo_cors here.
  before_action :force_json
  before_action :authenticate_user!
  before_action :prevent_caching

  # Singular resource keyed on current_user only, so no cross-user (IDOR) read.
  def show
    render json: ::User::SettingsSerializer.new(current_user).as_json
  end
end
