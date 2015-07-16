require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'

class NetSimApi < Sinatra::Base

  helpers do
    [
        'core.rb',
        'storage_id.rb',
        'table.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  TableType = CDO.use_dynamo_tables ? DynamoTable : Table

  def get_table(shard_id, table_name)
    # Environment-dependent channel ID for NetSim.
    # Will no longer be needed when we detach from the channels API entirely.
    channel_id = rack_env?(:development) ? 'JGW2rHUp_UCMW_fQmRf6iQ==' : 'HQJ8GCCMGP7Yh8MrtDusIA=='

    # Table name within channels API just concatenates shard + table
    api_table_name = "#{shard_id}_#{table_name}"

    TableType.new(channel_id, nil, api_table_name)
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

  #
  # DELETE /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    dont_cache
    get_table(shard_id, table_name).delete(id.to_i)
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

    value = get_table(shard_id, table_name).
        insert(JSON.parse(request.body.read), request.ip)

    dont_cache
    content_type :json

    redirect "/v3/netsim/#{shard_id}/#{table_name}/#{value[:id]}", 301
  end

  #
  # PATCH (PUT, POST) /v3/netsim/<shard-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/netsim/([^/]+)/(\w+)/(\d+)$} do |shard_id, table_name, id|
    unsupported_media_type unless has_json_utf8_headers(request)

    value = get_table(shard_id, table_name).
        update(id.to_i, JSON.parse(request.body.read), request.ip)

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
