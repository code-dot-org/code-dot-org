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
  class PrincipalApproval1920Application < PrincipalApprovalApplicationBase
    include Pd::PrincipalApproval1920ApplicationConstants

    # @override
    def year
      YEAR_19_20
    end

    validates_presence_of :teacher_application
    belongs_to :teacher_application, class_name: 'Pd::Application::Teacher1920Application',
      primary_key: :application_guid, foreign_key: :application_guid

    def self.create_placeholder_and_send_mail(teacher_application)
      ::Pd::Application::Teacher1819ApplicationMailer.principal_approval(teacher_application).deliver_now

      Pd::Application::PrincipalApproval1920Application.create(
        form_data: {}.to_json,
        application_guid: teacher_application.application_guid
      )
    end

    # @override
    def check_idempotency
      existing_application = Pd::Application::PrincipalApproval1920Application.find_by(application_guid: application_guid)

      (!existing_application || existing_application.placeholder?) ? nil : existing_application
    end
  end
end
