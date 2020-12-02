require 'test_helper'

class Foorm::SubmissionTest < ActiveSupport::TestCase
  test 'submission strips out emojis from answers' do
    submission = create :basic_foorm_submission, answers: "{'a': 'b', 'c': '#{panda_panda} hello'}"
    expected_answers = "{'a': 'b', 'c': '#{panda_panda} hello'}"
    assert_equal expected_answers, submission.answers
  end

  test 'formatted_answers formats matrix question response as expected' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'Strongly Disagree', answers['overall_success-more_prepared']
  end

  test 'formatted_answers formats matrix question response as expected for facilitator question' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_facilitator_foorm_submission, :answers_high
    answers = submission.formatted_answers

    assert_equal 'Strongly Agree', answers['facilitator_effectiveness-on_track']
  end

  test 'formatted_answers formats comment question response as expected' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'lots', answers['supported']
  end

  test 'formatted_answers formats single select question response as expected' do
    create :foorm_form_csf_intro_post_survey
    submission = build :csf_intro_post_foorm_submission, :answers_low
    answers = submission.formatted_answers

    assert_equal 'No, I do not give the workshop organizer my permission.', answers['permission']
  end

  test 'formatted_answers formats multi select question response as expected' do
    form = create :foorm_form, :with_multi_select_question
    submission = build :basic_foorm_submission,
      :with_multi_select_answer,
      form_name: form.name
    answers = submission.formatted_answers

    assert_equal 'Radical, Spicy', answers['not_members_spice_girls']
  end

  test 'formatted_answers formats submission with workshop metadata as expected' do
    create :foorm_form_csf_intro_post_survey
    workshop_form_submission_metadata = create :csf_intro_post_workshop_submission, :answers_low
    answers = workshop_form_submission_metadata.foorm_submission.formatted_answers

    workshop_metadata_keys = ['user_id', 'pd_workshop_id', 'pd_session_id']

    assert (workshop_metadata_keys - answers.keys).empty?,
      <<~MISSING_KEYS_MESSAGE
        Expected formatted_answers keys to contain workshop metadata keys:
          #{workshop_metadata_keys}
        Found:
          #{answers.keys}
      MISSING_KEYS_MESSAGE
  end

  test 'associated_facilitator_submissions finds submissions when they exist' do
    user = create :teacher
    workshop = create :csf_101_workshop

    workshop_submission_metadata = create :csf_intro_post_workshop_submission,
      :answers_low,
      user: user,
      pd_workshop: workshop

    assert_equal [],
      workshop_submission_metadata.foorm_submission.associated_facilitator_submissions

    facilitator_submission_metadata = create :csf_intro_post_facilitator_workshop_submission,
      :answers_low,
      user: user,
      pd_workshop: workshop

    assert_equal [facilitator_submission_metadata.foorm_submission],
      workshop_submission_metadata.foorm_submission.associated_facilitator_submissions
  end
end
