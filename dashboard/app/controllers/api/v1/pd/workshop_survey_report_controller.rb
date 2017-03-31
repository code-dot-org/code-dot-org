module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter

    load_and_authorize_resource :workshop, class: 'Pd::Workshop'

    # GET /api/v1/pd/workshops/:id/workshop_survey_report
    def workshop_survey_report
      survey_report = Hash.new

      survey_report[:this_workshop] = get_score_for_workshops([@workshop], include_free_responses: true)
      all_my_workshops = (params[:organizer_view] ? Pd::Workshop.organized_by(current_user) : Pd::Workshop.facilitated_by(current_user)).where(course: @workshop.course).in_state(Pd::Workshop::STATE_ENDED)
      survey_report[:all_my_workshops_for_course] = get_score_for_workshops(all_my_workshops)

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[@workshop.course].symbolize_keys

      respond_to do |format|
        format.json do
          render json: survey_report
        end
        format.csv do
          # Kind of lame but we need to do this - Ruby orders hashes based on insertion order. We want to rename the first
          # key, but that's not really supported in a way to preserve insertion order. So we have to make a new hash
          ordered_survey_report = survey_report.transform_keys.with_index {|k, i| i == 0 ? @workshop.friendly_name : k}
          send_as_csv_attachment(convert_to_csv(ordered_survey_report), 'workshop_survey_report.csv', titleize: false)
        end
      end
    end
  end
end
