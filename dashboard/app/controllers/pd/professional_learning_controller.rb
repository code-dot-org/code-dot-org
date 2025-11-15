class Pd::ProfessionalLearningController < ApplicationController
  PLC_COURSE_ORDERING = ['CSP Support', 'ECS Support', 'CS in Algebra Support', 'CS in Science Support']

  before_action :authenticate_user!, only: [:index, :csa, :csd, :csf, :csp, :aif]

  # GET my-professional-learning
  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    enrollments_with_pending_surveys = Pd::Enrollment.filter_for_survey_completion(
      Pd::Enrollment.for_user(current_user).with_surveys,
      false
    )
    last_enrollment_with_pending_survey = enrollments_with_pending_surveys.max_by {|e| e.workshop.ended_at}

    show_deeper_learning = Plc::UserCourseEnrollment.where(user: current_user).any?

    # Link to the certificate
    @landing_page_data = {
      last_workshop_survey_url: last_enrollment_with_pending_survey.try(:exit_survey_url),
      last_workshop_survey_course: last_enrollment_with_pending_survey.try(:workshop).try(:course),
      show_deeper_learning: show_deeper_learning,
      has_enrolled_in_workshop: Pd::Enrollment.for_user(current_user).any?,
      pl_courses_started: current_user.pl_units_started,
      user_permissions: current_user.permissions.map(&:permission),
      joined_student_sections: current_user.sections_as_student_participant&.map(&:summarize_for_participant),
      joined_pl_sections: current_user.sections_as_pl_participant&.map(&:summarize_for_participant),
      courses_as_facilitator: Pd::CourseFacilitator.where(facilitator: current_user).map(&:course).uniq,
    }.compact
  end

  # GET professional-learning/courses
  def courses
    @self_paced_pl_course_offerings_for_catalog = CourseOffering.self_paced_course_offerings_for_catalog(current_user)
    @students_course_offerings_for_catalog = CourseOffering.students_course_offerings_for_catalog
    view_options(full_width: true, no_padding_container: true)

    @page_title = "Computer Science and AI Self Paced Professional Development Courses"
    @page_description = "Access free, self-paced professional development courses from Code.org for K–12 educators. Learn to teach computer science and AI anytime, anywhere—at your own pace."
    @canonical_url = CDO.studio_url("/professional-learning/courses")

    render :self_paced_pl_catalog
  end

  # GET professional-learning/workshops
  def workshops
    @national_workshops = Pd::ProfessionalLearningController.national_workshop_data
    @zip_from_school_info = current_user&.school_info&.school&.zip&.to_s&.rjust(5, '0') || current_user&.school_info&.zip&.to_s&.rjust(5, '0')

    view_options(full_width: true, no_padding_container: true)

    @page_title = "Computer Science and AI Professional Development Workshops"
    @page_description = "Explore Code.org's catalog of K–12 professional development workshops, offered nationwide by expert facilitators and regional partners. Choose from in-person or virtual workshops on computer science and AI—designed to support all types of educators."
    @canonical_url = CDO.studio_url("/professional-learning/workshops")
    render :regional_workshop_catalog
  end

  # GET professional-learning/workshops/:workshop_id
  def workshop_marketing_page
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    @workshop_info = Pd::Workshop.find(params[:workshop_id])&.summarize_for_marketing_page
    @user_info = current_user&.summarize_for_workshop
    @user_enrollment = Pd::Enrollment.find_by(user: current_user, pd_workshop_id: params[:workshop_id])&.summarize_for_workshop

    render 'pd/professional_learning/workshops/index'
  end

  # GET professional-learning/contact-regional-partner
  def contact_regional_partner
    render :contact_regional_partner
  end

  # GET professional-learning/facilitator/computer-science-a
  def csa
    @course_name = Pd::Workshop::COURSE_CSA
    if can_view_facilitator_page(@course_name)
      render 'pd/professional_learning/facilitator/csa'
    else
      render 'pd/professional_learning/facilitator/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/facilitator/computer-science-discoveries
  def csd
    @course_name = Pd::Workshop::COURSE_CSD
    if can_view_facilitator_page(@course_name)
      render 'pd/professional_learning/facilitator/csd'
    else
      render 'pd/professional_learning/facilitator/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/facilitator/computer-science-fundamentals
  def csf
    @course_name = Pd::Workshop::COURSE_CSF
    if can_view_facilitator_page(@course_name)
      render 'pd/professional_learning/facilitator/csf'
    else
      render 'pd/professional_learning/facilitator/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/facilitator/computer-science-principles
  def csp
    @course_name = Pd::Workshop::COURSE_CSP
    if can_view_facilitator_page(@course_name)
      render 'pd/professional_learning/facilitator/csp'
    else
      render 'pd/professional_learning/facilitator/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/facilitator/ai-fundamentals
  def aif
    @course_name = Pd::Workshop::COURSE_AIF
    if can_view_facilitator_page(@course_name)
      render 'pd/professional_learning/facilitator/aif'
    else
      render 'pd/professional_learning/facilitator/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/regional-partner/playbook
  def rp_playbook
    if current_user&.permission?(UserPermission::PROGRAM_MANAGER) || current_user&.permission?(UserPermission::WORKSHOP_ADMIN)
      render 'pd/professional_learning/regional_partner/regional_partner_playbook'
    else
      render 'pd/professional_learning/regional_partner/not_permitted_to_view', :status => :forbidden
    end
  end

  # GET professional-learning/application/applications_closed
  def applications_closed
    # true when teacher applications are closed site-wide
    closed = Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
    render json: closed
  end

  # GET professional-learning/workshops_as_facilitator_for_pl_page
  # Returns non-ended workshops the user is facilitating.
  def workshops_as_facilitator_for_pl_page
    workshops_as_facilitator =
      current_user.
      pd_workshops_facilitated&.
      order_by_scheduled_start&.
      reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}
    workshops_as_facilitator_with_surveys_completed = Pd::WorkshopSurveyFoormSubmission.where(user: current_user, pd_workshop: workshops_as_facilitator).pluck(:pd_workshop_id).uniq
    summarized_workshops_as_facilitator = workshops_as_facilitator.map do |workshop|
      workshop.summarize_for_my_pl_page.merge({feedback_given: workshops_as_facilitator_with_surveys_completed.include?(workshop.id)})
    end
    render json: {status: :ok, workshops_as_facilitator: summarized_workshops_as_facilitator}
  end

  # GET professional-learning/workshops_as_organizer_for_pl_page
  # Returns non-ended workshops the user is organizing.
  def workshops_as_organizer_for_pl_page
    workshops_as_organizer = current_user.
      pd_workshops_organized.
      order_by_scheduled_start.
      reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}.
      map(&:summarize_for_my_pl_page)
    render json: {status: :ok, workshops_as_organizer: workshops_as_organizer}
  end

  # GET professional-learning/workshops_as_program_manager_for_pl_page
  # Returns non-ended workshops the user is a program manager for.
  def workshops_as_program_manager_for_pl_page
    workshops_as_program_manager = Pd::Workshop.where(organizer_id: current_user.id).
      order_by_scheduled_start.
      reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}.
      map(&:summarize_for_my_pl_page)
    render json: {status: :ok, workshops_as_program_manager: workshops_as_program_manager}
  end

  # GET /dashboardapi/v1/pd/regional_workshop_data/:zip_code
  # Returns the regional partner of the provided zip and workshops (sorted by start date) that meet
  # the following criteria:
  # - Not started yet
  # - Not in the past
  # - Not hidden
  # - Considered to be in the regional partner's region (i.e. satisfies one of the following):
  #    - Has "Regional" participant group type and is associated with the given regional partner
  #    - Is a CSD, CSP, or CSA workshop and is associated with the given regional partner
  #    - Is CSF
  # - If applications are open, then allow CSD, CSP, and CSA traditional 5-day summer workshops
  def regional_workshop_data
    zip_code = params[:zip_code]

    partner, _ = RegionalPartner.find_by_zip(zip_code)
    rp_workshops = partner&.pd_workshops || []
    available_regional_workshops = rp_workshops.select do |ws|
      start_of_ws = ws.sessions.first.try(:start)
      start_date = ws.time_zone ? start_of_ws.in_time_zone(ws.time_zone).to_date : start_of_ws.to_date

      ws.state == Pd::Workshop::STATE_NOT_STARTED &&
        start_date > Time.now.in_time_zone(ws.time_zone || 'America/Chicago').to_date &&
        !ws.hidden &&
        in_region?(ws, partner) &&
        has_allowed_course_for_regional_ws_page?(ws)
    end

    sorted_available_regional_workshops = available_regional_workshops.sort_by {|ws| ws.sessions&.first&.start}

    render json: {status: :ok, regional_workshop_data: {
      regional_partner: {name: partner&.name, additional_info: partner&.additional_program_information},
      available_regional_workshops: sorted_available_regional_workshops&.map(&:summarize_for_regional_workshop_page)
    }}
  end

  def self.national_workshop_data
    national_workshops = Pd::Workshop.
      where(course: Pd::Workshop::COURSE_BUILD_YOUR_OWN).
      where(participant_group_type: "National").
      where(started_at: nil).
      and(Pd::Workshop.where(hidden: false).or(Pd::Workshop.where(hidden: nil))) || []

    national_workshops_in_future = national_workshops.select do |ws|
      start_of_ws = ws.sessions.first.try(:start)
      start_date = ws.time_zone ? start_of_ws.in_time_zone(ws.time_zone).to_date : start_of_ws.to_date
      start_date > Time.now.in_time_zone(ws.time_zone || 'America/Chicago').to_date
    end

    national_workshops_in_future.sort_by {|ws| ws.sessions&.first&.start}&.map(&:summarize_for_regional_workshop_page)
  end

  # Returns if the current_user can view the facilitator landing page of the given course.
  private def can_view_facilitator_page(course)
    current_user&.can_view_all_facilitator_landing_pages? || current_user&.courses_as_facilitator&.exists?(course: course)
  end

  # Returns if the given workshop is within the provided regional partner's area.
  private def in_region?(workshop, regional_partner)
    workshop.regional_partner_id == regional_partner.id &&
      (['Regional', 'National'].include?(workshop.participant_group_type)  ||
      [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSA, Pd::Workshop::COURSE_CSF].include?(workshop.course))
  end

  # Returns if the given workshop is on a course that we want to show on the Regional
  # Workshop Page:
  # - Show all non-CSD, non-CSP, and non-CSA workshops
  # - Only show CSD, CSP, and CSA workshops if they're traditional 5-day summer workshops
  #   and applications are open
  private def has_allowed_course_for_regional_ws_page?(workshop)
    return true if workshop.course == Pd::Workshop::COURSE_CSF
    return true unless [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSA].include?(workshop.course)
    workshop.subject == Pd::Workshop::SUBJECT_SUMMER_WORKSHOP && !DCDO.get('pl-teacher-application-off-season', false)
  end
end
