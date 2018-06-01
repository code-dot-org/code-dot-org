require_relative '../../shared/middleware/helpers/storage_id'
require 'cdo/aws/s3'
require 'cdo/db'
require 'cdo/solr'
require 'cdo/solr_helper'

class DeleteAccountsHelper
  OPEN_ENDED_LEVEL_TYPES = %w(
    Applab
    FreeResponse
    Gamelab
    Weblab
  ).freeze

  def initialize(solr: nil)
    raise 'No SOLR server configured' unless solr || CDO.solr_server
    @solr = solr || Solr::Server.new(host: CDO.solr_server)
    @pegasus_db = PEGASUS_DB
    @pegasus_reporting_db = sequel_connect(
      CDO.pegasus_reporting_db_writer,
      CDO.pegasus_reporting_db_reader
    )
  end

  # Deletes all project-backed progress associated with a user.
  # @param [Integer] user_id The user to delete the project-backed progress of.
  def delete_project_backed_progress(user_id)
    # Query the DB for the user's storage ID.
    user_storage_ids_row = @pegasus_db[:user_storage_ids].where(user_id: user_id).first
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
    @pegasus_db[:storage_apps].where(storage_id: storage_id).each do |storage_app|
      encrypted_channel_id = storage_encrypt_channel_id storage_id, storage_app[:id]
      # TODO(asher): This makes more sense as
      #   FirebaseHelper.new.delete_channel(encrypted_channel_id).
      # Refactor FirebaseHelper to allow this.
      FirebaseHelper.new(encrypted_channel_id).delete_channel
    end
  end

  # Removes the link between the user's level-backed progress and the progress itself.
  # @param [Integer] user_id The user to clean the LevelSource-backed progress of.
  def clean_level_source_backed_progress(user_id)
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

    GalleryActivity.where(user_id: user_id).each do |gallery_activity|
      gallery_activity.update!(level_source_id: nil)
    end

    AuthoredHintViewRequest.where(user_id: user_id).each(&:clear_level_source_associations)
  end

  # Cleans the responses for all surveys associated with the user.
  # @param [Integer] user_id The user to clean the surveys of.
  def clean_survey_responses(user_id)
    SurveyResult.where(user_id: user_id).each(&:clear_open_ended_responses)
  end

  # Purges all student users whose acceptance of our Terms of Service and Privacy Policy
  # is only through the being purged user.
  # NOTE: This method assumes the sections and followers associated with user_id have already been
  # destroyed.
  # @param [Integer] user_id for which to delete orphaned students.
  def purge_orphaned_students(user_id)
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

  # Remove all user generated content associated with any PD the user has been through, as well as
  # all PII associated with any PD records.
  # @param [Integer] The ID of the user to clean the PD content.
  def clean_and_destroy_pd_content(user_id)
    PeerReview.where(reviewer_id: user_id).each(&:clear_data)

    Pd::TeacherApplication.where(user_id: user_id).each(&:destroy)
    Pd::FacilitatorProgramRegistration.where(user_id: user_id).each(&:clear_form_data)
    Pd::RegionalPartnerProgramRegistration.where(user_id: user_id).each(&:clear_form_data)
    Pd::WorkshopMaterialOrder.where(user_id: user_id).each(&:clear_data)

    pd_enrollment_id = Pd::Enrollment.where(user_id: user_id).pluck(:id).first
    if pd_enrollment_id
      Pd::TeacherconSurvey.where(pd_enrollment_id: pd_enrollment_id).each(&:clear_form_data)
      Pd::WorkshopSurvey.where(pd_enrollment_id: pd_enrollment_id).each(&:clear_form_data)
      Pd::Enrollment.where(id: pd_enrollment_id).each(&:clear_data)
    end
  end

  # Anonymizes the user by deleting various pieces of PII and PPII
  # @param [User] user to be anonymized.
  def anonymize_user(user)
    UserGeo.where(user_id: user.id).each(&:clear_user_geo)
    SignIn.where(user_id: user.id).destroy_all
    user.clear_user_and_mark_purged
  end

  # Cleans all sections owned by the user.
  # @param [Integer] The ID of the user to anonymize the sections of.
  def remove_user_sections(user_id)
    Section.with_deleted.where(user_id: user_id).each(&:really_destroy!)
  end

  def remove_user_from_sections_as_student(user)
    Follower.with_deleted.where(student_user: user).each(&:really_destroy!)
  end

  # Removes all information about the user pertaining to Pardot. This encompasses Pardot itself, the
  # contact_rollups pegasus table (master and reporting), and the contact_rollups_daily pegasus table
  # (reporting only).
  # @param [Integer] The user ID to purge from Pardot.
  def remove_from_pardot(user_id)
    # Though we have the DB tables in all environments, we only sync data from the production
    # environment with Pardot.
    if rack_env == :production
      pardot_ids = @pegasus_db[:contact_rollups].
        select(:pardot_id).
        where(dashboard_user_id: user_id).
        map {|contact_rollup| contact_rollup[:pardot_id]}
      failed_ids = Pardot.delete_prospects(pardot_ids)
      if failed_ids.any?
        raise "Pardot.delete_prospects failed for Pardot IDs #{failed_ids.join(', ')}."
      end
    end

    @pegasus_db[:contact_rollups].where(dashboard_user_id: user_id).delete
    if @pegasus_reporting_db.table_exists? :contact_rollups_daily
      @pegasus_reporting_db[:contact_rollups_daily].where(dashboard_user_id: user_id).delete
    end
  end

  # Removes the SOLR record associated with the user.
  # WARNING: This does not remove SOLR records associated with forms for the user.
  # @param [Integer] The user ID to purge from SOLR.
  def remove_from_solr(user_id)
    SolrHelper.delete_document(@solr, 'user', user_id)
  end

  # Removes the StudioPerson record associated with the user IF it is not
  # associated with any other users.
  # @param [User] user The user whose studio person we will delete if it's not shared
  def purge_unshared_studio_person(user)
    return unless user.studio_person
    if user.studio_person.users.with_deleted.count <= 1
      user.studio_person.destroy
    end
  end

  # Removes CensusSubmission records associated with this email address.
  # @param [String] email An email address
  def remove_census_submissions(email)
    Census::CensusSubmission.where(submitter_email_address: email).each(&:destroy)
  end

  # Removes EmailPreference records associated with this email address.
  # @param [String] email An email address
  def remove_email_preferences(email)
    EmailPreference.where(email: email).each(&:destroy)
  end

  # Removes signature and school_id from applications for this user
  # @param [User] user
  def anonymize_circuit_playground_discount_application(user)
    user.circuit_playground_discount_application&.anonymize
  end

  # Purges (deletes and cleans) various pieces of information owned by the user in our system.
  # Noops if the user is already marked as purged.
  # @param [User] user The user to purge.
  def purge_user(user)
    # This early exit is necessary, else we would enter an infinite cycle if two users were both
    # students of the other (via `purge_orphaned_students`).
    return if user.purged_at

    user.revoke_all_permissions
    # NOTE: It is important that user.destroy happen early, as `purge_orphaned_students` assumes the
    # dependent destroys have already been executed. Further, doing so early assures the user is not
    # able to access an account in a partially purged state should an exception occur somewhere in
    # this method.
    # NOTE: We do not gate any deletion logic on `user.user_type` as its current state may not be
    # reflective of past state.
    user.destroy
    remove_census_submissions(user.email) if user.email
    remove_email_preferences(user.email) if user.email
    anonymize_circuit_playground_discount_application(user)
    clean_level_source_backed_progress(user.id)
    clean_survey_responses(user.id)
    delete_project_backed_progress(user.id)
    purge_orphaned_students(user.id)
    clean_and_destroy_pd_content(user.id)
    remove_user_sections(user.id)
    remove_user_from_sections_as_student(user)
    remove_from_pardot(user.id)
    remove_from_solr(user.id)
    purge_unshared_studio_person(user)
    anonymize_user(user)

    user.purged_at = Time.zone.now
    user.save(validate: false)
  end

  # Given an email address, locates all accounts (including soft-deleted accounts)
  # associated with that email address and purges each of them in turn.
  # @param [String] email an email address.
  def purge_all_accounts_with_email(email)
    # Note: Not yet taking into account parent_email or users with multiple
    # email addresses tied to their account - we'll have to do that later.
    (
      User.with_deleted.where(email: email) +
      User.with_deleted.where(hashed_email: User.hash_email(email))
    ).each {|u| purge_user u}
  end
end
