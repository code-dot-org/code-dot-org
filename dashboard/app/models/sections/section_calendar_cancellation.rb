class SectionCalendarCancellation < ApplicationRecord
  belongs_to :section_calendar_plan
  belongs_to :recurring_session,
    class_name: 'SectionCalendarSession',
    foreign_key: :section_calendar_session_id,
    optional: true
  belongs_to :one_off_session,
    class_name: 'SectionCalendarOneOffSession',
    foreign_key: :section_calendar_one_off_session_id,
    optional: true

  validates :session_date, presence: true
  validate :exactly_one_session_source
  validate :session_source_matches_plan

  def summarize_for_calendar
    {
      id: id,
      sessionDate: session_date&.iso8601,
      recurringSessionClientId: recurring_session&.client_id,
      oneOffSessionClientId: one_off_session&.client_id,
      reason: reason,
    }
  end

  private def exactly_one_session_source
    sources = [section_calendar_session_id, section_calendar_one_off_session_id].compact
    return if sources.size == 1

    errors.add(:base, 'must reference one session source')
  end

  private def session_source_matches_plan
    if recurring_session &&
        recurring_session.section_calendar_plan_id != section_calendar_plan_id
      errors.add(:recurring_session, 'must belong to this plan')
    end

    if one_off_session &&
        one_off_session.section_calendar_plan_id != section_calendar_plan_id
      errors.add(:one_off_session, 'must belong to this plan')
    end
  end
end
