require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'
require_relative './helpers/table_coerce'

class TablesApi < Sinatra::Base

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

  #
  # GET /v3/(shared|user)-tables/<channel-id>/<table-name>
  #
  # Returns all of the rows in the table.
  #
  get %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)$} do |endpoint, channel_id, table_name|
    dont_cache
    content_type :json
    TableType.new(channel_id, storage_id(endpoint), table_name).to_a.to_json
  end

  #
  # GET /v3/(shared|user)-tables/<channel-id>/<table-name>/metadata
  #
  # Returns the metdata for the given table
  #
  get %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/metadata$} do |endpoint, channel_id, table_name|
    dont_cache
    content_type :json
    table_metadata = TableType.new(channel_id, storage_id(endpoint), table_name).metadata

    no_content if table_metadata.nil?
    table_metadata.to_json
  end

  #
  # GET /v3/(shared|user)-tables/<channel-id>/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)$} do |endpoint, channel_id, table_name, id|
    dont_cache
    content_type :json
    TableType.new(channel_id, storage_id(endpoint), table_name).fetch(id.to_i).to_json
  end

  #
  # DELETE /v3/(shared|user)-tables/<channel-id>/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)$} do |endpoint, channel_id, table_name, id|
    dont_cache
    TableType.new(channel_id, storage_id(endpoint), table_name).delete(id.to_i)
    no_content
  end

  # DELETE /v3/(shared|user)-tables/<channel-id>/<table-name>/column/<column-name>
  #
  # Deletes a column by name.
  #
  delete %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/column/([^/]+)} do |endpoint, channel_id, table_name, column_name|
    dont_cache
    if column_name.empty?
      halt 400, {}, "Column name cannot be empty"
    end

    TableType.new(channel_id, storage_id(endpoint), table_name).delete_column(column_name, request.ip)
    no_content
  end

  # POST /v3/(shared|user)-tables/<channel-id>/<table-name>/column/<column-name>
  #
  # Updates a column name.
  #
  post %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/column/([^/]+)} do |endpoint, channel_id, table_name, column_name|
    dont_cache
    new_name = request.GET['new_name']
    if new_name.empty?
      halt 400, {}, "New column name cannot be empty"
    end
    TableType.new(channel_id, storage_id(endpoint), table_name).rename_column(column_name, new_name, request.ip)
    no_content
  end

  # POST /v3/(shared|user)-tables/<channel-id>/<table-name>/column?column_name=foo
  #
  # Adds a new column
  #
  post %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/column} do |endpoint, channel_id, table_name|
    dont_cache
    column_name = request.GET['column_name']
    if column_name.empty?
      halt 400, {}, "New column name cannot be empty"
    end
    TableType.new(channel_id, storage_id(endpoint), table_name).add_column(column_name)
    no_content
  end

  #
  # DELETE /v3/(shared|user)-tables/<channel-id>/<table-name>
  #
  # Deletes a table
  #
  delete %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)} do |endpoint, channel_id, table_name|
    dont_cache
    TableType.new(channel_id, storage_id(endpoint), table_name).delete_all
    #TODO - delete metadata
    no_content
  end

  #
  # POST /v3/(shared|user)-tables/<channel-id>/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)/delete$} do |_endpoint, _channel_id, _table_name, _id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/(shared|user)-tables/<channel-id>/<table-name>
  #
  # Insert a new row.
  #
  post %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)$} do |endpoint, channel_id, table_name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = TableType.new(channel_id, storage_id(endpoint), table_name).insert(JSON.parse(request.body.read), request.ip)

    dont_cache
    content_type :json

    redirect "/v3/#{endpoint}-tables/#{channel_id}/#{table_name}/#{value['id']}", 301
  end

  #
  # PATCH (PUT, POST) /v3/(shared|user)-tables/<channel-id>/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)$} do |endpoint, channel_id, table_name, id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    new_value =  JSON.parse(request.body.read)

    if new_value.has_key?('id') && new_value['id'].to_i != id.to_i
      halt 400, {}, "Updating 'id' is not allowed" if new_value.has_key? 'id'
    end
    new_value.delete('id')

    value = TableType.new(channel_id, storage_id(endpoint), table_name).update(id.to_i, new_value, request.ip)

    dont_cache
    content_type :json
    value.to_json
  end

  patch %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)$} do |_endpoint, _channel_id, _table_name, _id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  put %r{/v3/(shared|user)-tables/([^/]+)/([^/]+)/(\d+)$} do |_endpoint, _channel_id, _table_name, _id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  # GET /v3/export-(shared|user)-tables/<channel-id>/table-name
  #
  # Exports a csv file from a table where the first row is the column names
  # and additional rows are the column values.
  #
  get %r{/v3/export-(shared|user)-tables/([^/]+)/([^/]+)$} do |endpoint, channel_id, table_name|
    dont_cache
    content_type :csv
    response.headers['Content-Disposition'] = "attachment; filename=\"#{table_name}.csv\""

    return TableType.new(channel_id, storage_id(endpoint), table_name).to_csv
  end

  #
  # POST /v3/import-(shared|user)-tables/<channel-id>/<table-name>
  #
  # Imports a csv form post into a table, erasing previous contents.
  #
  post %r{/v3/import-(shared|user)-tables/([^/]+)/([^/]+)$} do |endpoint, channel_id, table_name|
    # this check fails on Win 8.1 Chrome 40
    #unsupported_media_type unless params[:import_file][:type]== 'text/csv'

    max_records = 5000
    table_url = "/v3/edit-csp-table/#{channel_id}/#{table_name}"
    back_link = "<a href='#{table_url}'>back</a>"
    table = TableType.new(channel_id, storage_id(endpoint), table_name)
    tempfile = params[:import_file][:tempfile]
    records = []

    begin
      columns = CSV.parse_line(tempfile)
      columns.each do |column|
        msg = "The CSV file could not be loaded because one of the column names is missing. "\
              "Please go #{back_link} and make sure the first line of the CSV file "\
              "contains a name for each column:<br><br>#{columns.join(',')}"
        halt 400, {}, msg unless column
      end
      CSV.foreach(tempfile, headers: true, skip_blanks: true) do |row|
        records.push(row.to_hash)
      end
    rescue => e
      msg = "The CSV file could not be loaded: #{e.message}<br><br>To make sure your CSV "\
            "file is formatted correctly, please go #{back_link} and follow these steps:"\
            "<li>Open your data in Microsoft Excel or Google Spreadsheets"\
            "<li>Make sure the first line contains a name for each column"\
            "<li>Export your data by doing a 'Save as CSV' or 'Download as Comma-separated values'"
      halt 400, {}, msg
    end

    msg = "The CSV file is too big. The maximum number of lines is #{max_records}, "\
          "but the file you chose has #{records.length} lines. "\
          "Please go #{back_link} and try uploading a smaller CSV file."
    halt 400, {}, msg if records.length > max_records

    # deleting the old records only after all validity checks have passed.
    begin
      table.delete_all()
    rescue Exception
      halt 500
    end

    records = TableCoerce.coerce_columns_from_data(records, columns)

    # TODO: This should probably be a bulk insert
    records.each do |record|
      table.insert(record, request.ip)
    end

    redirect "#{table_url}"
  end

  #
  # POST /v3/coerce-(shared|user)-tables/<channel-id>/<table-name>
  #
  # Imports a csv form post into a table, erasing previous contents.
  #
  post %r{/v3/coerce-(shared|user)-tables/([^/]+)/([^/]+)$} do |endpoint, channel_id, table_name|
    content_type :json

    table = TableType.new(channel_id, storage_id(endpoint), table_name)

    column = request.GET['column_name']
    type = request.GET['type']

    return 400 unless ['string', 'boolean', 'number'].include?(type)

    current_records = table.to_a
    new_records, all_converted = TableCoerce.coerce_column(current_records, column, type.to_sym)

    # TODO: This should probably be a bulk operation
    new_records.each do |record|
      table.delete(record['id'])
      table.insert(record, request.ip)
    end

    all_converted.to_json
  end

  #
  # POST /v3/(shared|user)-tables/<channel-id>
  #
  # Populates tables from passed in json in the following format
  #   {
  #     'table_1': [{'name': 'trevor', 'age': 30}, ...],
  #     'table_2': [{'city': 'SF', 'people': 6}, ...],
  #   }
  # Also creates metadata (if it doesn't alrelady exist) based on any existing
  # data for each of the passed in tables.
  post %r{/v3/(shared|user)-tables/([^/]+)$} do |endpoint, channel_id|
    begin
      json_data = JSON.parse(request.body.read)
    rescue => e
      msg = "The json file could not be loaded: #{e.message}"
      halt 400, {}, msg
    end

    overwrite = request.GET['overwrite'] == '1'
    json_data.keys.each do |table_name|
      table = TableType.new(channel_id, storage_id(endpoint), table_name)
      if table.exists? && !overwrite
        # make sure we have metadata (for cases where we previously didn't store metadata)
        table.ensure_metadata()
        next
      end

      table.delete_all()
      table.ensure_metadata()
      json_data[table_name].each do |record|
        table.insert(record, request.ip)
      end
    end
  end
end
