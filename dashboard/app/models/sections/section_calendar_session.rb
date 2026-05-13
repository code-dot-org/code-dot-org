class SectionCalendarSession < ApplicationRecord
  TIME_FORMAT = /\A([01]\d|2[0-3]):[0-5]\d\z/

  belongs_to :section_calendar_plan

  validates :client_id, presence: true,
    uniqueness: {scope: :section_calendar_plan_id}
  validates :weekday,
    numericality: {
      only_integer: true,
      greater_than_or_equal_to: 0,
      less_than_or_equal_to: 6
    }
  validates :start_time, presence: true, format: {with: TIME_FORMAT}
  validates :duration_minutes,
    numericality: {only_integer: true, greater_than: 0}
  validates :position, numericality: {only_integer: true}

  before_validation :assign_client_id

  def summarize_for_calendar
    {
      id: id,
      clientId: client_id,
      weekday: weekday,
      startTime: start_time,
      durationMinutes: duration_minutes,
      position: position,
      active: active,
    }
  end

  private def assign_client_id
    self.client_id ||= SecureRandom.uuid
  end
end
