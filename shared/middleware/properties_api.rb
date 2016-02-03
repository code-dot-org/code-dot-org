require 'sinatra/base'
require 'cdo/db'
require 'cdo/rack/request'
require 'json'

class PropertiesApi < Sinatra::Base

  helpers do
    [
      'core.rb',
      'storage_id.rb',
      'property_bag.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  PropertyType = CDO.use_dynamo_properties ? DynamoPropertyBag : PropertyBag

  #
  # GET /v3/(shared|user)-properties/<channel-id>
  #
  # Returns all of the properties in the bag
  #
  get %r{/v3/(shared|user)-properties/([^/]+)$} do |endpoint, channel_id|
    dont_cache
    content_type :json
    not_authorized unless owns_channel? channel_id
    _, decrypted_channel_id = storage_decrypt_channel_id(channel_id)
    PropertyType.new(decrypted_channel_id, storage_id(endpoint)).to_hash.to_json
  end

  #
  # GET /v3/(shared|user)-properties/<channel-id>/<property-name>
  #
  # Returns a single value by name.
  #
  get %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)$} do |endpoint, channel_id, name|
    dont_cache
    content_type :json
    _, decrypted_channel_id = storage_decrypt_channel_id(channel_id)
    PropertyType.new(decrypted_channel_id, storage_id(endpoint)).get(name).to_json
  end

  #
  # DELETE /v3/(shared|user)-properties/<channel-id>/<property-name>
  #
  # Deletes a value by name.
  #
  delete %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)$} do |endpoint, channel_id, name|
    dont_cache
    _, decrypted_channel_id = storage_decrypt_channel_id(channel_id)
    PropertyType.new(decrypted_channel_id, storage_id(endpoint)).delete(name)
    no_content
  end

  #
  # POST /v3/(shared|user)-properties/<channel-id>/<property-name>/delete
  #
  # This mapping exists for older browsers that don't support the DELETE verb.
  #
  post %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)/delete$} do |endpoint, channel_id, name|
    call(env.merge('REQUEST_METHOD'=>'DELETE', 'PATH_INFO'=>File.dirname(request.path_info)))
  end

  #
  # POST /v3/(shared|user)-properties/<channel-id>/<property-name>
  #
  # Set a value by name.
  #
  post %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)$} do |endpoint, channel_id, name|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    _, decrypted_channel_id = storage_decrypt_channel_id(channel_id)
    parsed_value = PropertyBag.parse_value(request.body.read)
    value = PropertyType.new(decrypted_channel_id, storage_id(endpoint)).set(name, parsed_value, request.ip)

    dont_cache
    content_type :json
    value.to_json
  end

  #
  # POST /v3/(shared|user)-properties/<channel-id>
  #
  # Multi-set  values from request body
  #
  post %r{/v3/(shared|user)-properties/([^/]+)$} do |endpoint, channel_id|
    unsupported_media_type unless request.content_type.to_s.split(';').first == 'application/json'
    unsupported_media_type unless request.content_charset.to_s.downcase == 'utf-8'

    begin
      json_data = JSON.parse(request.body.read)
    rescue => e
      msg = "The json could not be loaded: #{e.message}"
      halt 400, {}, msg
    end

    overwrite = request.GET['overwrite'] == '1'

    _, decrypted_channel_id = storage_decrypt_channel_id(channel_id)
    bag = PropertyType.new(decrypted_channel_id, storage_id(endpoint))
    bag_hash = nil
    json_data.each do |k, v|
      if !overwrite
        bag_hash ||= bag.to_hash
        next if bag_hash.has_key? k
      end
      bag.set(k, v, request.ip)
    end
    dont_cache
  end

  #
  # In HTTP, POST means "create a new resource" while PUT and PATCH are a pair of synonyms that
  # mean "update an existing resource." It's inconvenient for [consumers of] property bags to need
  # to differentiate between create and update so we map all three verbs to "create or update"
  # behavior via the POST handler.
  #
  patch %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)$} do |endpoint, channel_id, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
  put %r{/v3/(shared|user)-properties/([^/]+)/([^/]+)$} do |endpoint, channel_id, name|
    call(env.merge('REQUEST_METHOD'=>'POST'))
  end
end
