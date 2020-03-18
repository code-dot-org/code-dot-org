
module Pd::Foorm
  class RollupCreator
    include Constants
    extend Helper

    def self.calculate_averaged_rollup(parsed_forms, summarized_answers, questions_to_summarize)
      questions_and_forms = get_question_details(parsed_forms, questions_to_summarize)
      intermediate_rollup = get_intermediate_rollup(summarized_answers, questions_and_forms, parsed_forms)
      get_averaged_rollup(intermediate_rollup, questions_and_forms)
    end

    def self.get_averaged_rollup(intermediate_rollup, questions_and_forms)
      rollup = {response_count: intermediate_rollup[:response_count], averages: {}}
      intermediate_rollup[:questions].each do |question, answers|
        case questions_and_forms[question][:type]
        when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT
          next unless answers[:count] > 0
          rollup[:averages][question] = answers[:sum].to_f / answers[:count]
        when ANSWER_MATRIX
          rollup[:averages][question] = {}
          answers.each do |matrix_question, matrix_answer|
            next unless matrix_answer[:count] > 0
            rollup[:averages][question][matrix_question] = matrix_answer[:sum].to_f / matrix_answer[:count]
          end
        end
      end
      return rollup
    end

    def self.get_intermediate_rollup(summarized_answers, questions_and_forms, parsed_forms)
      intermediate_rollup = set_up_intermediate_rollup(questions_and_forms, parsed_forms)
      summarized_answers.each_value do |summaries_by_form|
        included_form = false
        questions_and_forms.each do |question, question_details|
          question_details[:form_keys].each do |form|
            next unless summaries_by_form[form] && summaries_by_form[form][question]
            included_form = true
            case question_details[:type]
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

    def self.set_up_intermediate_rollup(questions_and_forms, parsed_forms)
      intermediate_rollup = {questions: {}, response_count: 0}
      questions_and_forms.each do |question, question_data|
        next unless validate_question_same_across_forms(question, question_data, parsed_forms) &&
          question_data[:form_keys].first && parsed_forms[question_data[:form_keys].first]
        question_details = parsed_forms[question_data[:form_keys].first][question]
        case question_data[:type]
        when ANSWER_MULTI_SELECT, ANSWER_SINGLE_SELECT
          intermediate_rollup[:questions][question] = {sum: 0, count: 0}
        when ANSWER_MATRIX
          intermediate_rollup[:questions][question] = {}
          question_details[:rows].each_key do |row|
            intermediate_rollup[:questions][question][row] = {sum: 0, count: 0}
          end
        end
      end
      intermediate_rollup
    end

    def self.validate_question_same_across_forms(question, question_data, parsed_forms)
      choices = nil
      rows = nil
      columns = nil
      question_data[:form_keys].each do |form_key|
        question = parsed_forms[form_key][question]
        return false unless question[:type] = question_data[:type]
        case question[:type]
        when ANSWER_MULTI_SELECT, ANSWER_SINGLE_SELECT
          if choices.nil?
            choices = question[:choices]
          else
            return false unless choices == question[:choices]
          end
        when ANSWER_MATRIX
          if rows.nil? && columns.nil?
            rows = question[:rows]
            columns = question[:columns]
          else
            return false unless rows == question[:rows] && columns == question[:columns]
          end
        end
      end
      return true
    end

    # get question details in format:
    # {
    #   question_name: {type: 'matrix/singleSelect/...', form_keys = [form_key1, form_key2, ...]}
    # }
    def self.get_question_details(parsed_forms, questions_to_summarize)
      questions_and_forms = {}
      parsed_forms.each do |form_key, parsed_form|
        questions_to_summarize.each do |question|
          next unless parsed_form[question]
          questions_and_forms[question] ||= {
            type: parsed_form[question][:type],
            form_keys: []
          }
          questions_and_forms[question][:form_keys] << form_key
        end
      end
      questions_and_forms
    end
  end
end
