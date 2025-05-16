require 'test_helper'

class Queries::User::InactiveTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(scope: scope, inactive_since: inactive_since)}
  let(:inactive_since) {42.months.ago}
  let(:current_sign_in_at) {1.day.ago}
  let(:created_at) {1.day.ago}
  let(:active_user) {create(:user)}
  let(:inactive_user) {create(:user, current_sign_in_at: inactive_since)}
  let(:inactive_user_2) {create(:user, current_sign_in_at: 5.years.ago)}
  let(:custom_date_user) {create(:user, current_sign_in_at: current_sign_in_at, created_at: created_at)}
  let(:scope) {User.where(id: [active_user.id, inactive_user.id, inactive_user_2.id, custom_date_user.id])}

  describe '#call' do
    subject(:inactive_users) {described_instance.call}

    it 'returns users who have not signed in since the given date' do
      _(inactive_users).must_include inactive_user
      _(inactive_users).must_include inactive_user_2
      _(inactive_users).wont_include active_user
    end

    context 'when an inactive user has never signed in' do
      let(:current_sign_in_at) {nil}
      let(:created_at) {inactive_since - 1.day}

      it 'returns the user who never signed in but was created before inactive_since' do
        _(inactive_users).must_include custom_date_user
      end
    end

    context 'when scope is empty' do
      let(:scope) {User.none}

      it 'returns an empty relation' do
        _(inactive_users).must_be_empty
      end
    end

    context 'when inactive_since is nil' do
      let(:inactive_since) {nil}

      it 'returns an empty relation' do
        _(inactive_users).must_be_empty
      end
    end

    context 'when inactive_since is not a Date' do
      let(:inactive_since) {2025}

      it 'raises an ArgumentError' do
        _(-> {inactive_users}).must_raise ArgumentError
      end
    end
  end
end
