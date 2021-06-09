# == Schema Information
#
# Table name: unit_groups
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  properties      :text(65535)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  published_state :string(255)
#
# Indexes
#
#  index_unit_groups_on_name  (name)
#

require 'cdo/script_constants'

class UnitGroup < ApplicationRecord
  # Some Courses will have an associated Plc::Course, most will not
  has_one :plc_course, class_name: 'Plc::Course', foreign_key: 'course_id'
  has_many :default_unit_group_units, -> {where(experiment_name: nil).order('position ASC')}, class_name: 'UnitGroupUnit', dependent: :destroy, foreign_key: 'course_id'
  has_many :default_scripts, through: :default_unit_group_units, source: :script
  has_many :alternate_unit_group_units, -> {where.not(experiment_name: nil)}, class_name: 'UnitGroupUnit', dependent: :destroy, foreign_key: 'course_id'
  has_and_belongs_to_many :resources, join_table: :unit_groups_resources
  has_many :unit_groups_student_resources, dependent: :destroy
  has_many :student_resources, through: :unit_groups_student_resources, source: :resource
  has_one :course_version, as: :content_root

  after_save :write_serialization

  scope :with_associated_models, -> {includes([:plc_course, :default_unit_group_units])}

  FAMILY_NAMES = [
    CSD = 'csd'.freeze,
    CSP = 'csp'.freeze,
    CSA = 'csa'.freeze,
    TEST = 'ui-test-course'.freeze
  ].freeze

  def skip_name_format_validation
    !!plc_course
  end

  include SerializedToFileValidation
  include SerializedProperties

  serialized_attrs %w(
    teacher_resources
    has_verified_resources
    has_numbered_units
    family_name
    version_year
    is_stable
    visible
    pilot_experiment
    announcements
  )

  def to_param
    name
  end

  def localized_title
    I18n.t("data.course.name.#{name}.title", default: name)
  end

  def localized_assignment_family_title
    I18n.t("data.course.name.#{name}.assignment_family_title", default: localized_title)
  end

  def localized_version_title
    I18n.t("data.course.name.#{name}.version_title", default: version_year)
  end

  # Any course with a plc_course or no family_name is considered stable.
  # All other courses must specify an is_stable boolean property.
  def stable?
    return true if plc_course || !family_name

    is_stable || false
  end

  def self.file_path(name)
    Rails.root.join("config/courses/#{name}.course")
  end

  def self.load_from_path(path)
    serialization = File.read(path)
    hash = JSON.parse(serialization)
    UnitGroup.seed_from_hash(hash)
  end

  def self.create_resource_from_hash(resource_data, course_version_id)
    resource_attrs = resource_data.except('seeding_key')
    resource_attrs['course_version_id'] = course_version_id
    resource = Resource.find_or_initialize_by(key: resource_attrs['key'], course_version_id: course_version_id)
    resource.assign_attributes(resource_attrs)
    resource.save! if resource.changed?
    resource
  end

  def self.seed_from_hash(hash)
    unit_group = UnitGroup.find_or_create_by!(name: hash['name'])
    unit_group.update_scripts(hash['script_names'], hash['alternate_scripts'])
    unit_group.properties = hash['properties']

    # add_course_offering creates the course version
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version

    if course_version
      unit_group.resources = (hash['resources'] || []).map {|resource_data| create_resource_from_hash(resource_data, course_version.id)}
      unit_group.student_resources = (hash['student_resources'] || []).map {|resource_data| create_resource_from_hash(resource_data, course_version.id)}
    end

    unit_group.save!
    unit_group
  rescue Exception => e
    # print filename for better debugging
    new_e = Exception.new("in course: #{hash['name']}: #{e.message}")
    new_e.set_backtrace(e.backtrace)
    raise new_e
  end

  # Updates courses.en.yml with our new localizeable strings
  # @param name [string] - name of the course being updated
  # @param course_strings[Hash{String => String}]
  def self.update_strings(name, course_strings)
    courses_yml = File.expand_path('config/locales/courses.en.yml')
    i18n = File.exist?(courses_yml) ? YAML.load_file(courses_yml) : {}

    i18n.deep_merge!({'en' => {'data' => {'course' => {'name' => {name => course_strings.to_h}}}}})
    File.write(courses_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
  end

  def serialize
    JSON.pretty_generate(
      {
        name: name,
        script_names: default_unit_group_units.map(&:script).map(&:name),
        alternate_scripts: summarize_alternate_scripts,
        properties: properties,
        resources: resources.map {|r| Services::ScriptSeed::ResourceSerializer.new(r, scope: {}).as_json},
        student_resources: student_resources.map {|r| Services::ScriptSeed::ResourceSerializer.new(r, scope: {}).as_json}
      }.compact
    )
  end

  def summarize_alternate_scripts
    alternates = alternate_unit_group_units.all
    return nil if alternates.empty?
    alternates.map do |ugu|
      {
        experiment_name: ugu.experiment_name,
        alternate_script: ugu.script.name,
        default_script: ugu.default_script.name
      }
    end
  end

  # This method updates both our localizeable strings related to this course, and
  # the set of scripts that are in the course, then writes out our serialization
  # @param scripts [Array<String>] - Updated list of names of scripts in this course
  # @param alternate_scripts [Array<Hash>] Updated list of alternate scripts in this course
  # @param course_strings[Hash{String => String}]
  def persist_strings_and_scripts_changes(scripts, alternate_scripts, course_strings)
    UnitGroup.update_strings(name, course_strings)
    update_scripts(scripts, alternate_scripts) if scripts
    save!
  end

  # @param types [Array<string>]
  # @param links [Array<string>]
  def update_teacher_resources(types, links)
    return if types.nil? || links.nil? || types.length != links.length
    # Only take those pairs in which we have both a type and a link
    self.teacher_resources = types.zip(links).select {|type, link| type.present? && link.present?}
    save!
  end

  def write_serialization
    # Only save non-plc course, and only in LB mode
    return unless Rails.application.config.levelbuilder_mode && !plc_course
    File.write(UnitGroup.file_path(name), serialize)
  end

  # @param new_scripts [Array<String>]
  # @param alternate_scripts [Array<Hash>] An array of hashes containing fields
  #   'alternate_script', 'default_script' and 'experiment_name'. Optional.
  def update_scripts(new_scripts, alternate_scripts = nil)
    alternate_scripts ||= []
    new_scripts = new_scripts.reject(&:empty?)
    new_scripts_objects = new_scripts.map {|s| Script.find_by_name!(s)}
    # we want to delete existing unit group units that aren't in our new list
    scripts_to_remove = default_unit_group_units.map(&:script) - new_scripts_objects
    scripts_to_remove -= alternate_scripts.map {|hash| Script.find_by_name!(hash['alternate_script'])}

    if scripts_to_remove.any?(&:prevent_course_version_change?)
      raise 'Cannot remove scripts that have resources or vocabulary'
    end

    if new_scripts_objects.any? do |s|
      s.unit_group != self && s.prevent_course_version_change?
    end
      raise 'Cannot add scripts that have resources or vocabulary'
    end

    new_scripts_objects.each_with_index do |script, index|
      unit_group_unit = UnitGroupUnit.find_or_create_by!(unit_group: self, script: script) do |ugu|
        ugu.position = index + 1
      end
      unit_group_unit.update!(position: index + 1)
    end

    alternate_scripts.each do |hash|
      alternate_script = Script.find_by_name!(hash['alternate_script'])
      default_script = Script.find_by_name!(hash['default_script'])
      # alternate scripts should have the same position as the script they replace.
      position = default_unit_group_units.find_by(script: default_script).position
      unit_group_unit = UnitGroupUnit.find_or_create_by!(unit_group: self, script: alternate_script) do |ugu|
        ugu.position = position
        ugu.experiment_name = hash['experiment_name']
        ugu.default_script = default_script
      end
      unit_group_unit.update!(
        position: position,
        experiment_name: hash['experiment_name'],
        default_script: default_script
      )
    end

    scripts_to_remove.each do |script|
      UnitGroupUnit.where(unit_group: self, script: script).destroy_all
    end
    # Reload model so that default_unit_group_units is up to date
    transaction {reload}
  end

  # Get the assignable info for this course, then update translations
  # @return AssignableInfo
  def assignable_info(user = nil)
    info = ScriptConstants.assignable_info(self)
    # ScriptConstants gives us untranslated versions of our course name, and the
    # category it's in. Set translated strings here
    info[:name] = localized_title
    info[:assignment_family_name] = family_name || name
    info[:assignment_family_title] = localized_assignment_family_title
    info[:version_year] = version_year || ScriptConstants::DEFAULT_VERSION_YEAR
    info[:version_title] = localized_version_title
    info[:is_stable] = stable?
    info[:pilot_experiment] = pilot_experiment
    info[:category] = I18n.t('courses_category')
    # Dropdown is sorted by category_priority ascending. "Full courses" should appear at the top.
    info[:category_priority] = -1
    info[:script_ids] = user ?
      scripts_for_user(user).map(&:id) :
      default_unit_group_units.map(&:script_id)
    info
  end

  def self.all_courses
    all_courses = Rails.cache.fetch('valid_courses/all') do
      UnitGroup.all.to_a
    end
    all_courses.freeze
  end

  # Get the set of valid courses for the dropdown in our sections table. This
  # should be static data for users without any course experiments enabled, but
  # contains localized strings so we can only cache on a per locale basis.
  #
  # @param [User] user Whose experiments to check for possible script substitutions.
  def self.valid_courses(user: nil)
    # Do not cache if the user might have a course experiment enabled which puts them
    # on an alternate script.
    if user && has_any_course_experiments?(user)
      return UnitGroup.valid_courses_without_cache
    end

    courses = Rails.cache.fetch("valid_courses/#{I18n.locale}") do
      UnitGroup.valid_courses_without_cache.to_a
    end
    courses.freeze

    if user && has_any_pilot_access?(user)
      pilot_courses = all_courses.select {|c| c.has_pilot_access?(user)}
      courses += pilot_courses
    end

    courses
  end

  def self.valid_course_infos(user: nil)
    return UnitGroup.valid_courses(user: user).map {|c| c.assignable_info(user)}
  end

  # @param user [User]
  # @returns [Boolean] Whether the user has any experiment enabled which is
  #   associated with an alternate unit group unit.
  def self.has_any_course_experiments?(user)
    Experiment.any_enabled?(user: user, experiment_names: UnitGroupUnit.experiments)
  end

  # Get the set of valid courses for the dropdown in our sections table.
  def self.valid_courses_without_cache
    UnitGroup.all.select(&:launched?)
  end

  # Returns whether the course id is valid, even if it is not "stable" yet.
  # @param course_id [String] id of the course we're checking the validity of
  # @return [Boolean] Whether this is a valid course ID
  def self.valid_course_id?(course_id)
    valid_courses.any? {|unit_group| unit_group.id == course_id.to_i}
  end

  # @param user [User]
  # @returns [Boolean] Whether the user can assign this course.
  # Users should only be able to assign one of their valid courses.
  def assignable_for_user?(user)
    if user&.teacher?
      UnitGroup.valid_course_id?(id)
    end
  end

  # A course that the general public can assign. Has been soft or
  # hard launched.
  def launched?
    [SharedConstants::PUBLISHED_STATE.preview, SharedConstants::PUBLISHED_STATE.stable].include?(published_state)
  end

  def published_state
    if pilot?
      SharedConstants::PUBLISHED_STATE.pilot
    elsif visible
      if is_stable
        SharedConstants::PUBLISHED_STATE.stable
      else
        SharedConstants::PUBLISHED_STATE.preview
      end
    else
      SharedConstants::PUBLISHED_STATE.beta
    end
  end

  def summarize(user = nil)
    {
      name: name,
      id: id,
      title: localized_title,
      assignment_family_title: localized_assignment_family_title,
      family_name: family_name,
      version_year: version_year,
      published_state: published_state,
      pilot_experiment: pilot_experiment,
      description_short: I18n.t("data.course.name.#{name}.description_short", default: ''),
      description_student: Services::MarkdownPreprocessor.process(I18n.t("data.course.name.#{name}.description_student", default: '')),
      description_teacher: Services::MarkdownPreprocessor.process(I18n.t("data.course.name.#{name}.description_teacher", default: '')),
      version_title: I18n.t("data.course.name.#{name}.version_title", default: ''),
      scripts: scripts_for_user(user).map do |script|
        include_lessons = false
        script.summarize(include_lessons, user).merge!(script.summarize_i18n_for_display(include_lessons))
      end,
      teacher_resources: teacher_resources,
      migrated_teacher_resources: resources.map(&:summarize_for_resources_dropdown),
      student_resources: student_resources.map(&:summarize_for_resources_dropdown),
      is_migrated: has_migrated_script?,
      has_verified_resources: has_verified_resources?,
      has_numbered_units: has_numbered_units?,
      versions: summarize_versions(user),
      show_assign_button: assignable_for_user?(user),
      announcements: announcements,
      course_version_id: course_version&.id,
      course_path: link
    }
  end

  def summarize_for_rollup(user = nil)
    {
      title: localized_title,
      link: link,
      version_title: I18n.t("data.course.name.#{name}.version_title", default: ''),
      units: scripts_for_user(user).map do |script|
        script.summarize_for_rollup(user)
      end,
      has_numbered_units: has_numbered_units?
    }
  end

  def link
    Rails.application.routes.url_helpers.course_path(self)
  end

  def summarize_short
    {
      name: name,
      title: I18n.t("data.course.name.#{name}.title", default: ''),
      description: I18n.t("data.course.name.#{name}.description_short", default: ''),
      link: link,
    }
  end

  # Returns an array of objects showing the name and version year for all courses
  # sharing the family_name of this course, including this one.
  def summarize_versions(user = nil)
    return [] unless family_name

    # Include launched courses, plus self if not already included
    courses = UnitGroup.valid_courses(user: user).clone(freeze: false)
    courses.append(self) unless courses.any? {|c| c.id == id}

    versions = courses.
      select {|c| c.family_name == family_name}.
      map do |c|
        {
          name: c.name,
          version_year: c.version_year,
          version_title: c.localized_version_title,
          can_view_version: c.can_view_version?(user),
          is_stable: c.stable?
        }
      end

    versions.sort_by {|info| info[:version_year]}.reverse
  end

  # If a user has no experiments enabled, return the default set of scripts.
  # If a user has an experiment enabled corresponding to an alternate script in
  # this course, use the alternate script in place of the default script with
  # the same position.
  # @param user [User]
  # @return [Array<Script>]
  def scripts_for_user(user)
    default_unit_group_units.map do |ugu|
      select_unit_group_unit(user, ugu).script
    end
  end

  # Return an alternate unit group unit associated with the specified default
  # unit group unit (or the default unit group unit itself) by evaluating these
  # rules in order:
  #
  # 1. If the user is a teacher, and they have a course experiment enabled,
  # show the corresponding alternate unit group unit.
  #
  # 2. If the user is in a section assigned to this course: show an alternate
  # unit group unit if any section's teacher is in a corresponding course
  # experiment, otherwise show the default unit group unit.
  #
  # 3. If the user is a student and has progress in an alternate unit group unit,
  # show the alternate unit group unit.
  #
  # 4. Otherwise, show the default unit group unit.
  #
  # @param user [User|nil]
  # @param default_unit_group_unit [UnitGroupUnit]
  # @return [UnitGroupUnit]
  def select_unit_group_unit(user, unit_group_unit)
    return unit_group_unit unless user

    alternates = alternate_unit_group_units.where(default_script: unit_group_unit.script).all

    if user.teacher?
      alternates.each do |ugu|
        return ugu if SingleUserExperiment.enabled?(user: user, experiment_name: ugu.experiment_name)
      end
    end

    course_sections = user.sections_as_student.where(unit_group: self)
    unless course_sections.empty?
      alternates.each do |ugu|
        course_sections.each do |section|
          return ugu if SingleUserExperiment.enabled?(user: section.teacher, experiment_name: ugu.experiment_name)
        end
      end
      return unit_group_unit
    end

    if user.student?
      alternates.each do |ugu|
        # include hidden scripts when iterating over user scripts.
        user.user_scripts.each do |us|
          return ugu if ugu.script == us.script
        end
      end
    end

    unit_group_unit
  end

  # @param user [User]
  # @return [String] URL to the course the user should be redirected to.
  def redirect_to_course_url(user)
    # Only redirect students.
    return nil unless user && user.student?
    # No redirect unless user is allowed to view this course version, they are not assigned to the course,
    # and it is versioned.
    return nil unless can_view_version?(user) && !user.assigned_course?(self) && version_year

    # Redirect user to the latest assigned course in this course family,
    # if one exists and it is newer than the current course.
    latest_assigned_version = UnitGroup.latest_assigned_version(family_name, user)
    latest_assigned_version_year = latest_assigned_version&.version_year
    return nil unless latest_assigned_version_year && latest_assigned_version_year > version_year
    latest_assigned_version.link
  end

  # @param user [User]
  # @return [Boolean] Whether the user can view the course.
  def can_view_version?(user = nil)
    latest_course_version = UnitGroup.latest_stable_version(family_name)
    is_latest = latest_course_version == self

    # All users can see the latest course version.
    return true if is_latest

    # Restrictions only apply to students and logged out users.
    return false if user.nil?
    return true unless user.student?

    # A student can view the course version if they are assigned to it or they have progress in it.
    user.section_courses.include?(self) || has_progress?(user)
  end

  # @param family_name [String] The family name for a course family.
  # @return [UnitGroup] Returns the latest stable version in a course family.
  def self.latest_stable_version(family_name)
    return nil unless family_name.present?

    UnitGroup.
      # select only courses in the same course family.
      where("properties -> '$.family_name' = ?", family_name).
      # select only stable courses.
      where("properties -> '$.is_stable'").
      # order by version year.
      order("properties -> '$.version_year' DESC")&.
      first
  end

  # @param family_name [String] The family name for a course family.
  # @param user [User]
  # @return [UnitGroup] Returns the latest version in a course family that the user is assigned to.
  def self.latest_assigned_version(family_name, user)
    return nil unless family_name && user
    assigned_course_ids = user.section_courses.pluck(:id)

    UnitGroup.
      # select only courses assigned to this user.
      where(id: assigned_course_ids).
      # select only courses in the same course family.
      where("properties -> '$.family_name' = ?", family_name).
      # order by version year.
      order("properties -> '$.version_year' DESC")&.
      first
  end

  # @param user [User]
  # @return [Boolean] Whether the user has progress in this course.
  def has_progress?(user)
    return nil unless user
    user_script_ids = user.user_scripts.pluck(:script_id)
    unit_group_units_with_progress = default_unit_group_units.where('course_scripts.script_id' => user_script_ids)

    unit_group_units_with_progress.count > 0
  end

  # @param user [User]
  # @return [Boolean] Whether the user has progress on another version of this course.
  def has_older_version_progress?(user)
    return nil unless user && family_name && version_year
    user_script_ids = user.user_scripts.pluck(:script_id)

    UnitGroup.
      joins(:default_unit_group_units).
      # select only courses in the same course family.
      where("properties -> '$.family_name' = ?", family_name).
      # select only older versions
      where("properties -> '$.version_year' < ?", version_year).
      # exclude the current course.
      where.not(id: id).
      # select only courses with scripts which the user has progress in.
      where('course_scripts.script_id' => user_script_ids).
      count > 0
  end

  # returns whether a script in this course has version_warning_dismissed.
  def has_dismissed_version_warning?(user)
    return nil unless user
    script_ids = default_scripts.pluck(:id)
    user.
      user_scripts.
      where(script_id: script_ids).
      select(&:version_warning_dismissed).
      any?
  end

  @@course_cache = nil
  COURSE_CACHE_KEY = 'course-cache'.freeze

  def self.clear_cache
    raise "only call this in a test!" unless Rails.env.test?
    @@course_cache = nil
    Rails.cache.delete COURSE_CACHE_KEY
  end

  def self.should_cache?
    Script.should_cache?
  end

  # generates our course_cache from what is in the Rails cache
  def self.course_cache_from_cache
    # make sure possible loaded objects are completely loaded
    [UnitGroupUnit, Plc::Course].each(&:new)
    Rails.cache.read COURSE_CACHE_KEY
  end

  def self.course_cache_from_db
    {}.tap do |cache|
      UnitGroup.with_associated_models.find_each do |unit_group|
        cache[unit_group.name] = unit_group
        cache[unit_group.id.to_s] = unit_group
      end
    end
  end

  def self.course_cache_to_cache
    Rails.cache.write(COURSE_CACHE_KEY, course_cache_from_db)
  end

  def self.course_cache
    return nil unless should_cache?
    @@course_cache ||=
      course_cache_from_cache || course_cache_from_db
  end

  def self.get_without_cache(id_or_name)
    # a bit of trickery so we support both ids which are numbers and
    # names which are strings that may contain numbers (eg. 2-3)
    find_by = (id_or_name.to_i.to_s == id_or_name.to_s) ? :id : :name
    # unlike script cache, we don't throw on miss
    UnitGroup.find_by(find_by => id_or_name)
  end

  def self.get_from_cache(id_or_name)
    return get_without_cache(id_or_name) unless should_cache?

    course_cache.fetch(id_or_name.to_s) do
      # Populate cache on miss.
      course_cache[id_or_name.to_s] = get_without_cache(id_or_name)
    end
  end

  # Returns an array of version year strings, starting with 2017 and ending 1 year
  # from the current year.
  def self.get_version_year_options
    (2017..(DateTime.now.year + 1)).to_a.map(&:to_s)
  end

  def pilot?
    !!pilot_experiment
  end

  def has_pilot_experiment?(user)
    return false unless pilot_experiment
    SingleUserExperiment.enabled?(user: user, experiment_name: pilot_experiment)
  end

  def has_pilot_access?(user = nil)
    return false unless pilot? && user
    return true if user.permission?(UserPermission::LEVELBUILDER)
    return true if has_pilot_experiment?(user)

    # A user without the experiment has pilot script access if one of their
    # teachers has the pilot experiment enabled, AND they are either currently
    # assigned to or have progress in the course.
    #
    # This logic is subtly different from the logic we use for pilot script
    # access: because we do not record when a user is assigned to a course, we
    # will fail to detect if a user was previously assigned to a pilot course in
    # which they made no progress.

    is_assigned = user.sections_as_student.any? {|s| s.unit_group == self}
    has_progress = !!UserScript.find_by(user: user, script: default_scripts)
    has_pilot_teacher = user.teachers.any? {|t| has_pilot_experiment?(t)}
    (is_assigned || has_progress) && has_pilot_teacher
  end

  # returns true if the user is a levelbuilder, or a teacher with any pilot
  # script experiments enabled.
  def self.has_any_pilot_access?(user = nil)
    return false unless user&.teacher?
    return true if user.permission?(UserPermission::LEVELBUILDER)
    all_courses.any? {|unit_group| unit_group.has_pilot_experiment?(user)}
  end

  # rubocop:disable Naming/PredicateName
  def is_course?
    return !!family_name && !!version_year
  end
  # rubocop:enable Naming/PredicateName

  def has_migrated_script?
    !!default_scripts[0]&.is_migrated?
  end
end
