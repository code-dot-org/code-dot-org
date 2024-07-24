class CourseOfferingsController < ApplicationController
  load_and_authorize_resource except: [:quick_assign_course_offerings, :self_paced_pl_course_offerings]

  before_action :require_levelbuilder_mode, except: [:quick_assign_course_offerings, :self_paced_pl_course_offerings]
  before_action :authenticate_user!

  def edit
    @course_offering = CourseOffering.find_by!(key: params[:key])
    @self_paced_pl_course_offerings = CourseOffering.professional_learning_and_self_paced_course_offerings
    @professional_learning_program_paths = CourseOffering::PROFESSIONAL_LEARNING_PROGRAM_PATHS
    @videos = Video.videos_for_course_offering_editor
    render :not_found unless @course_offering
  end

  def update
    @course_offering = CourseOffering.find_by!(key: params[:key])
    @course_offering.update!(course_offering_params)

    if Rails.application.config.levelbuilder_mode
      @course_offering.write_serialization
    end

    render json: @course_offering.summarize_for_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => exception
    render(status: :not_acceptable, plain: exception.message)
  end

  def quick_assign_course_offerings
    return head :forbidden unless current_user

    participant_type = params[:participantType]
    return head :bad_request unless participant_type

    offerings = QuickAssignHelper.course_offerings(current_user, request.locale, participant_type)
    render :ok, json: offerings.to_json
  end

  def self_paced_pl_course_offerings
    return head :bad_request unless current_user
    offerings = CourseOffering.assignable_course_offerings(current_user).filter do |co|
      co.get_participant_audience == 'teacher' && co.any_version_is_in_published_state? && co.instruction_type == 'self_paced' && co.header.present?
    end
    render :ok, json: offerings&.map(&:summarize_self_paced_pl).to_json
  end

  private def course_offering_params
    params.permit(:display_name, :is_featured, :assignable, :grade_levels, :curriculum_type, :header, :marketing_initiative, :image, :cs_topic, :school_subject, :device_compatibility, :description, :professional_learning_program, :self_paced_pl_course_offering_id, :video, :published_date).to_h
  end
end
