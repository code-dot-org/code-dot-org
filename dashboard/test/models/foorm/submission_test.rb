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

    assert answers.include?(
      {
        question: "How much do you agree or disagree with the following statements about the workshop overall? >> I feel more prepared to teach the material covered in this workshop than before I came.",
        answer: "Strongly Disagree"
      }
    )
  end

  test 'format comment question works correctly' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert answers.include?(
      {
        question: "What supported your learning the most today and why?",
        answer: "lots"
      }
    )
  end

  test 'format single select question works correctly' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert answers.include?(
      {
        question: "I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications.",
        answer: "No, I do not give the workshop organizer my permission."
      }
    )
  end
end
