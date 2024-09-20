# == Schema Information
#
# Table name: lti_courses
#
#  id                 :bigint           not null, primary key
#  lti_integration_id :bigint           not null
#  lti_deployment_id  :bigint           not null
#  context_id         :string(255)
#  course_id          :string(255)
#  nrps_url           :string(255)
#  resource_link_id   :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deleted_at         :datetime
#
# Indexes
#
#  fk_rails_19886eb632                         (lti_deployment_id)
#  index_lti_courses_on_deleted_at             (deleted_at)
#  index_lti_courses_on_lti_integration_id     (lti_integration_id)
#  index_on_context_id_and_lti_integration_id  (context_id,lti_integration_id)
#  index_on_course_id_and_lti_integration_id   (course_id,lti_integration_id)
#
class LtiCourse < ApplicationRecord
  acts_as_paranoid
  belongs_to :lti_integration
  belongs_to :lti_deployment
  has_many :lti_sections, dependent: :destroy
  has_many :sections, through: :lti_sections
  validates :context_id, presence: true
  validates_uniqueness_of :context_id, scope: :lti_integration_id
  validates :nrps_url, url: {allow_nil: true}
end
