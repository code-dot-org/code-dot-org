require 'sinatra/base'
require 'base64'
require 'cdo/db'
require 'cdo/rack/request'

class ChannelsApi < Sinatra::Base

  helpers do
    [
      'core.rb',
      'storage_apps.rb',
      'storage_id.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  if rack_env?(:staging) || rack_env?(:development)
    get '/v3/channels/debug' do
      dont_cache
      content_type :json
      JSON.pretty_generate({
        storage_id:storage_id('user'),
      })
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
    StorageApps.new(storage_id('user')).to_a.to_json
  end

  #
  # POST /v3/channels
  #
  # Create a channel.
  #
  post '/v3/channels' do
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    begin
      data = JSON.parse(request.body.read)
    rescue JSON::ParserError
      bad_request
    end
    bad_request unless data.is_a? Hash

    timestamp = Time.now
    id = StorageApps.new(storage_id('user')).create(data.merge('createdAt' => timestamp, 'updatedAt' => timestamp), request.ip)

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
    StorageApps.new(storage_id('user')).get(id).to_json
  end

  #
  # DELETE /v3/channels/<channel-id>
  #
  # Deletes a channel by id.
  #
  delete %r{/v3/channels/([^/]+)$} do |id|
    dont_cache
    StorageApps.new(storage_id('user')).delete(id)
    no_content
  end
  post %r{/v3/channels/([^/]+)/delete$} do |name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/channels/<channel-id>
  #
  # Update an existing channel.
  #
  post %r{/v3/channels/([^/]+)$} do |id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = JSON.parse(request.body.read)
    bad_request unless value.is_a? Hash
    value = value.merge('updatedAt' => Time.now)

    StorageApps.new(storage_id('user')).update(id, value, request.ip)

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/channels/([^/]+)$} do |id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/channels/([^/]+)$} do |id|
    call(env.merge('REQUEST_METHOD'=>'PATCH'))
  end
end
