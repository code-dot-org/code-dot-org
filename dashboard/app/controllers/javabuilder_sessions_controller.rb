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

  # POST /javabuilder/access_token_with_override_sources
  def access_token_with_override_sources
    unless has_required_params?([:overrideSources])
      return render status: :bad_request, json: {}
    end
    override_sources = params[:overrideSources]
    # channel id is not required but can be included in order to retrieve assets
    channel_id = params[:channelId]

    session_id = SecureRandom.uuid
    encoded_payload = get_encoded_payload({sid: session_id})

    level_id = params[:levelId].to_i
    project_files = JavalabFilesHelper.get_project_files_with_override_sources(override_sources, level_id, channel_id)
    upload_project_files_and_render(session_id, project_files, encoded_payload)
  end

  # POST /javabuilder/access_token_with_override_validation
  def access_token_with_override_validation
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

  private def upload_project_files_and_render(session_id, project_files, encoded_payload)
    if can?(:use_unrestricted_javabuilder, :javabuilder_session)
      javabuilder_url = CDO.javabuilder_url
      javabuilder_upload_url = CDO.javabuilder_upload_url
    else
      if !current_user.last_verified_captcha_at || (Time.now.utc - 24.hours) > current_user.last_verified_captcha_at
        return render(status: :forbidden, json: {captcha_required: true})
      end
      javabuilder_url = CDO.javabuilder_demo_url
      javabuilder_upload_url = CDO.javabuilder_demo_upload_url
    end

    response = JavalabFilesHelper.upload_project_files(project_files, request.host, encoded_payload, javabuilder_upload_url)
    if response
      return render(json: {token: encoded_payload, session_id: session_id, javabuilder_url: javabuilder_url}) if response.code == '200'
      return render(status: response.code, json: response.body)
    else
      return render(status: :internal_server_error, json: {error: "Error uploading sources."})
    end
  end

  private def get_encoded_payload(additional_payload)
    teacher_list = get_teacher_list.join(',')
    level_id = params[:levelId]
    options = params[:options]
    execution_type = params[:executionType]
    mini_app_type = params[:miniAppType]
    options = options ? options.to_json : '{}'
    can_access_dashboard_assets = !rack_env?(:development)

    # Set the IAT a little in the past to account for time drift between environments
    issued_at_time = (Time.now - 5.seconds).to_i
    # expire token in 1 minute
    expiration_time = (Time.now + 1.minute).to_i

    # Note: the attribute name "verified_teachers" is now a misnomer,
    # as we need to include any logged in teacher's user ID in this list
    # in order to support javabuilder "eval" mode,
    # which gives limited access to teachers testing out Javalab.
    payload = {
      iat: issued_at_time,
      iss: CDO.dashboard_hostname,
      exp: expiration_time,
      uid: current_user.id,
      level_id: level_id,
      execution_type: execution_type,
      mini_app_type: mini_app_type,
      options: options,
      verified_teachers: teacher_list,
      can_access_dashboard_assets: can_access_dashboard_assets
    }.merge(additional_payload)

    log_token_creation(payload)
    create_encoded_payload(payload)
  end

  private def get_teacher_list
    if current_user.teacher?
      return [current_user.id]
    end
    teachers = []
    current_user.sections_as_student.each do |section|
      next unless section.assigned_csa? && section.teacher&.verified_instructor?
      teachers << section.teacher.id
    end
    teachers.uniq
  end

  private def log_token_creation(payload)
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

  private def create_encoded_payload(payload)
    JWT.encode(
      payload,
      OpenSSL::PKey::RSA.new(PRIVATE_KEY, PASSWORD),
      'RS256'
    )
  end

  private def has_required_params?(additional_params)
    default_params = [:executionType, :miniAppType]

    begin
      params.require(default_params.concat(additional_params))
    rescue ActionController::ParameterMissing
      return false
    end

    true
  end
end
