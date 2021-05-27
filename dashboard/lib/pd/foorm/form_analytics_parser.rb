module Pd::Foorm
  # Responsible for taking Forms (ie, a survey comprised of many questions)
  # from our in-house survey system (Foorm)
  # and processing them into a "one row per question" format
  # for export to CSV, and, ultimately, to our analytics database (Redshift).
  class FormAnalyticsParser
    include Constants
    extend Helper

    HEADERS = %w(
      form_id
      form_name
      form_version
      item_type
      item_name
      item_text
      matrix_item_name
      matrix_item_header
      is_facilitator_specific
      response_options
      num_response_options
    )

    # Iterates over all Foorm Forms, returning a comma-separated string
    # with each line represents a single question.
    # @return [String] a CSV formatted string with each line containing a Form question.
    def self.reshape_all_forms_into_csv
      CSV.generate do |csv|
        csv << HEADERS

        # Loads 1000 records at a time to manage loading records into memory.
        # An unnecessary optimization at this point, as we only have 10s of Forms.
        ::Foorm::Form.find_each(batch_size: 1000) do |form|
          reshaped_form = reshape_form(form)

          reshaped_form.each do |question|
            row = question.stringify_keys.values_at(*HEADERS)
            csv << row
          end
        end
      end
    end

    # @param [Foorm::Form] form Form to reshape
    # @return [Array] array of hashes, each representing a single question in the Form
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
            item_name: question_name,
            item_text: fill_question_placeholders(question_details[:title]),
            item_type: question_details[:type],
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

            question_details[:rows].each do |matrix_question_name, matrix_question_text|
              reshaped_matrix_item = reshaped_form_question.clone

              # For matrix questions, put the question name and text (generally a preamble) in their own attributes.
              # item_name and item_text values are re-added from the sub-questions below.
              reshaped_matrix_item[:matrix_item_name] = reshaped_matrix_item.delete :item_name
              reshaped_matrix_item[:matrix_item_header] = reshaped_matrix_item.delete :item_text

              additional_attributes = {
                item_name: matrix_question_name,
                item_text: matrix_question_text,
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
