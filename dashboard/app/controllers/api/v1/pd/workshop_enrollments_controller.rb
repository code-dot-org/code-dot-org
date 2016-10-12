require 'controllers/api/csv_download'
class Api::V1::Pd::WorkshopEnrollmentsController < ApplicationController
  include CsvDownload
  load_and_authorize_resource :workshop, class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops/1/enrollments
  def index
    response = render_to_json @workshop.enrollments, each_serializer: Api::V1::Pd::WorkshopEnrollmentSerializer

    respond_to do |format|
      format.json do
        render json: response
      end
      format.csv do
        send_as_csv_attachment response, 'workshop_enrollments.csv'
      end
    end
  end

  # DELETE /api/v1/pd/workshops/1/enrollments/1
  def destroy
    enrollment = @workshop.enrollments.find_by(id: params[:id])
    enrollment.destroy! if enrollment
    head :no_content
  end
end
