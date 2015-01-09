require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'

class AppsApi < Sinatra::Base
  
  #
  # GET /v2/apps/<app-id>/[user-]properties
  #
  # Returns all of the properties in the bag
  #
  get %r{/v2/apps/(\d+)/(properties|user-properties)$} do |app_id, endpoint|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).to_hash.to_json
  end

  #
  # GET /v2/apps/<app-id>/[user-]properties/<property-name>
  #
  # Returns a single value by name.
  #
  get %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, storage_id(endpoint)).get(name).to_json
  end
  
  #
  # DELETE /v2/apps/<app-id>/[user-]properties/<property-name>
  #
  # Deletes a value by name.
  #
  delete %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)$} do |app_id, endpoint, name|
    dont_cache
    PropertyBag.new(app_id, storage_id(endpoint)).delete(name)
    no_content
  end
  
  #
  # POST /v2/apps/<app-id>/[user-]properties/<property-name>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)/delete$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v2/apps/<app-id>/[user-]properties/<property-name>
  #
  # Set a value by name.
  #
  post %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)$} do |app_id, endpoint, name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = JSON.load(request.body.read)
    row = PropertyBag.new(app_id, storage_id(endpoint)).set(name, value, request.ip)

    dont_cache
    content_type :json
    row[:value].to_json
  end

  #
  # In HTTP, POST means "create a new resource" while PUT and PATCH are a pair of synonyms that
  # mean "update an existing resource." It's inconvenient for [consumers of] property bags to need
  # to differentiate between create and update so we map all three verbs to "create or update"
  # behavior via the POST handler.
  #
  patch %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v2/apps/(\d+)/(properties|user-properties)/([^/]+)$} do |app_id, endpoint, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  helpers do
    
    # Create a storage id without an associated user id and track it using a cookie.
    def create_storage_id_cookie
      storage_id = user_storage_ids_table.insert(user_id:nil)

      # TODO: Encrypt the storage id in the cookie to protect it from being sequential/predicable
      response.set_cookie(storage_id_cookie_name, {
        value:CGI.escape(storage_id.to_s),
        domain:".#{request.site}",
        path:'/v2/apps',
        expires:Time.now + (365 * 24 * 3600)
      })

      storage_id
    end

    def dont_cache
      cache_control(:private, :must_revalidate, max_age:0)
    end

    def no_content()
      halt(204, "No content\n")
    end

    def not_found()
      halt(404, "Not found\n")
    end

    def storage_id(endpoint)
      return nil if ['properties', 'tables'].include?(endpoint)
      raise ArgumentError, "Unknown endpoint: `#{endpoint}`" unless ['user-properties', 'user-tables'].include?(endpoint)
      @user_storage_id ||= storage_id_for_user || storage_id_from_cookie || create_storage_id_cookie
    end
    
    def storage_id_cookie_name()
      name = "storage"
      name += "_#{rack_env}" unless rack_env?(:production)
      name
    end

    def storage_id_for_user()
      return nil unless request.user_id
      
      # Return the user's storage-id, if it exists.
      if row = user_storage_ids_table.where(user_id:request.user_id).first
        return row[:id] 
      end
      
      # Take ownership of cookie storage, if it exists.
      if storage_id = storage_id_from_cookie
        # Delete the cookie that was tracking this storage id
        response.delete_cookie(storage_id_cookie_name)
        
        # Only take ownership if the storage id doesn't already have an owner - it shouldn't but
        # there is a race condition (addressed below)
        rows_updated = user_storage_ids_table.where(id:storage_id,user_id:nil).update(user_id:request.user_id)
        return storage_id if rows_updated > 0
      
        # We couldn't claim the storage. The most likely cause is that another request (by this
        # user) beat us to the punch so we'll re-check to see if we own it. Otherwise the storage
        # id is either invalid or it belongs to another user (both addressed below)
        return storage_id if user_storage_ids_table.where(id:storage_id,user_id:request.user_id).first
      end

      # We don't have any existing storage id we can associate with this user, so create a new one
      user_storage_ids_table.insert(user_id:request.user_id)
    end
    
    def storage_id_from_cookie()
      # TODO: Decrypt an encrypted cookie to get the storage id (it's currently plaintext)
      storage_id = CGI.unescape(request.cookies[storage_id_cookie_name].to_s).to_i
      return nil if storage_id == 0
      storage_id
    end

    def unsupported_media_type()
      halt(415, "Unsupported Media Type\n")
    end
    
    def user_storage_ids_table()
      @user_storage_ids_table ||= PEGASUS_DB[:user_storage_ids]
    end
    
  end

  #
  # PropertyBag
  #
  class PropertyBag
  
    def initialize(app_id, storage_id)
      @app_id = app_id # TODO(if/when needed): Ensure this is a registered app?
      @storage_id = storage_id
    
      @table = PEGASUS_DB[:property_bags]
    end
  
    def delete(name)
      delete_count = @table.where(app_id:@app_id, storage_id:@storage_id, name:name).delete
      raise NotFound, "property `#{name}` not found" unless delete_count > 0
      true
    end
  
    def get(name)
      row = @table.where(app_id:@app_id, storage_id:@storage_id, name:name).first
      raise NotFound, "property `#{name}` not found" unless row
      JSON.load(row[:value])
    end
  
    def set(name, value, ip_address)
      row = {
        app_id:@app_id,
        storage_id:@storage_id,
        name:name,
        value:value.to_json,
        updated_at:DateTime.now,
        updated_ip:ip_address,
      }

      update_count = @table.where(app_id:@app_id, storage_id:@storage_id, name:name).update(row)
      if update_count == 0
        row[:id] = @table.insert(row)
      end
    
      row[:value] = JSON.load(row[:value])
    
      row
    end
  
    def to_hash()
      {}.tap do |results|
        @table.where(app_id:@app_id, storage_id:@storage_id).each do |row|
          results[row[:name]] = JSON.load(row[:value])
        end
      end
    end
  
  end
  
end
