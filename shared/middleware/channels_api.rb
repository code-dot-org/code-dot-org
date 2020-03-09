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
      storage_apps.rb
      storage_id.rb
      auth_helpers.rb
      profanity_privacy_helper.rb
    ).each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
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
      StorageApps.new(get_storage_id).to_a.to_json
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
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    storage_app = StorageApps.new(get_storage_id)

    begin
      _, remix_parent_id = storage_decrypt_channel_id(request.GET['parent']) if request.GET['parent']
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end

    begin
      data = JSON.parse(request.body.read)
    rescue JSON::ParserError
      bad_request
    end
    bad_request unless data.is_a? Hash

    timestamp = Time.now

    published_at = nil

    if data['shouldPublish']
      project_type = data['projectType']
      bad_request unless ALL_PUBLISHABLE_PROJECT_TYPES.include?(project_type)
      forbidden if sharing_disabled? && !ALWAYS_PUBLISHABLE_PROJECT_TYPES.include?(project_type)

      # The client decides whether to publish the project, but we rely on the
      # server to generate the timestamp. Remove shouldPublish from the project
      # data because it doesn't make sense to persist it.
      published_at = timestamp
      data.delete('shouldPublish')
    end

    id = storage_app.create(
      data.merge('createdAt' => timestamp, 'updatedAt' => timestamp),
      ip: request.ip,
      type: data['projectType'],
      published_at: published_at,
      remix_parent_id: remix_parent_id,
    )

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
      StorageApps.new(get_storage_id).get(id).to_json
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
      StorageApps.new(get_storage_id).delete(id)
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
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

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
    project_type = value.delete('projectType')

    begin
      value = StorageApps.new(get_storage_id).update(id, value, request.ip, locale: request.locale, project_type: project_type)
    rescue ArgumentError, OpenSSL::Cipher::CipherError, ProfanityPrivacyError => e
      if e.class == ProfanityPrivacyError
        dont_cache
        status 422
        content_type :json
        return {nameFailure: e.flagged_text}.to_json
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
  # POST /v3/channels/<channel-id>/publish/<project-type>
  #
  # Marks the specified channel as published.
  #
  post %r{/v3/channels/([^/]+)/publish/([^/]+)} do |channel_id, project_type|
    not_authorized unless owns_channel?(channel_id)
    bad_request unless ALL_PUBLISHABLE_PROJECT_TYPES.include?(project_type)
    forbidden if sharing_disabled? && !ALWAYS_PUBLISHABLE_PROJECT_TYPES.include?(project_type)

    # Once we have back-filled the project_type column for all channels,
    # it will no longer be necessary to specify the project type here.
    StorageApps.new(get_storage_id).publish(channel_id, project_type, current_user).to_json
  end

  #
  # POST /v3/channels/<channel-id>/unpublish
  #
  # Marks the specified channel as no longer published.
  #
  post %r{/v3/channels/([^/]+)/unpublish} do |channel_id|
    not_authorized unless owns_channel?(channel_id)
    StorageApps.new(get_storage_id).unpublish(channel_id)
    {publishedAt: nil}.to_json
  end

  #
  # POST /v3/channels/<channel-id>/disable_content_moderation
  #
  # Disables automatic content moderation.
  #
  post %r{/v3/channels/([^/]+)/disable-content-moderation} do |channel_id|
    not_authorized unless project_validator?
    dont_cache
    content_type :json
    begin
      value = StorageApps.new(get_storage_id).set_content_moderation(channel_id, true)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {skip_content_moderation: value}.to_json
  end

  #
  # POST /v3/channels/<channel-id>/enable_content_moderation
  #
  # Enables automatic content moderation.
  #
  post %r{/v3/channels/([^/]+)/enable-content-moderation} do |channel_id|
    not_authorized unless project_validator?
    dont_cache
    content_type :json
    begin
      value = StorageApps.new(get_storage_id).set_content_moderation(channel_id, false)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {skip_content_moderation: value}.to_json
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
    intl_value = language != 'en' ?
      explain_share_failure(id, language) : nil
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
  # Get the ability to share a project based on it's owner's share setting.
  #
  get %r{/v3/channels/([^/]+)/sharing_disabled} do |id|
    dont_cache
    content_type :json
    begin
      value = StorageApps.new(get_storage_id).get_sharing_disabled(id, current_user_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {sharing_disabled: value}.to_json
  end

  #
  #
  # GET /v3/channels/<channel-id>/abuse
  #
  # Get an abuse score.
  #
  get %r{/v3/channels/([^/]+)/abuse$} do |id|
    dont_cache
    content_type :json
    begin
      value = StorageApps.get_abuse(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end

  #
  # POST /v3/channels/<channel-id>/abuse
  #
  # Increment an abuse score
  #
  post %r{/v3/channels/([^/]+)/abuse$} do |id|
    dont_cache
    content_type :json
    # Reports of abuse from verified teachers are more reliable than reports
    # from students so we increase the abuse score enough to block the project
    # with only one report from a verified teacher.
    amount = verified_teacher? ? 20 : 10
    begin
      value = StorageApps.new(get_storage_id).increment_abuse(id, amount)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end

  #
  # POST /v3/channels/<channel-id>/buffer_abuse_score
  #
  # Set an abuse score to -50 to buffer against false
  # reporting. Used for featured projects.
  #
  post %r{/v3/channels/([^/]+)/buffer_abuse_score$} do |id|
    # UserPermission::PROJECT_VALIDATOR
    not_authorized unless project_validator?

    dont_cache
    content_type :json
    begin
      value = StorageApps.new(get_storage_id).buffer_abuse_score(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end

  #
  # DELETE /v3/channels/<channel-id>/abuse
  #
  # Clear an abuse score. Requires project_validator permission
  #
  delete %r{/v3/channels/([^/]+)/abuse$} do |id|
    # UserPermission::PROJECT_VALIDATOR
    not_authorized unless project_validator?

    dont_cache
    content_type :json
    begin
      value = StorageApps.new(get_storage_id).reset_abuse(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end
  post %r{/v3/channels/([^/]+)/abuse/delete$} do |_id|
    call(env.merge('REQUEST_METHOD' => 'DELETE', 'PATH_INFO' => File.dirname(request.path_info)))
  end

  # This method is included here so that it can be stubbed in tests.
  def project_validator?
    has_permission?("project_validator")
  end

  def verified_teacher?
    has_permission?("authorized_teacher")
  end
end
