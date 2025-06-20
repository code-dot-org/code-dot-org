require 'test_helper'

class Services::User::UserTypeSetterTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:student) {create(:student)}
  let(:teacher) {create(:teacher)}
  let(:email) {'teacher@email.com'}
  let(:email_preference) {{opt_in: true}}

  describe '#call' do
    subject(:user_type_setter_call) do
      Services::User::UserTypeSetter.call(
        user: user,
        user_type: user_type,
        email: email,
        email_preference: email_preference
      )
    end

    context 'when user_type is teacher' do
      let(:user) {student}
      let(:user_type) {::User::TYPE_TEACHER}

      it 'calls UpgradeToTeacher with correct arguments' do
        allow(Services::User::UserType::UpgradeToTeacher).to receive(:call).
          with(user: user, email: email, email_preference: email_preference).
          and_return(true)

        _user_type_setter_call.must_equal true
      end
    end

    context 'when user_type is student' do
      let(:user) {teacher}
      let(:user_type) {::User::TYPE_STUDENT}

      it 'calls DowngradeToStudent with correct arguments' do
        allow(Services::User::UserType::DowngradeToStudent).to receive(:call).
          with(user: user).
          and_return(true)

        _user_type_setter_call.must_equal true
      end
    end

    context 'when user_type is unknown' do
      let(:user) {student}
      let(:user_type) {'invalid-type'}

      it {_user_type_setter_call.must_equal false}
    end
  end

  test 'changing user from teacher to student removes email' do
    user = create :teacher
    assert user.email.present?
    assert user.hashed_email.present?

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user = User.find(user.id)

    assert user.email.blank?
    assert user.hashed_email.present?
  end

  test 'changing user from teacher to student removes school_info' do
    school_attributes = {
      country: 'US',
      school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
      state: nil
    }
    user = create :teacher, school_info_attributes: school_attributes
    assert user.school_info.present?

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user = User.find(user.id)

    refute user.school_info.present?
  end

  test 'changing user from teacher to student removes full_address' do
    user = create :teacher
    user.update!(full_address: 'fake address')

    user.set_user_type(User::TYPE_STUDENT)
    user.save!
    user = User.find(user.id)

    assert user.full_address.nil?
  end

  test 'changing user from student to teacher saves email' do
    user = create :student, email: 'email@old.xx'

    assert user.email.blank?
    assert user.hashed_email

    assert user.set_user_type(User::TYPE_TEACHER, 'email@old.xx')

    assert_equal 'email@old.xx', user.email
    assert_equal '21+', user.age
  end

  test 'changing oauth user from student to teacher with same email is allowed' do
    user = create :student, :google_sso_provider, email: 'email@new.xx'
    assert user.primary_contact_info.credential_type == 'google_oauth2'

    assert user.set_user_type(User::TYPE_TEACHER, 'email@new.xx')

    assert_equal 'email@new.xx', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test 'changing oauth user from student to teacher with different email is allowed' do
    user = create :student, :google_sso_provider
    assert user.primary_contact_info.credential_type == 'google_oauth2'

    assert user.set_user_type(User::TYPE_TEACHER, 'email@new.xx')

    assert_equal 'email@new.xx', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test 'changing from student to teacher clears terms_of_service_version' do
    user = create :student, terms_of_service_version: 1
    user.set_user_type(User::TYPE_TEACHER, 'tos@example.com')
    user.save!
    user = User.find(user.id)

    assert_nil user.terms_of_service_version
  end

  test 'changing from student to teacher creates StudioPerson' do
    user = assert_does_not_create(StudioPerson) do
      create :student
    end

    assert_creates(StudioPerson) do
      user.set_user_type(User::TYPE_TEACHER, 'fakeemail@example.com')
      user.save!
    end
    user = User.find(user.id)
    assert user.studio_person
    assert_equal 'fakeemail@example.com', user.studio_person.emails
  end

  test 'changing from teacher to student destroys StudioPerson' do
    user = create :teacher

    assert_destroys(StudioPerson) do
      user.set_user_type(User::TYPE_STUDENT)
    end
    user = User.find(user.id)
    assert_nil user.studio_person
  end

  test 'changing from teacher to student does not clear terms_of_service_version' do
    user = create :teacher, terms_of_service_version: 1
    user.set_user_type(User::TYPE_STUDENT)
    assert_equal 1, user.terms_of_service_version
  end

  test "teachers with a valid educator_role can change user_type to student" do
    user = create :teacher, :with_educator_role
    user.set_user_type(User::TYPE_STUDENT)
    assert user.valid?
  end
end
