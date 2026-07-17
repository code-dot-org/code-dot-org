require 'test_helper'

class QuizResponseTest < ActiveSupport::TestCase
  test 'create with required fields' do
    quiz = create(:quiz, name: 'quiz_response_test')
    user = create(:user)

    quiz_response = QuizResponse.create!(
      level: quiz,
      user: user,
      response_data: {'q_1' => 'B'},
      submitted_at: Time.now,
    )

    assert quiz_response.persisted?
    assert_equal({'q_1' => 'B'}, quiz_response.reload.response_data)
  end

  test 'requires a level and a user' do
    quiz_response = QuizResponse.new(response_data: {})
    refute quiz_response.valid?
  end
end
