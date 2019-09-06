require 'xxhash'

module Pd::SurveyPipeline
  class DailySurveyJoiner < SurveyPipelineWorker
    include Pd::JotForm::Constants

    REQUIRED_INPUT_KEYS = [:parsed_questions, :parsed_submissions]
    OUTPUT_KEYS = [:question_answer_joined]

    # @param context [Hash] contains necessary input for this worker to process.
    #   Results are added back to the context object.
    #
    # @return [Hash] the same context object.
    #
    # @raise [RuntimeError] if required input keys are missing.
    #
    def self.process_data(context)
      check_required_input_keys REQUIRED_INPUT_KEYS, context

      results = transform_data context.slice(*REQUIRED_INPUT_KEYS)

      OUTPUT_KEYS.each do |key|
        context[key] ||= []
        context[key] += results[key]
      end

      context
    end

    # Join questions and submissions data, modify and flatten the results
    # so they can be summarized later.
    #
    # @param parsed_questions [Hash{form_id => {question_id => question_content}}]
    # @param parsed_submissions [Hash{form_id => {submission_id => submission_content}}]
    #
    # @return [Hash{:question_answer_joined => Array<Hash>}]
    #   Each hash in value array has following keys: form_id, submission_id,
    #   user_id, pd_session_id, pd_workshop_id, day, facilitator_id, answer,
    #   qid, type, name, text, order, hidden, options, max_value, parent.
    #
    # @note This method could change input data such as adding sub questions into
    # question list.
    #
    # @see DailySurveyParser class, parse_survey and parse_submissions functions
    # for detailed structures of input params.
    #
    def self.transform_data(parsed_questions:, parsed_submissions:)
      results = []

      parsed_submissions.each_pair do |form_id, form_submissions|
        # Bad data, couldn't find this form_id. Ignore instead of raising exception.
        # TODO: capture non-fatal error
        next unless parsed_questions[form_id]

        form_submissions.each_pair do |submission_id, submission_content|
          shared_submission_info = submission_content.
            merge(form_id: form_id, submission_id: submission_id).
            except(:answers)

          submission_content[:answers]&.each do |qid, ans|
            question = parsed_questions[form_id][qid]
            # Bad data, couldn't find this (form_id, qid) combination in questions list.
            # Ignore instead of raising exception.
            # TODO: capture non-fatal error
            next unless question

            # Ignore empty answer and hidden question
            next if ans.blank? || question[:hidden]

            if question[:type] == TYPE_MATRIX && ans.is_a?(Array)
              ans.each do |sub_ans|
                # Create a new question for each sub question and add it to question list.
                # Its id and name are generated based on the parent's id and name.
                new_qid = compute_descendant_key(qid, sub_ans[:text])
                new_name = compute_descendant_key(question[:name], sub_ans[:text])
                new_text = "#{question[:text]} -> #{sub_ans[:text]}"

                new_question = question.except(:sub_questions).merge(
                  name: new_name, text: new_text, type: TYPE_RADIO,
                  answer_type: ANSWER_SINGLE_SELECT,
                  max_value: question[:options]&.length, parent: question[:name]
                )
                parsed_questions[form_id][new_qid] = new_question

                next if sub_ans[:answer].blank?
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

      {question_answer_joined: results}
    end

    # Compute a descendant key based on original value and sub_value digest.
    def self.compute_descendant_key(value, sub_value)
      # Use XXhash, non-cryptographic fast hashing algorithm
      "#{value}_#{XXhash.xxh64(sub_value || '')}"
    end
  end
end
