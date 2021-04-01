module Pd::Foorm
  HEADERS = %w(
    submission_id
    question_name
    matrix_item_name
    response_value
    response_text
  )

  class SubmissionAnalyticsParser
    include Constants

    def self.reshape_all_submissions
      reshaped_submissions = reshape_submissions(::Foorm::Submission.all)
      reshaped_submissions_to_csv(reshaped_submissions)
    end

    def self.reshaped_submissions_to_csv(reshaped_submissions)
      CSV.open('./test_submissions.csv', 'wb') do |csv|
        csv << HEADERS
        reshaped_submissions.each do |answer|
          row = answer.stringify_keys.values_at(*HEADERS)
          csv << row
        end
      end
    end

    def self.reshape_submissions(submissions)
      reshaped_submissions = []

      submissions.each do |submission|
        reshaped_submissions = reshaped_submissions.concat reshape_submission(submission)
      end

      reshaped_submissions
    end

    def self.reshape_submission(submission)
      reshaped_submission_answers_with_metadata = []

      submission_metadata = {
        submission_id: submission.id
      }

      parsed_answers = JSON.parse(submission.answers)
      reshaped_submission_answers = reshape_submission_answers(parsed_answers, submission.form)

      reshaped_submission_answers.each do |reshaped_submission_answer|
        reshaped_submission_answers_with_metadata << submission_metadata.merge(reshaped_submission_answer)
      end

      reshaped_submission_answers_with_metadata
    end

    def self.reshape_submission_answers(parsed_answers, form)
      reshaped_submission_answers = []

      parsed_answers.each do |question_name, answer|
        reshaped_submission_answer = {question_name: question_name}
        question_details = form&.get_question_details(question_name)

        # If question isn't in the Form, return as-is.
        # This is expected for metadata about the submission.
        if question_details.nil?
          reshaped_submission_answer[:response_text] = answer
          reshaped_submission_answers << reshaped_submission_answer
          next
        end

        # What are we doing here? (if we want to refactor)
        # take base hash
        # get additional attributes
        # merge those additional attributes into hash
        # add hash into list of all answers
        #
        # Challenges:
        # Make this work for matrix questions
        # Make this work for questions that are not in the Form

        case question_details[:type]
        when ANSWER_MATRIX
          choices = question_details[:columns]

          answer.each do |matrix_item_name, matrix_item_answer|
            reshaped_matrix_item_submission = reshaped_submission_answer.clone

            additional_attributes = {
              matrix_item_name: matrix_item_name,
              response_value: matrix_item_answer,
              response_text: choices[matrix_item_answer]
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
