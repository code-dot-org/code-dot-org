require 'sinatra/base'
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
    ).each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  if rack_env?(:staging) || rack_env?(:development)
    get '/v3/channels/debug' do
      dont_cache
      content_type :json
      JSON.pretty_generate({
        storage_id: storage_id('user'),
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
  # Optional query string param: ?src=<src-channel-id> creates the channel as
  # a copy of the given src channel.
  #
  post '/v3/channels' do
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    src_channel = request.GET['src']
    storage_app = StorageApps.new(storage_id('user'))

    if src_channel
      data = storage_app.get(src_channel)
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
    id = storage_app.create(data.merge('createdAt' => timestamp, 'updatedAt' => timestamp), request.ip)

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
  post %r{/v3/channels/([^/]+)/delete$} do |_name|
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

    value = StorageApps.new(storage_id('user')).update(id, value, request.ip)

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/channels/([^/]+)$} do |_id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/channels/([^/]+)$} do |_id|
    call(env.merge('REQUEST_METHOD'=>'PATCH'))
  end

  #
  # GET /v3/channels/<channel-id>/abuse
  #
  # Get an abuse score.
  #
  get %r{/v3/channels/([^/]+)/abuse$} do |id|
    dont_cache
    content_type :json

    value = StorageApps.new(storage_id('user')).get_abuse(id)
    {:abuse_score => value }.to_json
  end

  #
  # POST /v3/channels/<channel-id>/abuse
  #
  # Increment an abuse score
  #
  post %r{/v3/channels/([^/]+)/abuse$} do |id|
    dont_cache
    content_type :json

    value = StorageApps.new(storage_id('user')).increment_abuse(id)
    {:abuse_score => value }.to_json
  end

  #
  # DELETE /v3/channels/<channel-id>/abuse
  #
  # Clear an abuse score. Admin only.
  #
  delete %r{/v3/channels/([^/]+)/abuse$} do |id|
    not_authorized unless admin?

    dont_cache
    content_type :json

    value = StorageApps.new(storage_id('user')).reset_abuse(id)
    {:abuse_score => value }.to_json
  end
  post %r{/v3/channels/([^/]+)/abuse/delete$} do |_id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end
end
