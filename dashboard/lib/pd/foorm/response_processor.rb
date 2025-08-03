# Processes different types of survey question responses into standardized formats
module Pd::Foorm
  class ResponseProcessor
    # Likert scale conversion: 1→0, 2→17, 3→33, 4→50, 5→67, 6→83, 7→100
    LIKERT_WEIGHTS = {
      1 => 0,
      2 => 17,
      3 => 33,
      4 => 50,
      5 => 67,
      6 => 83,
      7 => 100
    }.freeze

    # Process single select responses with detailed breakdown
    def self.process_single_select_responses(question_summary, choices, has_other = false)
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.select {|v| v.is_a?(Numeric)}.sum
      breakdown = {}

      question_summary.each do |choice_key, count|
        next if choice_key == 'other_answers'

        choice_label = choices[choice_key] || choice_key
        breakdown[choice_key] = {
          count: count,
          percentage: total_responses > 0 ? (count.to_f / total_responses * 100).round(1) : 0,
          label: choice_label
        }
      end

      result = {
        total_responses: total_responses,
        breakdown: breakdown
      }

      # Only include other_answers if the question supports "Other" responses
      if has_other
        result[:other_answers] = question_summary['other_answers'] || []
      end

      result
    end

    # Process multi-select responses
    def self.process_multi_select_responses(question_summary, choices, has_other = false)
      return {} unless question_summary.is_a?(Hash)

      total_respondents = question_summary[:num_respondents] || 0
      breakdown = {}
      skip_keys = [:num_respondents, 'other_answers']

      question_summary.each do |choice_key, count|
        next if skip_keys.include?(choice_key)

        choice_label = choices[choice_key] || choice_key
        breakdown[choice_key] = {
          count: count,
          percentage: total_respondents > 0 ? (count.to_f / total_respondents * 100).round(1) : 0,
          label: choice_label
        }
      end

      result = {
        total_respondents: total_respondents,
        breakdown: breakdown
      }

      # Only include other_answers if the question supports "Other" responses
      if has_other
        result[:other_answers] = question_summary['other_answers'] || []
      end

      result
    end

    # Process rating responses with promoter percentage calculation (for NPS-style 0-10 ratings)
    def self.process_rating_responses(question_summary, choices)
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.sum
      breakdown = {}
      promoter_count = 0

      question_summary.each do |choice_key, count|
        next if choice_key == 'other_answers'

        choice_label = choices[choice_key] || choice_key
        breakdown[choice_key] = {
          count: count,
          percentage: total_responses > 0 ? (count.to_f / total_responses * 100).round(1) : 0,
          label: choice_label
        }

        # Count promoters (ratings >= 7)
        if choice_key.to_i >= 7
          promoter_count += count
        end
      end

      # Calculate promoter percentage and round to nearest whole number
      promoter_percentage = total_responses > 0 ? (promoter_count.to_f / total_responses * 100).round : 0

      {
        total_responses: total_responses,
        promoter_percentage: promoter_percentage,
        breakdown: breakdown
      }
    end

    # Process Likert scale responses with weighted score calculation (for 1-7 agreement scales)
    def self.process_likert_responses(question_summary, choices)
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.sum
      breakdown = {}
      weighted_sum = 0
      agreement_count = 0 # Count of responses >= 5 (Slightly Agree and above)

      question_summary.each do |choice_key, count|
        next if choice_key == 'other_answers'

        choice_value = choice_key.to_i
        choice_label = choices[choice_key] || choice_key
        weighted_value = LIKERT_WEIGHTS[choice_value] || 0

        breakdown[choice_key] = {
          count: count,
          percentage: total_responses > 0 ? (count.to_f / total_responses * 100).round(1) : 0,
          label: choice_label,
          weighted_value: weighted_value
        }

        # Add to weighted sum
        weighted_sum += weighted_value * count

        # Count agreement responses (5, 6, 7)
        if choice_value >= 5
          agreement_count += count
        end
      end

      # Calculate weighted score (0-100) and agreement percentage
      weighted_score = total_responses > 0 ? (weighted_sum.to_f / total_responses).round : 0
      agreement_percentage = total_responses > 0 ? (agreement_count.to_f / total_responses * 100).round : 0

      {
        total_responses: total_responses,
        weighted_score: weighted_score,
        agreement_percentage: agreement_percentage,
        breakdown: breakdown
      }
    end

    # Process text responses
    def self.process_text_responses(question_summary)
      return {} unless question_summary.is_a?(Array)

      {
        total_responses: question_summary.length,
        responses: question_summary.compact_blank
      }
    end
  end
end
