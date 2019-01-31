require 'cdo/shared_cache'
require 'honeybadger/ruby'

class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include UsersHelper

  skip_before_action :clear_sign_up_session_vars

  # Note: We can probably remove these once we've broken out all providers
  BROKEN_OUT_TYPES = [AuthenticationOption::CLEVER, AuthenticationOption::GOOGLE]
  TYPES_ROUTED_TO_ALL = AuthenticationOption::OAUTH_CREDENTIAL_TYPES - BROKEN_OUT_TYPES

  # GET /users/auth/clever/callback
  def clever
    return connect_provider if should_connect_provider?

    user = find_user_by_credential
    if user
      sign_in_clever user
    else
      sign_up_clever
    end
  end

  # GET /users/auth/google_oauth2/callback
  def google_oauth2
    # Redirect to open roster dialog on home page if user just authorized access
    # to Google Classroom courses and rosters
    return redirect_to '/home?open=rosterDialog' if just_authorized_google_classroom?
    return connect_provider if should_connect_provider?

    user = find_user_by_credential
    if user
      sign_in_google_oauth2 user
    else
      sign_up_google_oauth2
    end
  end

  # All remaining providers
  # GET /users/auth/:provider/callback
  def all
    return connect_provider if should_connect_provider?
    login
  end

  TYPES_ROUTED_TO_ALL.each do |provider|
    alias_method provider.to_sym, :all
  end

  # Call GET /users/auth/:provider/connect and the callback will trigger this code path
  def connect_provider
    return head(:bad_request) unless can_connect_provider?

    provider = auth_hash.provider.to_s
    return head(:bad_request) unless AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? provider

    existing_credential_holder = User.find_by_credential type: provider, id: auth_hash.uid

    # Credential is already held by the current user
    # Notify of no-op.
    if existing_credential_holder&.==(current_user)
      flash.notice = I18n.t('auth.already_linked', provider: I18n.t("auth.#{provider}"))
      return redirect_to edit_user_registration_path
    end

    # Credential is already held by another user with activity
    # Display an error explaining that the credential is already in use.
    if existing_credential_holder&.has_activity?
      flash.alert = I18n.t('auth.already_in_use', provider: I18n.t("auth.#{provider}"))
      return redirect_to edit_user_registration_path
    end

    # Credential is already held by an unused account.
    # Take over the unused account.
    if existing_credential_holder
      move_sections_and_destroy_source_user \
        source_user: existing_credential_holder,
        destination_user: current_user,
        takeover_type: 'connect_provider',
        provider: provider
    end

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
    provider = auth_hash.provider.to_s
    session[:sign_up_type] = provider

    # For some providers, signups can happen without ever having hit the sign_up page, where
    # our tracking data is usually populated, so do it here
    SignUpTracking.begin_sign_up_tracking(session)
    SignUpTracking.log_oauth_callback provider, session

    # Fiddle with data if it's a Powerschool request (other OpenID 2.0 providers might need similar treatment if we add any)
    if provider == 'powerschool'
      auth_hash = extract_powerschool_data(auth_hash)
    end

    # Microsoft formats email and name differently, so update it to match expected structure
    if provider == AuthenticationOption::MICROSOFT
      auth_hash = extract_microsoft_data(auth_hash)
    end

    user = User.from_omniauth(auth_hash, auth_params, session)

    prepare_locale_cookie user

    if User::OAUTH_PROVIDERS_UNTRUSTED_EMAIL.include?(provider) && user.persisted?
      handle_untrusted_email_signin user, provider
    elsif allows_silent_takeover(user, auth_hash)
      user = silent_takeover user, auth_hash
      sign_in_user user
    elsif user.persisted?
      # If email is already taken, persisted? will be false because of a validation failure
      check_and_apply_oauth_takeover user
      sign_in_user user
    elsif (looked_up_user = User.find_by_email_or_hashed_email(user.email))
      email_already_taken_redirect \
        provider: provider,
        found_provider: looked_up_user.provider,
        email: user.email
    else
      # This is a new registration
      register_new_user user
    end
  end

  private

  def sign_in_google_oauth2(user)
    SignUpTracking.log_oauth_callback AuthenticationOption::GOOGLE, session
    prepare_locale_cookie user
    user.update_oauth_credential_tokens auth_hash

    if allows_google_classroom_takeover user
      user = silent_takeover user, auth_hash
    end
    sign_in_user user
  end

  def sign_up_google_oauth2
    session[:sign_up_type] = AuthenticationOption::GOOGLE

    # For some providers, signups can happen without ever having hit the sign_up page, where
    # our tracking data is usually populated, so do it here
    SignUpTracking.begin_sign_up_tracking(session, split_test: true)
    SignUpTracking.log_oauth_callback AuthenticationOption::GOOGLE, session

    user = User.new.tap do |u|
      User.initialize_new_oauth_user(u, auth_hash, auth_params)
      u.oauth_token = auth_hash.credentials&.token
      u.oauth_token_expiration = auth_hash.credentials&.expires_at
      u.oauth_refresh_token = auth_hash.credentials&.refresh_token
    end
    prepare_locale_cookie user

    if allows_silent_takeover user, auth_hash
      user = silent_takeover user, auth_hash
      sign_in_user user
    else
      register_new_user user
    end
  end

  def sign_in_clever(user)
    SignUpTracking.log_oauth_callback AuthenticationOption::CLEVER, session
    prepare_locale_cookie user
    user.update_oauth_credential_tokens auth_hash
    handle_untrusted_email_signin(user, AuthenticationOption::CLEVER)
  end

  def sign_up_clever
    session[:sign_up_type] = AuthenticationOption::CLEVER

    # For some providers, signups can happen without ever having hit the sign_up page, where
    # our tracking data is usually populated, so do it here
    # Clever performed poorly in our split test, so never send it to the experiment
    SignUpTracking.begin_sign_up_tracking(session, split_test: false)
    SignUpTracking.log_oauth_callback AuthenticationOption::CLEVER, session

    user = User.from_omniauth(auth_hash, auth_params, session)
    prepare_locale_cookie user

    if user.persisted?
      handle_untrusted_email_signin(user, AuthenticationOption::CLEVER)
    elsif (looked_up_user = User.find_by_email_or_hashed_email(user.email))
      email_already_taken_redirect(
        provider: AuthenticationOption::CLEVER,
        found_provider: looked_up_user.provider,
        email: user.email
      )
    else
      # This is a new registration
      register_new_user user
    end
  end

  def find_user_by_credential
    User.find_by_credential \
      type: auth_hash.provider,
      id: auth_hash.uid
  end

  def auth_hash
    request.env['omniauth.auth']
  end

  def auth_params
    request.env['omniauth.params']
  end

  def prepare_locale_cookie(user)
    # Set user-account locale only if no cookie is already set.
    if user.locale &&
      user.locale != request.env['cdo.locale'] &&
      cookies[:language_].nil?

      set_locale_cookie(user.locale)
    end
  end

  def email_already_taken_redirect(provider:, found_provider:, email:)
    if found_provider == 'clever'
      redirect_to "/users/sign_in?providerNotLinked=#{provider}&useClever=true"
    else
      redirect_to "/users/sign_in?providerNotLinked=#{provider}&email=#{email}"
    end
  end

  def register_new_user(user)
    PartialRegistration.persist_attributes(session, user)
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

  def extract_microsoft_data(auth)
    auth_info = auth.info.merge(OmniAuth::AuthHash.new(
      email: auth[:extra][:raw_info][:userPrincipalName],
      name: auth[:extra][:raw_info][:displayName]
      )
    )
    auth.info = auth_info
    auth
  end

  # Clever/Powerschool signins have unique requirements, and must be handled a bit outside the normal flow
  def handle_untrusted_email_signin(user, provider)
    force_takeover = user.teacher? && user.email.present? && user.email.end_with?('.oauthemailalreadytaken')
    if force_takeover
      # It's a user who must link accounts - a Clever/Powerschool Code.org teacher account with an
      # email that conflicts with an existing Code.org account.
      #
      # We don't want them using the teacher account as-is because it doesn't have a valid email.
      # We can't do a silent takeover because we don't trust email addresses from Clever/Powerschool
      #
      # Long-term I'd like sign-up when there's a conflict like this to just fail, with a helpful
      # message directing the teacher to sign in to their existing account and then link Clever
      # to it from the accounts page.
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
    end
    sign_in_user user
  end

  def just_authorized_google_classroom?
    current_user &&
    current_user.providers.include?(AuthenticationOption::GOOGLE) &&
      has_google_oauth2_scope?('classroom.rosters.readonly')
  end

  def has_google_oauth2_scope?(scope_name)
    scopes = (auth_params&.[]('scope') || '').split(',')
    scopes.include?(scope_name)
  end

  def allows_google_classroom_takeover(user)
    # Google Classroom does not provide student email addresses, so we want to perform
    # silent takeover on these accounts, but *only if* the student hasn't made progress
    # with the account created during the Google Classroom import.
    user.persisted? && user.google_classroom_student? &&
      user.email.blank? && user.hashed_email.blank? &&
      !user.has_activity?
  end

  # Looks for an existing user with an email address matching the oauth credentials.
  # If an existing user is found, destroys the source user and moves credentials and section
  # membership to the existing user.
  #
  # @param [User] oauth_user (may or may not be persisted)
  # @param [Hash] auth_hash
  #
  # @returns [User] that survives the takeover - this might be the the oauth_user passed in, or a
  #   _different_ user that was taken over.  Either way, the caller should consider the returned
  #   user the one that should be signed in at the end of the auth flow.
  def silent_takeover(oauth_user, auth_hash)
    lookup_email = oauth_user.email.presence || auth_hash.info.email
    lookup_user = User.find_by_email_or_hashed_email(lookup_email)
    provider = auth_hash.provider.to_s

    unless lookup_user.present?
      # Even if silent takeover is not available for student imported from Google Classroom, we still want
      # to attach the email received from Google login to the student's account since GC imports do not provide emails.
      if allows_google_classroom_takeover(oauth_user)
        oauth_user.update_email_for(
          provider: provider,
          uid: auth_hash.uid,
          email: lookup_email
        )
      end
      return oauth_user
    end

    # Transfer sections and destroy Google Classroom user if takeover is possible
    if allows_google_classroom_takeover(oauth_user)
      return unless move_sections_and_destroy_source_user(
        source_user: oauth_user,
        destination_user: lookup_user,
        takeover_type: 'silent',
        provider: provider,
      )
    end

    begin
      if lookup_user.migrated?
        AuthenticationOption.create!(
          user: lookup_user,
          email: lookup_email,
          credential_type: provider,
          authentication_id: auth_hash.uid,
          data: {
            oauth_token: auth_hash.credentials&.token,
            oauth_token_expiration: auth_hash.credentials&.expires_at,
            oauth_refresh_token: auth_hash.credentials&.refresh_token
          }.to_json
        )
      else
        lookup_user.update!(
          email: lookup_email,
          provider: provider,
          uid: auth_hash.uid,
          oauth_token: auth_hash.credentials&.token,
          oauth_token_expiration: auth_hash.credentials&.expires_at,
          oauth_refresh_token: auth_hash.credentials&.refresh_token
        )
      end
    rescue => err
      error_class = lookup_user.migrated? ?
        'Failed to create AuthenticationOption during silent takeover' :
        'Failed to update User during silent takeover'
      # This should never happen if other logic is working correctly, so notify
      # This can happen if the account being taken over is already invalid
      Honeybadger.notify(
        error_class: error_class,
        error_message: err.to_s,
        context: {
          user_id: lookup_user.id,
          tags: 'accounts'
        }
      )
    end
    lookup_user
  end

  def sign_in_user(user)
    flash.notice = I18n.t('auth.signed_in')

    # Will only log if the sign_up page session cookie is set, so this is safe to call in all cases
    SignUpTracking.log_sign_in(user, session, request)

    sign_in_and_redirect user
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

    return errors.first unless errors.empty?
    I18n.t('auth.unable_to_connect_provider', provider: I18n.t("auth.#{auth_option.credential_type}"))
  end
end
