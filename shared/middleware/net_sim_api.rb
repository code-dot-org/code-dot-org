require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'cgi'
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

  NODE_TYPES = {
      client: 'client',
      router: 'router'
  }

  VALIDATION_ERRORS = {
      malformed: 'malformed',
      conflict: 'conflict',
      limit_reached: 'limit_reached'
  }

  helpers do
    %w{
      core.rb
      auth_helpers.rb
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
    RedisTable.new(get_redis_client, get_pub_sub_api, shard_id, table_name,
                   CDO.netsim_shard_expiry_seconds)
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

  # GET /v3/netsim/<shard-id>/<table-name>@<min_id>
  #
  # Returns all of the rows in the table with id >= min_id
  #
  get %r{/v3/netsim/([^/]+)/(\w+)@([0-9]+)$} do |shard_id, table_name, min_id|
    dont_cache
    content_type :json
    get_table(shard_id, table_name).to_a_from_min_id(min_id.to_i).to_json
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

  # GET /v3/netsim/<shard-id>?t[]=<table1>@<id1>&t[]=<table2>@<id2>&...
  #
  # Fetches rows in multiple tables starting a given version for each table, specified
  # via query string parameters of the form "t[]=<table>@<min_id>"
  #
  get %r{/v3/netsim/([^/]+)$} do |shard_id|
    dont_cache
    content_type :json
    table_map = parse_table_map_from_query_string(CGI::unescape(request.query_string))
    RedisTable.get_tables(get_redis_client, shard_id, table_map).to_json
  end

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    content_type :json
    delete_many(shard_id, table_name, [id.to_i])
    no_content
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)/delete$} do |_shard_id, _table_name, _id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>?id[]=<id1>&id[]=<id2>&...
  #
  # Deletes multiple rows by id.
  #
  delete %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    dont_cache
    content_type :json
    ids = parse_ids_from_query_string(CGI::unescape(request.query_string))
    delete_many(shard_id, table_name, ids)
    no_content
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>/delete?id[]=<id1>&id[]=<id2>&...
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/delete$} do |_shard_id, _table_name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # DELETE /v3/netsim/<shard-id>
  #
  # Deletes the entire shard.
  #
  delete %r{/v3/netsim/([^/]+)$} do |shard_id|
    dont_cache
    not_authorized unless allowed_to_delete_shard? shard_id
    RedisTable.reset_shard(shard_id, get_redis_client, get_pub_sub_api)
    no_content
  end

  # @param [String] shard_id - The shard we're checking delete permission for.
  # @return [Boolean] Always true if current user is an admin; also true if the
  #         current user is the teacher who owns the shard indicated by the
  #         shard_id parameter.
  def allowed_to_delete_shard?(shard_id)
    admin? || owns_shard?(shard_id)
  end

  # @param [String] shard_id - The shard we're checking ownership for.
  # @return [Boolean] True if the current user is the teacher who owns the
  #         shard indicated by the shard_id parameter.
  def owns_shard?(shard_id)
    # Not great, but passable: A shard ID matching /_(\d+)$/ is considered to
    # be associated with the section having the captured integer ID.
    # This means there are cases where custom section IDs (?s= URLs) might be
    # owned by teachers that have nothing to do with them.
    # This is acceptable for now - there should be no expectation of security
    # on custom shard IDs, and it's not particularly harmful to reset a shard.
    match_result = /_(\d+)$/.match(shard_id)
    section_id = match_result.nil? ? nil : match_result[1].to_i
    owns_section? section_id
  end

  #
  # POST /v3/netsim/<shard-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/netsim/([^/]+)/delete$} do |_shard_id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/netsim/<shard-id>/<table-name>
  #
  # Insert a new row or rows.
  # Accepts a JSON request body of either an Object if inserting a
  # single row or an Array of Objects if inserting multiple rows
  #
  # Examples:
  #
  # POST "{ 'name': 'alice', 'male': false }"
  # -> 201 "{ 'name': 'alice', 'male': false, 'id': 1 }"
  #
  # POST "[{ 'name': 'nancy', 'male': false }, { 'name': 'drew', 'male': true }]"
  # -> 201 "[{ 'name': 'nancy', 'male': false, 'id': 2 }, { 'name': 'drew', 'male': true, 'id': 3 }]"
  #
  post %r{/v3/netsim/([^/]+)/(\w+)$} do |shard_id, table_name|
    dont_cache
    unsupported_media_type unless has_json_utf8_headers?(request)

    # Parse JSON
    begin
      body = JSON.parse(request.body.read)
    rescue JSON::ParserError
      json_bad_request(VALIDATION_ERRORS[:malformed])
    end

    # Determine whether or not we are performing a multi-insert and
    # normalize our request body into an array of values
    multi_insert = body.is_a?(Array)
    values = multi_insert ? body : [body]

    validation_errors = validate_all(shard_id, table_name, values)
    unless validation_errors.none?
      error_details = multi_insert ? validation_errors : validation_errors.first
      json_bad_request(error_details)
    end

    # If we get all the way down here without errors, insert everything
    table = get_table(shard_id, table_name)
    result = values.map { |value| table.insert(value, request.ip) }

    # Finally, if we are not performing a multi-insert, denormalize our
    # return value to a single item
    result = result[0] unless multi_insert

    dont_cache
    content_type :json
    status 201
    result.to_json
  end

  def validate_all(shard_id, table_name, values)
    values.map { |value| validate_one(shard_id, table_name, value) }
  end

  # @param [String] shard_id - The shard we're checking validation on.
  # @param [String] table_name - The table we're validating for
  # @param [Hash] value - The value we're validating
  # @return [String] a validation error, or nil if no problems were found
  def validate_one(shard_id, table_name, value)
    return VALIDATION_ERRORS[:malformed] unless value.is_a? Hash
    case table_name
      when TABLE_NAMES[:node]
        validate_node(shard_id, value)
      when TABLE_NAMES[:message]
        validate_message(shard_id, value)
      when TABLE_NAMES[:wire]
        validate_wire(shard_id, value)
      else
        nil
    end
  end

  # @param [String] shard_id - The shard we're checking validation on.
  # @param [Hash] node - The new node we are validating
  # @return [String] a validation error, or nil if no problems were found
  def validate_node(shard_id, node)
    case node['type']
      when NODE_TYPES[:router] then validate_router(shard_id, node)
      when NODE_TYPES[:client] then nil
      else VALIDATION_ERRORS[:malformed]
    end
  end

  # Makes sure the router has a routerNumber and will not cause the shard
  # to exceed the router limit.
  # @param [String] shard_id - The shard we're checking validation on
  # @param [Hash] router - The new router we are validating
  # @return [String] a validation error, or nil if no problems were found
  def validate_router(shard_id, router)
    return VALIDATION_ERRORS[:malformed] unless router.has_key?('routerNumber')
    existing_routers = get_table(shard_id, TABLE_NAMES[:node]).
        to_a.select {|x| x['type'] == NODE_TYPES[:router]}

    # Check for routerNumber collisions and router limits
    return VALIDATION_ERRORS[:limit_reached] unless existing_routers.count < CDO.netsim_max_routers
    return VALIDATION_ERRORS[:conflict] if existing_routers.any? {|x| x['routerNumber'] == router['routerNumber']}
    nil
  end

  # Makes sure the message owner node exists.
  # @param [String] shard_id - The shard we're checking validation on.
  # @param [Hash] message - The message we're validating
  # @return [String] a validation error, or nil if no problems were found
  def validate_message(shard_id, message)
    # TODO validate the base64
    # TODO this is wildly inefficient, particularly when validating
    # multi-insert messages
    node_exists = get_table(shard_id, TABLE_NAMES[:node]).to_a.any? do |node|
      node['id'] == message['simulatedBy']
    end

    return VALIDATION_ERRORS[:conflict] unless node_exists
    nil
  end

  # Makes sure an existing wire does not already define the same directed connection.
  # @param [String] shard_id - The shard we're checking validation on.
  # @param [Hash] wire - The wire we're validating.
  # @return [String] a validation error, or nil if no problems were found
  def validate_wire(shard_id, wire)
    # Check for another wire between the same nodes in the same direction.
    wire_already_exists = get_table(shard_id, TABLE_NAMES[:wire]).to_a.any? do |stored_wire|
      stored_wire['localNodeID'] == wire['localNodeID'] && stored_wire['remoteNodeID'] == wire['remoteNodeID']
    end
    return VALIDATION_ERRORS[:conflict] if wire_already_exists
    nil
  end

  #
  # PATCH (PUT, POST) /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    unsupported_media_type unless has_json_utf8_headers?(request)

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
  patch %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |_shard_id, _table_name, _id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |_shard_id, _table_name, _id|
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
    @@overridden_redis || Redis.new(url: redis_url)
  end

  # Returns the URL (configuration string) of the redis service in the current
  # configuration.  Should be passed as the :url parameter in the options hash
  # to Redis.new.
  #
  # @return [String]
  def redis_url
    CDO.geocoder_redis_url || 'redis://localhost:6379'
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
  def has_json_utf8_headers?(request)
    request.content_type.to_s.split(';').first == 'application/json' &&
        request.content_charset.to_s.downcase == 'utf-8'
  end

  # Perform delete operation, potentially on multiple rows at once,
  # respecting cascading delete rules and producing as few invalidations
  # as possible.
  #
  # @private
  # @param [String] shard_id
  # @param [String] table_name
  # @param [Array<String>] ids
  def delete_many(shard_id, table_name, ids)
    if table_name == TABLE_NAMES[:node]
      # Cascade deletions
      delete_wires_for_nodes(shard_id, ids)
      delete_messages_for_nodes(shard_id, ids)
    end
    table = get_table(shard_id, table_name)
    table.delete(ids)
  end

  # Delete all wires associated with (locally or remotely) a given node_id
  #
  # @private
  # @param [String] shard_id
  # @param [Array<Integer>] node_ids
  def delete_wires_for_nodes(shard_id, node_ids)
    wire_table = get_table(shard_id, TABLE_NAMES[:wire])
    wire_ids = wire_table.to_a.select {|wire|
      node_ids.any? { |node_id|
        wire['localNodeID'] == node_id || wire['remoteNodeID'] == node_id
      }
    }.map {|wire|
      wire['id']
    }
    wire_table.delete(wire_ids) unless wire_ids.empty?
  end

  # Delete all messages simulated by a given node_id
  #
  # @private
  # @param [String] shard_id
  # @param [Array<Integer>] node_ids
  def delete_messages_for_nodes(shard_id, node_ids)
    message_table = get_table(shard_id, TABLE_NAMES[:message])
    message_ids = message_table.to_a.select {|message|
      node_ids.member? message['simulatedBy']
    }.map {|message|
      message['id']
    }
    message_table.delete(message_ids) unless message_ids.empty?
  end

end

# Convert a query_string of the form "t[]=table1@1&t[]=table2@1" into a
# table map as expected by RedisTable.get_tables(). Id numbers
# can be omitted in which case they default to 0.
#
# @param [String] query_string
# @return [Hash<String, Integer>]
# @private
def parse_table_map_from_query_string(query_string)
  {}.tap do |result|
    CGI::parse(query_string)['t[]'].each do |tv|
      table, min_id = tv.split('@')
      result[table] = min_id.to_i  # defaults to 0 for invalid ints.
    end
  end
end

# Convert a query string of the form "id[]=1&id[]=2" into an array of integer
# ids as expected by RedisTable.delete().  Noninteger ids in the query
# are simply omitted from the result.
def parse_ids_from_query_string(query_string)
  [].tap do |ids|
    CGI::parse(query_string)['id[]'].each do |id|
      ids << Integer(id, 10) rescue ArgumentError
    end
  end
end
