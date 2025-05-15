require 'test_helper'

class Queries::User::InactiveTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(scope: scope, inactive_since: inactive_since)}
  let(:inactive_since) {42.months.ago}
  let(:scope) {User.all}
  
  describe '#call' do
    subject(:inactive_users) {described_instance.call}

    let!(:active_user) {create(:user)}
    let!(:inactive_user) {create(:user, current_sign_in_at: inactive_since)}
    let!(:inactive_user_2) {create(:user, current_sign_in_at: inactive_since + 1.month)}

    it 'returns users who have not signed in since the given date' do
      _(inactive_users).must_include inactive_user
      _(inactive_users).wont_include active_user
      _(inactive_users).wont_include inactive_user_2
    end

    context 'when scope is empty' do
      let(:scope) {User.none}

      it 'returns an empty relation' do
        _(inactive_users).must_be_empty
      end
    end

    context 'when inactive_since is nil' do
      let(:inactive_since) {nil}

      it 'returns all users' do
        _(inactive_users).must_include active_user
        _(inactive_users).must_include inactive_user
        _(inactive_users).must_include inactive_user_2
      end
    end
  end
end