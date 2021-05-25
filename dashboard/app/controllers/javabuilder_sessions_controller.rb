require 'jwt'
require 'securerandom' unless defined?(SecureRandom)
require 'cdo/firehose'

class JavabuilderSessionsController < ApplicationController
  authorize_resource class: false

  PRIVATE_KEY = CDO.javabuilder_private_key
  PASSWORD = CDO.javabuilder_key_password

  # GET /javabuilder/access_token
  def get_access_token
    channel_id = params[:channelId]
    project_version = params[:projectVersion]
    project_url = params[:projectUrl]
    level_id = params[:levelId]
    if !channel_id || !project_version || !project_url
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
    session_id = SecureRandom.hex(18)
    payload = {
      iat: issued_at_time,
      iss: CDO.dashboard_hostname,
      exp: expiration_time,
      sid: session_id,
      uid: current_user.id,
      storage_id: storage_id,
      storage_app_id: storage_app_id,
      channel_id: channel_id,
      project_version: project_version,
      project_url: project_url,
      level_id: level_id
    }

    # log payload to firehose
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'java-builder-sessions',
        event: "new-token-created",
        user_id: current_user.id,
        data_json: payload.to_json
      }
    )

    encoded_payload = JWT.encode(
      payload,
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSWORD),
      'RS256'
    )
    render json: {token: encoded_payload, session_id: session_id}
  end
end
