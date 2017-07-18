class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  # GET /users/auth/:provider/callback
  def all
    @user = User.from_omniauth(request.env["omniauth.auth"], request.env['omniauth.params'])

    # Set user-account locale only if no cookie is already set.
    if @user.locale &&
      @user.locale != request.env['cdo.locale'] &&
      cookies[:language_].nil?

      set_locale_cookie(@user.locale)
    end

    if @user.persisted?
      sign_in_user
    elsif allows_silent_takeover(@user.provider) && User.find_by_email_or_hashed_email(@user.email)
      @user = User.find_by_email_or_hashed_email(@user.email)
      sign_in_user
    elsif User.find_by_email_or_hashed_email(@user.email)
      # Note that @user.email is populated by User.from_omniauth even for students
      redirect_to "/users/sign_in?providerNotLinked=#{@user.provider}&email=#{@user.email}"
    else
      session["devise.user_attributes"] = @user.attributes
      redirect_to new_user_registration_url
    end
  end

  User::OAUTH_PROVIDERS.each do |provider|
    alias_method provider.to_sym, :all
  end

  private

  def sign_in_user
    flash.notice = I18n.t('auth.signed_in')
    sign_in_and_redirect @user
  end

  def allows_silent_takeover(provider)
    %w(facebook google_oauth2 windowslive).include?(provider)
  end
end
