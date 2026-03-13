require 'test_helper'
require 'policies/user'
class Policies::UserTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  class UserAttributes < Policies::UserTest
    test 'all default attributes (except email) should be returned' do
      user = create(:teacher, :with_google_authentication_option)
      attrs = Policies::User.user_attributes(user)

      missing_attrs = []
      user.attributes.compact.each_key do |attr|
        missing_attrs << attr unless attrs.key?(attr) || attr == 'email'
      end

      assert missing_attrs.empty?, "#{missing_attrs} are missing"
    end

    test 'authentication_options should be returned' do
      user = create(:teacher, :with_google_authentication_option)
      ao_email = user.authentication_options.first.email

      attrs = Policies::User.user_attributes(user)
      attrs_aos = attrs['authentication_options_attributes']

      assert_equal ao_email, attrs_aos[0]['email']
      assert_equal user.authentication_options.count, attrs_aos.count
    end

    test 'remove email from user session value' do
      user = create(:teacher)

      attrs = Policies::User.user_attributes(user)
      assert_nil attrs['email']
    end
  end

  test 'verified_teacher_candidate? should return true when criteria is met' do
    # Google Authentication Option present, and has non-gmail/non-googlemail email,
    # criteria met
    teacher = create(:teacher, :with_google_authentication_option)
    assert_equal true, Policies::User.verified_teacher_candidate?(teacher)
  end

  test 'verified_teacher_candidate? should return false when criteria is not met' do
    teacher = create(:teacher)
    # Google Authentication Option not present, criteria not met
    assert_equal false, Policies::User.verified_teacher_candidate?(teacher)
    # Google Authentication Option has a gmail email, criteria not met
    create(:google_authentication_option, user: teacher, email: 'test@gmail.com')
    assert_equal false, Policies::User.verified_teacher_candidate?(teacher)
  end

  test 'verified_teacher_candidate? should return false when teacher is already verified' do
    teacher = create(:teacher, :with_google_authentication_option)
    assert_changes -> {Policies::User.verified_teacher_candidate?(teacher)}, from: true, to: false do
      teacher.verify_teacher!
    end
  end

  describe '.personal_account?' do
    subject(:personal_account?) {Policies::User.personal_account?(user)}

    # [User traits, Expected result from personal_account?]
    test_matrix = [
      # Personal Accounts
      [[:student], true], # Has email auth option and password by default
      [[:student, :with_facebook_authentication_option, :without_email_auth_option, :without_encrypted_password], true],
      [[:student, :with_google_authentication_option, :without_email_auth_option, :without_encrypted_password], true],
      [[:student, :with_microsoft_authentication_option, :without_email_auth_option, :without_encrypted_password], true],

      # School-managed accounts
      [[:student, :with_clever_authentication_option, :without_email_auth_option, :without_encrypted_password], false],
      [[:student, :with_lti_authentication_option, :without_email_auth_option, :without_encrypted_password], false],

      # Conditionally school-managed (when in a section or roster synced)
      [[:student, :with_google_authentication_option, :without_email_auth_option, :without_encrypted_password, {roster_synced: true}], false],
      [[:student, :with_google_authentication_option, :without_email_auth_option, :without_encrypted_password, :in_google_section], false],
      [[:student, :with_microsoft_authentication_option, :without_email_auth_option, :without_encrypted_password, {roster_synced: true}], false],
      [[:student, :with_microsoft_authentication_option, :without_email_auth_option, :without_encrypted_password, :in_email_section], false],

      # School-managed accounts that have email logins or passwords, tainting them as personal accounts
      [[:student, :with_clever_authentication_option, :without_encrypted_password], true],
      [[:student, :with_clever_authentication_option, :without_email_auth_option], true],
      [[:student, :with_lti_authentication_option, :without_encrypted_password], true],
      [[:student, :with_lti_authentication_option, :without_email_auth_option], true],

      # Conditionally school-managed accounts that have email logins or passwords should still be considered school-managed
      [[:student, :with_google_authentication_option, :without_email_auth_option, {roster_synced: true}], false],
      [[:student, :with_google_authentication_option, :without_encrypted_password, {roster_synced: true}], false],
      [[:student, :with_google_authentication_option, :without_email_auth_option, :in_google_section], false],
      [[:student, :with_google_authentication_option, :without_encrypted_password, :in_google_section], false],
      [[:student, :with_microsoft_authentication_option, :without_email_auth_option, {roster_synced: true}], false],
      [[:student, :with_microsoft_authentication_option, :without_encrypted_password, {roster_synced: true}], false],
      [[:student, :with_microsoft_authentication_option, :without_email_auth_option, :in_email_section], false],
      [[:student, :with_microsoft_authentication_option, :without_encrypted_password, :in_email_section], false],

      # Personal accounts in sections or roster synced should still be considered school-managed
      [[:student, :in_email_section], false],
      [[:student, {roster_synced: true}], false],
      [[:student, :with_facebook_authentication_option, :without_email_auth_option, :without_encrypted_password, :in_email_section], false],
      [[:student, :with_facebook_authentication_option, :without_email_auth_option, :without_encrypted_password, {roster_synced: true}], false],

      # Unmigrated
      [[:student, :without_email_auth_option, :demigrated], true],
      [[:student, :clever_sso_provider, :without_email_auth_option, :without_encrypted_password, :demigrated], false],
      [[:student, :facebook_sso_provider, :without_email_auth_option, :without_encrypted_password, :demigrated], true],
      [[:student, :google_sso_provider, :without_email_auth_option, :without_encrypted_password, :demigrated], true],
      [[:student, :google_sso_provider, :without_email_auth_option, :without_encrypted_password, :demigrated, :in_google_section], false],
      [[:student, :microsoft_v2_sso_provider, :without_email_auth_option, :without_encrypted_password, :demigrated], true],
      [[:student, :microsoft_v2_sso_provider, :without_email_auth_option, :without_encrypted_password, :in_email_section, :demigrated], false],
    ]

    test_matrix.each do |traits, expected_result|
      context "with traits: #{traits.inspect}" do
        let(:user) {create(*traits)}

        it "returns #{expected_result}" do
          _personal_account?.must_equal expected_result
        end
      end
    end
  end

  describe '.conditionally_school_managed?' do
    subject(:conditionally_school_managed?) {Policies::User.conditionally_school_managed?(user)}

    context 'when user is not in a section' do
      let(:user) {create(:student)}
      it 'returns true' do
        _conditionally_school_managed?.must_equal false
      end
    end

    context 'when user is in a section as student' do
      let(:user) {create(:student, :in_email_section)}
      it 'returns true' do
        _conditionally_school_managed?.must_equal true
      end
    end

    context 'when user is rostered synced' do
      let(:user) {create(:student, {roster_synced: true})}
      it 'returns true' do
        _conditionally_school_managed?.must_equal true
      end
    end
  end
end
