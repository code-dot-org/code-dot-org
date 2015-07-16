Sequel.migration do
  up do
    add_column :storage_apps, :created_at, DateTime

    # Update rows in batches.
    offset = 0
    batch_size = 1000
    loop do
      batch = from(:storage_apps).where(state: 'active').offset(offset).limit(batch_size)
      break unless batch.count == 0
      batch.each do |row|
        value = JSON.parse(row[:value])
        created = Time.parse(value['createdAt']) if value['createdAt']

        # Remove metadata keys from :value hash (they're stored in separate columns or calculated dynamically).
        %w(id isOwner createdAt updatedAt).each{ |key| value.delete(key) }

        # Set :created_at.
        from(:storage_apps).where(id: row[:id]).update(created_at: created, value: value.to_json)
      end
      offset += batch_size
    end
  end

  down do
    from(:storage_apps).where(state: 'active').all do |row|
      value = JSON.parse(row[:value])
      Time.parse(row['createdAt'])

      # Move timestamp keys back to the :value hash.
      from(:storage_apps).where(id: row[:id]).update(value: value.merge('createdAt' => row[:created_at], 'updatedAt' => row[:updated_at]))
    end
    drop_column :storage_apps, :created_at
  end
end
