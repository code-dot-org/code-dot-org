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
  include Rails.application.routes.url_helpers

  belongs_to :course_offering
  has_many :resources
  has_many :vocabularies

  KEY_CHAR_RE = /\d/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only digits; got \"%{value}\"."

  def units
    content_root_type == 'UnitGroup' ? content_root.default_scripts : [content_root]
  end

  # "Interface" for content_root:
  #
  # is_course? - used during seeding to determine whether this object represents the content root for a CourseVersion.
  #   For example, this should return True for the CourseA-2019 Unit and the CSP-2019 UnitGroup. This should return
  #   False for the CSP1-2019 Unit.
  belongs_to :content_root, polymorphic: true

  alias_attribute :version_year, :key

  # For now, delegate any fields stored on the content root so that we can start
  # accessing them via course version. In the future, these fields will be moved
  # into the course version itself.

  delegate :name, to: :content_root

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
    if content_root.is_course?
      raise "version_year must be set, since is_course is true, for: #{content_root.name}" if content_root.version_year.nil_or_empty?

      course_version = CourseVersion.find_or_create_by!(
        course_offering: course_offering,
        key: content_root.version_year,
        display_name: content_root.version_year,
        content_root: content_root,
      )
    else
      course_version = nil
    end

    # Destroy the previously associated CourseVersion and CourseOffering if appropriate. This can happen if either:
    #   - family_name or version_year was changed
    #   - is_course? changed from true to false, such as if "is_course true" was removed from a .script file, or
    #     family_name or version_year was removed from a .course file.
    content_root.course_version&.destroy_and_destroy_parent_if_empty if content_root.course_version != course_version
    content_root.course_version = course_version

    # TODO: add relevant properties from content root to course_version

    course_version
  end

  # Destroys this CourseVersion. Then, if its parent CourseOffering now has no CourseVersions, destroy it too.
  def destroy_and_destroy_parent_if_empty
    destroy!
    course_offering.destroy if course_offering && course_offering.course_versions.empty?
  end

  def contained_lessons
    units.map(&:lessons).flatten
  end

  def all_standards_url
    content_root_type == 'UnitGroup' ? standards_course_path(content_root) : standards_script_path(content_root)
  end

  def self.should_cache?
    Script.should_cache?
  end

  def self.course_offering_keys(content_root_type)
    Rails.cache.fetch("course_version/course_offering_keys/#{content_root_type}", force: !should_cache?) do
      CourseVersion.where(content_root_type: content_root_type).map {|cv| cv.course_offering&.key}.compact.uniq.sort
    end
  end
end
