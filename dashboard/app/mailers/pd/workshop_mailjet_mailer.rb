require_relative '../../../../lib/cdo/mailjet'
require 'pd/certificate_renderer'

class Pd::WorkshopMailjetMailer
  def self.send_teacher_workshop_reminder(enrollment, user, use_alternate_email, days)
    workshop = enrollment.workshop
    organizer = workshop.organizer
    regional_partner = workshop.regional_partner
    email = use_alternate_email ? user.alternate_email : user.email
    email_vars = {
      email_to: email,
      name: user.given_name || user.name,
      cancel_registration_link: CDO.studio_url("pd/workshop_enrollment/#{enrollment.code}/cancel", CDO.default_scheme),
      pre_survey_link: enrollment.pre_workshop_survey_url,
      facilitator_name: workshop.facilitators&.map(&:name)&.join(', '),
      rp_email: regional_partner&.contact_email_with_backup,
      rp_name: regional_partner&.name,
      organizer_email: organizer&.email,
      organizer_name: organizer&.name,
      workshop_notes: workshop.notes,
      sessions: workshop.sessions.map do |session|
        {
          datetime: session.start_date_with_start_and_end_times_us_format,
          format: session.session_format,
          meeting_link: session.meeting_link,
          location: session.formatted_location_details
        }
      end,
      workshop_subjects: workshop.course_offerings.present? ? workshop.course_offerings.map(&:display_name)&.join(', ') : workshop.subject,
      workshop_name: workshop.name.presence || "#{workshop.course} #{workshop.subject}",
      num_days: days
    }

    retryable_send_email('teacher_workshop_reminder', email, user.friendly_name, email_vars)
  end

  def self.send_teacher_post_workshop_survey(enrollment, user, use_alternate_email)
    workshop = enrollment.workshop
    organizer = workshop.organizer
    regional_partner = workshop.regional_partner
    email = use_alternate_email ? user.alternate_email : user.email
    email_vars = {
      email_to: email,
      name: user.given_name || user.name,
      exit_survey_url: enrollment.exit_survey_url,
      download_certificate_url: CDO.studio_url("/pd/generate_workshop_certificate/#{enrollment.code}", CDO.default_scheme),
      rp_email: regional_partner&.contact_email_with_backup,
      rp_name: regional_partner&.name,
      organizer_email: organizer&.email,
      organizer_name: organizer&.name
    }

    retryable_send_email('teacher_post_workshop_survey', email, user.friendly_name, email_vars)
  end

  private_class_method def self.retryable_send_email(email_name, email, name, vars)
    Retryable.retryable(
      on: RestClient::TooManyRequests,
      tries: MailJet::MAILJET_RETRY_LIMIT,
      sleep: ->(n) {2 ** n}
    ) do
      MailJet.send_email(
        email_name.to_sym,
        email,
        name,
        vars: vars
      )
    end
  end
end
