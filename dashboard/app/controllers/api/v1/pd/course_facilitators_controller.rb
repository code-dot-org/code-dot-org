class Api::V1::Pd::CourseFacilitatorsController < ApplicationController
  authorize_resource class: 'Pd::CourseFacilitator'

  # GET /api/v1/pd/course_facilitators
  def index
    course = params.require(:course)
    facilitators = Pd::CourseFacilitator.facilitators_for_course course
    render json: facilitators, each_serializer: Api::V1::Pd::CourseFacilitatorSerializer
  end
end
