class Pd::ProfessionalLearningLandingController < ApplicationController
  PLC_COURSE_ORDERING = ['CSP Support', 'ECS Support', 'CS in Algebra Support', 'CS in Science Support']

  before_action :authenticate_user!, except: [:applications_closed]

  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)
    if Pd::Enrollment.for_user(current_user).empty? && Plc::UserCourseEnrollment.where(user: current_user).empty?
      redirect_to CDO.code_org_url('educate/professional-learning', CDO.default_scheme)
      return
    end

    enrollments_with_pending_surveys = Pd::Enrollment.filter_for_survey_completion(
      Pd::Enrollment.for_user(current_user).with_surveys,
      false
    )
    last_enrollment_with_pending_survey = enrollments_with_pending_surveys.max_by {|e| e.workshop.ended_at}

    summarized_plc_enrollments = Plc::UserCourseEnrollment.where(user: current_user).map(&:summarize).sort_by do |enrollment|
      PLC_COURSE_ORDERING.index(enrollment[:courseName]) || PLC_COURSE_ORDERING.size
    end

    workshops_as_participant_data = Pd::Enrollment.for_user(current_user).map do |enrollment|
      workshop = enrollment.workshop
      workshop.summarize_for_my_pl_page.merge({feedback_given: enrollments_with_pending_surveys.include?(enrollment)})
    end

    workshops_as_facilitator = current_user.pd_workshops_facilitated
    workshops_as_facilitator_with_surveys_completed = Pd::WorkshopSurveyFoormSubmission.where(user: current_user, pd_workshop: workshops_as_facilitator).pluck(:pd_workshop_id).uniq
    workshops_as_facilitator_data = workshops_as_facilitator.map do |workshop|
      workshop.summarize_for_my_pl_page.merge({feedback_given: workshops_as_facilitator_with_surveys_completed.include?(workshop.id)})
    end

    workshops_as_organizer_data = current_user.pd_workshops_organized.map(&:summarize_for_my_pl_page)
    workshops_for_regional_partner_data = Pd::Workshop.where(regional_partner: current_user.regional_partners).map(&:summarize_for_my_pl_page)

    # Link to the certificate
    @landing_page_data = {
      last_workshop_survey_url: last_enrollment_with_pending_survey.try(:exit_survey_url),
      last_workshop_survey_course: last_enrollment_with_pending_survey.try(:workshop).try(:course),
      summarized_plc_enrollments: summarized_plc_enrollments,
      current_year_application_id: Pd::Application::TeacherApplication.find_by(user: current_user, application_year: Pd::SharedApplicationConstants::APPLICATION_CURRENT_YEAR)&.id,
      workshops_as_participant: workshops_as_participant_data,
      workshops_as_facilitator: workshops_as_facilitator_data,
      workshops_as_organizer: workshops_as_organizer_data,
      workshops_for_regional_partner: workshops_for_regional_partner_data,
      pl_courses_started: current_user.pl_units_started,
      user_permissions: current_user.permissions.map(&:permission),
      courses_as_facilitator: Pd::CourseFacilitator.where(facilitator: current_user).map(&:course).uniq,
    }.compact
  end

  def applications_closed
    # true when teacher applications are closed site-wide
    closed = Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
    render json: closed
  end
end
