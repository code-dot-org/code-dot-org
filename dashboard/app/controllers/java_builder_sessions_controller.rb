require 'jwt'
require 'securerandom' unless defined?(SecureRandom)

class JavaBuilderSessionsController < ApplicationController
  authorize_resource class: false

  PRIVATE_KEY = CDO.java_builder_private_key
  PASSWORD = CDO.java_builder_key_password

  # GET /javabuilder/access_token
  def get_access_token
    channel_id = params[:channelId]
    project_version = params[:projectVersion]
    if !channel_id || !project_version
      return render status: :bad_request, json: {}
    end

    begin
      storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {}
    end

    issued_at_time = Time.now.to_i
    # expire token in 15 minutes
    expiration_time = (Time.now + 15.minutes).to_i

    payload = JWT.encode(
      {
        iat: issued_at_time,
        exp: expiration_time,
        sid: SecureRandom.hex(18), # session id
        uid: current_user.id,
        storage_id: storage_id,
        storage_app_id: storage_app_id,
        channel_id: channel_id,
        project_version: project_version
      },
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSWORD),
      'RS256'
    )
    render json: {token: payload}
  end
end
