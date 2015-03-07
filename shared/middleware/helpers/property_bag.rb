#
# PropertyBag
#
class PropertyBag

  class NotFound < Sinatra::NotFound
  end

  def initialize(app_id, storage_id, my_storage_id)
    app_owner, @app_id = storage_decrypt_app_id(app_id) # TODO(if/when needed): Ensure this is a registered app?
    @storage_id = storage_id
    @can_enumerate = @can_modify = storage_id != -1 || app_owner == my_storage_id

    @table = PEGASUS_DB[:app_properties]
  end
  
  def items()
    @items ||= @table.where(app_id:@app_id, storage_id:@storage_id)
  end

  def delete(name)
    delete_count = @can_modify ? items.where(name:name).delete : 0
    raise NotFound, "property `#{name}` not found" unless delete_count > 0
    true
  end

  def get(name)
    row = items.where(name:name).first
    raise NotFound, "property `#{name}` not found" unless row
    JSON.load(row[:value])
  end

  def set(name, value, ip_address)
    raise NotFound unless @can_modify

    row = {
      app_id:@app_id,
      storage_id:@storage_id,
      name:name,
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }

    update_count = items.where(name:name).update(row)
    if update_count == 0
      row[:id] = @table.insert(row)
    end
  
    JSON.load(row[:value])
  end

  def to_hash()
    raise NotFound unless @can_enumerate

    {}.tap do |results|
      items.each do |row|
        results[row[:name]] = JSON.load(row[:value])
      end
    end
  end

end
