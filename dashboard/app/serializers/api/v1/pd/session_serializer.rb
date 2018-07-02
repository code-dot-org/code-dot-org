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

class Api::V1::Pd::SessionSerializer < ActiveModel::Serializer
  attributes :id, :start, :end, :code, :show_link?, :attendance_count

  def attendance_count
    Pd::Attendance.where(session: object).count
  end
end
