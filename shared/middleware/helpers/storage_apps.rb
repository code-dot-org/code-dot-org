#
# StorageApps
#
class StorageApps

  class NotFound < Sinatra::NotFound
  end

  def initialize(storage_id)
    @storage_id = storage_id
  
    @table = PEGASUS_DB[:storage_apps]
  end
  
  def create(value, ip_address)
    row = {
      storage_id:@storage_id,
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    row[:id] = @table.insert(row)

    storage_encrypt_app_id(row[:storage_id], row[:id])
  end
  
  def delete(app_id)
    owner, id = storage_decrypt_app_id(app_id)
    raise NotFound, "app `#{app_id}` not found in your storage" unless owner == @storage_id

    delete_count = @table.where(id:id).delete
    raise NotFound, "app `#{app_id}` not found" if delete_count == 0

    # TODO: Delete all storage associated with this app (e.g. properties and tables)

    true
  end

  def get(app_id)
    owner, id = storage_decrypt_app_id(app_id)

    row = @table.where(id:id).first
    raise NotFound, "app `#{app_id}` not found" unless row

    JSON.load(row[:value]).merge(id:app_id)
  end
  
  def update(app_id, value, ip_address)
    owner, id = storage_decrypt_app_id(app_id)
    raise NotFound, "app `#{app_id}` not found in your storage" unless owner == @storage_id

    row = {
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    update_count = @table.where(id:id).update(row)
    raise NotFound, "app `#{app_id}` not found" if update_count == 0

    JSON.load(row[:value]).merge(id:app_id)
  end
  
  def to_a()
    @table.where(storage_id:@storage_id).map do |i|
      app_id = storage_encrypt_app_id(i[:storage_id], i[:id])
      JSON.load(i[:value]).merge(id:app_id)
    end
  end

end
