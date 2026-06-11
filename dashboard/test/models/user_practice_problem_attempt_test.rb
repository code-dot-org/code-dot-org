require "test_helper"

class UserPracticeProblemAttemptTest < ActiveSupport::TestCase
  setup do
    @user = create(:student)
    @practice_problem = create(:practice_problem)
    @attempt = create(:user_practice_problem_attempt, user: @user, practice_problem: @practice_problem)
  end

  test 'attempt is accessible through the user record' do
    assert_includes @user.user_practice_problem_attempts, @attempt
  end

  test 'associated practice problem is accessible through the attempt record' do
    assert_equal @practice_problem, @attempt.practice_problem
  end
end
