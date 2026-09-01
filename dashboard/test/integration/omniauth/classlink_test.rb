require 'test_helper'
require_relative './utils'

module OmniauthCallbacksControllerTests
  class ClasslinkTest < ActionDispatch::IntegrationTest
    include OmniauthCallbacksControllerTests::Utils

    setup do
      stub_firehose
    end

    test "teacher sign-up" do
      auth_hash = mock_oauth

      post user_classlink_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_classlink_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_teacher created_user, expected_email: 'auth_test@code.org'
      assert created_user.verified_teacher?
      assert_equal 1, created_user.permissions.where(permission: UserPermission::AUTHORIZED_TEACHER).count
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "student sign-up does not auto-verify" do
      auth_hash = mock_oauth role: 'Student'

      post user_classlink_omniauth_authorize_path
      assert_does_not_create(User) do
        get user_classlink_omniauth_callback_path
      end
      assert_response :success
      assert_template 'omniauth/redirect'
      assert PartialRegistration.in_progress? session

      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_STUDENT}
      refute PartialRegistration.in_progress? session

      created_user = User.find signed_in_user_id
      assert_valid_student created_user, expected_email: 'auth_test@code.org'
      refute created_user.verified_teacher?
      assert_credentials auth_hash, created_user
    ensure
      created_user&.destroy!
    end

    test "teacher sign-in" do
      auth_hash = mock_oauth

      teacher = create(:teacher, :classlink_sso_provider, uid: auth_hash.uid)

      sign_in_through_classlink
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal teacher.id, signed_in_user_id
      teacher.reload
      assert teacher.verified_teacher?
      assert_credentials auth_hash, teacher
    end

    test "student sign-in does not auto-verify" do
      auth_hash = mock_oauth role: 'Student'

      student = create(:student, :classlink_sso_provider, uid: auth_hash.uid)

      sign_in_through_classlink
      assert_redirected_to '/'
      follow_redirect!
      assert_redirected_to '/home'
      assert_equal I18n.t('auth.signed_in'), flash[:notice]

      assert_equal student.id, signed_in_user_id
      student.reload
      refute student.verified_teacher?
      assert_credentials auth_hash, student
    end

    test "sign-in via v2 authentication id" do
      # Covers the lookup only. This sign-in also creates the account's v1 anchor,
      # which "sign-in anchors a v2-only account on its UserId" asserts; the
      # creates-nothing steady state is covered by the both-records test below.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'

      sign_in_through_classlink

      assert_equal teacher.id, signed_in_user_id
    end

    test "sign-in via v1 id creates v2 auth option and leaves v1 untouched" do
      teacher = create(:teacher, :classlink_sso_provider, uid: '59777133')
      v1_auth_option = teacher.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      v1_attributes = v1_auth_option.attributes
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'

      assert_creates(AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
      v2_auth_option = teacher.reload.authentication_options.find_by(
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '2222|T5678-0005'
      )
      refute_nil v2_auth_option
      assert_equal AuthenticationOption::Classlink::VERSION[:v2], v2_auth_option.version
      assert_equal v1_attributes, v1_auth_option.reload.attributes
    end

    test "sign-in with both v1 and v2 records creates nothing" do
      teacher = create(:teacher, :classlink_sso_provider, uid: '59777133')
      create(
        :authentication_option,
        user: teacher,
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '2222|T5678-0005',
        version: AuthenticationOption::Classlink::VERSION[:v2]
      )
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'

      assert_does_not_create(User, AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
    end

    test "sign-up creates the auth option with the v2 id and version" do
      auth_hash = mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'

      post user_classlink_omniauth_authorize_path
      get user_classlink_omniauth_callback_path
      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}

      created_user = User.find signed_in_user_id
      auth_option = created_user.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      assert_equal '2222|T5678-0005', auth_option.authentication_id
      assert_equal AuthenticationOption::Classlink::VERSION[:v2], auth_option.version
    ensure
      created_user&.destroy!
    end

    test "sign-in anchors a v2-only account on its UserId" do
      # A signup from an OneRoster district holds only a v2 record. SourcedId can
      # change or stop arriving; the UserId cannot, so sign-in fills in the
      # missing half of the pair while both ids are still in hand.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'

      assert_creates(AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
      v1_auth_option = teacher.reload.authentication_options.find_by(
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '59777133'
      )
      refute_nil v1_auth_option
      assert_nil v1_auth_option.version
    end

    test "a v2-only account anchored at sign-in survives losing its SourcedId" do
      # The whole point of anchoring, as one sequence on one account: the second
      # login is served by the record the first login's builder actually wrote,
      # not by a factory-inserted stand-in. Paired with the negative control
      # below, which shows the second login fails without it.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')

      # District still has OneRoster on. This writes the anchor.
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'
      assert_creates(AuthenticationOption) {sign_in_through_classlink}
      assert_equal teacher.id, signed_in_user_id
      get destroy_user_session_path

      # District has since disabled OneRoster, so no v2 id can be built and only
      # the UserId written above can find this account.
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: ''
      Observability::Errors.expects(:report).never

      assert_does_not_create(User, AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
    end

    test "without the anchor a v2-only account is lost when SourcedId stops arriving" do
      # Negative control for the test above. Suppressing only the anchor leaves the
      # account v2-only, and the second login cannot reach it — it is routed to
      # sign-up instead, which is the duplicate-account/lockout outcome. Without
      # this, the test above could be passing on some unrelated fallback.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')
      Services::Classlink::V1AuthOptionBuilder.stubs(:call).returns(nil)

      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'
      assert_does_not_create(AuthenticationOption) {sign_in_through_classlink}
      assert_equal teacher.id, signed_in_user_id
      get destroy_user_session_path

      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: ''
      sign_in_through_classlink

      refute_equal teacher.id, signed_in_user_id
      assert PartialRegistration.in_progress? session
    end

    test "sign-in succeeds and reports when another account holds the UserId" do
      # A duplicate account holding this UserId is the fingerprint of an orphaning that
      # predates anchoring. The anchor can't be written, which is worth a report, but it
      # must not cost this user their session.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')
      create(:teacher, :classlink_sso_provider, uid: '59777133')
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'T5678-0005'
      Observability::Errors.expects(:report).with(
        'ClassLink v1 auth option not created',
        has_key(:context)
      ).once

      assert_does_not_create(AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
    end

    test "an anchored account signs in after its district disables OneRoster" do
      # The property the anchor exists for. With SourcedId empty no v2 id can be
      # built, so the UserId record is the only thing that can find this account.
      # Without it the lookup misses and sign-up runs, orphaning the account.
      teacher = create(:teacher, :classlink_sso_provider, uid: '2222|T5678-0005')
      create(
        :authentication_option,
        user: teacher,
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '59777133'
      )
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: ''
      Observability::Errors.expects(:report).never

      assert_does_not_create(User, AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
    end

    test "sign-in via the v1 id records a changed SourcedId" do
      # An SIS re-key, or a student moving schools inside the district: the stored
      # v2 id no longer matches the payload, with OneRoster enabled the whole
      # time. The UserId lookup still finds the account.
      teacher = create(:teacher, :classlink_sso_provider, uid: '59777133')
      create(
        :authentication_option,
        user: teacher,
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '2222|OLD-0001',
        version: AuthenticationOption::Classlink::VERSION[:v2]
      )
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: 'NEW-0002'

      assert_creates(AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
      assert teacher.reload.authentication_options.exists?(
        credential_type: AuthenticationOption::CLASSLINK,
        authentication_id: '2222|NEW-0002',
        version: AuthenticationOption::Classlink::VERSION[:v2]
      )
    end

    test "sign-in uses the v1 id when the district sends no SourcedId" do
      # ClassLink sends an empty SourcedId for districts that have not enabled
      # OneRoster. Those users have no v2 identifier and never will, so the v1
      # UserId is their only credential on every sign-in. Nothing is reported:
      # this is a documented normal payload, and reporting it would fire on
      # every sign-in from every such district.
      teacher = create(:teacher, :classlink_sso_provider, uid: '59777133')
      mock_oauth uid: 59_777_133, tenant_id: 2222, sourced_id: ''
      Observability::Errors.expects(:report).never

      assert_does_not_create(User, AuthenticationOption) {sign_in_through_classlink}

      assert_equal teacher.id, signed_in_user_id
    end

    test "sign-up with no SourcedId creates the auth option with the v1 id and nil version" do
      # Same district shape on the sign-up path: with no SourcedId there is no
      # v2 id to build, so the account is created on ClassLink's UserId exactly
      # as it would have been before the v2 format existed. version stays nil,
      # which is what marks a v1 id.
      auth_hash = mock_oauth uid: '59777133', tenant_id: 2222, sourced_id: ''

      post user_classlink_omniauth_authorize_path
      get user_classlink_omniauth_callback_path
      assert_creates(User) {finish_sign_up auth_hash, User::TYPE_TEACHER}

      created_user = User.find signed_in_user_id
      auth_option = created_user.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      assert_equal '59777133', auth_option.authentication_id
      assert_nil auth_option.version
    ensure
      created_user&.destroy!
    end

    private def mock_oauth(role: 'Teacher', uid: nil, tenant_id: nil, sourced_id: nil)
      auth_hash = generate_auth_hash(
        {
          provider: AuthenticationOption::CLASSLINK,
          user_type: nil,
          email: "#{role.downcase}@school.test",
          uid: uid,
        }.compact
      )
      # district_id and external_id mirror what omniauth-classlink derives from
      # the TenantId and SourcedId fields of ClassLink's v2/my/info response.
      # SourcedId is empty for districts that have not enabled OneRoster, so a
      # blank external_id is a normal payload, not a malformed one.
      auth_hash.info.district_id = tenant_id
      auth_hash.info.external_id = sourced_id
      auth_hash.extra = OmniAuth::AuthHash.new(
        raw_info: {
          email: auth_hash.info.email,
          display_name: 'Teacher Test',
          first_name: 'Teacher',
          last_name: 'Test',
          role: role,
          state_name: 'New Jersey',
        }
      )

      mock_oauth_for AuthenticationOption::CLASSLINK, auth_hash
    end

    private def sign_in_through_classlink
      sign_in_through AuthenticationOption::CLASSLINK
    end
  end
end
