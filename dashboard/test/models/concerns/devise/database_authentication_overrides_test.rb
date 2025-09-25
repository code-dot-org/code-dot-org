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

  describe '#update_with_password' do
    context 'when the user does not have a password' do
      let(:student) {create(:student, :without_encrypted_password)}
      let(:new_name) {'Some Student'}
      let(:update_params) do
        {
          name: new_name,
          email: 'student@example.com',
          password: '[FILTERED]',
          password_confirmation: '[FILTERED]',
          current_password: '',
          locale: 'en-US',
          gender: '',
          age: '10'
        }
      end

      it 'allows updating attributes without requiring current password' do
        _(student.encrypted_password).must_be :blank?
        _(student.update_with_password(update_params)).must_equal true
        _(student.name).must_equal new_name
      end
    end
  end
end
