require 'test_helper'

class Queries::User::InactiveTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(scope: scope, inactive_since: inactive_since, query_with_warning: query_with_warning)}
  let(:inactive_since) {42.months.ago}
  let(:scope) {User.all}
  let(:query_with_warning) {false}

  describe '#call' do
    subject(:inactive_users) {described_instance.call}

    it 'returns users who have not signed in since the given date' do
      expected_user = create(:user, current_sign_in_at: inactive_since - 1.day)
      _(inactive_users).must_include expected_user
    end

    it 'does not return users who have signed in since the given date' do
      expected_user = create(:user, current_sign_in_at: inactive_since + 1.day)
      _(inactive_users).wont_include expected_user
    end

    context 'when a user has never signed in' do
      it 'returns the user who never signed in but was created before inactive_since' do
        expected_user = create(:user, current_sign_in_at: nil, created_at: inactive_since - 1.day)
        _(inactive_users).must_include expected_user
      end

      it 'does not return the user who never signed in but was created after inactive_since' do
        expected_user = create(:user, current_sign_in_at: nil, created_at: inactive_since + 1.day)
        _(inactive_users).wont_include expected_user
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

    context 'when quering for inactive_teacher_deletion_warning' do
      let(:inactive_since) {42.months.ago}
      let(:scope) {User.where(user_type: ::User::TYPE_TEACHER)}
      let(:query_with_warning) {true}

      subject(:inactive_users) {described_instance.call}

      it 'returns users who have not signed in since the given date' do
        expected_user = create(:teacher, current_sign_in_at: inactive_since - 1.day)
        _(inactive_users).must_include expected_user
      end
    end
  end
end
