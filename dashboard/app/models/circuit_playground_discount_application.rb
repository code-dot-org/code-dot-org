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
  belongs_to :school

  enum unit_6_intention: {
    no: 1,
    yes1718: 2,
    yes1819: 3,
    yesAfter: 4,
    unsure: 5,
    yes1920: 6,
    yesSpring2020: 7,
    yesFall2020: 8,
    yesSpring2021: 9
  }

  def eligible_unit_6_intention?
    yesSpring2020? || yesFall2020? || yesSpring2021?
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

  # Checks whether a user has attended a workshop with a given subject.
  # Used to check both attendance at 5-day summer workshops and quarterly workshops.
  # @param workshop_subjects [Array] A list of workshop subjects (or single value) to check for a user's attendance.
  # @return {boolean} true if user is an eligible facilitator or attended relevant workshop
  def self.user_pd_eligible?(user, workshop_subjects)
    user_pd_eligible_as_teacher?(user, workshop_subjects) || user_pd_eligible_as_facilitator?(user)
  end

  private_class_method def self.user_pd_eligible_as_teacher?(user, workshop_subjects)
    Pd::Attendance.
      joins(:workshop).
      where(
        pd_attendances: {
          teacher_id: user.id
        },
        pd_workshops: {
          course: Pd::Workshop::COURSE_CSD,
          subject: workshop_subjects
        }
      ).
      where("pd_workshops.started_at > '2019-05-01'").
      exists?
  end

  private_class_method def self.user_pd_eligible_as_facilitator?(user)
    # We've got a specific list of facilitators eligible for the discount this year.
    # Storing it in DCDO since this is a temporary list and not necessarily worth its
    # own Rails model.
    DCDO.get('facilitator_ids_eligible_for_maker_discount', []).include? user.id
  end

  # Given a user (which has a studio person ID), get all associated accounts
  def self.get_user_accounts(user)
    user.studio_person_id.nil? ? [user] : User.where(studio_person_id: user.studio_person_id)
  end

  # Looks to see if any of the users associated with this studio_person_id are eligible
  # for our circuit playground discount via their attendance at a given PD workshop
  def self.studio_person_pd_eligible?(user, workshop_subjects)
    accounts = get_user_accounts(user)
    accounts.any? {|associated_user| user_pd_eligible?(associated_user, workshop_subjects)}
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

    {
      # This will be a number from 1-5 (representing which radio button) was selected,
      # or nil if no selection yet
      unit_6_intention: application.try(:unit_6_intention),
      has_confirmed_school: application.try(:has_confirmed_school?) || false,
      school_id: school_id,
      school_name: school_id ? School.find(school_id).name : nil,
      school_high_needs_eligible: school_id ? School.find(school_id).try(:maker_high_needs?) : nil,
      # true/false once has_submitted_school is true
      # false implies partial discount
      gets_full_discount: application.try(:full_discount),
      discount_code: application.try(:circuit_playground_discount_code).try(:code),
      expiration: application.try(:circuit_playground_discount_code).try(:expiration),
      admin_set_status: application.try(:admin_set_status) || false,
      is_pd_eligible: studio_person_pd_eligible?(user,
        [
          Pd::Workshop::SUBJECT_SUMMER_WORKSHOP,
        ]
      ),
      is_progress_eligible: student_progress_eligible?(user)
    }
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
      is_pd_eligible: studio_person_pd_eligible?(user,
        [
          Pd::Workshop::SUBJECT_SUMMER_WORKSHOP,
        ]
      ),
      is_progress_eligible: student_progress_eligible?(user),
      user_school: {
        id: user_school.try(:id),
        name: user_school.try(:name),
        high_needs: user_school.try(:maker_high_needs?),
      },
      application_school: {
        id: application_school.try(:id),
        name: application_school.try(:name),
        high_needs: application_school.try(:maker_high_needs?),
      },
      unit_6_intention: application.try(:unit_6_intention),
      full_discount: application.try(:full_discount),
      admin_set_status: application.try(:admin_set_status),
      discount_code: application.try(:circuit_playground_discount_code).try(:code)
    }
  end

  #
  # Part of the account purge system
  #
  def anonymize
    self.signature = '(anonymized signature)' if signature
    self.school_id = nil
    save!
  end
end
