require 'test_helper'

class Services::UserTypeChangeTest < ActionDispatch::IntegrationTest
  subject(:change_user_type) do
    Services::User::UserTypeSetter.call(
      user: user,
      user_type: new_user_type,
      email: new_email,
      email_preference: new_email_preference_params,
      )
  end

  let(:new_email) {nil}
  let(:new_email_preference_params) do
    {
      email_preference_opt_in: 'yes',
      email_preference_request_ip: '127.0.0.1',
      email_preference_source: EmailPreference::ACCOUNT_TYPE_CHANGE,
      email_preference_form_kind: '0',
    }
  end

  describe 'teacher to student conversion' do
    let(:new_user_type) {::User::TYPE_STUDENT}
    let!(:user) do
      create(
        :teacher,
        school_info_attributes: {
          country: 'US',
          school_type: SchoolInfo::SCHOOL_TYPE_PUBLIC,
          state: nil
        },
        full_address: 'fake address',
        terms_of_service_version: 1
      )
    end

    it 'changes the user type to TYPE_STUDENT' do
      _ {change_user_type}.must_change -> {User.find(user.id).user_type}, from: ::User::TYPE_TEACHER, to: new_user_type
    end

    it 'removes email, school_into, full_address and keeps hashed_email' do
      change_user_type

      user_as_student = Student.find(user.id)

      _(user_as_student.email).must_equal ''

      _(user_as_student.hashed_email).must_equal user.hashed_email
      _(user_as_student.school_info).must_be_nil
      _(user_as_student.full_address).must_be_nil
    end

    it 'destroys exactly one studio person record' do
      _ {change_user_type}.must_differ 'StudioPerson.count', -1
    end

    it 'does not clear user terms_of_service_version' do
      _(user.terms_of_service_version).must_equal 1
      _ {change_user_type}.wont_change -> {User.find(user.id).terms_of_service_version}
    end

    context 'when teacher has educator role' do
      before {user.update!(educator_role: SharedConstants::EDUCATOR_ROLES.first[:value])}

      it 'can create a valid student' do
        change_user_type
        _(User.find(user.id)).must_be :valid?
      end
    end
  end

  describe 'student to teacher conversion' do
    let(:new_user_type) {::User::TYPE_TEACHER}
    let(:new_email) {teacher_email}
    let(:student_email) {'student@example.com'}
    let(:teacher_email) {'teacher@example.com'}
    let(:terms_of_service_version) {1}

    let!(:user) {create(:user, email: student_email, terms_of_service_version: 1)}

    it 'changes user_type to TYPE_TEACHER' do
      _ {change_user_type}.must_change -> {User.find(user.id).user_type}, from: ::User::TYPE_STUDENT, to: new_user_type
    end

    it 'changes email' do
      _ {change_user_type}.must_change -> {User.find(user.id).email}, to: new_email
    end

    it 'sets age to be 21+' do
      _(User.find(user.id).age).must_equal '21+'
    end

    it 'creates exactly one studio person record' do
      _ {change_user_type}.must_differ 'StudioPerson.count', 1
    end

    it 'clears user terms_of_service_version' do
      _ {change_user_type}.must_change -> {User.find(user.id).terms_of_service_version},
                                       from: terms_of_service_version,
                                       to: nil
    end

    it 'replace old oauth option for student email with new teacher email' do
      _ {change_user_type}.must_change -> {User.find(user.id).authentication_options.pluck(:email)},
                                       from: [''],
                                       to: [new_email]
    end

    it 'creates email preference record with the correct defaults for user' do
      _ {change_user_type}.must_differ 'EmailPreference.count', 1

      user_email_preference = EmailPreference.find_by_email(new_email)

      _(user_email_preference.opt_in).must_equal true
      _(user_email_preference.ip_address).must_equal new_email_preference_params[:email_preference_request_ip]
      _(user_email_preference.source).must_equal new_email_preference_params[:email_preference_source]
      _(user_email_preference.form_kind).must_equal new_email_preference_params[:email_preference_form_kind]
    end

    context 'when user already has oauth option with new teacher email' do
      let!(:auth_option) {create(:authentication_option, user: user, email: teacher_email)}

      it 'removes only user student email Auth Option' do
        _(user.authentication_options.count).must_equal 2 # Check that the user starts with 2 Auth Options
        change_user_type
        _(User.find(user.id).authentication_options).must_equal [auth_option]
      end

      it 'actually deletes exactly one AuthenticationOption record' do
        _ {change_user_type}.must_differ 'AuthenticationOption.count', -1
      end
    end

    context 'when no new email preference are set' do
      let(:new_email_preference_params) {nil}

      it 'wont create new email preference records' do
        _ {change_user_type}.wont_differ 'EmailPreference.count'
      end
    end
  end
end
