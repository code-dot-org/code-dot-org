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
#  published_state    :string(255)      default("in_development")
#
# Indexes
#
#  index_course_versions_on_content_root_type_and_content_root_id  (content_root_type,content_root_id)
#  index_course_versions_on_course_offering_id                     (course_offering_id)
#  index_course_versions_on_offering_id_and_key_and_type           (course_offering_id,key,content_root_type) UNIQUE
#

class CourseVersion < ApplicationRecord
  include Rails.application.routes.url_helpers

  belongs_to :course_offering, optional: true
  has_many :resources
  has_many :vocabularies
  has_many :reference_guides

  attr_readonly :content_root_type
  attr_readonly :content_root_id

  KEY_CHAR_RE = /[a-z0-9\-]/
  KEY_RE = /\A#{KEY_CHAR_RE}+\Z/
  validates_format_of :key,
    with: KEY_RE,
    message: "must contain only digits, letters, or dashes; got \"%{value}\"."

  # Placeholder key for curriculum that will not be updated but want the
  # features that come with a course version (resources, vocab, etc)
  UNVERSIONED = 'unversioned'.freeze

  def units
    content_root_type == 'UnitGroup' ? content_root.default_units : [content_root]
  end

  # "Interface" for content_root:
  #
  # is_course? - used during seeding to determine whether this object represents the content root for a CourseVersion.
  #   For example, this should return True for the CourseA-2019 Unit and the CSP-2019 UnitGroup. This should return
  #   False for the CSP1-2019 Unit.
  belongs_to :content_root, polymorphic: true, optional: true

  alias_attribute :version_year, :key

  # For now, delegate any fields stored on the content root so that we can start
  # accessing them via course version. In the future, these fields will be moved
  # into the course version itself.

  delegate :name, to: :content_root, allow_nil: true
  delegate :localized_title, to: :content_root, allow_nil: true
  delegate :pl_course?, to: :content_root, allow_nil: true
  delegate :stable?, to: :content_root, allow_nil: true
  delegate :launched?, to: :content_root, allow_nil: true
  delegate :in_development?, to: :content_root, allow_nil: true
  delegate :pilot?, to: :content_root, allow_nil: true
  delegate :has_pilot_experiment?, to: :content_root, allow_nil: true
  delegate :has_editor_experiment?, to: :content_root, allow_nil: true
  delegate :can_be_instructor?, to: :content_root, allow_nil: true
  delegate :course_assignable?, to: :content_root, allow_nil: true
  delegate :can_view_version?, to: :content_root, allow_nil: true
  delegate :included_in_units?, to: :content_root, allow_nil: true
  delegate :link, to: :content_root, allow_nil: false
  delegate :localized_assignment_family_title, to: :content_root, allow_nil: false

  # Seeding method for creating / updating / deleting the CourseVersion for the given
  # potential content root, i.e. a Unit or UnitGroup.
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

      course_version = CourseVersion.find_or_initialize_by(
        course_offering: course_offering,
        key: content_root.version_year,
        display_name: content_root.version_year,
        content_root: content_root,
      )
      course_version.published_state = content_root.published_state
    else
      course_version = nil
    end

    # Check if we should prevent saving the new course version:
    # - We can always add a course version if the content_root didn't previously have one
    # - If the content root's previous course version equals the new one, then there's no change
    # - If the content_root doesn't prevent a course version change, we can safely change it
    if content_root.course_version && content_root.course_version != course_version && content_root.prevent_course_version_change?
      raise "cannot change course version of #{content_root.name}"
    end
    course_version&.save!

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
    Unit.should_cache?
  end

  def self.course_offering_keys(content_root_type)
    Rails.cache.fetch("course_version/course_offering_keys/#{content_root_type}", force: !should_cache?) do
      CourseVersion.includes(:course_offering).where(content_root_type: content_root_type).filter_map {|cv| cv.course_offering&.key}.uniq.sort
    end
  end

  def recommended?(locale_code = 'en-us')
    return false unless stable?
    return true if course_offering.course_versions.length == 1

    family_name = course_offering.key
    latest_stable_version = content_root_type == 'UnitGroup' ? UnitGroup.latest_stable_version(family_name, locale: locale_code) : Unit.latest_stable_version(family_name, locale: locale_code)

    latest_stable_version == content_root
  end

  # We use Course Offerings for single unit course offerings because
  # we want to group together all the course offerings across years.
  # So all the Course A's are together under the Course A header.
  # Where as for unit group courses we want to have all the units for a
  # specific year grouped together under the unit group for that year. So
  # CSD has multiple headers in the list with the units for that year under it.
  # See fakeCoursesWithProgress in teacherDashboardTestHelpers.js for an example of what
  # the resulting data looks like
  def self.courses_for_unit_selector(unit_ids)
    CourseOffering.single_unit_course_offerings_containing_units_info(unit_ids).concat(CourseVersion.unit_group_course_versions_with_units_info(unit_ids)).sort_by {|c| c[:display_name]}
  end

  def summarize_for_assignment_dropdown(user, locale_code)
    [
      id,
      {
        id: id,
        key: key,
        version_year: content_root_type == 'UnitGroup' ? content_root.localized_version_title : display_name,
        content_root_id: content_root.id,
        name: content_root.localized_title,
        path: content_root.link,
        type: content_root_type,
        is_stable: stable?,
        is_recommended: recommended?(locale_code),
        locales: content_root.supported_locale_names,
        units: units.select {|u| u.course_assignable?(user)}.map(&:summarize_for_assignment_dropdown).to_h
      }
    ]
  end

  def self.unit_group_course_versions_with_units(unit_ids)
    CourseVersion.where(content_root_type: 'UnitGroup').all.select {|cv| cv.included_in_units?(unit_ids)}
  end

  def self.unit_group_course_versions_with_units_info(unit_ids)
    unit_group_course_versions_with_units(unit_ids).map(&:summarize_for_unit_selector)
  end

  def summarize_for_unit_selector
    {
      display_name: content_root.launched? ? content_root.localized_title : content_root.localized_title + ' *',
      units: units.map(&:summarize_for_unit_selector).sort_by {|u| u[:position]}
    }
  end

  def hoc?
    !!course_offering&.hoc?
  end
end
