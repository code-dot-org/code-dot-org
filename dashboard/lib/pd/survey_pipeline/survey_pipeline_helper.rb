require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline::Helper
  def summarize_facilitator_rollup(workshop, current_user)
    # TODO: move all these data-retrieving logic into a retriever class to test
    # Get list of facilitators based on current user permissions
    # PM can see all. Facilitator can only see himself
    # (ws_id, u_id) -> (fac_ids)
    fac_ids =
      if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [current_user.id]
      end

    # Get list of related workshops to those facilitators. Related = same course
    # (ws_id, fac_ids) -> (ws_ids)
    # Join pd_workshops_facilitators to pd_workshop
    ws_facilitated_query =
      "SELECT DISTINCT pd_workshop_id FROM pd_workshops_facilitators "\
      "WHERE user_id IN (#{fac_ids.join(',')})"
    ws_facilitated = ActiveRecord::Base.connection.exec_query(ws_facilitated_query).rows.flatten
    ws_ids = Pd::Workshop.where(id: ws_facilitated, course: workshop.course).pluck(:id)

    # Retrive data
    # (fac_ids, ws_ids) -> FacilitatorDailySurvey(s) + SurveyQuestion(s)
    fac_submissions = Pd::WorkshopFacilitatorDailySurvey.where(facilitator_id: fac_ids, pd_workshop_id: ws_ids)

    form_ids = fac_submissions.pluck(:form_id).uniq
    questions = form_ids.empty? ? [] : Pd::SurveyQuestion.where(form_id: form_ids)

    context = {
      current_user: current_user,
      survey_questions: questions,
      facilitator_submissions: fac_submissions,
      workshop_submissions: []
    }

    # Configure 2 mappers: 1 for current workshop, 1 for all workshops
    group_config_this = [:workshop_id, :facilitator_id, :name, :type, :answer_type]
    is_current_workshop = lambda {|hash| hash[:workshop_id] == workshop.id}
    map_config = [
      {
        # TODO: condition = selected questions + selected workshop
        condition: is_current_workshop,
        field: :answer,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]

    group_config_all = [:facilitator_id, :name, :type, :answer_type]

    # Start the assembly line
    workers = [
      Pd::SurveyPipeline::DailySurveyParser,
      Pd::SurveyPipeline::DailySurveyJoiner,
      Pd::SurveyPipeline::GenericMapper.new(
        group_config: group_config_this, map_config: map_config
      ),
      Pd::SurveyPipeline::GenericMapper.new(
        group_config: group_config_all, map_config: map_config
      )
      # ,Pd::SurveyPipeline::DailySurveyDecorator
    ]

    create_generic_survey_report context, workers

    return context[:summaries]

    # Decorate (put data in the right place) in final results
    # return context[:decorated_summaries]
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
      Pd::SurveyPipeline::DailySurveyDecorator
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
