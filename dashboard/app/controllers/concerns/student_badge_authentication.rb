module StudentBadgeAuthentication
  extend ActiveSupport::Concern

  included do
    before_action :validate_student_badge_session
    before_action :require_non_badge_authentication, if: -> {devise_controller? && controller_name == 'invitations'}
    helper_method :badge_authenticated?
  end

  def badge_authenticated?
    session[Services::StudentBadges::Session::KEY].present?
  end

  private def validate_student_badge_session
    return unless badge_authenticated?
    prevent_caching
    return if request.env['cdo.badge_verified'] || Services::StudentBadges::Session.valid?(session)
    sign_out
    reset_session
    respond_to do |format|
      format.html {redirect_to Policies::StudentBadges.authentication_enabled? ? badge_login_path : new_user_session_path}
      format.any {render json: {error: 'badge_session_expired'}, status: :unauthorized}
    end
  end

  private def require_non_badge_authentication
    return unless badge_authenticated?
    respond_to do |format|
      format.html {redirect_to badge_reauthentication_path}
      format.any {render json: {error: 'badge_reauthentication_required', redirect: badge_reauthentication_path}, status: :forbidden}
    end
  end
end
