require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline::Helper
  def retrieve_facilicator_surveys(fac_ids, course, logger = nil)
    logger&.debug "fac_ids = #{fac_ids}"

    # Get list of related workshops to those facilitators. Related = same course
    # (ws_id, fac_ids) -> (ws_ids)
    # Join pd_workshops_facilitators to pd_workshop
    ws_facilitated_query =
      "SELECT DISTINCT pd_workshop_id FROM pd_workshops_facilitators "\
      "WHERE user_id IN (#{fac_ids.join(',')})"

    ws_facilitated = ActiveRecord::Base.connection.exec_query(ws_facilitated_query).rows.flatten
    ws_ids = Pd::Workshop.where(id: ws_facilitated, course: course).pluck(:id)

    logger&.debug "ws_facilitated = #{ws_facilitated}"
    logger&.debug "ws_ids = #{ws_ids}"

    # Retrive data
    # (fac_ids, ws_ids) -> FacilitatorDailySurvey(s) + SurveyQuestion(s)
    fac_submissions = Pd::WorkshopFacilitatorDailySurvey.where(facilitator_id: fac_ids, pd_workshop_id: ws_ids)
    form_ids = fac_submissions.pluck(:form_id).uniq
    questions = form_ids.empty? ? [] : Pd::SurveyQuestion.where(form_id: form_ids)

    logger&.debug "form_ids = #{form_ids.inspect}"

    {
      survey_questions: questions,
      facilitator_submissions: fac_submissions,
      workshop_submissions: []
    }
  end

  def summarize_facilitator_rollup(workshop, current_user, logger = nil)
    # Get list of facilitators based on current user permissions
    # PM can see all. Facilitator can only see himself. (ws_id, u_id) -> (fac_ids)
    fac_ids =
      if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [current_user.id]
      end

    context = {
      current_user: current_user,
      current_workshop: workshop,
      facilitator_ids: fac_ids
    }
    logger&.info "context[facilitator_ids] = #{context[:facilitator_ids]}"

    # Retriever
    # TODO: empty fac_ids
    context.merge! retrieve_facilicator_surveys(fac_ids, workshop.course)
    logger&.info "context[survey_questions].count = #{context[:survey_questions].count}"
    logger&.info "context[facilitator_submissions].count = #{context[:facilitator_submissions].count}"
    logger&.debug "context[survey_questions] = #{context[:survey_questions].inspect}"
    logger&.debug "context[facilitator_submissions] = #{context[:facilitator_submissions].inspect}"

    # Parser
    Pd::SurveyPipeline::DailySurveyParser.process_data context
    logger&.info "context[parsed_questions].count = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[parsed_submissions] = #{context[:parsed_submissions]}"

    # Joiner
    Pd::SurveyPipeline::DailySurveyJoiner.process_data context
    logger&.info "context[question_answer_joined].count = #{context[:question_answer_joined].count}"
    logger&.info "context[parsed_questions].count after transform = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count after transform = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[question_answer_joined] = #{context[:question_answer_joined]}"

    # Convert string answer to number
    # TODO: move to Parser? or Modifier. Move all
    context[:question_answer_joined].each do |qa|
      if qa.dig(:option_map, qa[:answer])
        qa[:answer_to_number] = qa[:option_map][qa[:answer]]
      end
    end

    # Mapper + Reducer
    # Configure 2 mappers: 1 for current workshop, 1 for all workshops
    group_config_all = [:facilitator_id, :name, :type, :answer_type]
    group_config_this = [:workshop_id, :facilitator_id, :name, :type, :answer_type]

    # TODO: condition = selected questions + selected workshop
    is_current_workshop = lambda {|hash| hash[:workshop_id] == workshop.id}
    map_config = [
      {
        condition: is_current_workshop,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]

    mapper_all = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_all, map_config: map_config
    )
    mapper_all.process_data context

    mapper_this = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_this, map_config: map_config
    )
    mapper_this.process_data context

    logger&.info "context[:summaries].count = #{context[:summaries].count}"
    logger&.debug "context[:summaries] = #{context[:summaries].inspect}"
    logger&.info "context[:errors].count = #{context[:errors].count}"
    logger&.debug "context[:errors] = #{context[:errors].inspect}"

    # Decorate first time
    context[:summaries]

    # Decorate
    Pd::SurveyPipeline::FacilitatorRollupResultDecorator.process_data context

    logger&.info "context[:decorated_summaries].count = #{print_kv_count(context[:decorated_summaries])}"
    logger&.debug "context[:decorated_summaries] = #{context[:decorated_summaries].inspect}"
    logger&.debug "context = #{context}"

    context[:decorated_summaries]
  end

  def summarize_this_workshop(workshop, current_user)
    # Fields used to group survey answers
    group_config = [:workshop_id, :form_id, :facilitator_id, :name, :type, :answer_type]

    is_single_select_answer = lambda {|hash| hash[:answer_type] == 'singleSelect'}
    is_free_format_question = lambda {|hash| ['textbox', 'textarea'].include?(hash[:type])}
    is_number_question = lambda {|hash| hash[:type] == 'number'}

    # Rules to map groups of survey answers to reducers
    map_config = [
      {
        condition: is_single_select_answer,
        field: :answer,
        reducers: [Pd::SurveyPipeline::HistogramReducer]
      },
      {
        condition: is_free_format_question,
        field: :answer,
        reducers: [Pd::SurveyPipeline::NoOpReducer]
      },
      {
        condition: is_number_question,
        field: :answer,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      },
    ]

    # Centralized context object shared by all workers in the pipeline.
    # Workers read from and write to this object.
    context = {
      current_user: current_user,
      filters: {workshop_ids: workshop.id}
    }

    # Assembly line to summarize CSF surveys
    workers = [
      Pd::SurveyPipeline::DailySurveyRetriever,
      Pd::SurveyPipeline::DailySurveyParser,
      Pd::SurveyPipeline::DailySurveyJoiner,
      Pd::SurveyPipeline::GenericMapper.new(
        group_config: group_config, map_config: map_config
      ),
      Pd::SurveyPipeline::SingleWorkshopResultDecorator
    ]

    create_generic_survey_report context, workers

    context[:decorated_summaries]
  end

  # Create survey report by having a group of workers process data in the same context.
  def create_generic_survey_report(context, workers)
    workers&.each do |w|
      w.process_data context
    end
  end
end
