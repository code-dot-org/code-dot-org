require 'cdo/hip_chat'
require 'files_api'

# Migration for deleting %w(id isOwner createdAt updatedAt levelSource levelHtml migratedToS3) from JSON.parse(row[:value]).
Sequel.migration do

  # Parse the :value field, remove metadata, and store the modified object.
  up do
    HipChat.log 'Removing extra metadata from <b>channels</b>...'

    batch_update do |row|
      begin
        value = JSON.parse(row[:value])
      rescue JSON::ParserError
        next
      end

      # Remove metadata keys from :value hash (they're stored in separate columns or calculated dynamically).
      %w(id isOwner createdAt updatedAt levelSource levelHtml migratedToS3).each do |key|
        value.delete(key)
      end

      from(:storage_apps).where(id: row[:id]).update(value: value.to_json)
    end
  end

  # Parse the :value field, add back metadata (where possible), and store the modified object.
  down do
    HipChat.log 'Adding extra metadata back to <b>channels</b>...'
    FILE_NAME = 'main.json'
    source_bucket = SourceBucket.new
    sources_with_errors = []

    batch_update do |row|
      begin
        value = JSON.parse(row[:value])
      rescue JSON::ParserError
        next
      end

      channel = storage_encrypt_channel_id row[:storage_id], row[:id]

      value['channel'] = channel
      value['createdAt'] = row[:created_at]
      value['updatedAt'] = row[:updated_at]

      body = source_bucket.get(channel, FILE_NAME).string
      unless body.nil?
        begin
          data = JSON.parse(body)
          value['levelSource'] = data['source']
          value['levelHtml'] = data['html']
          value['migratedToS3'] = true
        rescue JSON::ParserError
          sources_with_errors << row[:id]
        end
      end

      from(:storage_apps).where(id: row[:id]).update(value: value.to_json)
    end

    HipChat.log "Unable to parse the following sources: #{sources_with_errors.join(', ')}" if sources_with_errors.count > 0
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
    HipChat.log "#{offset + batch.count} <b>channels</b> processed."
    offset += batch_size
  end
end
