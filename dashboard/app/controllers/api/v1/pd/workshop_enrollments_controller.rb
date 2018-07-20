class Api::V1::Pd::WorkshopEnrollmentsController < ApplicationController
  include Api::CsvDownload
  load_and_authorize_resource :workshop, class: 'Pd::Workshop', except: 'create'

  OTHER = "Other"
  NOT_TEACHING = "I'm not teaching this year"
  EXPLAIN = "(Please Explain):"

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
    @workshop = Pd::Workshop.find_by_id params[:workshop_id]
    if @workshop.nil?
      p "404 bc workshop nil"
    end

    enrollment_email = params[:email]
    user = User.find_by_email_or_hashed_email enrollment_email

    # See if a previous enrollment exists for this email
    previous_enrollment = @workshop.enrollments.find_by(email: enrollment_email)
    if previous_enrollment
      # cancel_url = url_for action: :cancel, code: previous_enrollment.code
      p "cancel bc duplicate"
      # render :duplicate
    elsif workshop_owned_by? user
      p "this is your own workshop"
      # render :own
    elsif workshop_closed?
      p "this workshop is closed"
      # render :closed
    elsif workshop_full?
      p "this workshop is full"
      # render :full
    else
      enrollment = ::Pd::Enrollment.new workshop: @workshop
      enrollment.school_info_attributes = school_info_params

      if enrollment.update enrollment_params
        p "updated, sending emails"
        Pd::WorkshopMailer.teacher_enrollment_receipt(enrollment).deliver_now
        Pd::WorkshopMailer.organizer_enrollment_receipt(enrollment).deliver_now
        #redirect_to action: :thanks, code: enrollment.code, controller: 'pd/workshop_enrollment'
        # else
        # render :new
      end
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
    {
      first_name: params[:first_name],
      last_name: params[:last_name],
      email: params[:email],
      role: params[:role],
      grades_teaching: params[:grades_teaching].map {|g| process_grade(g)}.join(", ")
    }
  end

  def process_grade(g)
    if g == "#{OTHER} #{EXPLAIN}"
      !params[:explain_teaching_other].blank? ? "#{OTHER}: #{params[:explain_teaching_other]}" : OTHER
    elsif g == "#{NOT_TEACHING} #{EXPLAIN}"
      !params[:explain_not_teaching].blank? ? "#{NOT_TEACHING}: #{params[:explain_not_teaching]}" : NOT_TEACHING
    else
      g
    end
  end

  def school_info_params
    params.require(:school_info).permit(
      :school_type,
      :state,
      :zip,
      :school_district_id,
      :school_id,
      :school_name,
      :country
    )
  end

  def workshop_closed?
    @workshop.state == ::Pd::Workshop::STATE_ENDED
  end

  def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end
end
