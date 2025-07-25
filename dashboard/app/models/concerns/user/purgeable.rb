# frozen_string_literal: true

# Concern for business logic related to user data retention. Includes methods
# relating to deleting personal data and personally identifiable information,
# or otherwise purging data from a user record.
module User::Purgeable
  extend ActiveSupport::Concern

  included do
    SYSTEM_DELETED_USERNAME = 'sys_deleted'
    SOFT_DELETED_RECORD_TTL = 28.days

    has_one :user_data_retention_status, class_name: 'User::DataRetentionStatus'
    delegate :pii_scrubbed_at, to: :user_data_retention_status, allow_nil: true
    delegate :anonymized_at, to: :user_data_retention_status, allow_nil: true
  end

  # Removes PII and other information from the user and marks the user as having been purged.
  # WARNING: This (permanently) destroys data and cannot be undone.
  # WARNING: This does not purge the user, only marks them as such.
  def clear_user_and_mark_purged
    random_suffix = (('0'..'9').to_a + ('a'..'z').to_a).sample(8).join

    authentication_options.with_deleted.each(&:really_destroy!)
    self.primary_contact_info = nil

    self.studio_person_id = nil
    self.name = nil
    self.username = "#{SYSTEM_DELETED_USERNAME}_#{random_suffix}"
    self.current_sign_in_ip = nil
    self.last_sign_in_ip = nil
    self.email = ''
    self.hashed_email = ''
    self.parent_email = nil
    self.encrypted_password = nil
    self.uid = nil
    self.reset_password_token = nil
    self.full_address = nil
    self.secret_picture_id = nil
    self.secret_words = nil
    self.school = nil
    self.school_info_id = nil
    self.properties = {}
    unless within_united_states?
      self.urm = nil
      self.races = nil
    end

    self.purged_at = Time.zone.now

    save!
  end
end
