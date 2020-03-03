module Pd::SurveyPipeline::Foorm::Helper
  # Summarize all survey results for a workshop.
  #
  # @param workshop [Pd::Workshop]
  # @param current_user [User]
  # @return [Hash]
  #
  def report_single_workshop(workshop, current_user)
    # Centralized context object shared by all workers in the pipeline.
    # Workers read from and write to this object.
    context = {current_user: current_user}

    context[:foorm_forms], context[:foorm_submissions], context[:workshop_survey_foorm_submissions] =
      Pd::SurveyPipeline::Foorm::DailySurveyRetriever.retrieve_all_workshop_surveys workshop.id

    # need new parser
    Pd::SurveyPipeline::DailySurveyParser.process_data context
    Pd::SurveyPipeline::DailySurveyJoiner.process_data context

    # Fields used to group survey answers
    group_config = [:workshop_id, :day, :facilitator_id, :form_id, :name, :type, :answer_type]

    # Rules to map groups of survey answers to reducers
    is_single_select_answer =
      lambda {|hash| [ANSWER_SINGLE_SELECT, ANSWER_SCALE].include? hash.dig(:answer_type)}
    not_single_select_answer =
      lambda {|hash| ![ANSWER_SINGLE_SELECT, ANSWER_SCALE].include?(hash.dig(:answer_type))}

    map_config = [
      {condition: is_single_select_answer, field: :answer, reducers: [Pd::SurveyPipeline::HistogramReducer]},
      {condition: not_single_select_answer, field: :answer, reducers: [Pd::SurveyPipeline::NoOpReducer]}
    ]

    Pd::SurveyPipeline::GenericMapper.
      new(group_config: group_config, map_config: map_config).
      process_data(context)

    Pd::SurveyPipeline::DailySurveyModifier.augment_questions_for_display context[:parsed_questions]

    Pd::SurveyPipeline::DailySurveyDecorator.decorate_single_workshop context
  end
end
