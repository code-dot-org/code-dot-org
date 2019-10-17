require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline::Helper
  include Pd::JotForm::Constants

  QUESTION_CATEGORIES = [
    FACILITATOR_EFFECTIVENESS_CATEGORY = 'facilitator_effectiveness',
    WORKSHOP_OVERALL_SUCCESS_CATEGORY = 'overall_success',
    WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY = 'teacher_engagement'
  ]

  # Roll up facilitator-specific and general workshop survey results from all related workshops.
  # @note This function will replace report_rollups function.
  #
  # @param workshop [Pd::Workshop] the workshop user selects, which is used to find related workshops
  # @param current_user [User] the user requesting survey report
  # @return [Hash] {:workshopRollups, :facilitatorRollups => rollup_content}
  # @see SurveyRollupDecoratorExperiment.decorate_facilitator_rollup for data structure of rollup_content
  #
  def report_rollups_experiment(workshop, current_user)
    # Get list of facilitators this user can see
    facilitator_ids =
      if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [current_user.id]
      end

    # Roll up facilitator-specific and general workshop results
    reports = {facilitator_rollups: {}, workshop_rollups: {}}

    facilitator_ids.each do |fid|
      reports[:facilitator_rollups].deep_merge! report_facilitator_rollup_experiment(fid, workshop, true)
      reports[:workshop_rollups].deep_merge! report_facilitator_rollup_experiment(fid, workshop, false)

      # TODO: report_partner_rollup()
      # TODO: report_cdo_rollup()
    end

    reports
  end

  # Summarize facilitator-specific results from all related workshops a facilitator have facilitated.
  # @note This function will replace both report_facilitator_rollup and report_workshop_rollup functions.
  #
  # @param facilitator_id [Integer]
  # @param workshop [Pd::Workshop]
  # @param only_facilitator_questions [Boolean]
  # @return [Hash]
  #
  def report_facilitator_rollup_experiment(facilitator_id, workshop, only_facilitator_questions)
    context = {
      current_workshop_id: workshop.id,
      facilitator_id: facilitator_id,
    }

    context[:question_categories] = only_facilitator_questions ?
      [FACILITATOR_EFFECTIVENESS_CATEGORY] :
      [WORKSHOP_OVERALL_SUCCESS_CATEGORY, WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY]

    related_ws_ids = find_related_workshop_ids(facilitator_id, workshop.course)
    context[:related_workshop_ids] = related_ws_ids

    # Retrieve data
    context.merge!(only_facilitator_questions ?
      retrieve_facilitator_surveys([facilitator_id], related_ws_ids) :
      retrieve_workshop_surveys(related_ws_ids)
    )

    # Process data
    process_rollup_data context

    # Decorate
    Pd::SurveyPipeline::SurveyRollupDecoratorExperiment.decorate_facilitator_rollup(
      context, only_facilitator_questions
    )
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
  end

  # Summarize all survey results for a workshop.
  #
  # @param workshop [Pd::Workshop]
  # @param current_user [User]
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
