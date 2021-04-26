require 'test_helper'

module Pd::Foorm
  class FormAnalyticsParserTest < ActiveSupport::TestCase
    setup_all do
      @form = create :foorm_form_csf_intro_post_survey
      @reshaped_form = FormAnalyticsParser.reshape_form(@form)
    end

    teardown_all {@form.delete}

    test 'reshape_form formats matrix question as expected' do
      assert_includes @reshaped_form, {
        form_id: @form.id,
        form_name: @form.name,
        form_version: @form.version,
        question_type: 'matrix',
        question_name: 'overall_success',
        question_text: 'How much do you agree or disagree with the following statements about the workshop overall?',
        matrix_item_name: 'more_prepared',
        matrix_item_text: 'I feel more prepared to teach the material covered in this workshop than before I came.',
        is_facilitator_specific: 0,
        response_options: ['Strongly Disagree', 'Disagree', 'Slightly Disagree', 'Neutral', 'Slightly Agree', 'Agree', 'Strongly Agree'],
        num_response_options: 7
      }
    end

    test 'reshape_form formats matrix question as expected for facilitator question' do
      assert_includes @reshaped_form, {
        form_id: @form.id,
        form_name: @form.name,
        form_version: @form.version,
        question_type: 'matrix',
        question_name: 'facilitator_effectiveness',
        question_text: 'During my workshop, my facilitator did the following:',
        matrix_item_name: 'on_track',
        matrix_item_text: 'Kept the workshop and participants on track.',
        is_facilitator_specific: 1,
        response_options: ['Strongly Disagree', 'Disagree', 'Slightly Disagree', 'Neutral', 'Slightly Agree', 'Agree', 'Strongly Agree'],
        num_response_options: 7
      }
    end

    test 'reshape_form formats comment question as expected' do
      assert_includes @reshaped_form, {
        form_id: @form.id,
        form_name: @form.name,
        form_version: @form.version,
        question_type: 'text',
        question_name: 'supported',
        question_text: 'What supported your learning the most today and why?',
        is_facilitator_specific: 0
      }
    end

    test 'reshape_form formats single select question as expected' do
      assert_includes @reshaped_form, {
        form_id: @form.id,
        form_name: @form.name,
        form_version: @form.version,
        question_type: 'singleSelect',
        question_name: 'permission',
        question_text: 'I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications.',
        is_facilitator_specific: 0,
        response_options: ['Yes, I give the workshop organizer permission to quote me and use my name.', 'Yes, I give the workshop organizer permission to quote me, but I want to be anonymous.', 'No, I do not give the workshop organizer my permission.'],
        num_response_options: 3
      }
    end

    test 'reshape_form formats multi select question as expected' do
      form_with_multi_select_question = create :foorm_form, :with_multi_select_question
      reshaped_form_with_multi_select_question = FormAnalyticsParser.reshape_form(form_with_multi_select_question)

      assert_includes reshaped_form_with_multi_select_question, {
        form_id: form_with_multi_select_question.id,
        form_name: form_with_multi_select_question.name,
        form_version: form_with_multi_select_question.version,
        question_type: 'multiSelect',
        question_name: 'not_members_spice_girls',
        question_text: 'Which of the following are NOT names of members of the Spice Girls?',
        is_facilitator_specific: 0,
        response_options: %w(Sporty Radical Spicy Posh Ginger),
        num_response_options: 5
      }
    end
  end
end
