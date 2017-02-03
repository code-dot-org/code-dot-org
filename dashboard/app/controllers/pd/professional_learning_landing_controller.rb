class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get workshops that the user is enrolled in with an outstanding survey
    enrollments = Pd::Enrollment.where(email: current_user.email)
    workshops = Pd::Workshop.enrolled_in_by(current_user)

    unsurveyed_enrollments = enrollments.where(completed_survey_id: nil).where.not(survey_sent_at: nil).order(ended_at: :desc)

    # Link to the certificate

    # Has the teacher taken a CSF PD class?

    return {
        csf_teacher: Pd::Workshop.enrolled_in_by(current_user).exists?(course: COURSE_CSF),
        survey_link: unsurveyed_enrollments.first,
        certificate_link: '',
        most_recent_workshop: workshops.sort { |x, y| x.start > y.start}.first
    }
  end
end
