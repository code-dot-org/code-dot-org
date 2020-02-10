require 'csv'
require 'firebase'

# A wrapper around the firebase gem. For gem documentation, see
# https://github.com/oscardelben/firebase-ruby.
class FirebaseHelper
  def initialize(channel_id)
    raise "channel_id must be non-empty" if channel_id.nil? || channel_id.empty?
    @firebase = channel_id == 'shared' ? FirebaseHelper.create_shared_client : FirebaseHelper.create_client
    @channel_id = channel_id + CDO.firebase_channel_id_suffix
  end

  # @param [String] table_name The name of the table to query.
  # @return [String] A representation of the table (its columns and its data) as a CSV string.
  def table_as_csv(table_name)
    response = @firebase.get(
      "/v3/channels/#{@channel_id}/storage/tables/#{table_name}/records"
    )
    records = response.body || []

    # The firebase response could be a Hash or a sparse Array
    records = records.values if records.is_a? Hash
    records.compact!

    records.map! {|record| JSON.parse(record)}
    table_to_csv(records, column_order: ['id'])
  end

  def delete_shared_table(table_name)
    @firebase.delete("/v3/channels/shared/counters/tables/#{table_name}")
    @firebase.delete("/v3/channels/shared/storage/tables/#{table_name}/records")
    @firebase.delete("/v3/channels/shared/metadata/tables/#{table_name}/columns")
  end

  def upload_shared_table(table_name, records, columns)
    @firebase.set("/v3/channels/shared/counters/tables/#{table_name}", {"lastId": records.length, "rowCount": records.length})
    @firebase.set("/v3/channels/shared/storage/tables/#{table_name}/records", records)
    @firebase.delete("/v3/channels/shared/metadata/tables/#{table_name}/columns")
    columns.each do |column|
      @firebase.push("v3/channels/shared/metadata/tables/#{table_name}/columns", {columnName: column})
    end
  end

  def get_library_manifest
    response = @firebase.get("/v3/channels/shared/metadata/manifest")
    response.body
  end

  # Important Note: this firebase database is shared across all of our environments.
  # Changes made using this function will be visible immediately in all environments (including prod)
  def set_library_manifest(manifest)
    @firebase.set("/v3/channels/shared/metadata/manifest", manifest)
  end

  def self.delete_channel(encrypted_channel_id)
    raise "channel_id must be non-empty" if encrypted_channel_id.nil? || encrypted_channel_id.empty?
    create_client.delete "/v3/channels/#{encrypted_channel_id}/"
  end

  def self.create_shared_client
    raise "CDO.firebase_shared_secret not defined" unless CDO.firebase_shared_secret
    Firebase::Client.new \
      'https://cdo-v3-shared.firebaseio.com/',
      CDO.firebase_shared_secret
  end

  def self.create_client
    raise "CDO.firebase_name not defined" unless CDO.firebase_name
    raise "CDO.firebase_secret not defined" unless CDO.firebase_secret
    Firebase::Client.new \
      "https://#{CDO.firebase_name}.firebaseio.com/",
      CDO.firebase_secret
  end
end
