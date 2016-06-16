# == Schema Information
#
# Table name: pd_enrollments
#
#  id                    :integer          not null, primary key
#  pd_workshop_id        :integer          not null
#  name                  :string(255)      not null
#  email                 :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  code                  :string(255)
#  school                :string(255)
#  school_district_id    :integer
#  school_zip            :integer
#  school_type           :string(255)
#  school_state          :string(255)
#  user_id               :integer
#  school_district_other :boolean
#
# Indexes
#
#  index_pd_enrollments_on_pd_workshop_id      (pd_workshop_id)
#  index_pd_enrollments_on_school_district_id  (school_district_id)
#

class Pd::Enrollment < ActiveRecord::Base
  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  belongs_to :school_district
  belongs_to :user

  validates :name, :email, presence: true
  validates_confirmation_of :email

  # The enrollment is from one of 2 sources:
  #   1. Web form filled out by user - all school fields required.
  #   2. Automatic association for a user who attends the workshop unenrolled.
  validate :validate_school_district, unless: :has_user?
  validates :school, presence: true, unless: :has_user?

  def has_user?
    self.user_id
  end

  # Validates the district dropdown.  This list is more verbose than it
  # needs to be, but correlates to the list of valid configurations given
  # in https://github.com/code-dot-org/code-dot-org/pull/8624.
  def validate_school_district
    if school_type == "charter" && !school_zip.blank?
      return
    elsif school_type == "private" && !school_zip.blank?
      return
    elsif school_type == "public"
      if school_state == "other"
        return
      elsif !school_state.blank? && !school_district_id.blank?
        return
      elsif !school_state.blank? && school_district_id.blank? && !school_district_other.blank?
        return
      end
    elsif school_type == "other"
      if school_state == "other"
        return
      elsif !school_state.blank? && !school_district_id.blank?
        return
      elsif !school_state.blank? && school_district_id.blank? && !school_district_other.blank?
        return
      end
    end

    errors.add(:school_district, "is required")
  end

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  def resolve_user
    user || User.find_by_email_or_hashed_email(self.email)
  end

  def self.create_for_unenrolled_attendees(workshop)
    enrolled_user_ids = Set.new
    workshop.enrollments.each do |enrollment|
      user = enrollment.resolve_user
      enrolled_user_ids.add user.id if user
    end

    [].tap do |new_enrollments|
      Pd::Attendance.for_workshop(workshop).distinct_teachers.each do |attendee|
        next if enrolled_user_ids.include? attendee.id

        if attendee.email.blank?
          CDO.log.warning "Unable to create an enrollment for workshop attendee with no email. User Id: #{attendee.id}"
          next
        end

        new_enrollments << Pd::Enrollment.create!(
          workshop: workshop,
          name: attendee.name,
          email: attendee.email,
          user: attendee
        )
      end
    end
  end

  private

  def unused_random_code
    loop do
      code = SecureRandom.hex(10)
      return code unless Pd::Enrollment.exists?(code: code)
    end
  end
end
