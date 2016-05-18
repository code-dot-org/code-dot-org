class Api::V1::Pd::WorkshopEnrollmentsController < ::ApplicationController
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops/1/enrollments
  def index
    render json: @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentSerializer
  end
end
