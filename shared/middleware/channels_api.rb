require 'sinatra/base'
require 'cdo/sinatra'
require 'base64'
require 'cdo/db'
require 'cdo/rack/request'

class ChannelsApi < Sinatra::Base
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
        {storage_id: storage_id('user')}
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
      StorageApps.new(storage_id('user')).to_a.to_json
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
  end

  #
  # POST /v3/channels
  #
  # Create a channel.
  #
  # Optional query string param: ?src=<src-channel-id> creates the channel as
  # a copy of the given src channel.
  #
  post '/v3/channels' do
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    src_channel = request.GET['src']
    storage_app = StorageApps.new(storage_id('user'))

    if src_channel
      begin
        data = storage_app.get(src_channel)
      rescue ArgumentError, OpenSSL::Cipher::CipherError
        bad_request
      end
      data['name'] = "Remix: #{data['name']}"
      data['hidden'] = false
      data['frozen'] = false
    else
      begin
        data = JSON.parse(request.body.read)
      rescue JSON::ParserError
        bad_request
      end
      bad_request unless data.is_a? Hash
    end

    timestamp = Time.now

    # The client decides whether to publish the project, but we rely on the
    # server to generate the timestamp. Remove shouldPublish from the project
    # data because it doesn't make sense to persist it.
    published_at = data['shouldPublish'] ? timestamp : nil
    data.delete('shouldPublish')

    id = storage_app.create(
      data.merge('createdAt' => timestamp, 'updatedAt' => timestamp),
      ip: request.ip,
      type: data['projectType'],
      published_at: published_at,
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
      StorageApps.new(storage_id('user')).get(id).to_json
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
      StorageApps.new(storage_id('user')).delete(id)
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

    begin
      value = StorageApps.new(storage_id('user')).update(id, value, request.ip)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
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
    bad_request unless %w(artist playlab applab gamelab).include?(project_type)
    forbidden if under_13? && !%w(artist playlab).include?(project_type)

    # Once we have back-filled the project_type column for all channels,
    # it will no longer be necessary to specify the project type here.
    StorageApps.new(storage_id('user')).publish(channel_id, project_type, current_user).to_json
  end

  #
  # POST /v3/channels/<channel-id>/unpublish
  #
  # Marks the specified channel as no longer published.
  #
  post %r{/v3/channels/([^/]+)/unpublish} do |channel_id|
    not_authorized unless owns_channel?(channel_id)
    StorageApps.new(storage_id('user')).unpublish(channel_id)
    {publishedAt: nil}.to_json
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
  #
  # GET /v3/channels/<channel-id>/abuse
  #
  # Get an abuse score.
  #
  get %r{/v3/channels/([^/]+)/abuse$} do |id|
    dont_cache
    content_type :json
    begin
      value = StorageApps.new(storage_id('user')).get_abuse(id)
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
    begin
      value = StorageApps.new(storage_id('user')).increment_abuse(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end

  #
  # DELETE /v3/channels/<channel-id>/abuse
  #
  # Clear an abuse score. Requires reset_abuse permission
  #
  delete %r{/v3/channels/([^/]+)/abuse$} do |id|
    # UserPermission::RESET_ABUSE
    not_authorized unless has_permission?('reset_abuse')

    dont_cache
    content_type :json
    begin
      value = StorageApps.new(storage_id('user')).reset_abuse(id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      bad_request
    end
    {abuse_score: value}.to_json
  end
  post %r{/v3/channels/([^/]+)/abuse/delete$} do |_id|
    call(env.merge('REQUEST_METHOD' => 'DELETE', 'PATH_INFO' => File.dirname(request.path_info)))
  end
end
