Sequel.migration do
  up do
    add_column :storage_apps, :abuse_score, Integer

    batch_update do |row|
      from(:storage_apps).where(id: row[:id]).update(abuse_score: 0)
    end
  end

  down do
    drop_column :storage_apps, :abuse_score
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
