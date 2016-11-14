# == Schema Information
#
# Table name: pd_enrollments
#
#  id                  :integer          not null, primary key
#  pd_workshop_id      :integer          not null
#  name                :string(255)
#  first_name          :string(255)
#  last_name           :string(255)
#  email               :string(255)      not null
#  created_at          :datetime
#  updated_at          :datetime
#  school              :string(255)
#  code                :string(255)
#  user_id             :integer
#  survey_sent_at      :datetime
#  completed_survey_id :integer
#  school_info_id      :integer
#  deleted_at          :datetime
#
# Indexes
#
#  index_pd_enrollments_on_code            (code) UNIQUE
#  index_pd_enrollments_on_pd_workshop_id  (pd_workshop_id)
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

  validates_presence_of :first_name

  # Some old enrollments, from before the first/last name split, don't have last names.
  # Require on all new enrollments.
  validates_presence_of :last_name, unless: :created_before_name_split?

  validates_presence_of :email
  validates_confirmation_of :email

  validates_presence_of :school, unless: :skip_school_validation
  validates_presence_of :school_info, unless: :skip_school_validation

  # Name split (https://github.com/code-dot-org/code-dot-org/pull/11679) was deployed on 2016-11-09
  def created_before_name_split?
    self.persisted? && self.created_at < '2016-11-10'
  end

  def self.for_school_district(school_district)
    self.joins(:school_info).where(school_infos: {school_district_id: school_district.id})
  end

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

  def send_exit_survey
    return unless self.user

    # In case the workshop is reprocessed, do not send duplicate exit surveys.
    if survey_sent_at
      CDO.log.warn "Skipping attempt to send a duplicate workshop survey email. Enrollment: #{self.id}"
      return
    end

    Pd::WorkshopMailer.exit_survey(self).deliver_now

    # Skip school validation to allow legacy enrollments (from before those fields were required) to update.
    self.update!(survey_sent_at: Time.zone.now, skip_school_validation: true)
  end

  # TODO: Once we're satisfied with the first/last name split data,
  # remove the name field entirely.
  def name=(value)
    ActiveSupport::Deprecation.warn('name is deprecated. Use first_name & last_name instead.')
    self.full_name = value
  end

  def name
    ActiveSupport::Deprecation.warn('name is deprecated. Use first_name & last_name instead.')
    full_name
  end

  # Convenience method for combining first and last name into a full name
  # @return [String] Combined first_name last_name
  def full_name
    "#{first_name} #{last_name}".strip
  end

  # Convenience method for setting first and last names from a full name
  # @param value [String]
  #   Combined full name, which will be split on the first space to set
  #   the first_name and last_name properties
  def full_name=(value)
    first_name, last_name = value.split(' ', 2)
    write_attribute :first_name, first_name
    write_attribute :last_name, last_name || ''
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
