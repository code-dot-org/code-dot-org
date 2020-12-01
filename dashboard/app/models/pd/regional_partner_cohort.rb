# == Schema Information
#
# Table name: pd_regional_partner_cohorts
#
#  id                  :integer          not null, primary key
#  regional_partner_id :integer
#  role                :integer
#  year                :string(255)
#  course              :string(255)      not null
#  name                :string(255)
#  size                :integer
#  summer_workshop_id  :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_pd_regional_partner_cohorts_on_regional_partner_id  (regional_partner_id)
#  index_pd_regional_partner_cohorts_on_summer_workshop_id   (summer_workshop_id)
#

class Pd::RegionalPartnerCohort < ApplicationRecord
  ALLOWED_COURSES = [
    Pd::Workshop::COURSE_CSP,
    Pd::Workshop::COURSE_CSD,
    Pd::Workshop::COURSE_ECS,
    Pd::Workshop::COURSE_CS_IN_A,
    Pd::Workshop::COURSE_CS_IN_S
  ]

  enum role: {
    teacher: 0,
    facilitator: 1
  }

  has_and_belongs_to_many :users, join_table: 'pd_regional_partner_cohorts_users',
    foreign_key: 'pd_regional_partner_cohort_id', association_foreign_key: 'user_id'

  alias_attribute :members, :users

  belongs_to :regional_partner
  belongs_to :summer_workshop, class_name: 'Pd::Workshop'

  validates :course, presence: true, inclusion: {in: ALLOWED_COURSES, allow_blank: true}

  # Year format: YYYY-YYYY, e.g. "2016-2017"
  validates_format_of :year, with: /\A\d{4}-\d{4}\z/, allow_nil: true
  validates :size, numericality: {only_integer: true, greater_than: 0, less_than: 10000, allow_nil: true}
end
