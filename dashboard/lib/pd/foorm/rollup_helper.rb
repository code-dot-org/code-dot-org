# Helper methods for rollups
module Pd::Foorm
  class RollupHelper
    include Constants
    extend Helper

    # @param parsed_forms: output of FoormParser.parse_forms
    # @param questions_to_summarize: questions to average, in the format:
    # {
    #   general: [{question_id: <question_id>, header_text: <friendly text to show, ex 'Teacher Engagement'}],
    #   facilitator: [{question_id: <question_id>, header_text: <friendly text to show, ex 'Teacher Engagement'}]
    # }
    # Where general questions were asked for the workshop overall and facilitator questions were asked per facilitator
    # Given above parameters, finds forms where questions to summarize appear and extracts out question
    # configuration for use by RollupCreator.
    # @return see get_rollup_question_data
    def self.get_question_details_for_rollup(parsed_forms, questions_to_summarize)
      question_details = {}
      questions_to_summarize.each do |form_type, questions|
        question_details[form_type] = get_question_details(parsed_forms, questions, form_type)
      end
      return get_rollup_question_data(parsed_forms, question_details)
    end

    # get required information about a rollup question.
    # @param questions_and_forms: output of get_question_details
    # @param parsed_forms: output of FoormParser.parse_forms
    # Will throw out any questions that have different columns/choices
    # across forms
    # @return
    #   {
    #     general: {
    #      question_id: {
    #       title: <question_title>,
    #       rows: <row configuration>,
    #       column_count: <number_of_columns>,
    #       type: 'matrix',
    #       header: <header_text>,
    #       form_keys: [form ids where question appears]
    #     },...
    #   },
    #   facilitator: {..same as general..}
    # }
    def self.get_rollup_question_data(parsed_forms, question_details)
      questions = {}
      question_details.each do |form_type, questions_per_type|
        questions[form_type] = {}
        questions_per_type.each do |question, question_data|
          # For now we will skip questions that don't have the same type and choices/columns
          # across all versions/forms. We will merge rows for matrix questions if type and columns are the same.
          parsed_question_data = validate_and_get_question(question, question_data, parsed_forms, form_type)
          next unless parsed_question_data

          questions[form_type][question] = {
            title: parsed_question_data[:title],
            type: parsed_question_data[:type],
            form_keys: question_data[:form_keys]
          }
          case parsed_question_data[:type]
          when ANSWER_MATRIX
            questions[form_type][question][:rows] = parsed_question_data[:rows]
            questions[form_type][question][:column_count] = parsed_question_data[:columns].length
            questions[form_type][question][:header] = question_data[:header_text]
          when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
            questions[form_type][question][:column_count] = parsed_question_data[:choices].length
          end
        end
      end

      questions
    end

    # Validate question is valid for rolling up and return question if valid. Validations are:
    #   - question is the same across all forms it was found in.
    #    "Same" is defined as having the same type and same choices/columns.
    #    If there are differences in rows, merge the rows together.
    #    If there are any conflicts, take the text for the first row with a given id.
    #   - question answers can be parsed as integers
    def self.validate_and_get_question(question, question_data, parsed_forms, form_type)
      columns = nil
      question_to_return = nil
      question_data[:form_keys].each do |form_key|
        parsed_question = parsed_forms[form_type][form_key][question]
        return false unless parsed_question && parsed_question[:type] = question_data[:type]
        question_to_return ||= parsed_question
        case parsed_question[:type]
        when ANSWER_MATRIX
          if columns.nil?
            columns = parsed_question[:columns]
          else
            return false unless columns == parsed_question[:columns]
            question_to_return[:rows] = question_to_return[:rows].merge(parsed_question[:rows])
          end
        when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
          if columns.nil?
            columns = parsed_question[:choices]
          else
            return false unless columns == parsed_question[:choices]
          end
        end
      end
      columns.each do |column_id, _column_value|
        # ensure column ids are integers or strings that can be parsed into integers
        return false unless [column_id.to_i, column_id.to_i.to_s].include? column_id
      end
      return question_to_return
    end

    # Finds forms in which question appears
    # @param parsed_forms: output of FoormParser.parse_forms
    # @param [Array] questions_to_summarize: array of questions in the format
    #   [{question_id: <question_id>, header_text: <friendly text to show, ex 'Teacher Engagement'}]
    # @form_type [String] either 'general' or 'facilitator', type of questions in questions_to_summarize
    # @return
    #   {
    #     question_name: {
    #       type: 'matrix/singleSelect/...',
    #       form_keys = [form_key1, form_key2, ...],
    #       header_text: <header_text>
    #     }
    #   }
    def self.get_question_details(parsed_forms, questions_to_summarize, form_type)
      question_details = {}
      parsed_forms[form_type].each do |form_key, parsed_form|
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
