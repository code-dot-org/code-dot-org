# == Schema Information
#
# Table name: pd_scholarship_infos
#
#  id                 :integer          not null, primary key
#  user_id            :integer          not null
#  application_year   :string(255)      not null
#  scholarship_status :string(255)      not null
#  pd_application_id  :integer
#  pd_enrollment_id   :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_pd_scholarship_infos_on_pd_application_id  (pd_application_id)
#  index_pd_scholarship_infos_on_pd_enrollment_id   (pd_enrollment_id)
#  index_pd_scholarship_infos_on_user_id            (user_id)
#

class Pd::ScholarshipInfo < ActiveRecord::Base
  include Pd::Application::ActiveApplicationModels
  belongs_to :user
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
  belongs_to :application, class_name: 'Pd::Application::ApplicationBase', foreign_key: :pd_application_id

  before_validation :set_application_year, on: :create

  def set_application_year
    self.application_year = APPLICATION_CURRENT_YEAR
  end

  validate :scholarship_status_valid

  def scholarship_status_valid
    unless scholarship_status.nil? || self.class.scholarship_statuses.include?(scholarship_status)
      errors.add(:scholarship_status, 'is not included in the list.')
    end
  end

  def self.scholarship_statuses
    %w(
      no
      yes_code_dot_org
      yes_other
    )
  end
end
