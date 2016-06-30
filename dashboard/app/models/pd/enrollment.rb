# == Schema Information
#
# Table name: pd_enrollments
#
#  id                 :integer          not null, primary key
#  pd_workshop_id     :integer          not null
#  name               :string(255)      not null
#  email              :string(255)      not null
#  created_at         :datetime
#  updated_at         :datetime
#  code               :string(255)
#  school             :string(255)
#  school_district_id :integer
#  school_zip         :integer
#  school_type        :string(255)
#  school_state       :string(255)
#  user_id            :integer
#  school_info_id     :integer
#
# Indexes
#
#  index_pd_enrollments_on_pd_workshop_id      (pd_workshop_id)
#  index_pd_enrollments_on_school_district_id  (school_district_id)
#
# Foreign Keys
#
#  fk_rails_be1a5b9dc6  (school_district_id => school_districts.id)
#

class Pd::Enrollment < ActiveRecord::Base
  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  belongs_to :school_info #, validates: true
  belongs_to :user

  accepts_nested_attributes_for :school_info
  validates_associated :school_info

  validates :name, :email, presence: true
  validates_confirmation_of :email

  def has_user?
    self.user_id
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
