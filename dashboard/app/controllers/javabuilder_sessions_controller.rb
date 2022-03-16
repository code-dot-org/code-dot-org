require 'jwt'
require 'securerandom' unless defined?(SecureRandom)
require 'cdo/firehose'

class JavabuilderSessionsController < ApplicationController
  include JavalabFilesHelper
  authorize_resource class: false

  PRIVATE_KEY = CDO.javabuilder_private_key
  PASSWORD = CDO.javabuilder_key_password
  CSA_PILOT = 'csa-pilot'
  CSA_PILOT_FACILITATORS = 'csa-pilot-facilitators'

  # GET /javabuilder/access_token
  def get_access_token
    channel_id = params[:channelId]
    unless channel_id
      return render status: :bad_request, json: {}
    end

    begin
      storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return render status: :bad_request, json: {}
    end

    session_id = SecureRandom.uuid
    payload = get_shared_payload(session_id)
    channel_specific_payload = {
      channel_id: channel_id,
      storage_id: storage_id,
      storage_app_id: storage_app_id
    }
    payload.merge! channel_specific_payload

    log_token_creation
    encoded_payload = create_encoded_payload(payload)

    if use_dashboard_sources == 'false'
      success = JavalabFilesHelper.upload_project_files(channel_id, level_id, request.host, encoded_payload)
      return render status: :internal_server_error, json: {error: "Error uploading sources."} unless success
    end

    render json: {token: encoded_payload, session_id: session_id}
  end

  def get_access_token_provided_sources
    # require levelbuilder

    override_sources = params[:overrideSources]
    unless override_sources
      return render status: :bad_request, json: {}
    end

    session_id = SecureRandom.uuid
    payload = get_shared_payload(session_id)

    log_token_creation
    encoded_payload = create_encoded_payload(payload)

    # add in uploading of project files here
    # update return value here
    return encoded_payload
  end

  private

  def get_teacher_list
    if current_user.permission?(UserPermission::LEVELBUILDER) ||
        current_user.verified_teacher? ||
        current_user.has_pilot_experiment?(CSA_PILOT) ||
        current_user.has_pilot_experiment?(CSA_PILOT_FACILITATORS)
      return [current_user.id]
    end
    teachers = []
    current_user.teachers.each do |teacher|
      next unless teacher.verified_teacher? ||
          teacher.has_pilot_experiment?(CSA_PILOT) ||
          teacher.has_pilot_experiment?(CSA_PILOT_FACILITATORS)
      teachers << teacher.id
    end
    teachers
  end

  def get_shared_payload(session_id)
    teacher_list = get_teacher_list.join(',')
    project_version = params[:projectVersion]
    # TODO: remove project_url after javabuilder is deployed with update to no longer need it
    project_url = params[:projectUrl]
    level_id = params[:levelId]
    options = params[:options]
    execution_type = params[:executionType]
    use_dashboard_sources = params[:useDashboardSources]
    mini_app_type = params[:miniAppType]
    options = options ? options.to_json : '{}'
    if !project_version || !project_url || !execution_type || !mini_app_type
      return render status: :bad_request, json: {}
    end

    issued_at_time = Time.now.to_i
    # expire token in 15 minutes
    expiration_time = (Time.now + 15.minutes).to_i
    shared_payload = {
      iat: issued_at_time,
      iss: CDO.dashboard_hostname,
      exp: expiration_time,
      sid: session_id,
      uid: current_user.id,
      project_version: project_version,
      project_url: project_url,
      level_id: level_id,
      execution_type: execution_type,
      mini_app_type: mini_app_type,
      use_dashboard_sources: use_dashboard_sources,
      options: options,
      verified_teachers: teacher_list
    }

    shared_payload
  end

  def log_token_creation
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'java-builder-sessions',
        event: "new-token-created",
        user_id: current_user.id,
        data_json: payload.to_json
      }
    )
  end

  def create_encoded_payload(payload)
    JWT.encode(
      payload,
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSWORD),
      'RS256'
    )
  end
end
