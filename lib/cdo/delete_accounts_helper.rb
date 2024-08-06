require_relative '../../shared/middleware/helpers/storage_id'
require 'cdo/aws/s3'
require 'cdo/mailjet'
require 'cdo/db'

# rubocop:disable CustomCops/PegasusDbUsage
# rubocop:disable CustomCops/DashboardDbUsage
class DeleteAccountsHelper
  class SafetyConstraintViolation < RuntimeError; end

  OPEN_ENDED_LEVEL_TYPES = %w(
    Applab
    FreeResponse
    Gamelab
    Weblab
  ).freeze

  def sql_query_to_anonymize_field(table_name, new_attribute_values, selector)
    set = "SET " + new_attribute_values.map {|k, v| "`#{table_name}`.`#{k}` = #{v}"}.join(', ')
    new_attribute_values.each do |k, v|
      set << ", `#{table_name}`.`#{k}` = #{v}"
    end
    where = "WHERE `#{table_name}`.`#{selector.keys[0]}` = #{selector.values[0]}"
    "UPDATE `#{table_name}` #{set} #{where}"
  end

  # @param [IO|StringIO] log to record granular activity while deleting accounts.
  # @param [Boolean] bypass_safety_constraints to purge accounts without the
  #   usual checks on account type, row limits, etc.  For use only when an
  #   engineer needs to purge an account manually after investigating whatever
  #   prevented it from being automatically purged.
  def initialize(log: $stderr, bypass_safety_constraints: false)
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

    project_ids = DASHBOARD_DB[:projects].where(storage_id: user.user_storage_id).map(:id)
    channel_count = project_ids.count
    encrypted_channel_ids = project_ids.map do |project_id|
      storage_encrypt_channel_id user.user_storage_id, project_id
    end

    # Clear potential PII from user's channels
    DASHBOARD_DB[:projects].
      where(id: project_ids).
      update(value: nil, updated_ip: '', updated_at: Time.now)

    # Clear any comments associated with specific versions of projects.
    # At time of writing, this feature is in use only in Javalab when a student
    # commits their code.
    project_commits = ProjectCommit.where(project_id: project_ids)
    project_commits.each {|version| version.update!(comment: nil)}
    @log.puts "Cleared #{project_commits.count} ProjectCommit comments" if project_commits.count > 0

    # Clear S3 contents for user's channels
    @log.puts "Deleting S3 contents for #{channel_count} channels"
    buckets = [SourceBucket, AssetBucket, AnimationBucket, FileBucket].map(&:new)
    buckets.product(encrypted_channel_ids).each do |bucket, encrypted_channel_id|
      bucket.hard_delete_channel_content encrypted_channel_id
    end

    # Clear Datablock Storage contents for user's projects
    @log.puts "Deleting Datablock Storage contents for #{project_ids.count} projects"
    project_ids.each do |project_id|
      DatablockStorageTable.where(project_id: project_id).delete_all
      DatablockStorageKvp.where(project_id: project_id).delete_all
      DatablockStorageRecord.where(project_id: project_id).delete_all
    end

    @log.puts "Deleted #{channel_count} channels" if channel_count > 0
  end

  # Removes the link between the user's level-backed progress and the progress itself.
  # @param [Integer] user_id The user to clean the LevelSource-backed progress of.
  def clean_level_source_backed_progress(user_id)
    @log.puts "Cleaning UserLevel"
    updated_rows = UserLevel.with_deleted.where(user_id: user_id).update_all(level_source_id: nil)
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
  def clean_and_destroy_pd_content(user_id, user_email)
    @log.puts "Cleaning PD content"
    application_ids = Pd::Application::ApplicationBase.with_deleted.where(user_id: user_id).pluck(:id)
    pd_enrollment_ids = Pd::Enrollment.with_deleted.where(user_id: user_id).pluck(:id)

    # Two different paths to anonymizing attendance records
    Pd::Attendance.with_deleted.where(teacher_id: user_id).update_all(teacher_id: nil, deleted_at: Time.now)
    Pd::Attendance.with_deleted.where(marked_by_user_id: user_id).update_all(marked_by_user_id: nil)

    Pd::RegionalPartnerContact.where(user_id: user_id).update_all(form_data: '{}')
    Pd::RegionalPartnerMiniContact.where(user_id: user_id).update_all(form_data: '{}')

    # SQL query to anonymize Pd::Teachercon1819Registration because the model no longer exists
    ActiveRecord::Base.connection.exec_query(
      sql_query_to_anonymize_field(
        "pd_teachercon1819_registrations",
        {'form_data' => '""'},
        {'user_id' => user_id}
      )
    )

    # SQL query to anonymize Pd::TeacherApplication (2017-18 application) because the model no longer exists
    ActiveRecord::Base.connection.exec_query(
      sql_query_to_anonymize_field(
        "pd_teacher_applications",
        {'primary_email' => '""', 'secondary_email' => '""', 'application' => '""'},
        {'user_id' => user_id}
      )
    )

    # SQL query to anonymize Pd::FacilitatorProgramRegistration because the model no longer exists
    ActiveRecord::Base.connection.exec_query(
      sql_query_to_anonymize_field(
        "pd_facilitator_program_registrations",
        {'form_data' => '""'},
        {'user_id' => user_id}
      )
    )

    # SQL query to anonymize Pd::RegionalPartnerProgramRegistration because the model no longer exists
    ActiveRecord::Base.connection.exec_query(
      sql_query_to_anonymize_field(
        "pd_regional_partner_program_registrations",
        {'form_data' => '""', 'teachercon' => 0},
        {'user_id' => user_id}
      )
    )

    # Peer reviews might be associated with a purged submitter or viewer
    PeerReview.where(submitter_id: user_id).update_all(submitter_id: nil, audit_trail: nil)
    PeerReview.where(reviewer_id: user_id).update_all(reviewer_id: nil, data: nil, audit_trail: nil)

    # Delete survey submissions
    SurveyResult.where(user_id: user_id).destroy_all
    Pd::MiscSurvey.where(user_id: user_id).destroy_all
    Foorm::SimpleSurveySubmission.where(user_id: user_id).each do |simple_submission|
      simple_submission.foorm_submission.destroy
      simple_submission.destroy
    end

    # Delete email history
    Pd::Application::Email.where(to: user_email).destroy_all if user_email.present?

    unless application_ids.empty?
      application_ids.each do |app_id|
        # SQL query to anonymize Pd::FitWeekend1819Registration because the model no longer exists
        ActiveRecord::Base.connection.exec_query(
          sql_query_to_anonymize_field(
            "pd_fit_weekend1819_registrations",
            {'form_data' => '""'},
            {'pd_application_id' => app_id}
          )
        )

        # SQL query to anonymize Pd::FitWeekendRegistrationBase because the model no longer exists
        ActiveRecord::Base.connection.exec_query(
          sql_query_to_anonymize_field(
            "pd_fit_weekend_registrations",
            {'form_data' => '""'},
            {'pd_application_id' => app_id}
          )
        )
      end
      Pd::Application::ApplicationBase.with_deleted.where(id: application_ids).update_all(form_data: '{}', notes: nil)
    end

    unless pd_enrollment_ids.empty?
      Pd::PreWorkshopSurvey.where(pd_enrollment_id: pd_enrollment_ids).update_all(form_data: '{}')
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
    if User.find_by_email(email)
      @log.puts "Skipping 'remove_poste_data' because there is a live account with this email"
      return
    end
    contact_ids = @pegasus_db[:contacts].where(email: email).map(:id)
    delivery_ids = @pegasus_db[:poste_deliveries].where(contact_id: contact_ids).map(:id)
    @pegasus_db[:poste_opens].where(delivery_id: delivery_ids).delete
    @pegasus_db[:poste_deliveries].where(id: delivery_ids).delete
    @pegasus_db[:contacts].where(id: contact_ids).delete
  end

  # Marks emails for deletion from Pardot via contact rollups process.
  def set_pardot_deletion_via_contact_rollups(email)
    if User.find_by_email(email)
      @log.puts "Skipping 'set_pardot_deletion_via_contact_rollups' because there is a live account with this email"
      return
    end
    ContactRollupsPardotMemory.find_or_create_by(email: email).update(marked_for_deletion_at: Time.now.utc)
  end

  def remove_mailjet_contact(email)
    MailJet.delete_contact(email)
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
    if User.find_by_email(email)
      @log.puts "Skipping 'remove_census_submissions' because there is a live account with this email"
      return
    end
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
    if User.find_by_email(email)
      @log.puts "Skipping 'remove_email_preferences' because there is a live account with this email"
      return
    end
    @log.puts "Removing EmailPreference"
    record_count = EmailPreference.where(email: email).delete_all
    @log.puts "Removed #{record_count} EmailPreference" if record_count > 0
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

  def delete_ai_tutor_interactions(user_id)
    chat_messages_to_delete = AiTutorInteraction.where(user_id: user_id)
    count = chat_messages_to_delete.count
    chat_messages_to_delete.in_batches.destroy_all
    @log.puts "Deleted #{count} AI Tutor Interactions" if count > 0
  end

  def delete_rubric_ai_evaluations(user_id)
    # This finds all RubricAiEvaluation records which evalute this user's work,
    # whether they were implicitly requested by the student when they submitted
    # the project, or explicitly requested by their teacher.
    as_student = RubricAiEvaluation.where(user_id: user_id)
    as_student_count = as_student.count
    as_student.each(&:destroy)
    @log.puts "Deleted #{as_student_count} RubricAiEvaluation as student" if as_student_count > 0

    # We've already deleted all evaluations of this user's work as a student.
    # Any remaining evaluations requested by this user are requests made
    # by a teacher to evaluate a student's work.
    as_teacher = RubricAiEvaluation.where(requester_id: user_id)
    as_teacher_count = as_teacher.count
    as_teacher.each(&:destroy)
    @log.puts "Deleted #{as_teacher_count} RubricAiEvaluation as teacher" if as_teacher_count > 0
  end

  def delete_learning_goal_teacher_evaluations(user_id)
    as_student = LearningGoalTeacherEvaluation.where(user_id: user_id)
    as_student_count = as_student.count
    as_student.each(&:destroy)
    @log.puts "Deleted #{as_student_count} LearningGoalTeacherEvaluation as student" if as_student_count > 0

    as_teacher = LearningGoalTeacherEvaluation.where(teacher_id: user_id)
    as_teacher_count = as_teacher.count
    as_teacher.each(&:destroy)
    @log.puts "Deleted #{as_teacher_count} LearningGoalTeacherEvaluation as teacher" if as_teacher_count > 0
  end

  def clean_and_destroy_code_reviews(user_id)
    # anonymize notes the user wrote
    comments_written = CodeReviewComment.where(commenter_id: user_id)
    comments_written_count = comments_written.count
    comments_written.each do |comment|
      comment.comment = nil
      comment.commenter_id = nil
      comment.save!
    end
    comments_written.destroy_all
    @log.puts "Cleared and deleted #{comments_written_count} CodeReviewComment" if comments_written_count > 0
    # Clear comments and soft delete any code reviews for the user.
    code_reviews = CodeReview.where(user_id: user_id)
    code_reviews_count = code_reviews.count
    code_reviews.each do |code_review|
      next unless code_review.comments
      code_review.comments.each do |comment|
        comment.comment = nil
        comment.save!
      end
    end
    # soft delete the code reviews of the user. This also soft deletes any comments on those reviews.
    code_reviews.destroy_all
    @log.puts "Cleared and deleted #{code_reviews_count} CodeReview" if code_reviews_count > 0
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

  def purge_user_authentications(user)
    @log.puts "Deleting user authentication options"
    # Delete most recently destroyed (soft-deleted) record first
    user.authentication_options.with_deleted.order(deleted_at: :desc).each(&:really_destroy!)
  end

  def purge_lti_user_identities(user)
    @log.puts "Deleting lti user identities"
    # Delete most recently destroyed (soft-deleted) record first
    user.lti_user_identities.with_deleted.order(deleted_at: :desc).each(&:really_destroy!)
  end

  def purge_contact_rollups(email)
    @log.puts "Deleting ContactRollups records for email #{email}"
    return unless email

    # Contact rollups data are in 4 tables: ContactRollupsRaw, ContactRollupsProcessed,
    # ContactRollupsPardotMemory, and ContactRollupsFinal.
    # During daily contact rollups runs, ContactRollupsRaw and ContactRollupsProcessed
    # are dropped, records marked for deletion in ContactRollupsPardotMemory are
    # also purged. In addition, records in Pardot server are also deleted.
    # Thus, only need to delete ContactRollupsFinal record here.
    ContactRollupsFinal.find_by_email(email)&.destroy
    set_pardot_deletion_via_contact_rollups(email)
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
    # If the user account was already soft-deleted, then fallback to the :email attribute.
    user_email = (user.email&.blank?) ? user.read_attribute(:email) : user.email

    # There is a bug in our system that causes a user to have duplicate
    # authentication options, one active and one soft-deleted.
    # Purging that user will fail because of ActiveRecord::RecordNotUnique
    # (Mysql2::Error: Duplicate entry) exception.
    # To prevent that issue, hard-deleting authentication options first.
    purge_user_authentications user

    user.destroy

    purge_lti_user_identities(user)
    purge_teacher_feedbacks(user.id)
    clean_and_destroy_code_reviews(user.id)
    remove_census_submissions(user_email) if user_email&.present?
    remove_email_preferences(user_email) if user_email&.present?
    clean_level_source_backed_progress(user.id)
    clean_pegasus_forms_for_user(user)
    delete_project_backed_progress(user)
    delete_ai_tutor_interactions(user.id)
    delete_rubric_ai_evaluations(user.id)
    delete_learning_goal_teacher_evaluations(user.id)
    clean_and_destroy_pd_content(user.id, user_email)
    clean_user_sections(user.id)
    remove_user_from_sections_as_student(user)
    remove_poste_data(user_email) if user_email&.present?
    remove_mailjet_contact(user_email) if user_email&.present?
    purge_contact_rollups(user_email)
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
    set_pardot_deletion_via_contact_rollups(email)
    clean_pegasus_forms_for_email(email)
  end

  private def clean_pegasus_forms_for_user(user)
    @log.puts "Cleaning pegasus forms for user"
    clean_pegasus_forms(@pegasus_db[:forms].where(user_id: user.id))
  end

  private def clean_pegasus_forms_for_email(email)
    clean_pegasus_forms(@pegasus_db[:forms].where(email: email))
  end

  private def clean_pegasus_forms(forms_recordset)
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
# rubocop:enable CustomCops/PegasusDbUsage
# rubocop:enable CustomCops/DashboardDbUsage
