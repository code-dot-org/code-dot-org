# == Schema Information
#
# Table name: course_versions
#
#  id                 :integer          not null, primary key
#  version_name       :string(255)
#  properties         :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  content_root_type  :string(255)
#  content_root_id    :integer
#  course_offering_id :integer
#
# Indexes
#
#  index_course_versions_on_content_root_type_and_content_root_id  (content_root_type,content_root_id)
#  index_course_versions_on_course_offering_id                     (course_offering_id)
#  index_course_versions_on_course_offering_id_and_version_name    (course_offering_id,version_name) UNIQUE
#

class CourseVersion < ApplicationRecord
  belongs_to :course_offering
  belongs_to :content_root, polymorphic: true
end
