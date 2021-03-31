require 'jwt'

class JavaBuilderSessionsController < ApplicationController
  authorize_resource class: false

  PRIVATE_KEY = CDO.java_builder_private_key
  PASSWORD = CDO.java_builder_key_password

  # GET /javabuilder/access_token
  def get_access_token
    issued_at_time = Time.now.to_i
    # expire token in 15 minutes
    expiration_time = (Time.now + 15.minutes).to_i

    payload = JWT.encode(
      {
        iat: issued_at_time,
        exp: expiration_time
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSWORD),
      'RS256'
    )
    render json: {token: payload}
  end
end
