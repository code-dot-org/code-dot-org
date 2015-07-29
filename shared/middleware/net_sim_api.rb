require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'

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

  # For test, make it possible to override the usual configured API choice
  @@overridden_pub_sub_api = nil

  TableType = CDO.use_dynamo_tables ? DynamoTable : Table

  def get_table(shard_id, table_name)
    # Table name within channels API just concatenates shard + table
    api_table_name = "#{shard_id}_#{table_name}"
    TableType.new(CDO.netsim_api_publickey, nil, api_table_name)
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
  # @param [String] shard_id
  # @param [Integer] node_id
  def delete_wires_for_node(shard_id, node_id)
    wire_table = get_table(shard_id, TABLE_NAMES[:wire])
    wire_ids = wire_table.to_a.select do |wire|
      wire['localNodeID'] == node_id or wire['remoteNodeID'] == node_id
    end.map do |wire|
      wire['id']
    end
    wire_ids.each do |wire_id|
      wire_table.delete(wire_id)
    end
    wire_ids
  end

  # Delete all messages simulated by a given node_id
  #
  # @param [String] shard_id
  # @param [Integer] node_id
  def delete_messages_for_node(shard_id, node_id)
    message_table = get_table(shard_id, TABLE_NAMES[:message])
    message_ids = message_table.to_a.select do |message|
      message['simulatedBy'] == node_id
    end.map do |message|
      message['id']
    end
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
      wire_ids = delete_wires_for_node(shard_id, int_id)
      message_ids = delete_messages_for_node(shard_id, int_id)

      unless wire_ids.empty?
        get_pub_sub_api.publish(shard_id, TABLE_NAMES[:wire], {:action => 'delete_many', :ids => wire_ids})
      end

      unless message_ids.empty?
        get_pub_sub_api.publish(shard_id, TABLE_NAMES[:message], {:action => 'delete_many', :ids => message_ids})
      end
    end

    table.delete(int_id)
    get_pub_sub_api.publish(shard_id, table_name, {:action => 'delete', :id => int_id})
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

    begin
      value = get_table(shard_id, table_name).
          insert(JSON.parse(request.body.read), request.ip)

      if table_name == TABLE_NAMES[:message]
        node_exists = get_table(TABLE_NAMES[:node]).to_a.contains do |node|
          node['id'] == value['simulatedBy']
        end
        unless node_exists
          get_table(shard_id, table_name).delete(value[:id])
          bad_request
        end
      end

      get_pub_sub_api.publish(shard_id, table_name, {:action => 'insert', :id => value[:id]})
    rescue JSON::ParserError
      bad_request
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
    unsupported_media_type unless has_json_utf8_headers(request)

    begin
      table = get_table(shard_id, table_name)
      int_id = id.to_i
      value = table.update(int_id, JSON.parse(request.body.read), request.ip)
      get_pub_sub_api.publish(shard_id, table_name, {:action => 'update', :id => int_id})
    rescue JSON::ParserError
      bad_request
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

end
