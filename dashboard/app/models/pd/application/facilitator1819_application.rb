# == Schema Information
#
# Table name: pd_applications
#
#  id                          :integer          not null, primary key
#  user_id                     :integer
#  type                        :string(255)      not null
#  application_year            :string(255)      not null
#  application_type            :string(255)      not null
#  regional_partner_id         :integer
#  status                      :string(255)
#  locked_at                   :datetime
#  notes                       :text(65535)
#  form_data                   :text(65535)      not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  course                      :string(255)
#  response_scores             :text(65535)
#  application_guid            :string(255)
#  accepted_at                 :datetime
#  properties                  :text(65535)
#  deleted_at                  :datetime
#  status_timestamp_change_log :text(65535)
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

require 'state_abbr'

module Pd::Application
  class Facilitator1819Application < FacilitatorApplicationBase
    has_one :pd_fit_weekend1819_registration,
      class_name: 'Pd::FitWeekend1819Registration',
      foreign_key: 'pd_application_id'

    def year
      YEAR_18_19
    end

    # Are we still accepting applications?
    APPLICATION_CLOSE_DATE = Date.new(2018, 2, 1)
    def self.open?
      Time.zone.now < APPLICATION_CLOSE_DATE
    end

    # Queries for locked and (accepted or withdrawn) and assigned to a fit workshop
    # @param [ActiveRecord::Relation<Pd::Application::Facilitator1819Application>] applications_query
    #   (optional) defaults to all
    # @note this is not chainable since it inspects fit_workshop_id from serialized attributes,
    #   which must be done in the model.
    # @return [array]
    def self.fit_cohort(applications_query = all)
      applications_query.
        where(type: name).
        where(status: [:accepted, :withdrawn]).
        where.not(locked_at: nil).
        includes(:pd_fit_weekend1819_registration).
        select(&:fit_workshop_id?)
    end

    # @override
    def check_idempotency
      Pd::Application::Facilitator1819Application.find_by(user: user)
    end

    # G1 facilitators are always associated with Phoenix
    # G2 facilitators are always associated with Atlanta
    # G3 facilitators are assigned based on their partner mapping, arbitrarily
    #   defaulting to Phoenix
    def find_default_fit_teachercon
      return unless regional_partner

      return TC_PHOENIX if regional_partner.group == 1
      return TC_ATLANTA if regional_partner.group == 2

      return get_matching_teachercon(regional_partner) || TC_PHOENIX
    end

    def fit_weekend_registration
      Pd::FitWeekend1819Registration.find_by_pd_application_id(id)
    end

    def teachercon_registration
      Pd::Teachercon1819Registration.find_by_pd_application_id(id)
    end
  end
end
