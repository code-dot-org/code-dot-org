require 'cdo/hip_chat'
require 'properties_api'

Sequel.migration do
  up do
    HipChat.log 'Copying <b>key value pairs</b> to DynamoDB...'

    # There are currently < 1000 rows in production. Don't bother batching.
    rows = from(:app_properties)
    rows.each do |row|
      begin
        value = PropertyBag.parse_value(row[:value])
      rescue JSON::ParserError
        HipChat.log "<b>Skipping bad key value pair with id #{row[:id]}</b>."
        next
      end

      property_bag = DynamoPropertyBag.new(row[:app_id], row[:storage_id])
      property_bag.set(row[:name], value, row[:updated_ip], row[:updated_at])
    end

    HipChat.log "Finished copying <b>#{rows.count} key value pairs</b> to DynamoDB."
  end

  # This migration is idempotent, so no need to remove the added data if we roll back.
  down do
  end
end
