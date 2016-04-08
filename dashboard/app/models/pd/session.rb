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
#
# Indexes
#
#  index_pd_sessions_on_pd_workshop_id  (pd_workshop_id)
#

class Pd::Session < ActiveRecord::Base
  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: 'pd_workshop_id'
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: 'pd_session_id', dependent: :destroy

  def formatted_date
    self.start.strftime('%m/%d/%Y')
  end

  def hours
    ((self.end - self.start) / 1.hour).round
  end
end
