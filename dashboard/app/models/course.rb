class Course < ApplicationRecord
  # Some Courses will have an associated Plc::Course, most will not
  belongs_to :plc_course, class_name: 'Plc::Course'
end
