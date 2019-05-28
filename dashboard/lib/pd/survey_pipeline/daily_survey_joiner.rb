require_relative 'transformer.rb'

module Pd::SurveyPipeline
  class DailySurveyJoiner < TransformerBase
    include Pd::JotForm::Constants

    STRING_DIGEST_LENGTH = 16

    # Join questions and submissions data, modify and flatten the results
    # so they can be summarized later.
    # @param questions [Hash{form_id => {question_id => question_content}}]
    # @param answers [Hash{form_id => {submission_id => submission_content}}]
    # @return [Array<Hash>]
    #   Hash has following keys: form_id, submission_id,
    #   user_id, pd_session_id, pd_workshop_id, day, facilitator_id, answer,
    #   qid, type, name, text, order, hidden, options, max_value, parent
    #
    # @note This method could change input data such as adding sub questions into
    # question list.
    # @see DailySurveyParser class, parse_survey and parse_submissions functions
    # for detailed structures of input params.
    def self.transform_data(questions:, submissions:)
      raise 'Invalid input parameter' unless questions && submissions

      results = []

      submissions.each_pair do |form_id, form_submissions|
        form_submissions.each_pair do |submission_id, submission_content|
          shared_submission_info = submission_content.
            merge(form_id: form_id, submission_id: submission_id).
            except(:answers)

          submission_content[:answers]&.each do |qid, ans|
            # Ignore empty answer and hidden question
            next if ans.blank?

            question = questions[form_id][qid]
            # We got bad data, couldn't find this (form_id, qid) combination in questions list.
            # Skip it instead of raising exception.
            next unless question
            next if question[:hidden]

            if question[:type] == TYPE_MATRIX && ans.is_a?(Array)
              ans.each do |sub_ans|
                next if sub_ans[:answer].blank?

                # Create a new question for each sub question and add it to question list.
                # Its id and name are generated based on the parent's id and name.
                new_qid = compute_descendant_key(qid, sub_ans[:text])
                new_name = compute_descendant_key(question[:name], sub_ans[:text])
                new_text = "#{question[:text]}->#{sub_ans[:text]}"

                new_question = question.except(:sub_questions).merge(
                  name: new_name, text: new_text, type: TYPE_RADIO,
                  answer_type: ANSWER_SINGLE_SELECT,
                  max_value: question[:options]&.length, parent: question[:name]
                )
                questions[form_id][new_qid] = new_question

                # Create flatten question-answer record
                results << shared_submission_info.
                  merge(new_question).
                  merge(qid: new_qid, answer: sub_ans[:answer])
              end
            else
              results << shared_submission_info.
                merge(question).
                merge(qid: qid, answer: ans)
            end
          end
        end
      end

      results
    end

    # Compute a descendant key based on original value and sub_value digest
    def self.compute_descendant_key(value, sub_value)
      "#{value}_#{compute_str_digest(sub_value)}"
    end

    # Compute message digest using SHA256 and cut it to a fixed length.
    def self.compute_str_digest(str)
      # SHA256 returns a 256-bit digest, which is 64-character string in hex
      Digest::SHA256.hexdigest(str || '')[0, STRING_DIGEST_LENGTH - 1]
    end
  end
end
