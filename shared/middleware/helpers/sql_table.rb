#
# SqlTable
#

class SqlTable
  class NotFound < Sinatra::NotFound
  end

  def initialize(channel_id, storage_id, table_name)
    _, @channel_id = storage_decrypt_channel_id(channel_id) # TODO(if/when needed): Ensure this is a registered channel?
    @storage_id = storage_id
    @table_type = storage_id.nil? ? 'shared' : 'user'
    @table_name = table_name

    @table = PEGASUS_DB[:app_tables]
    @metadata_table = PEGASUS_DB[:channel_table_metadata]
  end

  def exists?()
    !@table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name).limit(1).first.nil?
  end

  def items()
    @items ||= @table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name)
  end

  def metadata
    dataset = metadata_dataset
    if dataset && dataset.first
      # dynamo gives us stringified keys rather than symbols, so convert to the same
      Hash[dataset.first.map{ |k, v| [k.to_s, v] }]
    end
  end

  def metadata_dataset
    @metadata_dataset ||= @metadata_table.where(
      app_id: @channel_id,
      table_type: @table_type,
      table_name: @table_name
    ).limit(1)
  end

  # create a new metadata row, based on the contents of any existing records
  def create_metadata
    @metadata_table.insert({
      app_id: @channel_id,
      table_type: @table_type,
      table_name: @table_name,
      column_list: TableMetadata.generate_column_list(to_a).to_json,
      updated_at: DateTime.now
    })
  rescue Sequel::UniqueConstraintViolation
      # catch and ignore
  end

  def ensure_metadata
    create_metadata unless metadata
    metadata_dataset
  end

  def delete(id)
    delete_count = items.where(row_id: id).delete
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless delete_count > 0
    true
  end

  def delete_all()
    items.delete
    @metadata_dataset.delete if metadata_dataset
  end

  def rename_column(old_name, new_name, ip_address)
    ensure_metadata()
    column_list = JSON.parse(metadata['column_list'])
    new_column_list = TableMetadata.rename_column(column_list, old_name, new_name)
    metadata_dataset.update({column_list: new_column_list.to_json})

    items.each do |r|
      # We want to preserve the order of the columns so creating
      # a new hash is required.
      new_value = {}
      value = JSON.load(r[:value])
      value.each do |k, v|
        if k == old_name
          new_value[new_name] = v
        else
          new_value[k] = v
        end
      end
      update(r[:row_id], new_value, ip_address)
    end
  end

  def add_columns(column_names)
    ensure_metadata()
    column_list = JSON.parse(metadata['column_list'])
    column_names.each do |col|
      column_list = TableMetadata.add_column(column_list, col)
    end
    metadata_dataset.update({column_list: column_list.to_json})
  end

  def delete_column(column_name, ip_address)
    ensure_metadata()
    column_list = JSON.parse(metadata['column_list'])
    new_column_list = TableMetadata.remove_column(column_list, column_name)
    metadata_dataset.update({column_list: new_column_list.to_json})

    items.each do |r|
      value = JSON.load(r[:value])
      value.delete(column_name)
      update(r[:row_id], value, ip_address)
    end
  end

  def fetch(id)
    row = items.where(row_id: id).first
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" unless row
    JSON.load(row[:value]).merge('id' => row[:row_id])
  end

  def insert(value, ip_address)
    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash

    row = {
      app_id: @channel_id,
      storage_id: @storage_id,
      table_name: @table_name,
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }

    tries = 0
    begin
      row[:row_id] = next_id
      row[:id] = @table.insert(row)
    rescue Sequel::UniqueConstraintViolation
      retry if (tries += 1) < 5
      raise
    end

    JSON.load(row[:value]).merge('id' => row[:row_id])
  end

  def next_id()
    items.max(:row_id).to_i + 1
  end

  def update(id, value, ip_address)
    raise ArgumentError, 'Value is not a hash' unless value.is_a? Hash
    row = {
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }
    update_count = items.where(row_id: id).update(row)
    raise NotFound, "row `#{id}` not found in `#{@table_name}` table" if update_count == 0

    JSON.load(row[:value]).merge('id' => id)
  end

  def to_a()
    items.map do |row|
      JSON.load(row[:value]).merge('id' => row[:row_id])
    end
  end

  def to_csv()
    return table_to_csv(to_a, column_order: ['id'])
  end

  def self.table_names(channel_id)
    tables_from_records = PEGASUS_DB[:app_tables].where(app_id: channel_id, storage_id: nil).group(:table_name).select_map(:table_name)
    tables_from_metadata = PEGASUS_DB[:channel_table_metadata].where(app_id: channel_id, table_type: 'shared').group(:table_name).select_map(:table_name)
    tables_from_records.concat(tables_from_metadata).uniq
  end

end
