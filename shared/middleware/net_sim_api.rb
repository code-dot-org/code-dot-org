require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'
require_relative '../middleware/helpers/redis_table'
require_relative '../middleware/channels_api'

# NetSimApi implements a rest service for interacting with NetSim tables.
class NetSimApi < Sinatra::Base

  TABLE_NAMES = {
      node: 'n',
      wire: 'w',
      message: 'm',
      log: 'l'
  }

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

  # For test, make it possible to override the usual configured API choices.
  @@overridden_pub_sub_api = nil
  @@overridden_redis = nil

  def initialize(app = nil)
    super(app)
  end

  # Return a new RedisTable instance for the given shard_id and table_name.
  def get_table(shard_id, table_name)
    RedisTable.new(get_redis_client, get_pub_sub_api, shard_id, table_name)
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>
  #
  # Returns all of the rows in the table.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    dont_cache
    content_type :json
    get_table(shard_id, table_name).to_a.to_json
  end

  #
  # GET /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    content_type :json
    get_table(shard_id, table_name).fetch(id.to_i).to_json
  end

  # Delete all wires associated with (locally or remotely) a given node_id
  #
  # @private
  # @param [String] shard_id
  # @param [Integer] node_id
  # @returns [Integer|Array] ids of deleted wires
  def delete_wires_for_node(shard_id, node_id)
    wire_table = get_table(shard_id, TABLE_NAMES[:wire])
    wire_ids = wire_table.to_a.select {|wire|
      wire['localNodeID'] == node_id or wire['remoteNodeID'] == node_id
    }.map {|wire|
      wire['id']
    }
    wire_ids.each do |wire_id|
      wire_table.delete(wire_id)
    end
    wire_ids
  end

  # Delete all messages simulated by a given node_id
  #
  # @private
  # @param [String] shard_id
  # @param [Integer] node_id
  # @returns [Integer|Array] ids of deleted messages
  def delete_messages_for_node(shard_id, node_id)
    message_table = get_table(shard_id, TABLE_NAMES[:message])
    message_ids = message_table.to_a.select {|message|
      message['simulatedBy'] == node_id
    }.map {|message|
      message['id']
    }
    message_ids.each do |message_id|
      message_table.delete(message_id)
    end
    message_ids
  end

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    table = get_table(shard_id, table_name)
    int_id = id.to_i

    if table_name == TABLE_NAMES[:node]
      # Cascade deletions
      delete_wires_for_node(shard_id, int_id)
      delete_messages_for_node(shard_id, int_id)
    end

    table.delete(int_id)
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
    dont_cache
    unsupported_media_type unless has_json_utf8_headers(request)

    begin
      value = get_table(shard_id, table_name).
          insert(JSON.parse(request.body.read), request.ip)
      if table_name == TABLE_NAMES[:message]
        node_exists = get_table(shard_id, TABLE_NAMES[:node]).to_a.any? do |node|
          node['id'] == value['simulatedBy']
        end
        unless node_exists
          get_table(shard_id, table_name).delete(value['id'])
          json_bad_request
        end
      end
    rescue JSON::ParserError
      json_bad_request
    end

    dont_cache
    content_type :json
    status 201
    value.to_json
  end

  #
  # PATCH (PUT, POST) /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    unsupported_media_type unless has_json_utf8_headers(request)

    begin
      table = get_table(shard_id, table_name)
      int_id = id.to_i
      value = table.update(int_id, JSON.parse(request.body.read), request.ip)
    rescue JSON::ParserError
      json_bad_request
    end

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

  # TEST-ONLY METHODS

  # Set a particular Pub/Sub interface to use - for use in tests.
  #
  # @param [PubSubApi] override_api
  def self.override_pub_sub_api_for_test(override_api)
    @@overridden_pub_sub_api = override_api
  end

  # Set a particular Redis interface to use - for use in tests.
  #
  # @param [Redis] override_redis
  def self.override_redis_for_test(override_redis)
    @@overridden_redis = override_redis
  end


  private

  # Returns a new Redis client for the current configuration.
  #
  # @return [Redis]
  def get_redis_client
    @@overridden_redis || Redis.new(host: redis_host)
  end

  # Returns the host name of the redis service in the current
  # configuration.
  #
  # @return [String]
  def redis_host
    CDO.geocoder_redis_url || 'localhost'
  end

  # Get the Pub/Sub API interface for the current configuration
  #
  # @return [PusherApi]
  def get_pub_sub_api
    return @@overridden_pub_sub_api unless @@overridden_pub_sub_api.nil?
    CDO.use_pusher ? PusherApi : NullPubSubApi
  end

  # Return true if the request's content type is application/json and charset
  # is utf-8.
  #
  # @param [Request] request
  # @return [Boolean]
  def has_json_utf8_headers(request)
    request.content_type.to_s.split(';').first == 'application/json' and
        request.content_charset.to_s.downcase == 'utf-8'
  end

end
