module Pd::Foorm
  HEADERS = %w(
    form_id
    form_name
    form_version
    question_type
    question_name
    question_text
    matrix_item_name
    matrix_item_text
    is_facilitator_specific
    response_options
    num_response_options
  )

  class FormAnalyticsParser
    include Constants
    extend Helper

    def self.reshape_all_forms
      reshaped_forms = reshape_forms(::Foorm::Form.all)
      reshaped_forms_to_csv(reshaped_forms)
    end

    def self.reshaped_forms_to_csv(reshaped_forms)
      CSV.open('./test_forms.csv', 'wb') do |csv|
        csv << HEADERS
        reshaped_forms.each do |question|
          row = question.stringify_keys.values_at(*HEADERS)
          csv << row
        end
      end
    end

    def self.reshape_forms(forms)
      reshaped_forms = []

      forms.each do |form|
        reshaped_forms = reshaped_forms.concat reshape_form(form)
      end

      reshaped_forms
    end

    def self.reshape_form(form)
      reshaped_form_questions_with_metadata = []

      form_metadata = {
        form_id: form.id,
        form_name: form.name,
        form_version: form.version
      }

      parsed_form_questions = FoormParser.parse_form_questions(form.questions)
      reshaped_form_questions = reshape_form_questions(parsed_form_questions)

      reshaped_form_questions.each do |reshaped_form_question|
        reshaped_form_questions_with_metadata << form_metadata.merge(reshaped_form_question)
      end

      reshaped_form_questions_with_metadata
    end

    # @param [Hash] parsed_form_questions
    # @return [Array] Array of hashes (each representing a question in the form) with keys representing headers for export to a tabular format.
    def self.reshape_form_questions(parsed_form_questions)
      reshaped_form_questions = []

      # Two sections -- general and facilitator
      parsed_form_questions.each do |section, questions|
        questions.each do |question_name, question_details|
          # Information relevant to all question types
          reshaped_form_question = {
            question_name: question_name,
            question_text: fill_question_placeholders(question_details[:title]),
            question_type: question_details[:type],
            is_facilitator_specific:  section == :facilitator ? 1 : 0
          }

          case question_details[:type]
          when ANSWER_TEXT
            reshaped_form_questions << reshaped_form_question
          when ANSWER_SINGLE_SELECT, ANSWER_MULTI_SELECT, ANSWER_RATING
            readable_response_options = question_details[:choices].values

            additional_attributes = {
              response_options: readable_response_options,
              num_response_options: readable_response_options.length
            }

            reshaped_form_question.merge! additional_attributes
            reshaped_form_questions << reshaped_form_question
          when ANSWER_MATRIX
            readable_response_options = question_details[:columns].values

            question_details[:rows].each do |matrix_item_name, matrix_item_text|
              reshaped_matrix_item = reshaped_form_question.clone

              additional_attributes = {
                matrix_item_name: matrix_item_name,
                matrix_item_text: matrix_item_text,
                response_options: readable_response_options,
                num_response_options: readable_response_options.length
              }

              reshaped_matrix_item.merge! additional_attributes
              reshaped_form_questions << reshaped_matrix_item
            end
          end
        end
      end

      reshaped_form_questions
    end
  end
end
