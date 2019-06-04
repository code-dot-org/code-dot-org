require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'
require 'honeybadger/ruby'

module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter
    include Pd::WorkshopSurveyResultsHelper

    load_and_authorize_resource :workshop, class: 'Pd::Workshop'

    # GET /api/v1/pd/workshops/:id/workshop_survey_report
    def workshop_survey_report
      all_my_workshops = params[:organizer_view] ? Pd::Workshop.organized_by(current_user) : Pd::Workshop.facilitated_by(current_user)
      all_my_completed_workshops = all_my_workshops.where(course: @workshop.course).in_state(Pd::Workshop::STATE_ENDED).exclude_summer

      survey_report = generate_summary_report(
        workshop: @workshop,
        workshops: all_my_completed_workshops,
        course: @workshop.course,
        facilitator_name: facilitator_name_filter
      )

      respond_to do |format|
        format.json do
          render json: survey_report
        end
        format.csv do
          # Kind of lame but we need to do this - Ruby orders hashes based on insertion order. We want to rename the first
          # key, but that's not really supported in a way to preserve insertion order. So we have to make a new hash
          ordered_survey_report = survey_report.transform_keys.with_index {|k, i| i == 0 ? @workshop.friendly_name : k}
          send_as_csv_attachment(convert_to_csv(ordered_survey_report), 'workshop_survey_report.csv', titleize: false)
        end
      end
    end

    # GET /api/v1/pd/workshops/:id/teachercon_survey_report
    def teachercon_survey_report
      unless @workshop.teachercon?
        raise 'Only call this route for teachercons'
      end

      facilitator_name = facilitator_name_filter
      survey_report = Hash.new

      survey_report[:this_teachercon] = summarize_workshop_surveys(
        workshops: [@workshop],
        facilitator_name_filter: current_user.facilitator? && current_user.name
      )
      survey_report[:all_my_teachercons] = summarize_workshop_surveys(
        workshops: Pd::Workshop.where(
          subject: [Pd::Workshop::SUBJECT_CSP_TEACHER_CON, Pd::Workshop::SUBJECT_CSD_TEACHER_CON]
        ).managed_by(current_user).in_state(Pd::Workshop::STATE_ENDED),
        include_free_response: false,
        facilitator_breakdown: false,
        facilitator_name_filter: facilitator_name
      )

      aggregate_for_all_workshops = JSON.parse(
        AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-production")
      )
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[
        @workshop.course == Pd::Workshop::COURSE_CSP ? 'CSP TeacherCon' : 'CSD TeacherCon'
      ]

      survey_report[:facilitator_breakdown] = facilitator_name.nil?
      survey_report[:facilitator_names] = @workshop.facilitators.pluck(:name) if facilitator_name.nil?

      respond_to do |format|
        format.json do
          render json: survey_report
        end
      end
    end

    # GET /api/v1/pd/workshops/:id/local_workshop_survey_report
    def local_workshop_survey_report
      unless @workshop.local_summer?
        raise 'Only call this route for local workshop survey reports'
      end

      facilitator_name = facilitator_name_filter
      survey_report = Hash.new

      survey_report[:this_workshop] = summarize_workshop_surveys(workshops: [@workshop], facilitator_name_filter: facilitator_name)

      survey_report[:all_my_local_workshops] = summarize_workshop_surveys(
        workshops: Pd::Workshop.where(
          subject: @workshop.subject,
          course: @workshop.course
        ).managed_by(current_user).in_state(Pd::Workshop::STATE_ENDED),
        facilitator_breakdown: false,
        facilitator_name_filter: facilitator_name,
        include_free_response: false
      )

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-production"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops['CSP Local Summer Workshops']

      survey_report[:facilitator_breakdown] = facilitator_name.nil?
      survey_report[:facilitator_names] = @workshop.facilitators.pluck(:name) if facilitator_name.nil?

      respond_to do |format|
        format.json do
          render json: survey_report
        end
      end
    end

    # GET /api/v1/pd/workshops/:id/generic_survey_report
    def generic_survey_report
      return local_workshop_daily_survey_report if @workshop.local_summer? || @workshop.teachercon? ||
        ([COURSE_CSP, COURSE_CSD].include?(@workshop.course) &&
        @workshop.workshop_starting_date > Date.new(2018, 8, 1))

      return create_csf_survey_report if @workshop.csf? && @workshop.subject == SUBJECT_CSF_201

      Honeybadger.notify(
        error_message: 'Action generic_survey_report should not be used for this workshop',
        context: {
          workshop_id: @workshop.id,
          course: @workshop.course,
          subject: @workshop.subject
        }
      )

      render status: :bad_request, json: {
        error: "Do not know how to process survey results for this workshop #{@workshop.course} #{@workshop.subject}"
      }
    end

    private

    def local_workshop_daily_survey_report
      survey_report = generate_workshop_daily_session_summary(@workshop)

      respond_to do |format|
        format.json do
          render json: survey_report
        end
      end
    end

    def create_csf_survey_report
      # Retriever
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new workshop_ids: [@workshop.id]

      # Transformers
      parser = Pd::SurveyPipeline::DailySurveyParser
      joiner = Pd::SurveyPipeline::DailySurveyJoiner

      # Mapper + Reducers
      group_config = [:workshop_id, :form_id, :name, :type, :answer_type]

      is_single_select_answer = lambda {|hash| hash.dig(:answer_type) == 'singleSelect'}
      is_free_format_question = lambda {|hash| ['textbox', 'textarea'].include?(hash[:type])}
      is_number_question = lambda {|hash| hash[:type] == 'number'}
      map_config = [
        {condition: is_single_select_answer, field: :answer,
        reducers: [Pd::SurveyPipeline::HistogramReducer]},
        {condition: is_free_format_question, field: :answer,
        reducers: [Pd::SurveyPipeline::NoOpReducer]},
        {condition: is_number_question, field: :answer,
        reducers: [Pd::SurveyPipeline::AvgReducer]},
      ]

      mapper = Pd::SurveyPipeline::GenericMapper.new(
        group_config: group_config, map_config: map_config
      )

      # Decorator
      decorator = Pd::SurveyPipeline::DailySurveyDecorator

      create_generic_survey_report(
        retriever: retriever,
        parser: parser,
        joiner: joiner,
        mappers: [mapper],
        decorator: decorator
      )
    end

    def create_generic_survey_report(retriever:, parser:, joiner:, mappers:, decorator:)
      retrieved_data = retriever.retrieve_data

      parsed_data = parser.transform_data retrieved_data

      joined_data = joiner.transform_data parsed_data

      summary_data = []
      mappers.each do |mapper|
        summary_data += mapper.map_reduce joined_data
      end

      render json: decorator.decorate(summary_data: summary_data, parsed_data: parsed_data)
    end

    # We want to filter facilitator-specific responses if the user is a facilitator and
    # NOT a workshop admin, workshop organizer, or program manager - the filter is the user's name.
    def facilitator_name_filter
      return nil if current_user.workshop_admin? || current_user.workshop_organizer? || current_user.program_manager?
      return current_user.name if current_user.facilitator?

      raise "Unexpected permission for #{current_user.id}. Expected at least one of facilitator, workshop_admin, workshop_organizer, program_manager"
    end
  end
end
