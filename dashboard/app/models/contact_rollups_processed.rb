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

  # Aggregates data from contact_rollups_raw table by emails.
  # Processes aggregated data and saves the results to the database, 1 row per email.
  def self.import_from_raw_table
    # Combines data and metadata for each record in contact_rollups_raw table into one JSON field.
    # The query result has the same number of rows as in contact_rollups_raw.
    select_query = <<-SQL.squish
      SELECT email, sources, JSON_MERGE(data, JSON_OBJECT('data_updated_at', data_updated_at)) as data
      FROM contact_rollups_raw
    SQL

    # Groups records by emails. Aggregates all data belong to an email into one JSON field.
    group_by_query = <<-SQL.squish
      SELECT email, JSON_OBJECTAGG(sources, data) AS all_data
      FROM (#{select_query}) AS sub_query
      GROUP BY email
    SQL

    # Process the aggregated data row by row and save the results to DB.
    ActiveRecord::Base.connection.exec_query(group_by_query).each do |contact|
      raw_data = JSON.parse(contact['all_data'])

      processed_data = {}
      processed_data.merge!(extract_opt_in(raw_data) || {})

      create({email: contact['email'], data: processed_data})
    end
  end

  # Extracts opt_in info from contact data.
  #
  # @param [Hash] contact_data compiled data from multiple source tables.
  #   Input hash structure: {source_table => {contact_attribute => value}}
  #
  # @return [Hash, nil] a hash containing opt_in key and value (could be nil)
  #   or nil if opt_in does not exist in the input.
  def self.extract_opt_in(contact_data)
    return nil unless contact_data.key?('dashboard.email_preferences') && contact_data['dashboard.email_preferences'].key?('opt_in')
    {opt_in: contact_data.dig('dashboard.email_preferences', 'opt_in')}
  end
end
