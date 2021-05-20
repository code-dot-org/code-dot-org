# DailySurveyDecorator organizes survey summary results of a single workshop in a format
# that client UI can presents.

module Pd::SurveyPipeline
  class DailySurveyDecorator
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
      },
      "82115646319154".to_i => {
        full_name: 'Academic Year 6-12 Workshop Post Survey',
        short_name: 'Post Workshop'
      },
      "92125916725157".to_i => {
        full_name: 'Academic Year 6-12 Workshop Post Survey',
        short_name: 'Post Workshop'
      }
    }

    # Create single-workshop survey summary report to send to client.
    #
    # @param data [Hash] a hash contains pieces of information from previous steps in the pipeline
    # @option data [Array<Hash>] :summaries survey result summaries
    # @option data [Hash] :parsed_questions questions parsed from Pd::SurveyQuestion
    # @option data [Hash] :parsed_submissions submission parsed from Pd::Workshop(Facilitator)DailySurvey
    # @option data [User] :current_user user requesting survey report
    # @option data [Array<String>] :errors non-fatal errors from previous steps
    #
    # @return [Hash] a hash report contains 4 keys.
    #   :course_name [String]
    #   :questions [Hash]
    #     {context_name => {question_scope => {question_name => question_content}}}]
    #     context_name could be Pre Workshop, Day 1, Facilitator, Post Workshop, etc.
    #     question_scope is either :general or :facilitator
    #   :this_workshop [Hash]
    #     {context_name => {:response_count => Integer, question_scope => question_summary_results}}
    #     question_summary_results is either
    #       :general => {question_name => summary_result}}
    #       or :facilitator => {question_name => {facilitator_name => summary_result}}
    #   :errors [Array<String>]
    #
    def self.decorate_single_workshop(data)
      report = {
        course_name: nil,
        questions: {},
        this_workshop: {},
        errors: data[:errors] || []
      }

      question_by_names = index_question_by_names(data[:parsed_questions])

      # Populate entries for result[:this_workshop] and result[:questions]
      data[:summaries].each do |summary|
        # Only process summarization for specific workshops and forms.
        workshop_id, form_id, = summary.values_at(:workshop_id, :form_id)
        next unless workshop_id && form_id

        # Check if the current user can see specific data
        next unless summary_visible_to_user?(data[:current_user], summary)

        day, facilitator_id = summary.values_at(:day, :facilitator_id)
        context_name = get_survey_context(workshop_id, day, facilitator_id, form_id)
        q_name = summary[:name]

        # Create top structures if not already created
        report[:course_name] ||= Pd::Workshop.find_by_id(workshop_id)&.course
        report[:this_workshop][context_name] ||= {
          response_count: data[:parsed_submissions][form_id].size,
          general: {},
          facilitator: {}
        }
        report[:questions][context_name] ||= {general: {}, facilitator: {}}

        # Create an entry in result[:this_workshop]
        if facilitator_id
          facilitator_name = User.find_by_id(facilitator_id)&.name || facilitator_id.to_s

          report[:this_workshop][context_name][:facilitator][q_name] ||= {}
          report[:this_workshop][context_name][:facilitator][q_name][facilitator_name] =
            summary[:reducer_result]
        else
          report[:this_workshop][context_name][:general][q_name] = summary[:reducer_result]
        end

        # Create an entry in result[:questions]
        q_content = question_by_names.dig(form_id, q_name)
        if facilitator_id
          report[:questions][context_name][:facilitator][q_name] ||= q_content
        else
          report[:questions][context_name][:general][q_name] ||= q_content
        end
      end

      report
    end

    # Check if an user can see a summary result.
    # @param user [User] current user requesting this report
    # @param summary [Hash] a summary result from previous steps in the survey pipeline
    # @return [Boolean]
    def self.summary_visible_to_user?(user, summary)
      return false unless user

      # Can user see this facilitator-specific summary?
      if summary[:facilitator_id]
        return false unless user.program_manager? ||
          user.workshop_organizer? ||
          user.workshop_admin? ||
          user.id == summary[:facilitator_id]
      end

      true
    end

    # Return context of a survey submissions given its metadata.
    #
    # @param workshop_id [Integer] must be valid workshop id
    # @param day [Integer]
    # @param facilitator_id [Integer]
    # @param form_id [Integer]
    # @return [String] context name such as Pre Workshop, Post Workshop, Day [number], and Facilitator.
    #
    def self.get_survey_context(workshop_id, day, facilitator_id, form_id)
      workshop = Pd::Workshop.find_by_id(workshop_id)
      return 'Invalid' unless workshop && day >= 0

      if workshop.csf?
        return 'Facilitators' if facilitator_id

        # CSF is a 1-day workshop and doesn't have daily survey.
        return day == 0 ? 'Pre Workshop' : 'Post Workshop'
      elsif workshop.summer?
        # Summer workshop doesn't have post-workshop survey.
        return day == 0 ? 'Pre Workshop' : "Day #{day}"
      else
        # Academic year workshop doesn't have pre-workshop survey.
        return 'Invalid' if day == 0

        # Post workshop survey has the same "day" value as the last daily survey.
        # Use form name to distinguish them.
        session_count = workshop.sessions.size
        form_name = get_form_short_name(form_id)
        return day == session_count && form_name == 'Post Workshop' ? 'Post Workshop' : "Day #{day}"
      end
    end

    def self.get_form_short_name(form_id)
      FORM_IDS_TO_NAMES.dig(form_id, :short_name) || form_id.to_s
    end

    # Index question collection by form id and question name.
    #
    # @param questions [Hash] {form_id => {question_id => question_content}}.
    # @return [Hash] {form_id => {question_name => question_content}}
    # @note question_content is Hash{:type, :name, :text, :order, :hidden => String}.
    # @see DailySurveyParser parse_survey function to see how questions data is created.
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
