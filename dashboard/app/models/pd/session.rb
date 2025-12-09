# == Schema Information
#
# Table name: pd_sessions
#
#  id               :integer          not null, primary key
#  pd_workshop_id   :integer
#  start            :datetime         not null
#  end              :datetime         not null
#  created_at       :datetime
#  updated_at       :datetime
#  deleted_at       :datetime
#  code             :string(255)
#  session_format   :integer
#  time_zone        :string(255)
#  meeting_link     :text(65535)
#  location_name    :string(255)
#  location_address :string(255)
#
# Indexes
#
#  index_pd_sessions_on_code            (code) UNIQUE
#  index_pd_sessions_on_pd_workshop_id  (pd_workshop_id)
#

require 'cdo/code_generation'

class Pd::Session < ApplicationRecord
  include Pd::UrlValidator

  # creates a hash like {in_person: 0, virtual: 1}
  enum session_format: Pd::SharedWorkshopConstants::PD_SESSION_FORMATS.to_h {|f| [f[:value], f[:enum_value]]}

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: 'pd_workshop_id', optional: true
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: 'pd_session_id', dependent: :destroy

  validates_presence_of :start, :end
  validate :starts_and_ends_on_the_same_day
  validate :starts_before_ends
  validate :valid_meeting_link_format, if: :meeting_link?

  def starts_and_ends_on_the_same_day
    return unless start && self.end
    unless start_time.to_date == end_time.to_date
      errors.add(:end, 'must occur on the same day as the start')
    end
  end

  def starts_before_ends
    return unless start && self.end
    unless start < self.end
      errors.add(:end, 'must occur after the start')
    end
  end

  def valid_meeting_link_format
    unless self.class.valid_url?(meeting_link)
      errors.add(:meeting_link, "is not valid or is missing http or https")
    end
  end

  def start_time
    start.in_time_zone(workshop.time_zone || 'UTC')
  end

  def end_time
    self.end.in_time_zone(workshop.time_zone || 'UTC')
  end

  def formatted_date
    start_time.to_date.iso8601
  end

  def tz_abbreviation
    return '' if workshop.time_zone.blank? || start.blank?

    time_zone_obj = ActiveSupport::TimeZone[workshop.time_zone]
    return '' unless time_zone_obj

    time_zone_obj.tzinfo.period_for_utc(start).abbreviation.to_s
  end

  def formatted_date_with_start_and_end_times
    formatted_start = start_time.strftime('%l:%M%P').strip
    formatted_end = end_time.strftime('%l:%M%P').strip

    "#{formatted_date}, #{formatted_start}-#{formatted_end} #{tz_abbreviation}".strip
  end

  def formatted_location_details
    if in_person?
      location_parts = [location_name.presence, location_address.presence].compact
      location_parts.any? ? location_parts.join(', ') : "N/A"
    else
      meeting_link ? "Virtual meeting: #{meeting_link}" : "N/A"
    end
  end

  def session_info_for_calendar
    {
      id: id,
      start: start_time.utc.iso8601,
      end: end_time.utc.iso8601,
      is_local: local?,
      location_name: location_name,
      location_address: location_address,
      meeting_link: meeting_link,
      session_format: session_format,
      description: workshop.description,
      notes: workshop.notes,
    }
  end

  def session_info_for_emails
    {
      datetime: start_date_with_start_and_end_times_us_format,
      format: session_format,
      meeting_link: meeting_link || '',
      location: formatted_location_details
    }
  end

  def local?
    workshop.time_zone.blank?
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
