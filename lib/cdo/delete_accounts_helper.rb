require_relative '../../shared/middleware/helpers/storage_id'
require 'cdo/aws/s3'
require 'cdo/solr'
require 'cdo/solr_helper'

module DeleteAccountsHelper
  OPEN_ENDED_LEVEL_TYPES = %w(
    Applab
    FreeResponse
    Gamelab
    Weblab
  ).freeze

  raise 'No SOLR server configured' unless CDO.solr_server
  SOLR = Solr::Server.new(host: CDO.solr_server)

  # Deletes all project-backed progress associated with a user.
  # @param [Integer] user_id The user to delete the project-backed progress of.
  def self.delete_project_backed_progress(user_id)
    # Query the DB for the user's storage ID.
    user_storage_ids_row = PEGASUS_DB[:user_storage_ids].where(user_id: user_id).first
    return unless user_storage_ids_row
    storage_id = user_storage_ids_row[:id]

    # Delete project data stored on AWS s3.
    s3_client = AWS::S3.create_client
    {
      CDO.animations_s3_bucket => CDO.animations_s3_directory,
      CDO.assets_s3_bucket => CDO.assets_s3_directory,
      CDO.files_s3_bucket => CDO.files_s3_directory,
      CDO.sources_s3_bucket => CDO.sources_s3_directory
    }.each do |bucket, directory|
      unless bucket.present? && directory.present?
        raise "Missing AWS s3 bucket information (bucket: #{bucket}, directory: #{directory})."
      end
      s3_client.buckets[bucket].objects.with_prefix("/#{directory}/#{storage_id}/").delete_all
    end

    # Query the DB for the channel IDs associated with the storage ID, deleting data on Firebase
    # for each.
    PEGASUS_DB[:storage_apps].where(storage_id: storage_id).each do |storage_app|
      encrypted_channel_id = storage_encrypt_channel_id storage_id, storage_app[:id]
      # TODO(asher): This makes more sense as
      #   FirebaseHelper.new.delete_channel(encrypted_channel_id).
      # Refactor FirebaseHelper to allow this.
      FirebaseHelper.new(encrypted_channel_id).delete_channel
    end
  end

  # Removes the link between the user's level-backed progress and the progress itself.
  # @param [Integer] user_id The user to clean the LevelSource-backed progress of.
  def self.clean_level_source_backed_progress(user_id)
    GalleryActivity.where(user_id: user_id).each do |gallery_activity|
      gallery_activity.level_source.try(:clear_data_and_image)
    end
    GalleryActivity.where(user_id: user_id).destroy_all

    UserLevel.where(user_id: user_id).find_each do |user_level|
      user_level.update!(level_source_id: nil)
    end

    Activity.where(user_id: user_id).find_each do |activity|
      activity.update!(level_source_id: nil)
    end

    # Note that the `overflow_activities` table exists only in the production environment.
    if ActiveRecord::Base.connection.data_source_exists? 'overflow_activities'
      OverflowActivity.where(user_id: user_id).find_each do |activity|
        activity.update!(level_source_id: nil)
      end
    end
  end

  # Cleans the responses for all surveys associated with the user.
  # @param [Integer] user_id The user to clean the surveys of.
  def self.clean_survey_responses(user_id)
    SurveyResult.where(user_id: user_id).each(&:clear_open_ended_responses)
  end

  # Purges all student users whose acceptance of our Terms of Service and Privacy Policy
  # is only through the being purged user.
  # NOTE: This method assumes the sections and followers associated with user_id have already been
  # destroyed.
  # @param [Integer] user_id for which to delete orphaned students.
  def self.purge_orphaned_students(user_id)
    section_ids = Section.with_deleted.
      where(user_id: user_id).
      where(login_type: [Section::LOGIN_TYPE_PICTURE, Section::LOGIN_TYPE_WORD]).
      pluck(:id)
    Follower.with_deleted.where(section_id: section_ids).find_each do |follower|
      student_user = User.with_deleted.find_by_id(follower.student_user_id)
      next if student_user.purged_at
      next unless student_user.provider == User::PROVIDER_SPONSORED
      next unless Follower.where(student_user: student_user).count == 0

      purge_user(student_user)
    end
  end

  # Remove all user generated content associated with any PD the user has been through.
  # @param [Integer] The ID of the user to clean the PD content.
  def self.clean_and_destroy_pd_content(user_id)
    PeerReview.where(reviewer_id: user_id).each(&:clear_data)

    PdTeacherApplication.where(user_id: user_id).each(&:destroy)
  end

  # Anonymizes the user by deleting various pieces of PII and PPII from the User and UserGeo models.
  # @param [User] user to be anonymized.
  def self.anonymize_user(user)
    user.clear_user_and_mark_purged

    UserGeo.where(user_id: user.id).each(&:clear_user_geo)

    SignIn.where(user_id: user.id).destroy_all
  end

  # Cleans all sections owned by the user.
  # @param [Integer] The ID of the user to anonymize the sections of.
  def self.anonymize_user_sections(user_id)
    Sections.with_deleted.where(user_id: user_id).each(&:clean_data)
  end

  # Removes all information about the user pertaining to Pardot. This encompasses Pardot itself, the
  # contact_rollups pegasus table (master and reporting), and the contact_rollups_daily pegasus table
  # (reporting only).
  # @param [Integer] The user ID to purge from Pardot.
  def self.remove_from_pardot(user_id)
    pardot_ids = PEGASUS_DB[:contact_rollups].
      select(:pardot_id).
      where(dashboard_user_id: user_id).
      map {|contact_rollup| contact_rollup[:pardot_id]}
    failed_ids = Pardot.delete_prospects(pardot_ids)
    if failed_ids.any?
      raise "Pardot.delete_prospects failed for Pardot IDs #{failed_ids.join(', ')}."
    end

    PEGASUS_DB[:contact_rollups].where(dashboard_user_id: user_id).delete

    PEGASUS_REPORTING_DB[:contact_rollups_daily].where(dashboard_user_id: user_id).delete
  end

  # Removes the SOLR record associated with the user.
  # WARNING: This does not remove SOLR records associated with forms for the user.
  # @param [Integer] The user ID to purge from SOLR.
  def self.remove_from_solr(user_id)
    SolrHelper.delete_document(SOLR, 'user', user_id)
  end

  # Purges (deletes and cleans) various pieces of information owned by the user in our system.
  # Noops if the user is already marked as purged.
  # @param [User] user The user to purge.
  def self.purge_user(user)
    # This early exit is necessary, else we would enter an infinite cycle if two users were both
    # students of the other (via `purge_orphaned_students`).
    return if user.purged_at

    # It is important that user.destroy happen first, as `purge_orphaned_students` assumes the
    # dependent destroys have already been executed.
    user.destroy
    # Note that we do not gate any deletion logic on `user.user_type` as its current state may not
    # be reflective of past state.
    DeleteAccountsHelper.clean_level_source_backed_progress(user.id)
    DeleteAccountsHelper.clean_survey_responses(user.id)
    DeleteAccountsHelper.delete_project_backed_progress(user.id)
    DeleteAccountsHelper.purge_orphaned_students(user.id)
    DeleteAccountsHelper.clean_and_destroy_pd_content(user.id)
    DeleteAccountsHelper.anonymize_user(user)
    DeleteAccountsHelper.anonymize_user_sections(user.id)
    DeleteAccountsHelper.remove_from_pardot(user.id)
    DeleteAccountsHelper.remove_from_solr(user.id)

    user.purged_at = Time.zone.now
    user.save(validate: false)
  end
end
