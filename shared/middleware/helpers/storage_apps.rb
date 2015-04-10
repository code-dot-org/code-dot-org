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

    storage_encrypt_channel_id(row[:storage_id], row[:id])
  end

  def delete(channel_id)
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    delete_count = @table.where(id:id).update(state:'deleted')
    raise NotFound, "channel `#{channel_id}` not found" if delete_count == 0

    # TODO: Delete all storage associated with this channel (e.g. properties and tables)

    true
  end

  def get(channel_id)
    owner, id = storage_decrypt_channel_id(channel_id)

    row = @table.where(id:id).exclude(state:'deleted').first
    raise NotFound, "channel `#{channel_id}` not found" unless row

    JSON.parse(row[:value]).merge(id: channel_id, isOwner: owner == @storage_id)
  end

  def update(channel_id, value, ip_address)
    owner, id = storage_decrypt_channel_id(channel_id)
    raise NotFound, "channel `#{channel_id}` not found in your storage" unless owner == @storage_id

    row = {
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    update_count = @table.where(id:id).exclude(state:'deleted').update(row)
    raise NotFound, "channel `#{channel_id}` not found" if update_count == 0

    JSON.parse(row[:value]).merge(id: channel_id, isOwner: owner == @storage_id)
  end

  def to_a()
    @table.where(storage_id:@storage_id).exclude(state:'deleted').map do |i|
      channel_id = storage_encrypt_channel_id(i[:storage_id], i[:id])
      JSON.parse(i[:value]).merge(id: channel_id, isOwner: true)
    end
  end

end
