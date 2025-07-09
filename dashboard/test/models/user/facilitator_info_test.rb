require 'test_helper'

class User::FacilitatorInfoTest < ActiveSupport::TestCase
  describe 'validations' do
    subject(:user_facilitator_info) {build(:user_facilitator_info, user: user)}

    let(:user) {create(:facilitator)}

    it 'is valid' do
      _user_facilitator_info.must_be :valid?
    end

    context 'when associated user has no facilitator permission' do
      before do
        user.delete_permission(UserPermission::FACILITATOR)
      end

      it 'is invalid' do
        _(user).wont_be :facilitator?
        _user_facilitator_info.wont_be :valid?
        _(user_facilitator_info.errors.full_messages).must_equal ['User must have the facilitator permission']
      end
    end
  end
end
