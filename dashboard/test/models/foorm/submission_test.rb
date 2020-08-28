require 'test_helper'

class Foorm::SubmissionTest < ActiveSupport::TestCase
  test 'submission strips out emojis from answers' do
    submission = create :basic_foorm_submission, answers: "{'a': 'b', 'c': '#{panda_panda} hello'}"
    expected_answers = "{'a': 'b', 'c': '#{panda_panda} hello'}"
    assert_equal expected_answers, submission.answers
  end

  test 'format matrix question works correctly' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'Strongly Disagree', answers['overall_success-more_prepared']
  end

  test 'format comment question works correctly' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'lots', answers['supported']
  end

  test 'format single select question works correctly' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'No, I do not give the workshop organizer my permission.', answers['permission']
  end
end
