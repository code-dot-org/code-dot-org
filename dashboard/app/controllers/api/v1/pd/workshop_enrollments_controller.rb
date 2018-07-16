class Api::V1::Pd::WorkshopEnrollmentsController < ApplicationController
  include Api::CsvDownload
  load_and_authorize_resource :workshop, class: 'Pd::Workshop', except: 'create'

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

  # POST /api/v1/pd/workshops/1/enrollments
  def create
    p "made it to create"
    # if @workshop.nil?  -> 404

    # enrollment_email = enrollment_params[:email]
    # user = User.find_by_email_or_hashed_email enrollment_email

    # # See if a previous enrollment exists for this email
    # previous_enrollment = @workshop.enrollments.find_by(email: enrollment_email)
    # if previous_enrollment
    #   # @cancel_url = url_for action: :cancel, code: previous_enrollment.code
    #   # render :duplicate
    # elsif workshop_owned_by? user
    #   # render :own
    # elsif workshop_closed?
    #   # render :closed
    # elsif workshop_full?
    #   # render :full
    # else
    @enrollment = ::Pd::Enrollment.new workshop: @workshop

    # @enrollment.school_info_attributes = school_info_params

    if @enrollment.update enrollment_params
      Pd::WorkshopMailer.teacher_enrollment_receipt(@enrollment).deliver_now
      Pd::WorkshopMailer.organizer_enrollment_receipt(@enrollment).deliver_now
      redirect_to action: :thanks, code: @enrollment.code, controller: 'pd/workshop_enrollment'
      # else
      # render :new
      # end
    end
  end

  # DELETE /api/v1/pd/workshops/1/enrollments/1
  def destroy
    enrollment = @workshop.enrollments.find_by(id: params[:id])
    enrollment.destroy! if enrollment
    head :no_content
  end

  private

  def enrollment_params
    params.require(:pd_enrollment).permit(
      :first_name,
      :last_name,
      :email,
      :email_confirmation,
      :school
    )
  end
end
