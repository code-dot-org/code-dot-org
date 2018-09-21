# == Schema Information
#
# Table name: pd_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer
#  type                                :string(255)      not null
#  application_year                    :string(255)      not null
#  application_type                    :string(255)      not null
#  regional_partner_id                 :integer
#  status                              :string(255)
#  locked_at                           :datetime
#  notes                               :text(65535)
#  form_data                           :text(65535)      not null
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  course                              :string(255)
#  response_scores                     :text(65535)
#  application_guid                    :string(255)
#  decision_notification_email_sent_at :datetime
#  accepted_at                         :datetime
#  properties                          :text(65535)
#  deleted_at                          :datetime
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

    serialized_attrs %w(status_log)

    enum status: %w(
      unreviewed
      pending
      waitlisted
      declined
      accepted_not_notified
      accepted_notified_by_partner
      accepted_no_cost_registration
      registration_sent
      invoiced
      withdrawn
    ).index_by(&:to_sym).freeze

    # These statuses are considered "decisions", and will queue an email that will be sent by cronjob the next morning
    # In these decision emails, status and email_type are the same.
    AUTO_EMAIL_STATUSES = %w(
      accepted_no_cost_registration
      declined
      waitlisted
      registration_sent
    )

    has_many :emails, class_name: 'Pd::Application::Email', foreign_key: 'pd_application_id'

    before_save :log_status, if: -> {status_changed?}

    def should_send_decision_email?
      AUTO_EMAIL_STATUSES.include?(status)
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

    def formatted_teacher_email
      "#{teacher_full_name} <#{user.email}>"
    end

    def formatted_partner_contact_email
      if regional_partner
        "#{regional_partner.contact_name} <#{regional_partner.contact_email}>"
      else
        'Code.org <partner@code.org>'
      end
    end

    def formatted_principal_email
      "#{principal_greeting} <#{principal_email}>"
    end

    def accepted?
      status.start_with? 'accepted'
    end

    # @override
    def self.options
      super.merge(
        {
          completing_on_behalf_of_someone_else: [YES, NO],
          replace_existing: [
            YES,
            "No, this course will be added to the existing schedule, but it won't replace an existing computer science course",
            TEXT_FIELDS[:i_dont_know_explain]
          ],
          cs_terms: COMMON_OPTIONS[:terms_per_year],
          how_heard: [
            'Code.org Website',
            'Code.org Email',
            'Regional Partner Website',
            'Regional Partner Email',
            'From a teacher that has participated in a Code.org program',
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
          pay_fee: [
            'Yes, my school or I will be able to pay the full program fee.',
            TEXT_FIELDS[:no_pay_fee_1920],
            'Not applicable: there is no program fee for teachers in my region.'
          ],
          willing_to_travel: TeacherApplicationBase.options[:willing_to_travel] << 'I am unable to travel to the school year workshops',
          interested_in_online_program: [YES, NO]
        }
      )
    end

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
        program
        cs_how_many_minutes
        cs_how_many_days_per_week
        cs_how_many_weeks_per_year
        plan_to_teach
        replace_existing
        subjects_teaching
        have_cs_license
        subjects_licensed_to_teach
        taught_in_past
        previous_yearlong_cdo_pd
        cs_offered_at_school
        committed
        pay_fee
        willing_to_travel

        gender_identity
        race
        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:completing_on_behalf_of_someone_else] == YES
          required.concat [:completing_on_behalf_of_name]
        end

        if hash[:does_school_require_cs_license] == YES
          required.concat [:what_license_required]
        end

        if hash[:pay_fee] == TEXT_FIELDS[:no_pay_fee_1920]
          required.contact [:scholarship_reasons]
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
      end
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
  end
end
