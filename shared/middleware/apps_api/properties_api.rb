require 'sinatra/base'
require 'cdo/db'

class PropertiesApi < Sinatra::Base

  #
  # Retrieve all of the values in the property bag.
  #
  get %r{/v2/apps/(\d+)/(\d+)/properties$} do |app_id, user_id|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, user_id).all.to_json
  end

  #
  # Retrieve a value by name.
  #
  get %r{/v2/apps/(\d+)/(\d+)/properties/([^/]+)$} do |app_id, user_id, name|
    dont_cache
    content_type :json
    PropertyBag.new(app_id, user_id).get(name).to_json
  end
  
  #
  # Delete a value by name.
  #
  delete %r{/v2/apps/(\d+)/(\d+)/properties/([^/]+)$} do |app_id, user_id, name|
    dont_cache
    PropertyBag.new(app_id, user_id).delete(name)
    no_content
  end

  #
  # Set a value.
  #
  post %r{/v2/apps/(\d+)/(\d+)/properties/([^/]+)$} do |app_id, user_id, name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    value = JSON.load(request.body.read)
    row = PropertyBag.new(app_id, user_id).set(name, value, request.ip)

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
  patch %r{/v2/apps/(\d+)/(\d+)/properties/([^/]+)$} do |app_id, user_id, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v2/apps/(\d+)/(\d+)/properties/([^/]+)$} do |app_id, user_id, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end

  helpers do
    
    def dont_cache
      cache_control(:private, :must_revalidate, max_age:0)
    end
    
    def no_content()
      halt(204, "No content\n")
    end
    
    def not_found()
      halt(404, "Not found\n")
    end

    def unsupported_media_type()
      halt(415, "Unsupported Media Type\n")
    end

  end

  #
  # PropertyBag
  #
  class PropertyBag
  
    def initialize(app_id, user_id)
      @app_id = app_id.to_i
      raise ArgumentError, 'app_id must be > 0' unless @app_id > 0
      # TODO(when needed): Ensure this is a registered app?

      @user_id = user_id.to_i
      raise ArgumentError, 'user_id must be > 0' unless @user_id > 0
      # TODO(when needed): Ensure this is a registered user?
    
      @table = PEGASUS_DB[:property_bags]
    end
  
    def all()
      {}.tap do |results|
        @table.where(app_id:@app_id, user_id:@user_id).each do |row|
          results[row[:name]] = JSON.load(row[:value])
        end
      end
    end
  
    def delete(name)
      delete_count = @table.where(app_id:@app_id, user_id:@user_id, name:name).delete
      raise NotFound, "property `#{name}` not found" unless delete_count > 0
      true
    end
  
    def get(name)
      row = @table.where(app_id:@app_id, user_id:@user_id, name:name).first
      raise NotFound, "property `#{name}` not found" unless row
      JSON.load(row[:value])
    end
  
    def set(name, value, ip_address)
      row = {
        app_id:@app_id,
        user_id:@user_id,
        name:name,
        value:value.to_json,
        updated_at:DateTime.now,
        updated_ip:ip_address,
      }

      update_count = @table.where(app_id:@app_id, user_id:@user_id, name:name).update(row)
      if update_count == 0
        row[:id] = @table.insert(row)
      end
    
      row[:value] = JSON.load(row[:value])
    
      row
    end
  
  end

end
