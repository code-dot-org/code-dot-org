require 'test_helper'

class Foorm::SubmissionTest < ActiveSupport::TestCase
  test 'submission strips out emojis from answers' do
    submission = create :basic_foorm_submission, answers: "{'a': 'b', 'c': '#{panda_panda} hello'}"
    expected_answers = "{'a': 'b', 'c': '#{panda_panda} hello'}"
    assert_equal expected_answers, submission.answers
  end
end
