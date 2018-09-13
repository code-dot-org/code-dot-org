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
          how_heard: [
            'Code.org Website',
            'Code.org Email',
            'Regional Partner Website',
            'Regional Partner Email',
            'From a teacher that has participated in a Code.org program',
            TEXT_FIELDS[:other_with_text]
          ]
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
        how_heard
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
  end
end
