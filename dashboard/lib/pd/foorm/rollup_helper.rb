module Pd::Foorm
  class RollupHelper
    include Constants
    extend Helper

    def self.get_question_details_for_rollup(parsed_forms, questions_to_summarize)
      question_details = get_question_details(parsed_forms, questions_to_summarize)
      return get_rollup_question_data(parsed_forms, question_details)
    end

    # get required information about a rollup question. Expects parameters:
    # questions_and_forms: output of get_question_details
    # parsed_forms: output of FoormParser.parse_forms
    # Only saves matrix data for now
    # output is:
    # {
    #   question_id: {
    #     title: <question_title>,
    #     rows: <row configuration>,
    #     column_count: <number_of_columns>,
    #     type: 'matrix',
    #     header: <header_text>
    #   }
    # }
    def self.get_rollup_question_data(parsed_forms, question_details)
      questions = {}
      question_details.each do |question, question_data|
        # for now we will skip questions that don't have the same type and choices/rows/columns
        # across all versions/forms.
        next unless validate_question_same_across_forms(question, question_data, parsed_forms)
        parsed_question_data = parsed_forms[question_data[:form_keys].first][question]
        case parsed_question_data[:type]
          # TODO: add more question types
        when ANSWER_MATRIX
          questions[question] = {
            title: parsed_question_data[:title],
            rows: parsed_question_data[:rows],
            column_count: parsed_question_data[:columns].length,
            type: parsed_question_data[:type],
            header: question_data[:header_text],
            form_keys: question_data[:form_keys]
          }
        end
      end
      questions
    end

    # validate question is the same across all forms it was found in. Same is defined by
    # having the same type and same choices/rows/columns
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
    #   question_name: {
    #     type: 'matrix/singleSelect/...',
    #     form_keys = [form_key1, form_key2, ...],
    #     header_text: <header_text>
    #   }
    # }
    def self.get_question_details(parsed_forms, questions_to_summarize)
      question_details = {}
      parsed_forms.each do |form_key, parsed_form|
        questions_to_summarize.each do |question|
          question_id = question[:question_id]
          next unless parsed_form[question_id]
          question_details[question_id] ||= {
            type: parsed_form[question_id][:type],
            header_text: question[:header_text],
            form_keys: []
          }
          question_details[question_id][:form_keys] << form_key
        end
      end
      question_details
    end
  end
end
