class OmniauthCallbacksController < Devise::OmniauthCallbacksController

  before_filter :nonminimal

  def all
    user = User.from_omniauth(request.env["omniauth.auth"], request.env['omniauth.params'])
    if user.persisted?
      flash.notice = I18n.t('auth.signed_in')
      sign_in_and_redirect user
    else
      session["devise.user_attributes"] = user.attributes
      redirect_to new_user_registration_url
    end
  end

  alias_method :facebook, :all
  alias_method :google_oauth2, :all
  alias_method :windowslive, :all
end
