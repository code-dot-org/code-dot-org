# Retrieves, parses and summarizes Foorm Survey results for consumption by APIs.
module Pd::Foorm
  class SurveyReporter
    include Constants
    include Pd::WorkshopConstants
    extend Helper

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

    # Get rollup for all survey results for the given course
    def self.get_rollup_for_course(course_name, questions_to_summarize, facilitators)
      workshop_ids = Pd::Workshop.where(course: course_name).where.not(started_at: nil, ended_at: nil).pluck(:id)
      return get_rollup_for_workshop_ids(
        workshop_ids,
        questions_to_summarize,
        false,
        facilitators
      )
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
      facilitator_id=nil
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

    # Gets the raw data needed for summarizing workshop survey results.
    # @param workshop id, the workshop to get data from
    # @return array of [WorkshopSurveyFoormSubmissions, FoormSubmissions, FoormForms]
    #   for the given workshop id.
    def self.get_raw_data_for_workshop(workshop_id, facilitator_id=nil)
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop_id)
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
    def self.get_formatted_facilitators_for_workshop(workshop_id, facilitator_id_filter=nil)
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
  end
end
