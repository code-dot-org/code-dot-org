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

  def self.add_course_offering(content_root)
    # If content_root is not designated as the content root of a CourseVersion (in its .script or .course file),
    # delete its associated CourseVersion object if it exists. This handles the case where a .script or .course file
    # had "is_course true" at one point, and then later "is_course true" is removed.
    unless content_root.is_course?
      if content_root.course_version
        existing_offering = content_root.course_version.course_offering
        content_root.course_version.destroy
        existing_offering.destroy if existing_offering.course_versions.empty?
        content_root.reload
      end
      return nil
    end

    raise "family_name must be set, since is_course is true, for: #{content_root.name}" if content_root.family_name.nil_or_empty?
    raise "version_year must be set, since is_course is true, for: #{content_root.name}" if content_root.version_year.nil_or_empty?

    original_offering = content_root.course_version&.course_offering
    offering = CourseOffering.find_or_create_by(key: content_root.family_name, display_name: content_root.family_name)
    CourseVersion.add_course_version(offering, content_root)

    # If changes to content_root's family name and/or version year have resulted in its previous CourseOffering having no versions,
    # destroy the old CourseOffering.
    original_offering&.destroy if original_offering != offering && original_offering&.course_versions&.empty?

    # TODO: add relevant properties from content root to course_version

    offering
  end
end
