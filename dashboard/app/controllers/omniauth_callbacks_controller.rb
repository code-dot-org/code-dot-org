class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  # GET /users/auth/:provider/callback
  def all
    @user = User.from_omniauth(request.env["omniauth.auth"], request.env['omniauth.params'])
    if @user.locale && @user.locale != request.env['cdo.locale']
      set_locale_cookie(@user.locale)
    end
    if @user.persisted?
      flash.notice = I18n.t('auth.signed_in')
      sign_in_and_redirect @user
    else
      session["devise.user_attributes"] = @user.attributes
      redirect_to new_user_registration_url
    end
  end

  User::OAUTH_PROVIDERS.each do |provider|
    alias_method provider.to_sym, :all
  end
end
