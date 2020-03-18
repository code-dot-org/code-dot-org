# Retrieves, parses and summarizes Foorm Survey results for consumption by APIs.
module Pd::Foorm
  class SurveyResults
    extend Helper
    include Constants

    def self.get_summary_for_workshop(workshop_id)
      return unless workshop_id

      ws_data = Pd::Workshop.find(workshop_id)
      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id)

      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)
      summarized_answers = Pd::Foorm::WorkshopSummarizer.summarize_answers_by_survey(form_submissions, parsed_forms, ws_submissions)

      {
        course_name: ws_data.course,
        questions: parsed_forms,
        this_workshop: summarized_answers
      }
    end

    def self.get_workshop_report(workshop_id)
      return unless workshop_id

      ws_submissions, form_submissions, forms = get_raw_data_for_workshop(workshop_id)
      parsed_forms, summarized_answers = parse_and_summarize_forms(ws_submissions, form_submissions, forms)

      ws_data = Pd::Workshop.find(workshop_id)
      result_data = {course_name: ws_data.course,
                     questions: parsed_forms,
                     this_workshop: summarized_answers}
      rollup = get_rollup_from_parsed_data(parsed_forms, summarized_answers, ws_data.course)
      return result_data unless rollup

      result_data[:rollups] = {}
      result_data[:rollups][:single_workshop] = {
        averages: rollup[:averages],
        response_count: rollup[:response_count],
        workshop_id: ws_data.id
      }
      return result_data
    end

    def self.parse_and_summarize_forms(ws_submissions, form_submissions, forms)
      parsed_forms = Pd::Foorm::FoormParser.parse_forms(forms)
      summarized_answers = Pd::Foorm::WorkshopSummarizer.summarize_answers_by_survey(form_submissions, parsed_forms, ws_submissions)
      return [parsed_forms, summarized_answers]
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

    # get all WorkshopSurveyFoormSubmissions, FoormSubmissions and FoormFoorms for the
    # given workshop id
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
