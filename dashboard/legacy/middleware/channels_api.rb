require 'sinatra/base'
require 'cdo/sinatra'
require 'base64'
require 'cdo/db'
require 'cdo/rack/request'
require 'cdo/shared_constants'

class ChannelsApi < Sinatra::Base
  include SharedConstants
  set :mustermann_opts, check_anchors: false, ignore_unknown_options: true

  helpers do
    %w(
      core.rb
      storage_id.rb
    ).each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  helpers do
    %w(
      auth_helpers.rb
      projects.rb
      profanity_privacy_helper.rb
    ).each do |file|
      load(CDO.dir('dashboard', 'legacy', 'middleware', 'helpers', file))
    end
  end

  if rack_env?(:staging) || rack_env?(:development)
    get '/v3/channels/debug' do
      dont_cache
      content_type :json
      JSON.pretty_generate(
        {storage_id: get_storage_id}
      )
    end
  end

  #
  #
  # CHANNELS
  #
  #

  #
  # GET /v3/channels
  #
  # Returns all of the channels registered to the current user
  #
  get '/v3/channels' do
    dont_cache
    content_type :json
    begin
      Projects.new(get_storage_id).to_a.to_json
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
  end

  #
  # POST /v3/channels
  #
  # Create a channel.
  #
  # Optional query string param: ?parent=<remix-parent-channel-id> sets
  # the remix parent of the newly-created channel.
  #
  post '/v3/channels' do
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.casecmp?('utf-8')

    project = Projects.new(get_storage_id)

    begin
      _, remix_parent_id = storage_decrypt_channel_id(request.GET['parent']) if request.GET['parent']
    rescue ArgumentError, OpenSSL::Cipher::CipherError, Projects::ValidationError
      bad_request
    end

    begin
      data = JSON.parse(request.body.read)
    rescue JSON::ParserError
      bad_request
    end
    bad_request unless data.is_a? Hash

    timestamp = Time.now

    begin
      id = project.create(
        data.merge('createdAt' => timestamp, 'updatedAt' => timestamp),
        ip: request.ip,
        type: data['projectType'],
        published_at: nil,
        remix_parent_id: remix_parent_id,
        )
    rescue Projects::ValidationError
      bad_request
    end

    redirect "/v3/channels/#{id}", 301
  end

  #
  # GET /v3/channels/<channel-id>
  #
  # Returns a channel by id.
  #
  get %r{/v3/channels/([^/]+)$} do |id|
    dont_cache
    content_type :json
    begin
      Projects.new(get_storage_id).get(id).to_json
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
  end

  #
  # DELETE /v3/channels/<channel-id>
  #
  # Deletes a channel by id.
  #
  delete %r{/v3/channels/([^/]+)$} do |id|
    dont_cache
    begin
      Projects.new(get_storage_id).delete(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    no_content
  end
  post %r{/v3/channels/([^/]+)/delete$} do |_name|
    call(env.merge('REQUEST_METHOD' => 'DELETE', 'PATH_INFO' => File.dirname(request.path_info)))
  end

  #
  # POST /v3/channels/<channel-id>
  #
  # Update an existing channel.
  #
  post %r{/v3/channels/([^/]+)$} do |id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.casecmp?('utf-8')

    begin
      value = JSON.parse(request.body.read)
    rescue JSON::ParserError
      bad_request
    end
    bad_request unless value.is_a? Hash
    value = value.merge('updatedAt' => Time.now)

    # Set libraryPublishedAt timestamp if we are publishing a project library.
    publish_library = value.delete('publishLibrary')
    value = value.merge('libraryPublishedAt' => Time.now) if publish_library

    # Channels for project-backed levels are created without a project_type. The
    # type is then determined by client-side logic when the project is updated.
    project_type = value["projectType"]

    begin
      value = Projects.new(get_storage_id).update(id, value, request.ip, locale: request.locale, project_type: project_type)
    rescue ArgumentError, OpenSSL::Cipher::CipherError, ProfanityPrivacyError, Projects::ValidationError => exception
      if exception.instance_of?(ProfanityPrivacyError)
        dont_cache
        status 422
        content_type :json
        return {nameFailure: exception.flagged_text}.to_json
      else
        bad_request
      end
    end

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/channels/([^/]+)$} do |_id|
    call(env.merge('REQUEST_METHOD' => 'POST'))
  end
  put %r{/v3/channels/([^/]+)$} do |_id|
    call(env.merge('REQUEST_METHOD' => 'PATCH'))
  end

  #
  # GET /v3/channels/<channel-id>/privacy-profanity
  #
  # Get an indication of privacy/profanity violation.
  #
  get %r{/v3/channels/([^/]+)/privacy-profanity} do |id|
    dont_cache
    content_type :json

    value = channel_policy_violation?(id)
    {has_violation: value}.to_json
  end

  #
  # GET /v3/channels/<channel-id>/share-failure
  #
  # Get an indication of why a project can't be shared.
  #
  get %r{/v3/channels/([^/]+)/share-failure} do |id|
    dont_cache
    content_type :json
    language = request.language

    value = explain_share_failure(id)
    intl_value = language == 'en' ?
      nil : explain_share_failure(id, language)
    {
      share_failure: value,
      intl_share_failure: intl_value,
      language: language
    }.to_json
  end

  #
  #
  # GET /v3/channels/<channel-id>/sharing_disabled
  #
  # Get the ability to share a project based on its owner's share setting.
  #
  get %r{/v3/channels/([^/]+)/sharing_disabled} do |id|
    dont_cache
    content_type :json
    begin
      value = Projects.new(get_storage_id).get_sharing_disabled(id, current_user_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {sharing_disabled: value}.to_json
  end

  #
  # GET /v3/channels/<channel-id>/is_teacher_of_project_owner
  #
  # Get if the current user is a teacher of the project owner.
  #
  get %r{/v3/channels/([^/]+)/is_teacher_of_project_owner} do |id|
    dont_cache
    content_type :json
    begin
      value = Projects.new(get_storage_id).get_is_teacher_of_project_owner(id, current_user_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {is_teacher_of_project_owner: value}.to_json
  end

  #
  # GET /v3/channels/<channel-id>/abuse
  #
  # Get an abuse score.
  #
  # Moved to ReportAbuseController.
  #

  #
  # POST /v3/channels/<channel-id>/abuse
  #
  # Increment an abuse score
  #
  # API endpoint removed. Functionality moved to ReportAbuseController.
  #

  #
  # DELETE /v3/channels/<channel-id>/abuse
  #
  # Clear an abuse score. Requires project_validator permission
  #
  # Moved to ReportAbuseController.
  #

  # This method is included here so that it can be stubbed in tests.
  def project_validator?
    has_permission?("project_validator")
  end

  def verified_teacher?
    has_permission?("authorized_teacher")
  end
end
