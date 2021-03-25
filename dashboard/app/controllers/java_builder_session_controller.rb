require 'securerandom' unless defined?(SecureRandom)

class JavaBuilderSessionController < ApplicationController
  before_action :authenticate_user!
  before_action authorize_resource :java_builder

  SECRET = CDO.java_builder_secret

  private

  def configured?
    SECRET.present?
  end

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
      SECRET,
      'HS256'
    )
    payload
  end
end
