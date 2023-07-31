require 'jwt'
require 'json'

include LtiAccessTokenHelper

class OauthJwksController < ApplicationController
  # GET /oauth/jwks
  def jwks
    jwks_data = CDO.jwks_data
    render json: jwks_data
  end

  # TEMP: Use this endpoint to invoke the get_access_token. You can configure your
  # local LTI Integration client_id
  def access_token
    access_token = get_access_token("10000000000001", "https://canvas.instructure.com")
    p access_token
    render json: access_token
  end
end
