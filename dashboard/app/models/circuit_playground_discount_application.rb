# == Schema Information
#
# Table name: circuit_playground_discount_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer          not null
#  unit_6_intention                    :integer
#  has_confirmed_school                :boolean          default(FALSE), not null
#  full_discount                       :boolean
#  admin_set_status                    :boolean          default(FALSE), not null
#  signature                           :string(255)
#  signed_at                           :datetime
#  circuit_playground_discount_code_id :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#
# Indexes
#
#  index_circuit_playground_applications_on_code_id           (circuit_playground_discount_code_id)
#  index_circuit_playground_discount_applications_on_user_id  (user_id) UNIQUE
#

class CircuitPlaygroundDiscountApplication < ApplicationRecord
  belongs_to :user
  has_one :circuit_playground_discount_code

  # @return {boolean} true if (1) Attended CSD TeacherCon '17 (2) are a CSD facilitator
  def self.user_pd_eligible?(user)
    csd_cohorts = %w(CSD-TeacherConPhiladelphia CSD-TeacherConPhoenix CSD-TeacherConHouston)

    return true if user.cohorts.any? {|cohort| csd_cohorts.include?(cohort.name)}
    return true if user.courses_as_facilitator.any? {|course_facilitator| course_facilitator.course == Pd::Workshop::COURSE_CSD}
    return false
  end

  # Looks to see if any of the users associated with this studio_person_id are eligibile
  # for our circuit playground discount
  def self.studio_person_pd_eligible?(user)
    User.where(studio_person_id: user.studio_person_id).any? {|associated_user| user_pd_eligible?(associated_user)}
  end

  # @return {boolean} true if we have at least one section that meets our eligibility
  #   requirements for student progress
  def self.student_progress_eligible?(user)
    user.sections.any?(&:has_sufficient_discount_code_progress?)
  end
end
