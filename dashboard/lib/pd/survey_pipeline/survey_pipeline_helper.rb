require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'
require 'pd/survey_pipeline/survey_rollup_decorator.rb'

module Pd::SurveyPipeline::Helper
  QUESTION_CATEGORIES = [
    FACILITATOR_EFFECTIVENESS_CATEGORY = 'facilitator_effectiveness',
    WORKSHOP_OVERALL_SUCCESS_CATEGORY = 'overall_success',
    WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY = 'teacher_engagement'
  ]

  # Summarize all survey results for a workshop as viewed by a specific user.
  #
  # @param workshop [Pd::Workshop]
  # @param user [User]
  #
  # @return [Hash]
  #
  def report_single_workshop(workshop, user)
    questions, ws_submissions, facilitator_submissions =
      Pd::SurveyPipeline::DailySurveyRetriever.retrieve_surveys_by_workshop_and_form [workshop.id]

    parsed_questions = Pd::SurveyPipeline::DailySurveyParser.parse_questions questions
    parsed_submissions =
      Pd::SurveyPipeline::DailySurveyParser.parse_submissions(ws_submissions + facilitator_submissions)

    question_answer_joined =
      Pd::SurveyPipeline::DailySurveyJoiner.join_question_submission parsed_questions, parsed_submissions

    group_keys = [:workshop_id, :day, :facilitator_id, :form_id, :name, :type, :answer_type]
    question_answer_groups =
      Pd::SurveyPipeline::GenericMapper.group_data question_answer_joined, group_keys

    map_config = Pd::SurveyPipeline::GenericMapper.get_default_map_config
    summaries, errors =
      Pd::SurveyPipeline::GenericMapper.map_groups_to_reducers question_answer_groups, map_config

    single_workshop_report =
      Pd::SurveyPipeline::DailySurveyDecorator.decorate_single_workshop_results(
        summaries, parsed_questions, parsed_submissions, user, errors
      )

    single_workshop_report
  end

  # Summarize facilitator-specific and general workshop results from all workshops
  # that a group of selected facilitators have facilitated.
  #
  # @param workshop [Pd::Workshop]
  # @param user [User]
  #
  # @return [Hash]
  #
  def report_rollups(workshop, user)
    # Filter list of facilitators that the current user can see.
    facilitator_ids =
      if user.program_manager? || user.workshop_organizer? || user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [user.id]
      end

    # Roll up facilitator-specific results and general workshop results for each facilitator
    results = {}
    facilitator_ids.each do |facilitator_id|
      results.deep_merge! report_facilitator_rollup(facilitator_id, workshop)
      results.deep_merge! report_workshop_rollup(facilitator_id, workshop)
    end

    results
  end

  # Summarize facilitator-specific results from all related workshops
  # that a facilitator have facilitated.
  #
  # @param facilitator_id [Number] a valid user id
  # @param workshop [Pd::Workshop] a valid workshop
  #
  # @return [Hash{:facilitators, :facilitator_response_counts, :facilitator_averages, :errors => Hash, Array}]
  #   facilitators: {facilitator_id => fac_name}
  #   facilitator_response_counts: {this_workshop, all_my_workshops => {facilitator_id => count}}
  #   facilitator_averages: {
  #     fac_name => {qcategory, qname => {this_workshop, all_my_workshops => score}},
  #     questions => {qname => qtext}
  #    }
  #   errors: Array
  #
  def report_facilitator_rollup(facilitator_id, workshop)
    related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)

    questions, submissions =
      Pd::SurveyPipeline::DailySurveyRetriever.retrieve_facilitator_surveys(
        [facilitator_id], related_ws_ids
      )

    parsed_questions = Pd::SurveyPipeline::DailySurveyParser.parse_questions questions
    parsed_submissions =
      Pd::SurveyPipeline::DailySurveyParser.parse_submissions submissions

    question_answer_joined =
      Pd::SurveyPipeline::DailySurveyJoiner.join_question_submission parsed_questions, parsed_submissions

    Pd::SurveyPipeline::Modifier.convert_answer_strings_to_numbers question_answer_joined

    # Summarize all-workshop results
    group_keys_all_ws = [:name, :type, :answer_type]
    question_answer_groups_all_ws =
      Pd::SurveyPipeline::GenericMapper.group_data question_answer_joined, group_keys_all_ws

    map_config_all_ws = [{
      condition: lambda do |hash|
        hash[:name]&.start_with? FACILITATOR_EFFECTIVENESS_CATEGORY
      end,
      field: :answer_to_number,
      reducers: [Pd::SurveyPipeline::AvgReducer]
    }]
    summaries_all_ws, errors_all_ws =
      Pd::SurveyPipeline::GenericMapper.map_groups_to_reducers question_answer_groups_all_ws, map_config_all_ws

    # Summarize single selected workshop results
    group_keys_this_ws = [:workshop_id, :name, :type, :answer_type]
    question_answer_groups_this_ws =
      Pd::SurveyPipeline::GenericMapper.group_data question_answer_joined, group_keys_this_ws

    map_config_this_ws = [{
      condition: lambda do |hash|
        (hash[:workshop_id] == workshop.id) && hash[:name]&.start_with?(FACILITATOR_EFFECTIVENESS_CATEGORY)
      end,
      field: :answer_to_number,
      reducers: [Pd::SurveyPipeline::AvgReducer]
    }]
    summaries_this_ws, errors_this_ws =
      Pd::SurveyPipeline::GenericMapper.map_groups_to_reducers question_answer_groups_this_ws, map_config_this_ws

    # TODO: remove this return
    [summaries_all_ws + summaries_this_ws, errors_all_ws + errors_this_ws]

    # TODO: decorate result
    # summaries_all_ws + summaries_this_ws, errors_all_ws + errors_this_ws
    # Pd::SurveyPipeline::FacilitatorSurveyRollupDecorator.process_data context
  end

  # def report_facilitator_rollup(facilitator_id, workshop)
  #   context = {
  #     current_workshop_id: workshop.id,
  #     facilitator_id: facilitator_id,
  #     question_categories: [FACILITATOR_EFFECTIVENESS_CATEGORY],
  #     submission_type: 'Facilitator'
  #   }
  #
  #   # Retrieve data
  #   related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)
  #   context[:related_workshop_ids] = related_ws_ids
  #   context.merge! retrieve_facilitator_surveys([facilitator_id], related_ws_ids)
  #
  #   # Process data
  #   process_rollup_data context
  #
  #   # Decorate
  #   Pd::SurveyPipeline::FacilitatorSurveyRollupDecorator.process_data context
  #
  #   context[:decorated_summaries]
  # end

  def report_workshop_rollup(facilitator_id, workshop)
    context = {
      current_workshop_id: workshop.id,
      facilitator_id: facilitator_id,
      question_categories: [WORKSHOP_OVERALL_SUCCESS_CATEGORY, WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY],
      submission_type: 'Workshop'
    }

    # Retrieve data
    related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)
    context[:related_workshop_ids] = related_ws_ids
    context.merge! retrieve_workshop_surveys(related_ws_ids)

    # Process data
    process_rollup_data context

    # Decorate
    Pd::SurveyPipeline::WorkshopSurveyRollupDecorator.process_data context

    context[:decorated_summaries]
  end

  def process_rollup_data(context)
    # Transform data
    Pd::SurveyPipeline::DailySurveyParser.process_data context
    Pd::SurveyPipeline::DailySurveyJoiner.process_data context

    # Convert string answers to numbers
    context[:question_answer_joined].each do |qa|
      if qa.dig(:option_map, qa[:answer])
        qa[:answer_to_number] = qa[:option_map][qa[:answer]]
      end
    end

    # Mapper + Reducer
    # Summarize results for all workshops
    group_config_all_ws = [:name, :type, :answer_type]

    is_selected_question_all_ws = lambda do |hash|
      context[:question_categories].any? {|category| hash[:name]&.start_with? category}
    end

    map_config_all_ws = [
      {
        condition: is_selected_question_all_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]

    Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_all_ws, map_config: map_config_all_ws
    ).process_data context

    # Summarize results for the current workshop
    group_config_this_ws = [:workshop_id, :name, :type, :answer_type]

    is_selected_question_this_ws = lambda do |hash|
      hash[:workshop_id] == context[:current_workshop_id] &&
      context[:question_categories].any? {|category| hash[:name]&.start_with? category}
    end

    map_config_this_ws = [
      {
        condition: is_selected_question_this_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]

    Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_this_ws, map_config: map_config_this_ws
    ).process_data context
  end

  private

  # Find all workshops of the same course and facilitated by a facilitator.
  #
  # @param facilitator_id [Number] valid facilitator id
  # @param course [String] valid course name
  #
  # @return [Array<Number>] list of workshop ids
  #
  def find_related_workshop_ids(facilitator_id, course)
    return [] unless facilitator_id && course.present?

    Pd::Workshop.left_outer_joins(:facilitators).
      where(users: {id: facilitator_id}, course: course).
      distinct.
      pluck(:id)
  end
end
