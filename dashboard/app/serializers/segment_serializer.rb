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

class SegmentSerializer < ActiveModel::Serializer
  attributes :id, :start, :end, :workshop_id
end
