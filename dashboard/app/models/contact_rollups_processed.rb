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

  # These JSON object keys are used to compile data from a contact_rollups_raw record
  # into a JSON object. They are shorten to single characters to reduce the size of
  # GROUP_CONCAT result and increase performance.
  SOURCES_KEY = 's'.freeze
  DATA_KEY = 'd'.freeze
  DATA_UPDATED_AT_KEY = 'u'.freeze

  # Aggregates data from contact_rollups_raw table and saves the results, one row per email.
  # @param batch_size [Integer] number of records to save per INSERT statement.
  # @return [Hash] number of valid and invalid contacts (emails) in the raw table
  def self.import_from_raw_table(batch_size = DEFAULT_BATCH_SIZE)
    valid_contacts = 0
    invalid_contacts = 0

    # Process the aggregated data row by row and save the results to DB in batches.
    batch = []
    ContactRollupsV2.retrieve_query_results(get_data_aggregation_query).each do |contact|
      begin
        contact.deep_stringify_keys!
        contact_data = parse_contact_data(contact['all_data_and_metadata'])
        valid_contacts += 1
      rescue StandardError
        invalid_contacts += 1
        next
      end

      processed_contact_data = {}
      processed_contact_data.merge!(extract_opt_in(contact_data))
      processed_contact_data.merge!(extract_updated_at(contact_data) || {})
      batch << {email: contact['email'], data: processed_contact_data}
      next if batch.size < batch_size

      transaction do
        # Note: Skipping validation here because the only validation we need is that an email
        # is unique, which will be done at the DB level anyway thanks to an unique index on email.
        import! batch, validate: false
        batch = []
      end
    end
    transaction {import! batch, validate: false} unless batch.empty?

    {
      valid_contacts: valid_contacts,
      invalid_contacts: invalid_contacts
    }
  end

  def self.get_data_aggregation_query
    # Combines data and metadata for each record in contact_rollups_raw table into one JSON field.
    # The query result has the same number of rows as in contact_rollups_raw.
    data_transformation_query = <<-SQL.squish
      SELECT
        email,
        JSON_OBJECT(
          '#{SOURCES_KEY}', sources,
          '#{DATA_KEY}', data,
          '#{DATA_UPDATED_AT_KEY}', data_updated_at
        ) AS data_and_metadata
      FROM contact_rollups_raw
    SQL

    # Groups records by emails. Aggregates all data and metadata belong to an email into one JSON field.
    # Note: use GROUP_CONCAT instead of JSON_OBJECT_AGG because the current Aurora Mysql version in
    # production is 5.7.12, while JSON_OBJECT_AGG is only available from 5.7.22.
    # Because GROUP_CONCAT returns a string, we add a parser function to convert the result to a hash.
    <<-SQL.squish
      SELECT
        email,
        CONCAT('[', GROUP_CONCAT(data_and_metadata), ']') AS all_data_and_metadata
      FROM (#{data_transformation_query}) AS subquery
      GROUP BY email
    SQL
  end

  # Parses a JSON string containing contact data and metadata.
  # Throw exception if cannot parse the entire input string.
  #
  # @example
  #   Input string:
  #     '[{"sources":"table1", "data":{"opt_in":1}, "data_updated_at":"2020-06-16"}]'
  #   Output hash:
  #     {
  #       'table1'=>{
  #         'opt_in'=>{'value'=>1, 'data_updated_at'=>2020-06-16},
  #         'last_data_updated_at'=>2020-06-16
  #       }
  #     }
  #
  # @pa3ram str [String] a JSON array string.
  #   Each array item is a hash {'sources'=>String, 'data'=>Hash, 'data_updated_at'=>DateTime}.
  # @return [Hash] a hash with string keys.
  #   Output format: {source_table => {field_name => [{'value'=>String, 'data_updated_at'=>DateTime}]}}
  #
  # @raise [JSON::ParserError] if cannot parse the input string to JSON
  # @raise [ArgumentError] if cannot parse a time value in the input string to Time
  def self.parse_contact_data(str)
    parsed_items = JSON.parse(str)

    {}.tap do |output|
      parsed_items.each do |item|
        # In a valid item, only +data+ value could be null
        sources = item[SOURCES_KEY]
        data = item[DATA_KEY] || {}
        data_updated_at = Time.find_zone('UTC').parse(item[DATA_UPDATED_AT_KEY])

        output[sources] ||= {}
        data.each_pair do |field, value|
          output[sources][field] ||= []
          output[sources][field] << {'value' => value, 'data_updated_at' => data_updated_at}
        end

        # if !output[sources].key?('last_data_updated_at') ||
        #   data_updated_at > output[sources]['last_data_updated_at']
        #   output[sources]['last_data_updated_at'] = data_updated_at
        # end
      end
    end
  end

  def self.extract_opt_in(contact_data)
    values = extract_field(contact_data, 'dashboard.email_preferences', 'opt_in')
    # Since there should be no more than one opt_in value per contact,
    # we can just take the first value in the returned array.
    return values.nil? ? {} : {opt_in: values.first}
  end

  # Extracts values of a field in a source table from contact data.
  #
  # @param contact_data [Hash] compiled data from multiple source tables.
  #   @see output of +parse_contact_data+ method.
  # @param table [String]
  # @param field [String]
  # @return [Array, nil] an array of values, or nil if the field or table
  #   does not exist in the contact_data.
  def self.extract_field(contact_data, table, field)
    return nil unless contact_data.key?(table) && contact_data[table].key?(field)
    contact_data.dig(table, field).map {|item| item['value']}
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
