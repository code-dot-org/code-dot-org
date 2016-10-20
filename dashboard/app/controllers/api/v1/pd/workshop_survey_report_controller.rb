require 'controllers/api/v1/pd/workshop_score_summarizer'

class Api::V1::Pd::WorkshopSurveyReportController < Api::V1::Pd::ReportControllerBase
  include WorkshopScoreSummarizer
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops/:id/aggregate_workshop_score
  def workshop_survey_report
    survey_report = Hash.new

    survey_report[:this_workshop] = get_score_for_workshops([@workshop])
    survey_report[:all_my_workshops_for_course] = get_score_for_workshops(Pd::Workshop.facilitated_by(current_user).where(course: @workshop.course))

    aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
    survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[@workshop.course]

    render json: survey_report
  end
end
