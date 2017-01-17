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
#
# Indexes
#
#  index_pd_sessions_on_pd_workshop_id  (pd_workshop_id)
#

class Pd::Session < ActiveRecord::Base
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
    start.strftime('%m/%d/%Y')
  end

  def formatted_date_with_start_and_end_times
    start_time = start.strftime('%l:%M%P').strip
    end_time = self.end.strftime('%l:%M%P').strip

    "#{formatted_date}, #{start_time}-#{end_time}"
  end

  def hours
    (self.end - start) / 1.hour
  end
end
