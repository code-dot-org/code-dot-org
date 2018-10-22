# == Schema Information
#
# Table name: pd_applications
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  type                :string(255)      not null
#  application_year    :string(255)      not null
#  application_type    :string(255)      not null
#  regional_partner_id :integer
#  status              :string(255)
#  locked_at           :datetime
#  notes               :text(65535)
#  form_data           :text(65535)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  course              :string(255)
#  response_scores     :text(65535)
#  application_guid    :string(255)
#  accepted_at         :datetime
#  properties          :text(65535)
#  deleted_at          :datetime
#
# Indexes
#
#  index_pd_applications_on_application_guid     (application_guid)
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

module Pd::Application
  class Teacher1920Application < TeacherApplicationBase
    include Pd::Teacher1920ApplicationConstants

    validates_uniqueness_of :user_id

    serialized_attrs %w(
      status_log
      principal_approval_not_required
    )

    # @override
    def self.statuses
      %w(
        unreviewed
        pending
        waitlisted
        declined
        accepted_not_notified
        accepted_notified_by_partner
        accepted_no_cost_registration
        registration_sent
        paid
        withdrawn
      )
    end

    # These statuses are considered "decisions", and will queue an email that will be sent by cronjob the next morning
    # In these decision emails, status and email_type are the same.
    AUTO_EMAIL_STATUSES = %w(
      accepted_no_cost_registration
      declined
      waitlisted
      registration_sent
    )

    # If the regional partner's emails are SENT_BY_SYSTEM, the application must
    # have an assigned workshop to be set to one of these statuses because they
    # trigger emails with a link to the workshop registration form
    WORKSHOP_REQUIRED_STATUSES = %w(
      accepted_no_cost_registration
      registration_sent
    )

    has_many :emails, class_name: 'Pd::Application::Email', foreign_key: 'pd_application_id'

    before_save :log_status, if: -> {status_changed?}

    validate :workshop_present_if_required_for_status, if: -> {status_changed?}

    def workshop_present_if_required_for_status
      if regional_partner&.applications_decision_emails == RegionalPartner::SENT_BY_SYSTEM &&
          WORKSHOP_REQUIRED_STATUSES.include?(status) && !pd_workshop_id
        errors.add :status, "#{status} requires workshop to be assigned"
      end
    end

    def should_send_decision_email?
      if regional_partner&.applications_decision_emails == RegionalPartner::SENT_BY_PARTNER
        false
      else
        AUTO_EMAIL_STATUSES.include?(status)
      end
    end

    def log_status
      self.status_log ||= []
      status_log.push({status: status, at: Time.zone.now})

      # delete any unsent emails, and queue a new status email if appropriate
      emails.unsent.destroy_all
      queue_email(status) if should_send_decision_email?
    end

    # @override
    # @param [Pd::Application::Email] email
    # Note - this should only be called from within Pd::Application::Email.send!
    def deliver_email(email)
      unless email.pd_application_id == id
        raise "Expected application id #{id} from email #{email.id}. Actual: #{email.pd_application_id}"
      end

      # email_type maps to the mailer action
      Teacher1920ApplicationMailer.send(email.email_type, self).deliver_now
    end

    def principal_approval_state
      response = Pd::Application::PrincipalApproval1920Application.find_by(application_guid: application_guid)
      return "Complete - #{response.full_answers[:do_you_approve]}" if response

      principal_approval_email = emails.find_by(email_type: 'principal_approval')
      if principal_approval_email
        # Format sent date as short-month day, e.g. Oct 8
        return "Incomplete - Principal email sent on #{principal_approval_email.sent_at&.strftime('%b %-d')}"
      end

      return 'Not required' if principal_approval_not_required

      nil
    end

    def formatted_teacher_email
      "#{teacher_full_name} <#{user.email}>"
    end

    def formatted_partner_contact_email
      return nil unless regional_partner && regional_partner.contact_email_with_backup.present?

      if regional_partner.contact_name.present? && regional_partner.contact_email.present?
        "#{regional_partner.contact_name} <#{regional_partner.contact_email}>"
      elsif regional_partner.program_managers&.first.present?
        "#{regional_partner.program_managers.first.name} <#{regional_partner.program_managers.first.email}>"
      elsif regional_partner.contact&.email.present?
        "#{regional_partner.contact.name} <#{regional_partner.contact.email}>"
      end
    end

    def formatted_principal_email
      "#{principal_greeting} <#{principal_email}>"
    end

    def effective_regional_partner_name
      regional_partner&.name || 'Code.org'
    end

    def accepted?
      status.start_with? 'accepted'
    end

    # @override
    def queue_email(email_type, deliver_now: false)
      if email_type == :principal_approval_completed_partner && formatted_partner_contact_email.nil?
        CDO.log.info "Skipping principal_approval_completed_partner for application id #{id}"
      else
        super
      end
    end

    # @override
    def self.options
      super.merge(
        {
          completing_on_behalf_of_someone_else: [YES, NO],
          replace_existing: [
            YES,
            "No, this course will be added to the schedule in addition to an existing computer science course",
            "No, this course will be added to the existing schedule, but it won't replace an existing computer science course",
            TEXT_FIELDS[:i_dont_know_explain]
          ],
          cs_terms: COMMON_OPTIONS[:terms_per_year],
          how_heard: [
            'Code.org website',
            'Code.org email',
            'Regional Partner website',
            'Regional Partner email',
            'Regional Partner event or workshop',
            'From a teacher',
            'From an administrator',
            TEXT_FIELDS[:other_with_text]
          ],
          csd_which_grades: (6..12).map(&:to_s) <<
            'Not sure yet if my school plans to offer CS Discoveries in the 2019-20 school year',
          csp_which_grades: (9..12).map(&:to_s) <<
            'Not sure yet if my school plans to offer CS Principles in the 2019-20 school year',
          plan_to_teach: [
            'Yes, I plan to teach this course this year (2019-20)',
            'I hope to be able teach this course this year (2019-20)',
            'No, I don’t plan to teach this course this year (2019-20), but I hope to teach this course the following year (2020-21)',
            'No, someone else from my school will teach this course this year (2019-20)',
            TEXT_FIELDS[:dont_know_if_i_will_teach_explain]
          ],
          travel_to_another_workshop: [
            'Yes, please provide me with additional information about attending a local summer workshop outside of my region.',
            'No, I’m not interested in travelling to attend a local summer workshop outside of my region.',
            TEXT_FIELDS[:not_sure_explain]
          ],
          pay_fee: [
            'Yes, my school or I will be able to pay the full program fee.',
            TEXT_FIELDS[:no_pay_fee_1920],
            'Not applicable: there is no program fee for teachers in my region.',
            'Not applicable: there is no Regional Partner in my region.'
          ],
          willing_to_travel: TeacherApplicationBase.options[:willing_to_travel] << 'I am unable to travel to the school year workshops',
          interested_in_online_program: [YES, NO]
        }
      )
    end

    # @override
    def self.required_fields
      %i(
        country
        school
        first_name
        last_name
        phone
        address
        city
        state
        zip_code
        principal_first_name
        principal_last_name
        principal_email
        principal_confirm_email
        principal_phone_number
        completing_on_behalf_of_someone_else
        current_role

        program
        cs_how_many_minutes
        cs_how_many_days_per_week
        cs_how_many_weeks_per_year
        cs_terms
        plan_to_teach
        replace_existing

        does_school_require_cs_license
        subjects_teaching
        have_cs_license
        subjects_licensed_to_teach
        taught_in_past
        previous_yearlong_cdo_pd
        cs_offered_at_school

        pay_fee
        willing_to_travel
        interested_in_online_program

        gender_identity
        race

        agree
      )
    end

    # @override
    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:completing_on_behalf_of_someone_else] == YES
          required.concat [:completing_on_behalf_of_name]
        end

        if hash[:does_school_require_cs_license] == YES
          required.concat [:what_license_required]
        end

        if hash[:able_to_attend_multiple]
          if ([TEXT_FIELDS[:not_sure_explain], TEXT_FIELDS[:unable_to_attend_1920]] & hash[:able_to_attend_multiple]).any?
            required.concat [:travel_to_another_workshop]
          end
        end

        if hash[:pay_fee] == TEXT_FIELDS[:no_pay_fee_1920]
          required.concat [:scholarship_reasons]
        end

        if hash[:program] == PROGRAMS[:csd]
          required.concat [
            :csd_which_grades,
          ]
        elsif hash[:program] == PROGRAMS[:csp]
          required.concat [
            :csp_which_grades,
            :csp_how_offer,
          ]
        end

        if hash[:regional_partner_workshop_ids].presence
          required.concat [
            :able_to_attend_multiple,
            :committed
          ]
        end
      end
    end

    # @override
    def additional_text_fields
      super.concat [
        [:cs_terms, TEXT_FIELDS[:other_with_text]],
        [:plan_to_teach, TEXT_FIELDS[:dont_know_if_i_will_teach_explain]],
        [:replace_existing, TEXT_FIELDS[:i_dont_know_explain]],
        [:able_to_attend_multiple, TEXT_FIELDS[:not_sure_explain]],
        [:able_to_attend_multiple, TEXT_FIELDS[:unable_to_attend_1920]],
        [:travel_to_another_workshop, TEXT_FIELDS[:not_sure_explain]],
        [:how_heard, TEXT_FIELDS[:other_with_text]]
      ]
    end

    # @override
    def year
      YEAR_19_20
    end

    # @override
    def check_idempotency
      Teacher1920Application.find_by(user: user)
    end

    # @override
    def self.cohort_csv_header(optional_columns)
      columns = [
        'Date Accepted',
        'Applicant Name',
        'District Name',
        'School Name',
        'Email',
        'Status',
        'Assigned Workshop'
      ]
      if optional_columns[:registered_workshop]
        columns.push 'Registered Workshop'
      end

      CSV.generate do |csv|
        csv << columns
      end
    end

    # @override
    def to_cohort_csv_row(optional_columns)
      columns = [
        date_accepted,
        applicant_name,
        district_name,
        school_name,
        user.email,
        status,
        workshop_date_and_location
      ]
      if optional_columns[:registered_workshop]
        if workshop.try(:local_summer?)
          columns.push(registered_workshop? ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end

      CSV.generate do |csv|
        csv << columns
      end
    end

    # memoize in a hash, per course
    FILTERED_LABELS = Hash.new do |h, key|
      labels_to_remove = (
      if key == 'csd'
        [
          :csp_which_grades,
          :csp_course_hours_per_week,
          :csp_course_hours_per_year,
          :csp_terms_per_year,
          :csp_how_offer,
          :csp_ap_exam
        ]
      else
        [
          :csd_which_grades,
          :csd_course_hours_per_week,
          :csd_course_hours_per_year,
          :csd_terms_per_year
        ]
      end
      )

      # school contains NCES id
      # the other fields are empty in the form data unless they selected "Other" school,
      # so we add it when we construct the csv row.
      labels_to_remove.push(:school, :school_name, :school_address, :school_type, :school_city, :school_state, :school_zip_code)

      h[key] = ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    # Filter out extraneous answers based on selected program (course)
    def self.filtered_labels(course)
      raise "Invalid course #{course}" unless VALID_COURSES.include?(course)
      FILTERED_LABELS[course]
    end

    # @override
    # Called once after the application is submitted. Called again after principal
    # approval is done. Generates scores for responses, is idempotent and does not
    # override existing scores
    #
    # Overriding the base class because scores are somewhat different
    def auto_score!
      responses = sanitize_form_data_hash

      scores = {
        regional_partner_name: regional_partner.presence ? YES : NO,
      }

      options = self.class.options
      principal_options = Pd::Application::PrincipalApproval1920Application.options

      # Section 2
      if course == 'csd'
        scores.merge!(
          {
            csd_which_grades: (responses[:csd_which_grades] & options[:csd_which_grades].first(5)).any? ? YES : NO,
            cs_total_course_hours: responses[:cs_total_course_hours].to_i >= 50 ? YES : NO,
            previous_yearlong_cdo_pd: (responses[:previous_yearlong_cdo_pd] & ['CS Discoveries', 'Exploring Computer Science']).empty? ? YES : NO
          }
        )
      elsif course == 'csp'
        scores.merge!(
          {
            csp_which_grades: (responses[:csp_which_grades] & options[:csp_which_grades].first(4)).any? ? YES : NO,
            cs_total_course_hours: (responses[:cs_total_course_hours]&.>= 100) ? YES : NO,
            previous_yearlong_cdo_pd: responses[:previous_yearlong_cdo_pd] != 'CS Principles' ? YES : NO,
            csp_how_offer: responses[:csp_how_offer].in?(options[:csp_how_offer].last(2)) ? 2 : 0
          }
        )
      end

      scores[:plan_to_teach] = responses[:plan_to_teach].in?(options[:plan_to_teach].first(2)) ? YES : NO
      scores[:replace_existing] = responses[:replace_existing].in?(options[:replace_existing].values_at(1, 2)) ? 5 : 0

      # Section 3
      scores[:have_cs_license] = responses[:have_cs_license].in?(options[:have_cs_license].values_at(0, -1)) ? YES : NO
      scores[:taught_in_past] = responses[:taught_in_past] == [options[:taught_in_past].last] ? 2 : 0

      # Section 4
      scores[:committed] = responses[:committed] == options[:committed].first ? YES : NO
      scores[:willing_to_travel] = responses[:willing_to_travel] != options[:willing_to_travel].last ? YES : NO

      # Section 5
      scores[:race] = responses[:race].in?(options[:race].values_at(1, 2, 4, 5, 6)) ? 2 : 0

      # Principal Approval
      if responses[:principal_approval]
        scores.merge!(
          {
            principal_approval: responses[:principal_approval] == principal_options[:do_you_approve].first ? YES : NO,
            principal_plan_to_teach: responses[:principal_plan_to_teach] == principal_options[:plan_to_teach][0] ? YES : NO,
            principal_schedule_confirmed: responses[:principal_schedule_confirmed] == principal_options[:committed_to_master_schedule][0] ? YES : NO,
            principal_diversity_recruitment: responses[:principal_diversity_recruitment] == principal_options[:committed_to_diversity].first ? YES : NO,
            principal_free_lunch_percent: (responses[:principal_free_lunch_percent]&.to_i&.>= 50) ? 5 : 0,
            principal_underrepresented_minority_percent: (responses[:principal_underrepresented_minority_percent].to_i >= 50) ? 5 : 0
          }
        )
      end

      update(response_scores: response_scores_hash.merge(scores) {|_, old_value, _| old_value}.to_json)
    end

    def meets_criteria
      response_scores = response_scores_hash

      scored_questions = SCOREABLE_QUESTIONS["criteria_score_questions_#{course}".to_sym]

      responses = scored_questions.map {|q| response_scores[q]}

      if responses.uniq == [YES]
        YES
      elsif NO.in? responses
        NO
      else
        'Reviewing incomplete'
      end
    end

    def meets_scholarship_criteria
      responses = response_scores_hash.slice(*SCOREABLE_QUESTIONS[:scholarship_questions]).values

      # Edge case for plan to teach
      #
      if responses.uniq == [YES]
        YES
      elsif NO.in? responses
        NO
      else
        'Reviewing incomplete'
      end
    end
  end
end
