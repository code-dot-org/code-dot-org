require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey" unless defined?(PdWorkshopSurvey)

module WorkshopScoreSummarizer
  FACILITATOR_EFFECTIVENESS_QUESTIONS = [
    :how_much_learned_s,
    :how_motivating_s,
    :how_clearly_presented_s,
    :how_interesting_s,
    :how_often_given_feedback_s,
    :how_comfortable_asking_questions_s,
    :how_often_taught_new_things_s
  ]

  TEACHER_ENGAGEMENT_QUESTIONS = [
    :how_much_participated_s,
    :how_often_talk_about_ideas_outside_s,
    :how_often_lost_track_of_time_s,
    :how_excited_before_s,
    :overall_how_interested_s
  ]

  OVERALL_SUCCESS_QUESTIONS = [
    :more_prepared_than_before_s,
    :know_where_to_go_for_help_s,
    :suitable_for_my_experience_s,
    :would_recommend_s,
    :part_of_community_s
  ]

  INDIVIDUAL_RESPONSE_QUESTIONS = [
    :how_much_learned_s,
    :how_motivating_s,
    :how_clearly_presented_s,
    :how_interesting_s,
    :how_often_given_feedback_s,
    :how_comfortable_asking_questions_s,
    :how_often_taught_new_things_s,
    :how_much_participated_s,
    :how_often_talk_about_ideas_outside_s,
    :how_often_lost_track_of_time_s,
    :how_excited_before_s,
    :overall_how_interested_s,
    :more_prepared_than_before_s,
    :know_where_to_go_for_help_s,
    :suitable_for_my_experience_s,
    :would_recommend_s,
    :part_of_community_s
  ]

  def get_score_for_workshops(workshops)
    report_column = Hash.new(0)
    response_count = 0

    enrollment_ids = workshops.flat_map(&:enrollments).pluck(:id)

    PEGASUS_DB[:forms].where(source_id: enrollment_ids, kind: 'PdWorkshopSurvey').each do |response|
      next if response.nil?

      response_count += 1
      survey_response = JSON.parse(response[:data])

      survey_response.symbolize_keys.each do |k, v|
        if OVERALL_SUCCESS_QUESTIONS.include?(k)
          score = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.index(v) + 1
        else
          next unless PdWorkshopSurvey::OPTIONS.key?(k) && INDIVIDUAL_RESPONSE_QUESTIONS.include?(k)
          score = get_score_for_response(PdWorkshopSurvey::OPTIONS, k, v)
        end

        if FACILITATOR_EFFECTIVENESS_QUESTIONS.include?(k)
          report_column[:facilitator_effectiveness] += score
        elsif TEACHER_ENGAGEMENT_QUESTIONS.include?(k)
          report_column[:teacher_engagement] += score
        elsif OVERALL_SUCCESS_QUESTIONS.include?(k)
          report_column[:overall_success] += score
        end

        if INDIVIDUAL_RESPONSE_QUESTIONS.include?(k)
          report_column[k] += score
        end
      end
    end

    report_column[:number_teachers] = workshops.map(&:enrollments).map(&:size).reduce(:+)
    report_column[:response_count] = response_count
    report_column[:facilitator_effectiveness] = (report_column[:facilitator_effectiveness] / (FACILITATOR_EFFECTIVENESS_QUESTIONS.size.to_f * response_count)).round(2)
    report_column[:teacher_engagement] = (report_column[:teacher_engagement] / (TEACHER_ENGAGEMENT_QUESTIONS.size.to_f * response_count)).round(2)
    report_column[:overall_success] = (report_column[:overall_success] / (OVERALL_SUCCESS_QUESTIONS.size.to_f * response_count)).round(2)

    INDIVIDUAL_RESPONSE_QUESTIONS.each do |question|
      report_column[question] = (report_column[question].to_f / response_count).round(2)
    end

    report_column
  end

  def get_score_for_response(questions, question, answer)
    questions[question].index(answer) + 1
  end
end
