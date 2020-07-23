# == Schema Information
#
# Table name: course_versions
#
#  id                :integer          not null, primary key
#  key               :string(255)      not null
#  display_name      :string(255)      not null
#  properties        :text(65535)
#  content_root_type :string(255)      not null
#  content_root_id   :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_course_versions_on_content_root_type_and_content_root_id  (content_root_type,content_root_id)
#

class CourseVersion < ApplicationRecord
  belongs_to :content_root, polymorphic: true
end
