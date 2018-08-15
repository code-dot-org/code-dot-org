class Api::V1::Pd::CourseFacilitatorsController < ApplicationController
  authorize_resource class: 'Pd::CourseFacilitator'

  # GET /api/v1/pd/course_facilitators
  def index
    facilitators = params.has_key?(:course) ? Pd::CourseFacilitator.facilitators_for_course(params.require(:course)) : Pd::CourseFacilitator.all.map(&:facilitator)
    render json: facilitators, each_serializer: Api::V1::Pd::CourseFacilitatorSerializer
  end
end
