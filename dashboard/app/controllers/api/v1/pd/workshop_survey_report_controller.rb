require 'pd/survey_pipeline/survey_pipeline_helper.rb'
require 'honeybadger/ruby'

module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include ::Pd::WorkshopSurveyReportCsvConverter
    include Pd::WorkshopSurveyResultsHelper
    include Pd::SurveyPipeline::Helper
    include Pd::WorkshopSurveyConstants

    load_and_authorize_resource :workshop, class: 'Pd::Workshop'

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
      # 2 separate routes for CSF deep dive (201) workshop and summer/academic year workshop.
      # We don't compute survey result roll-up for CSF deep dive.
      return create_csf_survey_report if @workshop.csf? && @workshop.subject == SUBJECT_CSF_201
      return create_generic_survey_report if [COURSE_CSP, COURSE_CSD].include?(@workshop.course)

      raise 'Action generic_survey_report should not be used for this workshop'
    rescue => e
      notify_error e
    end

    # GET /api/v1/pd/workshops/experiment_survey_report/:id/
    def experiment_survey_report
      render json: {experiment: true}
    rescue => e
      notify_error e
    end

    private

    def create_csf_survey_report
      render json: report_single_workshop(@workshop, current_user)
    end

    def create_generic_survey_report
      this_ws_report = report_single_workshop(@workshop, current_user)
      rollup_report = report_rollups(@workshop, current_user)

      render json: this_ws_report.merge(rollup_report)
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
