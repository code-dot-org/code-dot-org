require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

class Api::V1::Pd::WorkshopSurveyReportController < Api::V1::Pd::ReportControllerBase
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  FACILITATOR_EFFECTIVENESS_QUESTIONS = [
      :how_much_learned_s,
      :how_motivating_s,
      :how_clearly_presented_s,
      :how_interesting_s,
      :how_often_given_feedback_s,
      :help_quality_s,
      :how_comfortable_asking_questions_s,
      :how_often_taught_new_things_s
  ]
  OVERALL_SUCCESS_QUESTIONS = [
      :more_prepared_than_before_s,
      :know_where_to_go_for_help_s,
      :suitable_for_my_experience_s,
      :would_recommend_s,
      :part_of_community_s
  ]

  # GET /api/v1/pd/workshops/:id/aggregate_workshop_score
  def workshop_survey_report
    survey_report = Hash.new

    survey_report[:this_workshop] = get_score_for_workshops([@workshop])
    survey_report[:all_my_workshops] = get_score_for_workshops(Pd::Workshop.where(organizer_id: @workshop.organizer_id, course: @workshop.course))

    render json: survey_report
  end

  private

  def get_score_for_workshops(workshops)
    report_column = Hash.new(0)
    response_count = 0

    workshops.flat_map(&:enrollments).each do |enrollment|
      response_object = PEGASUS_DB[:forms].where(source_id: enrollment.id, kind: 'PdWorkshopSurvey').first

      next if response_object.nil?

      response_count += 1

      survey_response = JSON.parse(response_object[:data])

      survey_response.symbolize_keys.each do |k, v|
        if FACILITATOR_EFFECTIVENESS_QUESTIONS.include?(k)
          report_column[:facilitator_effectiveness] += PdWorkshopSurvey::OPTIONS[k].index(v) + 1
        elsif OVERALL_SUCCESS_QUESTIONS.include?(k)
          report_column[:overall_success] += PdWorkshopSurvey::AGREE_SCALE_OPTIONS.index(v) + 1
        end
      end
    end

    report_column[:number_teachers] = @workshop.enrollments.size
    report_column[:response_count] = response_count
    report_column[:facilitator_effectiveness] /= FACILITATOR_EFFECTIVENESS_QUESTIONS.size.to_f * response_count
    report_column[:overall_success] /= OVERALL_SUCCESS_QUESTIONS.size.to_f * response_count

    report_column
  end
end
