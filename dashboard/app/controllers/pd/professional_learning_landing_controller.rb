class Pd::ProfessionalLearningLandingController < ApplicationController
  PLC_COURSE_ORDERING = ['CSP Support', 'ECS Support', 'CS in Algebra Support', 'CS in Science Support']

  before_action :authenticate_user!, except: [:applications_closed]

  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    enrollments_with_pending_surveys = Pd::Enrollment.filter_for_survey_completion(
      Pd::Enrollment.for_user(current_user).with_surveys,
      false
    )
    last_enrollment_with_pending_survey = enrollments_with_pending_surveys.max_by {|e| e.workshop.ended_at}

    summarized_plc_enrollments = Plc::UserCourseEnrollment.where(user: current_user).map(&:summarize).sort_by do |enrollment|
      PLC_COURSE_ORDERING.index(enrollment[:courseName]) || PLC_COURSE_ORDERING.size
    end

    workshops_as_facilitator =
      current_user.
        pd_workshops_facilitated.
        order_by_scheduled_start.
        reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}
    workshops_as_facilitator_with_surveys_completed = Pd::WorkshopSurveyFoormSubmission.where(user: current_user, pd_workshop: workshops_as_facilitator).pluck(:pd_workshop_id).uniq
    workshops_as_facilitator_data = workshops_as_facilitator.map do |workshop|
      workshop.summarize_for_my_pl_page.merge({feedback_given: workshops_as_facilitator_with_surveys_completed.include?(workshop.id)})
    end

    workshops_as_organizer_data =
      current_user.
        pd_workshops_organized.
        order_by_scheduled_start.
        reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}.
        map(&:summarize_for_my_pl_page)

    workshops_for_regional_partner_data =
      Pd::Workshop.where(regional_partner: current_user.regional_partners).
        order_by_scheduled_start.
        reject {|workshop| workshop.state == Pd::Workshop::STATE_ENDED}.
        map(&:summarize_for_my_pl_page)

    # Link to the certificate
    @landing_page_data = {
      last_workshop_survey_url: last_enrollment_with_pending_survey.try(:exit_survey_url),
      last_workshop_survey_course: last_enrollment_with_pending_survey.try(:workshop).try(:course),
      summarized_plc_enrollments: summarized_plc_enrollments,
      current_year_application_id: Pd::Application::TeacherApplication.find_by(user: current_user, application_year: Pd::SharedApplicationConstants::APPLICATION_CURRENT_YEAR)&.id,
      has_enrolled_in_workshop: Pd::Enrollment.for_user(current_user).any?,
      workshops_as_facilitator: workshops_as_facilitator_data,
      workshops_as_organizer: workshops_as_organizer_data,
      workshops_for_regional_partner: workshops_for_regional_partner_data,
      pl_courses_started: current_user.pl_units_started,
      user_permissions: current_user.permissions.map(&:permission),
      joined_student_sections: current_user.sections_as_student_participant&.map(&:summarize_without_students),
      joined_pl_sections: current_user.sections_as_pl_participant&.map(&:summarize_without_students),
      courses_as_facilitator: Pd::CourseFacilitator.where(facilitator: current_user).map(&:course).uniq,
    }.compact
  end

  def applications_closed
    # true when teacher applications are closed site-wide
    closed = Rails.env.production? && !current_user.try(:workshop_admin?) && Gatekeeper.disallows('pd_teacher_application')
    render json: closed
  end
end
