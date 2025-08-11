require 'test_helper'

class Services::User::UpgradeToTeacherTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:user) {create(:user)}
  let(:email) {'test@example.com'}
  let(:hashed_email) {::User.hash_email(email)}
  let(:email_preference_params) do
    {
      email_preference_opt_in: 'no',
      email_preference_request_ip: '127.0.0.1',
      email_preference_source: EmailPreference::ACCOUNT_TYPE_CHANGE,
      email_preference_form_kind: '0',
    }
  end

  subject(:upgrade_to_teacher_call) do
    Services::User::UpgradeToTeacher.call(user: user, email: email, email_preference: email_preference_params)
  end

  describe '#call' do
    context 'when user is already a teacher' do
      it 'returns true and skips update' do
        allow(user).to receive(:teacher?).and_return(true)
        expect(user).not_to receive(:update)

        _upgrade_to_teacher_call.must_equal true
      end
    end

    context 'when email is blank' do
      let(:email) {''}
      it 'returns false' do
        _upgrade_to_teacher_call.must_equal false
      end
    end

    context 'when user is migrated' do
      it 'updates user with contact info and email preferences' do
        expect(user).to receive(:user_type=).with(::User::TYPE_TEACHER)
        expect(user).to receive(:parent_email=).with(nil)
        expect(user).to receive(:update_primary_contact_info!).with(new_email: email, new_hashed_email: hashed_email)
        expect(user).to receive(:update!).with(email_preference_params)
        expect(user).to receive(:transaction).and_yield

        _upgrade_to_teacher_call.must_equal user
      end
    end

    context 'when user is not migrated' do
      before {user.update!(provider: nil)}
      it 'sets email in email_preference and updates' do
        allow(::Policies::Lti).to receive(:lti?).with(user).and_return(true)

        expect(user).to receive(:user_type=).with(::User::TYPE_TEACHER)
        expect(user).to receive(:parent_email=).with(nil)
        expect(user).to receive(:lti_roster_sync_enabled=).with(true)
        expect(user).to receive(:update!).with({email: email}.merge(email_preference_params))
        expect(user).to receive(:transaction).and_yield

        _upgrade_to_teacher_call.must_equal user
      end
    end

    context 'when update_primary_contact_info! fails' do
      it 'returns false and user is not updated' do
        allow(user).to receive(:update_primary_contact_info!).and_raise(RuntimeError)

        _upgrade_to_teacher_call.must_equal false
        user.reload
        _(user.hashed_email).wont_equal User.hash_email(email)
        _(user.user_type).wont_equal ::User::TYPE_TEACHER
      end
    end

    context 'when update! fails' do
      it 'returns false and user is not updated' do
        allow(user).to receive(:update!).and_raise(ActiveRecord::RecordInvalid.new(user))

        _upgrade_to_teacher_call.must_equal false
        user.reload
        _(user.email).wont_equal email
        _(user.user_type).wont_equal ::User::TYPE_TEACHER
      end
    end
  end
end
