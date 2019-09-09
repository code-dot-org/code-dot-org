require 'pd/survey_pipeline/survey_pipeline_helper.rb'
require 'honeybadger/ruby'

module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter
    include Pd::WorkshopSurveyResultsHelper
    include Pd::SurveyPipeline::Helper

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
      # 3 separate routes for summer workshop, CSF deep dive (201) workshop, and academic year
      # workshop. Eventually we want summer workshop to use the same route as academic year workshop.
      # CSF intro should not use this controller action.
      return local_workshop_daily_survey_report if @workshop.summer?
      return create_csf_survey_report if @workshop.csf? && @workshop.subject == SUBJECT_CSF_201
      return create_generic_survey_report if [COURSE_CSP, COURSE_CSD].include?(@workshop.course)

      raise 'Action generic_survey_report should not be used for this workshop'
    rescue => e
      notify_error e
    end

    # GET /api/v1/pd/workshops/experiment_survey_report/:id/
    def experiment_survey_report
      create_generic_survey_report
    rescue => e
      notify_error e
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
      render json: report_single_workshop(@workshop, current_user)
    end

    def create_generic_survey_report
      this_ws_report = report_single_workshop(@workshop, current_user)
      rollup_report = report_rollups(@workshop, current_user)

      render json: this_ws_report.merge(rollup_report).merge(experiment: true)
    end

    def notify_error(exception, error_status_code = :bad_request)
      Honeybadger.notify(
        exception,
        context: {
          workshop_id: @workshop.id,
          course: @workshop.course,
          subject: @workshop.subject
        }
      )

      render status: error_status_code, json: {
        errors: [
          {
            severity: Logger::Severity::ERROR,
            message: "#{exception.message}. First backtrace: #{exception.backtrace.first}."\
              " Workshop id: #{@workshop.id}, course: #{@workshop.course}, subject: #{@workshop.subject}."
          }
        ]
      }
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
