Sequel.migration do
  up do
    drop_column :contacts, :created_on
    drop_column :contacts, :updated_on
    drop_column :contacts, :unsubscribed_on
  end

  down do
    add_column :contacts, :created_on, Date
    add_column :contacts, :updated_on, Date
    add_column :contacts, :unsubscribed_on, Date

    batch_update do |row|
      from(:contacts).where(id: row[:id]).update(
        created_on: row[:created_at],
        updated_on: row[:updated_at],
        unsubscribed_on: row[:unsubscribed_at]
      )
    end
  end
end

# Update rows in batches.
# (adapted from pegasus/migrations/076_migrate_channel_sources_to_s3.rb).
def batch_update
  offset = 0
  batch_size = 10_000
  loop do
    batch = from(:contacts).order(:id).offset(offset).limit(batch_size)
    break if batch.count == 0
    batch.each do |row|
      yield row
    end
    offset += batch_size
  end
end
