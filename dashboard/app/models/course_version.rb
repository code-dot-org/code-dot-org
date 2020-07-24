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

  def self.update_course_version(content_root)
    # TODO: Once the Course model is added, change this to just be version_year, since then the
    # unique index will be on (course_id, key).
    key = "#{content_root.family_name}-#{content_root.version_year}"

    unless content_root.is_course?
      CourseVersion.find_by(key: key)&.destroy
      content_root.course_version = nil
      content_root.save
      return nil
    end

    course_version = CourseVersion.find_or_create_by(
      key: key,
      display_name: content_root.version_year,
      content_root: content_root,
    )

    content_root.course_version.destroy if course_version != content_root.course_version
    content_root.course_version = course_version

    # TODO: add relevant properties from content root to course_version

    course_version
  end
end
