module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    load_and_authorize_resource :workshop, class: 'Pd::Workshop'

    # GET /api/v1/pd/workshops/:id/workshop_survey_report
    def workshop_survey_report
      survey_report = Hash.new

      survey_report[:this_workshop] = get_score_for_workshops([@workshop], include_free_responses: true)
      all_my_workshops = (current_user.workshop_organizer? ? Pd::Workshop.organized_by(current_user) : Pd::Workshop.facilitated_by(current_user)).where(course: @workshop.course)
      survey_report[:all_my_workshops_for_course] = get_score_for_workshops(all_my_workshops)

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[@workshop.course]

      render json: survey_report
    end
  end
end
