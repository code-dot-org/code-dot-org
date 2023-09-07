class Pd::WorkshopEnrollmentController < ApplicationController
  authorize_resource class: 'Pd::Enrollment', only: [:join_session, :confirm_join_session]
  load_and_authorize_resource :session, class: 'Pd::Session', find_by: :code, id_param: :session_code,
    only: [:join_session, :confirm_join_session]
  load_resource :workshop, class: 'Pd::Workshop', through: :session, singleton: true,
    only: [:join_session, :confirm_join_session]

  # GET /pd/workshops/1/enroll
  def new
    view_options(no_footer: true, answerdash: true)
    @workshop = ::Pd::Workshop.find_by_id params[:workshop_id]

    if @workshop.nil?
      render_404
    elsif workshop_closed?
      @script_data = {
        props: {
          workshop: {
            organizer: @workshop.organizer
          },
          workshop_enrollment_status: "closed"
        }.to_json
      }
    elsif workshop_full?
      @script_data = {
        props: {
          workshop: {
            organizer: @workshop.organizer
          },
          workshop_enrollment_status: "full"
        }.to_json
      }
    elsif !current_user
      render :logged_out
    elsif missing_application?
      render :missing_application
    elsif current_user.teacher? && current_user.email.blank?
      render '/pd/application/teacher_application/no_teacher_email'
    else
      @enrollment = ::Pd::Enrollment.new workshop: @workshop
      @enrollment.full_name = current_user.name
      @enrollment.email = current_user.email_for_enrollments
      @enrollment.email_confirmation = current_user.email_for_enrollments

      session_dates = @workshop.sessions.map(&:formatted_date_with_start_and_end_times)

      facilitators = @workshop.facilitators.map do |facilitator|
        # TODO: Come up with more permanent solution that doesn't require cross-project file dependency.
        bio_file = pegasus_dir("sites.v3/code.org/views/workshop_affiliates/#{facilitator.id}_bio.md")
        image_file = pegasus_dir("sites.v3/code.org/public/images/affiliate-images/#{facilitator.id}.jpg")

        {
          id: facilitator.id,
          name: facilitator.name,
          email: facilitator.email,
          image_path: File.exist?(image_file) ? CDO.code_org_url("/images/affiliate-images/fit-150/#{facilitator.id}.jpg") : nil,
          bio: File.exist?(bio_file) ? File.read(bio_file) : nil
        }
      end

      # We only want to ask each signed-in teacher about demographics once a year.
      # In this enrollment, we'll only ask if they haven't already submitted a
      # teacher application for the current year (since it asks the same), and if
      # this enrollment is for a local summer workshop (since this means it's for
      # CSD/CSP, and they will only apply for one local summer workshop a year).
      collect_demographics = !!current_user &&
        Pd::Application::ActiveApplicationModels::TEACHER_APPLICATION_CLASS.
          where(application_year: Pd::Application::ActiveApplicationModels::APPLICATION_CURRENT_YEAR).
          where(user: current_user).empty? &&
        @workshop.local_summer?

      @script_data = {
        props: {
          workshop: @workshop.attributes.merge(
            {
              organizer: @workshop.organizer,
              regional_partner: @workshop.regional_partner,
              course_url: @workshop.course_url,
              fee: @workshop.fee,
              properties: nil,
              virtual: @workshop.virtual
            }
          ),
          session_dates: session_dates,
          enrollment: @enrollment,
          facilitators: facilitators,
          workshop_enrollment_status: "unsubmitted",
          previous_courses: Pd::TeacherApplicationConstants::SUBJECTS_TAUGHT_IN_PAST,
          collect_demographics: collect_demographics
        }.to_json
      }
    end
  end

  # GET /pd/workshop_enrollment/:code
  def show
    @enrollment = ::Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render_404
    else
      @cancel_url = url_for action: :cancel, code: @enrollment.code
      @workshop = @enrollment.workshop
    end
  end

  # GET /pd/workshop_enrollment/:code/cancel
  def cancel
    @enrollment = Pd::Enrollment.find_by_code params[:code]
    if @enrollment.nil?
      render :not_found
    elsif @enrollment.attendances.any?
      render :attended
    else
      @script_data = {
        props: {
          enrollmentCode: @enrollment.code,
          workshopFriendlyName: @enrollment.workshop.friendly_name
        }.to_json
      }
    end
  end

  # GET /pd/attend/:session_code/join
  def join_session
    @enrollment = get_workshop_user_enrollment
  end

  # POST /pd/attend/:session_code/join
  def confirm_join_session
    @enrollment = build_enrollment_from_params

    unless @enrollment.save
      render :join_session
      return
    end

    if current_user.student?
      if User.hash_email(@enrollment.email) == current_user.hashed_email
        # Email matches user's hashed email. Upgrade to teacher and set email.
        current_user.upgrade_to_teacher(@enrollment.email)
      else
        # No email match. Redirect to upgrade page.
        redirect_to controller: 'pd/session_attendance', action: 'upgrade_account'
        return
      end
    end

    redirect_to controller: 'pd/session_attendance', action: 'attend'
  end

  private def build_enrollment_from_params
    enrollment = get_workshop_user_enrollment
    enrollment.assign_attributes enrollment_params.merge(user_id: current_user.id)
    enrollment.school_info_attributes = school_info_params

    enrollment
  end

  private def mark_attended(user_id, session_id)
    Pd::Attendance.find_or_create_by!(teacher_id: user_id, pd_session_id: session_id)
  end

  private def workshop_closed?
    @workshop.state == ::Pd::Workshop::STATE_ENDED
  end

  private def workshop_full?
    @workshop.enrollments.count >= @workshop.capacity
  end

  private def workshop_owned_by?(user)
    return false unless user
    @workshop.organizer_or_facilitator? user
  end

  # Gets the workshop enrollment associated with the current user id or email used for
  # enrollments. Otherwise returns a new enrollment for that user.
  private def get_workshop_user_enrollment
    @workshop.enrollments.where(
      'user_id = ? OR email = ?', current_user.id, current_user.email_for_enrollments
    ).first || Pd::Enrollment.new(
      pd_workshop_id: @workshop.id,
      user_id: current_user.id,
      full_name: current_user.name,
      email: current_user.email_for_enrollments
    )
  end

  private def enrollment_params
    params.require(:pd_enrollment).permit(
      :first_name,
      :last_name,
      :email,
      :email_confirmation,
      :school
    )
  end

  private def school_info_params
    params.require(:school_info).permit(
      :country,
      :school_type,
      :school_state,
      :school_zip,
      :school_district_id,
      :school_district_other,
      :school_district_name,
      :school_id,
      :school_other,
      :school_name,
      :full_address,
    )
  end

  private def missing_application?
    @workshop.require_application? && !has_application?
  end

  private def has_application?
    Pd::Application::TeacherApplication.where(
      user: current_user,
      status: 'accepted'
      ).any?
  end
end
