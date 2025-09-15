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
      facilitator_name: workshop_facilitator_names(workshop),
      rp_email: contact_email_with_fallback(regional_partner&.contact_email_with_backup),
      rp_name: contact_name_with_fallback(regional_partner&.name),
      organizer_email: contact_email_with_fallback(organizer&.email),
      organizer_name: contact_name_with_fallback(organizer&.name),
      workshop_notes: workshop.notes || 'No additional information at this time.',
      sessions: workshop.sessions.map(&:session_info_for_emails),
      workshop_subjects: workshop.course_offerings.present? ? workshop.course_offerings.map(&:display_name)&.join(', ') : workshop.subject,
      workshop_name: workshop.name.presence || "#{workshop.course} #{workshop.subject}",
      num_days: days
    }

    retryable_send_email('teacher_workshop_reminder', email, user.friendly_name, email_vars)
  end

  def self.send_teacher_workshop_detail_change_notification(enrollment, user, use_alternate_email, general_detail_changes, sessions_have_changed, pre_update_session_info, post_update_session_info)
    workshop = enrollment.workshop
    organizer = workshop.organizer
    regional_partner = workshop.regional_partner
    email = use_alternate_email ? user.alternate_email : user.email
    email_vars = {
      email_to: email,
      name: user.given_name || user.name,
      workshop_name: workshop.name || "#{workshop.course} #{workshop.subject}",
      cancel_registration_link: CDO.studio_url("pd/workshop_enrollment/#{enrollment.code}/cancel", CDO.default_scheme),
      facilitator_name: workshop_facilitator_names(workshop),
      rp_email: contact_email_with_fallback(regional_partner&.contact_email_with_backup),
      rp_name: contact_name_with_fallback(regional_partner&.name),
      organizer_email: contact_email_with_fallback(organizer&.email),
      organizer_name: contact_name_with_fallback(organizer&.name),
      detail_changes: general_detail_changes,
      sessions_have_changed: sessions_have_changed,
      pre_update_session_info: pre_update_session_info,
      post_update_session_info: post_update_session_info
    }

    retryable_send_email('teacher_workshop_detail_change_notification', email, user.friendly_name, email_vars)
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
      rp_email: contact_email_with_fallback(regional_partner&.contact_email_with_backup),
      rp_name: contact_name_with_fallback(regional_partner&.name),
      organizer_email: contact_email_with_fallback(organizer&.email),
      organizer_name: contact_name_with_fallback(organizer&.name)
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

  private_class_method def self.workshop_facilitator_names(workshop)
    workshop.facilitators&.map(&:name)&.join(', ').presence || 'None'
  end

  private_class_method def self.contact_email_with_fallback(email)
    email.presence || 'support@code.org'
  end

  private_class_method def self.contact_name_with_fallback(name)
    name.presence || 'Code.org'
  end
end
