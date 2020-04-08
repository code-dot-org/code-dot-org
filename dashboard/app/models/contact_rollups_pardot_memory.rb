# == Schema Information
#
# Table name: contact_rollups_pardot_memory
#
#  id                   :integer          not null, primary key
#  email                :string(255)      not null
#  pardot_id            :integer
#  pardot_id_updated_at :datetime
#  data_synced          :json
#  data_synced_at       :datetime
#  data_rejected_at     :datetime
#  data_rejected_reason :string(255)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# Indexes
#
#  index_contact_rollups_pardot_memory_on_email      (email) UNIQUE
#  index_contact_rollups_pardot_memory_on_pardot_id  (pardot_id) UNIQUE
#

require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemory < ApplicationRecord
  self.table_name = 'contact_rollups_pardot_memory'

  def self.add_and_update_pardot_ids(last_id = nil)
    last_id ||= ContactRollupsPardotMemory.maximum(:pardot_id) || 0

    # TODO: save records in batch using activerecord_import upsert!
    PardotV2.retrieve_new_ids(last_id).each do |mapping|
      pardot_record = find_or_initialize_by(email: mapping[:email])
      pardot_record.pardot_id = mapping[:pardot_id]
      pardot_record.pardot_id_updated_at = Time.now
      pardot_record.save
    end
  end

  def self.create_new_pardot_prospects
    # Finds contacts in contact_rollups_processed but are not in contact_rollups_pardot_memory.
    # Contacts must not be previously rejected by Pardot as invalid emails.
    new_contacts_query = <<-SQL.squish
      SELECT processed.email, processed.data
      FROM contact_rollups_processed AS processed
      LEFT OUTER JOIN contact_rollups_pardot_memory AS pardot
        ON processed.email = pardot.email
      WHERE pardot.pardot_id IS NULL
        AND NOT (pardot.data_rejected_reason <=> '#{PardotHelpers::ERROR_INVALID_EMAIL}')
    SQL

    # Adds contacts to a batch and then sends batch requests to create new Pardot prospects.
    # Requests may not be sent immediately until batch size is big enough.
    pardot_writer = PardotV2.new

    ActiveRecord::Base.connection.exec_query(new_contacts_query).each do |record|
      data_col = JSON.parse(record['data']).deep_symbolize_keys
      contact = {email: record['email']}.merge(data_col)

      submissions, errors = pardot_writer.batch_create_prospects contact
      save_sync_results(submissions, errors, Time.now) if submissions.present?
    end

    # There could be prospects left in the batch because batch size is not yet big enough
    # to trigger a Pardot request. Sends the remaining of the batch to Pardot now.
    submissions, errors = pardot_writer.batch_create_remaining_prospects
    save_sync_results(submissions, errors, Time.now) if submissions.present?
  end

  # TODO: sync contacts that change pardot mappings
  # TODO: sync contacts with updated content
  # TODO: sync deleted contacts

  # Saves sync results to database.
  # @param [Array<Hash>] submissions array of prospects that were synced/submitted to Pardot
  # @param [Array<Hash>] errors array of hashes, each containing an index and an error message
  #   of a rejected prospect. Rejected prospects are a subset of all prospects submitted to Pardot.
  # @param [DateTime] submitted_time when submissions were sent to Pardot
  def self.save_sync_results(submissions, errors, submitted_time)
    rejected_indexes = Set.new errors.pluck(:prospect_index)
    successful_submissions = submissions.reject.with_index do |_, index|
      rejected_indexes.include? index
    end

    rejected_submissions = errors.map do |item|
      submissions[item[:prospect_index]].merge(error_msg: item[:error_msg])
    end

    save_successful_submissions successful_submissions, submitted_time
    save_rejected_submissions rejected_submissions, submitted_time
  end

  def self.save_successful_submissions(submissions, submitted_time)
    # save email, data_synced, data_synced_at
    emails_and_data = submissions.map do |item|
      {
        email: item[:email],
        data_synced: item.except(:email, :id),
        data_synced_at: submitted_time
      }
    end

    import! emails_and_data,
      validate: false,
      on_duplicate_key_update: [:data_synced, :data_synced_at]
  end

  def self.save_rejected_submissions(submissions, submitted_time)
    emails_and_errors = submissions.map do |item|
      {
        email: item[:email],
        data_rejected_reason: item[:error_msg],
        data_rejected_at: submitted_time
      }
    end

    import! emails_and_errors,
      validate: false,
      on_duplicate_key_update: [:data_rejected_reason, :data_rejected_at]
  end
end
