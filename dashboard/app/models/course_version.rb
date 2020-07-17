# == Schema Information
#
# Table name: course_versions
#
#  id                :integer          not null, primary key
#  version_name      :string(255)
#  properties        :text(65535)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  content_root_type :string(255)
#  content_root_id   :integer
#
# Indexes
#
#  index_course_versions_on_content_root_type_and_content_root_id  (content_root_type,content_root_id)
#

class CourseVersion < ApplicationRecord
end
