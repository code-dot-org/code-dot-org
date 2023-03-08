# == Schema Information
#
# Table name: course_offerings
#
#  id                   :integer          not null, primary key
#  key                  :string(255)      not null
#  display_name         :string(255)      not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  category             :string(255)      default("other"), not null
#  is_featured          :boolean          default(FALSE), not null
#  assignable           :boolean          default(TRUE), not null
#  curriculum_type      :string(255)
#  marketing_initiative :string(255)
#  grade_levels         :string(255)
#  header               :string(255)
#
# Indexes
#
#  index_course_offerings_on_key  (key) UNIQUE
#

class CourseOffering < ApplicationRecord
  include Curriculum::SharedCourseConstants

  has_many :course_versions, -> {where(content_root_type: ['UnitGroup', 'Unit'])}

  validates :category, acceptance: {accept: Curriculum::SharedCourseConstants::COURSE_OFFERING_CATEGORIES, message: "must be one of the course offering categories. Expected one of: #{Curriculum::SharedCourseConstants::COURSE_OFFERING_CATEGORIES}. Got: \"%{value}\"."}
  validates :curriculum_type, acceptance: {accept: Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.to_h.values, message: "must be one of the course offering curriculum types. Expected one of: #{Curriculum::SharedCourseConstants::COURSE_OFFERING_CURRICULUM_TYPES.to_h.values}. Got: \"%{value}\"."}
  validates :marketing_initiative, acceptance: {accept: Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.to_h.values, message: "must be one of the course offering marketing initiatives. Expected one of: #{Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.to_h.values}. Got: \"%{value}\"."}

  KEY_CHAR_RE = /[a-z0-9\-]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only lowercase alphabetic characters, numbers, and dashes; got \"%{value}\"."

  ELEMENTARY_SCHOOL_GRADES = %w[K 1 2 3 4 5].freeze
  MIDDLE_SCHOOL_GRADES = %w[6 7 8].freeze
  HIGH_SCHOOL_GRADES = %w[9 10 11 12].freeze

  # Seeding method for creating / updating / deleting a CourseOffering and CourseVersion for the given
  # potential content root, i.e. a Unit or UnitGroup.
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
    Unit.should_cache?
  end

  def self.get_from_cache(key)
    Rails.cache.fetch("course_offering/#{key}", force: !should_cache?) do
      CourseOffering.find_by_key(key)
    end
  end

  # All course versions in a course offering should have the same instructor audience
  def can_be_instructor?(user)
    course_versions.any? {|cv| cv.can_be_instructor?(user)}
  end

  def any_versions_launched?
    course_versions.any?(&:launched?)
  end

  def any_versions_in_development?
    course_versions.any?(&:in_development?)
  end

  def any_version_is_assignable_pilot?(user)
    course_versions.any? {|cv| cv.pilot? && cv.has_pilot_experiment?(user)}
  end

  def any_version_is_assignable_editor_experiment?(user)
    course_versions.any? {|cv| cv.content_root.is_a?(Unit) && cv.has_editor_experiment?(user)}
  end

  def self.assignable_course_offerings(user)
    CourseOffering.all.select {|co| co.can_be_assigned?(user)}
  end

  def self.assignable_course_offerings_info(user, locale_code = 'en-us')
    assignable_course_offerings(user).map {|co| co.summarize_for_assignment_dropdown(user, locale_code)}.to_h
  end

  def self.single_unit_course_offerings_containing_units_info(unit_ids)
    single_unit_course_offerings_containing_units(unit_ids).map {|co| co.summarize_for_unit_selector(unit_ids)}
  end

  def summarize_for_unit_selector(unit_ids)
    {
      display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
      units: course_versions.map(&:units).flatten.select {|u| u.included_in_units?(unit_ids)}.map(&:summarize_for_unit_selector).sort_by {|u| -1 * u[:version_year].to_i}
    }
  end

  def can_be_assigned?(user)
    return false unless assignable?
    return false unless can_be_instructor?(user)
    return true if any_versions_launched?
    return true if any_version_is_assignable_pilot?(user)
    return true if any_version_is_assignable_editor_experiment?(user)
    return true if user.permission?(UserPermission::LEVELBUILDER)

    false
  end

  def summarize_for_assignment_dropdown(user, locale_code)
    [
      id,
      {
        id: id,
        display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
        category: category,
        is_featured: is_featured?,
        participant_audience: course_versions.first.content_root.participant_audience,
        course_versions: course_versions.select {|cv| cv.course_assignable?(user)}.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)}.to_h
      }
    ]
  end

  def summarize_for_quick_assign(user, locale_code)
    {
      id: id,
      key: key,
      display_name: any_versions_launched? ? localized_display_name : localized_display_name + ' *',
      course_versions: course_versions.select {|cv| cv.course_assignable?(user)}.map {|cv| cv.summarize_for_quick_assign(user, locale_code)}
    }
  end

  def localized_display_name
    localized_name = I18n.t(
      key,
      scope: [:data, :course_offerings],
      default: nil
    )
    localized_name || display_name
  end

  def summarize_for_edit
    {
      key: key,
      is_featured: is_featured?,
      category: category,
      display_name: display_name,
      assignable: assignable?,
      curriculum_type: curriculum_type,
      marketing_initiative:  marketing_initiative,
      grade_levels: grade_levels,
      header: header
    }
  end

  def serialize
    {
      key: key,
      display_name: display_name,
      category: category,
      is_featured: is_featured,
      assignable: assignable?,
      curriculum_type: curriculum_type,
      marketing_initiative: marketing_initiative,
      grade_levels: grade_levels,
      header: header
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

  def units_included_in_any_version?(unit_ids)
    course_versions.any? {|cv| cv.included_in_units?(unit_ids)}
  end

  def any_version_is_unit?
    course_versions.any? {|cv| cv.content_root_type == 'Unit'}
  end

  def self.single_unit_course_offerings_containing_units(unit_ids)
    CourseOffering.all.select {|co| co.units_included_in_any_version?(unit_ids) && co.any_version_is_unit?}
  end

  def csd?
    key == 'csd'
  end

  def hoc?
    category == 'hoc' || marketing_initiative == Curriculum::SharedCourseConstants::COURSE_OFFERING_MARKETING_INITIATIVES.hoc
  end

  def get_participant_audience
    course_versions&.first&.content_root&.participant_audience
  end

  def grade_levels_list
    return [] if grade_levels.nil?
    grade_levels.strip.split(',')
  end

  def elementary_school_level?
    grade_levels_list.any? {|g| ELEMENTARY_SCHOOL_GRADES.include?(g)}
  end

  def middle_school_level?
    grade_levels_list.any? {|g| MIDDLE_SCHOOL_GRADES.include?(g)}
  end

  def high_school_level?
    grade_levels_list.any? {|g| HIGH_SCHOOL_GRADES.include?(g)}
  end
end
