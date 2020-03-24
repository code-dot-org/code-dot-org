
module Pd::Foorm
  class RollupCreator
    include Constants
    extend Helper

    def self.calculate_averaged_rollup(parsed_forms, summarized_answers, question_details)
      intermediate_rollup = get_intermediate_rollup(summarized_answers, question_details, parsed_forms)
      get_averaged_rollup(intermediate_rollup, question_details)
    end

    def self.get_averaged_rollup(intermediate_rollup, question_details)
      rollup = {response_count: intermediate_rollup[:response_count], averages: {}}
      intermediate_rollup[:questions].each do |question, answers|
        case question_details[question][:type]
        when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT
          next unless answers[:count] > 0
          rollup[:averages][question] ||= {}
          rollup[:averages][question] = (answers[:sum].to_f / answers[:count]).round(2)
        when ANSWER_MATRIX
          rollup[:averages][question] = {}
          averages = {}
          overall_sum = 0
          overall_count = 0
          answers.each do |matrix_question, matrix_answer|
            next unless matrix_question != :survey_name && matrix_answer[:count] > 0
            averages[matrix_question] = (matrix_answer[:sum].to_f / matrix_answer[:count]).round(2)
            overall_sum += matrix_answer[:sum]
            overall_count += matrix_answer[:count]
          end
          rollup[:averages][question][:average] = (overall_sum.to_f / overall_count).round(2)
          rollup[:averages][question][:rows] = averages
        end
      end
      return rollup
    end

    def self.get_intermediate_rollup(summarized_answers, question_details, parsed_forms)
      intermediate_rollup = set_up_intermediate_rollup(question_details, parsed_forms)
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        question_details.each do |question, question_data|
          question_data[:form_keys].each do |form|
            next unless summaries_by_form[form] && summaries_by_form[form][question]
            included_form = true
            case question_data[:type]
            when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT
              add_summary_to_intermediate_rollup(intermediate_rollup[:questions][question], summaries_by_form[form][question])
            when ANSWER_MATRIX
              summaries_by_form[form][question].each do |sub_question, answers|
                add_summary_to_intermediate_rollup(intermediate_rollup[:questions][question][sub_question], answers)
              end
            end
          end
        end
        if included_form
          intermediate_rollup[:response_count] += summaries_by_form[:response_count]
        end
      end
      intermediate_rollup
    end

    def self.add_summary_to_intermediate_rollup(intermediate_rollup_at_question, answers)
      answers.each do |answer_value, answer_count|
        # skip over any answer that cannot be converted to a number
        next unless answer_value.to_i != 0
        intermediate_rollup_at_question[:sum] += answer_value.to_i * answer_count
        intermediate_rollup_at_question[:count] += answer_count
      end
    end

    def self.set_up_intermediate_rollup(question_details, parsed_forms)
      intermediate_rollup = {questions: {}, response_count: 0}
      question_details.each do |question, question_data|
        next unless parsed_forms[question_data[:form_keys].first]
        survey_name = question_data[:form_keys].first
        question_details = parsed_forms[survey_name][question]
        case question_data[:type]
        when ANSWER_MULTI_SELECT, ANSWER_SINGLE_SELECT
          intermediate_rollup[:questions][question] = {sum: 0, count: 0, survey_name: survey_name}
        when ANSWER_MATRIX
          intermediate_rollup[:questions][question] = {survey_name: survey_name}
          question_details[:rows].each_key do |row|
            intermediate_rollup[:questions][question][row] = {sum: 0, count: 0}
          end
        end
      end
      intermediate_rollup
    end
  end
end
