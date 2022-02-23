require 'jwt'
require 'securerandom' unless defined?(SecureRandom)
require 'cdo/firehose'

class JavabuilderSessionsController < ApplicationController
  include JavalabFilesHelper
  authorize_resource class: false

  PRIVATE_KEY = CDO.javabuilder_private_key
  PASSWORD = CDO.javabuilder_key_password

  # GET /javabuilder/access_token
  def get_access_token
    channel_id = params[:channelId]
    project_version = params[:projectVersion]
    # TODO: remove project_url after javabuilder is deployed with update to no longer need it
    project_url = params[:projectUrl]
    level_id = params[:levelId]
    options = params[:options]
    execution_type = params[:executionType]
    use_dashboard_sources = params[:useDashboardSources]
    mini_app_type = params[:miniAppType]
    options = options ? options.to_json : '{}'
    if !channel_id || !project_version || !project_url || !execution_type || !mini_app_type
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
      level_id: level_id,
      execution_type: execution_type,
      mini_app_type: mini_app_type,
      use_dashboard_sources: use_dashboard_sources,
      options: options
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

    if use_dashboard_sources == 'false'
      success = JavalabFilesHelper.upload_project_files(channel_id, level_id, encoded_payload)
      return render status: :internal_server_error, json: {error: "Error uploading sources."} unless success
    end

    render json: {token: encoded_payload, session_id: session_id}
  end
end
