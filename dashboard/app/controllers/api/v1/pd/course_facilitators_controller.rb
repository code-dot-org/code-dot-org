class Api::V1::Pd::CourseFacilitatorsController < ApplicationController
  authorize_resource class: 'Pd::CourseFacilitator'

  # GET /api/v1/pd/course_facilitators
  def index
    facilitators =
      if params.key?(:course)
        Pd::CourseFacilitator.facilitators_for_course(
          params.require(:course)
        )
      elsif params.key?(:course_offerings)
        Pd::CourseFacilitator.facilitators_for_course_offerings(
          Array(params.require(:course_offerings))
        )
      else
        Pd::CourseFacilitator.all_facilitators
      end

    render json: facilitators, each_serializer: Api::V1::Pd::CourseFacilitatorSerializer
  rescue Pd::CourseFacilitator::InvalidCourseOfferingIdError => exception
    render json: {error: exception.message}, status: :bad_request
  end
end
