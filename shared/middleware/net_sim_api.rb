require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'
require '../shared/middleware/helpers/redis_property_bag'

class NetSimApi < Sinatra::Base

  helpers do
    %w{
      core.rb
      storage_id.rb
      table.rb
      null_pub_sub_api.rb
      pusher_api.rb
    }.each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end

  end

  # For test, make it possible to override the usual configured API choice
  @@overridden_pub_sub_api = nil

  def initialize(app = nil)
    super(app)
    @redis = create_redis_client
  end

  # Creates a new Redis client.
  # @return [Redis]
  # @private
  def create_redis_client
    Redis.new(host: 'localhost')
  end

  # Returns a property bag for the given shard_id and table_name.
  # @return [RedisPropertyBag]
  def get_props(shard_id, table_name)
    RedisPropertyBag.new(@redis, "#{shard_id}_#{table_name}")
  end

  # Get the Pub/Sub API interface for the current configuration
  def get_pub_sub_api
    return @@overridden_pub_sub_api unless @@overridden_pub_sub_api.nil?
    CDO.use_pusher ? PusherApi : NullPubSubApi
  end

  # Set a particular Pub/Sub API interface to use - for use in tests.
  #
  # @param [PubSubApi] override_api
  def self.override_pub_sub_api_for_test(override_api)
    @@overridden_pub_sub_api = override_api
  end

  def has_json_utf8_headers(request)
    request.content_type.to_s.split(';').first == 'application/json' and
        request.content_charset.to_s.downcase == 'utf-8'
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>
  #
  # Returns all of the rows in the table.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    dont_cache
    content_type :json
    get_props(shard_id, table_name).to_hash.values
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    content_type :json
    get_props(shard_id, table_name)[id]
  end

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  delete %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    props = get_props(shard_id, table_name)
    props.delete(id)
    get_pub_sub_api.publish(shard_id, table_name, {:action => 'delete', :id => id.to_i})
    no_content
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)/delete$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>
  #
  # Insert a new row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    unsupported_media_type unless has_json_utf8_headers(request)

    # Validate JSON body.
    begin
      json = JSON.parse(request.body.read).to_json
    rescue JSON::ParserError
      bad_request
    end

    props = get_props(shard_id, table_name)
    new_row_id = props.increment_counter("row_id")
    props.set(new_row_id, json)
    get_pub_sub_api.publish(shard_id, table_name, {:action => 'insert', :id => new_row_id})

    dont_cache
    content_type :json
    status 201
    new_row_id.to_json
  end

  #
  # PATCH (PUT, POST) /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    unsupported_media_type unless has_json_utf8_headers(request)

    # Validate JSON body.
    begin
      json = JSON.parse(request.body.read).to_json
    rescue JSON::ParserError
      bad_request
    end

    props = get_props(shard_id, table_name)
    props.set(id, json)
    get_pub_sub_api.publish(shard_id, table_name, {:action => 'update', :id => id.to_i})

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

end
