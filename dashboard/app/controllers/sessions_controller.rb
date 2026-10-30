require 'policies/child_account'
require 'policies/lti'

class SessionsController < Devise::SessionsController
  include UsersHelper

  # see also
  # https://github.com/plataformatec/devise/blob/v3.2/app/controllers/devise/sessions_controller.rb

  # GET /resource/sign_in
  def new
    session[:user_return_to] ||= params[:user_return_to]
    @user_return_to = session[:user_return_to]
    @hide_sign_in_option = true
    @is_english = request.language == 'en'
    if params[:providerNotLinked]
      if params[:useClever]
        # The provider was not linked, and we need to tell the user to sign in specifically through Clever
        flash.now[:alert] = I18n.t 'auth.use_clever', provider: I18n.t("auth.#{params[:providerNotLinked]}")
      else
        # This code is only reached through the oauth flow when the user already has an email account.
        # Usually email would not be available for students, this is a special case where oauth fills it in.
        flash.now[:alert] = I18n.t 'auth.not_linked', provider: I18n.t("auth.#{params[:providerNotLinked]}")
        @email = params[:email]
      end
    end
    nudge_toward_sso if DCDO.get('sso_nudge_enabled', false) && failed_password_login?
    super
  end

  # DELETE /resource/sign_out
  def destroy
    redirect_path = after_sign_out_path_for(:user)

    sign_out

    yield resource if block_given?

    # We actually need to hardcode this as Rails default responder doesn't
    # support returning empty response on GET request
    respond_to do |format|
      format.all {head :no_content}
      format.any(*navigational_formats) do
        # Ensure no_store cache control for redirect-caching bug on Safari <= 8.
        # Ref: https://bugs.webkit.org/show_bug.cgi?id=77538
        prevent_caching
        redirect_to redirect_path
      end
    end
  end

  # DELETE /resource/expire_other
  # Expire all existing sessions for the current user, then create a new
  # authenticated session. The ultimate resulting experience will be that the
  # user gets signed out of their account on all browsers other than the one
  # they initiated the request with; on that one, they will still be signed in.
  def expire_other
    # Identify current user and preserve any non-user-identifying data in the
    # current session (ie, assumed_identity, callouts_seen, etc).
    user = current_user
    existing_session_data = session.to_hash.except("warden.user.user.key", "_csrf_token")

    # Expire all existing sessions and sign user out.
    user.expire_all_sessions!
    sign_out

    # Create a new session for the user and restore data from previous session.
    sign_in(:user, user)
    session.merge!(existing_session_data) if existing_session_data

    # Success! Display a notice and redirect to the account settings page, from
    # which we expect this request to have been initiated.
    flash[:notice] = I18n.t('devise.sessions.expired_other')
    redirect_back(fallback_location: users_edit_path)
  end

  # GET /reset_session
  def reset
    client_state.reset
    sign_out if current_user
    reset_session
    render layout: false
  end

  # GET /lockout
  # This page is for accounts that are locked until parental permission compliance.
  def lockout
    # If the student isn't signed in, go to the login page
    return redirect_to new_user_session_path unless current_user

    # If the user is npt locked out with the Child Account Policy, redirect them to /home
    return redirect_to home_path unless Policies::ChildAccount::ComplianceState.locked_out?(current_user)

    # Basic defaults. If the @pending_email is empty, the request was never sent
    @pending_email = ''
    @request_date = DateTime.now

    # Disallow the student's email address (unless a parent is creating the account)
    @disallowed_email = ''
    unless current_user.parent_created_account?
      @disallowed_email = current_user.hashed_email
    end

    # Determine the deletion date as the lockout date of the account + 7 days
    @delete_date = current_user.cap_status_date&.since(7.days)

    # Find any existing permission request for this user
    # Students might have issued a few requests. We render the latest one.
    permission_request = current_user.latest_parental_permission_request

    # If it exists, set the appropriate fields before rendering the lockout UI
    if permission_request
      @pending_email = permission_request.parent_email
      @request_date = permission_request.updated_at
    end

    @permission_status = current_user.cap_status
    @in_section = current_user.sections_as_student.present?
  end

  # True when `new` is rendering because the login form was just rejected.
  #
  # A failed POST to `create` does not redirect back to the sign-in page.
  # Devise's failure app instead calls `new` within the same request: the
  # method is still POST, the submitted email and password are still in
  # params, and flash.now already holds "Invalid email or password". The
  # warden `recall` option is what marks that in-request handoff; a plain
  # visit to the sign-in page is a GET and has no such option.
  private def failed_password_login?
    request.post? && request.env['warden.options']&.dig(:recall).present?
  end

  # Users whose account signs in through an SSO provider often try the
  # password form anyway, fail, and end up asking support for a password
  # reset. Replace the generic failure alert with a pointer at the provider
  # they already have.
  private def nudge_toward_sso
    sso_option = sso_option_for_submitted_login
    return unless sso_option

    flash.now[:alert] =
      if sso_option.lti?
        I18n.t 'auth.lti_login_nudge', platform: lms_display_name(sso_option)
      else
        provider = I18n.t "auth.#{sso_option.credential_type}", default: sso_option.credential_type
        I18n.t 'auth.sso_login_nudge', provider: provider
      end
  end

  # The form submits either `hashed_email` (hashed client-side) or `login`,
  # which may be a username or a cleartext email. A username never matches
  # an auth option's hashed_email, so it falls through to nil.
  #
  # Providers in UNTRUSTED_EMAIL_CREDENTIAL_TYPES do not guarantee an email
  # belongs to one person, so the same hashed_email can sit on options owned
  # by different users. Nudging then could point at a provider someone else
  # used, so the nudge is only given when every match belongs to one user.
  private def sso_option_for_submitted_login
    submitted = params[:user] || {}
    hashed_email = submitted[:hashed_email].presence
    hashed_email ||= AuthenticationOption.hash_email(submitted[:login].strip) if submitted[:login].present?
    return if hashed_email.blank?

    options = AuthenticationOption.
      where(hashed_email: hashed_email).
      where.not(credential_type: AuthenticationOption::EMAIL).
      order(updated_at: :desc).
      to_a
    return unless options.map(&:user_id).uniq.one?

    options.first
  end

  # Find the human-readable name for the LMS based on the issuer
  # from the authentication_id.
  private def lms_display_name(lti_option)
    issuer = lti_option.lti_issuer
    Policies::Lti.find_platform_by_issuer(issuer)&.dig(:name) ||
      I18n.t('auth.lti_login_nudge_default_platform')
  end

  # Override default Devise sign_out path method
  private def after_sign_out_path_for(resource_or_scope)
    user = resource_or_scope && send(:"current_#{resource_or_scope}")
    if user&.oauth?
      return oauth_sign_out_path(user.provider)
    end

    root_path
  end
end
