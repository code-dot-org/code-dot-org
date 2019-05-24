module Pd::SurveyPipeline
  class TransformerBase
    def transform_data(*)
      raise 'Must override in derived class'
    end
  end

  class DailySurveyParser < TransformerBase
    def transform_data(survey_questions:, workshop_surveys:, facilitator_surveys:)
      # parse question
      # further parse matrix question
      # add answer type to question

      # parse workshop surveys
      # further parse hash answer (matrix, refer to question data to make sure it's matrix type)

      # parse facilitator surveys
      # further parse hash answer (verify it's matrix type)

      # return parsed questions & submissions
    end

    def parse_survey_question(survey_questions)
      parsed_questions = []
      survey_questions.each do |sq|
        JSON.parse(sq.questions).each do |question|
          parsed_question << question.symbolize_keys.
            merge(form_id: sq.form_id, qid: question["id"].to_s).
            merge(answer_type: ANSWER_TYPE_MAPPING[question["type"]])

          # TODO: matrix question
        end
      end

      parsed_questions
    end
  end

  class DailySurveyJoinTransformer < TransformerBase
    include Pd::JotForm::Constants

    attr_reader :survey_questions, :survey_submissions

    ANSWER_TYPE_MAPPING = {
      TYPE_NUMBER => ANSWER_TEXT,
      TYPE_TEXTBOX => ANSWER_TEXT,
      TYPE_TEXTAREA => ANSWER_TEXT,
      TYPE_RADIO => ANSWER_SINGLE_SELECT,
      TYPE_DROPDOWN => ANSWER_SINGLE_SELECT,
      TYPE_CHECKBOX => ANSWER_MULTI_SELECT,
      TYPE_MATRIX => ANSWER_MULTI_SELECT,
      TYPE_SCALE => ANSWER_SCALE,
    }.freeze

    # @param data [Hash{WorkshopDailySurveys, SurveyQuestions}] the input data contains WorkshopDailySurvey and SurveyQuestion
    # @return [Array<Hash{fields}>] array of results after join
    # TODO: @see design doc
    def initialize(survey_questions:, survey_submissions:)
      @survey_questions = survey_questions
      @survey_submissions = survey_submissions
    end

    # Split and join WorkshopDailySurvey and SurveyQuestion data.
    def transform_data(logger: nil)
      # Create question mapping: (form_id, qid) => q_content
      questions = {}
      data[:survey_questions].each do |sq|
        question_array = JSON.parse(sq.questions)
        logger&.info "TR: survey form_id #{sq.form_id} has #{question_array.count} questions"

        question_array.each do |question|
          question_key = {form_id: sq.form_id, qid: question["id"].to_s}
          questions[question_key] = question.symbolize_keys
        end
      end

      logger&.info "TR: questions.count = #{questions.count}"
      logger&.debug "TR: questions = #{questions}"

      # Split answers into rows and add question content for each row
      res = []
      data[:survey_submissions].each do |submission|
        next unless submission.answers

        ans_h = JSON.parse(submission.answers)
        logger&.info "TR: submission id #{submission.id} has #{ans_h.count} answers"

        ans_h.each do |qid, ans|
          question_key = {form_id: submission.form_id, qid: qid.to_s}
          raise "Question id #{qid} in form #{form_id} does not exist in SurveyQuestion data" unless questions.key?(question_key)
          question_content = questions[question_key].except(:form_id, :id)

          # TODO: how to decide what fields to take from sumission record? How to config it?
          answer_type = ANSWER_TYPE_MAPPING[question_content[:type]] || 'unknown'
          submission_content = {
            # TODO: do not change column name?
            workshop_id: submission.pd_workshop_id, form_id: submission.form_id,
            submission_id: submission.id, answer: ans, answer_type: answer_type, qid: qid
          }

          res << submission_content.merge(question_content)
        end
      end

      logger&.info "TR: answer count = #{res.count}"
      logger&.debug "TR: first 10 answers = #{res[0..9]}"

      res
    end
  end

  class ComplexQuestionTransformer < TransformerBase
    include Pd::JotForm::Constants

    attr_reader :question_types

    TRANSFORMABLE_QUESTION_TYPES = [TYPE_MATRIX].freeze
    STRING_DIGEST_LENGTH = 16

    def initialize(question_types: [])
      @question_types = question_types
    end

    # precondition: input[:answer] exists and is Hash{sub_question => ans}
    # postcondition: even sub question with empty answer will be produced. Transformer does not attempt
    # to filter data
    def transform_matrix_question_with_answers(input)
      return unless input

      produced_outputs = []
      shared_output = input.except(:name, :type, :text, :answer, :answer_type, :sub_questions)

      # Create a new input for each answer
      input[:answer].each do |sub_q, ans|
        temp_output = {}

        sub_q_digest = Digest::SHA256.base64digest(sub_q)[0, STRING_DIGEST_LENGTH - 1]
        temp_output[:name] = "#{input[:name]}_#{sub_q_digest}"
        temp_output[:text] = "#{input[:text]} #{sub_q}"
        temp_output[:type] = TYPE_MATRIX_DERIVED
        temp_output[:answer] = ans

        # TODO: (Future) answer_type is default to ANSWER_SINGLE_SELECT for now.
        # Once we have input[:inputType] for matrix question we can map it to correct answer type,
        # e.g. "Radio Button" -> ANSWER_SINGLE_SELECT, "Check Box" -> ANSWER_MULTI_SELECT
        temp_output[:answer_type] = ANSWER_SINGLE_SELECT

        # Just to be consistent with what the old pipeline returns
        temp_output[:max_value] = input[:options].length
        temp_output[:parent] = input[:name]

        produced_outputs << shared_output.merge(temp_output)
      end

      produced_outputs
    end

    # Break complex questions into multiple smaller questions
    # @param Array<Hash{}>
    # @return Array<Hash{}>
    def transform_data(data:, logger: nil)
      return unless data

      logger&.info "TR: input question_types = #{question_types}"
      logger&.info "TR: transformable question types = #{TRANSFORMABLE_QUESTION_TYPES}"

      res = []
      data.each do |row|
        q_type = row[:type]

        if question_types.include?(q_type) && TRANSFORMABLE_QUESTION_TYPES.include?(q_type)
          logger&.debug "transforming #{q_type}"

          # TODO: add if/else or use hash of function to map question types to transform functions
          # Question type in TRANSFORMABLE_QUESTION_TYPES but don't have a transformation function
          # will not be written out.
          if q_type == TYPE_MATRIX
            res += transform_matrix_question_with_answers(row)
          else
            raise "There is not code to transform question type #{q_type} yet"
          end
        else
          logger&.debug "TR: cannot transform #{q_type}"
          res << row
        end
      end

      res
    end
  end
end
