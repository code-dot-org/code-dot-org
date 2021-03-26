require 'securerandom' unless defined?(SecureRandom)

class JavaBuilderSessionsController < ApplicationController
  authorize_resource class: false

  PRIVATE_KEY = CDO.java_builder_secret

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
      PRIVATE_KEY,
      'RS256'
    )
    render json: {token: payload}
  end
end
