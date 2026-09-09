require 'test_helper'

class ChallengeResponseReactionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  let(:student) {create(:student)}
  let(:other_student) {create(:student)}
  let(:outsider) {create(:student)}

  let(:challenge) {create(:challenge)}
  let(:challenge_response) {create(:challenge_response, challenge:, user: student, is_final: true)}

  let(:response_json) {JSON.parse(response.body)}

  # Put the author and one peer in a section so the peer can :read (and thus
  # react to) the author's final submission; the outsider shares no section.
  let(:section) {create(:section)}
  before do
    create(:follower, section:, student_user: student)
    create(:follower, section:, student_user: other_student)
  end

  describe 'POST #create' do
    context 'when not signed in' do
      it 'redirects to sign in' do
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        assert_redirected_to_sign_in
      end
    end

    context 'as a section peer' do
      before {sign_in other_student}

      it 'adds the reaction and returns the updated tallies' do
        assert_difference -> {challenge_response.challenge_response_reactions.count}, 1 do
          post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        end

        assert_response :success
        _(response_json['reactions']).must_equal([{'emoji' => 'heart', 'count' => 1, 'reacted' => true}])
      end

      it 'is idempotent: reacting twice with the same emoji is a no-op' do
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        assert_no_difference -> {challenge_response.challenge_response_reactions.count} do
          post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        end
        assert_response :success
        _(response_json['reactions'].first['count']).must_equal 1
      end

      it 'rejects an emoji outside the vocabulary' do
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'rocket'}
        assert_response :unprocessable_entity
        _(challenge_response.challenge_response_reactions.count).must_equal 0
      end

      it 'reports a peer as reacted only for their own reaction' do
        create(:challenge_response_reaction, challenge_response:, user: student, emoji: 'clap')
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}

        by_emoji = response_json['reactions'].index_by {|r| r['emoji']}
        _(by_emoji['clap']['reacted']).must_equal false
        _(by_emoji['heart']['reacted']).must_equal true
      end
    end

    context 'as the response owner' do
      before {sign_in student}

      it 'may react to their own project' do
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'trophy'}
        assert_response :success
      end
    end

    context 'as a user outside the section' do
      before {sign_in outsider}

      it 'is forbidden' do
        post :create, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        assert_response :forbidden
        _(challenge_response.challenge_response_reactions.count).must_equal 0
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'as a section peer' do
      before {sign_in other_student}

      it "removes the peer's own reaction and leaves others" do
        create(:challenge_response_reaction, challenge_response:, user: other_student, emoji: 'heart')
        create(:challenge_response_reaction, challenge_response:, user: student, emoji: 'heart')

        assert_difference -> {challenge_response.challenge_response_reactions.count}, -1 do
          delete :destroy, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        end

        assert_response :success
        # The other user's heart remains, so the chip stays at count 1, no
        # longer reacted by this viewer.
        _(response_json['reactions']).must_equal([{'emoji' => 'heart', 'count' => 1, 'reacted' => false}])
      end

      it 'is a no-op when the reaction is absent' do
        assert_no_difference -> {challenge_response.challenge_response_reactions.count} do
          delete :destroy, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        end
        assert_response :success
        _(response_json['reactions']).must_equal([])
      end

      it "does not remove another user's reaction with the same emoji" do
        create(:challenge_response_reaction, challenge_response:, user: student, emoji: 'heart')
        assert_no_difference -> {challenge_response.challenge_response_reactions.count} do
          delete :destroy, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        end
      end
    end

    context 'as a user outside the section' do
      before {sign_in outsider}

      it 'is forbidden' do
        create(:challenge_response_reaction, challenge_response:, user: student, emoji: 'heart')
        delete :destroy, params: {challenge_response_id: challenge_response.id, emoji: 'heart'}
        assert_response :forbidden
      end
    end
  end
end
