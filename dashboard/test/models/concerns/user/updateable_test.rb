require 'test_helper'

class UpdateableTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks
  describe "#update_without_password" do
    context "when updating a student without providing a password" do
      let(:student) {create(:student)}
      it "updates attributes without requiring a password" do
        name = "Coder"

        student.update_without_password(name: name)
        _(student.name).must_equal name
      end
    end
  end

  describe "#update_with_password" do
    context "when the user does not have a password" do
      let(:student) {create(:student)}

      before do
        student.update_attribute(:encrypted_password, '')
      end

      it 'does not require current password to update attributes' do
        _(student.encrypted_password).must_be :blank?

        name = 'Some Student'
        result = student.update_with_password(
          name: name,
          email: 'student@example.com',
          password: '[FILTERED]',
          password_confirmation: '[FILTERED]',
          current_password: '',
          locale: 'en-US',
          gender: '',
          age: '10'
        )

        _(result).must_equal true
        _(student.name).must_equal name
      end
    end
  end

  describe '#update_email_for' do
    let(:uid) {'123456'}
    let(:user) {create :user}

    it 'does not update migrated user AuthenticationOption if provider and uid are not present' do
      user.update_email_for(provider: nil, uid: nil, email: 'new@email.com')
      user.reload

      _(user.hashed_email).wont_equal User.hash_email('new@email.com')
    end

    it 'does not update migrated user AuthenticationOption if no matching AuthenticationOption' do
      google_auth_option = create :google_authentication_option, user: user, authentication_id: uid
      user.update_email_for(provider: AuthenticationOption::GOOGLE, uid: 'not-my-uid', email: 'new@email.com')
      google_auth_option.reload

      _(google_auth_option.hashed_email).wont_equal User.hash_email('new@email.com')
    end

    it 'updates migrated user AuthenticationOption if matching AuthenticationOption' do
      google_auth_option = create :google_authentication_option, user: user, authentication_id: uid
      user.reload
      user.update_email_for(provider: AuthenticationOption::GOOGLE, uid: uid, email: 'new@email.com')
      google_auth_option.reload

      _(google_auth_option.hashed_email).must_equal User.hash_email('new@email.com')
    end
  end

  describe '#update_primary_contact_info' do
    context 'when email information is missing' do
      let(:user) {create :user}
      let(:teacher) {create :teacher}

      it 'returns false if email and hashed_email are nil' do
        successful_save = user.update_primary_contact_info(new_email: nil, new_hashed_email: nil)
        _(successful_save).must_equal false
      end

      it 'returns false if email is nil for teacher' do
        successful_save = teacher.update_primary_contact_info(new_email: nil)
        _(successful_save).must_equal false
      end
    end

    context 'when a teacher has no matching authentication option for the new email' do
      let(:teacher) {create :teacher, :with_google_authentication_option}

      it 'adds new email option' do
        _(teacher.authentication_options.count).must_equal 2
        _(teacher.primary_contact_info).wont_be_nil

        successful_save = teacher.update_primary_contact_info(new_email: 'example@email.com')
        teacher.reload

        _(successful_save).must_equal true
        _(teacher.authentication_options.count).must_equal 2
        _(teacher.primary_contact_info.email).must_equal 'example@email.com'
      end
    end

    context 'when a teacher has one existing email authentication option' do
      let(:teacher) {create :teacher}

      it 'replaces the email option while keeping the count at 1' do
        _(teacher.authentication_options.count).must_equal 1
        _(teacher.primary_contact_info).wont_be_nil

        successful_save = teacher.update_primary_contact_info(new_email: 'second@email.com')
        teacher.reload

        _(successful_save).must_equal true
        _(teacher.authentication_options.count).must_equal 1
        _(teacher.primary_contact_info.email).must_equal 'second@email.com'
      end
    end

    context 'when a teacher has both oauth and email authentication options' do
      let(:teacher) {create :teacher, :with_google_authentication_option}
      let!(:existing_email) {teacher.primary_contact_info.email}

      it 'replaces the email option and updates the primary contact email' do
        _(teacher.authentication_options.count).must_equal 2
        _(teacher.primary_contact_info).wont_be_nil

        # Update primary to a different email
        teacher.update_primary_contact_info(new_email: 'examplee@email.com')
        teacher.reload

        _(teacher.authentication_options.count).must_equal 2
        _(teacher.primary_contact_info.email).must_equal 'examplee@email.com'

        # Change back to original oauth email
        successful_save = teacher.update_primary_contact_info(new_email: existing_email)
        teacher.reload

        _(successful_save).must_equal true
        _(teacher.authentication_options.count).must_equal 1
        _(teacher.primary_contact_info.email).must_equal existing_email
      end
    end

    context 'when both email and hashed_email are provided' do
      let(:teacher) {create :teacher}

      it 'recalculates hashed_email and updates correctly' do
        _(teacher.authentication_options.count).must_equal 1
        _(teacher.primary_contact_info).wont_be_nil

        successful_save = teacher.update_primary_contact_info(new_email: 'first@email.com', new_hashed_email: User.hash_email('second@email.com'))
        _(successful_save).must_equal true
        _(teacher.authentication_options.count).must_equal 1
        _(teacher.primary_contact_info.hashed_email).must_equal User.hash_email('first@email.com')
      end
    end

    context 'when using basic email student user' do
      let(:student) {create :student}

      it 'replaces email option for student if one already exists' do
        _(student.authentication_options.count).must_equal 1
        _(student.primary_contact_info).wont_be_nil

        hashed_new_email = User.hash_email('second@email.com')
        successful_save = student.update_primary_contact_info(new_hashed_email: hashed_new_email)
        student.reload
        _(successful_save).must_equal true
        _(student.authentication_options.count).must_equal 1
        _(student.primary_contact_info.hashed_email).must_equal hashed_new_email
      end

      it 'recalculates hashed_email if both email and hashed_email are supplied for student' do
        _(student.authentication_options.count).must_equal 1
        _(student.primary_contact_info).wont_be_nil

        successful_save = student.update_primary_contact_info(new_email: 'first@email.com', new_hashed_email: User.hash_email('second@email.com'))
        _(successful_save).must_equal true
        _(student.authentication_options.count).must_equal 1
        _(student.primary_contact_info.hashed_email).must_equal User.hash_email('first@email.com')
      end

      it 'fails safely if the new email is already taken for email user' do
        taken_email = 'taken@example.org'
        create :student, email: taken_email
        update_primary_contact_info_fails_safely_for(student, new_email: taken_email)
      end
    end

    context 'when using an oath student user' do
      let(:oauth_student) {create :student, :with_google_authentication_option}

      it 'adds new email option for student if no matches exist' do
        _(oauth_student.authentication_options.count).must_equal 2
        _(oauth_student.primary_contact_info).wont_be_nil

        hashed_new_email = User.hash_email('example@email.com')
        successful_save = oauth_student.update_primary_contact_info(new_hashed_email: hashed_new_email)
        oauth_student.reload
        _(successful_save).must_equal true
        _(oauth_student.authentication_options.count).must_equal 2
        _(oauth_student.primary_contact_info.hashed_email).must_equal hashed_new_email
      end

      it 'oauth option replaces any existing email options for student' do
        existing_hashed_email = oauth_student.primary_contact_info.hashed_email

        _(oauth_student.authentication_options.count).must_equal 2
        _(oauth_student.primary_contact_info).wont_be_nil

        # Update primary to a different email
        hashed_new_email = User.hash_email('example@email.com')
        oauth_student.update_primary_contact_info(new_hashed_email: hashed_new_email)
        oauth_student.reload
        _(oauth_student.authentication_options.count).must_equal 2
        _(oauth_student.primary_contact_info.hashed_email).must_equal hashed_new_email

        # Change back to original oauth email
        successful_save = oauth_student.update_primary_contact_info(new_hashed_email: existing_hashed_email)
        oauth_student.reload
        _(successful_save).must_equal true
        _(oauth_student.authentication_options.count).must_equal 1
        _(oauth_student.primary_contact_info.hashed_email).must_equal existing_hashed_email
      end

      it 'fails safely if the new email is already taken for oauth user' do
        taken_email = 'taken@example.org'
        create :student, email: taken_email
        update_primary_contact_info_fails_safely_for(oauth_student, new_email: taken_email)
      end
    end

    context 'when using a sponsored student user' do
      let(:sponsored_student) {create(:student_in_picture_section)}

      it 'fails safely if the new email is already taken for sponsored user' do
        taken_email = 'taken@example.org'
        create :student, email: taken_email
        update_primary_contact_info_fails_safely_for(sponsored_student, new_email: taken_email)
      end
    end
  end

  def update_primary_contact_info_fails_safely_for(user, **params)
    original_primary_contact_info = user.primary_contact_info

    refute_creates_or_destroys AuthenticationOption do
      _(user.update_primary_contact_info(**params)).must_equal false
    end

    user.reload
    if original_primary_contact_info.nil?
      _(user.primary_contact_info).must_be_nil
    else
      _(user.primary_contact_info).must_equal original_primary_contact_info
    end
  end
end
