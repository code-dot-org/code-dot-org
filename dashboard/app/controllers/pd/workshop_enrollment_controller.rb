class Pd::WorkshopEnrollmentController < ApplicationController

  # GET /pd/workshops/1/enroll
  def new
    view_options(no_footer: true)
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]

    if workshop_closed?
      render :closed
    elsif workshop_full?
      render :full
    elsif workshop_owned_by? current_user
      render :own
    else
      @enrollment = ::Pd::Enrollment.new workshop: @workshop
      if current_user
        @enrollment.name = current_user.name
        @enrollment.email = current_user.email
        @enrollment.email_confirmation = current_user.email
      end
    end
  end

  # POST /pd/workshops/1/enroll
  def create
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]
    enrollment_email = enrollment_params[:email]
    user = User.find_by_email enrollment_email

    # See if a previous enrollment exists for this email
    previous_enrollment = @workshop.enrollments.find_by(email: enrollment_email)
    if previous_enrollment
      @cancel_url = url_for action: :cancel, code: previous_enrollment.code
      render :duplicate
    elsif workshop_owned_by? user
      render :own
    elsif workshop_closed?
      render :closed
    elsif workshop_full?
      render :full
    else
      @enrollment = ::Pd::Enrollment.new workshop: @workshop
      if @enrollment.update enrollment_params
        redirect_to action: :show, code: @enrollment.code, controller: 'pd/workshop_enrollment'
      else
        render :new
      end
    end
  end

  # GET /pd/workshop_enrollment/:code
  def show
    @enrollment = ::Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @cancel_url = url_for action: :cancel, code: @enrollment.code
    end
  end

  # GET /pd/workshop_enrollment/:code/cancel
  def cancel
    @enrollment = Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @enroll_url = url_for action: :new, workshop_id: @enrollment.pd_workshop_id
      @enrollment.destroy!
    end
  end

  private

  def workshop_closed?
    @workshop.state == ::Pd::Workshop::STATE_ENDED
  end

  def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_id == user.id || @workshop.facilitators.exists?(id: user.id)
  end

  def enrollment_params
    params.require(:pd_enrollment).permit(
      :name,
      :email,
      :email_confirmation,
      :district_name,
      :school
    )
  end
end
