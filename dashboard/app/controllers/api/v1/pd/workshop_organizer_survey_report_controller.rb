require 'controllers/api/v1/pd/workshop_score_summarizer'

class Api::V1::Pd::WorkshopOrganizerSurveyReportController < Api::V1::Pd::ReportControllerBase
  include WorkshopScoreSummarizer
  load_resource :workshop, class: 'Pd::Workshop'

  def workshop_organizer_survey_report
    survey_report = Hash.new

    survey_report[:this_workshop] = get_score_for_workshops([@workshop], false)
    survey_report[:all_my_workshops] = get_score_for_workshops(Pd::Workshop.where(course: @workshop.course, organizer_id: current_user.id), false)

    aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
    survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[@workshop.course]

    render json: survey_report
  end

  def workshop_organizer_survey_report_for_course
    survey_report = Hash.new

    survey_report[:all_my_workshops], facilitator_scores = get_score_for_workshops(::Pd::Workshop.where(course: params[:course], organizer_id: current_user.id), true)
    survey_report.merge!(facilitator_scores)

    aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
    survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[params[:course]]

    render json: survey_report
  end
end
