# == Schema Information
#
# Table name: pd_enrollments
#
#  id                  :integer          not null, primary key
#  pd_workshop_id      :integer          not null
#  name                :string(255)      not null
#  email               :string(255)      not null
#  created_at          :datetime
#  updated_at          :datetime
#  school              :string(255)
#  code                :string(255)
#  school_district_id  :integer
#  school_zip          :integer
#  school_type         :string(255)
#  school_state        :string(255)
#  user_id             :integer
#  survey_sent_at      :datetime
#  completed_survey_id :integer
#  school_info_id      :integer
#  deleted_at          :datetime
#
# Indexes
#
#  index_pd_enrollments_on_code                (code) UNIQUE
#  index_pd_enrollments_on_pd_workshop_id      (pd_workshop_id)
#  index_pd_enrollments_on_school_district_id  (school_district_id)
#

class Pd::Enrollment < ActiveRecord::Base
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  belongs_to :school_info
  belongs_to :user

  # Allow overriding the school and school_info requirements.
  attr_accessor :skip_school_validation

  accepts_nested_attributes_for :school_info, reject_if: :check_school_info
  validates_associated :school_info

  validates :name, :email, presence: true
  validates_confirmation_of :email

  validates_presence_of :school, unless: :skip_school_validation
  validates_presence_of :school_info, unless: :skip_school_validation

  def has_user?
    self.user_id
  end

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  # Always store emails in lowercase and stripped to match the behavior in User.
  def email=(value)
    write_attribute(:email, value.try(:downcase).try(:strip))
  end

  def resolve_user
    user || User.find_by_email_or_hashed_email(self.email)
  end

  def in_section?
    user = resolve_user
    return false unless user && self.workshop.section

    # Teachers enrolled in the workshop are "students" in the section.
    self.workshop.section.students.exists?(user.id)
  end

  protected

  # Returns true if the SchoolInfo already exists and we should reuse that.
  # Returns false if the SchoolInfo is new and should be stored.
  # Validates the SchoolInfo first so that we fall into the latter path in
  # that case.
  def check_school_info(school_info_attr)
    attr = {
      school_type: school_info_attr['school_type'],
      state: school_info_attr['school_state'],
      school_district_id: school_info_attr['school_district_id'],
      zip: school_info_attr['school_zip'],
      school_district_other: school_info_attr['school_district_other']
    }

    # Remove empty attributes.  Notably school_district_id can come through
    # as an empty string when we don't want anything.
    attr.delete_if { |_, e| e.blank? }

    # The checkbox comes through as "true" when we really want true.
    attr[:school_district_other] = true if attr[:school_district_other] == "true"

    return false unless SchoolInfo.new(attr).valid?

    if school_info = SchoolInfo.where(attr).first
      self.school_info = school_info
      return true
    end

    return false
  end

  private

  def unused_random_code
    loop do
      code = SecureRandom.hex(10)
      return code unless Pd::Enrollment.exists?(code: code)
    end
  end
end
