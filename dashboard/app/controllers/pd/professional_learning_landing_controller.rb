class Pd::ProfessionalLearningLandingController < ApplicationController
  PLC_COURSE_ORDERING = ['CSP Support', 'ECS Support', 'CS in Algebra Support', 'CS in Science Support']

  before_action :authenticate_user!

  def index
    if Pd::Enrollment.for_user(current_user).empty?
      redirect_to CDO.code_org_url('professional-development-workshops', Rails.env.development? ? 'http:' : 'https:')
      return
    end

    last_enrollment_with_pending_survey = Pd::Enrollment.filter_for_survey_completion(
      Pd::Enrollment.where(email: current_user.email).with_surveys,
      false
    ).max_by {|e| e.workshop.ended_at}

    summarized_plc_enrollments = Plc::UserCourseEnrollment.where(user: current_user).map(&:summarize).sort_by do |enrollment|
      PLC_COURSE_ORDERING.index(enrollment[:courseName]) || PLC_COURSE_ORDERING.size
    end

    # Link to the certificate
    @landing_page_data = {
      last_workshop_survey_url: last_enrollment_with_pending_survey && CDO.code_org_url("/pd-workshop-survey/#{last_enrollment_with_pending_survey.code}"),
      last_workshop_survey_course: last_enrollment_with_pending_survey.try(:workshop).try(:course),
      summarized_plc_enrollments: summarized_plc_enrollments
    }.compact
  end
end
