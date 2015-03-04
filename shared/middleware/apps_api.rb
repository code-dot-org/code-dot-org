require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'csv'

class AppsApi < Sinatra::Base

  helpers do
    [
      'core.rb',
      'storage_apps.rb',
      'storage_id.rb',
      'property_bag.rb',
      'table.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  if rack_env?(:staging) || rack_env?(:development)
    get '/v3/apps/debug' do
      dont_cache
      content_type :json
      JSON.pretty_generate({
        storage_id:storage_id('user'),
      })
    end
  end
  
  #
  #
  # APPS
  #
  #
  
  #
  # GET /v3/apps
  #
  # Returns all of the apps registered to the current user
  #
  get '/v3/apps' do
    dont_cache
    content_type :json
    StorageApps.new(storage_id('user')).to_a.to_json
  end

  #
  # POST /v3/apps
  #
  # Create an app.
  #
  post '/v3/apps' do
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    timestamp = Time.now
    id = StorageApps.new(storage_id('user')).create(JSON.load(request.body.read).merge('createdAt' => timestamp, 'updatedAt' => timestamp), request.ip)

    redirect "/v3/apps/#{id}", 301
  end
  
  #
  # GET /v3/apps/<app-id>
  #
  # Returns an app by id.
  #
  get %r{/v3/apps/([^/]+)$} do |id|
    dont_cache
    content_type :json
    StorageApps.new(storage_id('user')).get(id).to_json
  end

  #
  # DELETE /v3/apps/<app-id>
  #
  # Deletes an app by id.
  #
  delete %r{/v3/apps/([^/]+)$} do |id|
    dont_cache
    StorageApps.new(storage_id('user')).delete(id)
    no_content
  end
  post %r{/v3/apps/([^/]+)/delete$} do |name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/apps/<app-id>
  #
  # Update an existing app.
  #
  post %r{/v3/apps/([^/]+)$} do |id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = JSON.load(request.body.read)
    value = value.merge('updatedAt' => Time.now)

    StorageApps.new(storage_id('user')).update(id, value, request.ip)

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/apps/([^/]+)$} do |id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/apps/([^/]+)$} do |id|
    call(env.merge('REQUEST_METHOD'=>'PATCH'))
  end
  
  #
  #
  # PROPERTIES
  #
  #
  
  #
  # GET /v3/apps/<app-id>/[user-]properties
  #
  # Returns all of the properties in the bag
  #
  get %r{/v3/apps/([^/]+)/(shared|user)-properties$} do |app_id, endpoint|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).to_hash.to_json
  end

  #
  # GET /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Returns a single value by name.
  #
  get %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).get(name).to_json
  end
  
  #
  # DELETE /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Deletes a value by name.
  #
  delete %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    PropertyBag.new(app_id, storage_id(endpoint)).delete(name)
    no_content
  end
  
  #
  # POST /v3/apps/<app-id>/[user-]properties/<property-name>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)/delete$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Set a value by name.
  #
  post %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = PropertyBag.new(app_id, storage_id(endpoint)).set(name, JSON.load(request.body.read), request.ip)

    dont_cache
    content_type :json
    value.to_json
  end

  #
  # In HTTP, POST means "create a new resource" while PUT and PATCH are a pair of synonyms that
  # mean "update an existing resource." It's inconvenient for [consumers of] property bags to need
  # to differentiate between create and update so we map all three verbs to "create or update"
  # behavior via the POST handler.
  #
  patch %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/apps/([^/]+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  #
  #
  # TABLES
  #
  #
  
  #
  # GET /v3/apps/<app-id>/[user-]tables/<table-name>
  #
  # Returns all of the rows in the table.
  #
  get %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)$} do |app_id, endpoint, table_name|
    dont_cache
    content_type :json
    Table.new(app_id, storage_id(endpoint), table_name).to_a.to_json
  end
  
  #
  # GET /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    dont_cache
    content_type :json
    Table.new(app_id, storage_id(endpoint), table_name).fetch(id).to_json
  end

  #
  # DELETE /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    dont_cache
    Table.new(app_id, storage_id(endpoint), table_name).delete(id)
    no_content
  end

  #
  # POST /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)/delete$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/apps/<app-id>/[user-]tables/<table-name>
  #
  # Insert a new row.
  #
  post %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)$} do |app_id, endpoint, table_name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = Table.new(app_id, storage_id(endpoint), table_name).insert(JSON.parse(request.body.read), request.ip)

    dont_cache
    content_type :json

    redirect "/v3/apps/#{app_id}/#{endpoint}-tables/#{table_name}/#{value[:id]}", 301
  end

  #
  # PATCH (PUT, POST) /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>
  #
  # Update an existing row.
  #
  post %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = Table.new(app_id, storage_id(endpoint), table_name).update(id, JSON.parse(request.body.read), request.ip)

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/apps/([^/]+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  #
  # POST /v3/apps/<app-id>/import-(shared|user)-tables/<table-name>
  #
  # Imports a csv form post into a table, erasing previous contents.
  #
  post %r{/v3/apps/([^/]+)/import-(shared|user)-tables/([^/]+)$} do |app_id, endpoint, table_name|
    # this check fails on Win 8.1 Chrome 40
    #unsupported_media_type unless params[:import_file][:type]== 'text/csv'   

    max_records = 5000
    table_url = "/private/edit-csp-table/#{app_id}/#{table_name}"
    back_link = "<a href='#{table_url}'>back</a>"
    table = Table.new(app_id, storage_id(endpoint), table_name)
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
      CSV.foreach(tempfile, headers:true) do |row|
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
    table.delete_all()
    
    records.each do |record|
      table.insert(record, request.ip)
    end

    redirect "#{table_url}"
  end

end
