require 'csv'
require 'firebase'

# A wrapper around the firebase gem. For gem documentation, see
# https://github.com/oscardelben/firebase-ruby.
class FirebaseHelper
  def initialize(channel_id)
    raise "CDO.firebase_name not defined" unless CDO.firebase_name
    raise "CDO.firebase_secret not defined" unless CDO.firebase_secret

    raise "channel_id must be non-empty" if channel_id.nil? || channel_id.empty?

    base_uri = "https://#{CDO.firebase_name}.firebaseio.com/"
    @firebase = Firebase::Client.new(base_uri, CDO.firebase_secret)
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

  def delete_channel
    @firebase.delete("/v3/channels/#{@channel_id}/")
  end
end
