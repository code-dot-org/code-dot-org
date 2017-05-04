class Course < ApplicationRecord
  has_one :plc_course, class_name: 'Plc::Course', inverse_of: :course
end
