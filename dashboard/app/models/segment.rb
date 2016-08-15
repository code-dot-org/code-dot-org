# == Schema Information
#
# Table name: segments
#
#  id          :integer          not null, primary key
#  workshop_id :integer          not null
#  start       :datetime         not null
#  end         :datetime
#  created_at  :datetime
#  updated_at  :datetime
#
# Indexes
#
#  index_segments_on_end          (end)
#  index_segments_on_start        (start)
#  index_segments_on_workshop_id  (workshop_id)
#

class Segment < ActiveRecord::Base
  has_many :attendances,
    class_name: 'WorkshopAttendance',
    dependent: :destroy
  belongs_to :workshop
end
