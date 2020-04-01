# Retrieves, parses and summarizes Foorm Survey results for consumption by APIs.
module Pd::Foorm
  class SurveyResults
    extend Helper
    include Constants

    # Calculates report for a given workshop id.
    # @return
    #   {
    #        course_name: 'CS Principles',
    #        questions: <parsed form, see FoormParser>,
    #        this_workshop: <summarized survey answers, see WorkshopSummarizer>,
    #        workshop_rollups: {
    #         questions: <question details, see RollupHelper.get_question_details_for_rollup>,
    #         single_workshop: <rollup for workshop_id, see RollupCreator>,
    #         overall: <rollup for all workshops in course_name, see RollupCreator>
    #       }
    #   }
    # Path for calculating report is:
    # SurveyResults.get_raw_data_for_workshop
    #   summary:
    #   -> FoormParser.parse_forms
    #   -> WorkshopSummarizer.summarize_answers_by_survey
    #     rollups:
    #     -> RollupHelper.get_question_details_for_rollup
    #       single_workshop_rollup:
    #       -> RollupCreator.calculate_averaged_rollup
    #       course rollup:
    #       -> get all workshop ids for course
    #       -> SurveyResults.get_raw_data_for_workshop(ids)
    #       -> FoormParser.parse_forms
    #       -> WorkshopSummarizer.summarize_answers_by_survey
    #       -> RollupCreator.calculate_averaged_rollup
    def self.get_workshop_report(workshop_id)
      return unless workshop_id

      # get workshop summary
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id)
      parsed_forms, summarized_answers = parse_and_summarize_forms(ws_submissions, form_submissions, forms)

      ws_data = Pd::Workshop.find(workshop_id)
      result_data = {
        course_name: ws_data.course,
        questions: parsed_forms,
        this_workshop: summarized_answers
      }

      # get single workshop rollup
      rollup_configuration = JSON.parse(File.read(ROLLUP_CONFIGURATION_FILE), symbolize_names: true)
      return result_data unless rollup_configuration && rollup_configuration[ws_data.course.to_sym]

      questions_to_summarize = rollup_configuration[ws_data.course.to_sym]
      rollup_question_details = Pd::Foorm::RollupHelper.get_question_details_for_rollup(parsed_forms, questions_to_summarize)
      rollup = Pd::Foorm::RollupCreator.calculate_averaged_rollup(summarized_answers, rollup_question_details)

      result_data[:workshop_rollups] = {
        questions: rollup_question_details
      }

      result_data[:workshop_rollups][:single_workshop] = {
        averages: rollup[:averages],
        response_count: rollup[:response_count],
        workshop_id: ws_data.id
      }

      # get overall rollup
      overall_rollup = get_rollup_for_course(ws_data.course, rollup_question_details)
      result_data[:workshop_rollups][:overall] = {
        averages: overall_rollup[:averages],
        response_count: overall_rollup[:response_count]
      }

      result_data
    end

    # Get rollup for all survey results for the given course
    def self.get_rollup_for_course(course_name, rollup_question_details)
      workshop_ids = Pd::Workshop.where(course: course_name).where.not(started_at: nil, ended_at: nil).pluck(:id)
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_ids)
      _, summarized_answers = parse_and_summarize_forms(ws_submissions, form_submissions, forms)
      return Pd::Foorm::RollupCreator.calculate_averaged_rollup(summarized_answers, rollup_question_details)
    end

    def self.parse_and_summarize_forms(ws_submissions, form_submissions, forms)
      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)
      summarized_answers = Pd::Foorm::WorkshopSummarizer.summarize_answers_by_survey(form_submissions, parsed_forms, ws_submissions)
      [parsed_forms, summarized_answers]
    end

    def self.get_rollup_from_parsed_data(parsed_forms, summarized_answers, course_name)
      rollup_configuration = JSON.parse(File.read('config/foorm/rollups/rollups_by_course.json'))
      return unless rollup_configuration && rollup_configuration[course_name]

      questions_to_summarize = rollup_configuration[course_name]
      Pd::Foorm::RollupCreator.calculate_averaged_rollup(parsed_forms, summarized_answers, questions_to_summarize)
    end

    # TODO: once we store facilitator data
    # def self.get_rollup_for_facilitator(workshop_id, facilitator_id)
    # end

    # Gets the raw data needed for summarizing workshop survey results.
    # @param workshop id, the workshop to get data from
    # @return array of [WorkshopSurveyFoormSubmissions, FoormSubmissions and FoormForms]
    #   for the given workshop id.
    def self.get_raw_data_for_workshop(workshop_id)
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop_id)

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
  end
end
