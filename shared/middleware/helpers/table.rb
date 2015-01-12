#
# Table
#
class Table

  class NotFound < Sinatra::NotFound
  end

  def initialize(app_id, storage_id, table_name)
    @app_id = app_id # TODO(if/when needed): Ensure this is a registered app?
    @storage_id = storage_id
    @table_name = table_name
  
    @table = PEGASUS_DB[:tables]
  end

  def delete(id)
    delete_count = @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name, row_id:id).delete
    raise NotFound, "row `#{id}` not found `#{@table_name}` table" unless delete_count > 0
    true
  end

  def fetch(id)
    row = @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name, row_id:id).first
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row
    JSON.load(row[:value]).merge(id:row[:row_id])
  end
  
  def insert(value, ip_address)
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
    @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name).max(:row_id).to_i + 1
  end

  def update(id, value, ip_address)
    row = {
      value:value.to_json,
      updated_at:DateTime.now,
      updated_ip:ip_address,
    }
    update_count = @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name, row_id:id).update(row)
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" if update_count == 0

    JSON.load(row[:value]).merge(id:id)
  end
  
  def to_a()
    @table.where(app_id:@app_id, storage_id:@storage_id, table_name:@table_name).all.map do |row|
      JSON.load(row[:value]).merge(id:row[:row_id])
    end
  end

end
