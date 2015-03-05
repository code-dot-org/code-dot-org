class Segment < ActiveRecord::Base
  has_many :attendances,
           class_name: 'WorkshopAttendance',
           dependent: :destroy
  belongs_to :workshop
end
