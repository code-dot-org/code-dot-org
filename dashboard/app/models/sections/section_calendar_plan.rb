class SectionCalendarPlan < ApplicationRecord
  MODES = %w(weekly_minutes detailed_sessions).freeze

  belongs_to :section
  belongs_to :unit, class_name: 'Unit'
  belongs_to :created_by_user, class_name: 'User', optional: true
  belongs_to :updated_by_user, class_name: 'User', optional: true

  has_many :recurring_sessions,
    -> {order(:weekday, :position, :start_time)},
    class_name: 'SectionCalendarSession',
    dependent: :destroy
  has_many :one_off_sessions,
    -> {order(:session_date, :position, :start_time)},
    class_name: 'SectionCalendarOneOffSession',
    dependent: :destroy
  has_many :cancellations,
    -> {order(:session_date, :id)},
    class_name: 'SectionCalendarCancellation',
    dependent: :destroy
  has_many :items,
    -> {order(:removed, :session_date, :session_sort, :id)},
    class_name: 'SectionCalendarItem',
    dependent: :destroy

  validates :course_name, :unit_position, presence: true
  validates :mode, inclusion: {in: MODES}
  validates :weekly_instructional_minutes,
    numericality: {only_integer: true, greater_than: 0}
  validates :unit_position, numericality: {only_integer: true, greater_than: 0}
  validates :section_id,
    uniqueness: {scope: [:course_name, :unit_position]}

  def summarize_for_calendar
    {
      id: id,
      sectionId: section_id,
      unitId: unit_id,
      courseName: course_name,
      unitPosition: unit_position,
      startDate: start_date&.iso8601,
      mode: mode,
      weeklyInstructionalMinutes: weekly_instructional_minutes,
      recurringSessions: recurring_sessions.map(&:summarize_for_calendar),
      oneOffSessions: one_off_sessions.map(&:summarize_for_calendar),
      cancellations: cancellations.map(&:summarize_for_calendar),
      items: items.map(&:summarize_for_calendar),
    }
  end
end
