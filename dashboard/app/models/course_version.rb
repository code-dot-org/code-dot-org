# == Schema Information
#
# Table name: course_versions
#
#  id           :integer          not null, primary key
#  version_name :string(255)
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class CourseVersion < ApplicationRecord
end
