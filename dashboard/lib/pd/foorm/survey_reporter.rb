# Retrieves, parses and summarizes Foorm Survey results for consumption by APIs.
module Pd::Foorm
  class SurveyReporter
    include Constants
    include Pd::WorkshopConstants
    include Pd::WorkshopSurveyFoormConstants
    extend Helper

    # **Currently this method only supports Build Your Own Workshop survey results**
    # Creates a survey summary for a given workshop, filtered by an individual facilitator if they are viewing their
    # own feedback. This method differs from get_workshop_report below, in that it categorizes the results and does
    # some response processing to better shape the data for the new survey summary view in the workshop dashboard.
    # It still relies on the existing form parser and answer summarizer, but uses an additional form parser that
    # preserves the question `category` and `shortText` properties that have been added to the form json and are
    # needed in the new summary view (see the build your own workshop surveys for an example).
    def self.get_workshop_survey_summary(workshop_id, facilitator_id_filter = nil)
      return unless workshop_id
      ws_data = Pd::Workshop.find(workshop_id)

      # Get raw data
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id, facilitator_id_filter)

      follow_up_requested = get_follow_up_requested(form_submissions)

      facilitators = get_formatted_facilitators_for_workshop(workshop_id, facilitator_id_filter)

      # Legacy parser that does not preserve question categories but works with WorkshopSummarizer
      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)

      summarized_answers = Pd::Foorm::WorkshopSummarizer.summarize_answers_by_survey(
        form_submissions,
        parsed_forms,
        ws_submissions
      )

      # Parse forms with categories
      parsed_forms_with_categories = Pd::Foorm::FoormParser.parse_forms_preserving_categories(forms)

      # Process each survey separately
      surveys = {}
      summarized_answers.each do |survey_key, survey_data|
        # Count general participants for this specific survey
        survey_participant_count = survey_data.dig(:general, :response_count) || 0

        # Create a single-survey summarized_answers structure for categorization
        single_survey_answers = {survey_key => survey_data}

        # Process data by category for this survey
        categorized_report = Pd::Foorm::WorkshopCategorizer.categorize_survey_data(
          parsed_forms_with_categories,
          single_survey_answers,
          facilitators
        )

        # BYO workshops only have pre and post surveys, so this will be either pre_workshop or post_workshop
        surveys[survey_key.downcase.tr(' ', '_')] = {
          total_responses: survey_participant_count,
          categories: categorized_report
        }
      end

      {
        course: ws_data.course,
        name: ws_data.name,
        facilitators: facilitators,
        surveys: surveys,
        follow_up_requested: follow_up_requested
      }
    end

    # Calculates report for a given workshop id.
    # @param [Integer] workshop_id
    # @param [Integer] facilitator_id_filter. The user id
    #   of the only facilitator we want to return data for.
    #   If all facilitator data can be viewed, facilitator_id_filter is nil
    # @return workshop report in format specified in README
    def self.get_workshop_report(workshop_id, facilitator_id_filter)
      return unless workshop_id

      # get workshop summary
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id, facilitator_id_filter)
      facilitators = get_formatted_facilitators_for_workshop(workshop_id, facilitator_id_filter)
      parsed_forms, summarized_answers = parse_and_summarize_forms(ws_submissions, form_submissions, forms)

      ws_data = Pd::Workshop.find(workshop_id)
      result_data = {
        course_name: ws_data.course,
        facilitators: facilitators,
        questions: parsed_forms,
        this_workshop: summarized_answers
      }

      # get single workshop rollup
      rollup_configuration = JSON.parse(File.read(ROLLUP_CONFIGURATION_FILE), symbolize_names: true)
      return result_data unless rollup_configuration && rollup_configuration[ws_data.course.to_sym]

      questions_to_summarize = rollup_configuration[ws_data.course.to_sym]

      rollup_question_details = Pd::Foorm::RollupHelper.get_question_details_for_rollup(
        parsed_forms,
        questions_to_summarize
      )
      rollup = Pd::Foorm::RollupCreator.calculate_averaged_rollup(
        summarized_answers,
        rollup_question_details,
        facilitators,
        split_by_facilitator: true
      )
      # get overall rollup per facilitator
      overall_rollup_per_facilitator = facilitators ?
                                         get_facilitator_rollup_for_course(
                                           facilitators,
                                           ws_data.course,
                                           questions_to_summarize
                                         ) :
                                         {}

      result_data[:workshop_rollups] = {}

      rollup_question_details.each do |key, questions|
        result_data[:workshop_rollups][key] = {
          questions: questions,
          single_workshop: rollup[key],
          overall_facilitator: facilitators ? overall_rollup_per_facilitator[key] : {},
          overall: {}
        }
      end
      result_data
    end

    # Given set of facilitators and a course name, return average responses for given
    # questions across all workshops each facilitator has run.
    # @param object {facilitator_id: facilitator_name,...} specifying facilitators to include
    # @param String course_name course name to rollup, ex 'CS Principles'
    # @param object questions_to_summarize question ids to include in rollup in format
    # {
    #   general: [{question_id: "sample_question_id", "header_text": "Sample Question"},...]
    #   facilitator: [{...same as general...}]
    # }
    # @return
    # {
    #   general: { see RollupCreator.calculate_averaged_rollup },
    #   facilitator: { see RollupCreator.calculate_averaged_rollup }
    # }
    def self.get_facilitator_rollup_for_course(facilitators, course_name, questions_to_summarize)
      rollups = {general: {}, facilitator: {}}
      facilitators.each_key do |facilitator_id|
        workshop_ids = Pd::Workshop.
          where(course: course_name).
          in_state(STATE_ENDED).
          facilitated_by(User.find(facilitator_id)).
          pluck(:id)
        facilitator_rollup = get_rollup_for_workshop_ids(
          workshop_ids,
          questions_to_summarize,
          true,
          facilitators,
          facilitator_id
        )
        rollups[:general][facilitator_id] = facilitator_rollup[:general]
        if facilitator_rollup[:facilitator]
          rollups[:facilitator][facilitator_id] = facilitator_rollup[:facilitator][facilitator_id]
        end
      end
      rollups
    end

    # given a set of workshop_ids and questions to roll up, get rollup for that workshop.
    # If split_by_facilitator is true, split questions by facilitator id.
    def self.get_rollup_for_workshop_ids(
      workshop_ids,
      questions_to_summarize,
      split_by_facilitator,
      facilitators,
      facilitator_id = nil
    )
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_ids, facilitator_id)
      parsed_forms, summarized_answers = parse_and_summarize_forms(ws_submissions, form_submissions, forms)
      rollup_question_details = Pd::Foorm::RollupHelper.get_question_details_for_rollup(
        parsed_forms,
        questions_to_summarize
      )
      return Pd::Foorm::RollupCreator.calculate_averaged_rollup(
        summarized_answers,
        rollup_question_details,
        facilitators,
        split_by_facilitator
      )
    end

    def self.parse_and_summarize_forms(ws_submissions, form_submissions, forms)
      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)
      summarized_answers = Pd::Foorm::WorkshopSummarizer.summarize_answers_by_survey(
        form_submissions,
        parsed_forms,
        ws_submissions
      )
      [parsed_forms, summarized_answers]
    end

    # Gets the raw data needed for summarizing survey results of workshop participants.
    # @param workshop id, the workshop to get data from
    # @return array of [WorkshopSurveyFoormSubmissions, FoormSubmissions, FoormForms]
    #   for the given workshop id.
    def self.get_raw_data_for_workshop(workshop_id, facilitator_id = nil)
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.
        where(pd_workshop_id: workshop_id).
        joins(:foorm_submission).
        where(foorm_submissions: {form_name: ALL_PARTICIPANT_SURVEY_CONFIG_PATHS})
      if facilitator_id
        ws_submissions = ws_submissions.where(facilitator_id: facilitator_id).or(ws_submissions.where(facilitator_id: nil))
      end
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = submission_ids.empty? ? [] : ::Foorm::Submission.find(submission_ids)
      form_names_versions = foorm_submissions.pluck(:form_name, :form_version).uniq
      forms = []
      form_names_versions.each do |name, version|
        form = ::Foorm::Form.where(name: name, version: version).first
        forms << form if form
      end

      [ws_submissions, foorm_submissions, forms]
    end

    # @param integer workshop_id: id for a workshop
    # @param integer facilitator_id_filter: If specified, only get facilitator data for the facilitator
    #   with this id
    # @return {facilitator_id: facilitator_name,...} object with data
    # for each facilitator for the workshop specified
    def self.get_formatted_facilitators_for_workshop(workshop_id, facilitator_id_filter = nil)
      facilitators_formatted = {}
      if facilitator_id_filter
        facilitators_formatted[facilitator_id_filter] = User.find(facilitator_id_filter).name
        return facilitators_formatted
      end
      workshop = Pd::Workshop.find(workshop_id)
      facilitators = workshop.facilitators
      return nil unless facilitators
      facilitators.each do |facilitator|
        facilitators_formatted[facilitator.id] = facilitator.name
      end
      facilitators_formatted
    end

    # extracts user name and provided follow up email from submissions
    def self.get_follow_up_requested(form_submissions)
      submissions_with_followup = form_submissions.filter_map do |submission|
        answers = JSON.parse(submission.answers)
        if answers['followup_requested'] == 'yes' && answers['followup_email'].present?
          {
            id: submission.id,
            email: answers['followup_email']
          }
        end
      end

      submission_ids = submissions_with_followup.pluck(:id)

      submission_users = Pd::WorkshopSurveyFoormSubmission.includes(:user).
                                                          where(foorm_submission_id: submission_ids).
                                                          index_by(&:foorm_submission_id)

      results = []
      submissions_with_followup.each do |submission_data|
        submission_id = submission_data[:id]
        email = submission_data[:email]

        submission_user = submission_users[submission_id]

        next if submission_user&.user.blank?

        results << {
          name: submission_user.user.full_name,
          email: email
        }
      end

      results
    end
  end
end
