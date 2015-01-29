class WorkshopAttendance < ActiveRecord::Base
  has_one :segment
  has_one :teacher, source: :user
end
