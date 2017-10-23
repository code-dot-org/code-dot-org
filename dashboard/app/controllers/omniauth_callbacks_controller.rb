require 'cdo/shared_cache'

class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include UsersHelper

  # GET /users/auth/:provider/callback
  def all
    @user = User.from_omniauth(request.env["omniauth.auth"], request.env['omniauth.params'])

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
    elsif @user.provider == 'clever'
      handle_clever_signin(@user)
    elsif @user.persisted?
      # If email is already taken, persisted? will be false because of a validation failure
      check_and_apply_clever_takeover(@user)
      sign_in_user
    elsif allows_silent_takeover(@user)
      silent_takeover(@user)
    elsif (looked_up_user = User.find_by_email_or_hashed_email(@user.email))
      # Note that @user.email is populated by User.from_omniauth even for students
      if looked_up_user.provider == 'clever'
        redirect_to "/users/sign_in?providerNotLinked=#{@user.provider}&useClever=true"
      else
        redirect_to "/users/sign_in?providerNotLinked=#{@user.provider}&email=#{@user.email}"
      end
    else
      # This is a new registration
      register_new_user(@user)
    end
  end

  User::OAUTH_PROVIDERS.each do |provider|
    alias_method provider.to_sym, :all
  end

  OAUTH_PARAMS_TO_STRIP = %w{oauth_token oauth_refresh_token}.freeze

  def self.get_cache_key(oauth_param, user)
    "#{oauth_param}-#{user.email}"
  end

  private

  def register_new_user(user)
    move_oauth_params_to_cache(user)
    session["devise.user_attributes"] = user.attributes
    redirect_to new_user_registration_url
  end

  # Clever signins have unique requirements, and must be handled a bit outside the normal flow
  def handle_clever_signin(user)
    # If account exists and it's not the first login, just sign in
    if user.persisted? && user.sign_in_count > 0
      sign_in_user
    else
      # Otherwise, go through the new user flow - there we will
      # offer to connect the Clever account to an existing one
      session['clever_link_flag'] = true
      session['clever_takeover_id'] = user.uid
      session['clever_takeover_token'] = user.oauth_token
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

  def silent_takeover(oauth_user)
    # Copy oauth details to primary account
    @user = User.find_by_email_or_hashed_email(oauth_user.email)
    @user.provider = oauth_user.provider
    @user.uid = oauth_user.uid
    @user.oauth_refresh_token = oauth_user.oauth_refresh_token
    @user.oauth_token = oauth_user.oauth_token
    @user.oauth_token_expiration = oauth_user.oauth_token_expiration
    sign_in_user
  end

  def sign_in_user
    flash.notice = I18n.t('auth.signed_in')
    sign_in_and_redirect @user
  end

  def allows_silent_takeover(oauth_user)
    allow_takeover = oauth_user.provider.present?
    allow_takeover &= %w(facebook google_oauth2 windowslive).include?(oauth_user.provider)
    # allow_takeover &= oauth_user.email_verified # TODO (eric) - set up and test for different providers
    lookup_user = User.find_by_email_or_hashed_email(oauth_user.email)
    allow_takeover && lookup_user
  end
end
