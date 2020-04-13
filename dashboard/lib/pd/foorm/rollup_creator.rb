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
      rollup = {}
      intermediate_rollup = get_intermediate_rollup(summarized_answers, question_details[:general], :general)
      rollup[:general] = get_averaged_rollup(intermediate_rollup, question_details[:general])
      if question_details[:facilitator]
        intermediate_rollup_facilitator = get_intermediate_rollup_facilitator(summarized_answers, question_details[:facilitator])
        rollup[:facilitator] = get_averaged_rollup_facilitator(intermediate_rollup_facilitator, question_details[:facilitator])
      end
      rollup
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
        when ANSWER_MATRIX
          averages = {}
          overall_sum = 0
          overall_count = 0
          answers.each do |matrix_question, matrix_answer|
            next unless matrix_answer[:count] > 0
            averages[matrix_question] = (matrix_answer[:sum].to_f / matrix_answer[:count]).round(2)
            overall_sum += matrix_answer[:sum]
            overall_count += matrix_answer[:count]
          end
          # don't include rollup for questions with no answers
          if overall_count > 0
            rollup[:averages][question] = {}
            rollup[:averages][question][:average] = (overall_sum.to_f / overall_count).round(2)
            rollup[:averages][question][:rows] = averages
          end
        when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
          rollup[:averages][question] = (answers[:sum].to_f / answers[:count]).round(2)
        end
      end
      return rollup
    end

    def self.get_averaged_rollup_facilitator(intermediate_rollup_facilitator, facilitator_question_details)
      rollup = {}
      intermediate_rollup_facilitator.each do |facilitator_id, intermediate_rollup|
        rollup[facilitator_id] = get_averaged_rollup(intermediate_rollup, facilitator_question_details)
      end
      rollup
    end

    def self.get_intermediate_rollup_facilitator(summarized_answers, facilitator_question_details)
      intermediate_rollup = {}
      form_type = :facilitator
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        facilitator_question_details.each do |question, question_data|
          question_data[:form_keys].each do |form|
            next unless summaries_by_form[form_type] &&
              summaries_by_form[form_type][form] &&
              summaries_by_form[form_type][form][question]
            facilitator_question_summary = summaries_by_form[form_type][form][question]
            facilitator_question_summary.each  do |facilitator_id, question_summary|
              included_form = true
              unless intermediate_rollup[facilitator_id]
                intermediate_rollup[facilitator_id] = set_up_intermediate_rollup(facilitator_question_details)
              end
              intermediate_rollup_at_question = intermediate_rollup[facilitator_id][:questions][question]
              case question_data[:type]
              when ANSWER_MATRIX
                question_summary.each do |sub_question, answers|
                  add_summary_to_intermediate_rollup(intermediate_rollup_at_question[sub_question], answers)
                end
              when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
                add_summary_to_intermediate_rollup(intermediate_rollup_at_question, question_summary)
              end
            end
          end
        end
        next unless included_form
        intermediate_rollup.each do |facilitator_id, _|
          intermediate_rollup[facilitator_id][:response_count] +=
            summaries_by_form[:facilitator][:response_count][facilitator_id] || 0
        end
      end
      intermediate_rollup
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
    def self.get_intermediate_rollup(summarized_answers, question_details, form_type)
      intermediate_rollup = set_up_intermediate_rollup(question_details)
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        question_details.each do |question, question_data|
          question_data[:form_keys].each do |form|
            next unless summaries_by_form[form_type] &&
              summaries_by_form[form_type][form] &&
              summaries_by_form[form_type][form][question]
            question_summary = summaries_by_form[form_type][form][question]
            included_form = true
            case question_data[:type]
            when ANSWER_MATRIX
              question_summary.each do |sub_question, answers|
                add_summary_to_intermediate_rollup(intermediate_rollup[:questions][question][sub_question], answers)
              end
            when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
              add_summary_to_intermediate_rollup(intermediate_rollup[:questions][question], question_summary)
            end
          end
        end
        if included_form
          intermediate_rollup[:response_count] += summaries_by_form[form_type][:response_count]
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
        when ANSWER_MATRIX
          intermediate_rollup[:questions][question] = {}
          question_details[question][:rows].each_key do |row|
            intermediate_rollup[:questions][question][row] = {sum: 0, count: 0}
          end
        when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
          intermediate_rollup[:questions][question] = {sum: 0, count: 0}
        end
      end
      intermediate_rollup
    end
  end
end
