# Migration for extracting JSON.parse(row[:value])['createdAt'] into a :created_at column.
Sequel.migration do
  up do
    add_column :storage_apps, :created_at, DateTime

    batch_update do |row|
      begin
        value = JSON.parse(row[:value])
      rescue JSON::ParserError
        next
      end

      created = DateTime.parse(value['createdAt']) if value['createdAt']

      # Set :created_at.
      from(:storage_apps).where(id: row[:id]).update(created_at: created)
    end
  end

  down do
    drop_column :storage_apps, :created_at
  end
end

# Update rows in batches.
def batch_update
  offset = 0
  batch_size = 1000
  loop do
    batch = from(:storage_apps).offset(offset).limit(batch_size)
    break if batch.count == 0
    batch.each do |row|
      yield row
    end
    offset += batch_size
  end
end
