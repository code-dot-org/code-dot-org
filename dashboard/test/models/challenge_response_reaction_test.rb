require 'test_helper'

class ChallengeResponseReactionTest < ActiveSupport::TestCase
  setup do
    @response = create(:challenge_response)
    @user = create(:student)
  end

  test 'is valid with an emoji from the vocabulary' do
    reaction = build(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'clap')
    assert reaction.valid?
  end

  test 'rejects an emoji outside the vocabulary' do
    reaction = build(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'rocket')
    refute reaction.valid?
    assert_includes reaction.errors[:emoji], 'is not included in the list'
  end

  test 'rejects a blank emoji' do
    reaction = build(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: '')
    refute reaction.valid?
  end

  test 'forbids the same user reacting twice with the same emoji' do
    create(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'heart')
    duplicate = build(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'heart')
    refute duplicate.valid?
  end

  test 'allows the same user to react with different emoji' do
    create(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'heart')
    other = build(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'clap')
    assert other.valid?
  end

  test 'allows different users to react with the same emoji' do
    create(:challenge_response_reaction, challenge_response: @response, user: @user, emoji: 'heart')
    other = build(:challenge_response_reaction, challenge_response: @response, user: create(:student), emoji: 'heart')
    assert other.valid?
  end
end
