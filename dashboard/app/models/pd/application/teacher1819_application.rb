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
  class Teacher1819Application < TeacherApplicationBase
    include ::Pd::Teacher1819ApplicationConstants

    # @override
    def year
      YEAR_18_19
    end

    # @override
    def check_idempotency
      Teacher1819Application.find_by(user: user)
    end

    def teachercon_registration
      Pd::Teachercon1819Registration.find_by_pd_application_id(id)
    end

    def send_decision_notification_email
      # We only want to email unmatched and G3-matched teachers. All teachers
      # matched with G1 or G2 partners will be emailed by their partners.
      return if regional_partner && regional_partner.group != 3

      # Accepted, declined, and waitlisted are the only valid "final" states;
      # all other states shouldn't need emails
      return unless %w(accepted declined waitlisted).include?(status)

      if status == "accepted"
        # Acceptance emails need to be handled specially, since they not only
        # require an associated workshop but also come in two flavors depending
        # on the nature of the workshop
        return unless pd_workshop_id

        if workshop.teachercon?
          Pd::Application::Teacher1819ApplicationMailer.teachercon_accepted(self).deliver_now
        elsif workshop.local_summer?
          Pd::Application::Teacher1819ApplicationMailer.local_summer_accepted(self).deliver_now
        else
          # Applications should only ever be associated with a workshop that
          # falls into one of the above two categories, but if a mistake was
          # made, notify honeybadger
          Honeybadger.notify(
            error_message: 'Accepted application has invalid workshop',
            context: {
              application_id: id,
              pd_workshop_id: pd_workshop_id,
            }
          )
        end
      else
        Pd::Application::Teacher1819ApplicationMailer.send(status, self).deliver_now
      end
      update!(decision_notification_email_sent_at: Time.zone.now)
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
      if optional_columns[:accepted_teachercon]
        columns.push 'Accepted Teachercon'
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
      if optional_columns[:accepted_teachercon]
        if workshop.try(:teachercon?)
          columns.push(pd_teachercon1819_registration ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end

      CSV.generate do |csv|
        csv << columns
      end
    end
  end
end
