class Api::V1::Pd::CourseFacilitatorsController < ApplicationController
  authorize_resource class: 'Pd::CourseFacilitator'

  # GET /api/v1/pd/course_facilitators
  def index
    facilitators =
      if params.key?(:course)
        Pd::CourseFacilitator.facilitators_for_course(params.require(:course))
      else
        Pd::CourseFacilitator.all.map(&:facilitator)
      end

    render json: facilitators, each_serializer: Api::V1::Pd::CourseFacilitatorSerializer, adapter: :attributes
  end
end
