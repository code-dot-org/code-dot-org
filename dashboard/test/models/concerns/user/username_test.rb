require 'test_helper'

class UserUsernameTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe 'presence validations' do
    subject(:user) {build(:user)}

    before {allow(user).to receive(:generate_username).and_return(nil)}

    context 'when username is required' do
      before {allow(user).to receive(:username_required?).and_return(true)}

      it 'does not allow a user without a username' do
        _user.wont_be :valid?
        _(user.errors[:username]).must_include I18n.t('activerecord.errors.messages.blank')
      end
    end

    context 'when username is not required' do
      before {allow(user).to receive(:username_required?).and_return(false)}

      it 'allows a user without a username' do
        _user.must_be :valid?
        _(user.errors[:username]).must_be :empty?
      end
    end
  end

  describe 'length validations' do
    subject(:user) {build(:user)}

    before {allow(user).to receive(:generate_username).and_return(nil)}

    it 'is valid with  exactly 5 characters' do
      user.username = 'a' * 5
      _user.must_be :valid?
    end

    it 'is valid with exactly 20 characters' do
      user.username = 'a' * 20
      _user.must_be :valid?
    end

    it 'is invalid with 4 characters' do
      user.username = 'a' * 4
      _user.wont_be :valid?
      _(user.errors[:username]).must_include 'is too short (minimum is 5 characters)'
    end

    it 'is invalid with 21 characters' do
      user.username = 'a' * 21
      _(user).wont_be :valid?
      _(user.errors[:username]).must_include 'is too long (maximum is 20 characters)'
    end
  end

  describe 'format validations' do
    subject(:user) {build(:user, username: 'coder123')}

    before do
      allow(user).to receive(:username_required?).and_return(true)
      allow(user).to receive(:generate_username).and_return(nil)
    end

    it 'does not validate format if username is unchanged' do
      user.name = 'New Name' # change something else
      # even if the username is technically invalid now, format validation won't run
      user.username = 'invalid username'
      allow(user).to receive(:username_changed?).and_return(false)

      _user.must_be :valid?
    end

    context 'when new username has only allowed characters' do
      it 'is valid with numbers, hyphens, underscores, and periods' do
        user.username = 'user-123_name.test'
        _user.must_be :valid?
        _(user.errors[:username]).must_be :empty?
      end

      it 'downcases uppercase letters before validation' do
        user.username = 'UserName'
        _user.must_be :valid?
        _(user.username).must_equal 'username'
      end
    end

    context 'when username contains not allowed characters' do
      it 'is invalid with spaces' do
        user.username = 'user name'
        _user.wont_be :valid?
        _(user.errors[:username]).must_include I18n.t('activerecord.errors.messages.invalid')
      end

      it 'is invalid with special characters' do
        user.username = 'user@name!'
        _user.wont_be :valid?
        _(user.errors[:username]).must_include I18n.t('activerecord.errors.messages.invalid')
      end

      it 'is invalid with non-ASCII characters' do
        user.username = panda_panda
        _user.wont_be :valid?
        _(user.errors[:username]).must_include I18n.t('activerecord.errors.messages.invalid')
      end
    end
  end

  describe 'uniqueness validations' do
    let!(:existing_user) do
      user = create(:user)
      user.update!(username: 'unique_user') #overwriting the generated username to something predictable
      user
    end

    describe 'on create' do
      subject(:new_user) {build(:user, username: 'unique_user')}

      before {allow(new_user).to receive(:generate_username).and_return(nil)}

      it 'is invalid when the username is taken (case-insensitive)' do
        _new_user.wont_be :valid?
        _(new_user.errors[:username]).must_include 'has already been taken'
      end

      it 'is valid when the username is unique' do
        new_user.username = 'anotheruser'
        _(new_user).must_be :valid?
      end

      it 'skips uniqueness validation if other errors are present' do
        # Make name blank so generate_username fails and presence validation fails
        new_user.name = ''
        _(new_user).wont_be :valid?

        # Uniqueness error should not be added when other errors exist
        _(new_user.errors[:username]).wont_include 'has already been taken'
      end
    end

    describe 'on update' do
      subject(:user) {create(:user, username: 'coder123')}

      before {allow(user).to receive(:generate_username).and_return(nil)}

      it 'is valid when updating without changing username' do
        user.update!(name: 'New Name') # no username change
        _(user.errors[:username]).must_be :empty?
      end

      it 'is invalid when changing to a taken username' do
        user.username = 'Unique_User' # match existing_user, different case
        _user.wont_be :valid?
        _(user.errors[:username]).must_include 'has already been taken'
      end

      it 'is valid when changing to a new unique username' do
        user.username = 'freshuser'
        _user.must_be :valid?
      end

      it 'skips uniqueness validation if other errors exist' do
        user.username = 'Unique_User'
        user.name = '' # cause a presence error
        _(user).wont_be :valid?

        # Should not report uniqueness if presence fails first
        _(user.errors[:username]).wont_include 'has already been taken'
      end
    end
  end

  describe '#generate_username' do
    let(:valid_name) {'Valid User'}

    context 'when name is present and email is not utf8mb4' do
      subject(:user) {create(:user, name: valid_name, email: 'foo@bar.com')}

      it 'generates a non-nil username' do
        user.send(:generate_username)
        _(user.username).wont_be_nil
      end

      it 'generates a username with length > 0' do
        user.send(:generate_username)
        _(user.username.length).must_be :>, 0
      end
    end

    context 'when name is blank' do
      subject(:user) {build(:user, name: '', email: 'foo@bar.com', username: nil)}

      it 'does not generate a username' do
        user.send(:generate_username)
        _(user.username).must_be_nil
      end
    end

    context 'when email.utf8mb4? returns true' do
      let(:invalid_email) {panda_panda + 'email.com'}
      subject(:user) {build(:user, name: valid_name, email: invalid_email, username: nil)}

      it 'does not generate a username' do
        user.send(:generate_username)
        _(user.username).must_be_nil
      end
    end
  end
end
