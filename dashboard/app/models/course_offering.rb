# == Schema Information
#
# Table name: course_offerings
#
#  id           :integer          not null, primary key
#  key          :string(255)      not null
#  display_name :string(255)      not null
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_course_offerings_on_key  (key) UNIQUE
#

class CourseOffering < ApplicationRecord
  has_many :course_versions
end
