module Pd::Foorm
  HEADERS = %w(
    submission_id
    form_question_name
    matrix_item_name
    response_value
    response_text
  )

  class SubmissionAnalyticsParser
    def self.write_foorm_submissions_csv_to_file_and_bucket_long_for_form(form)
      CSV.open('./test.csv', 'wb') do |csv|
        csv << ['submission_id', 'question_key', 'answer']
      end
      #AWS::S3.upload_to_bucket('cdo-data-sharing-internal', file_name_from_form_name(form), IO.read('./test.csv'), no_random: true)
    end

    def self.reshaped_submission_answer(submission)
      reshaped_submission_answers = []

      parsed_answers = JSON.parse(submission.answers)

      parsed_answers.each do |question_name, answer|
        question_details = submission.form.get_question_details(question_name)

        reshaped_submission_answer = {
          question_name: question_name
        }

        # If question isn't in the Form, return as-is.
        # This is expected for metadata about the submission.
        if question_details.nil?
          reshaped_submission_answer[:response_text] = answer
          reshaped_submission_answers << reshaped_submission_answer
          next
        end

        case question_details[:type]
        when ANSWER_MATRIX
          choices = question_details[:columns]

          answer.each do |matrix_item_name, matrix_item_answer|
            reshaped_matrix_item_submission = reshaped_submission_answer.clone

            additional_attributes = {
              matrix_item_name: matrix_item_name,
              response_value: matrix_item_name,
              response_text: choices[matrix_item_answer]
            }

            reshaped_matrix_item_submission.merge! additional_attributes

            reshaped_submission_answers << reshaped_matrix_item_submission
          end
          #### Ended editing here
        when ANSWER_RATING, ANSWER_TEXT
          puts 'this one is for you, rubocop'
          # additional_attributes = {
          #   response_text: answer
          # }
        when ANSWER_SINGLE_SELECT
          choices = question_details[:choices]
          return {question_id => choices[answer]}
        when ANSWER_MULTI_SELECT
          choices = question_details[:choices]
          return {question_id => answer.map {|selected| choices[selected]}.compact.sort.join(', ')}
        end

        # Return blank hash if question_type not found
        return {}
      end
      # need to split out matrix question id
      # need to include question key (not just plain text question)
      rows = submission.formatted_answers.map {|question_key, answer| [submission.id, question_key, answer]}
      rows.each {|row| csv << row}
    end
  end
end
