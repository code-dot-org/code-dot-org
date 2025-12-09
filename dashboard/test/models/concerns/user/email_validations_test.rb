require 'test_helper'

class EmailValidationsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  context 'when building a new user' do
    context 'without an email' do
      let(:user) {build(:user, email: nil)}
      it 'is invalid' do
        user.valid?
        _(user.errors[:email]).must_include I18n.t('activerecord.errors.messages.blank')
      end
    end

    context 'with panda in email' do
      let(:user) {build(:user, email: "#{panda_panda}@panda.org")}
      it 'is invalid' do
        user.valid?
        _(user.errors[:email]).must_include I18n.t('activerecord.errors.messages.invalid')
      end
    end

    context 'with an invalid email' do
      let(:user) {build(:user, email: "foo@bar@com")}
      it 'is invalid' do
        user.valid?
        _(user.errors[:email].length).must_equal 1
      end
    end

    context 'with a valid email' do
      let(:user) {build(:user, email: "valid@example.net")}
      it 'is valid' do
        user.valid?
        _(user.errors[:email].length).must_equal 0
      end
    end
  end

  context 'email format validation on create' do
    it 'allows creation with a valid email address' do
      assert_creates(User) do
        create(:user, email: 'valid@example.net')
      end
    end

    it 'raises an error when email is invalid' do
      error = _ {create(:user, email: 'invalid@incomplete')}.must_raise ActiveRecord::RecordInvalid
      _(error.message).must_equal 'Validation failed: Email does not appear to be a valid e-mail address'
    end
  end

  describe 'email uniqueness validation' do
    let(:email) {'foo@bar.com'}

    before do
      create(:user, email: email)
    end

    it 'adds an error when creating a user with a duplicate email' do
      user = build(:user, email: email)
      user.save
      _(user.errors.full_messages).must_equal ['Email has already been taken']
    end

    it 'adds an error when creating a user with the same email in different case' do
      user = build(:user, email: email.upcase)
      user.save
      _(user.errors.full_messages).must_equal ['Email has already been taken']
    end
  end

  describe 'email and hashed_email uniqueness validation for young users' do
    let(:email) {'young_foo@bar.com'}

    before do
      create(:young_student, email: email)
    end

    context 'when creating a second young user with the same email and hashed_email' do
      it 'adds an error' do
        user = build(:young_student, hashed_email: User.hash_email(email))
        user.save
        _(user.errors.full_messages).must_equal ['Email has already been taken']
      end
    end

    context 'when creating a second young user with the same email but differently cased' do
      it 'adds an error' do
        user = build(:young_student, hashed_email: User.hash_email(email.upcase))
        user.save
        _(user.errors.full_messages).must_equal ['Email has already been taken']
      end
    end
  end

  describe 'legacy users with invalid email addresses' do
    let(:user_with_invalid_email) do
      user = build(:user, email: 'invalid@incomplete')
      user.save!(validate: false)
      user
    end

    it 'is considered valid despite the invalid email' do
      _(user_with_invalid_email).must_be :valid?
    end

    it 'can update other attributes and still be saved' do
      user_with_invalid_email.name = 'updated name'
      _(user_with_invalid_email).must_be :valid?
      _(user_with_invalid_email.save).must_equal true
    end
  end
end
