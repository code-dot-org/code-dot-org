class LtiProviderController < ApplicationController
  include LtiHelper

  protect_from_forgery except: [:sso]

  def sso
    lti_signin_and_redirect(params, params[:redirect_url] || root_path)
  end
end
