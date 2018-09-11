require 'cdo/shared_cache'
require 'honeybadger'

class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include UsersHelper

  skip_before_action :clear_sign_up_session_vars

  # GET /users/auth/:provider/callback
  def all
    if should_connect_provider?
      connect_provider
    else
      login
    end
  end

  AuthenticationOption::OAUTH_CREDENTIAL_TYPES.each do |provider|
    alias_method provider.to_sym, :all
  end

  # Call GET /users/auth/:provider/connect and the callback will trigger this code path
  def connect_provider
    return head(:bad_request) unless can_connect_provider?

    auth_hash = request.env['omniauth.auth']
    provider = auth_hash.provider.to_s
    return head(:bad_request) unless AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? provider

    # TODO: some of this won't work right for non-Google providers, because info comes in differently
    new_data = nil
    if auth_hash.credentials && (auth_hash.credentials.token || auth_hash.credentials.expires_at || auth_hash.credentials.refresh_token)
      new_data = {
        oauth_token: auth_hash.credentials.token,
        oauth_token_expiration: auth_hash.credentials.expires_at,
        oauth_refresh_token: auth_hash.credentials.refresh_token
      }.to_json
    end
    email = auth_hash.info.email
    hashed_email = nil
    hashed_email = User.hash_email(email) unless email.blank?
    auth_option = AuthenticationOption.new(
      user: current_user,
      email: email,
      hashed_email: hashed_email || '',
      credential_type: provider,
      authentication_id: auth_hash.uid,
      data: new_data
    )

    if auth_option.save
      flash.notice = I18n.t('user.account_successfully_updated')
    else
      flash.alert = get_connect_provider_errors(auth_option)
    end

    redirect_to edit_user_registration_path
  end

  def login
    auth_hash = request.env['omniauth.auth']
    auth_params = request.env['omniauth.params']
    provider = auth_hash.provider.to_s
    session[:sign_up_type] = provider

    # Fiddle with data if it's a Powerschool request (other OpenID 2.0 providers might need similar treatment if we add any)
    if provider == 'powerschool'
      auth_hash = extract_powerschool_data(request.env["omniauth.auth"])
    end

    @user = User.from_omniauth(auth_hash, auth_params)

    # Set user-account locale only if no cookie is already set.
    if @user.locale &&
      @user.locale != request.env['cdo.locale'] &&
      cookies[:language_].nil?

      set_locale_cookie(@user.locale)
    end

    if just_authorized_google_classroom(@user, request.env['omniauth.params'])
      # Redirect to open roster dialog on home page if user just authorized access
      # to Google Classroom courses and rosters
      redirect_to '/home?open=rosterDialog'
    elsif User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.include?(provider) && @user.persisted?
      handle_untrusted_email_signin(@user, provider)
    elsif allows_silent_takeover(@user, auth_hash) || google_classroom_student_takeover(@user)
      silent_takeover(@user, auth_hash)
      sign_in_user
    elsif @user.persisted?
      # If email is already taken, persisted? will be false because of a validation failure
      check_and_apply_oauth_takeover(@user)
      sign_in_user
    elsif (looked_up_user = User.find_by_email_or_hashed_email(@user.email))
      # Note that @user.email is populated by User.from_omniauth even for students
      if looked_up_user.provider == 'clever'
        redirect_to "/users/sign_in?providerNotLinked=#{provider}&useClever=true"
      else
        redirect_to "/users/sign_in?providerNotLinked=#{provider}&email=#{@user.email}"
      end
    else
      # This is a new registration
      register_new_user(@user)
    end
  end

  OAUTH_PARAMS_TO_STRIP = %w{oauth_token oauth_refresh_token}.freeze

  def self.get_cache_key(oauth_param, user)
    "#{oauth_param}-#{user.email}"
  end

  private

  def register_new_user(user)
    move_oauth_params_to_cache(user)
    session["devise.user_attributes"] = user.attributes

    # For some providers, signups can happen without ever having hit the sign_up page, where
    # our tracking data is usually populated, so do it here
    unless session[:sign_up_tracking_expiration]&.future?
      session[:sign_up_uid] = SecureRandom.uuid.to_s
      session[:sign_up_tracking_expiration] = 5.minutes.from_now
    end

    redirect_to new_user_registration_url
  end

  # TODO: figure out how to avoid skipping CSRF verification for Powerschool
  skip_before_action :verify_authenticity_token, only: :powerschool

  def extract_powerschool_data(auth)
    # OpenID 2.0 data comes back in a different format compared to most of our other oauth data.
    args = JSON.parse(auth.extra.response.message.to_json)['args']
    auth_info = auth.info.merge(OmniAuth::AuthHash.new(
      user_type: args["[\"http://openid.net/srv/ax/1.0\", \"value.ext0\"]"],
      email: args["[\"http://openid.net/srv/ax/1.0\", \"value.ext1\"]"],
      name: {
        first: args["[\"http://openid.net/srv/ax/1.0\", \"value.ext2\"]"],
        last: args["[\"http://openid.net/srv/ax/1.0\", \"value.ext3\"]"],
      },
      )
    )
    auth.info = auth_info
    auth
  end

  # Clever/Powerschool signins have unique requirements, and must be handled a bit outside the normal flow
  def handle_untrusted_email_signin(user, provider)
    force_takeover = user.teacher? && user.email.present? && user.email.end_with?('.oauthemailalreadytaken')

    # We used to check this based on sign_in_count, but we're explicitly logging it now
    seen_oauth_takeover_dialog = (!!user.seen_oauth_connect_dialog) || user.sign_in_count > 1

    # If account exists (as looked up by Clever ID) and it's not the first login, just sign in
    if user.persisted? && seen_oauth_takeover_dialog && !force_takeover
      sign_in_user
    else
      # Otherwise, it's either the first login, or a user who must connect -
      # offer to connect the Clever account to an existing one, or insist if needed
      if user.migrated?
        auth_option = user.authentication_options.find_by credential_type: provider
        begin_account_takeover \
          provider: provider,
          uid: auth_option.authentication_id,
          oauth_token: auth_option.data_hash[:oauth_token],
          force_takeover: force_takeover
      else
        begin_account_takeover \
          provider: user.provider,
          uid: user.uid,
          oauth_token: user.oauth_token,
          force_takeover: force_takeover
      end
      user.seen_oauth_connect_dialog = true
      user.save!
      sign_in_user
    end
  end

  def move_oauth_params_to_cache(user)
    # Because some oauth tokens are quite large, we strip them from the session
    # variables and pass them through via the cache instead - they are pulled out again
    # from User::new_with_session
    cache = CDO.shared_cache
    return unless cache
    OAUTH_PARAMS_TO_STRIP.each do |param|
      param_value = user.attributes['properties'].delete(param)
      cache_key = OmniauthCallbacksController.get_cache_key(param, user)
      cache.write(cache_key, param_value)
    end
  end

  def just_authorized_google_classroom(user, params)
    scopes = (params['scope'] || '').split(',')
    user.persisted? &&
      user.provider == 'google_oauth2' &&
      scopes.include?('classroom.rosters.readonly')
  end

  def google_classroom_student_takeover(user)
    # Google Classroom does not provide student email addresses, so we want to perform
    # silent takeover on these accounts, but *only if* the student hasn't made progress
    # with the account created during the Google Classroom import.
    user.persisted? && user.google_classroom_student? &&
      user.email.blank? && user.hashed_email.blank? &&
      !user.has_activity?
  end

  def silent_takeover(oauth_user, auth_hash)
    # Copy oauth details to primary account
    lookup_email = oauth_user.email.presence || auth_hash.info.email
    @user = User.find_by_email_or_hashed_email(lookup_email)
    return unless @user.present?
    if google_classroom_student_takeover(oauth_user)
      return unless move_sections_and_destroy_source_user(oauth_user, @user)
    end

    if @user.migrated?
      success = AuthenticationOption.create(
        user: @user,
        email: lookup_email,
        credential_type: auth_hash.provider.to_s,
        authentication_id: auth_hash.uid,
        data: {
          oauth_token: auth_hash.credentials&.token,
          oauth_token_expiration: auth_hash.credentials&.expires_at,
          oauth_refresh_token: auth_hash.credentials&.refresh_token
        }.to_json
      )
      unless success
        # This should never happen if other logic is working correctly, so notify
        Honeybadger.notify(
          error_class: 'Failed to create AuthenticationOption during silent takeover',
          error_message: "Could not create AuthenticationOption during silent takeover for user with email #{lookup_email}"
        )
      end
    else
      success = @user.update(
        provider: auth_hash.provider.to_s,
        uid: auth_hash.uid,
        oauth_token: auth_hash.credentials&.token,
        oauth_token_expiration: auth_hash.credentials&.expires_at,
        oauth_refresh_token: auth_hash.credentials&.refresh_token
      )
      unless success
        # This should never happen if other logic is working correctly, so notify
        Honeybadger.notify(
          error_class: 'Failed to update User during silent takeover',
          error_message: "Could not update user during silent takeover for user with email #{lookup_email}"
        )
      end
    end
  end

  def sign_in_user
    flash.notice = I18n.t('auth.signed_in')

    sign_up_type = session[:sign_up_type]
    sign_up_type ||= resource.email ? 'email' : 'other'
    provider = request.env['omniauth.auth'].provider.to_s
    if session[:sign_up_tracking_expiration]&.future? || User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.include?(provider)
      result = resource.persisted? ? 'success' : 'error'
      tracking_data = {
        study: 'account-sign-up',
        event: "#{sign_up_type}-sign-in-#{result}",
        data_string: session[:sign_up_uid]
      }
      FirehoseClient.instance.put_record(tracking_data)
    end

    sign_in_and_redirect @user
  end

  def allows_silent_takeover(oauth_user, auth_hash)
    allow_takeover = auth_hash.provider.present?
    allow_takeover &= AuthenticationOption::SILENT_TAKEOVER_CREDENTIAL_TYPES.include?(auth_hash.provider.to_s)
    lookup_user = User.find_by_email_or_hashed_email(oauth_user.email)

    allow_takeover && lookup_user && !oauth_user.persisted?
  end

  def should_connect_provider?
    return current_user && session[:connect_provider].present?
  end

  def can_connect_provider?
    return false unless current_user&.migrated?

    connect_flag_expiration = session.delete :connect_provider
    connect_flag_expiration&.future?
  end

  def get_connect_provider_errors(auth_option)
    errors = auth_option.errors.full_messages
    Honeybadger.notify(
      error_message: "Error connecting to provider",
      context: {
        authentication_option: auth_option,
        errors: errors
      }
    )

    return errors.first unless errors.empty?
    I18n.t('auth.unable_to_connect_provider', provider: I18n.t("auth.#{auth_option.credential_type}"))
  end
end
