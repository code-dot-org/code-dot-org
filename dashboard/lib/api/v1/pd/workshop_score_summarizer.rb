require_dependency pegasus_dir('forms/pd_workshop_survey')

module Api::V1::Pd::WorkshopScoreSummarizer
  FACILITATOR_EFFECTIVENESS_QUESTIONS = [
    :how_much_learned_s,
    :how_motivating_s,
    :how_clearly_presented_s,
    :how_interesting_s,
    :how_often_given_feedback_s,
    :how_comfortable_asking_questions_s,
    :how_often_taught_new_things_s
  ].freeze

  TEACHER_ENGAGEMENT_QUESTIONS = [
    :how_much_participated_s,
    :how_often_talk_about_ideas_outside_s,
    :how_often_lost_track_of_time_s,
    :how_excited_before_s,
    :overall_how_interested_s
  ].freeze

  OVERALL_SUCCESS_QUESTIONS = [
    :more_prepared_than_before_s,
    :know_where_to_go_for_help_s,
    :suitable_for_my_experience_s,
    :would_recommend_s,
    :part_of_community_s
  ].freeze

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
  ].freeze

  FREE_RESPONSE_QUESTIONS = [
    :things_facilitator_did_well_s,
    :things_facilitator_could_improve_s,
    :things_you_liked_s,
    :things_you_would_change_s,
    :anything_else_s
  ].freeze

  FACILITATOR_SPECIFIC_QUESTIONS = [
    :how_clearly_presented_s,
    :how_interesting_s,
    :how_often_given_feedback_s,
    :help_quality_s,
    :how_comfortable_asking_questions_s,
    :how_often_taught_new_things_s,
    :things_facilitator_did_well_s,
    :things_facilitator_could_improve_s
  ].freeze

  def get_score_for_workshops(workshops, facilitator_breakdown: false, include_free_responses: false)
    report_rows = Hash.new(0).merge({number_teachers: 0, response_count: 0})

    response_count = 0

    facilitator_scores = nil
    free_responses = Hash.new

    if facilitator_breakdown
      facilitator_scores = Hash.new

      workshops.flat_map(&:facilitators).uniq.each do |facilitator|
        facilitator_scores[facilitator.name] = Hash.new(0)
      end
    end

    if include_free_responses
      FREE_RESPONSE_QUESTIONS.each do |question|
        free_responses[question] = []
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

        survey_response.symbolize_keys.each do |question, answer|
          if answer.is_a? Hash
            # Then "answer" is actually a hash of answers for each
            # facilitator name
            answer.each do |facilitator_name, actual_answer|
              process_response(workshop, report_rows, facilitator_scores, include_free_responses, free_responses, question, actual_answer, facilitator_name)
            end
          else
            process_response(workshop, report_rows, facilitator_scores, include_free_responses, free_responses, question, answer)
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

    FREE_RESPONSE_QUESTIONS.map.each do |question|
      report_rows[question] = free_responses[question]
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

  def process_response(workshop, report_rows, facilitator_scores, include_free_responses, free_responses, question, answer, facilitator_name=nil)
    # if the response is for an individual facilitator, we expect to be
    # getting once such response for each individual facilitator, so
    # weight the score appropriately
    if facilitator_name.nil?
      score_weight = 1
      facilitators = workshop.facilitators
    else
      score_weight = 1.0 / workshop.facilitators.length
      facilitators = workshop.facilitators.select do |facilitator|
        facilitator.name == facilitator_name
      end
    end

    if OVERALL_SUCCESS_QUESTIONS.include?(question)
      score = ::PdWorkshopSurvey::AGREE_SCALE_OPTIONS.index(answer) + 1
    elsif FREE_RESPONSE_QUESTIONS.include?(question)
      # Do nothing - no score to compute but don't skip this
    else
      return unless ::PdWorkshopSurvey::OPTIONS.key?(question) && INDIVIDUAL_RESPONSE_QUESTIONS.include?(question)
      score = get_score_for_response(::PdWorkshopSurvey::OPTIONS, question, answer)
    end

    if FACILITATOR_EFFECTIVENESS_QUESTIONS.include?(question)
      add_score_to_hash(report_rows, :facilitator_effectiveness, facilitators, facilitator_scores, score, score_weight)
    elsif TEACHER_ENGAGEMENT_QUESTIONS.include?(question)
      add_score_to_hash(report_rows, :teacher_engagement, facilitators, facilitator_scores, score, score_weight)
    elsif OVERALL_SUCCESS_QUESTIONS.include?(question)
      add_score_to_hash(report_rows, :overall_success, facilitators, facilitator_scores, score, score_weight)
    end

    if INDIVIDUAL_RESPONSE_QUESTIONS.include?(question)
      add_score_to_hash(report_rows, question, facilitators, facilitator_scores, score, score_weight)
    end

    if include_free_responses && FREE_RESPONSE_QUESTIONS.include?(question)
      free_responses[question].append(answer)
    end
  end

  def get_score_for_response(questions, question, answer)
    questions[question].index(answer) + 1
  end

  def add_score_to_hash(report_rows, key, facilitators, facilitator_scores, score, score_weight)
    report_rows[key] += score * score_weight

    if facilitator_scores
      facilitators.each do |facilitator|
        facilitator_scores[facilitator.name][key] += score
      end
    end
  end
end
