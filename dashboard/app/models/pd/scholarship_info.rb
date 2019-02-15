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
  include Pd::Application::ApplicationConstants
  include ScholarshipInfoConstants

  # We began using scholarships in 2019-2020, so remove 2018-2019 from this list
  SCHOLARSHIP_YEARS = APPLICATION_YEARS.drop(1).freeze

  SCHOLARSHIP_STATUSES = [
    NO,
    YES_CDO,
    YES_OTHER
  ].freeze

  belongs_to :user
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
  belongs_to :application, class_name: 'Pd::Application::ApplicationBase', foreign_key: :pd_application_id

  before_validation -> {self.application_year = APPLICATION_CURRENT_YEAR}, if: :new_record?

  validates_presence_of :user_id
  validates_inclusion_of :application_year, in: SCHOLARSHIP_YEARS
  validates_inclusion_of :scholarship_status, in: SCHOLARSHIP_STATUSES
end
