# == Schema Information
#
# Table name: course_versions
#
#  id                 :integer          not null, primary key
#  key                :string(255)      not null
#  display_name       :string(255)      not null
#  properties         :text(65535)
#  content_root_type  :string(255)      not null
#  content_root_id    :integer          not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  course_offering_id :integer
#
# Indexes
#
#  index_course_versions_on_content_root_type_and_content_root_id  (content_root_type,content_root_id)
#  index_course_versions_on_course_offering_id                     (course_offering_id)
#  index_course_versions_on_course_offering_id_and_key             (course_offering_id,key) UNIQUE
#

class CourseVersion < ApplicationRecord
  belongs_to :course_offering

  # "Interface" for content_root:
  #
  # is_course? - used during seeding to determine whether this object represents the content root for a CourseVersion.
  #   For example, this should return True for the CourseA-2019 Unit and the CSP-2019 UnitGroup. This should return
  #   False for the CSP1-2019 Unit.
  belongs_to :content_root, polymorphic: true

  # Seeding method for creating / updating / deleting the CourseVersion for the given
  # potential content root, i.e. a Script or UnitGroup.
  #
  # Examples:
  #
  # coursea-2019.script represents the content root for Course A, Version 2019.
  # Therefore, it should contain "is_course true", which will cause this method to create the
  # corresponding CourseVersion object.
  #
  # csp1-2019.script does not represent a content root (the root for CSP, Version 2019 is a UnitGroup).
  # Therefore, it does not contain "is_course true". so this method will not create a CourseVersion object for it.
  def self.add_course_version(course_offering, content_root)
    # If content_root is not designated as the content root of a CourseVersion (in its .script or .course file),
    # delete its associated CourseVersion object if it exists. This handles the case where a .script or .course file
    # had "is_course true" at one point, and then later "is_course true" is removed.
    unless content_root.is_course?
      if content_root.course_version
        content_root.course_version.destroy
        content_root.reload
      end
      return nil
    end

    raise "version_year must be set, since is_course is true, for: #{content_root.name}" if content_root.version_year.nil_or_empty?

    course_version = CourseVersion.find_or_create_by(
      course_offering: course_offering,
      key: content_root.version_year,
      display_name: content_root.version_year,
      content_root: content_root,
    )

    # Delete old CourseVersion if the key has been changed to something else
    content_root.course_version.destroy if course_version != content_root.course_version
    content_root.course_version = course_version

    # TODO: add relevant properties from content root to course_version

    course_version
  end
end
