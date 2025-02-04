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
#  session_format :integer
#  time_zone      :string(255)
#
# Indexes
#
#  index_pd_sessions_on_code            (code) UNIQUE
#  index_pd_sessions_on_pd_workshop_id  (pd_workshop_id)
#

require 'cdo/code_generation'

class Pd::Session < ApplicationRecord
  # creates a hash like {in_person: 0, virtual: 1}
  enum session_format: Pd::SharedWorkshopConstants::PD_SESSION_FORMATS.to_h {|f| [f[:value], f[:enum_value]]}

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: 'pd_workshop_id', optional: true
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: 'pd_session_id', dependent: :destroy

  before_validation :set_default_time_zone

  before_update :prevent_time_zone_change

  validates_presence_of :start, :end
  validate :starts_and_ends_on_the_same_day
  validate :starts_before_ends

  def starts_and_ends_on_the_same_day
    return unless start && self.end
    unless start_time.to_date == end_time.to_date
      errors.add(:end, 'must occur on the same day as the start.')
    end
  end

  def starts_before_ends
    return unless start && self.end
    unless start < self.end
      errors.add(:end, 'must occur after the start.')
    end
  end

  def set_default_time_zone
    self.time_zone = time_zone.present? && ActiveSupport::TimeZone[time_zone].present? ? time_zone : 'UTC'
  end

  def prevent_time_zone_change
    if time_zone_changed?
      self.time_zone = time_zone_was # Revert to the original time_zone
    end
  end

  def start_time
    start.in_time_zone(time_zone || 'UTC')
  end

  def end_time
    self.end.in_time_zone(time_zone || 'UTC')
  end

  def formatted_date
    start_time.to_date.iso8601
  end

  def tz_abbreviation
    return '' if time_zone.blank?
    ActiveSupport::TimeZone[time_zone].tzinfo.current_period.abbreviation.to_s
  end

  def formatted_date_with_start_and_end_times
    formatted_start = start_time.strftime('%l:%M%P').strip
    formatted_end = end_time.strftime('%l:%M%P').strip

    "#{formatted_date}, #{formatted_start}-#{formatted_end} #{tz_abbreviation}".strip
  end

  def session_info_for_calendar
    {
      id: id,
      start: start,
      end: self.end
    }
  end

  def start_date_us_format
    start_time.strftime('%b %d %Y').strip
  end

  def start_date_with_start_and_end_times_us_format
    formatted_start = start_time.strftime('%l:%M%P').strip
    formatted_end = end_time.strftime('%l:%M%P').strip

    "#{start_date_us_format}, #{formatted_start} - #{formatted_end} #{tz_abbreviation}".strip
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

  private def unused_random_code
    CodeGeneration.random_unique_code length: 4, model: Pd::Session
  end
end
