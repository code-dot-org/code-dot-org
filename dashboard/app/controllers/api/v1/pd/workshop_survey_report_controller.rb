module Api::V1::Pd
  class WorkshopSurveyReportController < ReportControllerBase
    include WorkshopScoreSummarizer
    include ::Pd::WorkshopSurveyReportCsvConverter
    include Pd::WorkshopSurveyResultsHelper

    load_and_authorize_resource :workshop, class: 'Pd::Workshop'

    # GET /api/v1/pd/workshops/:id/workshop_survey_report
    def workshop_survey_report
      survey_report = Hash.new

      survey_report[:this_workshop] = get_score_for_workshops([@workshop], include_free_responses: true)
      all_my_workshops = (params[:organizer_view] ? Pd::Workshop.organized_by(current_user) : Pd::Workshop.facilitated_by(current_user)).where(course: @workshop.course).in_state(Pd::Workshop::STATE_ENDED)
      survey_report[:all_my_workshops_for_course] = get_score_for_workshops(all_my_workshops)

      aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
      survey_report[:all_workshops_for_course] = aggregate_for_all_workshops[@workshop.course].symbolize_keys

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

      survey_report = Hash.new

      survey_report[:this_teachercon] = summarize_workshop_surveys(workshops: @workshop)
      survey_report[:all_my_teachercons] = summarize_workshop_surveys(
        workshops: Pd::Workshop.where(subject: [SUBJECT_CSP_TEACHER_CON, SUBJECT_CSD_TEACHER_CON]).facilitated_by(current_user).flat_map(&:survey_responses)
      )

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

      facilitator_name = current_user.facilitator? ? current_user.name : nil
      survey_report = Hash.new

      survey_report[:facilitator_breakdown] = facilitator_name.nil?
      survey_report[:facilitator_names] = @workshop.facilitators.map(&:name) if facilitator_name.nil?

      survey_report[:this_workshop] = summarize_workshop_surveys(workshops: [@workshop], facilitator_name: facilitator_name)

      if current_user.facilitator?
        survey_report[:all_my_local_workshops] = summarize_workshop_surveys(
          workshops: Pd::Workshop.where(
            subject: @workshop.subject,
            course: @workshop.course
          ).facilitated_by(current_user),
          facilitator_name: facilitator_name
        )
      elsif current_user.workshop_organizer?
        survey_report[:all_my_local_workshops] = summarize_workshop_surveys(
          workshops: Pd::Workshop.where(
            subject: @workshop.subject,
            course: @workshop.course
          ).organized_by(current_user),
          facilitator_breakdown: false
        )
      else
        survey_report[:all_my_local_workshops] = {}
      end

      respond_to do |format|
        format.json do
          render json: survey_report
        end
      end
    end
  end
end
