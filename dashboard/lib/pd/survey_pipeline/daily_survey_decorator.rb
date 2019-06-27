module Pd::SurveyPipeline
  class DailySurveyDecorator < SurveyPipelineWorker
    FORM_IDS_TO_NAMES = {
      "90066184161150".to_i => {
        full_name: 'CS Fundamentals Deep Dive Pre-survey',
        short_name: 'Pre Workshop'
      },
      "90065524560150".to_i => {
        full_name: 'CS Fundamentals Deep Dive Post-survey',
        short_name: 'Post Workshop'
      },
      "91405279991164".to_i => {
        full_name: 'Facilitator Feedback Survey',
        short_name: 'Facilitator'
      }
    }

    REQUIRED_INPUT_KEYS = [:summaries, :parsed_questions, :parsed_submissions, :current_user]
    OPTIONAL_INPUT_KEYS = [:errors]
    OUTPUT_KEYS = [:decorated_summaries]

    # @param context [Hash] contains necessary input for this worker to process.
    #   Results are added back to the context object.
    #
    # @return [Hash] the same context object.
    #
    # @raise [RuntimeError] if required input keys are missing.
    #
    def self.process_data(context)
      check_required_input_keys REQUIRED_INPUT_KEYS, context

      results = decorate context.slice(*(REQUIRED_INPUT_KEYS + OPTIONAL_INPUT_KEYS))

      OUTPUT_KEYS.each do |key|
        context[key] ||= {}
        context[key].merge! results[key]
      end

      context
    end

    # Combine summary data and parsed data into a format that UI client will understand.
    #
    # @param summaries [Array<Hash>] an array of summary results.
    # @param parsed_questions [Hash] question data get from DailySurveyParser.
    # @param parsed_submissions [Hash] submission data get from DailySurveyParser.
    # @param current_user [User] user making survey report request.
    # @param errors [Array] non-fatal errors encounterd when calculating survey summaries.
    #
    # @return [Hash] data returned to client.
    #
    def self.decorate(summaries:, parsed_questions:, parsed_submissions:, current_user:, errors: [])
      result = {
        course_name: nil,
        questions: {},
        this_workshop: {},
        all_my_workshops: {},
        facilitators: {},
        facilitator_averages: {},
        facilitator_response_counts: {},
        errors: errors
      }

      question_by_names = index_question_by_names(parsed_questions)

      # Populate entries for result[:this_workshop] and result[:questions]
      summaries.each do |summary|
        # Only process summarization for specific workshops and forms.
        form_id = summary[:form_id]
        workshop_id = summary[:workshop_id]
        next unless workshop_id && form_id

        # Check if the current user can see specific data
        next unless data_visible_to_user?(current_user, summary)

        form_name = get_form_short_name(form_id)
        q_name = summary[:name]

        # Create top structures if not already created
        result[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        result[:this_workshop][form_name] ||= {
          response_count: parsed_submissions[form_id].size,
          general: {},
          facilitator: {}
        }
        result[:questions][form_name] ||= {general: {}, facilitator: {}}

        # Create an entry in result[:this_workshop].
        # General format:
        # Hash{form_name => {response_count => number, general => {question_name => summary_result}}}
        #
        # Format for facilicator-specific result:
        # Hash{form_name => {response_count => number,
        #   facilitator => {question_name => {factilitator_name => summary_result}}}}
        #
        if summary[:facilitator_id]
          facilitator_name = User.find_by_id(summary[:facilitator_id])&.name ||
            summary[:facilitator_id].to_s

          result[:this_workshop][form_name][:facilitator][q_name] ||= {}
          result[:this_workshop][form_name][:facilitator][q_name][facilitator_name] =
            summary[:reducer_result]
        else
          result[:this_workshop][form_name][:general][q_name] = summary[:reducer_result]
        end

        # Create an entry in result[:questions].
        # General question format:
        # Hash{form_name => {general => {question_name => question_content}}}
        #
        # Facilitator question format:
        # Hash{form_name => {facilitator => {question_name => question_content}}}
        #
        q_content = question_by_names.dig(form_id, q_name)
        if summary[:facilitator_id]
          result[:questions][form_name][:facilitator][q_name] ||= q_content
        else
          result[:questions][form_name][:general][q_name] ||= q_content
        end
      end

      {decorated_summaries: result}
    end

    def self.data_visible_to_user?(user, data)
      return false unless user

      # Can user see this facilitator-specific data?
      if data[:facilitator_id]
        return false unless user.program_manager? ||
          user.workshop_organizer? ||
          user.workshop_admin? ||
          user.id == data[:facilitator_id]
      end

      true
    end

    def self.get_form_short_name(form_id)
      FORM_IDS_TO_NAMES.dig(form_id, :short_name) || form_id.to_s
    end

    # Index question collection by form id and question name.
    #
    # @param questions [Hash{form_id => {question_id => question_content}}]
    #   question_content is Hash{:type, :name, :text, :order, :hidden}.
    #   @see DailySurveyParser parse_survey function to see how questions data is created.
    #
    # @return [Hash{form_id => {question_name => question_content}}]
    #
    def self.index_question_by_names(questions)
      q_indexes = {}
      questions&.each do |form_id, form_questions|
        form_questions.each do |_, q_content|
          q_indexes[form_id] ||= {}
          q_indexes[form_id][q_content[:name]] = q_content.except(:name)
        end
      end

      q_indexes
    end
  end
end
