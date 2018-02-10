require 'cdo/chat_client'
require 'files_api'

# Migration for moving JSON.parse(row[:value])['levelSource'] and ['levelHtml'] to S3 (/v3/sources API).
Sequel.migration do
  up do
    ChatClient.log 'Moving <b>channel</b> sources to S3...'
    FILE_NAME = 'main.json'.freeze
    source_bucket = SourceBucket.new

    # For each channel with a level(Source|Html) and no migratedToS3 flag, create a new S3 record and set migratedToS3.
    batch_update do |row|
      begin
        value = JSON.parse(row[:value])
      rescue JSON::ParserError
        next
      end

      if (value['levelSource'] || value['levelHtml']) && !value['migratedToS3']
        channel = storage_encrypt_channel_id row[:storage_id], row[:id]
        body = {
          source: value['levelSource'],
          html: value['levelHtml']
        }.to_json
        source_bucket.create_or_replace channel, FILE_NAME, body
        value['migratedToS3'] = true
        from(:storage_apps).where(id: row[:id]).update(value: value.to_json)
      end
    end
  end

  # Leave the created objects in S3, but clear the `migratedToS3` flag so project.js no longer attempts to load them.
  down do
    ChatClient.log 'Clearing the `migratedToS3` flag on <b>channels</b>...'

    batch_update do |row|
      begin
        value = JSON.parse(row[:value])
      rescue JSON::ParserError
        next
      end
      value.delete('migratedToS3')
      from(:storage_apps).where(id: row[:id]).update(value: value.to_json)
    end
  end
end

# Update rows in batches.
def batch_update
  offset = 0
  batch_size = 1000
  loop do
    batch = from(:storage_apps).order(:id).offset(offset).limit(batch_size)
    break if batch.count == 0
    batch.each do |row|
      yield row
    end
    ChatClient.log "#{offset + batch.count} <b>channels</b> processed."
    offset += batch_size
  end
end
