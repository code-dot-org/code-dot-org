require 'test_helper'

class Services::User::UpgradeToPersonalLoginTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:username) {'my_new_username'}
  let(:parent_email) {'parent@email.com'}
  let(:email) {'my@email.com'}
  let(:password) {'mypassword'}
  let(:secret_words) {'secret words'}
  let(:student) do
    create(:student_in_word_section)
  end
  let(:params) do
    {
      username: username,
      parent_email: parent_email,
      email: email,
      password: password,
      password_confirmation: password,
      secret_words: secret_words
    }
  end

  describe '#call' do
    subject(:upgrade_call) {Services::User::UpgradeToPersonalLogin.call(user: student, params: params)}

    before do
      student.update!(secret_words: secret_words)
    end

    it 'returns false if user is not a student' do
      non_student = create(:teacher)
      result = Services::User::UpgradeToPersonalLogin.call(user: non_student, params: params)

      _(result).must_equal false
    end

    it 'returns false if secret words are required but not provided' do
      params[:secret_words] = ''

      _upgrade_call.must_equal false
      _(student.errors[:secret_words]).must_include I18n.t('activerecord.errors.messages.blank_plural')
    end

    it 'returns false if secret words are required but invalid' do
      params[:secret_words] = 'wrong words'

      _upgrade_call.must_equal false
      _(student.errors[:secret_words]).must_include I18n.t('activerecord.errors.messages.invalid_plural')
    end

    it 'updates user if migrated and secret words are valid' do
      _upgrade_call.must_equal true
      student.reload
      _(student.valid_password?(password)).must_equal true
      _(student.hashed_email).must_equal User.hash_email(email)
      _(student.username).must_equal username
    end

    it 'updates user if not migrated' do
      student.update!(provider: nil)

      _upgrade_call.must_equal true
      student.reload
      _(student.valid_password?(password)).must_equal true
      _(student.hashed_email).must_equal User.hash_email(email)
      _(student.username).must_equal username
    end

    context 'when update_primary_contact_info! fails' do
      it 'returns false and student is not updated' do
        allow(student).to receive(:update_primary_contact_info!).and_raise(RuntimeError)

        _upgrade_call.must_equal false
        student.reload
        _(student.valid_password?(password)).must_equal false
        _(student.hashed_email).wont_equal User.hash_email(email)
        _(student.username).wont_equal username
      end
    end

    context 'when update! fails' do
      it 'returns false and student is not updated' do
        allow(student).to receive(:update!).and_raise(ActiveRecord::RecordInvalid.new(student))

        _upgrade_call.must_equal false
        student.reload
        _(student.valid_password?(password)).must_equal false
        _(student.hashed_email).wont_equal User.hash_email(email)
        _(student.username).wont_equal username
      end
    end
  end
end
