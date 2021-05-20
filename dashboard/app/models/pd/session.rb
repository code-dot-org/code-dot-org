# == Schema Information
#
# Table name: pd_sessions
#
#  id             :integer          not null, primary key
#  pd_workshop_id :integer
#  start          :datetime         not null
#  end            :datetime         not null
#  created_at     :datetime
#  updated_at     :datetime
#  deleted_at     :datetime
#  code           :string(255)
#
# Indexes
#
#  index_pd_sessions_on_code            (code) UNIQUE
#  index_pd_sessions_on_pd_workshop_id  (pd_workshop_id)
#

require 'cdo/code_generation'

class Pd::Session < ApplicationRecord
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: 'pd_workshop_id'
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: 'pd_session_id', dependent: :destroy

  validates_presence_of :start, :end
  validate :starts_and_ends_on_the_same_day
  validate :starts_before_ends

  def starts_and_ends_on_the_same_day
    return unless start && self.end
    unless start.to_datetime.to_date == self.end.to_datetime.to_date
      errors.add(:end, 'must occur on the same day as the start.')
    end
  end

  def starts_before_ends
    return unless start && self.end
    unless start < self.end
      errors.add(:end, 'must occur after the start.')
    end
  end

  def formatted_date
    start.to_date.iso8601
  end

  def formatted_date_with_start_and_end_times
    start_time = start.strftime('%l:%M%P').strip
    end_time = self.end.strftime('%l:%M%P').strip

    "#{formatted_date}, #{start_time}-#{end_time}"
  end

  def start_date_us_format
    start.strftime('%b %d %Y').strip
  end

  def start_date_with_start_and_end_times_us_format
    start_time = start.strftime('%l:%M%P').strip
    end_time = self.end.strftime('%l:%M%P').strip

    "#{start_date_us_format}, #{start_time} - #{end_time}"
  end

  def hours
    (self.end - start) / 1.hour
  end

  def assign_code
    update! code: unused_random_code
  end

  def remove_code
    update! code: nil
  end

  def self.find_by_code(code)
    return nil unless code
    find_by(code: code)
  end

  def open_for_attendance?
    code.present? &&
      !too_soon_for_attendance? &&
      !too_late_for_attendance?
  end

  def too_soon_for_attendance?
    workshop.started_at.nil? || start - 12.hours > Time.zone.now
  end

  def too_late_for_attendance?
    (self.end + 1.day).change({hour: 7}) < Time.zone.now
  end

  def show_link?
    code.present? &&
      !too_soon_for_link? &&
      !too_late_for_attendance?
  end

  def too_soon_for_link?
    workshop.started_at.nil? || start - 48.hours > Time.zone.now
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 4, model: Pd::Session
  end
end
