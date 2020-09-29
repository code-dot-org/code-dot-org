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
    # Calculate average responses for each question in question_details
    # for the set of responses in summarized_answers
    # @return {
    #   general: {see get_averaged_rollup},
    #   facilitator: {see get_averaged_rollup}
    # }
    # Will only have general/facilitator if question_details contains those keys.
    # Other keys are supported but will not be split by facilitator
    def self.calculate_averaged_rollup(
      summarized_answers,
      question_details,
      facilitators,
      split_by_facilitator = false
    )
      rollup = {}
      question_details.each do |type, question_details_per_type|
        # only split by facilitator when form type is facilitator,
        # as otherwise questions cannot be split by facilitator
        should_split_by_facilitator = split_by_facilitator && type == :facilitator
        intermediate_rollup = get_intermediate_rollup(
          summarized_answers,
          question_details_per_type,
          type,
          should_split_by_facilitator,
          facilitators
        )
        rollup[type] = get_averaged_rollup(
          intermediate_rollup,
          question_details_per_type,
          should_split_by_facilitator
        )
      end
      rollup
    end

    # Calculates average for each question in intermediate rollup, which is split by
    # facilitator if split_by_facilitator is true.
    # @return If split_by_facilitator = true:
    # {
    #   facilitator_id_1: {see get_averaged_rollup_helper},
    #   facilitator_id_2: {see get_averaged_rollup_helper}
    # }
    # Otherwise: see output of get_averaged_rollup_helper
    def self.get_averaged_rollup(intermediate_rollup, question_details, split_by_facilitator)
      rollup = {}
      if split_by_facilitator
        intermediate_rollup.each do |facilitator_id, facilitator_intermediate_rollup|
          rollup[facilitator_id] = get_averaged_rollup_helper(
            facilitator_intermediate_rollup,
            question_details
          )
        end
      else
        rollup = get_averaged_rollup_helper(intermediate_rollup, question_details)
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
    def self.get_averaged_rollup_helper(intermediate_rollup, question_details)
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

    # Creates an intermediate rollup, which is the
    # sum and count for each question in question_details from summarized_answers.
    # @return
    # if split_by_facilitator
    # {
    #   facilitator_id_1: {
    #     response_count: 5,
    #     questions: {
    #       question_id_1: {
    #         row_id_1: {sum: 4, count: 1}
    #       }
    #     }
    #   }
    # }
    # otherwise
    #   {
    #     response_count: 5,
    #     questions: {
    #       question_id_1: {
    #         row_id_1: {sum: 3, count: 1},
    #         ...
    #       },...
    #     }
    #   }
    def self.get_intermediate_rollup(summarized_answers, question_details, form_type, split_by_facilitator, facilitators)
      intermediate_rollup = {}
      if split_by_facilitator
        facilitators.each do |facilitator_id, _|
          intermediate_rollup[facilitator_id] = set_up_intermediate_rollup(question_details)
        end
      else
        intermediate_rollup = set_up_intermediate_rollup(question_details)
      end
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        question_details.each do |question, question_data|
          question_data[:form_keys].each do |form|
            next unless summaries_by_form[form_type] &&
              summaries_by_form[form_type][form] &&
              summaries_by_form[form_type][form][question]
            question_summary = summaries_by_form[form_type][form][question]
            included_form = true
            if form_type == :facilitator
              question_summary.each do |facilitator_id, facilitator_question_summary|
                next if split_by_facilitator && !facilitators[facilitator_id]
                included_form = true
                intermediate_rollup_at_question = split_by_facilitator ?
                                                    intermediate_rollup[facilitator_id][:questions][question] :
                                                    intermediate_rollup[:questions][question]
                add_question_data_to_rollup(intermediate_rollup_at_question, question_data, facilitator_question_summary)
              end
            else
              add_question_data_to_rollup(intermediate_rollup[:questions][question], question_data, question_summary)
            end
          end
        end
        next unless included_form
        if split_by_facilitator
          intermediate_rollup.each do |facilitator_id, _|
            intermediate_rollup[facilitator_id][:response_count] +=
              summaries_by_form[:facilitator][:response_count][facilitator_id] || 0
          end
        elsif form_type == :facilitator
          summaries_by_form[:facilitator][:response_count].each do |_, count|
            intermediate_rollup[:response_count] += count
          end
        else
          intermediate_rollup[:response_count] += summaries_by_form[form_type][:response_count]
        end
      end
      intermediate_rollup
    end

    def self.add_question_data_to_rollup(intermediate_rollup_at_question, question_data, question_summary)
      case question_data[:type]
      when ANSWER_MATRIX
        question_summary.each do |sub_question, answers|
          add_summary_to_intermediate_rollup(intermediate_rollup_at_question[sub_question], answers)
        end
      when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
        add_summary_to_intermediate_rollup(intermediate_rollup_at_question, question_summary)
      end
    end

    # add single set of matrix answers to intermediate rollup (see get_intermediate_rollup for format)
    def self.add_summary_to_intermediate_rollup(intermediate_rollup_at_question, answers)
      return unless intermediate_rollup_at_question
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
