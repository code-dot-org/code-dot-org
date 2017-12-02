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
  belongs_to :circuit_playground_discount_code

  enum unit_6_intention: {
    no: 1,
    yes1718: 2,
    yes1819: 3,
    yesAfter: 4,
    unsure: 5,
  }

  def eligible_unit_6_intention?
    yes1718? || yes1819?
  end

  # Given a studio_person_id, finds an existing application (if one exists) for any user
  # associated. Should never return more than one result
  def self.find_by_studio_person_id(studio_person_id)
    associated_user_ids = User.where(studio_person_id: studio_person_id).map(&:id)
    where(user_id: associated_user_ids).first
  end

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

  def self.application_status(user)
    application = CircuitPlaygroundDiscountApplication.find_by_user_id(user.id)

    status = {
      # This will be a number from 1-5 (representing which radio button) was selected,
      # or nil if no selection yet
      unit_6_intention: application.try(:unit_6_intention),
      has_confirmed_school: application.try(:has_confirmed_school) || false,
      school_id: user.try(:school_info).try(:school_id),
      school_name: user.try(:school_info).try(:school).try(:name),
      # true/false once has_submitted_school is true
      # false implies partial discount
      gets_full_discount: application.try(:full_discount),
      discount_code: application.try(:circuit_playground_discount_code).try(:code),
    }

    if application
      # We won't let you create an application without meeting our eligibility requirements
      # so no need to check them again if we find an existing application
      status.merge({is_pd_eligible: true, is_progress_eligible: true})
    else
      status.merge(
        is_pd_eligible: studio_person_pd_eligible?(user),
        is_progress_eligible: student_progress_eligible?(user)
      )
    end
  end
end
