require 'test_helper'

module Pd::Foorm
  class SubmissionAnalyticsParserTest < ActiveSupport::TestCase
    setup_all {@form = create :foorm_form_csf_intro_post_survey}
    teardown_all {@form.delete}

    test 'reshape_submission formats matrix question response as expected' do
      submission = create :csf_intro_post_foorm_submission, :answers_low
      reshaped_submission = SubmissionAnalyticsParser.reshape_submission(submission)

      assert_includes reshaped_submission, {
        submission_id: submission.id,
        question_name: 'more_prepared',
        matrix_item_name: 'overall_success',
        response_value: '1',
        response_text: 'Strongly Disagree'
      }
    end

    test 'reshape_submission formats matrix question response as expected for facilitator question' do
      submission = create :csf_intro_post_facilitator_foorm_submission, :answers_high
      reshaped_submission = SubmissionAnalyticsParser.reshape_submission(submission)

      assert_includes reshaped_submission, {
        submission_id: submission.id,
        question_name: 'on_track',
        matrix_item_name: 'facilitator_effectiveness',
        response_value: '7',
        response_text: 'Strongly Agree'
      }
    end

    test 'reshape_submission formats comment question response as expected' do
      submission = create :csf_intro_post_foorm_submission, :answers_low
      reshaped_submission = SubmissionAnalyticsParser.reshape_submission(submission)

      assert_includes reshaped_submission, {
        submission_id: submission.id,
        question_name: 'supported',
        response_text: 'lots'
      }
    end

    test 'reshape_submission formats single select question response as expected' do
      submission = create :csf_intro_post_foorm_submission, :answers_low
      reshaped_submission = SubmissionAnalyticsParser.reshape_submission(submission)

      assert_includes reshaped_submission, {
        submission_id: submission.id,
        question_name: 'permission',
        response_value: 'no',
        response_text: 'No, I do not give the workshop organizer my permission.'
      }
    end

    test 'reshape_submission formats multi select question response as expected' do
      form_with_multi_select_question = create :foorm_form, :with_multi_select_question
      submission = create :basic_foorm_submission,
        :with_multi_select_answer,
        form_name: form_with_multi_select_question.name

      reshaped_submission = SubmissionAnalyticsParser.reshape_submission(submission)

      assert_includes reshaped_submission, {
        submission_id: submission.id,
        question_name: 'not_members_spice_girls',
        response_value: %w(radical spicy),
        response_text: 'Radical, Spicy'
      }
    end
  end
end
