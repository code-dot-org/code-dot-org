require 'test_helper'

module Pd::Foorm
  class ResponseProcessorTest < ActiveSupport::TestCase
    test 'process_single_select_responses handles basic data correctly' do
      question_summary = {'option1' => 3, 'option2' => 2}
      choices = {'option1' => 'Option 1', 'option2' => 'Option 2'}

      result = ResponseProcessor.process_single_select_responses(question_summary, choices)

      expected = {
        total_responses: 5,
        breakdown: {
          'option1' => {count: 3, percentage: 60.0, label: 'Option 1'},
          'option2' => {count: 2, percentage: 40.0, label: 'Option 2'}
        }
      }

      assert_equal expected.with_indifferent_access, result.with_indifferent_access
    end

    test 'process_single_select_responses handles other answers when has_other is true' do
      question_summary = {'option1' => 2, 'other_answers' => ['Custom answer 1', 'Custom answer 2']}
      choices = {'option1' => 'Option 1'}

      result = ResponseProcessor.process_single_select_responses(question_summary, choices, true)

      expected = {
        total_responses: 2,
        breakdown: {
          'option1' => {count: 2, percentage: 100.0, label: 'Option 1'}
        },
        other_answers: ['Custom answer 1', 'Custom answer 2']
      }

      assert_equal expected.with_indifferent_access, result.with_indifferent_access
    end

    test 'process_multi_select_responses handles basic data correctly' do
      question_summary = {
        num_respondents: 4,
        'option1' => 3,
        'option2' => 2,
        'option3' => 1
      }
      choices = {'option1' => 'Option 1', 'option2' => 'Option 2', 'option3' => 'Option 3'}

      result = ResponseProcessor.process_multi_select_responses(question_summary, choices)

      expected = {
        total_respondents: 4,
        breakdown: {
          'option1' => {count: 3, percentage: 75.0, label: 'Option 1'},
          'option2' => {count: 2, percentage: 50.0, label: 'Option 2'},
          'option3' => {count: 1, percentage: 25.0, label: 'Option 3'}
        }
      }

      assert_equal expected.with_indifferent_access, result.with_indifferent_access
    end

    test 'process_rating_responses calculates NPS promoter percentage correctly' do
      # NPS scale: 0-10, promoters are >= 7
      question_summary = {
        '6' => 1,  # Not promoter
        '7' => 2,  # Promoter
        '8' => 1,  # Promoter
        '9' => 1   # Promoter
      }
      choices = {
        '6' => '6',
        '7' => '7',
        '8' => '8',
        '9' => '9'
      }

      result = ResponseProcessor.process_rating_responses(question_summary, choices)

      # 4 out of 5 responses are >= 7, so 80% promoter rate
      expected_promoter_percentage = 80

      assert_equal 5, result[:total_responses]
      assert_equal expected_promoter_percentage, result[:promoter_percentage]
      assert_equal 4, result[:breakdown].size
    end

    test 'process_rating_responses handles edge case with no promoters' do
      question_summary = {
        '0' => 1,
        '3' => 2,
        '6' => 1
      }
      choices = {'0' => '0', '3' => '3', '6' => '6'}

      result = ResponseProcessor.process_rating_responses(question_summary, choices)

      assert_equal 4, result[:total_responses]
      assert_equal 0, result[:promoter_percentage]
    end

    test 'process_likert_responses calculates weighted score correctly' do
      # Test the exact example from the spec: responses 7,6,7,5,4,6,7,6 should average to 83
      question_summary = {
        '4' => 1,  # Neutral → 50
        '5' => 1,  # Slightly Agree → 67
        '6' => 3,  # Agree → 83
        '7' => 3   # Strongly Agree → 100
      }
      choices = {
        '4' => 'Neutral',
        '5' => 'Slightly Agree',
        '6' => 'Agree',
        '7' => 'Strongly Agree'
      }

      result = ResponseProcessor.process_likert_responses(question_summary, choices)

      # Weighted calculation: (50*1 + 67*1 + 83*3 + 100*3) / 8 = 666/8 = 83.25 → 83
      expected_weighted_score = 83
      # Agreement percentage: responses >= 5 = 1+3+3 = 7 out of 8 = 87.5% → 88%
      expected_agreement_percentage = 88

      assert_equal 8, result[:total_responses]
      assert_equal expected_weighted_score, result[:weighted_score]
      assert_equal expected_agreement_percentage, result[:agreement_percentage]

      # Check breakdown includes weighted values
      assert_equal 50, result[:breakdown]['4'][:weighted_value]
      assert_equal 67, result[:breakdown]['5'][:weighted_value]
      assert_equal 83, result[:breakdown]['6'][:weighted_value]
      assert_equal 100, result[:breakdown]['7'][:weighted_value]
    end

    test 'process_likert_responses handles all strongly disagree responses' do
      question_summary = {'1' => 5}
      choices = {'1' => 'Strongly Disagree'}

      result = ResponseProcessor.process_likert_responses(question_summary, choices)

      assert_equal 5, result[:total_responses]
      assert_equal 0, result[:weighted_score]  # All 1s → 0 weighted score
      assert_equal 0, result[:agreement_percentage]  # No responses >= 5
    end

    test 'process_likert_responses handles all strongly agree responses' do
      question_summary = {'7' => 3}
      choices = {'7' => 'Strongly Agree'}

      result = ResponseProcessor.process_likert_responses(question_summary, choices)

      assert_equal 3, result[:total_responses]
      assert_equal 100, result[:weighted_score]  # All 7s → 100 weighted score
      assert_equal 100, result[:agreement_percentage]  # All responses >= 5
    end

    test 'process_likert_responses handles mixed responses across full scale' do
      question_summary = {
        '1' => 1,  # Strongly Disagree → 0
        '2' => 1,  # Disagree → 17
        '3' => 1,  # Slightly Disagree → 33
        '4' => 1,  # Neutral → 50
        '5' => 1,  # Slightly Agree → 67
        '6' => 1,  # Agree → 83
        '7' => 1   # Strongly Agree → 100
      }
      choices = {
        '1' => 'Strongly Disagree',
        '2' => 'Disagree',
        '3' => 'Slightly Disagree',
        '4' => 'Neutral',
        '5' => 'Slightly Agree',
        '6' => 'Agree',
        '7' => 'Strongly Agree'
      }

      result = ResponseProcessor.process_likert_responses(question_summary, choices)

      # Weighted: (0+17+33+50+67+83+100)/7 = 350/7 = 50
      expected_weighted_score = 50
      # Agreement: 3 out of 7 responses >= 5 = 42.857% → 43%
      expected_agreement_percentage = 43

      assert_equal 7, result[:total_responses]
      assert_equal expected_weighted_score, result[:weighted_score]
      assert_equal expected_agreement_percentage, result[:agreement_percentage]
    end

    test 'process_text_responses handles text array correctly' do
      question_summary = [
        'First response',
        'Second response',
        '',  # Should be filtered out by compact_blank
        'Third response'
      ]

      result = ResponseProcessor.process_text_responses(question_summary)

      expected = {
        total_responses: 3,
        responses: ['First response', 'Second response', 'Third response']
      }

      assert_equal expected, result
    end

    test 'process_text_responses handles empty array' do
      result = ResponseProcessor.process_text_responses([])

      expected = {
        total_responses: 0,
        responses: []
      }

      assert_equal expected.with_indifferent_access, result.with_indifferent_access
    end

    test 'all processors handle invalid input gracefully' do
      # Test with non-hash input for hash-expecting methods
      assert_equal({}, ResponseProcessor.process_single_select_responses([], {}))
      assert_equal({}, ResponseProcessor.process_multi_select_responses('invalid', {}))
      assert_equal({}, ResponseProcessor.process_rating_responses(nil, {}))
      assert_equal({}, ResponseProcessor.process_likert_responses(42, {}))

      # Test with non-array input for array-expecting method
      assert_equal({}, ResponseProcessor.process_text_responses({}))
    end

    test 'LIKERT_WEIGHTS constant has correct conversion values' do
      expected_weights = {
        1 => 0,
        2 => 17,
        3 => 33,
        4 => 50,
        5 => 67,
        6 => 83,
        7 => 100
      }

      assert_equal expected_weights, ResponseProcessor::LIKERT_WEIGHTS
    end
  end
end
