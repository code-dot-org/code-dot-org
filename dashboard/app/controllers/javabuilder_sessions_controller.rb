require 'jwt'
require 'securerandom' unless defined?(SecureRandom)
require 'cdo/firehose'
require 'cdo/aws/s3'
require 'zip'
require "net/http"

class JavabuilderSessionsController < ApplicationController
  authorize_resource class: false

  PRIVATE_KEY = CDO.javabuilder_private_key
  PASSWORD = CDO.javabuilder_key_password

  # GET /javabuilder/access_token
  def get_access_token
    start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
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

    if params[:uploadZip] == 'true'
      upload_contents(storage_id, storage_app_id, level_id, encoded_payload)
    end

    end_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    elapsed_s = end_time - start_time
    puts "Javabuilder get_access_token time: #{elapsed_s} seconds"
    render json: {token: encoded_payload, session_id: session_id, elapsed_time_s: elapsed_s, uploaded_zip: params[:uploadZip] == 'true'}
  end

  private def upload_contents(storage_id, storage_app_id, level_id, encoded_payload)
    zipfileio = get_content_zip_file(storage_id, storage_app_id, level_id)
    puts "Finished creating zip file"

    upload_url = get_upload_url(encoded_payload)
    upload_zip_file(zipfileio, upload_url)
  end

  private def get_content_zip_file(storage_id, storage_app_id, level_id)
    puts "Attempting to create zip file"

    s3 = AWS::S3.create_client
    level = Level.find(level_id)
    files = {}

    sources = {}
    # Sources
    main_json = s3.get_object(
      bucket: CDO.sources_s3_bucket,
      key: "#{CDO.sources_s3_directory}/#{storage_id}/#{storage_app_id}/main.json"
    )
    sources["main.json"] = main_json.body.string

    # Maze
    serialized_maze = level.try(:get_serialized_maze)
    if serialized_maze
      sources["grid.txt"] = serialized_maze.to_json.to_s
    end

    files["sources"] = sources

    assets = {}
    # Assets
    assets_src_prefix = "#{CDO.assets_s3_directory}/#{storage_id}/#{storage_app_id}/"
    s3.list_objects(bucket: CDO.assets_s3_bucket, prefix: assets_src_prefix).contents.map do |fileinfo|
      filename = %r{#{assets_src_prefix}(.+)$}.match(fileinfo.key)[1]
      file = s3.get_object(
        bucket: CDO.assets_s3_bucket,
        key: fileinfo.key
      )
      assets[filename] = file.body.string
    end

    # Starter Assets
    (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, uuid_name|
      src_key = "starter_assets/#{uuid_name}"
      file = s3.get_object(
        bucket: CDO.assets_s3_bucket,
        key: src_key
      )
      assets[friendly_name] = file.body.string
    end

    files["assets"] = assets

    stringio = Zip::OutputStream.write_buffer do |zio|
      files.each do |type, subfiles|
        subfiles.each do |filename, file|
          zio.put_next_entry(type + "/" + filename)
          zio.write(file)
        end
      end
    end

    # stringio.rewind
    # File.new("contents.zip", "wb").write(stringio.sysread)
    return stringio
  end

  private def get_upload_url(encoded_payload)
    puts "Getting upload URL"
    uri = URI.parse("https://yeq20yx619.execute-api.us-east-1.amazonaws.com/test?Authorization=#{encoded_payload}")
    p uri
    get_request = Net::HTTP::Get.new(uri)
    get_request['Origin'] = request.host
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(get_request)
    end
    p response
    p response.body
    return response.body
  end

  private def upload_zip_file(zipfileio, upload_url)
    puts "Uploading zip file"
    uri = URI.parse(upload_url)

    upload_request = Net::HTTP::Put.new(uri)
    upload_request['Content-Type'] = "application/zip"
    upload_request.body = zipfileio.string

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(upload_request)
    end
    p response
    puts "Finished uploading zip"
  end
end
