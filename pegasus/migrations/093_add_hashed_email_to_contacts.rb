require 'digest/md5'

Sequel.migration do
  up do
    add_column :contacts, :hashed_email, String, null: false

    batch_update do |contact|
      self[:contacts].where(id: contact[:id]).update(hashed_email: Digest::MD5.hexdigest(contact[:email].downcase))
    end
  end

  down do
    drop_column :contacts, :hashed_email
  end
end

# Update rows in batches.
# (adapted from pegasus/migrations/077_add_abuse_score_column_to_storage_apps.rb)
def batch_update
  offset = 0
  batch_size = 1000
  loop do
    batch = from(:contacts).offset(offset).limit(batch_size)
    break if batch.count == 0
    batch.each do |row|
      yield row
    end
    offset += batch_size
  end
end
