require 'test_helper'
require 'cdo/delete_accounts_helper'
require_relative '../../../shared/middleware/helpers/storage_apps'

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
  setup_all do
    store_initial_pegasus_table_sizes %i{contacts forms form_geos}
  end

  teardown_all do
    check_final_pegasus_table_sizes
  end

  test 'sets purged_at' do
    user = create :student
    assert_nil user.purged_at

    purge_user user

    refute_nil user.purged_at
  end

  test 'purges all accounts associated with email' do
    email = 'fakeuser@example.com'
    account1 = create :student, email: email
    account1.destroy
    account2 = create :teacher, email: email
    account2.destroy
    account3 = create :student, email: email

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

  test 'clears provider uid but not provider type' do
    user = create :student,
      provider: 'clever',
      uid: 'fake-clever-uid'
    assert_equal 'clever', user.provider
    refute_nil user.uid

    purge_user user

    assert_equal 'clever', user.provider
    assert_nil user.uid
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
      ui_tip_dismissed_homepage_header: 'test-value',
      ui_tip_dismissed_teacher_courses: 'test-value',
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
    user = create :teacher
    UserPermission::VALID_PERMISSIONS.each {|perm| user.permission = perm}
    refute_empty UserPermission.where(user_id: user.id)

    purge_user user

    assert_empty UserPermission.where(user_id: user.id)
  end

  test "revokes the user's admin status" do
    user = create :teacher, admin: true
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
  # Table: dashboard.gallery_activities
  #

  test "clears activities.level_source_id for all of user's activity" do
    activity = create :activity
    user = activity.user

    assert Activity.where(user: user).any?(&:level_source),
      'Expected an activity record that references a level_source to exist for this user'

    purge_user user

    refute Activity.where(user: user).any?(&:level_source),
      'Expected no activity record that references a level source to exist for this user'
  end

  # Note: table overflow_activities only exists on production, which makes it
  # difficult to test.

  test 'disconnects gallery activities from level sources' do
    user = create :student
    gallery_activity = create :gallery_activity, user: user

    refute_nil gallery_activity.level_source_id

    purge_user user
    gallery_activity.reload

    assert_nil gallery_activity.level_source_id
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
  end

  #
  # Table: dashboard.authentication_options
  # Note: acts_as_paranoid
  #

  test "removes all of user's authentication option rows" do
    user = create :user,
      :with_clever_authentication_option,
      :with_google_authentication_option,
      :with_email_authentication_option
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
    user = create :user, :with_email_authentication_option
    ids = user.authentication_options.map(&:id)
    user.authentication_options.first.destroy

    assert_empty AuthenticationOption.where(id: ids)
    refute_empty AuthenticationOption.with_deleted.where(id: ids)

    purge_user user

    assert_empty AuthenticationOption.where(id: ids)
    assert_empty AuthenticationOption.with_deleted.where(id: ids)
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
  end

  test 'leaves blank signature blank on circuit_playground_discount_application' do
    application = create :circuit_playground_discount_application
    user = application.user

    assert_nil application.signature

    purge_user user
    application.reload

    assert_nil application.signature
  end

  test 'removes school id from circuit_playground_discount_application' do
    application = create :circuit_playground_discount_application, school_id: create(:school).id
    user = application.user

    refute_nil application.school_id

    purge_user user
    application.reload

    assert_nil application.school_id
  end

  #
  # Table: dashboard.cohorts_users
  # Table: dashboard.cohorts_deleted_users
  #

  test 'removes relationship between user and any cohorts' do
    user = create :teacher
    cohort = create :cohort
    cohort.teachers << user
    cohort.teachers << create(:teacher) # a second teacher

    assert_equal 2, cohort.teachers.size
    assert_equal 0, cohort.deleted_teachers.size

    purge_user user
    cohort.reload

    assert_equal 1, cohort.teachers.size
    assert_equal 0, cohort.deleted_teachers.size
  end

  #
  # Table: dashboard.districts
  # Table: dashboard.districts_users
  #

  test 'removes purged user from any districts' do
    district1 = create :district
    district2 = create :district
    user = create :user
    user.districts << district1
    user.districts << district2

    assert_equal 2, user.districts.count
    assert_includes district1.users, user
    assert_includes district2.users, user

    purge_user user
    district1.reload
    district2.reload

    assert_empty user.districts
    refute_includes district1.users.with_deleted, user
    refute_includes district2.users.with_deleted, user
  end

  test 'removes purged district contact from district' do
    district = create :district
    user = create :user, district_as_contact: district

    assert_equal district, user.district_as_contact
    assert_equal user, district.contact

    purge_user user
    district.reload

    assert_nil user.district_as_contact
    assert_nil district.contact
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

  test "soft-deletes pd_attendances when marked_by_user is purged" do
    marked_by_user = create :teacher
    attendance = create :pd_attendance
    attendance.update!(marked_by_user: marked_by_user)
    refute attendance.deleted?

    purge_user marked_by_user

    attendance.reload
    assert attendance.deleted?
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
  # Table: pegasus.contacts
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

  #
  # Table: pegasus.contact_rollups
  #
  # TODO: To interact correctly with contact_rollups (a table controlled only
  #   by a nightly batch job) we may want to update our user purge to be a
  #   long-running operation; we'll queue a contact purge that the contact
  #   rollups job will take care of, and when all deferred work is done we
  #   will report that the hard-delete is completed.

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

  test "soft-deletes all of a user's projects" do
    storage_apps = PEGASUS_DB[:storage_apps]
    student = create :student
    with_channel_for student do |channel_id, storage_id|
      assert_equal 'active', storage_apps.where(id: channel_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'active', app[:state]
      end

      purge_user student

      assert_equal 'deleted', storage_apps.where(id: channel_id).first[:state]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_equal 'deleted', app[:state]
      end
    end
  end

  test "does not soft-delete anyone else's projects" do
    storage_apps = PEGASUS_DB[:storage_apps]
    student_a = create :student
    student_b = create :student
    with_channel_for student_a do |channel_id_a|
      with_channel_for student_b do |channel_id_b|
        assert_equal 'active', storage_apps.where(id: channel_id_a).first[:state]
        assert_equal 'active', storage_apps.where(id: channel_id_b).first[:state]

        purge_user student_a

        assert_equal 'deleted', storage_apps.where(id: channel_id_a).first[:state]
        assert_equal 'active', storage_apps.where(id: channel_id_b).first[:state]
      end
    end
  end

  test "clears 'value' for all of a user's projects" do
    storage_apps = PEGASUS_DB[:storage_apps]
    student = create :student
    with_channel_for student do |channel_id, storage_id|
      refute_nil storage_apps.where(id: channel_id).first[:value]
      storage_apps.where(storage_id: storage_id).each do |app|
        refute_nil app[:value]
      end

      purge_user student

      assert_nil storage_apps.where(id: channel_id).first[:value]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_nil app[:value]
      end
    end
  end

  test "clears 'updated_ip' all of a user's projects" do
    storage_apps = PEGASUS_DB[:storage_apps]
    student = create :student
    with_channel_for student do |channel_id, storage_id|
      refute_empty storage_apps.where(id: channel_id).first[:updated_ip]
      storage_apps.where(storage_id: storage_id).each do |app|
        refute_empty app[:updated_ip]
      end

      purge_user student

      assert_empty storage_apps.where(id: channel_id).first[:updated_ip]
      storage_apps.where(storage_id: storage_id).each do |app|
        assert_empty app[:updated_ip]
      end
    end
  end

  #
  # Testing our utilities
  #

  test 'with_channel_for owns channel' do
    table = PEGASUS_DB[:storage_apps]
    student = create :student

    with_storage_id_for student do |storage_id|
      assert_empty table.where(storage_id: storage_id)

      with_channel_for student do |channel_id|
        assert_equal channel_id, table.where(storage_id: storage_id).first[:id]
      end

      assert_empty table.where(storage_id: storage_id)
    end
  end

  test 'with_storage_id_for owns id if it does not exist' do
    table = PEGASUS_DB[:user_storage_ids]
    student = create :student

    assert_empty table.where(user_id: student.id)

    with_storage_id_for student do |storage_id|
      assert_equal storage_id, table.where(user_id: student.id).first[:id]
    end

    assert_empty table.where(user_id: student.id)
  end

  test 'with_storage_id_for does not own id if it does exist' do
    table = PEGASUS_DB[:user_storage_ids]
    student = create :student
    assert_empty table.where(user_id: student.id)

    table.insert(user_id: student.id)

    refute_empty table.where(user_id: student.id)

    with_storage_id_for student do |storage_id|
      assert_equal storage_id, table.where(user_id: student.id).first[:id]
    end

    refute_empty table.where(user_id: student.id)

    table.where(user_id: student.id).delete
    assert_empty table.where(user_id: student.id)
  end

  private

  def with_channel_for(owner)
    table = PEGASUS_DB[:storage_apps]
    channels_before = table.count
    with_storage_id_for owner do |storage_id|
      encrypted_channel_id = StorageApps.new(storage_id).create({projectType: 'applab'}, ip: 123)
      _, id = storage_decrypt_channel_id encrypted_channel_id
      yield id, storage_id
    ensure
      table.where(id: id).delete if id
    end
  ensure
    assert_equal channels_before, table.count
  end

  def with_storage_id_for(user)
    table = PEGASUS_DB[:user_storage_ids]
    user_storage_ids_count_before = table.count
    owns_storage_id = false

    storage_id = table.where(user_id: user.id).first&.[](:id)
    unless storage_id
      storage_id = table.insert(user_id: user.id)
      owns_storage_id = true
    end

    yield storage_id
  ensure
    table.where(id: storage_id).delete if owns_storage_id
    assert_equal user_storage_ids_count_before, table.count
  end

  #
  # Helper to make this specific set of tests more readable
  # Performs our account purge on the provided user instance, and then reloads
  # that instance so we can assert things about its final state.
  #
  def purge_user(user)
    SolrHelper.stubs(:delete_document)
    unpurged_users_before = User.with_deleted.where(purged_at: nil).count

    DeleteAccountsHelper.new(solr: {}).purge_user(user)

    # Never allow more than one user to be purged by this operation
    unpurged_users_after = User.with_deleted.where(purged_at: nil).count
    unpurged_users_diff = unpurged_users_after - unpurged_users_before
    assert_includes (-1..0), unpurged_users_diff,
      "Expected purge_user to only purge one user, but " \
      "#{-unpurged_users_diff} users were purged."

    user.reload
  end

  def purge_all_accounts_with_email(email)
    SolrHelper.stubs(:delete_document)
    DeleteAccountsHelper.new(solr: {}).purge_all_accounts_with_email(email)
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

  #
  # Verify that tests clean up affected Pegasus tables properly, since we
  # aren't depending on FactoryBot to do that for us.
  #
  def store_initial_pegasus_table_sizes(table_names)
    @initial_pegasus_table_sizes = table_names.map do |table_name|
      [table_name, PEGASUS_DB[table_name].count]
    end.to_h
  end

  def check_final_pegasus_table_sizes
    @initial_pegasus_table_sizes.each do |table_name, initial_size|
      final_size = PEGASUS_DB[table_name].count
      assert_equal initial_size, final_size,
        "Expected pegasus.#{table_name} to contain #{initial_size} rows but " \
        "it had #{final_size} rows"
    end
  end
end
