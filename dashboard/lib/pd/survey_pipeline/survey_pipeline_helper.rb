require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline::Helper
  def report_single_workshop(workshop, current_user)
    # Fields used to group survey answers
    group_config = [:workshop_id, :form_id, :facilitator_id, :name, :type, :answer_type]

    # Rules to map groups of survey answers to reducers
    is_single_select_answer = lambda {|hash| hash.dig(:answer_type) == 'singleSelect'}
    is_free_format_question = lambda {|hash| ['textbox', 'textarea'].include?(hash[:type])}

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
      }
    ]

    # Centralized context object shared by all workers in the pipeline.
    # Workers read from and write to this object.
    context = {
      current_user: current_user,
      filters: {workshop_ids: @workshop.id}
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
