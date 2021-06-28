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

  KEY_CHAR_RE = /[a-z\-]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only lowercase alphabetic characters and dashes; got \"%{value}\"."

  # Seeding method for creating / updating / deleting a CourseOffering and CourseVersion for the given
  # potential content root, i.e. a Script or UnitGroup.
  #
  # Examples:
  #
  # coursea-2019.script represents the content root for Course A, Version 2019.
  # Therefore, it should contain "is_course true", which will cause this method to create the
  # corresponding CourseOffering and CourseVersion objects.
  #
  # csp1-2019.script does not represent a content root (the root for CSP, Version 2019 is a UnitGroup).
  # Therefore, it does not contain "is_course true". so this method will not create any new objects.
  #
  # This method will also delete CourseOfferings and/or CourseVersions that were previously associated with
  # the content_root, if appropriate. See CourseVersion#add_course_version for details.
  def self.add_course_offering(content_root)
    if content_root.is_course?
      raise "family_name must be set, since is_course is true, for: #{content_root.name}" if content_root.family_name.nil_or_empty?

      offering = CourseOffering.find_or_create_by!(key: content_root.family_name, display_name: content_root.family_name)
    else
      offering = nil
    end

    CourseVersion.add_course_version(offering, content_root)

    offering
  end

  def self.should_cache?
    Script.should_cache?
  end

  def self.get_from_cache(key)
    Rails.cache.fetch("course_offering/#{key}", force: !should_cache?) do
      CourseOffering.find_by_key(key)
    end
  end
end
