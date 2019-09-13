require_relative '../../shared/middleware/helpers/storage_id'
require 'cdo/aws/s3'
require 'cdo/db'
require 'cdo/pardot'

class DeleteAccountsHelper
  class SafetyConstraintViolation < RuntimeError; end

  OPEN_ENDED_LEVEL_TYPES = %w(
    Applab
    FreeResponse
    Gamelab
    Weblab
  ).freeze

  # @param [IO|StringIO] log to record granular activity while deleting accounts.
  # @param [Boolean] bypass_safety_constraints to purge accounts without the
  #   usual checks on account type, row limits, etc.  For use only when an
  #   engineer needs to purge an account manually after investigating whatever
  #   prevented it from being automatically purged.
  def initialize(log: STDERR, bypass_safety_constraints: false)
    @pegasus_db = PEGASUS_DB

    @log = log
    raise ArgumentError, 'log must be an IO stream' unless @log.is_a?(IO) || @log.is_a?(StringIO)

    @bypass_safety_constraints = bypass_safety_constraints
    raise ArgumentError, 'bypass_safety_constraints must be boolean' unless [true, false].include? @bypass_safety_constraints
  end

  # Deletes all project-backed progress associated with a user.
  # @param [User] user The user to delete the project-backed progress of.
  def delete_project_backed_progress(user)
    return unless user.user_storage_id

    @log.puts "Deleting project backed progress"

    storage_app_ids = @pegasus_db[:storage_apps].where(storage_id: user.user_storage_id).map(:id)
    channel_count = storage_app_ids.count
    encrypted_channel_ids = storage_app_ids.map do |storage_app_id|
      storage_encrypt_channel_id user.user_storage_id, storage_app_id
    end

    # Clear potential PII from user's channels
    @pegasus_db[:storage_apps].
      where(id: storage_app_ids).
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

    @log.puts "Deleted #{channel_count} channels" if channel_count > 0
  end

  # Removes the link between the user's level-backed progress and the progress itself.
  # @param [Integer] user_id The user to clean the LevelSource-backed progress of.
  def clean_level_source_backed_progress(user_id)
    @log.puts "Cleaning UserLevel"
    updated_rows = UserLevel.where(user_id: user_id).update_all(level_source_id: nil)
    @log.puts "Cleaned #{updated_rows} UserLevel" if updated_rows > 0

    @log.puts "Cleaning Activity"
    updated_rows = Activity.where(user_id: user_id).update_all(level_source_id: nil)
    @log.puts "Cleaned #{updated_rows} Activity" if updated_rows > 0

    # Note that the `overflow_activities` table exists only in the production environment.
    if ActiveRecord::Base.connection.data_source_exists? 'overflow_activities'
      @log.puts "Cleaning OverflowActivity"
      updated_rows = OverflowActivity.where(user_id: user_id).update_all(level_source_id: nil)
      @log.puts "Cleaned #{updated_rows} OverflowActivity" if updated_rows > 0
    end

    @log.puts "Cleaning GalleryActivity"
    updated_rows = GalleryActivity.where(user_id: user_id).update_all(level_source_id: nil)
    @log.puts "Cleaned #{updated_rows} GalleryActivity" if updated_rows > 0

    @log.puts "Cleaning AssessmentActivity"
    updated_rows = AssessmentActivity.where(user_id: user_id).update_all(level_source_id: nil)
    @log.puts "Cleaned #{updated_rows} AssessmentActivity" if updated_rows > 0

    @log.puts "Cleaning AuthoredHintViewRequest"
    updated_rows = AuthoredHintViewRequest.where(user_id: user_id).update_all(
      prev_level_source_id: nil,
      next_level_source_id: nil,
      final_level_source_id: nil
    )
    @log.puts "Cleaned #{updated_rows} AuthoredHintViewRequest" if updated_rows > 0
  end

  # Remove all user generated content associated with any PD the user has been through, as well as
  # all PII associated with any PD records.
  # @param [Integer] The ID of the user to clean the PD content.
  def clean_and_destroy_pd_content(user_id)
    @log.puts "Cleaning PD content"
    application_ids = Pd::Application::ApplicationBase.with_deleted.where(user_id: user_id).pluck(:id)
    pd_enrollment_ids = Pd::Enrollment.with_deleted.where(user_id: user_id).pluck(:id)

    # Two different paths to anonymizing attendance records
    Pd::Attendance.with_deleted.where(teacher_id: user_id).update_all(teacher_id: nil, deleted_at: Time.now)
    Pd::Attendance.with_deleted.where(marked_by_user_id: user_id).update_all(marked_by_user_id: nil)

    Pd::FacilitatorProgramRegistration.where(user_id: user_id).update_all(form_data: '{}')
    Pd::RegionalPartnerProgramRegistration.where(user_id: user_id).update_all(form_data: '{}', teachercon: 0)
    Pd::Teachercon1819Registration.where(user_id: user_id).update_all(form_data: '{}', user_id: nil)
    Pd::RegionalPartnerContact.where(user_id: user_id).update_all(form_data: '{}')

    # Peer reviews might be associated with a purged submitter or viewer
    PeerReview.where(submitter_id: user_id).update_all(submitter_id: nil, audit_trail: nil)
    PeerReview.where(reviewer_id: user_id).update_all(reviewer_id: nil, data: nil, audit_trail: nil)

    SurveyResult.where(user_id: user_id).destroy_all

    unless application_ids.empty?
      # Pd::FitWeekend1819Registration does not inherit from Pd::FitWeekendRegistrationBase so both are needed here
      Pd::FitWeekend1819Registration.where(pd_application_id: application_ids).update_all(form_data: '{}')
      Pd::FitWeekendRegistrationBase.where(pd_application_id: application_ids).update_all(form_data: '{}')
      Pd::Application::ApplicationBase.with_deleted.where(id: application_ids).update_all(form_data: '{}', notes: nil)
    end

    unless pd_enrollment_ids.empty?
      Pd::PreWorkshopSurvey.where(pd_enrollment_id: pd_enrollment_ids).update_all(form_data: '{}')
      Pd::WorkshopSurvey.where(pd_enrollment_id: pd_enrollment_ids).update_all(form_data: '{}')
      Pd::TeacherconSurvey.where(pd_enrollment_id: pd_enrollment_ids).update_all(form_data: '{}')
      Pd::Enrollment.with_deleted.where(id: pd_enrollment_ids).each(&:clear_data)
    end
  end

  # Anonymizes the user by deleting various pieces of PII and PPII
  # @param [User] user to be anonymized.
  def anonymize_user(user)
    @log.puts "Anonymizing user"
    UserGeo.where(user_id: user.id).each(&:clear_user_geo)
    SignIn.where(user_id: user.id).destroy_all
    user.clear_user_and_mark_purged
  end

  # Cleans all sections owned by the user.
  # @param [Integer] The ID of the user to anonymize the sections of.
  def clean_user_sections(user_id)
    @log.puts "Cleaning Section"
    Section.with_deleted.where(user_id: user_id).each do |section|
      section.update! name: nil, code: nil
    end
  end

  def remove_user_from_sections_as_student(user)
    @log.puts "Cleaning Follower"
    Follower.with_deleted.where(student_user: user).each(&:really_destroy!)
  end

  def remove_poste_data(email)
    contact_ids = @pegasus_db[:contacts].where(email: email).map(:id)
    delivery_ids = @pegasus_db[:poste_deliveries].where(contact_id: contact_ids).map(:id)
    @pegasus_db[:poste_opens].where(delivery_id: delivery_ids).delete
    @pegasus_db[:poste_deliveries].where(id: delivery_ids).delete
    @pegasus_db[:contacts].where(id: contact_ids).delete
  end

  def remove_from_pardot_and_contact_rollups(contact_rollups_recordset)
    # TODO: Make this an operation handled by the contact rollups task itself
    #       instead of crossing the architectural boundary ourselves.
    #       For now this is unsafe to run while contact rollups is itself running.
    # Though we have the DB tables in all environments, we only sync data from the production
    # environment with Pardot.
    if CDO.rack_env? :production
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
    @log.puts "Removing from Pardot"
    remove_from_pardot_and_contact_rollups @pegasus_db[:contact_rollups].where(dashboard_user_id: user_id)
  end

  def remove_from_pardot_by_email(email)
    remove_from_pardot_and_contact_rollups @pegasus_db[:contact_rollups].where(email: email)
  end

  # Removes the StudioPerson record associated with the user IF it is not
  # associated with any other users.
  # @param [User] user The user whose studio person we will delete if it's not shared
  def purge_unshared_studio_person(user)
    return unless user.studio_person
    if user.studio_person.users.with_deleted.count <= 1
      @log.puts "Removing StudioPerson"
      user.studio_person.destroy
    end
  end

  # Removes CensusSubmission records associated with this email address.
  # @param [String] email An email address
  def remove_census_submissions(email)
    @log.puts "Removing CensusSubmission"
    census_submissions = Census::CensusSubmission.where(submitter_email_address: email)
    csfms = Census::CensusSubmissionFormMap.where(census_submission_id: census_submissions.pluck(:id))
    deleted_csfm_count = csfms.delete_all
    deleted_submissions_count = census_submissions.delete_all
    @log.puts "Removed #{deleted_csfm_count} CensusSubmissionFormMap" if deleted_csfm_count > 0
    @log.puts "Removed #{deleted_submissions_count} CensusSubmission" if deleted_submissions_count > 0
  end

  # Removes EmailPreference records associated with this email address.
  # @param [String] email An email address
  def remove_email_preferences(email)
    @log.puts "Removing EmailPreference"
    record_count = EmailPreference.where(email: email).delete_all
    @log.puts "Removed #{record_count} EmailPreference" if record_count > 0
  end

  # Removes signature and school_id from applications for this user
  # @param [User] user
  def anonymize_circuit_playground_discount_application(user)
    @log.puts "Anonymizing CircuitPlaygroundDiscountApplication"
    if user.circuit_playground_discount_application
      user.circuit_playground_discount_application.anonymize
      @log.puts "Anonymized 1 CircuitPlaygroundDiscountApplication"
    end
  end

  def purge_teacher_feedbacks(user_id)
    @log.puts "Removing TeacherFeedback"

    # Purge feedback written by target user
    as_teacher = TeacherFeedback.with_deleted.where(teacher_id: user_id)
    as_teacher_count = as_teacher.count
    as_teacher.each(&:really_destroy!)
    @log.puts "Deleted #{as_teacher_count} TeacherFeedback" if as_teacher_count > 0

    # Soft-delete feedback written to target user
    as_student = TeacherFeedback.with_deleted.where(student_id: user_id)
    as_student_count = as_student.count
    as_student.each do |feedback|
      feedback.student = nil
      feedback.destroy
      feedback.save!
    end
    @log.puts "Cleared #{as_student_count} TeacherFeedback" if as_student_count > 0
  end

  def check_safety_constraints(user)
    assert_constraint !user.facilitator?,
      'Automated purging of accounts with FACILITATOR permission is not supported at this time.'
    assert_constraint !user.workshop_organizer?,
      'Automated purging of accounts with WORKSHOP_ORGANIZER permission is not supported at this time.'
    assert_constraint !user.program_manager?,
      'Automated purging of accounts with PROGRAM_MANAGER permission is not supported at this time.'
    assert_constraint RegionalPartnerProgramManager.where(program_manager_id: user.id).empty?,
      'Automated purging of an account listed as a program manager for a regional partner is not supported at this time.'
  end

  def assert_constraint(condition, message)
    return if @bypass_safety_constraints
    unless condition
      raise SafetyConstraintViolation, <<~MESSAGE
        #{message}
        If you are a developer attempting to manually purge this account, run

          DeleteAccountsHelper.new(bypass_safety_constraints: true).purge_user(user)

        to bypass this constraint and purge the user from our system.
      MESSAGE
    end
  end

  # Purges (deletes and cleans) various pieces of information owned by the user in our system.
  # Noops if the user is already marked as purged.
  # @param [User] user The user to purge.
  def purge_user(user)
    if user.purged_at
      @log.puts "User is already purged."
      return
    end
    check_safety_constraints user

    @log.puts "Revoking all user permissions"
    user.revoke_all_permissions

    # NOTE: Calling user.destroy early assures the user is not able to access
    # an account in a partially purged state should an exception occur
    # somewhere in this method.
    # NOTE: Do not gate any deletion logic on `user.user_type`: A student
    # account may be a former teacher account, or vice-versa.
    @log.puts "Soft-deleting user"

    # Cache user email here before destroying user; migrated users have their
    # emails stored in primary_contact_info, which will be destroyed.
    user_email = user.email

    user.destroy

    purge_teacher_feedbacks(user.id)
    remove_census_submissions(user_email) if user_email&.present?
    remove_email_preferences(user_email) if user_email&.present?
    anonymize_circuit_playground_discount_application(user)
    clean_level_source_backed_progress(user.id)
    clean_pegasus_forms_for_user(user)
    delete_project_backed_progress(user)
    clean_and_destroy_pd_content(user.id)
    clean_user_sections(user.id)
    remove_user_from_sections_as_student(user)
    remove_poste_data(user_email) if user_email&.present?
    remove_from_pardot_by_user_id(user.id)
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
    hashed_email = User.hash_email(email)

    # Note: Not yet taking into account parent_email; we'll have to do that
    # later.
    migrated_user_ids = AuthenticationOption.with_deleted.where(hashed_email: hashed_email).map(&:user_id)
    migrated_users = User.with_deleted.where(id: migrated_user_ids)

    unmigrated_users = User.with_deleted.where(hashed_email: User.hash_email(email))

    migrated_users.or(unmigrated_users).each {|u| purge_user u}

    remove_poste_data(email)
    remove_from_pardot_by_email(email)
    clean_pegasus_forms_for_email(email)
  end

  private

  def clean_pegasus_forms_for_user(user)
    @log.puts "Cleaning pegasus forms for user"
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
