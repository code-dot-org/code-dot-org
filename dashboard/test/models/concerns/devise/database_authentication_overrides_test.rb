require 'test_helper'

class DatabaseAuthenticationOverridesTest < ActiveSupport::TestCase
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
end
