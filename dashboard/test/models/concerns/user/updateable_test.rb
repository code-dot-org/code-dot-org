require 'test_helper'

class UpdateableTest < ActiveSupport::TestCase
  describe "#update_without_password" do
    context "when" do
      let(:student) {build :user, user_type: 'student'}
      it "test" do
        params = {email: 'newemail@email.com'}

        student.update_without_password(params)
      end
    end
  end

  test 'update_with_password does not require current password for users without passwords' do
    student = create(:student)
    student.update_attribute(:encrypted_password, '')

    assert student.encrypted_password.blank?

    name = "Some Student"
    assert student.update_with_password(
      name: name,
      email: "student@example.com",
      password: "[FILTERED]",
      password_confirmation: "[FILTERED]",
      current_password: "",
      locale: "en-US",
      gender: "",
      age: "10"
    )

    assert_equal name, student.name
  end

  test 'update_email_for does not update migrated user AuthenticationOption if provider and uid are not present' do
    user = create :user
    user.update_email_for(provider: nil, uid: nil, email: 'new@email.com')
    user.reload
    refute_equal User.hash_email('new@email.com'), user.hashed_email
  end
end
