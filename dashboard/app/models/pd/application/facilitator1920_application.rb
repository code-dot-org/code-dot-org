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

module Pd::Application
  class Facilitator1920Application < FacilitatorApplicationBase
    include Pd::Facilitator1920ApplicationConstants

    validates_uniqueness_of :user_id

    #override
    def year
      YEAR_19_20
    end

    # Are we still accepting applications?
    APPLICATION_CLOSE_DATE = Date.new(2019, 1, 31)
    def self.open?
      Time.zone.now < APPLICATION_CLOSE_DATE
    end

    # @override
    def check_idempotency
      Pd::Application::Facilitator1920Application.find_by(user: user)
    end
  end
end
