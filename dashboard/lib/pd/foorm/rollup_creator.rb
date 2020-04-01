# Create rollup for a set of Foorm responses
# Rollup will only work if question uses numbers for response options (otherwise question will be ignored)
# Rollup will include average response for each question, and if question is part of a matrix, average for
# all responses in the matrix. Currently it only returns matrix averages
module Pd::Foorm
  class RollupCreator
    include Constants
    extend Helper

    # @param summarized_answers: output of WorkshopSummarizer.summarize_answers_by_survey
    # @param question_details: output of RollupHelper.get_question_details_for_rollup
    # Calculate average responses for each question in question_details for the set of responses in summarized_answers
    # @return See get_averaged_rollup
    def self.calculate_averaged_rollup(summarized_answers, question_details)
      intermediate_rollup = get_intermediate_rollup(summarized_answers, question_details)
      get_averaged_rollup(intermediate_rollup, question_details)
    end

    # Calculates average for each question in intermediate rollup
    # @return
    #   {
    #     response_count: 5
    #     averages: {
    #       question_id_1: {
    #         average: 3.45,
    #         rows: {
    #           row_id_1: 2.5,
    #           row_id_2: 5.6
    #         }
    #       },...
    #     }
    #   }
    def self.get_averaged_rollup(intermediate_rollup, question_details)
      rollup = {response_count: intermediate_rollup[:response_count], averages: {}}
      intermediate_rollup[:questions].each do |question, answers|
        case question_details[question][:type]
        # TODO: add other answer types
        when ANSWER_MATRIX
          rollup[:averages][question] = {}
          averages = {}
          overall_sum = 0
          overall_count = 0
          answers.each do |matrix_question, matrix_answer|
            next unless matrix_answer[:count] > 0
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

    # Creates an intermediate rollup, which is the
    # sum and count for each question in question_details from summarized_answers.
    # If there was no response for an answer it is not included.
    # @return
    #   {
    #     response_count: 5,
    #     questions: {
    #       question_id_1: {
    #         row_id_1: {sum: 3, count: 1},
    #         ...
    #       },...
    #     }
    #   }
    def self.get_intermediate_rollup(summarized_answers, question_details)
      intermediate_rollup = set_up_intermediate_rollup(question_details)
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        question_details.each do |question, question_data|
          question_data[:form_keys].each do |form|
            next unless summaries_by_form[form] && summaries_by_form[form][question]
            included_form = true
            case question_data[:type]
            # TODO: add other answer types
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

    # add single set of matrix answers to intermediate rollup (see get_intermediate_rollup for format)
    def self.add_summary_to_intermediate_rollup(intermediate_rollup_at_question, answers)
      answers.each do |answer_value, answer_count|
        intermediate_rollup_at_question[:sum] += answer_value.to_i * answer_count
        intermediate_rollup_at_question[:count] += answer_count
      end
    end

    # Set up intermediate rollup for each question in question_details, setting
    # sum and count to 0 for each row
    def self.set_up_intermediate_rollup(question_details)
      intermediate_rollup = {questions: {}, response_count: 0}
      question_details.each do |question, question_data|
        case question_data[:type]
        # TODO: add other answer types
        when ANSWER_MATRIX
          intermediate_rollup[:questions][question] = {}
          question_details[question][:rows].each_key do |row|
            intermediate_rollup[:questions][question][row] = {sum: 0, count: 0}
          end
        end
      end
      intermediate_rollup
    end
  end
end
