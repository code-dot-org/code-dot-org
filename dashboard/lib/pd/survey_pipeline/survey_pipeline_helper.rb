require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'
require 'pd/survey_pipeline/survey_rollup_decorator.rb'

module Pd::SurveyPipeline::Helper
  include Pd::JotForm::Constants

  QUESTION_CATEGORIES = [
    FACILITATOR_EFFECTIVENESS_CATEGORY = 'facilitator_effectiveness',
    WORKSHOP_OVERALL_SUCCESS_CATEGORY = 'overall_success',
    WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY = 'teacher_engagement'
  ]

  # Summarize facilitator-specific and general workshop results from all workshops
  # that a group of selected facilitators have facilitated.
  #
  # @param workshop [Pd::Workshop]
  # @param current_user [User]
  #
  # @return [Hash]
  #
  def report_rollups(workshop, current_user)
    # Filter list of facilitators that the current user can see.
    facilitator_ids =
      if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [current_user.id]
      end

    # Roll up facilitator-specific results and general workshop results for each facilitator
    reports = {}
    facilitator_ids.each do |facilitator_id|
      reports.deep_merge! report_facilitator_rollup(facilitator_id, workshop)
      reports.deep_merge! report_workshop_rollup(facilitator_id, workshop)
    end

    reports
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
    context = {
      current_workshop_id: workshop.id,
      facilitator_id: facilitator_id,
      question_categories: [FACILITATOR_EFFECTIVENESS_CATEGORY]
    }

    # Retrieve data
    related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)
    context[:related_workshop_ids] = related_ws_ids
    context.merge! retrieve_facilitator_surveys([facilitator_id], related_ws_ids)

    # Process data
    process_rollup_data context
  end

  def report_workshop_rollup(facilitator_id, workshop)
    context = {
      current_workshop_id: workshop.id,
      facilitator_id: facilitator_id,
      question_categories: [WORKSHOP_OVERALL_SUCCESS_CATEGORY, WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY]
    }

    # Retrieve data
    related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)
    context[:related_workshop_ids] = related_ws_ids
    context.merge! retrieve_workshop_surveys(related_ws_ids)

    # Process data
    process_rollup_data context
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
      (hash[:workshop_id] == context[:current_workshop_id]) &&
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

    # Decorate
    Pd::SurveyPipeline::SurveyRollupDecorator.decorate_facilitator_rollup context
  end

  # Summarize all survey results for a workshop.
  #
  # @param workshop [Pd::Workshop]
  # @param current_user [User]
  #
  # @return [Hash]
  #
  def report_single_workshop(workshop, current_user)
    # Centralized context object shared by all workers in the pipeline.
    # Workers read from and write to this object.
    context = {
      current_user: current_user,
      filters: {workshop_ids: workshop.id}
    }

    Pd::SurveyPipeline::DailySurveyRetriever.process_data context
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

  # Retrieve facilitator submissions and survey questions for selected facilitators and workshops.
  #
  # @param facilitator_ids [Array<number>] non-empty list of facilitator ids
  # @param ws_ids [Array<number>] non-empty list of workshop ids
  #
  # @return [Hash{:facilitator_submissions, :survey_questions => Array}]
  #
  # TODO: Move these functions into a Retriever
  #
  def retrieve_facilitator_surveys(facilitator_ids, ws_ids)
    fac_submissions = Pd::WorkshopFacilitatorDailySurvey.where(
      facilitator_id: facilitator_ids, pd_workshop_id: ws_ids
    )
    form_ids = fac_submissions.pluck(:form_id).uniq

    {
      survey_questions: Pd::SurveyQuestion.where(form_id: form_ids),
      facilitator_submissions: fac_submissions
    }
  end

  # Retrieve workshop daily submissions and survey questions for selected workshops.
  #
  # @param ws_ids [Array<number>] non-empty list of workshop ids
  #
  # @return [Hash{:workshop_submissions, :survey_questions => Array}]
  #
  def retrieve_workshop_surveys(ws_ids)
    ws_submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: ws_ids)
    form_ids = ws_submissions.pluck(:form_id).uniq

    {
      survey_questions: Pd::SurveyQuestion.where(form_id: form_ids),
      workshop_submissions: ws_submissions
    }
  end
end
