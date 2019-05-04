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
#  course             :string(255)
#
# Indexes
#
#  index_pd_scholarship_infos_on_pd_application_id                (pd_application_id)
#  index_pd_scholarship_infos_on_pd_enrollment_id                 (pd_enrollment_id)
#  index_pd_scholarship_infos_on_user_id                          (user_id)
#  index_pd_scholarship_infos_on_user_id_and_app_year_and_course  (user_id,application_year,course) UNIQUE
#  index_pd_scholarship_infos_on_user_id_and_application_year     (user_id,application_year) UNIQUE
#

class Pd::ScholarshipInfo < ActiveRecord::Base
  include Pd::Application::ActiveApplicationModels
  include Pd::Application::ApplicationConstants
  include Pd::ScholarshipInfoConstants

  # We began using scholarships in 2019-2020, so remove 2018-2019 from this list
  SCHOLARSHIP_YEARS = APPLICATION_YEARS.drop(1).freeze

  belongs_to :user
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
  belongs_to :application, class_name: 'Pd::Application::TeacherApplicationBase', foreign_key: :pd_application_id

  before_validation -> {self.application_year = APPLICATION_CURRENT_YEAR}, if: :new_record?

  validates_presence_of :user_id
  validates_inclusion_of :application_year, in: SCHOLARSHIP_YEARS
  validates_inclusion_of :scholarship_status, in: SCHOLARSHIP_STATUSES

  def self.update_or_create(user, application_year, course, scholarship_status)
    scholarship_info = Pd::ScholarshipInfo.find_by(user: user, application_year: application_year, course: course) || Pd::ScholarshipInfo.new(user: user)
    scholarship_info.update(scholarship_status: scholarship_status, course: course)
  end
end
