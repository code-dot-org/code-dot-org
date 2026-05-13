class SectionCalendarOneOffSession < ApplicationRecord
  TIME_FORMAT = SectionCalendarSession::TIME_FORMAT

  belongs_to :section_calendar_plan

  validates :client_id, presence: true,
    uniqueness: {scope: :section_calendar_plan_id}
  validates :session_date, presence: true
  validates :start_time, presence: true, format: {with: TIME_FORMAT}
  validates :duration_minutes,
    numericality: {only_integer: true, greater_than: 0}
  validates :position, numericality: {only_integer: true}

  before_validation :assign_client_id

  def summarize_for_calendar
    {
      id: id,
      clientId: client_id,
      sessionDate: session_date&.iso8601,
      startTime: start_time,
      durationMinutes: duration_minutes,
      position: position,
    }
  end

  private def assign_client_id
    self.client_id ||= SecureRandom.uuid
  end
end
