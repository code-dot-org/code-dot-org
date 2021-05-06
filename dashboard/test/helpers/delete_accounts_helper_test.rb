require 'test_helper'
require 'testing/storage_apps_test_utils'
require 'cdo/delete_accounts_helper'
require_relative '../../../pegasus/test/fixtures/mock_pegasus'

#
# This test is the comprehensive spec on the desired behavior when purging a
# user from our system (that is, hard-deleting a user).  If you need to change
# the user purge process, start by testing the desired behavior here, then work
# your way down to the appropriate implementation point.
#
# Purging a user is an irreversible operation.  We don't delete every row that
# has ever been associated with that user, but we do remove all sensitive
# information, anything that might possibly be used to identify the particular
# user, and anything we don't need to keep around for our metrics.
#
# Getting this right is important for compliance with various privacy
# regulations around the globe, so changes to this behavior should be carefully
# reviewed by the product team.
#
class DeleteAccountsHelperTest < ActionView::TestCase
  include StorageAppsTestUtils

  NULL_STREAM = File.open File::NULL, 'w'

  def run(*_args, &_block)
    PEGASUS_DB.transaction(rollback: :always, auto_savepoint: true) {super}
  end

  setup do
    # Skip security logging to Slack in test
    ChatClient.stubs(:message)

    # Skip real S3 operations in this test
    AWS::S3.stubs(:create_client)
    [SourceBucket, AssetBucket, AnimationBucket, FileBucket].each do |bucket|
      bucket.any_instance.stubs(:hard_delete_channel_content)
    end

    # Skip real Firebase operations
    FirebaseHelper.stubs(:delete_channel)
    FirebaseHelper.stubs(:delete_channels)

    # Global log used to check expected log output
    @log = StringIO.new
  end

  test 'sets purged_at' do
    user = create :student
    assert_nil user.purged_at

    purge_user user

    refute_nil user.purged_at
  end

  test 'skips previously purged user' do
    user = create :student, purged_at: Time.now
    refute_nil user.purged_at

    user.expects(:destroy).never
    purge_user user

    refute_nil user.purged_at
    assert_logged 'User is already purged'
  end

  # It shouldn't be possible under the current system to create multiple
  # accounts with the same email, but as of March 2019 we do have some users in
  # our database that share emails.
  test 'purges all accounts associated with email' do
    email = 'fakeuser@example.com'
    account1 = create :student
    account2 = create :teacher
    account3 = create :student

    [account1, account2, account3].each do |account|
      account.primary_contact_info.email = email
      account.primary_contact_info.hashed_email = User.hash_email(email)
      account.primary_contact_info.save!(validate: false)
    end

    account1.destroy
    account2.destroy

    [account1, account2, account3].each(&:reload)
    refute_nil account1.deleted_at
    refute_nil account2.deleted_at
    assert_nil account3.deleted_at
    assert_nil account1.purged_at
    assert_nil account2.purged_at
    assert_nil account3.purged_at

    purge_all_accounts_with_email email

    [account1, account2, account3].each(&:reload)
    refute_nil account1.deleted_at
    refute_nil account2.deleted_at
    refute_nil account3.deleted_at
    refute_nil account1.purged_at
    refute_nil account2.purged_at
    refute_nil account3.purged_at
  end

  test 'clears user.name' do
    user = create :student
    refute_nil user.name

    purge_user user

    assert_nil user.name
  end

  test 'anonymizes user.username' do
    user = create :student
    refute_nil user.username
    refute_match /^sys_deleted_\w{8}$/, user.username

    purge_user user

    assert_match /^sys_deleted_\w{8}$/, user.username
  end

  test 'clears user.*_sign_in_ip' do
    user = create :student,
      current_sign_in_ip: '192.168.0.1',
      last_sign_in_ip: '10.0.0.1'
    refute_nil user.current_sign_in_ip
    refute_nil user.last_sign_in_ip

    purge_user user

    assert_nil user.current_sign_in_ip
    assert_nil user.last_sign_in_ip
  end

  test 'clears user email fields' do
    user = create :teacher,
      parent_email: 'fake-parent-email@example.com'
    refute_empty user.email
    refute_empty user.hashed_email
    refute_nil user.parent_email

    purge_user user

    assert_empty user.email
    assert_empty user.hashed_email
    assert_nil user.parent_email
  end

  test 'clears password fields' do
    user = create :student,
      reset_password_token: 'fake-reset-password-token'
    refute_nil user.encrypted_password
    refute_nil user.reset_password_token
    refute_nil user.secret_picture
    refute_nil user.secret_words

    purge_user user

    assert_nil user.encrypted_password
    assert_nil user.reset_password_token
    assert_nil user.secret_picture
    assert_nil user.secret_words
  end

  test 'clears primary_contact_info but not provider type' do
    user = create :student,
      provider: 'clever',
      uid: 'fake-clever-uid'
    assert_equal 'migrated', user.provider
    refute_nil user.primary_contact_info
    assert_equal 'fake-clever-uid', user.primary_contact_info.authentication_id

    purge_user user

    assert_equal 'migrated', user.provider
    assert_nil user.uid
    assert_nil user.primary_contact_info
  end

  test 'clears school information' do
    user = create :teacher,
      full_address: 'fake-full-address',
      school: 'fake-school-info',
      school_info: create(:school_info)
    refute_nil user.full_address
    refute_nil user.school
    refute_nil user.school_info_id

    purge_user user

    assert_nil user.full_address
    assert_nil user.school
    assert_nil user.school_info_id
  end

  test 'clears user properties' do
    user = create :teacher,
      ops_first_name: 'test-value',
      ops_last_name: 'test-value',
      district_id: 'test-value',
      ops_school: 'test-value',
      ops_gender: 'test-value',
      using_text_mode: 'test-value',
      last_seen_school_info_interstitial: 'test-value',
      oauth_refresh_token: 'test-value',
      oauth_token: 'test-value',
      oauth_token_expiration: 'test-value',
      sharing_disabled: 'test-value',
      next_census_display: 'test-value'
    refute_equal({}, user.properties)

    purge_user user

    assert_equal({}, user.properties)
  end

  test 'leaves urm and races for US users' do
    user = create :student, :within_united_states, races: 'white,hispanic'
    assert_equal true, user.urm
    assert_equal 'white,hispanic', user.races

    purge_user user

    assert_equal true, user.urm
    assert_equal 'white,hispanic', user.races
  end

  test 'clears urm and races for non-US users' do
    user = create :student, :outside_united_states, races: 'white,hispanic'
    assert_equal true, user.urm
    assert_equal 'white,hispanic', user.races

    purge_user user

    assert_nil user.urm
    assert_nil user.races
  end

  test 'removes StudioPerson if it was only tied to this user' do
    user = create :teacher
    studio_person = user.studio_person
    refute_nil user.studio_person_id

    purge_user user

    assert_nil user.studio_person_id
    assert_empty StudioPerson.where(id: studio_person.id)
  end

  test "only removes association with StudioPerson if it's tied to other users" do
    user = create :teacher
    studio_person = user.studio_person
    refute_nil user.studio_person_id
    other_user = create :teacher, studio_person: studio_person
    assert_equal user.studio_person_id, other_user.studio_person_id

    purge_user user

    assert_nil user.studio_person_id
    refute_nil other_user.studio_person_id
    refute_empty StudioPerson.where(id: studio_person.id)
  end

  test 'clears sensitive user location data' do
    user = create :student, :within_united_states
    user_geo = user.user_geos.first
    refute_nil user_geo.ip_address
    refute_nil user_geo.city
    refute_nil user_geo.state
    refute_nil user_geo.country
    refute_nil user_geo.postal_code
    refute_nil user_geo.latitude
    refute_nil user_geo.longitude

    purge_user user

    user_geo.reload
    assert_nil user_geo.ip_address
    assert_nil user_geo.city
    assert_nil user_geo.postal_code
    assert_nil user_geo.latitude
    assert_nil user_geo.longitude
    # Note: Does not delete state or country
    refute_nil user_geo.state
    refute_nil user_geo.country
  end

  test 'does not purge dependent students of a teacher' do
    student = create :student_in_picture_section
    teacher = student.teachers.first
    assert_includes teacher.dependent_students.map {|s| s[:id]}, student.id

    assert_nil teacher.purged_at
    assert_nil student.purged_at

    purge_user teacher

    student.reload
    refute_nil teacher.purged_at
    assert_nil student.purged_at
  end

  test 'purged student still passes validations' do
    user = create :student
    assert user.valid?

    purge_user user

    assert user.valid?
  end

  test 'purged teacher still passes validations' do
    user = create :teacher
    assert user.valid?

    purge_user user

    assert user.valid?
  end

  #
  # Table: dashboard.user_permissions
  #

  test "revokes the user's permissions" do
    safe_permissions = UserPermission::VALID_PERMISSIONS - [
      UserPermission::FACILITATOR,
      UserPermission::WORKSHOP_ORGANIZER,
      UserPermission::PROGRAM_MANAGER
    ]

    user = create :teacher
    safe_permissions.each {|perm| user.permission = perm}
    safe_permissions.each {|perm| assert user.permission? perm}
    refute_empty UserPermission.where(user_id: user.id)

    purge_user user

    safe_permissions.each {|perm| refute user.permission? perm}
    assert_empty UserPermission.where(user_id: user.id)
  end

  test 'revokes any and all permissions if bypassing safety constraints' do
    all_permissions = UserPermission::VALID_PERMISSIONS

    user = create :teacher
    all_permissions.each {|perm| user.permission = perm}
    all_permissions.each {|perm| assert user.permission? perm}
    refute_empty UserPermission.where(user_id: user.id)

    unsafe_purge_user user

    all_permissions.each {|perm| refute user.permission? perm}
    assert_empty UserPermission.where(user_id: user.id)
  end

  test "revokes the user's admin status" do
    user = create :admin

    assert user.admin?

    purge_user user

    refute user.admin?
  end

  #
  # Table: dashboard.sections
  #

  test "soft-deletes all of a user's owned sections" do
    user = create :teacher
    section_a = create :section, user: user
    section_b = create :section, user: user
    section_a.destroy

    assert section_a.deleted?
    refute section_b.deleted?

    purge_user user

    section_a.reload
    section_b.reload
    assert section_a.deleted?
    assert section_b.deleted?
  end

  test "removes name from all of a user's owned sections" do
    user = create :teacher
    section_a = create :section, user: user
    section_b = create :section, user: user
    section_a.destroy

    refute_nil section_a.name
    refute_nil section_b.name

    purge_user user

    section_a.reload
    section_b.reload
    assert_nil section_a.name
    assert_nil section_b.name
  end

  test "removes code from all of a user's owned sections" do
    user = create :teacher
    section_a = create :section, user: user
    section_b = create :section, user: user
    section_a.destroy

    refute_nil section_a.code
    refute_nil section_b.code

    purge_user user

    section_a.reload
    section_b.reload
    assert_nil section_a.code
    assert_nil section_b.code
  end

  #
  # Table: dashboard.followers
  #

  test "hard-deletes all of a hard-deleted student's follower rows" do
    user = create :student
    section = create :section
    section.students << user

    assert_includes user.sections_as_student, section
    assert_includes section.students, user
    refute_empty Follower.where(student_user: user)

    purge_user user
    section.reload

    assert_empty user.sections_as_student
    refute_includes section.students, user
    assert_empty Follower.with_deleted.where(student_user: user)
  end

  #
  # Table: dashboard.activities
  # Table: dashboard.overflow_activities
  # Table: dashboard.assessment_activities
  #

  test "clears activities.level_source_id for all of user's activity" do
    activity = create :activity
    user = activity.user

    assert Activity.where(user: user).any?(&:level_source),
      'Expected an activity record that references a level_source to exist for this user'

    purge_user user

    refute Activity.where(user: user).any?(&:level_source),
      'Expected no activity record that references a level source to exist for this user'

    assert_logged "Cleaned 1 Activity"
  end

  # Note: table overflow_activities only exists on production, which makes it
  # difficult to test.

  test 'disconnects assessment activities from level sources' do
    user = create :student
    assessment_activity = create :assessment_activity, user: user

    refute_nil assessment_activity.level_source_id

    purge_user user
    assessment_activity.reload

    assert_nil assessment_activity.level_source_id

    assert_logged "Cleaned 1 AssessmentActivity"
  end

  #
  # Table: dashboard.user_levels
  #

  test "Disconnects user_levels from level_sources" do
    user_level = create :user_level, level_source: create(:level_source)

    refute_nil user_level.level_source_id

    purge_user user_level.user
    user_level.reload

    assert_nil user_level.level_source_id

    assert_logged "Cleaned 1 UserLevel"
  end

  #
  # Table: dashboard.authentication_options
  # Note: acts_as_paranoid
  #

  test "removes the user primary_contact_info" do
    # Problem noticed on 11/29/2018
    # Account purged failed on a user account that had no authentication_options
    # but still had a primary_contact_info
    # Somehow the primary_contact_info for the user had a different user_id than the
    # user being purged.
    # Regardless of how this happened, we should handle it gracefully and clear the
    # association between the user and the authentication_option, without deleting it
    # since we another user may be depending on it.
    other_user = create :user, :with_google_authentication_option
    user = create :user
    user.provider = 'migrated'
    user.primary_contact_info = other_user.primary_contact_info
    user.save!(validate: false)

    assert_equal 1, user.authentication_options.length,
      'Expected user to have exactly one authentication option'
    refute_nil user.primary_contact_info,
      'Expected user to have primary_contact_info'
    refute_equal user.primary_contact_info, user.authentication_options.first,
      "Expected user's primary contact info to not be an authentication option"

    purge_user user

    # Association with purged user is removed
    assert_empty user.authentication_options,
      'Expected user to have no authentication options'
    assert_nil user.primary_contact_info,
      'Expected user to have no primary_contact_info'

    # Did not actually hard-delete the AuthenticationOption still in use by other user
    other_user.reload
    refute_nil other_user.primary_contact_info,
      'Expected other_user to still have primary_contact_info'
  end

  test "removes all of user's authentication option rows" do
    user = create :user,
      :with_clever_authentication_option,
      :with_google_authentication_option
    ids = user.authentication_options.map(&:id)

    assert_equal 3, user.authentication_options.with_deleted.count,
      'Expected user to have three authentication options'
    assert_equal 3, AuthenticationOption.with_deleted.where(id: ids).count,
      'Expected authentication_option rows to be found by id'

    purge_user user

    assert_equal 0, user.authentication_options.with_deleted.count,
      'Expected user to have no authentication options'
    assert_equal 0, AuthenticationOption.with_deleted.where(id: ids).count,
      'Expected authentication_options rows to be deleted'
  end

  test "even removes soft-deleted authentication option rows" do
    user = create :user
    ids = user.authentication_options.map(&:id)
    user.authentication_options.first.destroy

    assert_empty AuthenticationOption.where(id: ids)
    refute_empty AuthenticationOption.with_deleted.where(id: ids)

    purge_user user

    assert_empty AuthenticationOption.where(id: ids)
    assert_empty AuthenticationOption.with_deleted.where(id: ids)
  end

  test "purges user with duplicate authentication option" do
    # Create an user with an Google authentication option,
    # then destroy (soft-delete) the authentication option.
    user = create :user
    auth_id = SecureRandom.uuid
    google_auth = create :google_authentication_option, user: user, email: user.email, authentication_id: auth_id
    google_auth.destroy

    # Recreate the same Google authentication option.
    # Now the user has duplicate authentication options, one active, one soft-deleted.
    create :google_authentication_option, user: user, email: user.email, authentication_id: auth_id
    user.reload

    assert_nothing_raised do
      purge_user user
    end
  end

  #
  # Table: dashboard.authored_hint_view_requests
  #

  test "clears prev_level_source_id from authored_hint_view_requests" do
    user = create :user
    create :authored_hint_view_request, user: user

    assert AuthoredHintViewRequest.where(user: user).any?(&:prev_level_source_id),
      "Expected at least one of user's AuthoredHintViewRequests to have a prev_level_source_id"

    purge_user user

    refute AuthoredHintViewRequest.where(user: user).any?(&:prev_level_source_id),
      "Expected none of user's AuthoredHintViewRequests to have a prev_level_source_id"

    assert_logged "Cleaned 1 AuthoredHintViewRequest"
  end

  test "clears next_level_source_id from authored_hint_view_requests" do
    user = create :user
    create :authored_hint_view_request, user: user

    assert AuthoredHintViewRequest.where(user: user).any?(&:next_level_source_id),
      "Expected at least one of user's AuthoredHintViewRequests to have a next_level_source_id"

    purge_user user

    refute AuthoredHintViewRequest.where(user: user).any?(&:next_level_source_id),
      "Expected none of user's AuthoredHintViewRequests to have a next_level_source_id"
  end

  test "clears final_level_source_id from authored_hint_view_requests" do
    user = create :user
    create :authored_hint_view_request, user: user

    assert AuthoredHintViewRequest.where(user: user).any?(&:final_level_source_id),
      "Expected at least one of user's AuthoredHintViewRequests to have a final_level_source_id"

    purge_user user

    refute AuthoredHintViewRequest.where(user: user).any?(&:final_level_source_id),
      "Expected none of user's AuthoredHintViewRequests to have a final_level_source_id"
  end

  #
  # Table: dashboard.census_submissions
  # These aren't tied directly to the user model.  Instead, we look them up
  # by email address.
  #

  test "deletes census_submissions associated with user email" do
    user = create :teacher
    email = user.email
    submission = create :census_your_school2017v0, submitter_email_address: email
    id = submission.id

    refute_empty Census::CensusSubmission.where(submitter_email_address: email),
      "Expected at least one CensusSubmission under this email"

    purge_user user

    assert_empty Census::CensusSubmission.where(submitter_email_address: email),
      "Expected no CensusSubmissions under this email"
    assert_empty Census::CensusSubmission.where(id: id),
      "Rows are actually gone, not just anonymized"

    assert_logged "Removed 1 CensusSubmission"
  end

  test "deletes census_submission_form_maps associated census_submissions associated with user email" do
    user = create :teacher
    email = user.email
    submission = create :census_your_school2017v0, submitter_email_address: email
    census_submission_form_map = create :census_submission_form_map, :with_form, census_submission: submission
    id = census_submission_form_map.id

    refute_empty Census::CensusSubmissionFormMap.where(id: id),
      "Expected at least one CensusSubmission under this email"

    purge_user user

    assert_empty Census::CensusSubmissionFormMap.where(id: id),
      "Rows are actually gone, not just anonymized"

    assert_logged "Removed 1 CensusSubmissionFormMap"
  end

  test "deletes census_inaccuracy_investigation associated census_submissions associated with user email" do
    census_inaccuracy_investigation = create :census_inaccuracy_investigation
    id = census_inaccuracy_investigation.id
    user = census_inaccuracy_investigation.user
    refute_empty Census::CensusInaccuracyInvestigation.where(id: id),
      "Expected at least one CensusInaccuracyInvestigation under this email"

    purge_user user

    assert_empty Census::CensusInaccuracyInvestigation.where(id: id),
      "Rows are actually gone, not just anonymized"

    assert_logged "Removed 1 CensusInaccuracyInvestigation"
  end

  test "leaves no SchoolInfos referring to the deleted CensusSubmissions" do
    user = create :teacher
    email = user.email
    submission = create :census_your_school2017v0, submitter_email_address: email
    ids = submission.school_infos.map(&:id)

    refute_empty SchoolInfo.where(id: ids).map(&:census_submissions).flatten,
      "Expected at least one SchoolInfo referring back to this CensusSubmission"

    purge_user user

    assert_empty SchoolInfo.where(id: ids).map(&:census_submissions).flatten,
      "Expected no SchoolInfos referring back to this CensusSubmission"
  end

  test "Never remove census submissions if user has blank email" do
    student = create :student
    assert_equal '', student.email

    Census::CensusSubmission.expects(:where).never

    purge_user student
  end

  #
  # Table: dashboard.circuit_playground_discount_applications
  #

  test 'anonymizes signature on circuit_playground_discount_application' do
    application = create :circuit_playground_discount_application, signature: 'Will Halloway'
    user = application.user

    assert_equal 'Will Halloway', application.signature

    purge_user user
    application.reload

    assert_equal '(anonymized signature)', application.signature

    assert_logged "Anonymized 1 CircuitPlaygroundDiscountApplication"
  end

  test 'leaves blank signature blank on circuit_playground_discount_application' do
    application = create :circuit_playground_discount_application
    user = application.user

    assert_nil application.signature

    purge_user user
    application.reload

    assert_nil application.signature

    assert_logged "Anonymized 1 CircuitPlaygroundDiscountApplication"
  end

  test 'removes school id from circuit_playground_discount_application' do
    application = create :circuit_playground_discount_application, school_id: create(:school).id
    user = application.user

    refute_nil application.school_id

    purge_user user
    application.reload

    assert_nil application.school_id

    assert_logged "Anonymized 1 CircuitPlaygroundDiscountApplication"
  end

  #
  # Table: dashboard.email_preferences
  # Associated through the user's email
  #

  test "removes email preference rows for the purged user's email address" do
    user = create :teacher
    email = user.email
    create :email_preference, email: email

    refute_empty EmailPreference.where(email: email)

    purge_user user

    assert_empty EmailPreference.where(email: email)

    assert_logged "Removed 1 EmailPreference"
  end

  test "Never remove email preferences if user has blank email" do
    student = create :student
    assert_equal '', student.email

    EmailPreference.expects(:where).never

    purge_user student
  end

  #
  # Table: dashboard.studio_people
  #

  test "removes StudioPerson if it only belongs to this one account" do
    user = create :teacher
    studio_person_id = user.studio_person_id

    refute_nil user.studio_person_id
    refute_empty StudioPerson.where(id: studio_person_id)

    purge_user user

    assert_nil user.studio_person_id
    assert_empty StudioPerson.where(id: studio_person_id)
  end

  test "leaves StudioPerson if it is linked to more than one account" do
    user = create :teacher
    user2 = create :teacher, studio_person: user.studio_person
    studio_person_id = user.studio_person_id

    refute_nil user.studio_person_id
    refute_nil user2.studio_person_id
    refute_empty StudioPerson.where(id: studio_person_id)

    purge_user user

    assert_nil user.studio_person_id
    refute_nil user2.studio_person_id
    refute_empty StudioPerson.where(id: studio_person_id)
  end

  #
  # Table: dashboard.teacher_feedbacks
  #

  test "purges feedback written by purged teacher" do
    feedback = create :teacher_feedback
    assert TeacherFeedback.with_deleted.exists? id: feedback.id

    purge_user feedback.teacher

    refute TeacherFeedback.with_deleted.exists? id: feedback.id

    assert_logged 'Deleted 1 TeacherFeedback'
  end

  test "soft-deletes and disassociates feedback written to purged student" do
    student = create :student

    feedback = create :teacher_feedback, student: student
    refute feedback.deleted?
    refute_nil feedback.student_id

    deleted_feedback = create :teacher_feedback, student: student, deleted_at: Time.now
    assert deleted_feedback.deleted?
    refute_nil deleted_feedback.student_id

    purge_user student

    feedback.reload
    assert feedback.deleted?
    assert_nil feedback.student_id

    deleted_feedback.reload
    assert deleted_feedback.deleted?
    assert_nil deleted_feedback.student_id

    assert_logged 'Cleared 2 TeacherFeedback'
  end

  #
  # Table: dashboard.pd_applications
  #

  test "soft-deletes pd_applications for user" do
    # The user soft-delete actually does this.
    application = create :pd_teacher1819_application
    refute application.deleted?

    purge_user application.user

    application.reload
    assert application.deleted?
  end

  test "clears form_data from pd_applications for user" do
    application = create :pd_teacher1819_application
    refute_equal '{}', application.form_data

    purge_user application.user

    application.reload
    assert_equal '{}', application.form_data
  end

  test "clears notes from pd_applications for user" do
    application = create :pd_teacher1819_application, notes: 'Test notes'
    refute_nil application.notes

    purge_user application.user

    application.reload
    assert_nil application.notes
  end

  #
  # Table: dashboard.pd_facilitator_program_registrations
  #

  test "clears form_data from pd_facilitator_program_registrations" do
    teacher = create :teacher
    registration = create :pd_facilitator_program_registration, user: teacher
    refute_equal '{}', registration.form_data

    purge_user registration.user

    registration.reload
    assert_equal '{}', registration.form_data
  end

  #
  # Table: dashboard.pd_fit_weekend1819_registrations
  # Associated with user via application
  #

  test "clears form_data from pd_fit_weekend1819_registrations" do
    registration = create :pd_fit_weekend1819_registration
    refute_equal '{}', registration.form_data

    purge_user registration.pd_application.user

    registration.reload
    assert_equal '{}', registration.form_data
  end

  #
  # Table: dashboard.pd_fit_weekend_registrations
  # Associated with user via application
  #

  test "clears form_data from pd_fit_weekend_registrations" do
    registration = create :pd_fit_weekend1920_registration
    refute_equal '{}', registration.form_data

    purge_user registration.pd_application.user

    registration.reload
    assert_equal '{}', registration.form_data
  end

  #
  # Table: dashboard.pd_pre_workshop_surveys
  # Associated with user via enrollment
  #

  test "clears form_data from pd_pre_workshop_surveys" do
    Pd::Workshop.any_instance.stubs(:pre_survey_units_and_lessons).returns([])

    enrollment = create :pd_enrollment, :from_user
    survey = create :pd_pre_workshop_survey,
      pd_enrollment: enrollment,
      form_data_hash: {unit: Pd::PreWorkshopSurvey::UNIT_NOT_STARTED}
    refute_equal '{}', survey.form_data

    purge_user survey.pd_enrollment.user

    survey.reload
    assert_equal '{}', survey.form_data
  end

  #
  # Table: dashboard.pd_regional_partner_contacts
  #

  test "clears form_data from pd_regional_partner_contacts" do
    teacher = create :teacher
    contact = create :pd_regional_partner_contact, user: teacher
    refute_equal '{}', contact.form_data

    purge_user contact.user

    contact.reload
    assert_equal '{}', contact.form_data
  end

  #
  # Table: dashboard.pd_regional_partner_mini_contacts
  #

  test "clears form_data from pd_regional_partner_mini_contacts" do
    RegionalPartner.stubs(:find_by_zip).returns([nil, nil])

    teacher = create :teacher
    mini_contact = create :pd_regional_partner_mini_contact, user: teacher
    refute_equal '{}', mini_contact.form_data

    purge_user mini_contact.user

    mini_contact.reload
    assert_equal '{}', mini_contact.form_data
  end

  #
  # Table: dashboard.pd_regional_partner_program_registrations
  #

  test "clears form_data from pd_regional_partner_program_registrations" do
    teacher = create :teacher
    registration = create :pd_regional_partner_program_registration, user: teacher
    refute_equal '{}', registration.form_data

    purge_user registration.user

    registration.reload
    assert_equal '{}', registration.form_data
  end

  test "sets invalid teachercon from pd_regional_partner_program_registrations" do
    teacher = create :teacher
    registration = create :pd_regional_partner_program_registration, user: teacher
    assert_includes 1..3, registration.teachercon

    purge_user registration.user

    registration.reload
    assert_equal 0, registration.teachercon
  end

  #
  # Table: dashboard.pd_teachercon1819_registrations
  #

  test "clears form_data from pd_teachercon1819_registrations" do
    registration = create :pd_teachercon1819_registration
    refute_equal '{}', registration.form_data

    purge_user registration.user

    registration.reload
    assert_equal '{}', registration.form_data
  end

  test "clears user_id from pd_teachercon1819_registrations" do
    registration = create :pd_teachercon1819_registration
    refute_nil registration.user_id

    purge_user registration.user

    registration.reload
    assert_nil registration.user_id
  end

  #
  # Table: dashboard.pd_teachercon_surveys
  #

  test "clears form_data from pd_teachercon_surveys" do
    enrollment = create :pd_enrollment, :from_user
    survey = create :pd_teachercon_survey,
      pd_enrollment: enrollment
    refute_equal '{}', survey.form_data

    purge_user survey.pd_enrollment.user

    survey.reload
    assert_equal '{}', survey.form_data
  end

  #
  # Table: dashboard.pd_teacher_applications
  #

  test "clears primary_email from pd_teacher_applications" do
    user = create :teacher
    secondary_email = 'secondary@email.com'

    ActiveRecord::Base.connection.exec_query(
      <<-SQL
        INSERT INTO `pd_teacher_applications` (user_id, primary_email, secondary_email, created_at, updated_at, application)
        VALUES (#{user.id}, '#{user.email}', '#{secondary_email}', '#{Time.now.to_s(:db)}', '#{Time.now.to_s(:db)}', '{}')
      SQL
    )

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first

    refute_empty application["primary_email"]

    purge_user user

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first

    assert_empty application["primary_email"]
  end

  test "clears secondary_email from pd_teacher_applications" do
    user = create :teacher
    secondary_email = 'secondary@email.com'

    ActiveRecord::Base.connection.exec_query(
      <<-SQL
        INSERT INTO `pd_teacher_applications` (user_id, primary_email, secondary_email, created_at, updated_at, application)
        VALUES (#{user.id}, '#{user.email}', '#{secondary_email}', '#{Time.now.to_s(:db)}', '#{Time.now.to_s(:db)}', '{}')
      SQL
    )

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first

    refute_empty application["secondary_email"]

    purge_user user

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first

    assert_empty application["secondary_email"]
  end

  test "clears application from pd_teacher_applications" do
    user = create :teacher
    secondary_email = 'secondary@email.com'

    ActiveRecord::Base.connection.exec_query(
      <<-SQL
        INSERT INTO `pd_teacher_applications` (user_id, primary_email, secondary_email, created_at, updated_at, application)
        VALUES (#{user.id}, '#{user.email}', '#{secondary_email}', '#{Time.now.to_s(:db)}', '#{Time.now.to_s(:db)}', '{\"primaryEmail\": \"#{user.email}\"}')
      SQL
    )

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first

    refute_empty application["application"]

    purge_user user

    application = ActiveRecord::Base.connection.exec_query(
      "SELECT * from `pd_teacher_applications` WHERE `pd_teacher_applications`.`user_id` = #{user.id}"
    ).first
    assert_empty application["application"]
  end

  #
  # Table: dashboard.pd_workshop_surveys
  # Associated via enrollment
  #

  test "clears form_data from pd_workshop_surveys" do
    enrollment = create :pd_enrollment, :from_user
    survey = create :pd_workshop_survey, pd_enrollment: enrollment
    refute_equal '{}', survey.form_data

    purge_user survey.pd_enrollment.user

    survey.reload
    assert_equal '{}', survey.form_data
  end

  #
  # Table dashboard.peer_reviews
  # Could delete submitter or viewer
  #

  test "clears submitter_id from peer_reviews if submitter is purged" do
    peer_review = create :peer_review
    refute_nil peer_review.submitter_id

    purge_user peer_review.submitter

    peer_review.reload
    assert_nil peer_review.submitter_id
  end

  test "clears audit_trail from peer_reviews if submitter is purged" do
    peer_review = create :peer_review, audit_trail: 'fake audit trail'
    refute_nil peer_review.audit_trail

    purge_user peer_review.submitter

    peer_review.reload
    assert_nil peer_review.audit_trail
  end

  test "clears reviewer_id from peer_reviews if reviewer is purged" do
    peer_review = create :peer_review, :reviewed
    refute_nil peer_review.reviewer_id

    purge_user peer_review.reviewer

    peer_review.reload
    assert_nil peer_review.reviewer_id
  end

  test "clears data from peer_reviews if reviewer is purged" do
    peer_review = create :peer_review, :reviewed
    refute_nil peer_review.data

    purge_user peer_review.reviewer

    peer_review.reload
    assert_nil peer_review.data
  end

  test "clears audit_trail from peer_reviews if reviewer is purged" do
    peer_review = create :peer_review, :reviewed
    refute_nil peer_review.audit_trail

    purge_user peer_review.reviewer

    peer_review.reload
    assert_nil peer_review.audit_trail
  end

  #
  # Table: dashboard.pd_attendances
  #

  test "soft-deletes pd_attendances when teacher is purged" do
    attendance = create :pd_attendance
    refute attendance.deleted?

    purge_user attendance.teacher

    attendance.reload
    assert attendance.deleted?
  end

  test "clears teacher_id from pd_attendances when teacher is purged" do
    attendance = create :pd_attendance
    refute_nil attendance.teacher_id

    purge_user attendance.teacher

    attendance.reload
    assert_nil attendance.teacher_id
  end

  test "does not soft-delete pd_attendances when marked_by_user is purged" do
    marked_by_user = create :teacher
    attendance = create :pd_attendance
    attendance.update!(marked_by_user: marked_by_user)
    refute attendance.deleted?

    purge_user marked_by_user

    attendance.reload
    refute attendance.deleted?
  end

  test "clears marked_by_user_id from pd_attendances when marked_by_user is purged" do
    marked_by_user = create :teacher
    attendance = create :pd_attendance
    attendance.update!(marked_by_user: marked_by_user)
    refute_nil attendance.marked_by_user_id

    purge_user marked_by_user

    attendance.reload
    assert_nil attendance.marked_by_user_id
  end

  #
  # Table: dashboard.pd_enrollments
  #

  test "clears name from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user
    enrollment.write_attribute :name, 'test-name'
    enrollment.save! validate: false

    refute_nil enrollment.read_attribute :name

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.read_attribute :name
  end

  test "clears first_name from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user, first_name: 'test-name'

    refute_nil enrollment.first_name

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.first_name
  end

  test "clears last_name from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user

    refute_nil enrollment.last_name

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.last_name
  end

  test "clears email from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user

    refute_empty enrollment.email

    purge_user enrollment.user

    enrollment.reload
    assert_empty enrollment.email
  end

  test "clears school from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user
    enrollment.write_attribute :school, 'test-school'
    enrollment.save! validate: false

    refute_nil enrollment.school

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.school
  end

  test "clears user_id from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user

    refute_nil enrollment.user_id

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.user_id
  end

  test "clears school_info_id from pd_enrollments" do
    enrollment = create :pd_enrollment, :from_user

    refute_nil enrollment.school_info_id

    purge_user enrollment.user

    enrollment.reload
    assert_nil enrollment.school_info_id
  end

  #
  # Table: dashboard.survey_results
  #

  test "removes all rows for user from survey_results" do
    teacher_a = create :teacher
    teacher_b = create :teacher
    survey_result_a = create :survey_result, user: teacher_a
    survey_result_b = create :survey_result, user: teacher_a
    survey_result_c = create :survey_result, user: teacher_b

    assert_equal 2, SurveyResult.where(user_id: teacher_a.id).count
    assert_equal 1, SurveyResult.where(user_id: teacher_b.id).count

    purge_user teacher_a

    assert_equal 0, SurveyResult.where(user_id: teacher_a.id).count
    assert_equal 1, SurveyResult.where(user_id: teacher_b.id).count
    refute SurveyResult.where(id: survey_result_a.id).exists?
    refute SurveyResult.where(id: survey_result_b.id).exists?
    assert SurveyResult.where(id: survey_result_c.id).exists?
  end

  #
  # Table: pegasus.contacts
  # Table: pegasus.poste_deliveries
  # Table: pegasus.poste_opens
  #

  test "removes contacts rows for email" do
    user = create :teacher
    email = user.email
    Poste2.create_recipient(user.email, name: user.name, ip_address: '127.0.0.1')

    refute_empty PEGASUS_DB[:contacts].where(email: email)
    contact_ids = PEGASUS_DB[:contacts].where(email: email).map {|s| s[:id]}

    purge_user user

    assert_empty PEGASUS_DB[:contacts].where(email: email)
    assert_empty PEGASUS_DB[:contacts].where(id: contact_ids)
  end

  test "removes contacts rows for email if purging by email" do
    email = 'test@example.com'
    Poste2.create_recipient(email, name: 'Fake name', ip_address: '127.0.0.1')

    refute_empty PEGASUS_DB[:contacts].where(email: email)
    contact_ids = PEGASUS_DB[:contacts].where(email: email).map {|s| s[:id]}

    purge_all_accounts_with_email email

    assert_empty PEGASUS_DB[:contacts].where(email: email)
    assert_empty PEGASUS_DB[:contacts].where(id: contact_ids)
  end

  test "removes poste_deliveries for user" do
    user = create :teacher
    email = user.email
    recipient = Poste2.create_recipient(user.email, name: user.name, ip_address: '127.0.0.1')
    Poste2.send_message('dashboard', recipient)

    refute_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)

    purge_user user

    assert_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
  end

  test "removes poste_deliveries for email if purging by email" do
    email = 'test@example.com'
    recipient = Poste2.create_recipient(email, name: 'Fake name', ip_address: '127.0.0.1')
    Poste2.send_message('dashboard', recipient)

    refute_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)

    purge_all_accounts_with_email email

    assert_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
  end

  test "removes poste_opens for user" do
    user = create :teacher
    email = user.email
    recipient = Poste2.create_recipient(user.email, name: user.name, ip_address: '127.0.0.1')
    id = Poste2.send_message('dashboard', recipient)
    refute_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
    pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    pegasus.get "/o/#{Poste.encrypt(id)}"
    assert DB[:poste_opens].where(delivery_id: id).any?

    purge_user user

    assert_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
    assert_empty DB[:poste_opens].where(delivery_id: id)
  end

  test "removes poste_opens for email if purging by email" do
    email = 'test@example.com'
    recipient = Poste2.create_recipient(email, name: 'Fake name', ip_address: '127.0.0.1')
    id = Poste2.send_message('dashboard', recipient)
    refute_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
    pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    pegasus.get "/o/#{Poste.encrypt(id)}"
    assert DB[:poste_opens].where(delivery_id: id).any?

    purge_all_accounts_with_email email

    assert_empty PEGASUS_DB[:poste_deliveries].where(contact_email: email)
    assert_empty DB[:poste_opens].where(delivery_id: id)
  end

  test "Never removes poste data if user has empty email address" do
    student = create :student
    assert_equal '', student.email

    DeleteAccountsHelper.any_instance.expects(:remove_poste_data).never

    purge_user student
  end

  #
  # Table: pegasus.forms
  # Table: pegasus.form_geos
  #

  test "cleans forms matched by email if purging by email" do
    email = 'test@example.com'
    with_form(email: email) do |_|
      form_ids = PEGASUS_DB[:forms].where(email: email).map {|f| f[:id]}

      refute_empty PEGASUS_DB[:forms].where(id: form_ids)
      assert PEGASUS_DB[:forms].where(id: form_ids).any? {|f| f[:email].present?}

      purge_all_accounts_with_email email

      refute PEGASUS_DB[:forms].where(id: form_ids).any? {|f| f[:email].present?}
    end
  end

  test "cleans forms matched by user_id" do
    user = create :teacher
    with_form(user: user) do |_|
      form_ids = PEGASUS_DB[:forms].where(user_id: user.id).map {|f| f[:id]}

      refute_empty PEGASUS_DB[:forms].where(id: form_ids)
      assert PEGASUS_DB[:forms].where(id: form_ids).any? {|f| f[:email].present?}

      purge_user user

      refute PEGASUS_DB[:forms].where(id: form_ids).any? {|f| f[:email].present?}
    end
  end

  test "removes email from forms" do
    assert_removes_field_from_forms :email, expect: :empty
  end

  test "removes name from forms" do
    assert_removes_field_from_forms :name
  end

  test "removes data from forms" do
    assert_removes_field_from_forms :data, expect: {}.to_json
  end

  test "removes created_ip from forms" do
    assert_removes_field_from_forms :created_ip, expect: :empty
  end

  test "removes updated_ip from forms" do
    assert_removes_field_from_forms :updated_ip, expect: :empty
  end

  test "removes processed_data from forms" do
    assert_removes_field_from_forms :processed_data
  end

  test "removes hashed_email from forms" do
    assert_removes_field_from_forms :hashed_email
  end

  test "removes ip_address from form_geos" do
    assert_removes_field_from_form_geos :ip_address
  end

  test "removes city from form_geos" do
    assert_removes_field_from_form_geos :city
  end

  test "removes state from form_geos" do
    assert_removes_field_from_form_geos :state
  end

  test "removes postal_code from form_geos" do
    assert_removes_field_from_form_geos :postal_code
  end

  test "removes latitude from form_geos" do
    assert_removes_field_from_form_geos :latitude
  end

  test "removes longitude from form_geos" do
    assert_removes_field_from_form_geos :longitude
  end

  #
  # Table: pegasus.storage_apps
  #

  test "soft-deletes all of a soft-deleted user's projects" do
    student = create :student
    with_channel_for student do |storage_app_id, storage_id|
      assert_equal 'active', storage_apps.where(id: storage_app_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'active', app[:state]
      end

      student.destroy

      assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'deleted', app[:state]
      end
    end
  end

  test "soft-deletes all of a purged user's projects" do
    student = create :student
    with_channel_for student do |storage_app_id, storage_id|
      assert_equal 'active', storage_apps.where(id: storage_app_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'active', app[:state]
      end

      purge_user student

      assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'deleted', app[:state]
      end
    end

    assert_logged "Deleted 1 channels"
  end

  test "does not soft-delete anyone else's projects" do
    student_a = create :student
    student_b = create :student
    with_channel_for student_a do |storage_app_id_a|
      with_channel_for student_b do |storage_app_id_b|
        assert_equal 'active', storage_apps.where(id: storage_app_id_a).first[:state]
        assert_equal 'active', storage_apps.where(id: storage_app_id_b).first[:state]

        purge_user student_a

        assert_equal 'deleted', storage_apps.where(id: storage_app_id_a).first[:state]
        assert_equal 'active', storage_apps.where(id: storage_app_id_b).first[:state]
      end
    end
  end

  test "sets updated_at when soft-deleting projects" do
    student = create :student
    Timecop.freeze do
      with_channel_for student do |storage_app_id|
        assert_equal 'active', storage_apps.where(id: storage_app_id).first[:state]
        original_updated_at = storage_apps.where(id: storage_app_id).first[:updated_at]

        Timecop.travel 10

        student.destroy

        assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
        refute_equal original_updated_at.utc.to_s,
          storage_apps.where(id: storage_app_id).first[:updated_at].utc.to_s
      end
    end
  end

  test "soft-delete does not set updated_at on already soft-deleted projects" do
    student = create :student
    Timecop.freeze do
      with_channel_for student do |storage_app_id|
        storage_apps.where(id: storage_app_id).update(state: 'deleted', updated_at: Time.now)

        assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
        original_updated_at = storage_apps.where(id: storage_app_id).first[:updated_at]

        Timecop.travel 10

        student.destroy

        assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
        assert_equal original_updated_at.utc.to_s,
          storage_apps.where(id: storage_app_id).first[:updated_at].utc.to_s
      end
    end
  end

  test "user purge does set updated_at on already soft-deleted projects" do
    student = create :student
    Timecop.freeze do
      with_channel_for student do |storage_app_id|
        storage_apps.where(id: storage_app_id).update(state: 'deleted', updated_at: Time.now)

        assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
        original_updated_at = storage_apps.where(id: storage_app_id).first[:updated_at]

        Timecop.travel 10

        purge_user student

        assert_equal 'deleted', storage_apps.where(id: storage_app_id).first[:state]
        refute_equal original_updated_at.utc.to_s,
          storage_apps.where(id: storage_app_id).first[:updated_at].utc.to_s
      end
    end
  end

  test "clears 'value' for all of a purged user's projects" do
    student = create :student
    with_channel_for student do |storage_app_id, storage_id|
      refute_nil storage_apps.where(id: storage_app_id).first[:value]
      storage_apps.where(storage_id: storage_id).each do |app|
        refute_nil app[:value]
      end

      purge_user student

      assert_nil storage_apps.where(id: storage_app_id).first[:value]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_nil app[:value]
      end
    end
  end

  test "clears 'updated_ip' for all of a purged user's projects" do
    student = create :student
    with_channel_for student do |storage_app_id, storage_id|
      refute_empty storage_apps.where(id: storage_app_id).first[:updated_ip]
      storage_apps.where(storage_id: storage_id).each do |app|
        refute_empty app[:updated_ip]
      end

      purge_user student

      assert_empty storage_apps.where(id: storage_app_id).first[:updated_ip]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_empty app[:updated_ip]
      end
    end
  end

  #
  # Table: dashboard.featured_projects
  #

  test "unfeatures any featured projects owned by soft-deleted user" do
    student = create :student
    with_channel_for student do |storage_app_id|
      featured_project = create :featured_project,
        storage_app_id: storage_app_id,
        featured_at: Time.now

      assert featured_project.featured?

      student.destroy

      featured_project.reload
      refute featured_project.featured?
    end
  end

  test "unfeatures any featured projects owned by purged user" do
    student = create :student
    with_channel_for student do |storage_app_id|
      featured_project = create :featured_project,
        storage_app_id: storage_app_id,
        featured_at: Time.now

      assert featured_project.featured?

      purge_user student

      featured_project.reload
      refute featured_project.featured?
    end
  end

  test "does not change unfeature time on previously unfeatured projects" do
    student = create :student
    featured_time = Time.now - 20
    unfeatured_time = Time.now - 10
    with_channel_for student do |storage_app_id|
      featured_project = create :featured_project,
        storage_app_id: storage_app_id,
        featured_at: featured_time,
        unfeatured_at: unfeatured_time

      refute featured_project.featured?
      assert_equal unfeatured_time.utc.to_s,
        featured_project.unfeatured_at.utc.to_s

      student.destroy

      featured_project.reload
      refute featured_project.featured?
      assert_equal unfeatured_time.utc.to_s,
        featured_project.unfeatured_at.utc.to_s
    end
  end

  #
  # S3: cdo-v3-sources
  # S3: cdo-v3-assets
  # S3: cdo-v3-animations
  # S3: cdo-v3-files
  #
  # Tested together because they've been built to support the same
  # hard_delete_channel_content interface.
  #

  test "SourceBucket: hard-deletes all of user's channels" do
    assert_bucket_hard_deletes_contents SourceBucket
  end

  test "AssetBucket: hard-deletes all of user's channels" do
    assert_bucket_hard_deletes_contents AssetBucket
  end

  test "AnimationBucket: hard-deletes all of user's channels" do
    assert_bucket_hard_deletes_contents AnimationBucket
  end

  test "FileBucket: hard-deletes all of user's channels" do
    assert_bucket_hard_deletes_contents FileBucket
  end

  def assert_bucket_hard_deletes_contents(bucket)
    # Here we are testing that for every one of the user's channels we
    # ask the bucket to delete its contents.  To avoid interacting with S3
    # in this test, we depend on the unit tests for the particular buckets to
    # verify correct hard-delete behavior for that bucket.
    student = create :student
    with_channel_for student do |storage_app_id_a, _|
      with_channel_for student do |storage_app_id_b, storage_id|
        storage_apps.where(id: storage_app_id_a).update(state: 'deleted')

        bucket.any_instance.
          expects(:hard_delete_channel_content).
          with(storage_encrypt_channel_id(storage_id, storage_app_id_a))
        bucket.any_instance.
          expects(:hard_delete_channel_content).
          with(storage_encrypt_channel_id(storage_id, storage_app_id_b))

        purge_user student
      end
    end
  end

  #
  # Firebase
  #

  test "Firebase: deletes content for all of user's channels" do
    student = create :student
    with_channel_for student do |storage_app_id_a, _|
      with_channel_for student do |storage_app_id_b, storage_id|
        storage_apps.where(id: storage_app_id_a).update(state: 'deleted')

        student_channels = [storage_encrypt_channel_id(storage_id, storage_app_id_a),
                            storage_encrypt_channel_id(storage_id, storage_app_id_b)]
        FirebaseHelper.
          expects(:delete_channels).
          with(student_channels)

        purge_user student
        assert_logged "Deleting Firebase contents for 2 channels"
      end
    end
  end

  #
  # contact rollups V2
  #

  test "account deletion stages email for removal from pardot via purge_user" do
    teacher = create :teacher
    teacher_email = teacher.email
    purge_user teacher

    refute_nil ContactRollupsPardotMemory.find_by(email: teacher_email).marked_for_deletion_at
  end

  test "account deletion stages email for removal from pardot via purge_all_accounts_with_email" do
    teacher = create :teacher
    teacher_email = teacher.email
    purge_all_accounts_with_email teacher_email

    refute_nil ContactRollupsPardotMemory.find_by(email: teacher_email).marked_for_deletion_at
  end

  #
  # Testing our utilities
  #

  test 'with_channel_for owns channel' do
    student = create :student

    with_storage_id_for student do |storage_id|
      assert_empty storage_apps.where(storage_id: storage_id)

      with_channel_for student do |storage_app_id|
        assert_equal storage_app_id, storage_apps.where(storage_id: storage_id).first[:id]
      end

      assert_empty storage_apps.where(storage_id: storage_id)
    end
  end

  test 'with_storage_id_for owns id if it does not exist' do
    student = create :student

    assert_empty user_storage_ids.where(user_id: student.id)

    with_storage_id_for student do |storage_id|
      assert_equal storage_id, user_storage_ids.where(user_id: student.id).first[:id]
    end

    assert_empty user_storage_ids.where(user_id: student.id)
  end

  test 'with_storage_id_for does not own id if it does exist' do
    student = create :student
    assert_empty user_storage_ids.where(user_id: student.id)

    user_storage_ids.insert(user_id: student.id)

    refute_empty user_storage_ids.where(user_id: student.id)

    with_storage_id_for student do |storage_id|
      assert_equal storage_id, user_storage_ids.where(user_id: student.id).first[:id]
    end

    refute_empty user_storage_ids.where(user_id: student.id)

    user_storage_ids.where(user_id: student.id).delete
    assert_empty user_storage_ids.where(user_id: student.id)
  end

  #
  # Situations where we'd like to queue the account for manual review.
  #

  test 'refuses to delete facilitator accounts in normal conditions' do
    facilitator = create :facilitator
    assert facilitator.permission? UserPermission::FACILITATOR

    err = assert_raises DeleteAccountsHelper::SafetyConstraintViolation do
      purge_user facilitator
    end

    assert_equal <<~MESSAGE, err.message
      Automated purging of accounts with FACILITATOR permission is not supported at this time.
      If you are a developer attempting to manually purge this account, run

        DeleteAccountsHelper.new(bypass_safety_constraints: true).purge_user(user)

      to bypass this constraint and purge the user from our system.
    MESSAGE
  end

  test 'can delete facilitator account if bypassing safety constraints' do
    facilitator = create :facilitator

    unsafe_purge_user facilitator

    refute_nil facilitator.purged_at
  end

  test 'refuses to delete workshop organizer accounts in normal conditions' do
    workshop_organizer = create :workshop_organizer
    assert workshop_organizer.permission? UserPermission::WORKSHOP_ORGANIZER

    err = assert_raises DeleteAccountsHelper::SafetyConstraintViolation do
      purge_user workshop_organizer
    end

    assert_equal <<~MESSAGE, err.message
      Automated purging of accounts with WORKSHOP_ORGANIZER permission is not supported at this time.
      If you are a developer attempting to manually purge this account, run

        DeleteAccountsHelper.new(bypass_safety_constraints: true).purge_user(user)

      to bypass this constraint and purge the user from our system.
    MESSAGE
  end

  test 'can delete workshop organizer account if bypassing safety constraints' do
    workshop_organizer = create :workshop_organizer

    unsafe_purge_user workshop_organizer

    refute_nil workshop_organizer.purged_at
  end

  test 'refuses to delete program manager accounts in normal conditions' do
    program_manager = create :program_manager
    assert program_manager.permission? UserPermission::PROGRAM_MANAGER

    err = assert_raises DeleteAccountsHelper::SafetyConstraintViolation do
      purge_user program_manager
    end

    assert_equal <<~MESSAGE, err.message
      Automated purging of accounts with PROGRAM_MANAGER permission is not supported at this time.
      If you are a developer attempting to manually purge this account, run

        DeleteAccountsHelper.new(bypass_safety_constraints: true).purge_user(user)

      to bypass this constraint and purge the user from our system.
    MESSAGE
  end

  test 'can delete program manager account if bypassing safety constraints' do
    program_manager = create :program_manager

    unsafe_purge_user program_manager

    refute_nil program_manager.purged_at
  end

  test 'refuses to delete a RegionalPartner.program_managers account in normal conditions' do
    program_manager = create :program_manager

    # Revoke the REGIONAL_PARTNER permission to show we catch this association
    # even if the user doesn't have the related permission.
    program_manager.delete_permission UserPermission::PROGRAM_MANAGER

    assert RegionalPartnerProgramManager.where(program_manager_id: program_manager.id).exists?
    refute program_manager.permission? UserPermission::PROGRAM_MANAGER

    err = assert_raises DeleteAccountsHelper::SafetyConstraintViolation do
      purge_user program_manager
    end

    assert_equal <<~MESSAGE, err.message
      Automated purging of an account listed as a program manager for a regional partner is not supported at this time.
      If you are a developer attempting to manually purge this account, run

        DeleteAccountsHelper.new(bypass_safety_constraints: true).purge_user(user)

      to bypass this constraint and purge the user from our system.
    MESSAGE
  end

  test 'can delete a RegionalPartner.program_managers account if bypassing safety constraints' do
    program_manager = create :program_manager

    # Revoke the REGIONAL_PARTNER permission to show we catch this association
    # even if the user doesn't have the related permission.
    program_manager.delete_permission UserPermission::PROGRAM_MANAGER

    assert RegionalPartnerProgramManager.where(program_manager_id: program_manager.id).exists?
    refute program_manager.permission? UserPermission::PROGRAM_MANAGER

    unsafe_purge_user program_manager

    refute_nil program_manager.purged_at
  end

  test 'does not delete email centric data if there is a live account with the same email' do
    # This behaviour is desired so we don't accidentally delete data related to a live account.
    # teacher created an account and has responded to one of our census surveys.
    teacher_old = create :teacher
    teacher_name = teacher_old.name
    teacher_email = teacher_old.email

    # create the email related data
    create :census_your_school2017v0, submitter_email_address: teacher_email
    refute_empty Census::CensusSubmission.where(submitter_email_address:  teacher_email),
      "Expected at least one CensusSubmission under this email"
    create :email_preference, email: teacher_email
    refute_empty EmailPreference.where(email: teacher_email)
    Poste2.create_recipient(teacher_email, name: teacher_name, ip_address: '127.0.0.1')
    refute_empty PEGASUS_DB[:contacts].where(email: teacher_email)
    # Pardot should not be told to delete the email from its records
    ContactRollupsPardotMemory.expects(:find_or_create_by).never

    # teacher deletes their old account because they no longer teach CS
    teacher_old.destroy!
    # teacher creates a new account because they started teaching CS again.
    create :teacher, email: teacher_email
    # the old teacher account which was soft deleted is now purged by our automated systems.
    purge_user teacher_old

    # confirm that the email related data is still present
    refute_empty Census::CensusSubmission.where(submitter_email_address:  teacher_email),
      "Expected at least one CensusSubmission under this email"
    refute_empty EmailPreference.where(email: teacher_email)
    refute_empty PEGASUS_DB[:contacts].where(email: teacher_email)

    # confirm the old teacher account is purged
    assert teacher_old.purged_at
  end

  private

  def assert_logged(expected_message)
    assert_includes @log.string, expected_message
  end

  #
  # Helper to make this specific set of tests more readable
  # Performs our account purge on the provided user instance, and then reloads
  # that instance so we can assert things about its final state.
  #
  def purge_user(user)
    unpurged_users_before = User.with_deleted.where(purged_at: nil).count

    DeleteAccountsHelper.new(log: @log).purge_user(user)

    # Never allow more than one user to be purged by this operation
    unpurged_users_after = User.with_deleted.where(purged_at: nil).count
    unpurged_users_diff = unpurged_users_after - unpurged_users_before
    assert_includes (-1..0), unpurged_users_diff,
      "Expected purge_user to only purge one user, but " \
      "#{-unpurged_users_diff} users were purged."

    user.reload
  end

  def unsafe_purge_user(user)
    DeleteAccountsHelper.new(log: @log, bypass_safety_constraints: true).purge_user(user)

    user.reload
  end

  def purge_all_accounts_with_email(email)
    DeleteAccountsHelper.new(log: @log).purge_all_accounts_with_email(email)
  end

  def assert_removes_field_from_forms(field, expect: :nil)
    user = create :teacher
    with_form(user: user) do |form_id|
      initial_value = PEGASUS_DB[:forms].where(id: form_id).first[field]
      initial_expectation_msg = "Expected initial #{field} not to be #{expect}"
      case expect
      when :empty
        refute_empty initial_value, initial_expectation_msg
      when :nil
        refute_nil initial_value, initial_expectation_msg
      else
        refute_equal expect, initial_value, initial_expectation_msg
      end

      purge_user user

      cleared_value = PEGASUS_DB[:forms].where(id: form_id).first[field]
      result_expectation_msg = "Expected cleared #{field} to be #{expect} but was #{cleared_value.inspect}"
      case expect
      when :empty
        assert_empty cleared_value, result_expectation_msg
      when :nil
        assert_nil cleared_value, result_expectation_msg
      else
        assert_equal expect, cleared_value, result_expectation_msg
      end
    end
  end

  def assert_removes_field_from_form_geos(field)
    user = create :teacher
    with_form_geo(user) do |form_geo_id|
      initial_value = PEGASUS_DB[:form_geos].where(id: form_geo_id).first[field]
      refute_nil initial_value,
        "Expected initial #{field} not to be nil"

      purge_user user

      cleared_value = PEGASUS_DB[:form_geos].where(id: form_geo_id).first[field]
      assert_nil cleared_value,
        "Expected cleared #{field} to be nil but was #{cleared_value.inspect}"
    end
  end

  #
  # Adds a test row to pegasus.forms, removes it at the end of the block.
  # Should provide either user or email as a param.
  # @param [User] user - A user to be treated as the form submitter.  If provided,
  #   email will be derived from user.
  # @param [String] email - An email for the form submitter.
  # @yields [Integer] The id for the created form.
  #
  def with_form(user: nil, email: nil)
    use_name = user&.name || 'Fake Name'
    use_email = user ? user.email : email
    form_id = PEGASUS_DB[:forms].insert(
      {
        kind: 'DeleteAccountsHelperTestForm',
        secret: SecureRandom.hex,
        data: {
          name: use_name,
          email: use_email
        }.to_json,
        name: use_name,
        email: use_email,
        hashed_email: Digest::MD5.hexdigest(use_email),
        created_at: DateTime.now,
        updated_at: DateTime.now,
        created_ip: '1.2.3.4',
        updated_ip: '1.2.3.4',
        user_id: user&.id,
        processed_data: {
          name: use_name
        }.to_json,
        processed_at: DateTime.now,
      }
    )
    yield form_id
  ensure
    PEGASUS_DB[:forms].where(id: form_id).delete
  end

  #
  # Adds a test row to pegasus.form_geos.
  # @param [User] user to create an associated form.
  # @yields [Integer] the id of the form_geos row.
  #
  def with_form_geo(user)
    with_form(user: user) do |form_id|
      form_geo_id = PEGASUS_DB[:form_geos].insert(
        {
          form_id: form_id,
          created_at: DateTime.now,
          updated_at: DateTime.now,
          ip_address: '1.2.3.4',
          # World's largest ball of twine!
          city: 'Cawker City',
          state: 'Kansas',
          country: 'USA',
          postal_code: '67430',
          latitude: 39.509222,
          longitude: -98.433800,
        }
      )
      yield form_geo_id
    ensure
      PEGASUS_DB[:form_geos].where(id: form_geo_id).delete
    end
  end
end
