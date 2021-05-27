module Pd::Foorm
  # Responsible for taking Submissions (ie, a response submitted by a user to one of our Forms)
  # from our in-house survey system (Foorm)
  # and processing them into a "one row per question answered" format
  # for export to CSV, and, ultimately, to our analytics database (Redshift).
  class SubmissionAnalyticsParser
    include Constants

    HEADERS = %w(
      submission_id
      question_name
      matrix_item_name
      response_value
      response_text
    )

    # Iterates over all Foorm Submissions, returning a comma-separated string
    # with each line represents a user's answer to a single question.
    # @return [String] a CSV formatted string with each line containing an answer.
    def self.reshape_all_submissions_into_csv
      CSV.generate do |csv|
        csv << HEADERS

        # Loads 1000 records at a time to manage loading records into memory.
        ::Foorm::Submission.find_each(batch_size: 1000) do |submission|
          reshaped_submission = reshape_submission(submission)

          reshaped_submission.each do |answer|
            row = answer.stringify_keys.values_at(*HEADERS)
            csv << row
          end
        end
      end
    end

    # @param [Foorm::Submission] submission Submission to reshape
    # @return [Array] array of hashes, each representing a user's answer to a single question
    def self.reshape_submission(submission)
      reshaped_submission_answers_with_metadata = []

      submission_metadata = {submission_id: submission.id}

      parsed_answers = JSON.parse(submission.answers)
      reshaped_submission_answers = reshape_submission_answers(parsed_answers, submission.form)

      reshaped_submission_answers.each do |reshaped_submission_answer|
        reshaped_submission_answers_with_metadata << submission_metadata.merge(reshaped_submission_answer)
      end

      reshaped_submission_answers_with_metadata
    end

    # @param [Hash] parsed_answers a Hash of the answers attribute of a Foorm::Submission
    # @param [Foorm::Form] form the form associated with the Foorm::Submission from which parsed_answers was derived
    # @return [Array] array of hashes, with each hash representing an answer to export to CSV
    def self.reshape_submission_answers(parsed_answers, form)
      reshaped_submission_answers = []

      parsed_answers.each do |question_name, answer|
        reshaped_submission_answer = {question_name: question_name}
        question_details = form&.get_question_details(question_name)

        # If question isn't in the Form, return as-is.
        # This is expected for metadata about the submission,
        # which doesn't have an associated question in the Form.
        if question_details.nil?
          reshaped_submission_answer[:response_text] = answer
          reshaped_submission_answers << reshaped_submission_answer
          next
        end

        case question_details[:type]
        when ANSWER_MATRIX
          choices = question_details[:columns]

          answer.each do |matrix_question_name, matrix_question_answer|
            # Need a new object for each matrix item.
            reshaped_matrix_item_submission = reshaped_submission_answer.clone

            # For matrix questions, put the question name in its own attributes.
            # question_name is re-added from the sub-questions below.
            reshaped_matrix_item_submission[:matrix_item_name] = reshaped_matrix_item_submission.delete :question_name

            additional_attributes = {
              question_name: matrix_question_name,
              response_value: matrix_question_answer,
              response_text: choices[matrix_question_answer]
            }

            reshaped_matrix_item_submission.merge! additional_attributes
            reshaped_submission_answers << reshaped_matrix_item_submission
          end
        when ANSWER_RATING, ANSWER_TEXT
          reshaped_submission_answer[:response_text] = answer
          reshaped_submission_answers << reshaped_submission_answer
        when ANSWER_SINGLE_SELECT
          choices = question_details[:choices]
          additional_attributes = {
            response_value: answer,
            response_text: choices[answer]
          }

          reshaped_submission_answer.merge! additional_attributes
          reshaped_submission_answers << reshaped_submission_answer
        when ANSWER_MULTI_SELECT
          choices = question_details[:choices]
          additional_attributes = {
            response_value: answer,
            response_text: answer.map {|selected| choices[selected]}.compact.sort.join(', ')
          }

          reshaped_submission_answer.merge! additional_attributes
          reshaped_submission_answers << reshaped_submission_answer
        end
      end

      reshaped_submission_answers
    end
  end
end
