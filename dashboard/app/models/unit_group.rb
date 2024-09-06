# == Schema Information
#
# Table name: unit_groups
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  properties           :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  published_state      :string(255)      default("in_development"), not null
#  instruction_type     :string(255)      default("teacher_led"), not null
#  instructor_audience  :string(255)      default("teacher"), not null
#  participant_audience :string(255)      default("student"), not null
#
# Indexes
#
#  index_unit_groups_on_instruction_type      (instruction_type)
#  index_unit_groups_on_instructor_audience   (instructor_audience)
#  index_unit_groups_on_name                  (name)
#  index_unit_groups_on_participant_audience  (participant_audience)
#  index_unit_groups_on_published_state       (published_state)
#

require 'cdo/shared_constants/curriculum/shared_course_constants'

class UnitGroup < ApplicationRecord
  include Curriculum::SharedCourseConstants
  include Curriculum::CourseTypes
  include Curriculum::AssignableCourse
  include Rails.application.routes.url_helpers

  # Some Courses will have an associated Plc::Course, most will not
  has_one :plc_course, class_name: 'Plc::Course', foreign_key: 'course_id'
  has_many :default_unit_group_units, -> {where(experiment_name: nil).order(:position)}, class_name: 'UnitGroupUnit', dependent: :destroy, foreign_key: 'course_id'
  has_many :default_units, through: :default_unit_group_units, source: :script
  has_many :alternate_unit_group_units, -> {where.not(experiment_name: nil)}, class_name: 'UnitGroupUnit', dependent: :destroy, foreign_key: 'course_id'
  has_and_belongs_to_many :resources, join_table: :unit_groups_resources
  has_many :unit_groups_student_resources, dependent: :destroy
  has_many :student_resources, through: :unit_groups_student_resources, source: :resource
  has_one :course_version, as: :content_root, dependent: :destroy

  scope(
    :with_associated_models, lambda do
      includes(
        [
          :plc_course,
          :default_unit_group_units,
          :alternate_unit_group_units,
          {
            course_version: {
              course_offering: :course_versions
            }
          }
        ]
      )
    end
  )

  def cached
    return self unless UnitGroup.should_cache?
    self.class.get_from_cache(id)
  end

  validates_presence_of :link
  validates :published_state, acceptance: {accept: Curriculum::SharedCourseConstants::PUBLISHED_STATE.to_h.values, message: 'must be in_development, pilot, beta, preview or stable'}

  def skip_name_format_validation
    !!plc_course
  end

  include SerializedToFileValidation
  include SerializedProperties

  serialized_attrs %w(
    has_verified_resources
    has_numbered_units
    family_name
    version_year
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

  # Any course with a plc_course is considered stable.
  # All other courses must specify a published_state.
  def stable?
    plc_course || (published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
  end

  def in_development?
    published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
  end

  def self.file_path(name, root_path = Rails.root)
    root_path.join("config/courses/#{name}.course")
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
    unit_group.update_scripts(hash['script_names'], hash['alternate_units'])
    unit_group.properties = hash['properties']
    unit_group.published_state = hash['published_state'] || Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
    unit_group.instruction_type = hash['instruction_type'] || Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
    unit_group.instructor_audience = hash['instructor_audience'] || Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
    unit_group.participant_audience = hash['participant_audience'] || Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student

    # add_course_offering creates the course version
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version

    if course_version
      unit_group.resources = (hash['resources'] || []).map {|resource_data| create_resource_from_hash(resource_data, course_version.id)}
      unit_group.student_resources = (hash['student_resources'] || []).map {|resource_data| create_resource_from_hash(resource_data, course_version.id)}
    end

    unit_group.save!
    unit_group
  rescue Exception => exception
    # print filename for better debugging
    new_e = Exception.new("in course: #{hash['name']}: #{exception.message}")
    new_e.set_backtrace(exception.backtrace)
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
        alternate_units: summarize_alternate_units,
        published_state: published_state,
        instruction_type: instruction_type,
        participant_audience: participant_audience,
        instructor_audience: instructor_audience,
        properties: properties.sort.to_h,
        resources: resources.sort_by(&:key).map {|r| Services::ScriptSeed::ResourceSerializer.new(r, scope: {}).as_json},
        student_resources: student_resources.sort_by(&:key).map {|r| Services::ScriptSeed::ResourceSerializer.new(r, scope: {}).as_json}
      }.compact
    ) + "\n"
  end

  def summarize_alternate_units
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
  # the set of units that are in the course, then writes out our serialization
  # @param units [Array<String>] - Updated list of names of units in this course
  # @param alternate_units [Array<Hash>] Updated list of alternate units in this course
  # @param course_strings[Hash{String => String}]
  def persist_strings_and_units_changes(units, alternate_units, course_strings)
    UnitGroup.update_strings(name, course_strings)
    update_scripts(units, alternate_units) if units
    save!
  end

  def write_serialization
    # Only save non-plc course, and only in LB mode
    return unless Rails.application.config.levelbuilder_mode && !plc_course
    File.write(UnitGroup.file_path(name), serialize)
  end

  # @param new_units [Array<String>]
  # @param alternate_units [Array<Hash>] An array of hashes containing fields
  #   'alternate_script', 'default_script' and 'experiment_name'. Optional.
  def update_scripts(new_units, alternate_units = nil)
    alternate_units ||= []
    new_units = new_units.reject(&:empty?)
    new_units_objects = new_units.map {|s| Unit.find_by_name!(s)}
    # we want to delete existing unit group units that aren't in our new list
    units_to_remove = default_unit_group_units.map(&:script) - new_units_objects
    units_to_remove -= alternate_units.map {|hash| Unit.find_by_name!(hash['alternate_script'])}

    unremovable_unit_names = units_to_remove.select(&:prevent_course_version_change?).map(&:name)
    raise "Cannot remove units that have resources or vocabulary: #{unremovable_unit_names}" if unremovable_unit_names.any?

    unaddable_unit_names = new_units_objects.select do |s|
      s.unit_group != self && s.prevent_course_version_change?
    end.map(&:name)
    raise "Cannot add units that have resources or vocabulary: #{unaddable_unit_names}" if unaddable_unit_names.any?

    new_units_objects.each_with_index do |unit, index|
      unit_group_unit = UnitGroupUnit.find_or_create_by!(unit_group: self, script: unit) do |ugu|
        ugu.position = index + 1
        unit.update!(published_state: nil, instruction_type: nil, participant_audience: nil, instructor_audience: nil, is_course: false, pilot_experiment: nil)
        unit.course_version&.destroy

        unit.reload
        unit.write_script_json
      end
      unit_group_unit.update!(position: index + 1)
    end

    alternate_units.each do |hash|
      alternate_unit = Unit.find_by_name!(hash['alternate_script'])
      default_unit = Unit.find_by_name!(hash['default_script'])
      # alternate units should have the same position as the unit they replace.
      position = default_unit_group_units.find_by(script: default_unit).position
      unit_group_unit = UnitGroupUnit.find_or_create_by!(unit_group: self, script: alternate_unit) do |ugu|
        ugu.position = position
        ugu.experiment_name = hash['experiment_name']
        ugu.default_script = default_unit
      end
      unit_group_unit.update!(
        position: position,
        experiment_name: hash['experiment_name'],
        default_script: default_unit
      )
    end

    units_to_remove.each do |unit|
      # Units that are not in a unit group need to have these fields set in order to determine course type and visibility of course
      unit.update!(
        published_state: (unit.published_state ? unit.published_state : published_state),
        instruction_type: instruction_type,
        participant_audience: participant_audience,
        instructor_audience: instructor_audience
      )

      UnitGroupUnit.where(unit_group: self, script: unit).destroy_all
    end
    # Reload model so that default_unit_group_units is up to date
    transaction {reload}
  end

  def self.all_courses
    return all.to_a unless should_cache?
    @@all_courses ||= course_cache.values.uniq.compact.freeze
  end

  def self.family_names
    CourseVersion.course_offering_keys('UnitGroup')
  end

  # @param user [User]
  # @returns [Boolean] Whether the user has any experiment enabled which is
  #   associated with an alternate unit group unit.
  def self.has_any_course_experiments?(user)
    Experiment.any_enabled?(user: user, experiment_names: UnitGroupUnit.experiments)
  end

  # A course that the general public can assign. Has been soft or
  # hard launched.
  def launched?
    [Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable].include?(published_state)
  end

  def summarize(user = nil, for_edit: false, locale_code: nil)
    ActiveRecord::Base.connected_to(role: :reading) do
      {
        name: name,
        id: id,
        title: localized_title,
        assignment_family_title: localized_assignment_family_title,
        family_name: family_name,
        version_year: version_year,
        published_state: published_state,
        instruction_type: instruction_type,
        instructor_audience: instructor_audience,
        participant_audience: participant_audience,
        pilot_experiment: pilot_experiment,
        description_short: I18n.t("data.course.name.#{name}.description_short", default: ''),
        description_student: Services::MarkdownPreprocessor.process(I18n.t("data.course.name.#{name}.description_student", default: '')),
        description_teacher: Services::MarkdownPreprocessor.process(I18n.t("data.course.name.#{name}.description_teacher", default: '')),
        version_title: I18n.t("data.course.name.#{name}.version_title", default: ''),
        scripts: units_for_user(user).map do |unit|
          include_lessons = false
          unit.summarize(include_lessons, user).merge!(unit.summarize_i18n_for_display)
        end,
        teacher_resources: resources.sort_by(&:name).map(&:summarize_for_resources_dropdown),
        student_resources: student_resources.sort_by(&:name).map(&:summarize_for_resources_dropdown),
        is_migrated: has_migrated_unit?,
        has_verified_resources: has_verified_resources?,
        has_numbered_units: has_numbered_units?,
        course_versions: summarize_course_versions(user, locale_code),
        show_assign_button: course_assignable?(user),
        announcements: announcements,
        course_offering_id: course_version&.course_offering&.id,
        course_version_id: course_version&.id,
        course_path: link,
        course_offering_edit_path: for_edit && course_version ? edit_course_offering_path(course_version.course_offering.key) : nil
      }
    end
  end

  def summarize_for_rollup(user = nil)
    {
      title: localized_title,
      link: link,
      version_title: I18n.t("data.course.name.#{name}.version_title", default: ''),
      units: units_for_user(user).map do |unit|
        unit.summarize_for_rollup(user)
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

  def included_in_units?(unit_ids)
    default_units.any? {|unit| unit_ids.include? unit.id}
  end

  # Returns summary object of all the course versions that an instructor can
  # assign or all the launched versions a participant can view. 'course_assignable'
  # will always return false for participants so they will fall into the second check for
  # launched and can_view_version?. For instructors if course_assignable? is false then
  # launched will also be false.
  def summarize_course_versions(user = nil, locale_code = 'en-us')
    return {} unless user

    all_course_versions = course_version&.course_offering&.course_versions
    course_versions_for_user = all_course_versions&.select {|cv| cv.course_assignable?(user) || (cv.launched? && cv.can_view_version?(user))}
    course_versions_for_user&.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)}.to_h
  end

  # If a user has no experiments enabled, return the default set of units.
  # If a user has an experiment enabled corresponding to an alternate unit in
  # this course, use the alternate unit in place of the default unit with
  # the same position.
  # If the unit is in development, hide it from everyone but levelbuilders.
  # @param user [User]
  def units_for_user(user)
    # @return [Array<Unit>]
    units = default_unit_group_units.map do |ugu|
      Unit.get_from_cache(select_unit_group_unit(user, ugu).script_id)
    end
    units.compact.reject do |unit|
      unit.in_development? && !user&.permission?(UserPermission::LEVELBUILDER)
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

    alternates = alternate_unit_group_units.to_a.select {|unit| unit.default_script_id == unit_group_unit.script_id}
    return unit_group_unit if alternates.empty?

    if user.teacher?
      alternates.each do |ugu|
        return ugu if SingleUserExperiment.enabled?(user: user, experiment_name: ugu.experiment_name)
      end
    end

    course_sections = user.sections_as_student.where(unit_group: self).to_a
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
        # include hidden units when iterating over user units.
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
    return nil unless user&.student?
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
  #
  # locale_code is added so that it matches the signature of `unit.can_view_version?`.
  # This is necessary because course_version.content_root is either a unit or a unit_group
  # and script.summarize_for_unit_edit calls `can_view_version?` on the content_root with two arguments.
  def can_view_version?(user = nil, locale_code = 'en-us')
    return false unless Ability.new(user).can?(:read, self)

    latest_course_version = UnitGroup.latest_stable_version(family_name, locale: locale_code)
    is_latest = latest_course_version == self

    # All users can see the latest course version.
    return true if is_latest

    # Restrictions only apply to participants and logged out users.
    return false if user.nil?
    return true if can_be_instructor?(user)

    # A student can view the course version if they are assigned to it or they have progress in it.
    user.section_courses.include?(self) || has_progress?(user)
  end

  # @param family_name [String] The family name for a course family.
  # @param locale [String] User or request locale. Optional.
  # @return [UnitGroup] Returns the latest stable version in a course family.
  def self.latest_stable_version(family_name, locale: 'en-us')
    return nil if family_name.blank?

    stable_course_versions = all_courses.select do |course|
      course.family_name == family_name &&
        course.published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    end.sort_by(&:version_year).reverse

    # Only select stable, supported UnitGroups (ignore supported locales if locale is an English-speaking locale).
    locale_str = locale&.to_s
    if locale_str&.start_with?('en')
      stable_course_versions.first
    else
      stable_course_versions.find do |cv|
        cv.default_unit_group_units.all? {|unit_group_unit| unit_group_unit.script.supported_locales&.include?(locale_str)}
      end
    end
  end

  def supported_locale_codes
    locales = default_unit_group_units.first&.script&.supported_locales || []
    locales = locales.filter do |locale|
      default_unit_group_units.all? do |unit_group_unit|
        unit_group_unit.script.supported_locales&.include?(locale)
      end
    end
    locales += ['en-US']
    locales.sort.uniq
  end

  def supported_locale_names
    supported_locale_codes.map {|l| Unit.locale_native_name_map[l] || l}.uniq
  end

  def self.locale_native_name_map
    locales = Dashboard::Application::LOCALES.select {|_, data| data.is_a?(Hash)}
    locales.reduce({}) {|acc, (locale_code, data)| acc.merge({locale_code => data[:native]})}
  end

  # @param family_name [String] The family name for a course family.
  # @param user [User]
  # @return [UnitGroup] Returns the latest version in a course family that the user is assigned to.
  def self.latest_assigned_version(family_name, user)
    return nil unless family_name && user
    assigned_course_ids = user.section_courses.pluck(:id)

    all_courses.select do |course|
      assigned_course_ids.include?(course.id) &&
        course.family_name == family_name
    end.max_by(&:version_year)
  end

  # @param user [User]
  # @return [Boolean] Whether the user has progress in this course.
  def has_progress?(user)
    return nil unless user
    user_unit_ids = user.user_scripts.pluck(:script_id)
    default_unit_group_units.any? {|ugu| user_unit_ids.include?(ugu.script_id)}
  end

  # @param user [User]
  # @return [Boolean] Whether the user has progress on another version of this course.
  def has_older_version_progress?(user)
    return nil unless user && family_name && version_year
    user_unit_ids = user.user_scripts.pluck(:script_id)

    UnitGroup.all_courses.any? do |course|
      course.family_name == family_name &&
        course.version_year < version_year &&
        course.id != id &&
        course.default_unit_group_units.any? {|ugu| user_unit_ids.include?(ugu.script_id)}
    end
  end

  # returns whether a unit in this course has version_warning_dismissed.
  def has_dismissed_version_warning?(user)
    return nil unless user
    unit_ids = default_units.pluck(:id)
    user.
      user_scripts.
      where(script_id: unit_ids).
      any?(&:version_warning_dismissed)
  end

  @@course_cache = nil
  COURSE_CACHE_KEY = 'course-cache'.freeze

  def self.clear_cache
    raise "only call this in a test!" unless Rails.env.test?
    @@course_cache = nil
    @@all_courses = nil
    Rails.cache.delete COURSE_CACHE_KEY
  end

  def self.should_cache?
    Unit.should_cache?
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
    Rails.cache.write(COURSE_CACHE_KEY, (@@course_cache = course_cache_from_db))
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
    [CourseVersion::UNVERSIONED] + (2017..(DateTime.now.year + 1)).to_a.map(&:to_s)
  end

  def pilot?
    !!pilot_experiment
  end

  # Wrapper function to help with assignable course logic
  # @return [CourseVersion]
  def get_course_version
    course_version
  end

  def has_pilot_experiment?(user)
    return false unless pilot_experiment
    SingleUserExperiment.enabled?(user: user, experiment_name: pilot_experiment)
  end

  def has_pilot_access?(user = nil)
    return false unless pilot? && user
    return true if user.permission?(UserPermission::LEVELBUILDER)
    return true if has_pilot_experiment?(user)

    # A user without the experiment has pilot unit access if one of their
    # teachers has the pilot experiment enabled, AND they are either currently
    # assigned to or have progress in the course.
    #
    # This logic is subtly different from the logic we use for pilot unit
    # access: because we do not record when a user is assigned to a course, we
    # will fail to detect if a user was previously assigned to a pilot course in
    # which they made no progress.

    is_assigned = user.sections_as_student.any? {|s| s.unit_group == self}
    has_progress = !!UserScript.find_by(user: user, script: default_units)
    has_pilot_teacher = user.teachers.any? {|t| has_pilot_experiment?(t)}
    (is_assigned || has_progress) && has_pilot_teacher
  end

  # returns true if the user is a levelbuilder, or a teacher with any pilot
  # unit experiments enabled.
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

  def has_migrated_unit?
    !!default_units[0]&.is_migrated?
  end

  def prevent_course_version_change?
    # rubocop:disable Style/SymbolProc
    # For reasons I (Bethany) still don't understand, using a proc here causes
    # the method to terminate unexpectedly without an error. My unproven guess
    # is that this is due to the nested `any?` calls
    resources.any? ||
      student_resources.any? ||
      default_units.any? {|s| s.prevent_course_version_change?}
    # rubocop:enable Style/SymbolProc
  end

  def duration_in_minutes
    default_units.sum(&:duration_in_minutes)
  end
end
