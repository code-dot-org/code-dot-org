# == Schema Information
#
# Table name: course_offerings
#
#  id           :integer          not null, primary key
#  key          :string(255)      not null
#  display_name :string(255)      not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  category     :string(255)      default("other"), not null
#  is_featured  :boolean          default(FALSE), not null
#
# Indexes
#
#  index_course_offerings_on_key  (key) UNIQUE
#

class CourseOffering < ApplicationRecord
  has_many :course_versions

  KEY_CHAR_RE = /[a-z0-9\-]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only lowercase alphabetic characters, numbers, and dashes; got \"%{value}\"."

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

      offering = CourseOffering.find_or_create_by!(key: content_root.family_name) do |co|
        co.display_name = content_root.family_name if co.display_name.nil_or_empty?
      end

      if Rails.application.config.levelbuilder_mode
        offering.write_serialization
      end
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

  def can_be_instructor?(user)
    course_versions.any? {|cv| cv.can_be_instructor?(user)}
  end

  def pl_course?
    course_versions.any?(&:pl_course?)
  end

  def any_versions_launched?
    course_versions.any?(&:launched?)
  end

  def any_versions_in_development?
    course_versions.any?(&:in_development?)
  end

  def any_version_has_pilot_access?(user)
    course_versions.any? {|cv| cv.has_pilot_access?(user)}
  end

  def self.assignable_course_offerings(user)
    CourseOffering.all.select {|co| co.assignable?(user)}
  end

  def self.assignable_course_offerings_info(user, locale_code = nil)
    assignable_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user, locale_code)}
  end

  def self.assignable_pl_course_offerings(user)
    assignable_course_offerings(user).select(&:pl_course?)
  end

  def self.assignable_pl_course_offerings_info(user, locale_code = nil)
    assignable_pl_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user, locale_code)}
  end

  def assignable?(user)
    return false unless can_be_instructor?(user)
    return true if any_versions_launched?
    return true if Script.has_any_pilot_access?(user) && any_version_has_pilot_access?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER) && any_versions_in_development?

    false
  end

  def summarize_for_assignment_dropdown(user, locale_code)
    {
      id: id,
      display_name: display_name,
      category: category,
      is_featured: is_featued?,
      course_versions: course_versions.select {|cv| cv.course_assignable?(user)}.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)}
    }
  end

  def serialize
    {
      key: key,
      display_name: display_name,
      category: category,
      is_featured: is_featured
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/course_offerings/#{key}.json")
    object_to_serialize = serialize
    File.write(file_path, JSON.pretty_generate(object_to_serialize) + "\n")
  end

  def self.seed_all(glob="config/course_offerings/*.json")
    removed_records = all.pluck(:key)
    Dir.glob(Rails.root.join(glob)).each do |path|
      removed_records -= [CourseOffering.seed_record(path)]
    end
    where(key: removed_records).destroy_all
  end

  def self.properties_from_file(content)
    config = JSON.parse(content)
    config.symbolize_keys
  end

  # Returns the course offering key to help in removing records
  # that are no longer in use during the seeding process. See
  # seed_all
  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    course_offering = CourseOffering.find_or_initialize_by(key: properties[:key])
    course_offering.update! properties
    course_offering.key
  end
end
