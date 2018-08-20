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
    if solr || CDO.solr_server
      @solr = solr || Solr::Server.new(host: CDO.solr_server)
    end
    @pegasus_db = PEGASUS_DB
  end

  # Deletes all project-backed progress associated with a user.
  # @param [User] user The user to delete the project-backed progress of.
  def delete_project_backed_progress(user)
    return unless user.user_storage_id

    channel_ids = @pegasus_db[:storage_apps].where(storage_id: user.user_storage_id).map(:id)
    encrypted_channel_ids = channel_ids.map do |id|
      storage_encrypt_channel_id user.user_storage_id, id
    end

    # Clear potential PII from user's channels
    @pegasus_db[:storage_apps].
      where(id: channel_ids).
      update(value: nil, updated_ip: '', updated_at: Time.now)

    # Clear S3 contents for user's channels
    buckets = [SourceBucket, AssetBucket, AnimationBucket, FileBucket].map(&:new)
    buckets.product(encrypted_channel_ids).each do |bucket, encrypted_channel_id|
      bucket.hard_delete_channel_content encrypted_channel_id
    end

    # Clear Firebase contents for user's channels
    encrypted_channel_ids.each do |encrypted_channel_id|
      FirebaseHelper.delete_channel encrypted_channel_id
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

  # Remove all user generated content associated with any PD the user has been through, as well as
  # all PII associated with any PD records.
  # @param [User] user being purged
  def clean_and_destroy_pd_content(user)
    user.workshops_as_facilitator = []

    PeerReview.where(reviewer_id: user.id).each(&:clear_data)

    Pd::Application::ApplicationBase.with_deleted.where(user_id: user.id).each do |application|
      application.form_data = '{}'
      application.notes = nil
      application.save! validate: false
    end

    # Two different paths to anonymizing attendance records
    Pd::Attendance.with_deleted.where(teacher_id: user.id).each do |attendance|
      attendance.destroy!
      attendance.update!(teacher_id: nil)
    end
    Pd::Attendance.with_deleted.where(marked_by_user_id: user.id).each do |attendance|
      attendance.update!(marked_by_user_id: nil)
    end

    Pd::TeacherApplication.where(user_id: user.id).each(&:destroy)
    Pd::FacilitatorProgramRegistration.where(user_id: user.id).each(&:clear_form_data)
    Pd::RegionalPartnerProgramRegistration.where(user_id: user.id).each(&:clear_form_data)
    Pd::WorkshopMaterialOrder.where(user_id: user.id).each(&:clear_data)
    Pd::InternationalOptIn.where(user_id: user.id).each(&:clear_form_data)

    pd_enrollment_id = Pd::Enrollment.where(user_id: user.id).pluck(:id).first
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
  def clean_user_sections(user_id)
    Section.with_deleted.where(user_id: user_id).each do |section|
      section.update! name: nil, code: nil
    end
  end

  def remove_user_from_sections_as_student(user)
    Follower.with_deleted.where(student_user: user).each(&:really_destroy!)
  end

  def remove_contacts(email)
    @pegasus_db[:contacts].where(email: email).delete
  end

  def remove_poste_data(email)
    ids = @pegasus_db[:poste_deliveries].where(contact_email: email).map {|x| x[:id]}
    @pegasus_db[:poste_opens].where(delivery_id: ids).delete
    @pegasus_db[:poste_deliveries].where(contact_email: email).delete
  end

  def remove_from_pardot_and_contact_rollups(contact_rollups_recordset)
    # TODO: Make this an operation handled by the contact rollups task itself
    #       instead of crossing the architectural boundary ourselves.
    #       For now this is unsafe to run while contact rollups is itself running.
    # Though we have the DB tables in all environments, we only sync data from the production
    # environment with Pardot.
    if rack_env == :production
      pardot_ids = contact_rollups_recordset.
        select(:pardot_id).
        map {|contact_rollup| contact_rollup[:pardot_id]}
      failed_ids = Pardot.delete_pardot_prospects(pardot_ids)
      if failed_ids.any?
        raise "Pardot.delete_pardot_prospects failed for Pardot IDs #{failed_ids.join(', ')}."
      end
    end
    contact_rollups_recordset.delete
  end

  # Removes all information about the user pertaining to Pardot. This encompasses Pardot itself, the
  # contact_rollups pegasus table (master and reporting)
  # @param [Integer] The user ID to purge from Pardot.
  def remove_from_pardot_by_user_id(user_id)
    remove_from_pardot_and_contact_rollups @pegasus_db[:contact_rollups].where(dashboard_user_id: user_id)
  end

  def remove_from_pardot_by_email(email)
    remove_from_pardot_and_contact_rollups @pegasus_db[:contact_rollups].where(email: email)
  end

  # Removes the SOLR record associated with the user.
  # WARNING: This does not remove SOLR records associated with forms for the user.
  # @param [Integer] The user ID to purge from SOLR.
  def remove_from_solr(user_id)
    return unless @solr
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

  def purge_teacher_feedbacks(user_id)
    # Purge feedback written by target user
    TeacherFeedback.with_deleted.where(teacher_id: user_id).each(&:really_destroy!)
    # Soft-delete feedback written to target user
    TeacherFeedback.with_deleted.where(student_id: user_id).each do |feedback|
      feedback.student = nil
      feedback.destroy
      feedback.save!
    end
  end

  # Purges (deletes and cleans) various pieces of information owned by the user in our system.
  # Noops if the user is already marked as purged.
  # @param [User] user The user to purge.
  def purge_user(user)
    return if user.purged_at

    user.revoke_all_permissions
    # NOTE: Calling user.destroy early assures the user is not able to access
    # an account in a partially purged state should an exception occur
    # somewhere in this method.
    # NOTE: Do not gate any deletion logic on `user.user_type`: A student
    # account may be a former teacher account, or vice-versa.
    user.destroy
    purge_teacher_feedbacks(user.id)
    remove_census_submissions(user.email) if user.email
    remove_email_preferences(user.email) if user.email
    anonymize_circuit_playground_discount_application(user)
    clean_level_source_backed_progress(user.id)
    clean_survey_responses(user.id)
    clean_pegasus_forms_for_user(user)
    delete_project_backed_progress(user)
    clean_and_destroy_pd_content(user)
    clean_user_sections(user.id)
    remove_user_from_sections_as_student(user)
    remove_contacts(user.email) if user.email
    remove_poste_data(user.email) if user.email
    remove_from_pardot_by_user_id(user.id)
    remove_from_solr(user.id)
    purge_unshared_studio_person(user)
    anonymize_user(user)

    user.purged_at = Time.zone.now
    user.save(validate: false)
  end

  # Given an email address, locates all accounts (including soft-deleted accounts)
  # associated with that email address and purges each of them in turn.
  # @param [String] raw_email an email address.
  def purge_all_accounts_with_email(raw_email)
    email = raw_email.to_s.strip.downcase

    # Note: Not yet taking into account parent_email or users with multiple
    # email addresses tied to their account - we'll have to do that later.
    (
      User.with_deleted.where(email: email) +
      User.with_deleted.where(hashed_email: User.hash_email(email))
    ).each {|u| purge_user u}

    remove_from_pardot_by_email(email)
    clean_pegasus_forms_for_email(email)
  end

  private

  def clean_pegasus_forms_for_user(user)
    clean_pegasus_forms(@pegasus_db[:forms].where(user_id: user.id))
  end

  def clean_pegasus_forms_for_email(email)
    clean_pegasus_forms(@pegasus_db[:forms].where(email: email))
  end

  def clean_pegasus_forms(forms_recordset)
    form_ids = forms_recordset.map {|f| f[:id]}
    @pegasus_db[:form_geos].
      where(form_id: form_ids).
      update(
        ip_address: nil,
        city: nil,
        state: nil,
        postal_code: nil,
        latitude: nil,
        longitude: nil,
      )
    forms_recordset.
      update(
        email: '',
        name: nil,
        data: {}.to_json,
        created_ip: '',
        updated_ip: '',
        processed_data: nil,
        hashed_email: nil,
      )
  end
end
