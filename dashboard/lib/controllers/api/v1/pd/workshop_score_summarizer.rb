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

  def get_score_for_workshops(workshops, facilitator_breakdown = false)
    report_rows = Hash.new(0)
    response_count = 0

    facilitator_scores = nil

    if facilitator_breakdown
      facilitator_scores = Hash.new

      workshops.flat_map(&:facilitators).uniq.each do |facilitator|
        facilitator_scores[facilitator.name] = Hash.new(0)
      end
    end

    workshops.each do |workshop|
      enrollment_ids = workshop.enrollments.pluck(:id)

      responses = PEGASUS_DB[:forms].where(source_id: enrollment_ids, kind: 'PdWorkshopSurvey')

      if facilitator_breakdown
        workshop.facilitators.each do |facilitator|
          facilitator_scores[facilitator.name][:response_count] += responses.count
          facilitator_scores[facilitator.name][:number_teachers] += workshop.enrollments.size
        end
      end

      responses.each do |response|
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
            add_score_to_hash(report_rows, :facilitator_effectiveness, workshop.facilitators, facilitator_scores, score)
          elsif TEACHER_ENGAGEMENT_QUESTIONS.include?(k)
            add_score_to_hash(report_rows, :teacher_engagement, workshop.facilitators, facilitator_scores, score)
          elsif OVERALL_SUCCESS_QUESTIONS.include?(k)
            add_score_to_hash(report_rows, :overall_success, workshop.facilitators, facilitator_scores, score)
          end

          if INDIVIDUAL_RESPONSE_QUESTIONS.include?(k)
            add_score_to_hash(report_rows, k, workshop.facilitators, facilitator_scores, score)
          end
        end
      end
    end

    report_rows[:number_teachers] = workshops.map(&:enrollments).map(&:size).reduce(:+)
    report_rows[:response_count] = response_count
    report_rows[:facilitator_effectiveness] = (report_rows[:facilitator_effectiveness] / (FACILITATOR_EFFECTIVENESS_QUESTIONS.size.to_f * response_count)).round(2)
    report_rows[:teacher_engagement] = (report_rows[:teacher_engagement] / (TEACHER_ENGAGEMENT_QUESTIONS.size.to_f * response_count)).round(2)
    report_rows[:overall_success] = (report_rows[:overall_success] / (OVERALL_SUCCESS_QUESTIONS.size.to_f * response_count)).round(2)

    INDIVIDUAL_RESPONSE_QUESTIONS.each do |question|
      report_rows[question] = (report_rows[question].to_f / response_count).round(2)
    end

    if facilitator_breakdown
      facilitator_scores.each_value do |scores|
        scores[:facilitator_effectiveness] = (scores[:facilitator_effectiveness] / (FACILITATOR_EFFECTIVENESS_QUESTIONS.size.to_f * scores[:response_count])).round(2)
        scores[:teacher_engagement] = (scores[:teacher_engagement] / (TEACHER_ENGAGEMENT_QUESTIONS.size.to_f * scores[:response_count])).round(2)
        scores[:overall_success] = (scores[:overall_success] / (OVERALL_SUCCESS_QUESTIONS.size.to_f * scores[:response_count])).round(2)

        INDIVIDUAL_RESPONSE_QUESTIONS.each do |question|
          scores[question] = (scores[question].to_f / scores[:response_count]).round(2)
        end
      end
    end

    facilitator_breakdown ? [report_rows, facilitator_scores] : report_rows
  end

  private

  def get_score_for_response(questions, question, answer)
    questions[question].index(answer) + 1
  end

  def add_score_to_hash(report_rows, key, facilitators, facilitator_scores, score)
    report_rows[key] += score

    if facilitator_scores
      facilitators.each do |facilitator|
        facilitator_scores[facilitator.name][key] += score
      end
    end
  end
end
