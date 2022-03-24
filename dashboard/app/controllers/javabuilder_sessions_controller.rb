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
    unless has_required_params?([:channelId])
      return render status: :bad_request, json: {}
    end
    channel_id = params[:channelId]

    session_id = SecureRandom.uuid
    encoded_payload = get_encoded_payload({sid: session_id, channel_id: channel_id})

    level_id = params[:levelId].to_i
    project_files = JavalabFilesHelper.get_project_files(channel_id, level_id)
    upload_project_files_and_render(session_id, project_files, encoded_payload)
  end

  # GET /javabuilder/access_token_with_override_sources
  def get_access_token_with_override_sources
    unless has_required_params?([:overrideSources])
      return render status: :bad_request, json: {}
    end
    override_sources = params[:overrideSources]

    session_id = SecureRandom.uuid
    encoded_payload = get_encoded_payload({sid: session_id})

    level_id = params[:levelId].to_i
    project_files = JavalabFilesHelper.get_project_files_with_override_sources(override_sources, level_id)
    upload_project_files_and_render(session_id, project_files, encoded_payload)
  end

  # GET /javabuilder/access_token_with_override_validation
  def get_access_token_with_override_validation
    unless has_required_params?([:channelId, :overrideValidation])
      return render status: :bad_request, json: {}
    end
    channel_id = params[:channelId]
    override_validation = params[:overrideValidation]

    session_id = SecureRandom.uuid
    encoded_payload = get_encoded_payload({sid: session_id, channel_id: channel_id})

    level_id = params[:levelId].to_i
    project_files = JavalabFilesHelper.get_project_files_with_override_validation(channel_id, level_id, override_validation)
    upload_project_files_and_render(session_id, project_files, encoded_payload)
  end

  private

  def upload_project_files_and_render(session_id, project_files, encoded_payload)
    success = JavalabFilesHelper.upload_project_files(project_files, request.host, encoded_payload)
    success ?
      render(json: {token: encoded_payload, session_id: session_id}) :
      render(status: :internal_server_error, json: {error: "Error uploading sources."})
  end

  def get_encoded_payload(additional_payload)
    teacher_list = get_teacher_list.join(',')
    project_version = params[:projectVersion]
    # TODO: remove project_url after javabuilder is deployed with update to no longer need it
    project_url = params[:projectUrl]
    level_id = params[:levelId]
    options = params[:options]
    execution_type = params[:executionType]
    use_dashboard_sources = 'false'
    mini_app_type = params[:miniAppType]
    options = options ? options.to_json : '{}'

    # Set the IAT a little in the past to account for time drift between environments
    issued_at_time = (Time.now - 5.seconds).to_i
    # expire token in 15 minutes
    expiration_time = (Time.now + 15.minutes).to_i

    payload = {
      iat: issued_at_time,
      iss: CDO.dashboard_hostname,
      exp: expiration_time,
      uid: current_user.id,
      project_version: project_version,
      project_url: project_url,
      level_id: level_id,
      execution_type: execution_type,
      mini_app_type: mini_app_type,
      use_dashboard_sources: use_dashboard_sources,
      options: options,
      verified_teachers: teacher_list
    }.merge(additional_payload)

    log_token_creation(payload)
    create_encoded_payload(payload)
  end

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

  def log_token_creation(payload)
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

  def has_required_params?(additional_params)
    default_params = [:projectVersion, :projectUrl, :executionType, :miniAppType]

    begin
      params.require(default_params.concat(additional_params))
    rescue ActionController::ParameterMissing
      return false
    end

    true
  end
end
