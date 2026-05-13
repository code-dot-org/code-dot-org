class SectionCalendarItem < ApplicationRecord
  ITEM_TYPES = %w(lesson placeholder).freeze

  belongs_to :section_calendar_plan
  belongs_to :lesson, optional: true

  validates :client_id, presence: true,
    uniqueness: {scope: :section_calendar_plan_id}
  validates :item_type, inclusion: {in: ITEM_TYPES}
  validates :planned_minutes,
    numericality: {only_integer: true, greater_than: 0},
    allow_nil: true
  validates :session_sort,
    numericality: {only_integer: true},
    allow_nil: true
  validate :lesson_item_shape
  validate :placeholder_item_shape
  validate :session_sort_with_session_date

  before_validation :assign_client_id

  def summarize_for_calendar
    {
      id: id,
      clientId: client_id,
      itemType: item_type,
      lessonId: lesson_id,
      placeholderTitle: placeholder_title,
      plannedMinutes: planned_minutes,
      sessionDate: session_date&.iso8601,
      sessionClientId: session_client_id,
      sessionSort: session_sort,
      removed: removed,
    }
  end

  private def assign_client_id
    self.client_id ||= SecureRandom.uuid
  end

  private def lesson_item_shape
    return unless item_type == 'lesson'

    errors.add(:lesson_id, 'is required') if lesson_id.blank?
    errors.add(:placeholder_title, 'must be blank') if placeholder_title.present?
  end

  private def placeholder_item_shape
    return unless item_type == 'placeholder'

    errors.add(:placeholder_title, 'is required') if placeholder_title.blank?
    errors.add(:lesson_id, 'must be blank') if lesson_id.present?
  end

  private def session_sort_with_session_date
    return unless session_date.present? && session_sort.nil?

    errors.add(:session_sort, 'is required when session_date is set')
  end
end
