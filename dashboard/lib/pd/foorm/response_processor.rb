# Processes different types of survey question responses into standardized formats
module Pd::Foorm
  class ResponseProcessor
    include Constants

    # Process single select responses with detailed breakdown
    def self.process_single_select_responses(question_summary, choices, has_other = false)
      question_summary ||= {}
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.filter {|v| v.is_a?(Numeric)}.sum
      breakdown = {}

      choices.each do |choice_key, choice_label|
        next if choice_key == 'other_answers'
        count = question_summary[choice_key] || 0
        breakdown[choice_key] = {
          count: count,
          percentage: calculate_percentage(count, total_responses, 1),
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
      question_summary ||= {}
      return {} unless question_summary.is_a?(Hash)

      total_respondents = question_summary[:num_respondents] || 0
      breakdown = {}
      skip_keys = [:num_respondents, 'other_answers']

      choices.each do |choice_key, choice_label|
        next if skip_keys.include?(choice_key)
        count = question_summary[choice_key] || 0
        breakdown[choice_key] = {
          count: count,
          percentage: calculate_percentage(count, total_respondents, 1),
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
      question_summary ||= {}
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.filter {|v| v.is_a?(Numeric)}.sum
      breakdown = {}
      promoter_count = 0

      choices.each do |choice_key, choice_label|
        next if choice_key == 'other_answers'
        count = question_summary[choice_key] || 0
        breakdown[choice_key] = {
          count: count,
          percentage: calculate_percentage(count, total_responses, 1),
          label: choice_label
        }

        # Count promoters (ratings >= 7)
        if choice_key.to_i >= PROMOTER_THRESHOLD
          promoter_count += count
        end
      end

      {
        total_responses: total_responses,
        promoter_percentage: calculate_percentage(promoter_count, total_responses),
        breakdown: breakdown
      }
    end

    # Process Likert scale responses with weighted score calculation (for 1-7 agreement scales)
    def self.process_likert_responses(question_summary, choices)
      question_summary ||= {}
      return {} unless question_summary.is_a?(Hash)

      total_responses = question_summary.values.filter {|v| v.is_a?(Numeric)}.sum
      breakdown = {}
      weighted_sum = 0
      agreement_count = 0 # Count of responses >= 5 (Slightly Agree and above)

      choices.each do |choice_key, choice_label|
        next if choice_key == 'other_answers'
        count = question_summary[choice_key] || 0
        choice_value = choice_key.to_i
        weighted_value = LIKERT_WEIGHTS[choice_value]

        breakdown[choice_key] = {
          count: count,
          percentage: calculate_percentage(count, total_responses, 1),
          label: choice_label,
          weighted_value: weighted_value
        }

        # Add to weighted sum
        weighted_sum += weighted_value * count if weighted_value

        # Count agreement responses (5, 6, 7)
        if choice_value >= AGREEMENT_THRESHOLD
          agreement_count += count
        end
      end

      # Calculate weighted score (0-100) and agreement percentage
      weighted_score = calculate_weighted_score(weighted_sum, total_responses)
      agreement_percentage = calculate_percentage(agreement_count, total_responses)

      {
        total_responses: total_responses,
        weighted_score: weighted_score,
        agreement_count: agreement_count,
        agreement_percentage: agreement_percentage,
        breakdown: breakdown
      }
    end

    def self.process_text_responses(question_summary)
      return {} unless question_summary.is_a?(Array)

      responses = question_summary.compact_blank

      {
        total_responses: responses.length,
        responses: responses
      }
    end

    def self.calculate_percentage(count, total_responses, decimal_places = 0)
      total_responses > 0 ? (count.to_f / total_responses * 100).round(decimal_places) : 0
    end

    def self.calculate_weighted_score(weighted_sum, total_responses, decimal_places = 0)
      total_responses > 0 ? (weighted_sum.to_f / total_responses).round(decimal_places) : 0
    end
  end
end
