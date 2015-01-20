require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'

class AppsApi < Sinatra::Base

  helpers do
    [
      'core.rb',
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
  # PROPERTIES
  #
  #
  
  #
  # GET /v3/apps/<app-id>/[user-]properties
  #
  # Returns all of the properties in the bag
  #
  get %r{/v3/apps/(\d+)/(shared|user)-properties$} do |app_id, endpoint|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).to_hash.to_json
  end

  #
  # GET /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Returns a single value by name.
  #
  get %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).get(name).to_json
  end
  
  #
  # DELETE /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Deletes a value by name.
  #
  delete %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    PropertyBag.new(app_id, storage_id(endpoint)).delete(name)
    no_content
  end
  
  #
  # POST /v3/apps/<app-id>/[user-]properties/<property-name>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)/delete$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/apps/<app-id>/[user-]properties/<property-name>
  #
  # Set a value by name.
  #
  post %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
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
  patch %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/apps/(\d+)/(shared|user)-properties/([^/]+)$} do |app_id, endpoint, name|
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
  get %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)$} do |app_id, endpoint, table_name|
    dont_cache
    content_type :json
    Table.new(app_id, storage_id(endpoint), table_name).to_a.to_json
  end
  
  #
  # GET /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>
  #
  # Returns a single row by id.
  #
  get %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    dont_cache
    content_type :json
    Table.new(app_id, storage_id(endpoint), table_name).fetch(id).to_json
  end

  #
  # DELETE /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>
  #
  # Deletes a row by id.
  #
  delete %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    dont_cache
    Table.new(app_id, storage_id(endpoint), table_name).delete(id)
    no_content
  end

  #
  # POST /v3/apps/<app-id>/[user-]tables/<table-name>/<row-id>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)/delete$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/apps/<app-id>/[user-]tables/<table-name>
  #
  # Insert a new row.
  #
  post %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)$} do |app_id, endpoint, table_name|
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
  post %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = Table.new(app_id, storage_id(endpoint), table_name).update(id, JSON.parse(request.body.read), request.ip)

    dont_cache
    content_type :json
    value.to_json
  end
  patch %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/apps/(\d+)/(shared|user)-tables/([^/]+)/(\d+)$} do |app_id, endpoint, table_name, id|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

end
