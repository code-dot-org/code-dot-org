require 'test_helper'
require 'ostruct'

class Policies::ChildAccountTest < ActiveSupport::TestCase
  class ComplianceStateTest < ActiveSupport::TestCase
    setup do
      @student = build(:student)
    end

    test 'locked_out?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.locked_out?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::LOCKED_OUT
      end
    end

    test 'request_sent?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.request_sent?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::REQUEST_SENT
      end
    end

    test 'permission_granted?' do
      assert_changes -> {Policies::ChildAccount::ComplianceState.permission_granted?(@student)}, from: false, to: true do
        @student.child_account_compliance_state = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED
      end
    end
  end

  test 'compliant?' do
    # [User traits, Expected result from compliant?]
    test_matrix = [
      [[:student], true],
      [[:locked_out_child], false],
      [[:locked_out_child, :with_parent_permission], true],
      [[:non_compliant_child], false],
      [[:non_compliant_child, :unknown_us_region], true],
      [[:non_compliant_child, :not_U13], true],
      [[:non_compliant_child, :migrated_imported_from_clever], true],
      [[:non_compliant_child, :with_lti_auth], true],
      [[:non_compliant_child, :with_pending_parent_permission, {created_at: '2023-06-30T23:59:59MST'}], false],
      [[:non_compliant_child, :skip_validation, {birthday: nil}], true],
      [[:non_compliant_child, :with_interpolated_co], true],
      [[:non_compliant_child, :with_interpolated_colorado], true],
      [[:non_compliant_child, :with_interpolated_wa], true],
    ]
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.compliant?(user)
      failure_msg = "Expected compliant?(#{traits}) to be #{compliance} but it was #{actual}"
      assert_equal compliance, actual, failure_msg
    end
  end

  test 'show_cap_state_modal?' do
    test_matrix = [
      {rollout: 10, user_id: 9, expected: true},
      {rollout: 10, user_id: 101, expected: true},
      {rollout: 10, user_id: 109, expected: true},
      {rollout: 10, user_id: 110, expected: false},
      {rollout: 10, user_id: 199, expected: false},
      {rollout: 20, user_id: 119, expected: true},
      {rollout: 99, user_id: 198, expected: true},
      {rollout: 99, user_id: 199, expected: false},
      {rollout: 100, user_id: 99, expected: true},
      {rollout: 100, user_id: 1099, expected: true},
    ]
    test_matrix.each do |test_case|
      user = OpenStruct.new({id: test_case[:user_id]})
      DCDO.stubs(:get).with('cap-state-modal-rollout', 0).returns(test_case[:rollout])
      actual = Policies::ChildAccount.show_cap_state_modal? user
      assert_equal test_case[:expected], actual, "Testcase #{test_case} failed"
    end
  end

  test 'user_predates_policy?' do
    # [User traits, Expected result from compliant?]
    test_matrix = [
      [[:student], false],
      [[:student, :U13], false],
      [[:student, :U13, :unknown_us_region], false],
      [[:non_compliant_child, {created_at: '2023-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, {created_at: '2024-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, {created_at: '2024-07-01T00:00:00MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_clever, {created_at: '2023-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_clever, {created_at: '2024-06-29T23:59:59MST'}], false],
      [[:non_compliant_child, :migrated_imported_from_google_classroom, {created_at: '2023-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, :migrated_imported_from_google_classroom, {created_at: '2024-06-29T23:59:59MST'}], true],
      [[:non_compliant_child, :with_google_authentication_option, {created_at: '2024-06-29T23:59:59MST'}], true],
      # The following test cases address P20-937
      [[:non_compliant_child, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :microsoft_v2_sso_provider, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :facebook_sso_provider, :before_p20_937_exception_date], true],
      [[:non_compliant_child, :p20_937_exception_date], false],
      [[:non_compliant_child, :microsoft_v2_sso_provider, :p20_937_exception_date], false],
      [[:non_compliant_child, :facebook_sso_provider, :p20_937_exception_date], false],
    ]
    failures = []
    test_matrix.each do |traits, compliance|
      user = create(*traits)
      actual = Policies::ChildAccount.user_predates_policy?(user)
      failure_msg = "Expected user_predates_policy?(#{traits}) to be #{compliance} but it was #{actual}"
      failures << failure_msg if actual != compliance
    end
    assert failures.empty?, failures.join("\n")
  end

  describe 'state_policies' do
    let(:state_policies) {Policies::ChildAccount.state_policies}
    let(:dcdo_cpa_schedule) {{}}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      DCDO.stubs(:get).with('cpa_schedule', {}).returns(dcdo_cpa_schedule)
    end

    describe 'for Colorado' do
      let(:co_state_policy) {state_policies['CO']}
      let(:default_start_date) {DateTime.parse('2023-07-01T00:00:00MST')}
      let(:default_lockout_date) {DateTime.parse('2024-07-01T00:00:00MST')}

      it 'contains expected max age' do
        _(co_state_policy[:max_age]).must_equal 12
      end

      it 'contains expected name' do
        _(co_state_policy[:name]).must_equal 'CPA'
      end

      it 'contains expected default start_date' do
        _(co_state_policy[:start_date]).must_equal default_start_date
      end

      it 'contains expected default lockout_date' do
        _(co_state_policy[:lockout_date]).must_equal default_lockout_date
      end

      context 'when DCDO cpa_schedule with only cpa_new_user_lockout is configured' do
        let(:dcdo_cpa_schedule) do
          {
            'cpa_new_user_lockout' => cpa_new_user_lockout.iso8601
          }
        end
        let(:cpa_new_user_lockout) {default_start_date.ago(100.days)}

        it 'contains DCDO configured start_date' do
          _(co_state_policy[:start_date]).must_equal cpa_new_user_lockout
        end
      end

      context 'when DCDO cpa_schedule with only cpa_all_user_lockout is configured' do
        let(:dcdo_cpa_schedule) do
          {
            'cpa_all_user_lockout' => cpa_all_user_lockout.iso8601
          }
        end
        let(:cpa_all_user_lockout) {default_lockout_date.ago(21.days)}

        it 'contains DCDO configured lockout_date' do
          _(co_state_policy[:lockout_date]).must_equal cpa_all_user_lockout
        end
      end
    end
  end

  describe '.pre_lockout_user?' do
    let(:pre_lockout_user?) {Policies::ChildAccount.pre_lockout_user?(user)}

    let(:user) {build_stubbed(:student, created_at: user_lockout_date.ago(1.second))}

    let(:user_lockout_date) {DateTime.now}
    let(:user_state_policy) {{lockout_date: user_lockout_date}}
    let(:user_predates_policy?) {false}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:state_policy).with(user).returns(user_state_policy)
      Policies::ChildAccount.stubs(:user_predates_policy?).with(user).returns(user_predates_policy?)
    end

    it 'returns true' do
      _(pre_lockout_user?).must_equal true
    end

    context 'when user was created during lockout phase' do
      before do
        user.created_at = user_lockout_date.since(1.second)
      end

      it 'returns false' do
        _(pre_lockout_user?).must_equal false
      end
    end

    context 'when currently is pre lockout phase' do
      let(:user_lockout_date) {1.second.since}

      it 'returns false' do
        _(pre_lockout_user?).must_equal false
      end

      context 'if user predates policy' do
        let(:user_predates_policy?) {true}

        it 'returns true' do
          _(pre_lockout_user?).must_equal true
        end
      end
    end

    context 'when user is not affected by a state policy' do
      let(:user_state_policy) {nil}

      it 'returns false' do
        _(pre_lockout_user?).must_equal false
      end
    end
  end

  describe '.lockout_date' do
    let(:lockout_date) {Policies::ChildAccount.lockout_date(user)}

    let(:user) {build_stubbed(:student)}

    let(:user_cap_compliant?) {false}
    let(:user_predates_cap_policy?) {false}
    let(:user_state_policy_start_date) {1.year.ago}
    let(:user_state_policy_lockout_date) {1.year.since}
    let(:user_state_policy) {{start_date: user_state_policy_start_date, lockout_date: user_state_policy_lockout_date}}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:compliant?).with(user).returns(user_cap_compliant?)
      Policies::ChildAccount.stubs(:user_predates_policy?).with(user).returns(user_predates_cap_policy?)
      Policies::ChildAccount.stubs(:state_policy).with(user).returns(user_state_policy)
    end

    it 'returns state policy start date' do
      _(lockout_date).must_equal user_state_policy_start_date
    end

    context 'when user was created before state policy took effect' do
      let(:user_predates_cap_policy?) {true}

      it 'returns all users lockout date from state policy' do
        _(lockout_date).must_equal user_state_policy_lockout_date
      end
    end

    context 'when user is not covered by a state policy' do
      let(:user_state_policy) {nil}

      it 'returns nil' do
        _(lockout_date).must_be_nil
      end
    end

    context 'when user is CAP compliant' do
      let(:user_cap_compliant?) {true}

      it 'returns nil' do
        _(lockout_date).must_be_nil
      end
    end
  end

  describe '.lockable?' do
    let(:lockable?) {Policies::ChildAccount.lockable?(user)}

    let(:user) {build_stubbed(:student)}

    let(:user_lockout_date) {DateTime.now}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:lockout_date).with(user).returns(user_lockout_date)
    end

    it 'returns true' do
      _(lockable?).must_equal true
    end

    context 'when user is already locked out' do
      let(:user) {build_stubbed(:locked_out_child)}

      it 'returns false' do
        _(lockable?).must_equal false
      end
    end

    context 'when user does not have lockout date' do
      let(:user_lockout_date) {nil}

      it 'returns false' do
        _(lockable?).must_equal false
      end
    end

    context 'when lockdown has not yet come' do
      let(:user_lockout_date) {1.second.since}

      it 'returns false' do
        _(lockable?).must_equal false
      end
    end
  end

  describe '.personal_account?' do
    let(:personal_account?) {Policies::ChildAccount.personal_account?(user)}

    let(:user_sponsored?) {false}
    let(:user_migrated?) {false}
    let(:user_provider) {'email'}
    let(:user_auth_option_credential_type) {'email'}
    let(:user_auth_option) {build_stubbed(:authentication_option, credential_type: user_auth_option_credential_type)}
    let(:user) {build_stubbed(:user, provider: user_provider, authentication_options: [user_auth_option])}

    before do
      user.stubs(:sponsored?).returns(user_sponsored?)
      user.stubs(:migrated?).returns(user_migrated?)
    end

    it 'returns true' do
      _(personal_account?).must_equal true
    end

    context 'when user provider is Clever' do
      let(:user_provider) {'clever'}

      it 'returns false' do
        _(personal_account?).must_equal false
      end
    end

    context 'when user provider is LTI v1' do
      let(:user_provider) {'lti_v1'}

      it 'returns false' do
        _(personal_account?).must_equal false
      end
    end

    context 'when user is migrated' do
      let(:user_migrated?) {true}
      let(:user_provider) {'clever'}

      it 'returns true' do
        _(personal_account?).must_equal true
      end

      context 'when credential type of user auth option is Clever' do
        let(:user_auth_option_credential_type) {'clever'}

        it 'returns false' do
          _(personal_account?).must_equal false
        end
      end

      context 'when credential type of user auth option is LTI v1' do
        let(:user_auth_option_credential_type) {'lti_v1'}

        it 'returns false' do
          _(personal_account?).must_equal false
        end
      end
    end

    context 'when user is sponsored' do
      let(:user_sponsored?) {true}

      it 'returns false' do
        _(personal_account?).must_equal false
      end
    end
  end

  describe '.parent_permission_required?' do
    let(:parent_permission_required?) {Policies::ChildAccount.parent_permission_required?(user)}

    let(:user_type) {'student'}
    let(:user_age) {user_state_policy_max_age}
    let(:user) {build_stubbed(:user, user_type: user_type, birthday: user_age&.year&.ago)}

    let(:user_account_is_personal?) {true}
    let(:user_state_policy_start_date) {DateTime.now}
    let(:user_state_policy_max_age) {12}
    let(:user_state_policy) {{start_date: user_state_policy_start_date, max_age: user_state_policy_max_age}}

    around do |test|
      Timecop.freeze {test.call}
    end

    before do
      Policies::ChildAccount.stubs(:state_policy).with(user).returns(user_state_policy)
      Policies::ChildAccount.stubs(:personal_account?).with(user).returns(user_account_is_personal?)
    end

    it 'returns true' do
      _(parent_permission_required?).must_equal true
    end

    context 'when user is not a personal account' do
      let(:user_account_is_personal?) {false}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end

    context 'when user is older than maximum age covered by the policy' do
      let(:user_age) {user_state_policy_max_age.next}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end

    context 'when user age cannot be identified' do
      let(:user_age) {nil}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end

    context 'when policy has not yet taken effect' do
      let(:user_state_policy_start_date) {1.second.since}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end

    context 'when user is not covered by a US State child account policy' do
      let(:user_state_policy) {nil}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end

    context 'when user is not a student' do
      let(:user_type) {'teacher'}

      it 'returns false' do
        _(parent_permission_required?).must_equal false
      end
    end
  end
end
