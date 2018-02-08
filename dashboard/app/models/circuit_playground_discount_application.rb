# == Schema Information
#
# Table name: circuit_playground_discount_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer          not null
#  unit_6_intention                    :integer
#  full_discount                       :boolean
#  admin_set_status                    :boolean          default(FALSE), not null
#  signature                           :string(255)
#  signed_at                           :datetime
#  circuit_playground_discount_code_id :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  school_id                           :string(255)
#
# Indexes
#
#  index_circuit_playground_applications_on_code_id             (circuit_playground_discount_code_id)
#  index_circuit_playground_discount_applications_on_school_id  (school_id)
#  index_circuit_playground_discount_applications_on_user_id    (user_id) UNIQUE
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

  # We will set the application's school_id when the user confirms their school. This means
  # that a user's school and user's application school can get out of sync, but it's important
  # that we track the school that was associated with the application
  def has_confirmed_school?
    !school_id.nil?
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

    # If our application has a confirmed school id, use that. Otherwise, see if
    # we have a school id associated with the user
    school_id = application.try(:school_id) || user.try(:school_info).try(:school_id)

    status = {
      # This will be a number from 1-5 (representing which radio button) was selected,
      # or nil if no selection yet
      unit_6_intention: application.try(:unit_6_intention),
      has_confirmed_school: application.try(:has_confirmed_school?) || false,
      school_id: school_id,
      school_name: school_id ? School.find(school_id).name : nil,
      # true/false once has_submitted_school is true
      # false implies partial discount
      gets_full_discount: application.try(:full_discount),
      discount_code: application.try(:circuit_playground_discount_code).try(:code),
      expiration: application.try(:circuit_playground_discount_code).try(:expiration),
      admin_set_status: application.try(:admin_set_status) || false
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

  # Provides admin with information about the application status of a user's
  # application, whether or not the user has started the application process
  def self.admin_application_status(user)
    application = CircuitPlaygroundDiscountApplication.find_by_user_id(user.id)

    # school currently assigned to user
    user_school = user.try(:school_info).try(:school)
    application_school = School.find(application.school_id) if application.try(:school_id)

    # School assigned to user when they confirmed school during application. Will
    # usually be nil (if user never confirmed), or the same as user_school. The
    # exception being if the user changed schools since confirming.

    {
      is_pd_eligible: studio_person_pd_eligible?(user),
      is_progress_eligible: student_progress_eligible?(user),
      user_school: {
        id: user_school.try(:id),
        name: user_school.try(:name),
        high_needs: user_school.try(:high_needs?),
      },
      application_school: {
        id: application_school.try(:id),
        name: application_school.try(:name),
        high_needs: application_school.try(:high_needs?),
      },
      unit_6_intention: application.try(:unit_6_intention),
      full_discount: application.try(:full_discount),
      admin_set_status: application.try(:admin_set_status),
      discount_code: application.try(:circuit_playground_discount_code).try(:code)
    }
  end
end
