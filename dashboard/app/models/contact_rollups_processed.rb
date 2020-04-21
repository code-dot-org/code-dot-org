# == Schema Information
#
# Table name: contact_rollups_processed
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  data       :json             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_contact_rollups_processed_on_email  (email) UNIQUE
#

class ContactRollupsProcessed < ApplicationRecord
  self.table_name = 'contact_rollups_processed'

  DEFAULT_BATCH_SIZE = 10000

  # Aggregates data from contact_rollups_raw table and saves the results, one row per email.
  #
  # @param [Integer] batch_size number of records to save per INSERT statement.
  def self.import_from_raw_table(batch_size = DEFAULT_BATCH_SIZE)
    # Combines data and metadata for each record in contact_rollups_raw table into one JSON field.
    # The query result has the same number of rows as in contact_rollups_raw.
    select_query = <<-SQL.squish
      SELECT
        email,
        JSON_OBJECT('sources', sources, 'data', data, 'data_updated_at', data_updated_at) AS data_and_metadata
      FROM contact_rollups_raw
    SQL

    # Groups records by emails. Aggregates all data and metadata belong to an email into one JSON field.
    #
    # Note: use GROUP_CONCAT instead of JSON_OBJECT_AGG because the current Aurora Mysql version in
    # production is 5.7.12, while JSON_OBJECT_AGG is only available from 5.7.22.
    # Because GROUP_CONCAT returns a string, we add a parser function to convert the result to a hash.
    group_by_query = <<-SQL.squish
      SELECT email, CONCAT('[', GROUP_CONCAT(data_and_metadata), ']') AS all_data_and_metadata
      FROM (#{select_query}) AS sub_query
      GROUP BY email
    SQL

    # Process the aggregated data row by row and save the results to DB.
    batch = []
    ActiveRecord::Base.connection.exec_query(group_by_query).each do |contact|
      contact_data = parse_contact_data(contact['all_data_and_metadata'])

      processed_contact_data = {}
      processed_contact_data.merge!(extract_field(contact_data, 'dashboard.email_preferences', 'opt_in') || {})
      processed_contact_data.merge!(extract_updated_at(contact_data) || {})

      batch << {email: contact['email'], data: processed_contact_data}
      next if batch.size < batch_size

      # Note: Skipping validation here because the only validation we need is that an email
      # is unique, which will be done at the DB level anyway thanks to an unique index on email.
      import! batch, validate: false
      batch = []
    end

    import! batch, validate: false unless batch.empty?
  end

  # Parses a JSON string contains all data and metadata of a contact.
  # It will throw exception if cannot parse the entire input string.
  #
  # @param [String] str represents a JSON array. Each array item is a hash {sources:String, data:Hash, data_updated_at:DateTime}.
  # @return [Hash] a hash with string keys {table_name => {field_name => value}}
  def self.parse_contact_data(str)
    parsed_items = JSON.parse(str)

    {}.tap do |output|
      parsed_items.each do |item|
        # In a valid item, only data value could be null
        sources = item['sources']
        data = item['data'] || {}
        data_updated_at = Time.find_zone('UTC').parse(item['data_updated_at'])

        output[sources] = data.merge('data_updated_at' => data_updated_at)
      end
    end
  end

  # Extracts a given field from data compiled from multiple sources.
  #
  # @param [Hash] contact_data compiled data from multiple source tables.
  #   @see output of parse_contact_data method.
  # @return [Hash, nil] a hash containing opt_in key and value (could be nil)
  #   or nil if opt_in does not exist in the input.
  def self.extract_field(contact_data, table, field)
    return nil unless contact_data.key?(table) && contact_data[table].key?(field)
    {field.to_sym => contact_data.dig(table, field)}
  end

  # Extracts the latest data_updated_at value.
  #
  # @param [Hash] contact_data @see output of parse_contact_data method.
  # @return [Hash] a hash containing updated_at key and non-nil value
  #
  # @raise [StandardError] if couldn't find non-nil data_updated_at value
  def self.extract_updated_at(contact_data)
    max_data_updated_at = contact_data.values.map do |item|
      # There MUST be a non-nil data_updated_at value in each item.
      # @see parse_contact_data method and ContactRollupsRaw schema.
      item['data_updated_at']
    end.max

    raise 'Missing data_updated_at value' unless max_data_updated_at
    {updated_at: max_data_updated_at}
  end

  def self.truncate_table
    ActiveRecord::Base.connection.truncate(table_name)
  end
end
