class CourseOfferingsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def edit
    @course_offering = CourseOffering.find_by!(key: params[:key])
    render :not_found unless @course_offering
  end

  def update
    @course_offering = CourseOffering.find_by!(key: params[:key])
    @course_offering.update!(course_offering_params)

    if Rails.application.config.levelbuilder_mode
      @course_offering.write_serialization
    end

    render json: @course_offering.summarize_for_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
    render(status: :not_acceptable, plain: e.message)
  end

  def quick_assign_course_offerings
    offerings = {}

    offerings[:elementary] = {
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.course => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.csf => [
          CourseOffering.find_by_key('coursea').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('courseb').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('coursec').summarize_for_quick_assign(current_user, request.locale)
        ],
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.express => [
          CourseOffering.find_by_key('express').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('pre-express').summarize_for_quick_assign(current_user, request.locale)
        ]
      },
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.module => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.csc => [
          CourseOffering.find_by_key('poetry').summarize_for_quick_assign(current_user, request.locale)
        ]
      }
    }

    offerings[:middle] = {
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.course => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.express => [
          CourseOffering.find_by_key('express').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('pre-express').summarize_for_quick_assign(current_user, request.locale)
        ],
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.year_long => [
          CourseOffering.find_by_key('csd').summarize_for_quick_assign(current_user, request.locale)
        ]
      },
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.standalone_unit => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.self_paced => [
          CourseOffering.find_by_key('csd3-virtual').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('csp3-virtual').summarize_for_quick_assign(current_user, request.locale)
        ],
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.teacher_led => [
          CourseOffering.find_by_key('aiml').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('devices').summarize_for_quick_assign(current_user, request.locale)
        ]
      }
    }

    offerings[:high] = {
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.course => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.year_long => [
          CourseOffering.find_by_key('csa').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('csd').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('csp').summarize_for_quick_assign(current_user, request.locale)
        ]
      },
      Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.standalone_unit => {
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.csa_labs => [
          CourseOffering.find_by_key('csa-collegeboard-labs').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('csa-data-lab').summarize_for_quick_assign(current_user, request.locale)
        ],
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.self_paced => [
          CourseOffering.find_by_key('csd3-virtual').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('csp3-virtual').summarize_for_quick_assign(current_user, request.locale)
        ],
        Curriculum::SharedCourseConstants::COURSE_OFFERING_HEADERS.teacher_led => [
          CourseOffering.find_by_key('aiml').summarize_for_quick_assign(current_user, request.locale),
          CourseOffering.find_by_key('devices').summarize_for_quick_assign(current_user, request.locale)
        ]
      }
    }

    render :ok, json: offerings.to_json
  end

  private

  def course_offering_params
    params.permit(:display_name, :is_featured, :category, :assignable, :grade_levels, :curriculum_type, :header, :marketing_initiative).to_h
  end
end
