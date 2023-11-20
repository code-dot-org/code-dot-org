require 'jwt'
require 'json'

class OauthJwksController < ApplicationController
  # GET /oauth/jwks
  def jwks
    jwks_data = CDO.jwks_data
    render json: jwks_data
  end
end
