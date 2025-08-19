require 'cdo/mailjet'
require 'cdo/delete_accounts_helper'

module Services
  module User
    # Scrubs personally identifiable information (PII) from a user. This class removes
    # the following categories of information, deemed highest risk:
    # - IP addresses
    # - Latitude, longitude, and other geolocation data more specific than state or province
    # - Names and usernames
    # - Email addresses
    # - Authentication tokens, secret words, secret pictures, and any other means of authenticating
    # - Physical addresses
    # Intended to be run on soft-deleted users after a 28-day grace period. Not for use on live users as it
    # renders the account unusuable.
    class PiiScrubber < Services::Base
      attr_reader :user, :email

      def initialize(user:)
        raise ArgumentError, 'user must be a soft-deleted User' unless user.is_a?(::User) && user.deleted_at.present?
        @user = user
        @email = user.email.presence || user.read_attribute(:email)
      end

      def call
        user.transaction do
          scrub_user
          scrub_legacy_data
          mark_scrubbed
          @user.save!
          scrub_external_data
        end
      end

      private def scrub_user
        # Email and authentication
        user.authentication_options.with_deleted.each do |ao|
          ao.destroy unless ao.destroyed?
          ao.assign_attributes(email: '', hashed_email: '', authentication_id: nil, data: nil)
          ao.save(validate: false) # Records may be invalid due to duplicate empty string emails
        end
        user.lti_user_identities.with_deleted.order(deleted_at: :desc).each(&:really_destroy!)
        user.email = ''
        user.hashed_email = nil
        user.encrypted_password = nil
        user.reset_password_token = nil
        user.unlock_token = nil
        user.oauth_refresh_token = nil
        user.oauth_token = nil
        user.oauth_token_expiration = nil
        user.parent_email = nil
        user.secret_picture_id = nil
        user.secret_words = nil
        user.studio_person&.destroy # Studio person record may contain emails
        user.facilitator_info&.destroy

        # Users might have multiple accounts with the same email address.
        # If there is a live user with the same email, these data points will not be scrubbed.
        if email.present? && ::User.find_by_email(email).blank?
          EmailPreference.where(email: email).destroy_all
          census_submissions = Census::CensusSubmission.where(submitter_email_address: email)
          csfms = Census::CensusSubmissionFormMap.where(census_submission_id: census_submissions.pluck(:id))
          csfms.destroy_all
          census_submissions.destroy_all
        end

        # Names
        user.name = nil
        user.given_name = nil
        user.family_name = nil
        user.username = SecureRandom.alphanumeric(20)
        user.ops_first_name = nil
        user.ops_last_name = nil

        # Address and location data
        user.full_address = nil
        user.current_sign_in_ip = nil
        user.last_sign_in_ip = nil
        user.data_transfer_agreement_request_ip = nil
        user.user_geos.each(&:clear_user_geo)
      end

      # Legacy delete acccounts helper client for purging data from deprecated tables
      # and Pegasus DB. After Pegasus DB is fully deprecated, we should remove this dependency.
      private def delete_accounts_helper
        @delete_accounts_helper ||= DeleteAccountsHelper.new(bypass_safety_constraints: true)
      end

      # Deletes PII from deprecated tables that no longer have a corresponding ActiveRecord model.
      # Also deletes PII from Pegasus DB, which is planned to for deprecation and should not generally
      # be accessed from Dashboard code. Pegasus DB is a separate database in the RDS cluster, and includes
      # PII such as:
      # - PD applications and forms with email addresses, names, addresses
      # - Email addresses in Poste tables
      # - Location and email data in "forms" tables
      # - Email addresses in contact rollup tables
      private def scrub_legacy_data
        if email.present?
          delete_accounts_helper.clean_and_destroy_pd_content(user.id, email)
          delete_accounts_helper.remove_poste_data(email)
          delete_accounts_helper.remove_census_submissions(email)
          delete_accounts_helper.purge_contact_rollups(email)
        end
        delete_accounts_helper.clean_pegasus_forms_for_user(user)
      end

      # Removes any third-party data that requires an API call. Called after
      # other methods since it is not reversible.
      private def scrub_external_data
        MailJet.delete_contact(email) if email.present? && !::User.exists?(email: email)
      end

      private def mark_scrubbed
        user_data_retention_status = ::User::DataRetentionStatus.find_or_initialize_by(user_id: user.id)
        user_data_retention_status.pii_scrubbed_at = Time.now
        user_data_retention_status.save!
      end
    end
  end
end
