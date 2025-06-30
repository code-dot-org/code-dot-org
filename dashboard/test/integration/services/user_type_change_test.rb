require 'test_helper'

class Services::UserTypeChangeTest < ActionDispatch::IntegrationTest
  describe 'user type transitions' do
    context 'when user changes to TYPE_STUDENT' do
      subject(:set_teacher_to_student) do
        Services::User::UserTypeSetter.call(
          user: teacher,
          user_type: ::User::TYPE_STUDENT
        )
      end

      let(:teacher) do
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

      let(:student) {User.find(teacher.id)}

      before do
        teacher
        @initial_sp_count = StudioPerson.count
        set_teacher_to_student
      end

      it 'returns true' do
        _set_teacher_to_student.must_equal true
      end

      it 'removes the email but keeps hashed_email' do
        _(student.email).must_be_empty
        _(student.hashed_email).wont_be_nil
      end

      it 'removes school_into' do
        _(student.school_info).must_be_nil
      end

      it 'removes full_address' do
        _(student.full_address).must_be_nil
      end

      it 'destroys exactly one StudioPerson' do
        _(student.studio_person).must_be_nil
        diff = @initial_sp_count - StudioPerson.count
        _(diff).must_equal 1
      end

      it 'does not clear terms_of_service_version' do
        _(student.terms_of_service_version).must_equal 1
      end

      context 'when teacher has educator role' do
        let(:teacher) {create(:teacher, :with_educator_role)}

        it 'can create a valid student' do
          _(student).must_be :valid?
        end
      end
    end

    context 'when user changes to TYPE_TEACHER' do
      subject(:set_student_to_teacher) do
        Services::User::UserTypeSetter.call(
          user:      student,
          user_type: ::User::TYPE_TEACHER,
          email:     teacher_email,
          email_preference: email_preference_params,
        )
      end

      let(:student_email) {'student@example.com'}
      let(:teacher_email) {'teacher@example.com'}
      let(:student) {create(:user, email: student_email, terms_of_service_version: 1)}
      let(:email_preference_params) {nil}
      let(:teacher) {User.find(student.id)}

      before do
        student
        @initial_sp_count = StudioPerson.count
        @result = set_student_to_teacher
      end

      it 'returns user' do
        _(@result).must_be_kind_of User
      end

      it 'sets the teacher email' do
        _(teacher.email).must_equal teacher_email
      end

      it 'set age to be 21+' do
        _(teacher.age).must_equal '21+'
      end

      it 'creates exactly one StudioPerson' do
        diff = StudioPerson.count - @initial_sp_count
        _(diff).must_equal 1
        _(teacher.studio_person).wont_be_nil
      end

      it 'clears terms_of_service_version' do
        _(teacher.terms_of_service_version).must_be_nil
      end

      context 'when user has an oauth provider' do
        let(:old_email) {'old@email.com'}
        let(:new_email) {'new@email.com'}
        let(:student) {create(:student, :google_sso_provider, email: old_email)}
        let(:oauth_teacher) {User.find(student.id)}

        context 'using the same email' do
          let(:teacher_email) {old_email}

          it 'retains the original email' do
            _(oauth_teacher.email).must_equal old_email
          end

          it 'sets the user_type to TEACHER' do
            _(oauth_teacher.user_type).must_equal ::User::TYPE_TEACHER
          end
        end

        context 'using a different email' do
          let(:teacher_email) {new_email}

          it 'updates to the new email' do
            _(oauth_teacher.email).must_equal new_email
          end

          it 'sets the user_type to TEACHER' do
            _(oauth_teacher.user_type).must_equal ::User::TYPE_TEACHER
          end
        end
      end

      context 'when user is Google‐authenticated' do
        let(:student) {create(:student, :with_google_authentication_option)}
        let(:email_preference_params) do
          {email_preference_opt_in: 'yes',
           email_preference_request_ip: '127.0.0.1',
           email_preference_source: EmailPreference::ACCOUNT_TYPE_CHANGE,
           email_preference_form_kind: '0',}
        end
        let(:teacher) {User.find(student.id)}
        let(:teacher_email) {'email@google.com'}

        context 'when no matching AuthenticationOption exists' do
          before do
            student
            _(student.authentication_options.count).must_equal 2
            set_student_to_teacher
          end

          it 'upgrades the user to teacher' do
            _(teacher).must_be_instance_of Teacher
            _(teacher.user_type).must_equal ::User::TYPE_TEACHER
          end

          it 'keeps exactly two authentication options' do
            _(teacher.authentication_options.count).must_equal 2
          end

          it 'sets the user email' do
            _(teacher.email).must_equal teacher_email
          end

          it 'creates an EmailPreference with the correct defaults' do
            pref = EmailPreference.find_by_email(teacher_email)
            _(pref.opt_in).must_equal true
            _(pref.ip_address).must_equal '127.0.0.1'
            _(pref.source).must_equal EmailPreference::ACCOUNT_TYPE_CHANGE
            _(pref.form_kind).must_equal '0'
          end
        end

        context 'when a matching AuthenticationOption already exists' do
          let!(:auth_option) do
            puts "auth options: #{student.authentication_options.each.to_json}"
            student.authentication_options.find {|o| o.email.blank?}
          end

          let(:initial_count) do
            count = 0
            puts '-------- AuthenticationOption:'
            AuthenticationOption.all.each do |ao|
              count += 1
              puts count
              puts ao.to_json
            end

            puts '-------- student.authentication_options:'

            count = 0
            student.authentication_options.each do |ao|
              count += 1
              puts count
              puts ao.to_json
            end
            puts "auth count: #{student.authentication_options}"
            puts "Student auth count: #{student.authentication_options.size}"
            student.authentication_options.count
          end

          before do
            _(auth_option.email).must_be_empty
            _(initial_count).must_equal 3
            set_student_to_teacher
            auth_option.reload
          end

          it 'upgrades the user to teacher' do
            _(teacher).must_be_instance_of Teacher
            _(teacher.user_type).must_equal ::User::TYPE_TEACHER
          end

          it 'reduces authentication options to two' do
            _(teacher.authentication_options.count).must_equal initial_count - 1
          end

          it 'reuses the existing option as primary and updates its email' do
            _(teacher.primary_contact_info).must_equal auth_option
            _(auth_option.email).must_equal teacher_email
          end

          it 'creates an EmailPreference with opt-in enabled' do
            pref = EmailPreference.find_by_email(teacher_email)
            _(pref.opt_in).must_equal true
            _(pref.ip_address).must_equal '127.0.0.1'
            _(pref.source).must_equal EmailPreference::ACCOUNT_TYPE_CHANGE
            _(pref.form_kind).must_equal '0'
          end
        end
      end
    end
  end
end

# test 'upgrade_to_teacher is true if new authentication option is created' do
#   user = create :student, :with_google_authentication_option
#
#   assert_equal 2, user.authentication_options.count
#
#   assert user.upgrade_to_teacher('example@email.com', email_preference_params)
#   user = User.find(user.id)
#   assert_equal User::TYPE_TEACHER, user.user_type
#   assert_equal 2, user.authentication_options.count
#   assert_equal 'example@email.com', user.email
#   email_preference = EmailPreference.find_by_email('example@email.com')
#   refute email_preference.opt_in
#   assert_equal '127.0.0.1', email_preference.ip_address
#   assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, email_preference.source
#   assert_equal '0', email_preference.form_kind
# end
#
# test 'upgrade_to_teacher is true if matching authentication option is found' do
#   user = create :student, :with_google_authentication_option
#   auth_option = create :authentication_option, user: user, email: 'example@email.com'
#
#   assert_empty auth_option.email
#   assert_equal 3, user.authentication_options.count
#
#   email_preference_params = email_preference_params(email_preference_opt_in: 'yes')
#   assert user.upgrade_to_teacher('example@email.com', email_preference_params)
#   user = User.find(user.id)
#   auth_option.reload
#   assert_equal User::TYPE_TEACHER, user.user_type
#   assert_equal 2, user.authentication_options.count
#   assert_equal auth_option, user.primary_contact_info
#   assert_equal 'example@email.com', auth_option.email
#   email_preference = EmailPreference.find_by_email('example@email.com')
#   assert email_preference.opt_in
#   assert_equal '127.0.0.1', email_preference.ip_address
#   assert_equal EmailPreference::ACCOUNT_TYPE_CHANGE, email_preference.source
#   assert_equal '0', email_preference.form_kind
# end
