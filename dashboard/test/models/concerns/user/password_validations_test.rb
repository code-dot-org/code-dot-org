require 'test_helper'

class User::PasswordValidationsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe 'validations' do
    it 'requires password' do
      user = build(:user, password: nil)
      _(user).wont_be :valid?
      _(user.errors[:password]).wont_be :empty?
    end

    it 'requires at least 6 characters in password' do
      user = build(:user, password: 'short')
      _(user).wont_be :valid?
      _(user.errors[:password]).wont_be :empty?
    end

    it 'adds error if confirmation does not match' do
      user = build(:user, password: 'password', password_confirmation: 'different')
      _(user).wont_be :valid?
      _(user.errors[:password]).must_be :empty?
      _(user.errors[:password_confirmation]).wont_be :empty?
    end

    it 'accepts passwords with at least 6 characters' do
      user = build(:user, password: 'shorty', password_confirmation: 'shorty')
      _(user).must_be :valid?
    end

    it 'accepts password with exactly 128 characters' do
      password = 'a' * 128
      user = build(:user, password: password, password_confirmation: password)
      _(user).must_be :valid?
    end

    it 'rejects password longer than 128 characters' do
      long_password = 'a' * 129
      user = build(:user, password: long_password, password_confirmation: long_password)
      _(user).wont_be :valid?
      _(user.errors[:password]).must_include 'is too long (maximum is 128 characters)'
    end
  end

  describe 'strict password requirements by country' do
    let(:strict_country) {User::PasswordValidations::PASSWORD_STRICT_COUNTRIES.first}

    before do
      allow(DCDO).to receive(:get).and_call_original
      allow(DCDO).to receive(:get).with('strict-password-country', false).and_return(true)
    end

    describe 'when creating a teacher in a strict country' do
      context 'when using a short password' do
        let(:user) {build(:teacher, country_code: strict_country, password: 'short', password_confirmation: 'short')}
        it 'rejects passwords' do
          _(user).wont_be :valid?
          user.valid?
          _(user.errors[:password]).must_include 'is too short (minimum is 14 characters)'
        end
      end
      context 'when using a long password' do
        let(:user) {create(:teacher, country_code: strict_country, password: 'longlongpassword', password_confirmation: 'longlongpassword')}

        it 'accepts passwords that are at least 14 characters' do
          _(user).must_be :valid?
          user.valid?
          _(user.errors[:password]).must_be :empty?
        end
      end
    end

    describe 'when updating a teacher in a strict country' do
      let(:teacher) {build(:teacher, country_code: strict_country)}

      it 'rejects a too-short password' do
        result = teacher.update(password: 'tooshort', password_confirmation: 'tooshort')
        _(result).must_equal false
        _(teacher.errors[:password]).must_include 'is too short (minimum is 14 characters)'
      end

      it 'accepts a sufficiently long password' do
        result = teacher.update(password: 'longlongpassword', password_confirmation: 'longlongpassword')
        _(result).must_equal true
        _(teacher.errors[:password]).must_be :empty?
        _(teacher.password).must_equal 'longlongpassword'
      end
    end
  end

  describe '.password_min_length' do
    subject(:password_min_length) {user.password_min_length}

    let(:user) {build(:teacher)}

    it 'returns 14 for strict countries' do
      user.country_code = User::PasswordValidations::PASSWORD_STRICT_COUNTRIES.first
      allow(DCDO).to receive(:get).with('strict-password-country', false).and_return(true)
      _password_min_length.must_equal 14
    end

    it 'returns 6 for non-strict countries' do
      user.country_code = 'US'
      allow(DCDO).to receive(:get).with('strict-password-country', false).and_return(true)
      _password_min_length.must_equal 6
    end
  end

  describe '#password_required?' do
    subject(:password_required?) {user.password_required?}

    context 'when the user is not creating their own account' do
      let(:user) {create(:student, :without_encrypted_password)}

      before do
        allow(user).to receive(:managing_own_credentials?).and_return(false)
      end

      it {_password_required?.must_equal false}
    end

    context 'when a new user is created with no authentication provided' do
      let(:user) {build(:user, password: nil)}

      it {password_required?.must_equal true}
    end

    context 'when the user changes their password' do
      let(:user) {create(:user)}

      before do
        user.password = "mypassword"
        user.password_confirmation = "mypassword"
      end

      it {_password_required?.must_equal true}
    end
  end

  describe '#managing_own_credentials?' do
    subject(:managing_own_credentials?) {user.send(:managing_own_credentials?)}

    context 'when the user has an email login' do
      let(:user) {create(:user)}

      it {_managing_own_credentials?.must_equal true}
    end

    context 'when the student has an email login' do
      let(:user) {create(:student)}

      it {_managing_own_credentials?.must_equal true}
    end

    context 'when the user has an OAuth login' do
      let(:user) {create(:user, :sso_provider)}

      it {_managing_own_credentials?.must_equal false}
    end

    context 'when the student has a sponsored login' do
      let(:user) {create(:student_in_picture_section)}

      it {_managing_own_credentials?.must_equal false}
    end
  end
end
