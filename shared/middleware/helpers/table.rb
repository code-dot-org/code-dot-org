#
# Table
#
class Table

  class NotFound < Sinatra::NotFound
  end

  def initialize(app_id, storage_id, table_name, my_storage_id)
    app_owner, @app_id = storage_decrypt_app_id(app_id) # TODO(if/when needed): Ensure this is a registered app?
    @storage_id = storage_id
    @table_name = table_name
    @can_enumerate = @can_modify = storage_id != -1 || app_owner == my_storage_id
  
    @table = PEGASUS_DB[:app_tables]
  end
  
  def items()
    @items ||= @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name)
  end
  
  def delete(id)
    delete_count = @can_modify ? items.where(row_id:id).delete : 0
    raise NotFound, "row `#{id}` not found `#{@table_name}` table" unless delete_count > 0
    true
  end

  def delete_all()
    items.delete
  end

  def fetch(id)
    row = items.where(row_id:id).first
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row
    JSON.load(row[:value]).merge(id:row[:row_id])
  end
  
  def insert(value, ip_address)
    raise NotFound unless @can_modify

    row = {
      app_id:@app_id,
      storage_id:@storage_id,
      table_name:@table_name,
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }

    tries = 0
    begin
      row[:row_id] = next_id
      row[:id] = @table.insert(row)
    rescue Sequel::UniqueConstraintViolation
      retry if (tries += 1) < 5
      raise
    end

    JSON.load(row[:value]).merge(id:row[:row_id])
  end
  
  def next_id()
    items.max(:row_id).to_i + 1
  end

  def update(id, value, ip_address)
    raise NotFound unless @can_modify

    row = {
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    update_count = items.where(row_id:id).update(row)
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" if update_count == 0

    JSON.load(row[:value]).merge(id:id)
  end
  
  def to_a()
    raise NotFound unless @can_enumerate

    items.map do |row|
      JSON.load(row[:value]).merge(id:row[:row_id])
    end
  end

end
